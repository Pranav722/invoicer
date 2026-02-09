import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    elevated?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    elevated = false,
    onClick
}) => {
    const classes = `card ${elevated ? 'card-elevated' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`.trim();

    return (
        <div className={classes} onClick={onClick}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`.trim()}>
            {children}
        </div>
    );
};

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
    return (
        <h3 className={`text-xl font-semibold text-slate-900 ${className}`.trim()}>
            {children}
        </h3>
    );
};

interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
    return <div className={className}>{children}</div>;
};
