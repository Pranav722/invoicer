/**
 * PDF Generation Utility
 * Uses html2pdf.js to generate PDF from HTML preview
 */

// Import will work after installing: npm install html2pdf.js
// @ts-ignore
import html2pdf from 'html2pdf.js';

export interface PDFOptions {
    filename?: string;
    quality?: number;
    format?: 'a4' | 'letter';
}

/**
 * Generate PDF from invoice preview HTML element
 */
export async function generateInvoicePDF(
    previewElementId: string = 'invoice-preview',
    options: PDFOptions = {}
): Promise<void> {
    const {
        filename = `invoice-${Date.now()}.pdf`,
        quality = 2,
        format = 'a4'
    } = options;

    const element = document.getElementById(previewElementId);

    if (!element) {
        throw new Error(`Element with id "${previewElementId}" not found`);
    }

    const opt: any = {
        margin: 10,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: quality, useCORS: true },
        jsPDF: { unit: 'mm', format, orientation: 'portrait' }
    };

    try {
        await html2pdf().from(element).set(opt).save();
        return Promise.resolve();
    } catch (error) {
        console.error('PDF generation failed:', error);
        throw error;
    }
}



/**
 * Simplified API for quick usage
 */
export const exportToPDF = (invoiceNumber: string = '001') => {
    return generateInvoicePDF('invoice-preview', {
        filename: `Invoice-${invoiceNumber}.pdf`,
        quality: 2,
        format: 'a4'
    });
};
