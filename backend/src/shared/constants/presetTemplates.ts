import { TemplateConfig } from '../types/InvoiceTemplate';

// ============================================
// PRESET TEMPLATE CONFIGURATIONS
// ============================================

export const PRESET_TEMPLATES: Record<string, TemplateConfig> = {

    // ====================
    // PROFESSIONAL CATEGORY
    // ====================

    CLASSIC_PROFESSIONAL: {
        name: 'Classic Professional',
        description: 'Traditional business invoice with clean layout',
        fonts: {
            heading: {
                family: 'Georgia',
                weight: 700,
                size: 28,
                color: '#1a1a1a'
            },
            body: {
                family: 'Arial',
                weight: 400,
                size: 14,
                color: '#374151'
            },
            label: {
                family: 'Arial',
                weight: 600,
                size: 12,
                color: '#6b7280'
            }
        },
        colors: {
            primary: '#1e3a8a',
            secondary: '#3b82f6',
            accent: '#60a5fa',
            text: '#1f2937',
            textMuted: '#6b7280',
            background: '#ffffff',
            border: '#d1d5db',
            tableBg: '#f9fafb',
            tableHeaderBg: '#f3f4f6',
            tableHeaderText: '#374151'
        },
        layout: {
            pageSize: 'A4',
            pageMargin: 40,
            contentMaxWidth: 750,
            sectionGap: 32,
            alignment: 'left'
        },
        header: {
            enabled: true,
            layout: 'split',
            padding: 24,
            borderBottom: {
                width: 2,
                color: '#1e3a8a',
                style: 'solid'
            },
            logo: {
                enabled: true,
                position: 'top-left',
                maxWidth: 150,
                maxHeight: 60
            },
            companyInfo: {
                position: 'left',
                alignment: 'left',
                showAddress: true,
                showContact: true,
                fontSize: 13
            },
            invoiceMeta: {
                position: 'right',
                alignment: 'right',
                showNumber: true,
                showDate: true,
                showDueDate: true,
                labelStyle: 'bold'
            }
        },
        recipient: {
            enabled: true,
            layout: 'two-column',
            labelStyle: 'bold',
            showShipTo: false,
            fontSize: 14,
            gap: 24
        },
        table: {
            style: 'classic',
            borderStyle: 'all',
            borderColor: '#d1d5db',
            borderWidth: 1,
            header: {
                backgroundColor: '#f3f4f6',
                textColor: '#374151',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'none',
                padding: 12,
                alignment: 'left'
            },
            rows: {
                backgroundColor: '#ffffff',
                textColor: '#1f2937',
                fontSize: 14,
                padding: 12,
                hoverEffect: false
            },
            columns: {
                description: { width: '50%', alignment: 'left' },
                quantity: { width: '15%', alignment: 'center' },
                rate: { width: '17.5%', alignment: 'right' },
                amount: { width: '17.5%', alignment: 'right' }
            },
            totals: {
                position: 'right',
                labelWeight: 400,
                valueWeight: 600,
                highlightTotal: true,
                totalFontSize: 18
            }
        },
        notes: {
            enabled: true,
            position: 'before-footer',
            fontSize: 13,
            color: '#6b7280',
            padding: 16
        },
        footer: {
            enabled: true,
            layout: 'two-column',
            borderTop: {
                width: 1,
                color: '#d1d5db',
                style: 'solid'
            },
            padding: 20,
            paymentInfo: {
                enabled: true,
                position: 'left',
                showBankDetails: true,
                fontSize: 13
            },
            thankYou: {
                enabled: true,
                text: 'Thank you for your business!',
                fontSize: 14,
                fontWeight: 600,
                color: '#1e3a8a'
            }
        }
    },

    MODERN_CORPORATE: {
        name: 'Modern Corporate',
        description: 'Sleek modern design with bold colors',
        fonts: {
            heading: {
                family: 'Inter',
                weight: 700,
                size: 32,
                color: '#1a1a1a',
                letterSpacing: -0.02
            },
            body: {
                family: 'Inter',
                weight: 400,
                size: 14,
                color: '#374151'
            },
            label: {
                family: 'Inter',
                weight: 600,
                size: 11,
                color: '#6b7280'
            }
        },
        colors: {
            primary: '#4f46e5',
            secondary: '#8b5cf6',
            accent: '#06b6d4',
            text: '#1f2937',
            textMuted: '#6b7280',
            background: '#ffffff',
            border: '#e5e7eb',
            tableBg: '#f9fafb',
            tableHeaderBg: '#4f46e5',
            tableHeaderText: '#ffffff'
        },
        layout: {
            pageSize: 'A4',
            pageMargin: 40,
            contentMaxWidth: 750,
            sectionGap: 40,
            alignment: 'left'
        },
        header: {
            enabled: true,
            layout: 'split',
            padding: 32,
            borderBottom: {
                width: 3,
                color: '#4f46e5',
                style: 'solid'
            },
            logo: {
                enabled: true,
                position: 'top-left',
                maxWidth: 160,
                maxHeight: 70
            },
            companyInfo: {
                position: 'left',
                alignment: 'left',
                showAddress: true,
                showContact: true,
                fontSize: 14
            },
            invoiceMeta: {
                position: 'right',
                alignment: 'right',
                showNumber: true,
                showDate: true,
                showDueDate: true,
                labelStyle: 'uppercase'
            }
        },
        recipient: {
            enabled: true,
            layout: 'two-column',
            labelStyle: 'uppercase',
            showShipTo: false,
            fontSize: 14,
            gap: 32
        },
        table: {
            style: 'modern',
            borderStyle: 'horizontal',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            header: {
                backgroundColor: '#4f46e5',
                textColor: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                textTransform: 'uppercase',
                padding: 14,
                alignment: 'left'
            },
            rows: {
                backgroundColor: '#ffffff',
                alternateRowBg: '#f9fafb',
                textColor: '#1f2937',
                fontSize: 14,
                padding: 14,
                hoverEffect: true
            },
            columns: {
                description: { width: '50%', alignment: 'left' },
                quantity: { width: '15%', alignment: 'center' },
                rate: { width: '17.5%', alignment: 'right' },
                amount: { width: '17.5%', alignment: 'right' }
            },
            totals: {
                position: 'right',
                backgroundColor: '#f9fafb',
                labelWeight: 500,
                valueWeight: 700,
                highlightTotal: true,
                totalFontSize: 20
            }
        },
        notes: {
            enabled: true,
            position: 'before-footer',
            fontSize: 13,
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            padding: 20
        },
        footer: {
            enabled: true,
            layout: 'centered',
            backgroundColor: '#f9fafb',
            padding: 24,
            paymentInfo: {
                enabled: true,
                position: 'center',
                showBankDetails: true,
                fontSize: 13
            },
            thankYou: {
                enabled: true,
                text: 'Thank you for choosing us!',
                fontSize: 16,
                fontWeight: 700,
                color: '#4f46e5'
            }
        }
    },

    // ====================
    // CREATIVE CATEGORY
    // ====================

    DESIGNER_BOLD: {
        name: 'Designer Bold',
        description: 'Bold creative design for agencies',
        fonts: {
            heading: {
                family: 'Montserrat',
                weight: 800,
                size: 36,
                color: '#000000',
                letterSpacing: -0.03
            },
            body: {
                family: 'Open Sans',
                weight: 400,
                size: 14,
                color: '#1f2937'
            },
            label: {
                family: 'Montserrat',
                weight: 700,
                size: 11,
                color: '#6b7280'
            }
        },
        colors: {
            primary: '#FF6B35',
            secondary: '#F7931E',
            accent: '#FDC500',
            text: '#000000',
            textMuted: '#6b7280',
            background: '#ffffff',
            border: '#e5e7eb',
            tableBg: '#ffffff',
            tableHeaderBg: '#000000',
            tableHeaderText: '#ffffff'
        },
        layout: {
            pageSize: 'A4',
            pageMargin: 50,
            contentMaxWidth: 700,
            sectionGap: 48,
            alignment: 'left'
        },
        header: {
            enabled: true,
            layout: 'logo-center',
            backgroundColor: '#000000',
            padding: 40,
            logo: {
                enabled: true,
                position: 'top-center',
                maxWidth: 200,
                maxHeight: 80
            },
            companyInfo: {
                position: 'center',
                alignment: 'center',
                showAddress: true,
                showContact: true,
                fontSize: 14
            },
            invoiceMeta: {
                position: 'right',
                alignment: 'right',
                showNumber: true,
                showDate: true,
                showDueDate: true,
                labelStyle: 'uppercase'
            }
        },
        recipient: {
            enabled: true,
            layout: 'single-column',
            labelStyle: 'pill',
            showShipTo: false,
            fontSize: 15,
            gap: 24
        },
        table: {
            style: 'minimal',
            borderStyle: 'horizontal',
            borderColor: '#000000',
            borderWidth: 2,
            header: {
                backgroundColor: '#000000',
                textColor: '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: 16,
                alignment: 'left'
            },
            rows: {
                backgroundColor: '#ffffff',
                textColor: '#000000',
                fontSize: 15,
                padding: 16,
                hoverEffect: false
            },
            columns: {
                description: { width: '50%', alignment: 'left' },
                quantity: { width: '15%', alignment: 'center' },
                rate: { width: '17.5%', alignment: 'right' },
                amount: { width: '17.5%', alignment: 'right' }
            },
            totals: {
                position: 'full-width',
                backgroundColor: '#FDC500',
                labelWeight: 700,
                valueWeight: 800,
                highlightTotal: true,
                totalFontSize: 24
            }
        },
        notes: {
            enabled: true,
            position: 'in-footer',
            fontSize: 13,
            color: '#6b7280',
            padding: 0
        },
        footer: {
            enabled: true,
            layout: 'centered',
            borderTop: {
                width: 3,
                color: '#FF6B35',
                style: 'solid'
            },
            padding: 32,
            paymentInfo: {
                enabled: true,
                position: 'center',
                showBankDetails: true,
                fontSize: 14
            },
            thankYou: {
                enabled: true,
                text: "Let's create something amazing!",
                fontSize: 18,
                fontWeight: 800,
                color: '#FF6B35'
            }
        }
    },

    // ====================
    // TECHNICAL CATEGORY
    // ====================

    TECH_STARTUP: {
        name: 'Tech Startup',
        description: 'Modern tech-focused minimal design',
        fonts: {
            heading: {
                family: 'Roboto',
                weight: 500,
                size: 28,
                color: '#0f172a',
                letterSpacing: -0.01
            },
            body: {
                family: 'Roboto',
                weight: 400,
                size: 14,
                color: '#475569'
            },
            label: {
                family: 'Roboto Mono',
                weight: 500,
                size: 11,
                color: '#64748b'
            }
        },
        colors: {
            primary: '#0ea5e9',
            secondary: '#06b6d4',
            accent: '#22d3ee',
            text: '#0f172a',
            textMuted: '#64748b',
            background: '#ffffff',
            border: '#e2e8f0',
            tableBg: '#f8fafc',
            tableHeaderBg: '#f1f5f9',
            tableHeaderText: '#475569'
        },
        layout: {
            pageSize: 'Letter',
            pageMargin: 40,
            contentMaxWidth: 750,
            sectionGap: 32,
            alignment: 'left'
        },
        header: {
            enabled: true,
            layout: 'split',
            padding: 24,
            borderBottom: {
                width: 1,
                color: '#e2e8f0',
                style: 'dashed'
            },
            logo: {
                enabled: true,
                position: 'top-left',
                maxWidth: 140,
                maxHeight: 50
            },
            companyInfo: {
                position: 'left',
                alignment: 'left',
                showAddress: true,
                showContact: true,
                fontSize: 13
            },
            invoiceMeta: {
                position: 'right',
                alignment: 'right',
                showNumber: true,
                showDate: true,
                showDueDate: true,
                labelStyle: 'muted'
            }
        },
        recipient: {
            enabled: true,
            layout: 'two-column',
            labelStyle: 'pill',
            showShipTo: false,
            fontSize: 14,
            gap: 24
        },
        table: {
            style: 'minimal',
            borderStyle: 'horizontal',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            header: {
                backgroundColor: '#f1f5f9',
                textColor: '#475569',
                fontSize: 12,
                fontWeight: 500,
                textTransform: 'uppercase',
                padding: 12,
                alignment: 'left'
            },
            rows: {
                backgroundColor: '#ffffff',
                textColor: '#0f172a',
                fontSize: 14,
                padding: 12,
                hoverEffect: false
            },
            columns: {
                description: { width: '45%', alignment: 'left' },
                quantity: { width: '15%', alignment: 'center' },
                rate: { width: '20%', alignment: 'right' },
                amount: { width: '20%', alignment: 'right' }
            },
            totals: {
                position: 'right',
                labelWeight: 400,
                valueWeight: 500,
                highlightTotal: true,
                totalFontSize: 16
            }
        },
        notes: {
            enabled: true,
            position: 'before-footer',
            fontSize: 12,
            color: '#64748b',
            padding: 16
        },
        footer: {
            enabled: true,
            layout: 'two-column',
            backgroundColor: '#f8fafc',
            borderTop: {
                width: 1,
                color: '#e2e8f0',
                style: 'solid'
            },
            padding: 20,
            paymentInfo: {
                enabled: true,
                position: 'left',
                showBankDetails: true,
                fontSize: 12
            },
            thankYou: {
                enabled: true,
                text: 'Questions? hello@startup.com',
                fontSize: 13,
                fontWeight: 400,
                color: '#0ea5e9'
            }
        }
    },

    //... More templates would continue here (MINIMAL_CLEAN, EXECUTIVE_FORMAL, etc.)
    // For brevity, showing 4 complete examples representing each category
};
