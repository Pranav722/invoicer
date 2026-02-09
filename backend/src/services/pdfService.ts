import puppeteer, { Browser, Page } from 'puppeteer';
import { Invoice } from '../models/Invoice';
import { Tenant } from '../models/Tenant';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import path from 'path';
import fs from 'fs/promises';

interface PDFGenerationOptions {
    watermark?: boolean;
    layout?: string;
    customizations?: any;
}

export class PDFService {
    private browser: Browser | null = null;

    /**
     * Initialize Puppeteer browser
     */
    async initBrowser(): Promise<void> {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            logger.info('Puppeteer browser initialized');
        }
    }

    /**
     * Close browser
     */
    async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            logger.info('Puppeteer browser closed');
        }
    }

    /**
     * Generate PDF for invoice
     */
    async generatePDF(
        invoiceId: string,
        options: PDFGenerationOptions = {}
    ): Promise<Buffer> {
        try {
            await this.initBrowser();

            // Fetch invoice data
            const invoice = await Invoice.findById(invoiceId)
                .populate('vendorId')
                .populate('createdBy');

            if (!invoice) {
                throw new AppError('Invoice not found', 404, 'NOT_FOUND');
            }

            const tenant = await Tenant.findById(invoice.tenantId);

            if (!tenant) {
                throw new AppError('Tenant not found', 404, 'NOT_FOUND');
            }

            // Generate HTML
            const html = this.generateHTML(invoice, tenant, options);

            // Create new page
            const page = await this.browser!.newPage();

            // Set content
            await page.setContent(html, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0',
                    right: '0',
                    bottom: '0',
                    left: '0'
                }
            });

            await page.close();

            logger.info(`PDF generated for invoice ${invoice.invoiceNumber}`);

            return Buffer.from(pdfBuffer);
        } catch (error: any) {
            logger.error('PDF generation error:', error);
            throw new AppError(
                `PDF generation failed: ${error.message}`,
                500,
                'PDF_GENERATION_ERROR'
            );
        }
    }

    /**
     * Generate HTML for PDF
     */
    private generateHTML(invoice: any, tenant: any, options: PDFGenerationOptions): string {
        const { watermark = false, layout = 'modern_minimal' } = options;

        // Calculate amounts
        const subtotal = invoice.subtotal || 0;
        const taxAmount = invoice.taxAmount || 0;
        const total = invoice.total || 0;

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #1F2937;
      line-height: 1.6;
      padding: 40px;
      position: relative;
    }

    ${watermark ? `
    body::after {
      content: 'SAMPLE';
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: 900;
      color: rgba(0, 0, 0, 0.05);
      z-index: 1000;
      pointer-events: none;
    }
    ` : ''}

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #E5E7EB;
    }

    .company-info {
      flex: 1;
    }

    .company-name {
      font-size: 28px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
    }

    .company-details {
      font-size: 14px;
      color: #6B7280;
      line-height: 1.8;
    }

    .invoice-title {
      text-align: right;
    }

    .invoice-title h1 {
      font-size: 36px;
      font-weight: 700;
      color: #3B82F6;
      margin-bottom: 8px;
    }

    .invoice-number {
      font-size: 14px;
      color: #6B7280;
    }

    .invoice-meta {
      display: flex;
      gap: 40px;
      margin-bottom: 40px;
    }

    .bill-to, .invoice-details {
      flex: 1;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #9CA3AF;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }

    .client-name {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 14px;
    }

    .detail-label {
      color: #6B7280;
    }

    .detail-value {
      font-weight: 500;
      color: #111827;
    }

    .items-table {
      width: 100%;
      margin-bottom: 30px;
      border-collapse: collapse;
    }

    .items-table thead {
      background: #F9FAFB;
    }

    .items-table th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #6B7280;
      border-bottom: 2px solid #E5E7EB;
    }

    .items-table th:last-child {
      text-align: right;
    }

    .items-table td {
      padding: 12px;
      font-size: 14px;
      border-bottom: 1px solid #F3F4F6;
    }

    .items-table td:last-child {
      text-align: right;
      font-weight: 500;
    }

    .description {
      color: #111827;
      font-weight: 500;
    }

    .totals {
      margin-left: auto;
      width: 300px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .total-row.subtotal, .total-row.tax {
      color: #6B7280;
    }

    .total-row.grand-total {
      border-top: 2px solid #E5E7EB;
      margin-top: 8px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 700;
      color: #111827;
    }

    .ai-content {
      margin: 30px 0;
      padding: 20px;
      background: #F9FAFB;
      border-left: 4px solid #3B82F6;
      font-size: 14px;
      line-height: 1.8;
      color: #374151;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 12px;
      color: #6B7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <div class="company-name">${tenant.companyName}</div>
        <div class="company-details">
          ${tenant.branding?.companyAddress || ''}<br>
          ${tenant.branding?.phone || ''}<br>
          ${tenant.branding?.website || ''}
        </div>
      </div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <div class="invoice-number">#${invoice.invoiceNumber}</div>
      </div>
    </div>

    <!-- AI Header -->
    ${invoice.aiContent?.header ? `
    <div class="ai-content">
      ${invoice.aiContent.header}
    </div>
    ` : ''}

    <!-- Invoice Meta -->
    <div class="invoice-meta">
      <div class="bill-to">
        <div class="section-title">Bill To</div>
        <div class="client-name">${invoice.vendorSnapshot.companyName}</div>
        <div class="company-details">
          ${invoice.vendorSnapshot.contactPerson || ''}<br>
          ${invoice.vendorSnapshot.email || ''}<br>
          ${invoice.vendorSnapshot.address?.street || ''}
        </div>
      </div>
      <div class="invoice-details">
        <div class="section-title">Invoice Details</div>
        <div class="detail-row">
          <span class="detail-label">Issue Date:</span>
          <span class="detail-value">${new Date(invoice.issueDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Due Date:</span>
          <span class="detail-value">${new Date(invoice.dueDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="detail-value" style="text-transform: uppercase;">${invoice.status}</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Quantity</th>
          <th style="text-align: right;">Rate</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item: any) => `
          <tr>
            <td class="description">${item.description}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${invoice.currency} ${item.rate.toFixed(2)}</td>
            <td style="text-align: right;">${invoice.currency} ${item.amount.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row subtotal">
        <span>Subtotal:</span>
        <span>${invoice.currency} ${subtotal.toFixed(2)}</span>
      </div>
      <div class="total-row tax">
        <span>Tax:</span>
        <span>${invoice.currency} ${taxAmount.toFixed(2)}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total:</span>
        <span>${invoice.currency} ${total.toFixed(2)}</span>
      </div>
    </div>

    <!-- AI Footer -->
    ${invoice.aiContent?.footer ? `
    <div class="ai-content">
      ${invoice.aiContent.footer}
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for your business!</p>
      <p>${tenant.branding?.companyAddress || ''} | ${tenant.branding?.phone || ''}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    }

    /**
     * Apply watermark to PDF (for free tier)
     */
    async applyWatermark(pdfBuffer: Buffer): Promise<Buffer> {
        // Watermark is applied via CSS in HTML generation
        // This method is placeholder for future advanced watermarking
        return pdfBuffer;
    }

    /**
     * Save PDF to local storage (temporary)
     */
    async savePDF(pdfBuffer: Buffer, filename: string): Promise<string> {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'pdfs');

        // Create directory if it doesn't exist
        await fs.mkdir(uploadsDir, { recursive: true });

        const filepath = path.join(uploadsDir, filename);
        await fs.writeFile(filepath, pdfBuffer);

        logger.info(`PDF saved locally: ${filepath}`);

        return filepath;
    }
}

// Export singleton instance
export const pdfService = new PDFService();
