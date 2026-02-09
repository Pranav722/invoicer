import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'gray';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    dot?: boolean;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'gray',
    dot = false,
    className = ''
}) => {
    const classes = `badge badge-${variant} ${className}`.trim();

    return (
        <span className={classes}>
            {dot && <span className={`status-dot status-dot-${variant}`}></span>}
            {children}
        </span>
    );
};

export const StatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
    const getVariant = (status: string): BadgeVariant => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'paid') return 'success';
        if (statusLower === 'sent' || statusLower === 'viewed') return 'info';
        if (statusLower === 'overdue') return 'warning';
        if (statusLower === 'canceled') return 'error';
        return 'gray'; // draft
    };

    return (
        <Badge variant={getVariant(status)} dot className={className}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
};
