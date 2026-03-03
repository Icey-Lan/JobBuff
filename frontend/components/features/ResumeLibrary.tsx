'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './ResumeLibrary.module.css';
import { IconFile, IconUpload, IconTrash, IconChevronDown } from '@/components/icons';
import { getUserResumes, deleteResume, ResumeData } from '@/lib/supabase/resumes';

// Supported file formats
const SUPPORTED_FORMATS = ['.pdf', '.docx', '.doc', '.md', '.txt'];
const SUPPORTED_FORMATS_DISPLAY = 'PDF、Word (.doc/.docx)、Markdown (.md)、TXT';
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ResumeLibraryProps {
    userId: string;
    onSelect: (resume: ResumeData | null) => void;
    onNewUpload: (file: File) => void;
    selectedResumeId?: string | null;
}

export function ResumeLibrary({ userId, onSelect, onNewUpload, selectedResumeId }: ResumeLibraryProps) {
    const [resumes, setResumes] = useState<ResumeData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load resumes on mount
    useEffect(() => {
        const loadResumes = async () => {
            setIsLoading(true);
            const { data, error } = await getUserResumes(userId);
            if (!error && data) {
                setResumes(data);
                // Auto-select the most recently used resume if none selected
                if (data.length > 0 && !selectedResumeId) {
                    onSelect(data[0]);
                }
            }
            setIsLoading(false);
        };
        loadResumes();
    }, [userId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setDeleteConfirm(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedResume = resumes.find(r => r.id === selectedResumeId);

    const handleSelect = (resume: ResumeData) => {
        onSelect(resume);
        setIsOpen(false);
        setDeleteConfirm(null);
    };

    const handleDelete = async (e: React.MouseEvent, resumeId: string) => {
        e.stopPropagation();

        if (deleteConfirm === resumeId) {
            // Confirmed - delete
            const { error } = await deleteResume(resumeId);
            if (!error) {
                const newResumes = resumes.filter(r => r.id !== resumeId);
                setResumes(newResumes);
                // If deleted the selected one, select another or null
                if (selectedResumeId === resumeId) {
                    onSelect(newResumes.length > 0 ? newResumes[0] : null);
                }
            }
            setDeleteConfirm(null);
        } else {
            // First click - show confirm
            setDeleteConfirm(resumeId);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const fileName = file.name.toLowerCase();
            const ext = '.' + (fileName.split('.').pop() || '');

            // Validate file format
            if (!SUPPORTED_FORMATS.includes(ext)) {
                alert(`❌ 不支持的文件格式「${ext}」\n\n支持的格式：${SUPPORTED_FORMATS_DISPLAY}\n\n提示：如果你的文件是 .doc 格式，建议先用 Word 另存为 .docx 格式后再上传。`);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE_BYTES) {
                alert(`❌ 文件大小超出限制\n\n当前文件：${(file.size / 1024 / 1024).toFixed(1)}MB\n上限：${MAX_FILE_SIZE_MB}MB`);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            onNewUpload(file);
            setIsOpen(false);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '从未使用';
        const date = new Date(dateStr);
        const diff = Date.now() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return '今天';
        if (days === 1) return '昨天';
        if (days < 7) return `${days} 天前`;
        return date.toLocaleDateString('zh-CN');
    };

    const getFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'pdf': return '📄';
            case 'docx': return '📝';
            case 'md': return '📋';
            default: return '📄';
        }
    };

    if (isLoading) {
        return (
            <div className={styles.library}>
                <div className={styles.loading}>加载简历库...</div>
            </div>
        );
    }

    return (
        <div className={styles.library} ref={dropdownRef}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.md,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            {/* Dropdown Trigger */}
            <button
                type="button"
                className={`${styles.trigger} ${isOpen ? styles['trigger--open'] : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={styles.trigger__icon}>
                    <IconFile size={18} />
                </span>
                <span className={styles.trigger__text}>
                    {selectedResume ? (
                        <>
                            {getFileIcon(selectedResume.fileType)} {selectedResume.fileName}
                        </>
                    ) : (
                        '选择或上传简历'
                    )}
                </span>
                <span className={`${styles.trigger__arrow} ${isOpen ? styles['trigger__arrow--open'] : ''}`}>
                    <IconChevronDown size={16} />
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className={styles.dropdown}>
                    {resumes.length > 0 ? (
                        <div className={styles.dropdown__list}>
                            {resumes.map(resume => (
                                <div
                                    key={resume.id}
                                    className={`${styles.dropdown__item} ${resume.id === selectedResumeId ? styles['dropdown__item--selected'] : ''}`}
                                    onClick={() => handleSelect(resume)}
                                >
                                    <span className={styles.item__icon}>
                                        {getFileIcon(resume.fileType)}
                                    </span>
                                    <div className={styles.item__info}>
                                        <span className={styles.item__name}>{resume.fileName}</span>
                                        <span className={styles.item__date}>
                                            {formatDate(resume.lastUsedAt)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className={`${styles.item__delete} ${deleteConfirm === resume.id ? styles['item__delete--confirm'] : ''}`}
                                        onClick={(e) => handleDelete(e, resume.id)}
                                        title={deleteConfirm === resume.id ? '确认删除' : '删除'}
                                    >
                                        <IconTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.dropdown__empty}>
                            暂无简历，请上传
                        </div>
                    )}

                    {/* Divider */}
                    <div className={styles.dropdown__divider} />

                    {/* Upload New Button */}
                    <button
                        type="button"
                        className={styles.dropdown__upload}
                        onClick={triggerUpload}
                    >
                        <IconUpload size={16} />
                        <span>上传新简历</span>
                    </button>

                    {/* Format Hint */}
                    <div className={styles.dropdown__hint}>
                        📎 支持 {SUPPORTED_FORMATS_DISPLAY}，上限 {MAX_FILE_SIZE_MB}MB
                    </div>
                </div>
            )}
        </div>
    );
}

// Add resumes to the library (called from parent after upload)
export function addResumeToLibrary(
    setResumes: React.Dispatch<React.SetStateAction<ResumeData[]>>,
    newResume: ResumeData
) {
    setResumes(prev => [newResume, ...prev]);
}
