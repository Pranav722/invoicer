import {
    InvoiceLayout,
    InvoiceComponent,
    ZoneConfig,
    RenderOptions
} from '../types/invoice-layout.types';

/**
 * Invoice Layout Generator
 * Generates HTML from layout configuration and invoice data
 */
export class InvoiceLayoutGenerator {
    /**
     * Generate complete invoice HTML
     */
    static generateHTML(
        layout: InvoiceLayout,
        data: InvoiceComponent,
        options: RenderOptions = {}
    ): string {
        const { zones, styles } = layout;

        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${data.metadata.invoiceNumber}</title>
          ${this.generateStyles(layout, options)}
        </head>
        <body>
          <div class="invoice-container layout-${layout.id}">
            ${this.renderZone('header', zones.header, data, layout)}
            ${this.renderZone('metadata', zones.metadata, data, layout)}
            ${this.renderZone('billing', zones.billing, data, layout)}
            ${this.renderZone('items', zones.items, data, layout)}
            ${this.renderZone('totals', zones.totals, data, layout)}
            ${this.renderZone('footer', zones.footer, data, layout)}
            
            ${options.watermark ? this.renderWatermark(options.watermarkText) : ''}
          </div>
        </body>
      </html>
    `;
    }

    /**
     * Generate CSS styles
     */
    private static generateStyles(layout: InvoiceLayout, options: RenderOptions): string {
        return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #111827;
          line-height: 1.6;
        }

        .invoice-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px;
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
          position: relative;
        }

        .zone {
          grid-column: span var(--columns);
          ${layout.styles.borderStyle === 'bold' ? 'border: 2px solid #e5e7eb; padding: 16px;' : ''}
          ${layout.styles.borderStyle === 'minimal' ? 'border-bottom: 1px solid #e5e7eb; padding-bottom: 16px;' : ''}
        }

        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }

        /* Zone specific styles */
        .zone-header {
          --columns: ${layout.zones.header.columns};
          ${layout.zones.header.offset ? `grid-column-start: ${layout.zones.header.offset + 1};` : ''}
          order: ${layout.zones.header.order || 1};
        }

        .zone-metadata {
          --columns: ${layout.zones.metadata.columns};
          ${layout.zones.metadata.offset ? `grid-column-start: ${layout.zones.metadata.offset + 1};` : ''}
          order: ${layout.zones.metadata.order || 2};
        }

        .zone-billing {
          --columns: ${layout.zones.billing.columns};
          ${layout.zones.billing.offset ? `grid-column-start: ${layout.zones.billing.offset + 1};` : ''}
          order: ${layout.zones.billing.order || 3};
        }

        .zone-items {
          --columns: 12;
          order: ${layout.zones.items.order || 4};
        }

        .zone-totals {
          --columns: ${layout.zones.totals.columns};
          ${layout.zones.totals.offset ? `grid-column-start: ${layout.zones.totals.offset + 1};` : ''}
          order: ${layout.zones.totals.order || 5};
        }

        .zone-footer {
          --columns: ${layout.zones.footer.columns};
          ${layout.zones.footer.offset ? `grid-column-start: ${layout.zones.footer.offset + 1};` : ''}
          order: ${layout.zones.footer.order || 6};
        }

        /* Header styles */
        .header-content {
          display: flex;
          ${layout.styles.headerAlign === 'center' ? 'justify-content: center; flex-direction: column; align-items: center;' : ''}
          ${layout.styles.headerAlign === 'right' ? 'justify-content: flex-end;' : ''}
          ${layout.styles.headerAlign === 'split' ? 'justify-content: space-between;' : ''}
          gap: 16px;
        }

        .company-name {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .company-info {
          font-size: 14px;
          color: #6b7280;
        }

        /* Metadata styles */
        .invoice-title {
          font-size: 32px;
          font-weight: 700;
          text-transform: uppercase;
          color: #111827;
        }

        .invoice-number {
          font-size: 20px;
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }

        .invoice-dates {
          font-size: 14px;
          color: #6b7280;
          margin-top: 8px;
        }

        /* Billing styles */
        .billing-header {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .client-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .client-address {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }

        /* Items table */
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }

        .items-table thead {
          border-bottom: 2px solid #e5e7eb;
        }

        .items-table th {
          text-align: left;
          padding: 12px 8px;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
        }

        .items-table th.text-right {
          text-align: right;
        }

        .items-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
        }

        .items-table td {
          padding: 12px 8px;
          font-size: 14px;
          color: #111827;
        }

        .items-table td.text-right {
          text-align: right;
        }

        /* Totals styles */
        .totals-table {
          width: 100%;
          margin-top: 16px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .totals-label {
          color: #6b7280;
        }

        .totals-value {
          font-weight: 600;
          color: #111827;
        }

        .total-row {
          border-top: 2px solid #e5e7eb;
          padding-top: 12px;
          margin-top: 8px;
        }

        .total-row .totals-label,
        .total-row .totals-value {
          font-size: 18px;
          font-weight: 700;
        }

        /* Footer styles */
        .footer-content {
          display: grid;
          grid-template-columns: repeat(${layout.styles.footerColumns}, 1fr);
          gap: 24px;
          font-size: 13px;
          color: #6b7280;
        }

        .footer-section-title {
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }

        /* Watermark */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.05);
          pointer-events: none;
          z-index: 999;
          white-space: nowrap;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .invoice-container {
            padding: 24px;
            gap: 16px;
          }

          .zone {
            grid-column: span 12 !important;
            grid-column-start: 1 !important;
          }

          .footer-content {
            grid-template-columns: 1fr;
          }
        }

        /* Print styles */
        @media print {
          .invoice-container {
            padding: 0;
          }

          .watermark {
            display: ${options.watermark ? 'block' : 'none'};
          }
        }

        ${options.customCSS || ''}
      </style>
    `;
    }

