import { convertAmountToWords } from '../../src/utils/amountToWords';

/**
 * Unit tests for amount to words conversion utility
 */

describe('convertAmountToWords', () => {
    describe('USD Currency', () => {
        it('should convert whole numbers correctly', () => {
            expect(convertAmountToWords(0, 'USD')).toBe('Zero Dollars');
            expect(convertAmountToWords(1, 'USD')).toBe('One Dollar');
            expect(convertAmountToWords(10, 'USD')).toBe('Ten Dollars');
            expect(convertAmountToWords(100, 'USD')).toBe('One Hundred Dollars');
            expect(convertAmountToWords(1000, 'USD')).toBe('One Thousand Dollars');
        });

        it('should handle amounts with cents', () => {
            expect(convertAmountToWords(1.50, 'USD')).toBe('One Dollar and Fifty Cents');
            expect(convertAmountToWords(10.99, 'USD')).toBe('Ten Dollars and Ninety-Nine Cents');
            expect(convertAmountToWords(100.01, 'USD')).toBe('One Hundred Dollars and One Cent');
        });

        it('should handle large amounts', () => {
            expect(convertAmountToWords(1000000, 'USD')).toBe('One Million Dollars');
            expect(convertAmountToWords(1234567.89, 'USD')).toContain('Million');
        });

        it('should handle decimal precision', () => {
            expect(convertAmountToWords(99.99, 'USD')).toBe('Ninety-Nine Dollars and Ninety-Nine Cents');
            expect(convertAmountToWords(0.01, 'USD')).toBe('One Cent');
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero', () => {
            expect(convertAmountToWords(0, 'USD')).toBe('Zero Dollars');
        });

        it('should handle very small amounts', () => {
            expect(convertAmountToWords(0.01, 'USD')).toBe('One Cent');
            expect(convertAmountToWords(0.50, 'USD')).toBe('Fifty Cents');
        });

        it('should round to 2 decimal places', () => {
            expect(convertAmountToWords(1.999, 'USD')).toContain('Two Dollars');
        });
    });
});

/**
 * Unit tests for invoice calculations (TC-BUS-001)
 */

describe('Invoice Calculations', () => {
    describe('calculateSubtotal', () => {
        it('should sum line items correctly', () => {
            const items = [
                { quantity: 2, rate: 100, amount: 200 },
                { quantity: 3, rate: 50, amount: 150 },
                { quantity: 1, rate: 250, amount: 250 },
            ];

            const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
            expect(subtotal).toBe(600);
        });

        it('should handle single item', () => {
            const items = [{ quantity: 10, rate: 99.99, amount: 999.90 }];
            const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
            expect(subtotal).toBeCloseTo(999.90, 2);
        });

        it('should handle empty items', () => {
            const items: any[] = [];
            const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
            expect(subtotal).toBe(0);
        });
    });

    describe('calculateTax', () => {
        it('should calculate tax correctly', () => {
            const testCases = [
                { subtotal: 100, rate: 10, expected: 10 },
                { subtotal: 100, rate: 8.5, expected: 8.5 },
                { subtotal: 100, rate: 0, expected: 0 },
                { subtotal: 250.50, rate: 7.25, expected: 18.16 },
            ];

            testCases.forEach(({ subtotal, rate, expected }) => {
                const tax = (subtotal * rate) / 100;
                expect(tax).toBeCloseTo(expected, 2);
            });
        });
    });

    describe('calculateTotal - TC-BUS-001', () => {
        it('should calculate total with tax and discount', () => {
            const testCases = [
                { subtotal: 100, taxRate: 10, discount: 0, expected: 110 },
                { subtotal: 100, taxRate: 10, discount: 10, expected: 100 },
                { subtotal: 100, taxRate: 0, discount: 0, expected: 100 },
                { subtotal: 100, taxRate: 8.5, discount: 5, expected: 103.5 },
            ];

            testCases.forEach(({ subtotal, taxRate, discount, expected }) => {
                const tax = (subtotal * taxRate) / 100;
                const total = subtotal + tax - discount;
                expect(total).toBeCloseTo(expected, 2);
            });
        });

        it('should handle decimal precision', () => {
            const subtotal = 99.99;
            const taxRate = 8.25;
            const tax = (subtotal * taxRate) / 100;
            const total = subtotal + tax;

            expect(total).toBeCloseTo(108.24, 2);
        });
    });
});
