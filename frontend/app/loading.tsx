import styles from './error.module.css';

export default function Loading() {
    return (
        <div className={styles['error-shell']}>
            <div className={styles['error-card']}>
                <h2 className={styles['error-title']}>正在同步任务数据...</h2>
                <p className={styles['error-subtitle']}>请稍候，系统正在加载当前页面资源。</p>
                <div className={styles['error-debug']}>Loading...</div>
            </div>
        </div>
    );
}
