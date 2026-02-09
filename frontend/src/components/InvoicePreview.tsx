import type { DesignConfig } from '../types/InvoiceDesign';

interface InvoiceData {
    invoiceNumber?: string;
    issueDate?: string;
    dueDate?: string;
    vendorName?: string; // Client Name
    vendorEmail?: string; // Client Email
    vendorAddress?: string; // Client Address
    items: Array<{
        description: string;
        quantity: number;
        rate: number;
        amount: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
    header?: string;
    footer?: string;
}

interface InvoicePreviewProps {
    data: InvoiceData;
    design: DesignConfig;
    issuer?: any; // Issuer (Vendor) Details
}

export default function InvoicePreview({ data, design, issuer }: InvoicePreviewProps) {
    const { theme, typography, components, layout, tableStyles } = design;

    // --- Dynamic Styles ---
    // Fix: fontSize needs to map to Tailwind classes
    const fontSizeClass = {
        compact: 'text-sm',
        standard: 'text-base',
        large: 'text-lg'
    }[typography.fontSize];

    const containerStyle = {
        backgroundColor: theme.background,
        color: theme.text,
        // Font family is handled via class now
        minHeight: '1000px',
    };

    // Helper to get font family class (remove 'font-' prefix handling if data already has 'font-sans')
    const fontClass = typography.fontFamily;
    const headerCaseClass = {
        uppercase: 'uppercase',
        capitalize: 'capitalize',
        lowercase: 'lowercase'
    }[typography.headerCase];

    const logoAlignment = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end'
    }[components.logoPosition];

    // --- Render Helpers ---

    const RenderLogo = () => (
        <div className={`flex ${logoAlignment} mb-4`}>
            {/* Placeholder Logo */}
            <div className={`w-16 h-16 ${components.borderRadius} flex items-center justify-center font-bold text-2xl text-white`}
                style={{ backgroundColor: theme.primary }}>
                {issuer?.companyName ? issuer.companyName.substring(0, 2).toUpperCase() : 'Logo'}
            </div>
        </div>
    );

    const RenderCompanyInfo = () => (
        <div className={layout === 'sidebar-right' || design.id === 'finance-grid' ? 'text-right' : ''}>
            <h2 className={`font-bold text-lg mb-1`} style={{ color: theme.primary }}>{issuer?.companyName || 'Your Company Name'}</h2>
            <p className="text-sm opacity-75">{issuer?.address?.street || '123 Business St.'}</p>
            <p className="text-sm opacity-75">
                {issuer?.address ?
                    `${issuer.address.city || ''}, ${issuer.address.state || ''} ${issuer.address.postalCode || ''}`
                    : 'City, State 12345'}
            </p>
            <p className="text-sm opacity-75">{issuer?.email || 'contact@company.com'}</p>
        </div>
    );

    const RenderClientInfo = () => (
        <div>
            <h3 className="text-sm font-bold opacity-60 uppercase tracking-wider mb-2" style={{ color: theme.secondary }}>Bill To</h3>
            <p className="font-bold text-lg">{data.vendorName || 'Client Name'}</p>
            <p className="text-sm opacity-75">{data.vendorEmail || 'client@example.com'}</p>
            <p className="text-sm opacity-75 whitespace-pre-line">{data.vendorAddress || '123 Client Avenue\nNew York, NY'}</p>
        </div>
    );

    const RenderInvoiceMeta = () => (
        <div className={layout === 'minimal-centered' ? 'text-center' : ''}>
            <h1 className={`text-4xl font-bold mb-2 ${headerCaseClass}`} style={{ color: theme.primary }}>
                INVOICE
            </h1>
            <div className="space-y-1 text-sm">
                <p><span className="opacity-60">Number:</span> <span className="font-mono font-semibold">{data.invoiceNumber || 'INV-001'}</span></p>
                <p><span className="opacity-60">Date:</span> {data.issueDate}</p>
                <p><span className="opacity-60">Due:</span> {data.dueDate}</p>
            </div>
        </div>
    );

