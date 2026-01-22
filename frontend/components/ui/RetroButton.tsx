import React from 'react';
import styles from './RetroButton.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export function RetroButton({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  pulse = false,
  children,
  className = '',
  disabled,
  ...props
}: RetroButtonProps) {
  const classNames = [
    styles['retro-button'],
    styles[`retro-button--${variant}`],
    size !== 'medium' && styles[`retro-button--${size}`],
    fullWidth && styles['retro-button--full-width'],
    pulse && styles['retro-button--pulse'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

export default RetroButton;
