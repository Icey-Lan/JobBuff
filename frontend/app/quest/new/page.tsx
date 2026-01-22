'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { RetroButton } from '@/components/ui/RetroButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { IconUpload, IconFile, IconX, IconTarget, IconRadar } from '@/components/icons';

export default function NewQuestPage() {
    const router = useRouter();

    // State
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jdText, setJdText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [targetSalary, setTargetSalary] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Character count for JD
    const charCount = jdText.length;
    const isValidJD = charCount >= 50 && charCount <= 10000;

    // File upload handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.type === 'text/markdown') {
                setResumeFile(file);
            }
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setResumeFile(files[0]);
        }
    }, []);

    const removeFile = useCallback(() => {
        setResumeFile(null);
    }, []);

    // Form validation
    const isFormValid = resumeFile && isValidJD && targetRole.trim() && targetSalary.trim();

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);

        try {
            // Read resume content
            let resumeText = '';
            if (resumeFile) {
                if (resumeFile.name.endsWith('.md') || resumeFile.name.endsWith('.txt')) {
                    // Text files: read directly
                    resumeText = await resumeFile.text();
                } else {
                    // PDF/Word files: use PP-StructureV3 API for parsing
                    const arrayBuffer = await resumeFile.arrayBuffer();
                    const base64 = btoa(
                        new Uint8Array(arrayBuffer).reduce(
                            (data, byte) => data + String.fromCharCode(byte),
                            ''
                        )
                    );

                    const parseResponse = await fetch('/api/parse-pdf', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            file_base64: base64,
                            file_name: resumeFile.name,
                        }),
                    });

                    if (!parseResponse.ok) {
                        const errorData = await parseResponse.json();
                        throw new Error(errorData.error || '简历解析失败');
                    }

                    const parseResult = await parseResponse.json();
                    if (!parseResult.success) {
                        throw new Error(parseResult.error || '简历解析失败');
                    }

                    resumeText = parseResult.markdown;
                }
            }

            const payload = {
                jd_text: jdText,
                resume_text: resumeText,
                target_position: targetRole,
                target_salary: targetSalary,
            };

            const response = await fetch('/api/analyze-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            const questId = `quest-${Date.now()}`;

            // Save to localStorage
            const questData = {
                id: questId,
                createdAt: new Date().toISOString(),
                inputs: payload,
                intel: data,
                forge: null,
                trial: null
            };
            localStorage.setItem(`jobbuff_quest_${questId}`, JSON.stringify(questData));

            router.push(`/quest/${questId}`);
        } catch (error) {
            console.error(error);
            alert('侦察任务启动失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles['quest-board']}>
            {/* Header */}
            <div className={styles['quest-board__header']}>
                <h1 className={styles['quest-board__title']}>
                    <IconTarget size={32} color="var(--color-buff-orange)" />
                    接取新任务
                </h1>
                <p className={styles['quest-board__subtitle']}>
                    准备你的装备，输入任务情报，开启侦察行动
                </p>
            </div>

            {/* Main Form */}
            <PixelCard shadow="lg">
                <form className={styles['quest-form']} onSubmit={handleSubmit}>

                    {/* Step 1: Resume Upload */}
                    <div className={styles['form-section']}>
                        <label className={styles['form-section__label']}>
                            <span className={styles['form-section__label-step']}>1</span>
                            选择简历装备
                        </label>

                        <div
                            className={`${styles['resume-upload']} ${isDragging ? styles['resume-upload--active'] : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('resume-input')?.click()}
                        >
                            <input
                                id="resume-input"
                                type="file"
                                accept=".pdf,.docx,.md"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />

                            {resumeFile ? (
                                <div className={styles['resume-upload__file']}>
                                    <IconFile size={24} color="var(--color-loot-green)" />
                                    <span className={styles['resume-upload__file-name']}>{resumeFile.name}</span>
                                    <button
                                        type="button"
                                        className={styles['resume-upload__file-remove']}
                                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                    >
                                        <IconX size={16} color="var(--color-trap-red)" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className={styles['resume-upload__icon']}>
                                        <IconUpload size={48} color="var(--color-pixel-gray-dark)" />
                                    </div>
                                    <div className={styles['resume-upload__text']}>
                                        拖拽简历至此处，或点击上传
                                    </div>
                                    <div className={styles['resume-upload__hint']}>
                                        支持 PDF / Word / Markdown，最大 10MB
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Step 2: JD Input */}
                    <div className={styles['form-section']}>
                        <label className={styles['form-section__label']}>
                            <span className={styles['form-section__label-step']}>2</span>
                            粘贴任务描述 (JD)
                        </label>

                        <div className={styles['jd-terminal']}>
                            <div className={styles['jd-terminal__header']}>
                                <div className={styles['jd-terminal__dots']}>
                                    <span className={`${styles['jd-terminal__dot']} ${styles['jd-terminal__dot--red']}`} />
                                    <span className={`${styles['jd-terminal__dot']} ${styles['jd-terminal__dot--yellow']}`} />
                                    <span className={`${styles['jd-terminal__dot']} ${styles['jd-terminal__dot--green']}`} />
                                </div>
                                <span className={styles['jd-terminal__title']}>jd_input.txt</span>
                            </div>
                            <div className={styles['jd-terminal__body']}>
                                <textarea
                                    className={styles['jd-terminal__textarea']}
                                    placeholder="// 粘贴岗位描述 (JD) 在这里...&#10;// 系统将自动过滤无关内容并提取关键信息&#10;&#10;【职位描述】&#10;..."
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                />
                            </div>
                            <div className={styles['jd-terminal__footer']}>
                                <span>字符数: {charCount}</span>
                                <span className={isValidJD ? styles['jd-terminal__status--valid'] : styles['jd-terminal__status--invalid']}>
                                    {charCount < 50 ? '需要至少 50 字符' : charCount > 10000 ? '超出 10000 字符限制' : 'OK'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Mission Goals */}
                    <div className={styles['form-section']}>
                        <label className={styles['form-section__label']}>
                            <span className={styles['form-section__label-step']}>3</span>
                            设定任务目标
                        </label>

                        <div className={styles['mission-goals']}>
                            <div className={styles['mission-input']}>
                                <label className={styles['mission-input__label']}>目标岗位</label>
                                <input
                                    type="text"
                                    className={styles['mission-input__field']}
                                    placeholder="例: 产品经理"
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                />
                            </div>
                            <div className={styles['mission-input']}>
                                <label className={styles['mission-input__label']}>期望薪资</label>
                                <input
                                    type="text"
                                    className={styles['mission-input__field']}
                                    placeholder="例: 25k-35k"
                                    value={targetSalary}
                                    onChange={(e) => setTargetSalary(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className={styles['quest-submit']}>
                        <RetroButton
                            type="submit"
                            variant="primary"
                            size="large"
                            fullWidth
                            pulse={!!isFormValid}
                            disabled={!isFormValid || isSubmitting}
                        >
                            <IconRadar size={18} />
                            {isSubmitting ? '正在启动侦察...' : '开启侦察任务'}
                        </RetroButton>
                    </div>
                </form>
            </PixelCard>
        </div>
    );
}

