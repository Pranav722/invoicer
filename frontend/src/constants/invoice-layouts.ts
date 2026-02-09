
import type { InvoiceLayout } from '../types/invoice-layout.types';

export const invoiceLayouts: InvoiceLayout[] = [
    {
        id: 'modern-clean',
        name: 'Modern Clean',
        description: 'A clean, minimalist design perfect for tech companies and startups.',
        category: 'modern',
        templateFile: 'modern-clean.hbs',
        isPremium: false,
        features: ['Clean typography', 'Full-width header', 'Accent colors'],
        styles: {
            billingLayout: 'side-by-side',
            totalsAlign: 'right'
        },
        zones: {
            header: { columns: 12, alignment: 'left' },
            metadata: { columns: 4, alignment: 'right' }
        }
    },
    {
        id: 'classic-serif',
        name: 'Classic Serif',
        description: 'Traditional and elegant, ideal for legal and consulting firms.',
        category: 'professional',
        templateFile: 'classic-serif.hbs',
        isPremium: false,
        features: ['Serif typography', 'Bordered tables', 'Compact layout'],
        styles: {
            billingLayout: 'stacked',
            totalsAlign: 'right'
        },
        zones: {
            header: { columns: 12, alignment: 'center' },
            metadata: { columns: 12, alignment: 'center' }
        }
    },
    {
        id: 'creative-bold',
        name: 'Creative Bold',
        description: 'Stand out with bold colors and unique layout structure.',
        category: 'creative',
        templateFile: 'creative-bold.hbs',
        isPremium: true,
        features: ['Bold headers', 'Background patterns', 'Custom fonts'],
        styles: {
            billingLayout: 'side-by-side',
            totalsAlign: 'full-width'
        },
        zones: {
            header: { columns: 6, alignment: 'left' },
            metadata: { columns: 6, alignment: 'right' }
        }
    },
    {
        id: 'minimal-mono',
        name: 'Minimal Mono',
        description: 'Monospaced font design for code-heavy or technical invoices.',
        category: 'minimal',
        templateFile: 'minimal-mono.hbs',
        isPremium: false,
        features: ['Monospace font', 'Grid lines', 'Data-focused'],
        styles: {
            billingLayout: 'side-by-side',
            totalsAlign: 'right'
        },
        zones: {
            header: { columns: 12, alignment: 'left' },
            metadata: { columns: 12, alignment: 'left' }
        }
    }
];

export const getLayoutsByCategory = (category: string) => {
    if (category === 'all') return invoiceLayouts;
    return invoiceLayouts.filter(layout => layout.category === category);
};

export const getLayoutById = (id: string) => {
    return invoiceLayouts.find(layout => layout.id === id);
};
