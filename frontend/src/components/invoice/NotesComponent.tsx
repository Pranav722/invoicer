import React from 'react';
import type { NotesConfig, ColorPalette } from '../../types/InvoiceTemplate';

interface NotesComponentProps {
    notes?: string;
    config: NotesConfig;
    colors: ColorPalette;
}

export function NotesComponent({ notes, config, colors }: NotesComponentProps) {
    if (!notes || !config.enabled) return null;

    return (
        <div
            style={{
                fontSize: `${config.fontSize}px`,
                color: config.color,
                backgroundColor: config.backgroundColor,
                padding: `${config.padding}px`,
                borderRadius: config.backgroundColor ? '8px' : '0'
            }}
        >
            <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                Notes
            </div>
            <div style={{ lineHeight: 1.6 }}>
                {notes}
            </div>
        </div>
    );
}
