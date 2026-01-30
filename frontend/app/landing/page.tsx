'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { translations, Language } from './translations';
import { RetroButton } from '@/components/ui/RetroButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { GlitchCard } from '@/components/ui/GlitchCard';
import {
    IconRadar,
    IconHammer,
    IconSword,
    IconTarget,
    IconScroll,
    IconLightning,
    IconCheck,
    IconChevronDown,
    IconRocket,
} from '@/components/icons';

// Pain point illustrations (background removed)
const painIllustrations = [
    '/illustrations/pain-confused-nobg.png',
    '/illustrations/pain-stressed-nobg.png',
    '/illustrations/pain-nervous-nobg.png',
];

export default function LandingPage() {
    const [lang, setLang] = useState<Language>('zh');
    const [showAllFaq, setShowAllFaq] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    const t = translations[lang];

    // Load language preference from localStorage
    useEffect(() => {
        const savedLang = localStorage.getItem('jobbuff-lang') as Language;
        if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
            setLang(savedLang);
        }
    }, []);

    // Save language preference
    const toggleLanguage = (newLang: Language) => {
        setLang(newLang);
        localStorage.setItem('jobbuff-lang', newLang);
        // Reset typing animation when language changes
        setTypedText('');
        setIsTyping(true);
    };

    // Typewriter effect for title
    useEffect(() => {
        if (!isTyping) return;

        const fullText = t.hero.title + t.hero.titleHighlight + t.hero.titleEnd;
        let currentIndex = 0;

        const timer = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setTypedText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(timer);
            }
        }, 80);

        return () => clearInterval(timer);
    }, [isTyping, t.hero.title, t.hero.titleHighlight, t.hero.titleEnd]);

    // Function to render typed text with highlight
    const renderTypedTitle = () => {
        const title = t.hero.title;
        const highlight = t.hero.titleHighlight;
        const end = t.hero.titleEnd;

        const titleLen = title.length;
        const highlightLen = highlight.length;

        let titlePart = '';
        let highlightPart = '';
        let endPart = '';

        if (typedText.length <= titleLen) {
            titlePart = typedText;
        } else if (typedText.length <= titleLen + highlightLen) {
            titlePart = title;
            highlightPart = typedText.slice(titleLen);
        } else {
            titlePart = title;
            highlightPart = highlight;
            endPart = typedText.slice(titleLen + highlightLen);
        }

        return (
            <>
                {titlePart}
                {highlightPart && (
                    <span className={styles.heroTitleHighlight}>{highlightPart}</span>
                )}
                {endPart}
                {isTyping && <span className={styles.cursor}>|</span>}
            </>
        );
    };

    const featureIcons = [
        <IconRadar key="radar" size={48} color="var(--color-buff-orange)" />,
        <IconHammer key="hammer" size={48} color="var(--color-buff-orange)" />,
        <IconSword key="sword" size={48} color="var(--color-buff-orange)" />,
    ];

    const faqToShow = showAllFaq ? t.faq.items : t.faq.items.slice(0, 3);

    return (
        <div className={styles.landing}>
            {/* ===== HERO SECTION ===== */}
            <section className={styles.hero}>
                {/* Top bar with badge and language toggle */}
                <div className={styles.heroTopBar}>
                    <span className={styles.heroBadge}>{t.hero.badge}</span>

                    {/* Language Toggle */}
                    <div className={styles.langToggle}>
                        <button
                            className={`${styles.langBtn} ${lang === 'zh' ? styles.langBtnActive : ''}`}
                            onClick={() => toggleLanguage('zh')}
                        >
                            {t.langToggle.zh}
                        </button>
                        <span className={styles.langDivider}>|</span>
                        <button
                            className={`${styles.langBtn} ${lang === 'en' ? styles.langBtnActive : ''}`}
                            onClick={() => toggleLanguage('en')}
                        >
                            {t.langToggle.en}
                        </button>
                    </div>
                </div>

                <h1 className={styles.heroTitle}>
                    {renderTypedTitle()}
                </h1>

                <p className={styles.heroSlogan}>{t.hero.slogan}</p>

                <p className={styles.heroSubtitle}>{t.hero.subtitle}</p>

                <div className={styles.heroCta}>
                    <Link href="/quest/new">
                        <RetroButton variant="primary" size="large" pulse>
                            <IconTarget size={18} />
                            {t.hero.ctaPrimary}
                        </RetroButton>
                    </Link>
                    <Link href="/log">
                        <RetroButton variant="secondary" size="large">
                            <IconScroll size={18} />
                            {t.hero.ctaSecondary}
                        </RetroButton>
                    </Link>
                </div>

                <div className={styles.scrollHint}>
                    <IconChevronDown size={24} color="var(--color-pixel-gray-dark)" />
                </div>
            </section>

            {/* ===== PAIN POINTS SECTION ===== */}
            <section className={styles.painSection}>
                <h2 className={styles.sectionTitle}>{t.painPoints.title}</h2>
                <div className={styles.painPointsGrid}>
                    {t.painPoints.items.map((item, index) => (
                        <div key={index} className={styles.painPointCard}>
                            <div className={styles.painPointBefore}>
                                <div className={styles.painPointIllustration}>
                                    <Image
                                        src={painIllustrations[index]}
                                        alt={item.title}
                                        width={180}
                                        height={180}
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                <h3 className={styles.painPointTitle}>{item.title}</h3>
                                <p className={styles.painPointDesc}>{item.desc}</p>
                            </div>
                            <div className={styles.painPointAfter}>
                                <IconRocket size={18} color="var(--color-buff-orange)" />
                                <span>{item.solution}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t.features.title}</h2>
                <div className={styles.featuresGrid}>
                    {t.features.items.map((item, index) => (
                        <PixelCard key={index} shadow="md" hoverLift>
                            <div className={styles.featureCard}>
                                <div className={styles.featureIcon}>
                                    {featureIcons[index]}
                                </div>
                                <div className={styles.featureHeader}>
                                    <h3 className={styles.featureTitle}>{item.title}</h3>
                                    <span className={styles.featureSubtitle}>{item.subtitle}</span>
                                </div>
                                <p className={styles.featureDesc}>{item.desc}</p>
                                <div className={styles.featureTags}>
                                    {item.tags.map((tag, tagIndex) => (
                                        <span key={tagIndex} className={styles.featureTag}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </PixelCard>
                    ))}
                </div>
            </section>

            {/* ===== HOW IT WORKS SECTION ===== */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t.howItWorks.title}</h2>
                <div className={styles.stepsContainer}>
                    {t.howItWorks.steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div className={styles.step}>
                                <div className={styles.stepNumber}>{index + 1}</div>
                                <div className={styles.stepIcon}>{step.icon}</div>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDesc}>{step.desc}</p>
                            </div>
                            {index < t.howItWorks.steps.length - 1 && (
                                <div className={styles.stepConnector}>
                                    <div className={styles.stepLine}></div>
                                    <span className={styles.stepArrow}>▶</span>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* ===== STATS SECTION ===== */}
            <section className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    {t.stats.items.map((stat, index) => (
                        <div key={index} className={styles.statCard}>
                            <div className={styles.statValue}>
                                {stat.value}
                                <span className={styles.statUnit}>{stat.unit}</span>
                            </div>
                            <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== FAQ SECTION ===== */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{t.faq.title}</h2>
                <div className={styles.faqContainer}>
                    {faqToShow.map((item, index) => (
                        <FaqItem key={index} question={item.q} answer={item.a} />
                    ))}

                    <button
                        className={styles.faqToggle}
                        onClick={() => setShowAllFaq(!showAllFaq)}
                    >
                        {showAllFaq ? t.faq.showLess : t.faq.showMore}
                        <IconChevronDown
                            size={16}
                            className={showAllFaq ? styles.faqToggleIconUp : ''}
                        />
                    </button>
                </div>
            </section>

            {/* ===== FINAL CTA SECTION ===== */}
            <section className={styles.ctaSection}>
                <h2 className={styles.ctaTitle}>{t.cta.title}</h2>

                <Link href="/login">
                    <RetroButton variant="primary" size="large" pulse>
                        <IconRocket size={20} />
                        {t.cta.button}
                    </RetroButton>
                </Link>

                <div className={styles.ctaBenefits}>
                    {t.cta.benefits.map((benefit, index) => (
                        <span key={index} className={styles.ctaBenefit}>
                            <IconCheck size={14} color="var(--color-loot-green)" />
                            {benefit}
                        </span>
                    ))}
                </div>

                <a
                    href="https://github.com/Icey-Lan/JobBuff"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.githubLink}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    {t.cta.github}
                </a>
            </section>
        </div>
    );
}

// FAQ Item Component
function FaqItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}>
            <button
                className={styles.faqQuestion}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{question}</span>
                <IconChevronDown
                    size={18}
                    className={isOpen ? styles.faqIconOpen : ''}
                />
            </button>
            <div className={`${styles.faqAnswer} ${isOpen ? styles.faqAnswerOpen : ''}`}>
                <p>{answer}</p>
            </div>
        </div>
    );
}
