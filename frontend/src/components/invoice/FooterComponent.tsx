import React from 'react';
import type { FooterConfig, NotesConfig, ColorPalette, FontConfig } from '../../types/InvoiceTemplate';
import { NotesComponent } from './NotesComponent';

interface FooterComponentProps {
    invoice: any;
    config: FooterConfig;
    notesConfig: NotesConfig;
    colors: ColorPalette;
    fonts: { heading: FontConfig; body: FontConfig; label: FontConfig };
}

export function FooterComponent({ invoice, config, notesConfig, colors, fonts }: FooterComponentProps) {
    const footerStyle: React.CSSProperties = {
        backgroundColor: config.backgroundColor,
        borderTop: config.borderTop
            ? `${config.borderTop.width}px ${config.borderTop.style} ${config.borderTop.color}`
            : 'none',
        padding: `${config.padding}px`,
        marginTop: '40px'
    };

    const layoutClasses = {
        'single-column': 'flex flex-col gap-6',
        'two-column': 'grid grid-cols-2 gap-8',
        'centered': 'flex flex-col items-center text-center gap-6'
    };

    return (
        <footer style={footerStyle} className={layoutClasses[config.layout]}>

            {/* Notes in Footer (if configured) */}
            {notesConfig.enabled && notesConfig.position === 'in-footer' && invoice.notes && (
                <div className="col-span-2">
                    <NotesComponent
                        notes={invoice.notes}
                        config={notesConfig}
                        colors={colors}
                    />
                </div>
            )}

            {/* Payment Info */}
            {config.paymentInfo.enabled && (
                <div
                    className={config.layout === 'centered' ? 'w-full' : ''}
                    style={{
                        fontSize: `${config.paymentInfo.fontSize}px`,
                        textAlign: config.paymentInfo.position
                    }}
                >
                    <div style={{ fontWeight: 600, marginBottom: '8px', fontFamily: fonts.label.family }}>
                        Payment Information
                    </div>

                    {config.paymentInfo.showBankDetails && invoice.company?.bankDetails && (
                        <div style={{ color: colors.textMuted, lineHeight: 1.6 }}>
                            <div><strong>Bank:</strong> {invoice.company.bankDetails.bankName}</div>
                            <div><strong>Account:</strong> {invoice.company.bankDetails.accountNumber}</div>
                            <div><strong>Routing:</strong> {invoice.company.bankDetails.routingNumber}</div>
                        </div>
                    )}

                    {invoice.paymentTerms && (
                        <div style={{ color: colors.textMuted, marginTop: '8px' }}>
                            <strong>Terms:</strong> {invoice.paymentTerms}
                        </div>
                    )}
                </div>
            )}

            {/* Thank You Message */}
            {config.thankYou.enabled && (
                <div
                    style={{
                        fontSize: `${config.thankYou.fontSize}px`,
                        fontWeight: config.thankYou.fontWeight,
                        color: config.thankYou.color,
                        textAlign: config.layout === 'centered' ? 'center' : 'right',
                        marginTop: config.layout === 'single-column' ? '16px' : '0'
                    }}
                >
                    {config.thankYou.text}
                </div>
            )}

        </footer>
    );
}
