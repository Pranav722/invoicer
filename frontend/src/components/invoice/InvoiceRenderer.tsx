import React from 'react';
import type { InvoiceTemplate } from '../../types/InvoiceTemplate';
import { HeaderComponent } from './HeaderComponent';
import { RecipientComponent } from './RecipientComponent';
import { TableComponent } from './TableComponent';
import { NotesComponent } from './NotesComponent';
import { FooterComponent } from './FooterComponent';

interface InvoiceRendererProps {
    invoice: any; // TODO: Replace with actual Invoice type
    template: InvoiceTemplate;
    scale?: number;
}

export function InvoiceRenderer({ invoice, template, scale = 1 }: InvoiceRendererProps) {
    const { config } = template;

    const containerStyle: React.CSSProperties = {
        fontFamily: config.fonts.body.family,
        fontSize: `${config.fonts.body.size}px`,
        color: config.colors.text,
        backgroundColor: config.colors.background,
        padding: `${config.layout.pageMargin}px`,
        maxWidth: `${config.layout.contentMaxWidth}px`,
        margin: '0 auto',
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: config.layout.pageSize === 'A4' ? '210mm' : '8.5in',
        minHeight: config.layout.pageSize === 'A4' ? '297mm' : '11in',
    };

    const sectionGap = `${config.layout.sectionGap}px`;

    return (
        <div style={containerStyle} className="invoice-container">

            {/* Header */}
            {config.header.enabled && (
                <div style={{ marginBottom: sectionGap }}>
                    <HeaderComponent
                        invoice={invoice}
                        config={config.header}
                        colors={config.colors}
                        fonts={config.fonts}
                    />
                </div>
            )}

            {/* Recipient */}
            {config.recipient.enabled && (
                <div style={{ marginBottom: sectionGap }}>
                    <RecipientComponent
                        invoice={invoice}
                        config={config.recipient}
                        colors={config.colors}
                        fonts={config.fonts}
                    />
                </div>
            )}

            {/* Items Table */}
            <div style={{ marginBottom: sectionGap }}>
                <TableComponent
                    items={invoice.items}
                    subtotal={invoice.subtotal}
                    tax={invoice.tax}
                    total={invoice.total}
                    config={config.table}
                    colors={config.colors}
                    fonts={config.fonts}
                />
            </div>

            {/* Notes */}
            {config.notes.enabled && config.notes.position === 'before-footer' && (
                <div style={{ marginBottom: sectionGap }}>
                    <NotesComponent
                        notes={invoice.notes}
                        config={config.notes}
                        colors={config.colors}
                    />
                </div>
            )}

            {/* Footer */}
            {config.footer.enabled && (
                <FooterComponent
                    invoice={invoice}
                    config={config.footer}
                    notesConfig={config.notes}
                    colors={config.colors}
                    fonts={config.fonts}
                />
            )}

        </div>
    );
}
