import React from 'react';
import styles from '../page.module.css';
import { RetroButton } from '@/components/ui/RetroButton';
import { IconCheck, IconHammer, IconSword, IconX } from '@/components/icons';
import type { Stage } from '../types';

interface StageActionsProps {
    currentStage: Stage;
    disabled?: boolean;
    onAbort: () => void;
    onNext: () => void;
}

export function StageActions({ currentStage, disabled = false, onAbort, onNext }: StageActionsProps) {
    return (
        <div className={styles['stage-actions']}>
            <div className={styles['stage-actions__secondary']}>
                <RetroButton variant="danger" size="small" onClick={onAbort}>
                    <IconX size={14} />
                    放弃任务
                </RetroButton>
            </div>
            <RetroButton variant="primary" onClick={onNext} pulse disabled={disabled}>
                {currentStage === 'intel' && (
                    <>
                        <IconHammer size={16} />
                        去锻造装备
                    </>
                )}
                {currentStage === 'forge' && (
                    <>
                        <IconSword size={16} />
                        去试炼挑战
                    </>
                )}
                {currentStage === 'trial' && (
                    <>
                        <IconCheck size={16} />
                        完成任务
                    </>
                )}
            </RetroButton>
        </div>
    );
}
