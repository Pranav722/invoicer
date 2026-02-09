import React from 'react';
import type { HeaderConfig, ColorPalette, FontConfig } from '../../types/InvoiceTemplate';

interface HeaderComponentProps {
    invoice: any;
    config: HeaderConfig;
    colors: ColorPalette;
    fonts: { heading: FontConfig; body: FontConfig; label: FontConfig };
}

export function HeaderComponent({ invoice, config, colors, fonts }: HeaderComponentProps) {
    const headerStyle: React.CSSProperties = {
        backgroundColor: config.backgroundColor,
        padding: `${config.padding}px`,
        borderBottom: config.borderBottom
            ? `${config.borderBottom.width}px ${config.borderBottom.style} ${config.borderBottom.color}`
            : 'none'
    };

    const layoutClasses = {
        'logo-left': 'flex justify-between items-start',
        'logo-center': 'flex flex-col items-center gap-6',
        'logo-right': 'flex justify-between items-start flex-row-reverse',
        'split': 'grid grid-cols-2 gap-8'
    };

    return (
        <header style={headerStyle} className={layoutClasses[config.layout]}>

            {/* Logo Section */}
            {config.logo.enabled && (
                <div className={`logo-section ${config.logo.position}`}>
                    {invoice.company?.logo && (
                        <img
                            src={invoice.company.logo}
                            alt="Company Logo"
                            style={{
                                maxWidth: `${config.logo.maxWidth}px`,
                                maxHeight: `${config.logo.maxHeight}px`,
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </div>
            )}

            {/* Company Info */}
            <div
                className="company-info"
                style={{
                    textAlign: config.companyInfo.alignment,
                    fontSize: `${config.companyInfo.fontSize}px`,
                    fontFamily: fonts.body.family
                }}
            >
                <div style={{
                    fontWeight: 600,
                    fontSize: `${fonts.heading.size}px`,
                    fontFamily: fonts.heading.family,
                    color: fonts.heading.color,
                    letterSpacing: fonts.heading.letterSpacing,
                    marginBottom: '8px'
                }}>
                    {invoice.company?.name || 'Company Name'}
                </div>

                {config.companyInfo.showAddress && invoice.company?.address && (
                    <div style={{ color: colors.textMuted, marginBottom: '4px' }}>
                        <div>{invoice.company.address.street}</div>
                        <div>
                            {invoice.company.address.city}, {invoice.company.address.state} {invoice.company.address.zip}
                        </div>
                        <div>{invoice.company.address.country}</div>
                    </div>
                )}

                {config.companyInfo.showContact && (
                    <div style={{ color: colors.textMuted }}>
                        {invoice.company?.email && <div>{invoice.company.email}</div>}
                        {invoice.company?.phone && <div>{invoice.company.phone}</div>}
                    </div>
                )}
            </div>

            {/* Invoice Meta */}
            <div
                className="invoice-meta"
                style={{
                    textAlign: config.invoiceMeta.alignment,
                    fontFamily: fonts.label.family
                }}
            >
                {config.invoiceMeta.showNumber && (
                    <div style={{ marginBottom: '12px' }}>
                        <div
                            style={{
                                fontWeight: config.invoiceMeta.labelStyle === 'bold' ? 600 : 400,
                                textTransform: config.invoiceMeta.labelStyle === 'uppercase' ? 'uppercase' : 'none',
                                color: config.invoiceMeta.labelStyle === 'muted' ? colors.textMuted : colors.text,
                                fontSize: `${fonts.label.size}px`,
                                marginBottom: '4px'
                            }}
                        >
                            Invoice Number
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '16px' }}>
                            {invoice.invoiceNumber}
                        </div>
                    </div>
                )}

                {config.invoiceMeta.showDate && (
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{
                            fontWeight: config.invoiceMeta.labelStyle === 'bold' ? 600 : 400,
                            textTransform: config.invoiceMeta.labelStyle === 'uppercase' ? 'uppercase' : 'none',
                            color: config.invoiceMeta.labelStyle === 'muted' ? colors.textMuted : colors.text,
                            fontSize: `${fonts.label.size}px`,
                            marginBottom: '4px'
                        }}>
                            Invoice Date
                        </div>
                        <div>{new Date(invoice.invoiceDate).toLocaleDateString()}</div>
                    </div>
                )}

                {config.invoiceMeta.showDueDate && invoice.dueDate && (
                    <div>
                        <div style={{
                            fontWeight: config.invoiceMeta.labelStyle === 'bold' ? 600 : 400,
                            textTransform: config.invoiceMeta.labelStyle === 'uppercase' ? 'uppercase' : 'none',
                            color: config.invoiceMeta.labelStyle === 'muted' ? colors.textMuted : colors.text,
                            fontSize: `${fonts.label.size}px`,
                            marginBottom: '4px'
                        }}>
                            Due Date
                        </div>
                        <div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
                    </div>
                )}
            </div>

        </header>
    );
}
