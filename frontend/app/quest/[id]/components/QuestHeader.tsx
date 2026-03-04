import React from 'react';
import styles from '../page.module.css';
import { RetroButton } from '@/components/ui/RetroButton';
import { IconExport, IconSave } from '@/components/icons';

interface QuestHeaderProps {
    company: string;
    role: string;
    salary: string;
    questId: string;
    onSave: () => void | Promise<void>;
    onExport: () => void;
}

export function QuestHeader({ company, role, salary, questId, onSave, onExport }: QuestHeaderProps) {
    return (
        <div className={styles['quest-header']}>
            <div className={styles['quest-header__info']}>
                <span className={styles['quest-header__company']}>
                    {company} · {role}
                </span>
                <span className={styles['quest-header__role']}>
                    {salary} · 任务ID: {questId}
                </span>
            </div>
            <div className={styles['quest-header__actions']}>
                <RetroButton variant="ghost" size="small" onClick={onSave}>
                    <IconSave size={14} />
                    保存
                </RetroButton>
                <RetroButton variant="ghost" size="small" onClick={onExport}>
                    <IconExport size={14} />
                    导出
                </RetroButton>
            </div>
        </div>
    );
}
