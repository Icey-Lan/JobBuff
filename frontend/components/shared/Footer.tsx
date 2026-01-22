import React from 'react';
import styles from './Footer.module.css';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footer__copyright}>
                <span className={styles['footer__copyright-icon']}>[JB]</span>
                <span>© {currentYear} JobBuff. All rights reserved.</span>
            </div>

            <div className={styles.footer__links}>
                <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.footer__link}
                >
                    GitHub
                </a>
                <a href="/about" className={styles.footer__link}>
                    About
                </a>
                <span className={styles.footer__version}>v0.1.0-beta</span>
            </div>
        </footer>
    );
}

export default Footer;
