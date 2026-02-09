/**
 * Invoice Layout Types
 * Shared type definitions for invoice templates across frontend and backend
 */

export type LayoutCategory = 'professional' | 'creative' | 'minimal' | 'corporate' | 'modern';

export interface LayoutZone {
    columns: number; // Grid columns (1-12)
    alignment: 'left' | 'center' | 'right';
    offset?: number;
    order?: number;
}

export interface LayoutStyles {
    billingLayout: 'stacked' | 'side-by-side';
    totalsAlign: 'left' | 'center' | 'right' | 'full-width';
    headerAlign?: 'left' | 'center' | 'right' | 'split';
    borderStyle?: 'none' | 'bold' | 'minimal';
    footerColumns?: number;
}

export type ZoneConfig = LayoutZone;

export interface RenderOptions {
    watermark?: boolean;
    watermarkText?: string;
    customCSS?: string;
}

export interface InvoiceComponent {
    metadata: {
        invoiceNumber: string;
        issueDate: string | Date;
        dueDate: string | Date;
        poNumber?: string;
    };
    company: {
        name: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            postalCode?: string;
            country?: string;
        };
        contact?: {
            email?: string;
            phone?: string;
        };
    };
    logo?: {
        url: string;
        width: number;
        height: number;
    };
    billing: {
        billTo: {
            name: string;
            companyName?: string;
            email?: string;
            address?: {
                street?: string;
                city?: string;
                state?: string;
                postalCode?: string;
                country?: string;
            };
        };
        shipTo?: {
            name: string;
            companyName?: string;
            address?: {
                street?: string;
                city?: string;
                state?: string;
                postalCode?: string;
                country?: string;
            };
        };
    };
    items: Array<{
        description: string;
        quantity: number;
        rate: number;
        amount: number;
    }>;
    totals: {
        subtotal: number;
        discount?: number;
        taxAmount?: number;
        taxRate?: number;
        shipping?: number;
        total: number;
    };
    footer: {
        terms?: string;
        notes?: string;
        paymentInstructions?: string;
    };
}

export interface InvoiceLayout {
    id: string;
    name: string;
    description: string;
    category: LayoutCategory;
    previewImage?: string;
    templateFile: string; // Backend template filename
    isPremium: boolean;
    features: string[];
    tags?: string[]; // Optional tags for filtering
    zones: {
        header: LayoutZone;
        metadata: LayoutZone;
        billing: LayoutZone;
        items: LayoutZone & { order?: number }; // Items usually don't have columns/offset like others but need order
        totals: LayoutZone;
        footer: LayoutZone;
    };
    styles: LayoutStyles;
}

export interface LayoutTheme {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    headerStyle: 'bold' | 'light' | 'modern' | 'classic';
}
