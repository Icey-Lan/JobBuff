import Link from 'next/link';
import styles from './page.module.css';
import { RetroButton } from '@/components/ui/RetroButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { IconRadar, IconHammer, IconSword, IconTarget, IconScroll, IconLightning } from '@/components/icons';

export default function Home() {
  return (
    <div className={styles.landing}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <span className={styles.hero__badge}>BETA v0.1.0</span>

        <h1 className={styles.hero__title}>
          你的求职
          <span className={styles['hero__title-highlight']}>外挂</span>
          已上线
        </h1>

        <p className={styles.hero__subtitle}>
          一站式 AI 求职辅助工具 —— 深度解析 JD，智能重写简历，模拟面试训练。
          让每一次投递都经过深思熟虑。
        </p>

        <p className={styles.hero__tagline}>
          &quot;读得透、改得快、记得住&quot;
        </p>

        <div className={styles.hero__cta}>
          <Link href="/quest/new">
            <RetroButton variant="primary" size="large" pulse>
              <IconTarget size={18} />
              开启新任务
            </RetroButton>
          </Link>
          <Link href="/log">
            <RetroButton variant="secondary" size="large">
              <IconScroll size={18} />
              查看冒险日志
            </RetroButton>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <h2 className={styles.features__title}>三大核心技能</h2>
        <div className={styles.features__grid}>
          <PixelCard shadow="md" hoverLift>
            <div className={styles['feature-card']}>
              <div className={styles['feature-card__icon']}>
                <IconRadar size={48} color="var(--color-buff-orange)" />
              </div>
              <h3 className={styles['feature-card__title']}>情报侦察</h3>
              <p className={styles['feature-card__desc']}>
                深度解析 JD，识别隐藏要求和风险信号，雷达图可视化匹配度评估
              </p>
            </div>
          </PixelCard>

          <PixelCard shadow="md" hoverLift>
            <div className={styles['feature-card']}>
              <div className={styles['feature-card__icon']}>
                <IconHammer size={48} color="var(--color-buff-orange)" />
              </div>
              <h3 className={styles['feature-card__title']}>装备锻造</h3>
              <p className={styles['feature-card__desc']}>
                AI 全权代笔重写简历，生成句子级 Diff，支持逐条接受/拒绝改动
              </p>
            </div>
          </PixelCard>

          <PixelCard shadow="md" hoverLift>
            <div className={styles['feature-card']}>
              <div className={styles['feature-card__icon']}>
                <IconSword size={48} color="var(--color-buff-orange)" />
              </div>
              <h3 className={styles['feature-card__title']}>试炼挑战</h3>
              <p className={styles['feature-card__desc']}>
                基于 JD 生成模拟面试题，AI 实时点评回答，提供参考攻略
              </p>
            </div>
          </PixelCard>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.stat__icon}>
            <IconLightning size={24} color="var(--color-buff-orange)" />
          </div>
          <div className={styles.stat__value}>15s</div>
          <div className={styles.stat__label}>单次分析耗时</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.stat__icon}>
            <IconRadar size={24} color="var(--color-buff-orange)" />
          </div>
          <div className={styles.stat__value}>5</div>
          <div className={styles.stat__label}>核心维度评估</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.stat__icon}>
            <IconScroll size={24} color="var(--color-buff-orange)" />
          </div>
          <div className={styles.stat__value}>∞</div>
          <div className={styles.stat__label}>冒险日志容量</div>
        </div>
      </section>

      {/* Terminal Demo */}
      <section className={styles.demo}>
        <div className={styles.demo__header}>
          <div className={styles.demo__dots}>
            <span className={styles['demo__dot--red']} />
            <span className={styles['demo__dot--yellow']} />
            <span className={styles['demo__dot--green']} />
          </div>
          <span className={styles.demo__title}>analysis_output.log</span>
        </div>
        <div className={styles.demo__terminal}>
          <span className={`${styles['demo__terminal-line']} ${styles['demo__terminal-line--comment']}`}>
            # 正在侦察目标岗位...
          </span>
          <span className={styles['demo__terminal-line']}>
            &gt; 解析 JD 文本... <span className={styles['demo__terminal-line--success']}>OK</span>
          </span>
          <span className={styles['demo__terminal-line']}>
            &gt; 提取核心能力要求... <span className={styles['demo__terminal-line--success']}>OK</span>
          </span>
          <span className={styles['demo__terminal-line']}>
            &gt; 扫描风险信号... <span className={styles['demo__terminal-line--success']}>OK</span>
          </span>
          <span className={`${styles['demo__terminal-line']} ${styles['demo__terminal-line--highlight']}`}>
            &gt; 匹配度评估: 78%
          </span>
          <div className={styles.demo__progress}>
            <div className={styles['demo__progress-bar']} style={{ width: '78%' }} />
          </div>
          <span className={styles['demo__terminal-line']}>
            &gt; 情报侦察完成，准备锻造装备...<span className={styles['demo__cursor']}>_</span>
          </span>
        </div>
      </section>
    </div>
  );
}
