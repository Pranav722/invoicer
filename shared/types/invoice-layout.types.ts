/**
 * Invoice Layout Types
 * Shared type definitions for invoice templates across frontend and backend
 */

export type LayoutCategory = 'professional' | 'creative' | 'minimal' | 'corporate' | 'modern';

export interface LayoutZone {
    columns: number; // Grid columns (1-12)
    alignment: 'left' | 'center' | 'right';
}

export interface LayoutStyles {
    billingLayout: 'stacked' | 'side-by-side';
    totalsAlign: 'left' | 'center' | 'right' | 'full-width';
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
