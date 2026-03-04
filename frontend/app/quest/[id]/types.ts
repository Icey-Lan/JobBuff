import type { IntelResponse } from '@/lib/api-types';
import type { QuestForge, QuestTrial } from './quest-mappers';

export type Stage = 'intel' | 'forge' | 'trial';

export interface QuestPageData {
    id: string;
    inputs: {
        jd_text: string;
        resume_text: string;
        target_position?: string | null;
        target_salary?: string | null;
    };
    intel?: IntelResponse;
    forge?: QuestForge;
    trial?: QuestTrial;
    diffStatus?: Record<string, string>;
}
