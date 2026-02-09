export type InvoiceLayout = 'classic-top' | 'sidebar-left' | 'sidebar-right' | 'minimal-centered' | 'banner-header' | 'split-vertical';
export type ColorTheme = 'corporate-blue' | 'modern-slate' | 'creative-purple' | 'finance-green' | 'warm-orange' | 'monochrome' | 'luxury-gold' | 'nature-teal' | 'ocean-gradient' | 'midnight-neon';
export type TableVariant = 'simple-border' | 'striped' | 'floating-card' | 'minimal-lines' | 'bold-header' | 'compact-grid';

export interface DesignConfig {
    id: string;
    name: string;
    description: string;
    layout: InvoiceLayout;
    theme: {
        primary: string; // Main accent color (buttons, headers)
        secondary: string; // Subtle accents
        background: string; // Page background
        text: string; // Main text color
        surface: string; // Card/Container background
    };
    typography: {
        fontFamily: string; // Tailwind class (e.g., font-sans, font-serif, font-mono)
        headerCase: 'uppercase' | 'capitalize' | 'lowercase';
        fontSize: 'compact' | 'standard' | 'large';
    };
    components: {
        borderRadius: string; // e.g., rounded-none, rounded-lg, rounded-3xl
        shadow: string; // e.g., shadow-none, shadow-xl
        logoPosition: 'left' | 'center' | 'right';
    };
    tableStyles: TableVariant;
}
