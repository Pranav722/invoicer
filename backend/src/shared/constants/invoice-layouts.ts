/**
 * Invoice Layouts Catalog
 * 14 professional invoice templates
 */

import { InvoiceLayout } from '../types/invoice-layout.types';

export const invoiceLayouts: InvoiceLayout[] = [
    {
        id: 'classic-professional',
        name: 'Classic Professional',
        description: 'Traditional business invoice with clean layout',
        category: 'professional',
        templateFile: 'classic-professional.html',
        isPremium: false,
        features: ['Header logo', 'Itemized list', 'Payment terms', 'Signature line'],
        tags: ['traditional', 'professional', 'clean'],
        zones: {
            header: { columns: 12, alignment: 'center' },
            metadata: { columns: 6, alignment: 'right' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'right' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'side-by-side',
            totalsAlign: 'right'
        }
    },
    {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        description: 'Sleek minimalist design with bold typography',
        category: 'minimal',
        templateFile: 'modern-minimal.html',
        isPremium: false,
        features: ['Clean layout', 'Bold headings', 'Subtle colors', 'Modern fonts'],
        tags: ['minimal', 'modern', 'simple'],
        zones: {
            header: { columns: 8, alignment: 'left' },
            metadata: { columns: 4, alignment: 'right' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'right' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'stacked',
            totalsAlign: 'right'
        }
    },
    {
        id: 'corporate-blue',
        name: 'Corporate Blue',
        description: 'Professional corporate design with blue accents',
        category: 'corporate',
        templateFile: 'corporate-blue.html',
        isPremium: true,
        features: ['Blue theme', 'Professional header', 'Company branding', 'Formal layout'],
        tags: ['corporate', 'blue', 'professional'],
        zones: {
            header: { columns: 12, alignment: 'center' },
            metadata: { columns: 12, alignment: 'center' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'right' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'side-by-side',
            totalsAlign: 'full-width'
        }
    },
    {
        id: 'creative-bold',
        name: 'Creative Bold',
        description: 'Eye-catching design for creative professionals',
        category: 'creative',
        templateFile: 'creative-bold.html',
        isPremium: true,
        features: ['Colorful accents', 'Unique layout', 'Creative typography', 'Visual hierarchy'],
        tags: ['creative', 'bold', 'colorful'],
        zones: {
            header: { columns: 6, alignment: 'left' },
            metadata: { columns: 6, alignment: 'right' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'center' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'stacked',
            totalsAlign: 'center'
        }
    },
    {
        id: 'elegant-serif',
        name: 'Elegant Serif',
        description: 'Sophisticated design with serif typography',
        category: 'professional',
        templateFile: 'elegant-serif.html',
        isPremium: true,
        features: ['Serif fonts', 'Elegant spacing', 'Classic design', 'Premium feel'],
        tags: ['elegant', 'serif', 'classic'],
        zones: {
            header: { columns: 12, alignment: 'center' },
            metadata: { columns: 6, alignment: 'left' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'right' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'side-by-side',
            totalsAlign: 'right'
        }
    },
    {
        id: 'tech-startup',
        name: 'Tech Startup',
        description: 'Modern tech-focused design',
        category: 'modern',
        templateFile: 'tech-startup.html',
        isPremium: true,
        features: ['Tech-inspired', 'Modern colors', 'Clean grid', 'Contemporary'],
        tags: ['tech', 'startup', 'modern'],
        zones: {
            header: { columns: 8, alignment: 'left' },
            metadata: { columns: 4, alignment: 'right' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'right' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'stacked',
            totalsAlign: 'right'
        }
    },
    {
        id: 'simple-clean',
        name: 'Simple Clean',
        description: 'Ultra-minimal design for simplicity',
        category: 'minimal',
        templateFile: 'simple-clean.html',
        isPremium: false,
        features: ['Minimal design', 'Easy to read', 'No distractions', 'Fast loading'],
        tags: ['simple', 'clean', 'minimal'],
        zones: {
            header: { columns: 12, alignment: 'left' },
            metadata: { columns: 12, alignment: 'left' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'left' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'stacked',
            totalsAlign: 'left'
        }
    },
    {
        id: 'business-formal',
        name: 'Business Formal',
        description: 'Formal business invoice template',
        category: 'corporate',
        templateFile: 'business-formal.html',
        isPremium: true,
        features: ['Formal layout', 'Professional fonts', 'Business-ready', 'Traditional'],
        tags: ['business', 'formal', 'traditional'],
        zones: {
            header: { columns: 12, alignment: 'center' },
            metadata: { columns: 6, alignment: 'right' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'right' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'side-by-side',
            totalsAlign: 'right'
        }
    },
    {
        id: 'designer-portfolio',
        name: 'Designer Portfolio',
        description: 'Stylish template for design professionals',
        category: 'creative',
        templateFile: 'designer-portfolio.html',
        isPremium: true,
        features: ['Design-focused', 'Portfolio style', 'Creative layout', 'Artistic'],
        tags: ['designer', 'portfolio', 'creative'],
        zones: {
            header: { columns: 6, alignment: 'left' },
            metadata: { columns: 6, alignment: 'right' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'center' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'stacked',
            totalsAlign: 'center'
        }
    },
    {
        id: 'agency-modern',
        name: 'Agency Modern',
        description: 'Contemporary design for agencies',
        category: 'modern',
        templateFile: 'agency-modern.html',
        isPremium: true,
        features: ['Agency-style', 'Modern grid', 'Bold colors', 'Professional'],
        tags: ['agency', 'modern', 'professional'],
        zones: {
            header: { columns: 8, alignment: 'left' },
            metadata: { columns: 4, alignment: 'right' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'right' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'side-by-side',
            totalsAlign: 'right'
        }
    },
    {
        id: 'minimalist-black',
        name: 'Minimalist Black',
        description: 'Sleek black and white minimal design',
        category: 'minimal',
        templateFile: 'minimalist-black.html',
        isPremium: true,
        features: ['Monochrome', 'Ultra-minimal', 'High contrast', 'Modern'],
        tags: ['minimalist', 'monochrome', 'black'],
        zones: {
            header: { columns: 12, alignment: 'center' },
            metadata: { columns: 12, alignment: 'center' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'center' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'stacked',
            totalsAlign: 'center'
        }
    },
    {
        id: 'consultant-pro',
        name: 'Consultant Pro',
        description: 'Professional consulting invoice',
        category: 'professional',
        templateFile: 'consultant-pro.html',
        isPremium: true,
        features: ['Consulting-focused', 'Time tracking', 'Hourly rates', 'Professional'],
        tags: ['consultant', 'professional', 'hourly'],
        zones: {
            header: { columns: 12, alignment: 'left' },
            metadata: { columns: 6, alignment: 'right' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'right' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'side-by-side',
            totalsAlign: 'right'
        }
    },
    {
        id: 'freelancer-friendly',
        name: 'Freelancer Friendly',
        description: 'Perfect for freelancers and contractors',
        category: 'modern',
        templateFile: 'freelancer-friendly.html',
        isPremium: false,
        features: ['Freelancer-focused', 'Easy to use', 'Flexible layout', 'Modern'],
        tags: ['freelancer', 'flexible', 'modern'],
        zones: {
            header: { columns: 8, alignment: 'left' },
            metadata: { columns: 4, alignment: 'right' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'right' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'stacked',
            totalsAlign: 'right'
        }
    },
    {
        id: 'premium-executive',
        name: 'Premium Executive',
        description: 'High-end executive invoice template',
        category: 'corporate',
        templateFile: 'premium-executive.html',
        isPremium: true,
        features: ['Executive-level', 'Premium design', 'Luxury feel', 'High-end'],
        tags: ['premium', 'executive', 'luxury'],
        zones: {
            header: { columns: 12, alignment: 'center' },
            metadata: { columns: 12, alignment: 'center' },
            billing: { columns: 12, alignment: 'left' },
            items: { columns: 12, alignment: 'left' },
            totals: { columns: 12, alignment: 'right' },
            footer: { columns: 12, alignment: 'left' }
        },
        styles: {
            billingLayout: 'side-by-side',
            totalsAlign: 'full-width'
        }
    }
];

// Helper functions
export const getLayoutById = (id: string): InvoiceLayout | undefined => {
    return invoiceLayouts.find(layout => layout.id === id);
};

export const getLayoutsByCategory = (category: string): InvoiceLayout[] => {
    return invoiceLayouts.filter(layout => layout.category === category);
};

export const getFreeLayouts = (): InvoiceLayout[] => {
    return invoiceLayouts.filter(layout => !layout.isPremium);
};

export const getPremiumLayouts = (): InvoiceLayout[] => {
    return invoiceLayouts.filter(layout => layout.isPremium);
};
