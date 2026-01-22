'use client';

import React, { useState } from 'react';
import styles from './InterviewCard.module.css';
import { RetroButton } from '@/components/ui/RetroButton';

export interface InterviewQuestion {
    id: string;
    index: number;
    question: string;
    referenceAnswer: string;
    keyPoints?: string[];
    userAnswer?: string;
    feedback?: {
        content: string;
        rating: 'good' | 'average' | 'poor';
    };
    type?: string;
    difficulty?: string;
    jdRelevance?: string;
    commonMistakes?: string[];
}

interface InterviewCardProps {
    question: InterviewQuestion;
    onSubmitAnswer: (id: string, answer: string) => void;
}

export function InterviewCard({ question, onSubmitAnswer }: InterviewCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [answer, setAnswer] = useState(question.userAnswer || '');
    const [showReference, setShowReference] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setIsSubmitting(true);
        await onSubmitAnswer(question.id, answer);
        setIsSubmitting(false);
    };

    const cardClass = [
        styles['interview-card'],
        isOpen && styles['interview-card--open'],
    ]
        .filter(Boolean)
        .join(' ');

    const getRatingClass = (rating: string) => {
        return styles[`interview-card__feedback-rating--${rating}`];
    };

    return (
        <div className={cardClass}>
            {/* Header */}
            <div
                className={styles['interview-card__header']}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles['interview-card__question']}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className={styles['interview-card__index']}>Q{question.index}</span>
                        {question.type && (
                            <span style={{ fontSize: '0.75rem', background: '#eee', padding: '2px 6px', borderRadius: 4 }}>
                                {question.type}
                            </span>
                        )}
                        {question.difficulty && (
                            <span style={{ fontSize: '0.75rem', background: question.difficulty === 'High' ? '#ffebee' : '#e8f5e9', padding: '2px 6px', borderRadius: 4, color: question.difficulty === 'High' ? 'red' : 'green' }}>
                                {question.difficulty}
                            </span>
                        )}
                    </div>
                    <span className={styles['interview-card__text']}>{question.question}</span>
                </div>
                <span className={styles['interview-card__toggle']}>{isOpen ? '[-]' : '[+]'}</span>
            </div>

            {/* Body */}
            <div className={styles['interview-card__body']}>
                {/* Answer Input */}
                <div className={styles['interview-card__answer-section']}>
                    <div className={styles['interview-card__label']}>你的回答</div>
                    <textarea
                        className={styles['interview-card__textarea']}
                        placeholder="在此输入你的回答..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={!!question.feedback}
                    />
                    {!question.feedback && (
                        <div className={styles['interview-card__submit']}>
                            <RetroButton
                                variant="primary"
                                size="small"
                                onClick={handleSubmit}
                                disabled={!answer.trim() || isSubmitting}
                            >
                                {isSubmitting ? '正在分析...' : '提交点评'}
                            </RetroButton>
                        </div>
                    )}
                </div>

                {/* AI Reference */}
                <div className={styles['interview-card__reference']}>
                    <button
                        className={styles['interview-card__reference-toggle']}
                        onClick={() => setShowReference(!showReference)}
                    >
                        [?] {showReference ? '隐藏参考答案' : '查看参考答案'}
                    </button>
                    {showReference && (
                        <div className={styles['interview-card__reference-content']}>
                            <div>{question.referenceAnswer}</div>
                            {question.commonMistakes && question.commonMistakes.length > 0 && (
                                <div style={{ marginTop: 12, fontSize: '0.85rem', color: '#666' }}>
                                    <strong>🚫 常见误区：</strong>
                                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                        {question.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
                                    </ul>
                                </div>
                            )}
                            {question.jdRelevance && (
                                <div style={{ marginTop: 8, fontSize: '0.8rem', opacity: 0.8 }}>
                                    🔗 岗位关联: {question.jdRelevance}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* AI Feedback */}
                {question.feedback && (
                    <div className={styles['interview-card__feedback']}>
                        <span className={styles['interview-card__feedback-label']}>[AI] 点评</span>
                        {question.feedback.content}
                        <span
                            className={`${styles['interview-card__feedback-rating']} ${getRatingClass(question.feedback.rating)}`}
                        >
                            {question.feedback.rating === 'good' && 'CRITICAL HIT'}
                            {question.feedback.rating === 'average' && 'HIT'}
                            {question.feedback.rating === 'poor' && 'MISS'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default InterviewCard;