    /**
     * Render a specific zone
     */
    private static renderZone(
        zoneName: string,
        config: ZoneConfig,
        data: InvoiceComponent,
        layout: InvoiceLayout
    ): string {
        const alignmentClass = `text-${config.alignment}`;
        const zoneClass = `zone zone-${zoneName} ${alignmentClass}`;

        let content = '';

        switch (zoneName) {
            case 'header':
                content = this.renderHeader(data, layout);
                break;
            case 'metadata':
                content = this.renderMetadata(data, layout);
                break;
            case 'billing':
                content = this.renderBilling(data, layout);
                break;
            case 'items':
                content = this.renderItems(data);
                break;
            case 'totals':
                content = this.renderTotals(data);
                break;
            case 'footer':
                content = this.renderFooter(data);
                break;
        }

        return `<div class="${zoneClass}">${content}</div>`;
    }

    /**
     * Render header zone
     */
    private static renderHeader(data: InvoiceComponent, layout: InvoiceLayout): string {
        const { company, logo } = data;

        return `
      <div class="header-content">
        ${logo ? `<img src="${logo.url}" alt="Logo" style="width: ${logo.width}px; height: ${logo.height}px;">` : ''}
        <div>
          <div class="company-name">${company.name}</div>
          ${company.address ? `
            <div class="company-info">
              ${company.address.street || ''}<br>
              ${company.address.city ? `${company.address.city}, ${company.address.state || ''} ${company.address.postalCode || ''}` : ''}<br>
              ${company.address.country || ''}
            </div>
          ` : ''}
          ${company.contact ? `
            <div class="company-info">
              ${company.contact.email || ''}<br>
              ${company.contact.phone || ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
    }

    /**
     * Render metadata zone
     */
    private static renderMetadata(data: InvoiceComponent, layout: InvoiceLayout): string {
        const { metadata } = data;

        return `
      <div class="metadata-content">
        <div class="invoice-title">Invoice</div>
        <div class="invoice-number">#${metadata.invoiceNumber}</div>
        <div class="invoice-dates">
          <div>Issue Date: ${new Date(metadata.issueDate).toLocaleDateString()}</div>
          <div>Due Date: ${new Date(metadata.dueDate).toLocaleDateString()}</div>
          ${metadata.poNumber ? `<div>PO#: ${metadata.poNumber}</div>` : ''}
        </div>
      </div>
    `;
    }

    /**
     * Render billing zone
     */
    private static renderBilling(data: InvoiceComponent, layout: InvoiceLayout): string {
        const { billTo, shipTo } = data.billing;

        return `
      <div class="billing-content">
        <div class="billing-header">Bill To:</div>
        <div class="client-name">${billTo.companyName || billTo.name}</div>
        ${billTo.address ? `
          <div class="client-address">
            ${billTo.address.street || ''}<br>
            ${billTo.address.city ? `${billTo.address.city}, ${billTo.address.state || ''} ${billTo.address.postalCode || ''}` : ''}<br>
            ${billTo.address.country || ''}
          </div>
        ` : ''}
        ${billTo.email ? `<div class="client-address">${billTo.email}</div>` : ''}
        
        ${shipTo ? `
          <div style="margin-top: 16px;">
            <div class="billing-header">Ship To:</div>
            <div class="client-name">${shipTo.companyName || shipTo.name}</div>
            ${shipTo.address ? `
              <div class="client-address">
                ${shipTo.address.street || ''}<br>
                ${shipTo.address.city}, ${shipTo.address.state || ''} ${shipTo.address.postalCode || ''}<br>
                ${shipTo.address.country || ''}
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
    }

    /**
     * Render items table
     */
    private static renderItems(data: InvoiceComponent): string {
        const { items } = data;

        const rows = items.map(item => `
      <tr>
        <td>${item.description}</td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">$${item.rate.toFixed(2)}</td>
        <td class="text-right">$${item.amount.toFixed(2)}</td>
      </tr>
    `).join('');

        return `
      <table class="items-table">
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
    }

    /**
     * Render totals
     */
    private static renderTotals(data: InvoiceComponent): string {
        const { totals } = data;

        return `
      <div class="totals-table">
        <div class="totals-row">
          <span class="totals-label">Subtotal:</span>
          <span class="totals-value">$${totals.subtotal.toFixed(2)}</span>
        </div>
        ${totals.discount ? `
          <div class="totals-row">
            <span class="totals-label">Discount:</span>
            <span class="totals-value">-$${totals.discount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${totals.taxAmount ? `
          <div class="totals-row">
            <span class="totals-label">Tax ${totals.taxRate ? `(${totals.taxRate}%)` : ''}:</span>
            <span class="totals-value">$${totals.taxAmount.toFixed(2)}</span>
          </div>
        ` : ''}
        ${totals.shipping ? `
          <div class="totals-row">
            <span class="totals-label">Shipping:</span>
            <span class="totals-value">$${totals.shipping.toFixed(2)}</span>
          </div>
        ` : ''}
        <div class="totals-row total-row">
          <span class="totals-label">Total:</span>
          <span class="totals-value">$${totals.total.toFixed(2)}</span>
        </div>
      </div>
    `;
    }

    /**
     * Render footer
     */
    private static renderFooter(data: InvoiceComponent): string {
        const { footer } = data;

        return `
      <div class="footer-content">
        ${footer.terms ? `
          <div>
            <div class="footer-section-title">Payment Terms</div>
            <div>${footer.terms}</div>
          </div>
        ` : ''}
        ${footer.notes ? `
          <div>
            <div class="footer-section-title">Notes</div>
            <div>${footer.notes}</div>
          </div>
        ` : ''}
        ${footer.paymentInstructions ? `
          <div>
            <div class="footer-section-title">Payment Instructions</div>
            <div>${footer.paymentInstructions}</div>
          </div>
        ` : ''}
      </div>
    `;
    }

    /**
     * Render watermark
     */
    private static renderWatermark(text: string = 'SAMPLE'): string {
        return `<div class="watermark">${text}</div>`;
    }
}

/**
 * Generate PDF from layout (placeholder for backend implementation)
 */
export async function generateInvoicePDF(
    layout: InvoiceLayout,
    data: InvoiceComponent,
    options: RenderOptions = {}
): Promise<Buffer> {
    const html = InvoiceLayoutGenerator.generateHTML(layout, data, options);

    // This would use Puppeteer on the backend
    throw new Error('PDF generation must be done on the backend');
}
