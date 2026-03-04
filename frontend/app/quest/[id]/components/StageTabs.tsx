import React from 'react';
import styles from '../page.module.css';
import { IconHammer, IconRadar, IconSword } from '@/components/icons';
import type { Stage } from '../types';

interface StageTabsProps {
    currentStage: Stage;
    completedStages: Stage[];
    disabled?: boolean;
    onSelectStage: (stage: Stage) => void;
}

export function StageTabs({ currentStage, completedStages, disabled = false, onSelectStage }: StageTabsProps) {
    return (
        <div className={styles['stage-tabs']} role="tablist" aria-label="任务阶段">
            <button
                id="stage-tab-intel"
                className={`${styles['stage-tab']} ${currentStage === 'intel' ? styles['stage-tab--active'] : ''} ${completedStages.includes('intel') ? styles['stage-tab--completed'] : ''}`}
                onClick={() => onSelectStage('intel')}
                disabled={disabled}
                role="tab"
                aria-selected={currentStage === 'intel'}
                aria-controls="stage-panel-intel"
                tabIndex={currentStage === 'intel' ? 0 : -1}
            >
                <span className={styles['stage-tab__icon']}>
                    <IconRadar size={18} />
                </span>
                情报侦察
            </button>
            <button
                id="stage-tab-forge"
                className={`${styles['stage-tab']} ${currentStage === 'forge' ? styles['stage-tab--active'] : ''} ${completedStages.includes('forge') ? styles['stage-tab--completed'] : ''}`}
                onClick={() => completedStages.includes('intel') && onSelectStage('forge')}
                disabled={disabled || !completedStages.includes('intel')}
                role="tab"
                aria-selected={currentStage === 'forge'}
                aria-controls="stage-panel-forge"
                tabIndex={currentStage === 'forge' ? 0 : -1}
            >
                <span className={styles['stage-tab__icon']}>
                    <IconHammer size={18} />
                </span>
                装备锻造
            </button>
            <button
                id="stage-tab-trial"
                className={`${styles['stage-tab']} ${currentStage === 'trial' ? styles['stage-tab--active'] : ''} ${completedStages.includes('trial') ? styles['stage-tab--completed'] : ''}`}
                onClick={() => completedStages.includes('forge') && onSelectStage('trial')}
                disabled={disabled || !completedStages.includes('forge')}
                role="tab"
                aria-selected={currentStage === 'trial'}
                aria-controls="stage-panel-trial"
                tabIndex={currentStage === 'trial' ? 0 : -1}
            >
                <span className={styles['stage-tab__icon']}>
                    <IconSword size={18} />
                </span>
                试炼挑战
            </button>
        </div>
    );
}
