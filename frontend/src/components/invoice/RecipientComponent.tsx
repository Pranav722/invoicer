import React from 'react';
import type { RecipientConfig, ColorPalette, FontConfig } from '../../types/InvoiceTemplate';

interface RecipientComponentProps {
    invoice: any;
    config: RecipientConfig;
    colors: ColorPalette;
    fonts: { heading: FontConfig; body: FontConfig; label: FontConfig };
}

export function RecipientComponent({ invoice, config, colors, fonts }: RecipientComponentProps) {
    const getLabelStyle = () => {
        const base: React.CSSProperties = {
            fontFamily: fonts.label.family,
            fontSize: `${fonts.label.size}px`,
            fontWeight: 600,
            marginBottom: '8px'
        };

        switch (config.labelStyle) {
            case 'bold':
                return { ...base, color: colors.text, fontWeight: 700 };
            case 'uppercase':
                return { ...base, textTransform: 'uppercase' as const, color: colors.textMuted, letterSpacing: '0.05em' };
            case 'pill':
                return {
                    ...base,
                    backgroundColor: colors.primary,
                    color: '#ffffff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    display: 'inline-block',
                    fontSize: `${fonts.label.size - 1}px`
                };
            default:
                return base;
        }
    };

    const containerClass = config.layout === 'two-column'
        ? 'grid grid-cols-2 gap-8'
        : 'flex flex-col gap-6';

    return (
        <div className={containerClass} style={{ fontSize: `${config.fontSize}px` }}>

            {/* Bill To */}
            <div>
                <div style={getLabelStyle()}>
                    Bill To
                </div>
                <div style={{ color: colors.text }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {invoice.vendor?.name || 'Vendor Name'}
                    </div>
                    {invoice.vendor?.address && (
                        <div style={{ color: colors.textMuted }}>
                            <div>{invoice.vendor.address.street}</div>
                            <div>
                                {invoice.vendor.address.city}, {invoice.vendor.address.state} {invoice.vendor.address.zip}
                            </div>
                        </div>
                    )}
                    {invoice.vendor?.email && (
                        <div style={{ color: colors.textMuted, marginTop: '4px' }}>
                            {invoice.vendor.email}
                        </div>
                    )}
                </div>
            </div>

            {/* Ship To (if enabled) */}
            {config.showShipTo && invoice.shipTo && (
                <div>
                    <div style={getLabelStyle()}>
                        Ship To
                    </div>
                    <div style={{ color: colors.text }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                            {invoice.shipTo.name}
                        </div>
                        {invoice.shipTo.address && (
                            <div style={{ color: colors.textMuted }}>
                                <div>{invoice.shipTo.address.street}</div>
                                <div>
                                    {invoice.shipTo.address.city}, {invoice.shipTo.address.state} {invoice.shipTo.address.zip}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
