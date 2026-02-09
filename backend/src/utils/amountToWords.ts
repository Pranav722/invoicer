/**
 * Utility function to convert numerical amounts to words
 * Supports multiple currencies and languages
 * 
 * NOTE: This does NOT use AI - it's a deterministic, rule-based implementation
 * Much faster, cheaper, and more accurate than AI for this task
 */

interface AmountInWordsOptions {
    amount: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD';
    language?: 'en' | 'es' | 'fr' | 'de' | 'hi';
    format?: 'legal' | 'standard' | 'formal';
    includeDecimals?: boolean;
}

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const thousands = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

const currencies = {
    USD: { main: 'Dollar', decimal: 'Cent', plural: 'Dollars', decimalPlural: 'Cents' },
    EUR: { main: 'Euro', decimal: 'Cent', plural: 'Euros', decimalPlural: 'Cents' },
    GBP: { main: 'Pound', decimal: 'Penny', plural: 'Pounds', decimalPlural: 'Pence' },
    INR: { main: 'Rupee', decimal: 'Paisa', plural: 'Rupees', decimalPlural: 'Paise' },
    JPY: { main: 'Yen', decimal: 'Sen', plural: 'Yen', decimalPlural: 'Sen' },
    CAD: { main: 'Dollar', decimal: 'Cent', plural: 'Dollars', decimalPlural: 'Cents' },
    AUD: { main: 'Dollar', decimal: 'Cent', plural: 'Dollars', decimalPlural: 'Cents' },
};

/**
 * Convert a number (0-999) to words
 */
function convertHundreds(num: number): string {
    if (num === 0) return '';

    let result = '';

    // Hundreds place
    if (num >= 100) {
        result += ones[Math.floor(num / 100)] + ' Hundred';
        num %= 100;
        if (num > 0) result += ' ';
    }

    // Tens and ones
    if (num >= 20) {
        result += tens[Math.floor(num / 10)];
        if (num % 10 > 0) {
            result += '-' + ones[num % 10];
        }
    } else if (num >= 10) {
        result += teens[num - 10];
    } else if (num > 0) {
        result += ones[num];
    }

    return result;
}

/**
 * Convert any number to words
 */
function numberToWords(num: number): string {
    if (num === 0) return 'Zero';

    let result = '';
    let thousandCounter = 0;

    while (num > 0) {
        const chunk = num % 1000;

        if (chunk !== 0) {
            const chunkWords = convertHundreds(chunk);
            const suffix = thousands[thousandCounter];
            result = chunkWords + (suffix ? ' ' + suffix : '') + (result ? ' ' + result : '');
        }

        num = Math.floor(num / 1000);
        thousandCounter++;
    }

    return result.trim();
}

/**
 * Main function to convert amount to words
 */
export function convertAmountToWords(options: AmountInWordsOptions): string {
    const {
        amount,
        currency,
        language = 'en',
        format = 'standard',
        includeDecimals = true,
    } = options;

    if (language !== 'en') {
        // For non-English languages, you would integrate i18n libraries
        // For now, we'll stick with English
        console.warn(`Language ${language} not yet supported, using English`);
    }

    // Split into main and decimal parts
    const main = Math.floor(Math.abs(amount));
    const decimal = Math.round((Math.abs(amount) - main) * 100);

    // Get currency names
    const curr = currencies[currency];
    if (!curr) {
        throw new Error(`Currency ${currency} not supported`);
    }

    // Convert main amount
    const mainWords = numberToWords(main);
    const mainUnit = main === 1 ? curr.main : curr.plural;

    let result = `${mainWords} ${mainUnit}`;

    // Add decimal part if requested
    if (includeDecimals && decimal > 0) {
        const decimalWords = numberToWords(decimal);
        const decimalUnit = decimal === 1 ? curr.decimal : curr.decimalPlural;
        result += ` and ${decimalWords} ${decimalUnit}`;
    }

    // Apply formatting
    if (format === 'legal') {
        result = result.toUpperCase() + ' ONLY';
    } else if (format === 'formal') {
        result = capitalize(result) + ' only';
    }

    // Handle negative amounts
    if (amount < 0) {
        result = 'Negative ' + result;
    }

    return result;
}

/**
 * Capitalize first letter of string
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convenience exports for common currencies
 */
export const convertToUSD = (amount: number, format?: 'legal' | 'standard' | 'formal') =>
    convertAmountToWords({ amount, currency: 'USD', format, includeDecimals: true });

export const convertToINR = (amount: number, format?: 'legal' | 'standard' | 'formal') =>
    convertAmountToWords({ amount, currency: 'INR', format, includeDecimals: true });

export const convertToEUR = (amount: number, format?: 'legal' | 'standard' | 'formal') =>
    convertAmountToWords({ amount, currency: 'EUR', format, includeDecimals: true });

export const convertToGBP = (amount: number, format?: 'legal' | 'standard' | 'formal') =>
    convertAmountToWords({ amount, currency: 'GBP', format, includeDecimals: true });

// Example usage:
// convertAmountToWords({ amount: 1234.56, currency: 'USD', format: 'legal', includeDecimals: true })
// Output: "ONE THOUSAND TWO HUNDRED THIRTY-FOUR DOLLARS AND FIFTY-SIX CENTS ONLY"
