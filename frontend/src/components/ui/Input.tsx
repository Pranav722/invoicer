import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    icon,
    className = '',
    ...props
}) => {
    const generatedId = React.useId();
    const inputId = props.id || generatedId;

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={`input ${error ? 'input-error' : ''} ${icon ? 'pl-10' : ''} ${className}`.trim()}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-sm text-error-600">{error}</p>
            )}
            {!error && helperText && (
                <p className="mt-1 text-xs text-slate-500">{helperText}</p>
            )}
        </div>
    );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    error,
    helperText,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <textarea
                className={`input ${error ? 'input-error' : ''} ${className} min-h-[100px] py-3`.trim()}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-error-600">{error}</p>
            )}
            {!error && helperText && (
                <p className="mt-1 text-xs text-gray-500">{helperText}</p>
            )}
        </div>
    );
};
