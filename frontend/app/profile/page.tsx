'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from '@/components/AuthProvider';
import { PixelCard } from '@/components/ui/PixelCard';
import { RetroButton } from '@/components/ui/RetroButton';
import { IconGamepad, IconLightning, IconUser, IconRocket, IconShield } from '@/components/icons';
import { useToast } from '@/components/ui/ToastProvider';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
    const router = useRouter();
    const { user, quota, loading, signOut } = useAuth();
    const { showToast } = useToast();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Format date
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '未知';
        return new Date(dateString).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Calculate quota percentage
    const getQuotaPercentage = () => {
        if (!quota || quota.freeQuota <= 0) return 0;
        const ratio = (quota.usedQuota / quota.freeQuota) * 100;
        return Math.max(0, Math.min(100, Math.round(ratio)));
    };

    // Handle sign out
    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    const handlePasswordReset = async () => {
        if (!newPassword || !confirmPassword) {
            showToast('请完整填写新密码和确认密码', 'error');
            return;
        }

        if (newPassword.length < 6) {
            showToast('新密码至少需要 6 位字符', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('两次输入的密码不一致', 'error');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.updateUser({ password: newPassword });

            if (error) {
                showToast(error.message || '密码更新失败，请稍后重试', 'error');
                return;
            }

            setNewPassword('');
            setConfirmPassword('');
            showToast('密码已更新', 'success');
        } catch (error) {
            console.error(error);
            showToast('密码更新失败，请稍后重试', 'error');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, router, user]);

    if (loading) {
        return (
            <div className={styles.profilePage}>
                <div className={styles.profileHeader}>
                    <h1 className={styles.profileHeader__title}>
                        <IconGamepad size={32} color="var(--color-buff-orange)" />
                        加载中...
                    </h1>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className={styles.profilePage}>
            {/* Header */}
            <div className={styles.profileHeader}>
                <h1 className={styles.profileHeader__title}>
                    <IconGamepad size={32} color="var(--color-buff-orange)" />
                    我的账户
                </h1>
                <p className={styles.profileHeader__subtitle}>
                    管理您的账户信息和配额
                </p>
            </div>

            {/* Account Info */}
            <section className={styles.section}>
                <h2 className={styles.section__title}>
                    <IconUser size={20} color="var(--color-buff-orange)" />
                    账户信息
                </h2>
                <PixelCard>
                    <div className={styles.accountInfo}>
                        <div className={styles.accountInfo__row}>
                            <span className={styles.accountInfo__label}>邮箱</span>
                            <span className={styles.accountInfo__value}>{user.email}</span>
                        </div>
                        <div className={styles.accountInfo__row}>
                            <span className={styles.accountInfo__label}>注册时间</span>
                            <span className={styles.accountInfo__value}>
                                {formatDate(user.created_at)}
                            </span>
                        </div>
                        <div className={styles.accountInfo__row}>
                            <span className={styles.accountInfo__label}>账户类型</span>
                            <span className={`${styles.accountInfo__badge} ${quota?.isPremium ? styles['accountInfo__badge--premium'] : styles['accountInfo__badge--free']}`}>
                                {quota?.isPremium ? '⭐ Pro 会员' : '🆓 免费用户'}
                            </span>
                        </div>
                    </div>
                </PixelCard>
            </section>

            {/* Quota Usage */}
            <section className={styles.section}>
                <h2 className={styles.section__title}>
                    <IconLightning size={20} color="var(--color-buff-orange)" />
                    配额使用情况
                </h2>
                <PixelCard className={styles.quotaCard}>
                    <div className={styles.quotaStats}>
                        <div className={styles.quotaStat}>
                            <div className={styles.quotaStat__value}>
                                {quota?.freeQuota ?? 10}
                            </div>
                            <div className={styles.quotaStat__label}>总配额</div>
                        </div>
                        <div className={styles.quotaStat}>
                            <div className={styles.quotaStat__value}>
                                {quota?.usedQuota ?? 0}
                            </div>
                            <div className={styles.quotaStat__label}>已使用</div>
                        </div>
                        <div className={styles.quotaStat}>
                            <div className={styles.quotaStat__value} style={{ color: 'var(--color-loot-green)' }}>
                                {quota?.remaining ?? 10}
                            </div>
                            <div className={styles.quotaStat__label}>剩余</div>
                        </div>
                    </div>

                    <div className={styles.quotaProgress}>
                        <div className={styles.quotaProgress__bar}>
                            <div
                                className={styles.quotaProgress__fill}
                                style={{ width: `${getQuotaPercentage()}%` }}
                            />
                        </div>
                        <div className={styles.quotaProgress__text}>
                            <span>已使用 {getQuotaPercentage()}%</span>
                            <span>{quota?.remaining ?? 10} 次可用</span>
                        </div>
                    </div>

                    {/* Quota Rules */}
                    <div className={styles.quotaRules}>
                        <div className={styles.quotaRules__title}>📋 配额规则说明</div>
                        <ul className={styles.quotaRules__list}>
                            <li><span className={styles.quotaRules__deduct}>-1</span> 每次「新任务分析」成功后扣减配额</li>
                            <li><span className={styles.quotaRules__safe}>✓</span> 分析失败或保存失败不扣费</li>
                            <li><span className={styles.quotaRules__free}>免费</span> 装备锻造 & 试炼挑战（已包含在分析中）</li>
                            <li><span className={styles.quotaRules__free}>免费</span> 历史任务可无限次查看</li>
                        </ul>
                    </div>
                </PixelCard>
            </section>

            {/* Upgrade Plan */}
            <section className={styles.section}>
                <h2 className={styles.section__title}>
                    <IconRocket size={20} color="var(--color-buff-orange)" />
                    升级套餐
                </h2>
                <PixelCard className={styles.upgradeCard}>
                    <div className={styles.upgradeTier}>
                        <span className={styles.upgradeTier__name}>Pro 会员</span>
                        <span className={styles.upgradeTier__badge}>敬请期待</span>
                    </div>
                    <ul className={styles.upgradeFeatures}>
                        <li>无限分析次数</li>
                        <li>优先 AI 响应速度</li>
                        <li>高级简历模板</li>
                        <li>专属客服支持</li>
                    </ul>
                    <div className={styles.upgradeButton}>
                        🔜 即将推出
                    </div>
                </PixelCard>
            </section>

            {/* Security Actions */}
            <section className={styles.section}>
                <h2 className={styles.section__title}>
                    <IconShield size={20} color="var(--color-buff-orange)" />
                    账户安全
                </h2>
                <div className={styles.securityPanel}>
                    <div className={styles.passwordForm}>
                        <div className={styles.passwordRow}>
                            <label className={styles.passwordLabel} htmlFor="new-password">新密码</label>
                            <input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={styles.passwordInput}
                                placeholder="至少 6 位字符"
                                autoComplete="new-password"
                            />
                        </div>
                        <div className={styles.passwordRow}>
                            <label className={styles.passwordLabel} htmlFor="confirm-password">确认新密码</label>
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={styles.passwordInput}
                                placeholder="再次输入新密码"
                                autoComplete="new-password"
                            />
                        </div>
                        <div className={styles.securityActions}>
                            <RetroButton
                                variant="secondary"
                                onClick={handlePasswordReset}
                                disabled={isUpdatingPassword}
                            >
                                {isUpdatingPassword ? '更新中...' : '更新密码'}
                            </RetroButton>
                            <RetroButton
                                variant="danger"
                                onClick={handleSignOut}
                                disabled={isUpdatingPassword}
                            >
                                退出登录
                            </RetroButton>
                        </div>
                        <p className={styles.passwordHint}>修改后请使用新密码重新登录。</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