    const RenderItemsTable = () => {
        // Table Variant Styles
        const isStriped = tableStyles === 'striped';
        const isFloating = tableStyles === 'floating-card';
        const isMinimal = tableStyles === 'minimal-lines';
        const isBoldHeader = tableStyles === 'bold-header';
        const isCompact = tableStyles === 'compact-grid';
        const isSimple = tableStyles === 'simple-border';

        const thClass = `py-3 px-4 text-left font-semibold text-sm ${isBoldHeader ? 'text-white' : ''}`;
        const tdClass = `py-3 px-4 ${isCompact ? 'py-1' : ''}`;

        return (
            <div className={`w-full overflow-hidden ${isFloating ? 'bg-white rounded-lg shadow-sm mb-4' : ''}`}>
                <table className={`w-full ${isSimple ? 'border' : ''}`} style={{ borderColor: theme.secondary }}>
                    <thead style={{
                        backgroundColor: isBoldHeader ? theme.primary : (isStriped || isSimple ? `${theme.secondary}20` : 'transparent'),
                        borderBottom: isMinimal ? `2px solid ${theme.primary}` : 'none'
                    }}>
                        <tr>
                            <th className={thClass}>Description</th>
                            <th className={`${thClass} w-24 text-center`}>Qty</th>
                            <th className={`${thClass} w-32 text-right`}>Rate</th>
                            <th className={`${thClass} w-32 text-right`}>Amount</th>
                        </tr>
                    </thead>
                    <tbody className={isSimple ? 'divide-y' : ''} style={{ borderColor: `${theme.secondary}40` }}>
                        {data.items.length > 0 ? (
                            data.items.map((item, i) => (
                                <tr key={i} style={{
                                    backgroundColor: isStriped && i % 2 !== 0 ? `${theme.secondary}10` : 'transparent',
                                    borderBottom: isMinimal ? `1px solid ${theme.secondary}40` : 'none'
                                }}>
                                    <td className={tdClass}>{item.description}</td>
                                    <td className={`${tdClass} text-center`}>{item.quantity}</td>
                                    <td className={`${tdClass} text-right`}>${item.rate.toFixed(2)}</td>
                                    <td className={`${tdClass} text-right font-medium`}>${item.amount.toFixed(2)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-sm opacity-50">
                                    No items added yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    const RenderTotals = () => (
        <div className={`w-full max-w-xs ml-auto ${components.borderRadius} ${components.shadow} p-6`}
            style={{ backgroundColor: theme.surface !== theme.background ? theme.surface : 'transparent' }}>
            <div className="flex justify-between py-2">
                <span className="opacity-75">Subtotal</span>
                <span>${data.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
                <span className="opacity-75">Tax (10%)</span>
                <span>${data.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-t mt-2 text-xl font-bold"
                style={{ borderColor: `${theme.secondary}40`, color: theme.primary }}>
                <span>Total</span>
                <span>${data.total.toFixed(2)}</span>
            </div>
        </div>
    );

    // --- Layout Implementations ---

    const LayoutClassicTop = () => (
        <div className="p-12 h-full flex flex-col gap-12">
            <div className="flex justify-between items-start">
                <div className="w-1/2">
                    <RenderLogo />
                    <RenderCompanyInfo />
                </div>
                <div className="text-right">
                    <RenderInvoiceMeta />
                </div>
            </div>
            <div className="border-t pt-8" style={{ borderColor: `${theme.secondary}40` }}>
                <RenderClientInfo />
            </div>
            <RenderItemsTable />
            <RenderTotals />
        </div>
    );

    const LayoutSidebarLeft = () => (
        <div className="flex h-full min-h-[1000px]">
            {/* Sidebar */}
            <div className="w-1/3 p-12 text-white flex flex-col gap-10" style={{ backgroundColor: theme.primary }}>
                <RenderLogo />
                <div className="text-white/90">
                    <h2 className="font-bold text-lg mb-4">From</h2>
                    <p className="font-semibold">{issuer?.companyName || 'Your Company Name'}</p>
                    <p className="opacity-80">{issuer?.address?.street || '123 Business St.'}</p>
                    <p className="opacity-80">
                        {issuer?.address ?
                            `${issuer.address.city || ''}, ${issuer.address.state || ''}`
                            : 'City, State 12345'}
                    </p>
                </div>
                <div className="text-white/90">
                    <h2 className="font-bold text-lg mb-4">To</h2>
                    <p className="font-bold">{data.vendorName}</p>
                    <p className="opacity-80">{data.vendorAddress}</p>
                </div>
            </div>
            {/* Main Content */}
            <div className="w-2/3 p-12 flex flex-col gap-10">
                <div className="text-right">
                    <h1 className="text-5xl font-bold opacity-20 mb-2">INVOICE</h1>
                    <p className="font-mono text-xl">{data.invoiceNumber}</p>
                    <p>Date: {data.issueDate}</p>
                </div>
                <RenderItemsTable />
                <RenderTotals />
            </div>
        </div>
    );

    const LayoutBannerHeader = () => (
        <div className="h-full flex flex-col">
            <div className="p-12 text-white" style={{ backgroundColor: theme.primary }}>
                <div className="flex justify-between items-center">
                    <RenderLogo />
                    <div className="text-right">
                        <h1 className="text-4xl font-bold tracking-widest uppercase">Invoice</h1>
                        <p className="opacity-80">#{data.invoiceNumber}</p>
                    </div>
                </div>
            </div>
            <div className="p-12 flex flex-col gap-12 flex-1">
                <div className="flex justify-between">
                    <RenderCompanyInfo />
                    <RenderClientInfo />
                </div>
                <RenderItemsTable />
                <RenderTotals />
            </div>
        </div>
    );

    const LayoutMinimalCentered = () => (
        <div className="p-16 h-full flex flex-col items-center text-center gap-12">
            <RenderLogo />
            <RenderInvoiceMeta />
            <div className="w-20 h-1" style={{ backgroundColor: theme.primary }}></div>
            <div className="grid grid-cols-2 gap-20 w-full max-w-2xl text-left">
                <div>
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-2">From</p>
                    <p className="font-bold">{issuer?.companyName || 'Your Company Name'}</p>
                    <p className="opacity-75">{issuer?.address?.street || '123 Business St.'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs uppercase tracking-widest opacity-50 mb-2">Bill To</p>
                    <p className="font-bold">{data.vendorName}</p>
                    <p className="opacity-75">{data.vendorAddress}</p>
                </div>
            </div>
            <RenderItemsTable />
            <div className="ml-auto w-full max-w-sm">
                <RenderTotals />
            </div>
        </div>
    );

    const LayoutSplitVertical = () => (
        <div className="h-full grid grid-cols-2 min-h-[1000px]">
            <div className="p-12 flex flex-col justify-between" style={{ backgroundColor: theme.surface }}>
                <RenderLogo />
                <div>
                    <h1 className="text-6xl font-bold mb-4" style={{ color: theme.primary }}>INVOICE</h1>
                    <div className="space-y-4">
                        <div>
                            <p className="font-bold opacity-50 uppercase text-xs">Invoice No</p>
                            <p className="text-xl font-mono">{data.invoiceNumber}</p>
                        </div>
                        <div>
                            <p className="font-bold opacity-50 uppercase text-xs">Date Issued</p>
                            <p className="text-xl">{data.issueDate}</p>
                        </div>
                        <div>
                            <p className="font-bold opacity-50 uppercase text-xs">Total Due</p>
                            <p className="text-4xl font-bold" style={{ color: theme.primary }}>${data.total.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
                <RenderCompanyInfo />
            </div>
            <div className="p-12 flex flex-col gap-8">
                <RenderClientInfo />
                <RenderItemsTable />
            </div>
        </div>
    );

    // Default fallback
    const LayoutDefault = LayoutClassicTop;

    const LayoutRouter = () => {
        switch (layout) {
            case 'classic-top': return <LayoutClassicTop />;
            case 'sidebar-left': return <LayoutSidebarLeft />;
            case 'sidebar-right': return <LayoutClassicTop />; // TODO: Implement specific right sidebar if needed, reusing classic for now
            case 'banner-header': return <LayoutBannerHeader />;
            case 'minimal-centered': return <LayoutMinimalCentered />;
            case 'split-vertical': return <LayoutSplitVertical />;
            default: return <LayoutDefault />;
        }
    };

    return (
        <div
            id="invoice-preview"
            className={`${fontClass} ${fontSizeClass} shadow-2xl overflow-hidden transition-all duration-300`}
            style={{
                ...containerStyle
            }}
        >
            <div className={`h-full w-full ${components.borderRadius}`}>
                {LayoutRouter()}
            </div>
        </div>
    );
}
