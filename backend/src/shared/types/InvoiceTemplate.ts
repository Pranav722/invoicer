// ============================================
// TEMPLATE CONFIGURATION TYPES
// ============================================

export interface FontConfig {
    family: string;
    weight: number;
    size: number;
    color: string;
    letterSpacing?: number;
    lineHeight?: number;
}

export interface ColorPalette {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
    background: string;
    border: string;
    tableBg: string;
    tableHeaderBg: string;
    tableHeaderText: string;
}

export interface PageLayout {
    pageSize: 'A4' | 'Letter';
    pageMargin: number;
    contentMaxWidth: number;
    sectionGap: number;
    alignment: 'left' | 'center' | 'right';
}

export interface BorderConfig {
    width: number;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
}

// ============================================
// HEADER CONFIGURATION
// ============================================

export interface HeaderConfig {
    enabled: boolean;
    layout: 'logo-left' | 'logo-center' | 'logo-right' | 'split';
    backgroundColor?: string;
    padding: number;
    borderBottom?: BorderConfig;

    logo: {
        enabled: boolean;
        position: 'top-left' | 'top-center' | 'top-right';
        maxWidth: number;
        maxHeight: number;
    };

    companyInfo: {
        position: 'left' | 'center' | 'right';
        alignment: 'left' | 'center' | 'right';
        showAddress: boolean;
        showContact: boolean;
        fontSize: number;
    };

    invoiceMeta: {
        position: 'left' | 'right';
        alignment: 'left' | 'right';
        showNumber: boolean;
        showDate: boolean;
        showDueDate: boolean;
        labelStyle: 'bold' | 'muted' | 'uppercase';
    };
}

// ============================================
// RECIPIENT CONFIGURATION
// ============================================

export interface RecipientConfig {
    enabled: boolean;
    layout: 'single-column' | 'two-column';
    labelStyle: 'bold' | 'pill' | 'uppercase';
    showShipTo: boolean;
    fontSize: number;
    gap: number;
}

// ============================================
// TABLE CONFIGURATION
// ============================================

export interface TableConfig {
    style: 'classic' | 'modern' | 'minimal' | 'striped' | 'bordered';
    borderStyle: 'all' | 'horizontal' | 'none';
    borderColor: string;
    borderWidth: number;

    header: {
        backgroundColor: string;
        textColor: string;
        fontSize: number;
        fontWeight: number;
        textTransform: 'none' | 'uppercase';
        padding: number;
        alignment: 'left' | 'center' | 'right';
    };

    rows: {
        backgroundColor: string;
        alternateRowBg?: string;
        textColor: string;
        fontSize: number;
        padding: number;
        hoverEffect: boolean;
    };

    columns: {
        description: ColumnConfig;
        quantity: ColumnConfig;
        rate: ColumnConfig;
        amount: ColumnConfig;
    };

    totals: {
        position: 'right' | 'full-width';
        backgroundColor?: string;
        labelWeight: number;
        valueWeight: number;
        highlightTotal: boolean;
        totalFontSize: number;
    };
}

export interface ColumnConfig {
    width: string;
    alignment: 'left' | 'center' | 'right';
}

// ============================================
// NOTES & FOOTER CONFIGURATION
// ============================================

export interface NotesConfig {
    enabled: boolean;
    position: 'before-footer' | 'in-footer';
    fontSize: number;
    color: string;
    backgroundColor?: string;
    padding: number;
}

export interface FooterConfig {
    enabled: boolean;
    layout: 'single-column' | 'two-column' | 'centered';
    backgroundColor?: string;
    borderTop?: BorderConfig;
    padding: number;

    paymentInfo: {
        enabled: boolean;
        position: 'left' | 'center' | 'right';
        showBankDetails: boolean;
        fontSize: number;
    };

    thankYou: {
        enabled: boolean;
        text: string;
        fontSize: number;
        fontWeight: number;
        color: string;
    };
}

// ============================================
// COMPLETE TEMPLATE CONFIGURATION
// ============================================

export interface TemplateConfig {
    name: string;
    description?: string;

    fonts: {
        heading: FontConfig;
        body: FontConfig;
        label: FontConfig;
    };

    colors: ColorPalette;
    layout: PageLayout;
    header: HeaderConfig;
    recipient: RecipientConfig;
    table: TableConfig;
    notes: NotesConfig;
    footer: FooterConfig;
}

// ============================================
// INVOICE TEMPLATE DOCUMENT
// ============================================

export interface InvoiceTemplate {
    _id: string;
    tenantId?: string;

    name: string;
    type: 'preset' | 'custom';
    isDefault: boolean;
    createdBy?: string;
    isPublic: boolean;

    config: TemplateConfig;

    usageCount: number;
    lastUsedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface CreateTemplateRequest {
    name: string;
    config: TemplateConfig;
    isDefault?: boolean;
    isPublic?: boolean;
}

export interface UpdateTemplateRequest {
    name?: string;
    config?: Partial<TemplateConfig>;
    isDefault?: boolean;
    isPublic?: boolean;
}

export interface DuplicateTemplateRequest {
    name: string;
    modifications?: Record<string, any>;
}
