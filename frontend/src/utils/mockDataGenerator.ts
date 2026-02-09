export function generateMockInvoice() {
    return {
        _id: 'mock-invoice-123',
        invoiceNumber: 'INV-2024-001',
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

        company: {
            name: 'Acme Corporation',
            logo: 'https://via.placeholder.com/150x60/4f46e5/ffffff?text=ACME',
            address: {
                street: '123 Business Street',
                city: 'San Francisco',
                state: 'CA',
                zip: '94102',
                country: 'USA'
            },
            email: 'hello@acmecorp.com',
            phone: '+1 (555) 123-4567',
            bankDetails: {
                bankName: 'First National Bank',
                accountNumber: '****1234',
                routingNumber: '123456789'
            }
        },

        vendor: {
            name: 'Tech Solutions Inc.',
            address: {
                street: '456 Client Avenue',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'USA'
            },
            email: 'billing@techsolutions.com'
        },

        items: [
            {
                _id: '1',
                description: 'Web Development Services',
                quantity: 40,
                rate: 150,
                amount: 6000
            },
            {
                _id: '2',
                description: 'UI/UX Design',
                quantity: 20,
                rate: 120,
                amount: 2400
            },
            {
                _id: '3',
                description: 'Project Management',
                quantity: 10,
                rate: 100,
                amount: 1000
            }
        ],

        subtotal: 9400,
        tax: 940,
        total: 10340,

        notes: 'Payment is due within 30 days. Please include invoice number with payment.',
        paymentTerms: 'Net 30'
    };
}
