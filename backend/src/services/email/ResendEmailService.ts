import { Resend } from 'resend';
import { logger } from '../../utils/logger';

/**
 * FREE Email Service using Resend
 * FREE tier: 3,000 emails/month
 * No credit card required!
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface InvoiceEmailData {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  amount: number;
  dueDate: string;
  invoiceUrl?: string;
}

export class ResendEmailService {
  private resend: Resend;
  private from: string;
  private monthlyCount: number;
  private monthlyLimit: number;
  private enabled: boolean;

  constructor(fromEmail?: string) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      logger.warn('RESEND_API_KEY not found. Email service will be disabled. Get yours free at resend.com');
      this.enabled = false;
      // Initialize resend to a dummy object to avoid errors if methods are called
      this.resend = null as any;
      this.from = fromEmail || 'Invoice SaaS <onboarding@resend.dev>'; // Default sender even if disabled
      this.monthlyCount = 0;
      this.monthlyLimit = 3000; // Free tier limit
      return;
    }

    this.resend = new Resend(apiKey);
    this.enabled = true;
    this.from = fromEmail || 'Invoice SaaS <onboarding@resend.dev>'; // Free tier sender
    this.monthlyCount = 0;
    this.monthlyLimit = 3000; // Free tier limit
  }

  /**
   * Send a single email
   * Cost: $0 (up to 3,000/month)
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Check if service is enabled
      if (!this.enabled) {
        logger.warn('Email service is disabled. Skipping email send.');
        return {
          success: false,
          error: 'Email service is disabled (no API key)',
        };
      }

      // Check monthly limit
      if (this.monthlyCount >= this.monthlyLimit) {
        console.warn('Monthly email limit reached (3,000). Consider upgrading Resend plan.');
        return {
          success: false,
          error: 'Monthly email limit reached',
        };
      }

      const { data, error } = await this.resend.emails.send({
        from: options.from || this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      });

      if (error) {
        console.error('Resend email error:', error);
        return {
          success: false,
          error: error.message,
        };
      }

      this.monthlyCount++;

      return {
        success: true,
        messageId: data?.id,
      };
    } catch (error: any) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send invoice notification email
   */
  async sendInvoiceEmail(data: InvoiceEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.buildInvoiceEmailTemplate(data);

    return this.sendEmail({
      to: data.clientEmail,
      subject: `Invoice ${data.invoiceNumber} from ${data.companyName}`,
      html,
    });
  }

  /**
   * Send invoice reminder email
   */
  async sendInvoiceReminder(data: InvoiceEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.buildReminderEmailTemplate(data);

    return this.sendEmail({
      to: data.clientEmail,
      subject: `Reminder: Invoice ${data.invoiceNumber} - Payment Due Soon`,
      html,
    });
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(data: InvoiceEmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const html = this.buildPaymentConfirmationTemplate(data);

    return this.sendEmail({
      to: data.clientEmail,
      subject: `Payment Received - Invoice ${data.invoiceNumber}`,
      html,
    });
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      sent: this.monthlyCount,
      limit: this.monthlyLimit,
      remaining: this.monthlyLimit - this.monthlyCount,
      cost: '$0/month (Free tier)',
    };
  }

  /**
   * Reset monthly counter (call at start of each month)
   */
  resetMonthlyCounter() {
    this.monthlyCount = 0;
  }

  // =========== Email Templates ===========

  private buildInvoiceEmailTemplate(data: InvoiceEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📄 New Invoice</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.clientName},</p>
    
    <p>Thank you for your business! Here's your invoice from ${data.companyName}.</p>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Invoice Number:</td>
          <td style="padding: 8px 0; text-align: right;">${data.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Amount Due:</td>
          <td style="padding: 8px 0; text-align: right; font-size: 20px; color: #667eea; font-weight: 700;">$${data.amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Due Date:</td>
          <td style="padding: 8px 0; text-align: right;">${new Date(data.dueDate).toLocaleDateString()}</td>
        </tr>
      </table>
    </div>
    
    ${data.invoiceUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.invoiceUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Invoice</a>
    </div>
    ` : ''}
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      If you have any questions about this invoice, please contact us.
    </p>
    
    <p style="margin-top: 20px;">
      Best regards,<br>
      <strong>${data.companyName}</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>This is an automated email. Please do not reply directly to this message.</p>
  </div>
</body>
</html>
    `;
  }

  private buildReminderEmailTemplate(data: InvoiceEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Reminder</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Payment Reminder</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.clientName},</p>
    
    <p>This is a friendly reminder that invoice <strong>${data.invoiceNumber}</strong> is due soon.</p>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Invoice Number:</td>
          <td style="padding: 8px 0; text-align: right;">${data.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Amount Due:</td>
          <td style="padding: 8px 0; text-align: right; font-size: 20px; color: #dc2626; font-weight: 700;">$${data.amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Due Date:</td>
          <td style="padding: 8px 0; text-align: right; color: #dc2626; font-weight: 600;">${new Date(data.dueDate).toLocaleDateString()}</td>
        </tr>
      </table>
    </div>
    
    ${data.invoiceUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.invoiceUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Pay Now</a>
    </div>
    ` : ''}
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      If you've already made the payment, please disregard this reminder.
    </p>
    
    <p style="margin-top: 20px;">
      Thank you,<br>
      <strong>${data.companyName}</strong>
    </p>
  </div>
</body>
</html>
    `;
  }

  private buildPaymentConfirmationTemplate(data: InvoiceEmailData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Received!</h1>
  </div>
  
  <div style="background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${data.clientName},</p>
    
    <p>Great news! We've received your payment for invoice <strong>${data.invoiceNumber}</strong>.</p>
    
    <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Invoice Number:</td>
          <td style="padding: 8px 0; text-align: right;">${data.invoiceNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Amount Paid:</td>
          <td style="padding: 8px 0; text-align: right; font-size: 20px; color: #059669; font-weight: 700;">$${data.amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: 600;">Status:</td>
          <td style="padding: 8px 0; text-align: right; color: #059669; font-weight: 600;">PAID ✓</td>
        </tr>
      </table>
    </div>
    
    <p>Thank you for your prompt payment. We appreciate your business!</p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>${data.companyName}</strong>
    </p>
  </div>
</body>
</html>
    `;
  }
}

// Export singleton instance
export const emailService = new ResendEmailService(process.env.EMAIL_FROM);

