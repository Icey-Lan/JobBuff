'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { IconGamepad, IconLightning, IconTarget, IconScroll } from '@/components/icons';
import { useAuth } from '@/components/AuthProvider';
import { RetroButton } from '@/components/ui/RetroButton';

export function Navbar() {
    const { user, quota, loading, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/login';
    };

    return (
        <header className={styles.navbar}>
            {/* Logo */}
            <Link href="/" className={styles.navbar__logo}>
                <span className={styles['navbar__logo-icon']}>
                    <IconGamepad size={24} />
                </span>
                <div className={styles['navbar__logo-text']}>
                    Job<span>Buff</span>
                </div>
            </Link>

            {/* Navigation */}
            <nav className={styles.navbar__nav}>
                <Link href="/" className={styles.navbar__link}>
                    <IconTarget size={16} />
                    <span>任务板</span>
                </Link>
                <Link href="/quest/new" className={styles.navbar__link}>
                    <IconScroll size={16} />
                    <span>新任务</span>
                </Link>
                <Link href="/log" className={styles.navbar__link}>
                    <IconScroll size={16} />
                    <span>冒险日志</span>
                </Link>

                {/* Quota Indicator */}
                {user && (
                    <div className={styles.navbar__quota}>
                        <span className={styles['navbar__quota-icon']}>
                            <IconLightning size={14} />
                        </span>
                        <span>剩余:</span>
                        <span className={styles['navbar__quota-count']}>
                            {quota ? quota.remaining : (loading ? '...' : '?')}
                        </span>
                        <span>次</span>
                        {/* Quota Rules Tooltip */}
                        <span className={styles['navbar__quota-help']} title="配额规则：每次「新任务分析」消耗 1 次配额。同一任务的「装备锻造」和「试炼挑战」不额外扣费。">
                            ?
                        </span>
                    </div>
                )}

                {/* User Auth */}
                {!loading && (
                    <div className={styles.navbar__auth}>
                        {user ? (
                            <>
                                <Link href="/profile" className={styles.navbar__email}>
                                    {user.email?.split('@')[0]}
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className={styles.navbar__logout}
                                >
                                    退出
                                </button>
                            </>
                        ) : (
                            <Link href="/login">
                                <RetroButton variant="secondary" size="small">
                                    登录
                                </RetroButton>
                            </Link>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Navbar;

