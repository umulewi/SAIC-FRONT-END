import { type ReactNode } from 'react';
import './Card.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`saic-card ${className}`}>
      {title && <div className="card-title">{title}</div>}
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'red';
}

export function StatCard({ label, value, icon, color = 'green' }: StatCardProps) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}
