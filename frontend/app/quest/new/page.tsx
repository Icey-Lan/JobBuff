'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { RetroButton } from '@/components/ui/RetroButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { IconFile, IconX, IconTarget, IconRadar, IconWarning } from '@/components/icons';
import { useAuth } from '@/components/AuthProvider';
import { ResumeLibrary } from '@/components/features/ResumeLibrary';
import { createResume, updateResumeUsage, ResumeData } from '@/lib/supabase/resumes';
import { useToast } from '@/components/ui/ToastProvider';

export default function NewQuestPage() {
    const router = useRouter();
    const { user, quota, refreshQuota } = useAuth();
    const { showToast } = useToast();

    // Resume State - supports both library selection and new upload
    const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
    const [newResumeFile, setNewResumeFile] = useState<File | null>(null);
    // Other State
    const [jdText, setJdText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [targetSalary, setTargetSalary] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createIdempotencyKey, setCreateIdempotencyKey] = useState<string | null>(null);

    const resetCreateIdempotencyKey = () => {
        setCreateIdempotencyKey(null);
    };

    const buildIdempotencyKey = () => {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    };

    // Quota check
    const hasQuota = quota && quota.remaining > 0;

    // Character count for JD
    const charCount = jdText.length;
    const isValidJD = charCount >= 50 && charCount <= 10000;

    // Resume ready: either selected from library OR new file uploaded
    const hasResume = selectedResume !== null || newResumeFile !== null;

    // Handle resume selection from library
    const handleResumeSelect = (resume: ResumeData | null) => {
        resetCreateIdempotencyKey();
        setSelectedResume(resume);
        setNewResumeFile(null); // Clear new upload if selecting from library
    };

    // Handle new resume upload (from ResumeLibrary component)
    const handleNewUpload = (file: File) => {
        resetCreateIdempotencyKey();
        setNewResumeFile(file);
        setSelectedResume(null); // Clear library selection if uploading new
    };

    // Clear new upload
    const clearNewUpload = () => {
        resetCreateIdempotencyKey();
        setNewResumeFile(null);
    };

    // Form validation (includes quota check)
    const isFormValid = hasResume && isValidJD && targetRole.trim() && targetSalary.trim() && hasQuota;

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsSubmitting(true);

        try {
            const idempotencyKey = createIdempotencyKey ?? buildIdempotencyKey();
            if (!createIdempotencyKey) {
                setCreateIdempotencyKey(idempotencyKey);
            }

            let resumeText = '';
            let usedResumeId: string | null = null;

            if (selectedResume) {
                // Use resume from library
                resumeText = selectedResume.content;
                usedResumeId = selectedResume.id;
            } else if (newResumeFile) {
                // Parse new uploaded file
                const fileName = newResumeFile.name.toLowerCase();
                if (fileName.endsWith('.md') || fileName.endsWith('.txt')) {
                    resumeText = await newResumeFile.text();
                } else if (fileName.endsWith('.pdf') || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
                    // PDF/Word files: use PP-StructureV3 API
                    const arrayBuffer = await newResumeFile.arrayBuffer();
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
                            file_name: newResumeFile.name,
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
                } else {
                    throw new Error(`不支持的文件格式。请上传 PDF、Word (.doc/.docx)、Markdown 或 TXT 格式的简历。`);
                }

                // Save new resume to library
                if (user) {
                    const fileType = newResumeFile.name.split('.').pop() || 'unknown';
                    const { data: newResume } = await createResume({
                        userId: user.id,
                        fileName: newResumeFile.name,
                        fileType: fileType,
                        content: resumeText,
                        fileSize: newResumeFile.size,
                    });
                    if (newResume) {
                        usedResumeId = newResume.id;
                    }
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

            if (!user) {
                throw new Error('用户未登录');
            }

            const createQuestResponse = await fetch('/api/quests/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jd_text: jdText,
                    resume_text: resumeText,
                    target_position: targetRole,
                    target_salary: targetSalary,
                    intel: data,
                    idempotency_key: idempotencyKey,
                }),
            });

            const createQuestResult = await createQuestResponse.json().catch(() => null);
            if (!createQuestResponse.ok || !createQuestResult?.quest?.id) {
                throw new Error(createQuestResult?.error || '保存任务失败');
            }

            // Update resume usage time
            if (usedResumeId) {
                await updateResumeUsage(usedResumeId);
            }

            await refreshQuota();
            setCreateIdempotencyKey(null);

            router.push(`/quest/${createQuestResult.quest.id}`);
        } catch (error) {
            console.error(error);
            const message = error instanceof Error && error.message ? error.message : '侦察任务启动失败，请重试';
            showToast(message, 'error');
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
                {/* Quota Warning */}
                {!hasQuota && (
                    <div className={styles['quota-warning']}>
                        <IconWarning size={20} color="var(--color-trap-red)" />
                        <span>您的免费配额已用尽。</span>
                        <Link href="/profile" className={styles['quota-warning__link']}>
                            查看升级方案 →
                        </Link>
                    </div>
                )}

                <form className={styles['quest-form']} onSubmit={handleSubmit}>

                    {/* Step 1: Resume Selection */}
                    <div className={styles['form-section']}>
                        <label className={styles['form-section__label']}>
                            <span className={styles['form-section__label-step']}>1</span>
                            选择简历装备
                        </label>

                        {/* Resume Library Dropdown */}
                        {user && (
                            <ResumeLibrary
                                userId={user.id}
                                onSelect={handleResumeSelect}
                                onNewUpload={handleNewUpload}
                                selectedResumeId={selectedResume?.id}
                            />
                        )}

                        {/* Show new upload file if selected */}
                        {newResumeFile && (
                            <div className={styles['resume-upload__file']} style={{ marginTop: '12px' }}>
                                <IconFile size={24} color="var(--color-loot-green)" />
                                <span className={styles['resume-upload__file-name']}>
                                    📤 新上传: {newResumeFile.name}
                                </span>
                                <button
                                    type="button"
                                    className={styles['resume-upload__file-remove']}
                                    onClick={clearNewUpload}
                                >
                                    <IconX size={16} color="var(--color-trap-red)" />
                                </button>
                            </div>
                        )}
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
                                    onChange={(e) => {
                                        resetCreateIdempotencyKey();
                                        setJdText(e.target.value);
                                    }}
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
                                    onChange={(e) => {
                                        resetCreateIdempotencyKey();
                                        setTargetRole(e.target.value);
                                    }}
                                />
                            </div>
                            <div className={styles['mission-input']}>
                                <label className={styles['mission-input__label']}>期望薪资</label>
                                <input
                                    type="text"
                                    className={styles['mission-input__field']}
                                    placeholder="例: 25k-35k"
                                    value={targetSalary}
                                    onChange={(e) => {
                                        resetCreateIdempotencyKey();
                                        setTargetSalary(e.target.value);
                                    }}
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
