
import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { DesignConfig } from '../types/InvoiceDesign';

// --- 1. TYPES & INTERFACES ---
export interface InvoiceData {
    id: string;
    date: string;
    dueDate: string;
    vendor: {
        name: string;
        logo?: string;
        address: string;
        email: string;
        phone?: string;
        taxId?: string;
        signature?: string; // Digital Signature URL
    };
    client: {
        name: string;
        company: string;
        address: string;
        taxId?: string;
    };
    items: Array<{
        description: string;
        quantity: number;
        rate: number;
        amount: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    notes?: string;
    paymentInfo?: {
        bankName?: string;
        accountName?: string;
        accountNumber?: string;
        swiftCode?: string;
        ifscCode?: string;
        routingNumber?: string;
    };
    footer?: {
        contact?: string;
        email?: string;
        address?: string;
        terms?: string;
    };
}

interface LayoutProps {
    data: InvoiceData;
    config?: DesignConfig;
}

// --- 2. REUSABLE ATOMS (Building Blocks) ---

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

const Text = ({ children, className, variant = 'body', config }: { children: React.ReactNode; className?: string; variant?: 'h1' | 'h2' | 'h3' | 'label' | 'body' | 'mono'; config?: DesignConfig }) => {
    const styles = {
        h1: 'text-3xl font-bold tracking-tight',
        h2: 'text-xl font-semibold',
        h3: 'text-lg font-medium',
        label: 'text-xs uppercase tracking-wider opacity-70',
        body: 'text-sm',
        mono: 'font-mono text-sm',
    };

    const fontFamily = config?.typography.fontFamily || '';
    const textColor = config?.theme.text || '';
    const headerCase = (variant.startsWith('h') || variant === 'label') ? (config?.typography.headerCase || '') : '';
    const isHex = textColor.startsWith('#');

    // Simple size scaling
    const sizeScale = config?.typography.fontSize === 'compact' ? 'text-[0.9em]' : config?.typography.fontSize === 'large' ? 'text-[1.1em]' : '';

    return (
        <div
            className={cn(styles[variant], fontFamily, headerCase, sizeScale, !isHex && textColor, className)}
            style={isHex ? { color: textColor } : {}}
        >
            {children}
        </div>
    );
};

const InvoiceTable = ({ data, config, variant, className }: { data: InvoiceData; config?: DesignConfig; variant?: 'simple' | 'striped' | 'grid' | 'minimal'; className?: string }) => {
    // Use config style if no specific variant is strictly enforced, or map config style to variant
    const styleMap: Record<string, string> = {
        'simple-border': 'simple',
        'striped': 'striped',
        'compact-grid': 'grid',
        'minimal-lines': 'minimal',
        'bold-header': 'simple' // fallback
    };

    // If config is present, use its tableStyle, otherwise fallback to prop variant or 'simple'
    const activeVariant = config?.tableStyles ? (styleMap[config.tableStyles] || variant || 'simple') : (variant || 'simple');

    const primaryColor = config?.theme.primary || '';
    const isHex = primaryColor.startsWith('#');

    return (
        <table className={cn("w-full text-left border-collapse", className)}>
            <thead>
                <tr className={cn(
                    activeVariant === 'striped' && "bg-slate-100",
                    activeVariant === 'grid' && "border-y-2 border-black",
                    "text-sm"
                )} style={activeVariant === 'striped' && isHex ? { backgroundColor: primaryColor + '10' } : {}}>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {data.items.map((item, i) => (
                    <tr key={i} className={cn(
                        activeVariant === 'striped' && i % 2 === 0 && "bg-slate-50",
                        activeVariant === 'grid' && "border-b border-gray-300"
                    )}>
                        <td className="py-2 px-3">{item.description}</td>
                        <td className="py-2 px-3 text-right">{item.quantity}</td>
                        <td className="py-2 px-3 text-right">{data.currency}{item.rate}</td>
                        <td className="py-2 px-3 text-right font-medium">{data.currency}{item.amount}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const PaymentAndSignature = ({ data, config, className }: LayoutProps & { className?: string }) => (
    <div className={cn("grid grid-cols-2 gap-8 mt-8 border-t border-gray-100 pt-6", className)}>
        <div>
            <Text variant="label" className="mb-2" config={config}>Payment Details</Text>
            <div className="text-sm space-y-1">
                {data.paymentInfo?.bankName ? (
                    <>
                        <p><span className="opacity-60">Bank:</span> {data.paymentInfo.bankName}</p>
                        {data.paymentInfo.accountName && <p><span className="opacity-60">Account Name:</span> {data.paymentInfo.accountName}</p>}
                        <p><span className="opacity-60">Account No:</span> {data.paymentInfo.accountNumber}</p>
                        {data.paymentInfo.swiftCode && <p><span className="opacity-60">SWIFT/BIC:</span> {data.paymentInfo.swiftCode}</p>}
                        {data.paymentInfo.ifscCode && <p><span className="opacity-60">IFSC:</span> {data.paymentInfo.ifscCode}</p>}
                        {data.paymentInfo.routingNumber && <p><span className="opacity-60">Routing:</span> {data.paymentInfo.routingNumber}</p>}
                    </>
                ) : (
                    <p className="text-xs italic text-slate-400">No payment details provided</p>
                )}
            </div>
        </div>
        <div className="text-right flex flex-col items-end">
            {data.vendor.signature && (
                <>
                    <img src={data.vendor.signature} alt="Signature" className="h-16 mb-2 object-contain" />
                    <Text variant="label" config={config}>Authorized Signature</Text>
                </>
            )}
        </div>
    </div>
);

const FooterSection = ({ data, config }: LayoutProps) => (
    <div className="mt-auto pt-8 border-t border-gray-200 text-sm opacity-80">
        <div className="grid grid-cols-1 gap-2 text-center">
            <div className="text-[10px] opacity-60 uppercase tracking-widest font-bold">
                {data.footer?.address && <span>{data.footer.address}</span>}
                {data.footer?.contact && <span> • {data.footer.contact}</span>}
                {data.footer?.email && <span> • {data.footer.email}</span>}
            </div>
            <div className="text-xs italic">
                <Text variant="body" className="italic" config={config}>
                    {data.footer?.terms || 'Thank you for your business. Payment is due within 30 days.'}
                </Text>
            </div>
        </div>
    </div>
);

// --- 3. THE 20 UNIQUE DESIGNS ---

const Design1_Executive = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-white p-12 max-w-4xl mx-auto flex flex-col gap-10",
        config?.typography.fontFamily,
        config?.components.borderRadius || 'rounded-none',
        config?.components.shadow || 'shadow-lg'
    )} style={{ backgroundColor: config?.theme.background.startsWith('#') ? config.theme.background : undefined }}>
        <header className={cn("flex justify-between items-start border-b-2 pb-6", config?.theme.primary.startsWith('#') ? "" : "border-slate-800")} style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary : undefined }}>
            <div>
                <Text variant="h1" config={config}>INVOICE</Text>
                <Text variant="mono" className="mt-2" config={config}>#{data.id}</Text>
            </div>
            <div className="text-right">
                {data.vendor.logo && (
                    <img src={data.vendor.logo} alt="Logo" className={cn("h-12 object-contain ml-auto mb-2", config?.components.logoPosition === 'center' ? 'mx-auto' : config?.components.logoPosition === 'left' ? 'mr-auto ml-0' : 'ml-auto')} />
                )}
                <Text variant="h2" config={config}>{data.vendor.name}</Text>
                <Text className="opacity-60 mt-1" config={config}>{data.vendor.email}</Text>
            </div>
        </header>
        <div className="grid grid-cols-2 gap-12">
            <div>
                <Text variant="label" className="mb-2" config={config}>Bill To</Text>
                <Text variant="h3" config={config}>{data.client.company}</Text>
                <Text className="mt-1 whitespace-pre-line" config={config}>{data.client.address}</Text>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><Text variant="label" config={config}>Date</Text><Text config={config}>{data.date}</Text></div>
                <div><Text variant="label" config={config}>Due Date</Text><Text config={config}>{data.dueDate}</Text></div>
            </div>
        </div>
        <InvoiceTable data={data} config={config} variant="striped" />
        <div className="self-end w-64 border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
                <Text config={config}>Total</Text>
                <Text config={config}>{data.currency}{data.total}</Text>
            </div>
        </div>
        <PaymentAndSignature data={data} config={config} />
        <FooterSection data={data} config={config} />
    </div>
);

const Design2_SidebarConsole = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-white max-w-4xl mx-auto grid grid-cols-[280px_1fr]",
        config?.typography.fontFamily,
        config?.components.borderRadius || 'rounded-none',
        config?.components.shadow || 'shadow-lg'
    )} style={{ backgroundColor: config?.theme.background.startsWith('#') ? config.theme.background : undefined }}>
        <aside className={cn("p-8 flex flex-col gap-8", config?.theme.secondary.startsWith('#') ? "" : "bg-slate-900 text-slate-300")} style={{ backgroundColor: config?.theme.secondary.startsWith('#') ? config.theme.secondary : undefined, color: config?.theme.secondary.startsWith('#') ? '#fff' : undefined }}>
            <div>
                <div className={cn("h-12 w-12 rounded-lg mb-4", config?.theme.primary.startsWith('#') ? "" : "bg-indigo-500")} style={{ backgroundColor: config?.theme.primary.startsWith('#') ? config.theme.primary : undefined }}></div>
                <Text variant="h2" className="text-white" config={config}>{data.vendor.name}</Text>
            </div>
            <div className="mt-auto">
                <Text variant="label" className="opacity-60" config={config}>Invoice ID</Text>
                <Text variant="mono" className="text-white text-xl" config={config}>#{data.id}</Text>
            </div>
            <div>
                <Text variant="label" className="opacity-60" config={config}>Issued</Text>
                <Text className="text-white" config={config}>{data.date}</Text>
            </div>
        </aside>
        <main className={cn("p-12 flex flex-col gap-10", config?.theme.text.startsWith('#') ? "" : config?.theme.text)} style={config?.theme.text.startsWith('#') ? { color: config.theme.text } : undefined}>
            <div>
                <Text variant="label" className="mb-2" config={config}>Billed To</Text>
                <Text variant="h1" config={config}>{data.client.company}</Text>
            </div>
            <InvoiceTable data={data} config={config} variant="simple" />
            <div className={cn("p-6 rounded-xl self-end w-full max-w-xs", config?.theme.primary.startsWith('#') ? "" : "bg-slate-50")} style={config?.theme.primary.startsWith('#') ? { backgroundColor: config.theme.primary + '10' } : undefined}>
                <div className="flex justify-between mb-2">
                    <Text variant="label" config={config}>Subtotal</Text>
                    <Text config={config}>{data.currency}{data.subtotal}</Text>
                </div>
                <div className={cn("flex justify-between mb-4 pb-4", config?.theme.primary.startsWith('#') ? "" : "border-b border-white")} style={config?.theme.primary.startsWith('#') ? { borderBottom: `1px solid ${config.theme.primary}` } : undefined}>
                    <Text variant="label" config={config}>Tax</Text>
                    <Text config={config}>{data.currency}{data.tax}</Text>
                </div>
                <div className="flex justify-between items-center">
                    <Text variant="h3" config={config}>Total Due</Text>
                    <Text variant="h2" config={config}>{data.currency}{data.total}</Text>
                </div>
            </div>
            <PaymentAndSignature data={data} config={config} />
            <FooterSection data={data} config={config} />
        </main>
    </div>
);

const Design3_SplitVertical = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-white max-w-4xl mx-auto shadow-lg min-h-[1000px] grid grid-cols-2", config?.typography.fontFamily)}>
        <div className={cn("p-12 flex flex-col justify-between", config?.theme.primary.startsWith('#') ? "" : "bg-emerald-600 text-white")} style={{ backgroundColor: config?.theme.primary.startsWith('#') ? config.theme.primary : undefined, color: config?.theme.primary.startsWith('#') ? '#fff' : undefined }}>
            <div>
                <Text variant="label" className="opacity-70" config={config}>Vendor</Text>
                <Text variant="h1" className="mt-2" config={config}>{data.vendor.name}</Text>
                <Text className="mt-4 opacity-90" config={config}>{data.vendor.address}</Text>
            </div>
            <div>
                <Text variant="h1" className="text-6xl font-thin opacity-50" config={config}>#{data.id}</Text>
            </div>
        </div>
        <div className="p-12 flex flex-col gap-8">
            <div>
                <Text variant="label" config={config}>Client</Text>
                <Text variant="h2" config={config}>{data.client.company}</Text>
            </div>
            <InvoiceTable data={data} config={config} variant="minimal" />
            <div className="mt-auto pt-8 border-t border-gray-100">
                <Text variant="h1" className="text-right" config={config}>{data.currency}{data.total}</Text>
            </div>
            <PaymentAndSignature data={data} config={config} />
            <FooterSection data={data} config={config} />
        </div>
    </div>
);

const Design4_ThermalReceipt = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-yellow-50 max-w-[400px] mx-auto shadow-xl min-h-[800px] p-6 font-mono text-sm border-x-4 border-dashed border-gray-300 relative flex flex-col", config?.typography.fontFamily)}>
        <div className="text-center mb-8">
            <div className="h-10 w-10 bg-black rounded-full mx-auto mb-2"></div>
            <Text variant="h2" className="uppercase" config={config}>{data.vendor.name}</Text>
            <Text className="text-xs" config={config}>{data.vendor.address}</Text>
        </div>
        <div className="border-y-2 border-black border-dashed py-4 mb-6">
            <div className="flex justify-between"><Text variant="mono" config={config}>DATE:</Text><Text variant="mono" config={config}>{data.date}</Text></div>
            <div className="flex justify-between"><Text variant="mono" config={config}>INV #:</Text><Text variant="mono" config={config}>{data.id}</Text></div>
        </div>
        <div className="flex flex-col gap-2 mb-6">
            {data.items.map((item, i) => (
                <div key={i} className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <Text className="font-bold" config={config}>{item.description}</Text>
                        <Text variant="mono" className="text-xs opacity-60" config={config}>x{item.quantity} @ {item.rate}</Text>
                    </div>
                    <Text variant="mono" config={config}>{data.currency}{item.amount}</Text>
                </div>
            ))}
        </div>
        <div className="border-t-2 border-black pt-4 flex justify-between text-lg font-bold">
            <Text variant="h3" config={config}>TOTAL</Text>
            <Text variant="h3" config={config}>{data.currency}{data.total}</Text>
        </div>
        <PaymentAndSignature data={data} config={config} className="border-black border-dashed" />
        <div className="mt-auto pt-8 text-center text-xs">
            <Text variant="mono" className="text-xs" config={config}>THANK YOU COME AGAIN</Text>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>
    </div>
);

const Design5_SwissGrid = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-white max-w-4xl mx-auto shadow-none min-h-[1000px] border-4 border-black p-4", config?.typography.fontFamily)} style={{ backgroundColor: config?.theme.background.startsWith('#') ? config.theme.background : undefined }}>
        <div className="grid grid-cols-3 gap-4 h-full">
            <div className={cn("col-span-2 border-2 border-black p-6", config?.theme.primary.startsWith('#') ? "" : "bg-orange-500")} style={{ backgroundColor: config?.theme.primary.startsWith('#') ? config.theme.primary : undefined }}>
                <Text variant="h1" className="text-7xl font-bold tracking-tighter" config={config}>INVOICE</Text>
            </div>
            <div className={cn("border-2 border-black p-6 flex items-center justify-center", config?.theme.secondary.startsWith('#') ? "" : "bg-yellow-400")} style={{ backgroundColor: config?.theme.secondary.startsWith('#') ? config.theme.secondary : undefined }}>
                <Text variant="h2" config={config}>#{data.id}</Text>
            </div>
            <div className="border-2 border-black p-6 h-40">
                <Text variant="label" className="font-bold" config={config}>From</Text>
                <Text>{data.vendor.name}</Text>
            </div>
            <div className="border-2 border-black p-6 h-40 col-span-2">
                <Text variant="label" className="font-bold">To</Text>
                <Text variant="h2">{data.client.company}</Text>
            </div>
            <div className="col-span-3 border-2 border-black p-6 min-h-[400px]">
                <InvoiceTable data={data} variant="grid" className="w-full" />
            </div>
            <div className="col-span-3 border-2 border-black p-6">
                <PaymentAndSignature data={data} />
            </div>
            <div className="col-span-2 border-2 border-black p-6 flex items-center">
                <Text>{data.footer?.terms || 'Thank you for your business.'}</Text>
            </div>
            <div className="border-2 border-black p-6 bg-black text-white flex items-center justify-center">
                <Text variant="h2">{data.currency}{data.total}</Text>
            </div>
        </div>
    </div>
);

const Design6_BottomHeavy = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-stone-100 max-w-4xl mx-auto shadow-lg min-h-[1000px] flex flex-col p-16", config?.typography.fontFamily)} style={{ backgroundColor: config?.theme.background.startsWith('#') ? config.theme.background : undefined }}>
        <div className="mb-12">
            <Text variant="label" className="text-stone-500 mb-2" config={config}>Amount Due</Text>
            <Text className="text-9xl font-bold tracking-tighter" config={config}>{data.currency}{data.total}</Text>
        </div>
        <div className="grid grid-cols-2 gap-12 mb-12 border-t border-stone-300 pt-8">
            <div>
                <Text variant="h3" config={config}>{data.client.company}</Text>
                <Text className="text-stone-500" config={config}>Client ID: 8829</Text>
            </div>
            <div className="text-right">
                <Text variant="h3" config={config}>{data.vendor.name}</Text>
                <Text className="text-stone-500" config={config}>{data.date}</Text>
            </div>
        </div>
        <InvoiceTable data={data} config={config} variant="simple" className="opacity-80" />
        <div className="mb-12">
            <PaymentAndSignature data={data} config={config} />
        </div>
        <FooterSection data={data} config={config} />
    </div>
);

const Design7_HorizontalStrip = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-white max-w-4xl mx-auto shadow-lg min-h-[1000px] flex flex-col", config?.typography.fontFamily)} style={{ backgroundColor: config?.theme.background.startsWith('#') ? config.theme.background : undefined }}>
        <div className="h-32 p-12">
            <Text variant="h2" config={config}>{data.vendor.name}</Text>
        </div>
        <div className={cn("p-12 grid grid-cols-3 gap-8", config?.theme.primary.startsWith('#') ? "" : "bg-indigo-900 text-white")} style={{ backgroundColor: config?.theme.primary.startsWith('#') ? config.theme.primary : undefined, color: config?.theme.primary.startsWith('#') ? '#fff' : undefined }}>
            <div>
                <Text variant="label" className="opacity-70" config={config}>Invoice</Text>
                <Text variant="h2" config={config}>#{data.id}</Text>
            </div>
            <div>
                <Text variant="label" className="opacity-70" config={config}>Bill To</Text>
                <Text config={config}>{data.client.company}</Text>
            </div>
            <div>
                <Text variant="label" className="opacity-70" config={config}>Total</Text>
                <Text variant="h2" config={config}>{data.currency}{data.total}</Text>
            </div>
        </div>
        <div className="p-12 flex-1">
            <InvoiceTable data={data} config={config} variant="striped" />
        </div>
        <div className="px-12 pb-4">
            <PaymentAndSignature data={data} config={config} />
        </div>
        <div className="p-12">
            <FooterSection data={data} config={config} />
        </div>
    </div>
);

const Design8_FloatingCards = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-gray-100 max-w-4xl mx-auto min-h-[1000px] p-12 flex flex-col gap-6", config?.typography.fontFamily)} style={{ backgroundColor: config?.theme.background.startsWith('#') ? config.theme.background : undefined }}>
        <div className="bg-white p-8 rounded-2xl shadow-sm flex justify-between items-center">
            <Text variant="h2" config={config}>{data.vendor.name}</Text>
            <div className={cn("px-4 py-1 rounded-full text-xs font-bold", config?.theme.primary.startsWith('#') ? "" : "bg-blue-100 text-blue-800")} style={config?.theme.primary.startsWith('#') ? { backgroundColor: config.theme.primary + '20', color: config.theme.primary } : undefined}>PAID</div>
        </div>
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
                <Text variant="label" className="mb-2" config={config}>From</Text>
                <Text className="font-medium" config={config}>{data.vendor.address}</Text>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
                <Text variant="label" className="mb-2" config={config}>To</Text>
                <Text variant="h3" config={config}>{data.client.company}</Text>
            </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm flex-grow">
            <InvoiceTable data={data} config={config} variant="minimal" />
        </div>
        <div className={cn("p-8 rounded-2xl shadow-sm flex justify-between items-center", config?.theme.secondary.startsWith('#') ? "" : "bg-gray-800 text-white")} style={{ backgroundColor: config?.theme.secondary.startsWith('#') ? config.theme.secondary : undefined, color: config?.theme.secondary.startsWith('#') ? '#fff' : undefined }}>
            <Text config={config}>Thank you.</Text>
            <Text variant="h1" config={config}>{data.currency}{data.total}</Text>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm">
            <PaymentAndSignature data={data} config={config} />
        </div>
    </div>
);

const Design9_TechTerminal = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-black max-w-4xl mx-auto min-h-[1000px] p-12 font-mono flex flex-col", config?.typography.fontFamily)} style={{ color: config?.theme.primary.startsWith('#') ? config.theme.primary : '#22c55e' }}>
        <div className="mb-8 border-b border-green-900 pb-4" style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary + '30' : undefined }}>
            <p>{'>'} SYSTEM_CHECK: <span style={{ color: config?.theme.secondary.startsWith('#') ? config.theme.secondary : '#86efac' }}>OK</span></p>
            <p>{'>'} INVOICE_ID: <span className="text-white">#{data.id}</span></p>
            <p>{'>'} DATE: {data.date}</p>
        </div>
        <div className="grid grid-cols-2 mb-12">
            <div>
                <p className="opacity-50 mb-2">// VENDOR_DATA</p>
                <p className="text-white">{data.vendor.name}</p>
                <p>{data.vendor.email}</p>
            </div>
            <div>
                <p className="opacity-50 mb-2">// CLIENT_TARGET</p>
                <p className="text-white">{data.client.company}</p>
            </div>
        </div>
        <div className="mb-12 flex-1">
            <p className="opacity-50 mb-4">// EXECUTION_LOG</p>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-green-500/30 text-green-700" style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary + '30' : undefined }}>
                        <th className="py-2">CMD</th>
                        <th className="py-2 text-right">QTY</th>
                        <th className="py-2 text-right">VAL</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, i) => (
                        <tr key={i} className="border-b border-green-900/50" style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary + '20' : undefined }}>
                            <td className="py-3" style={{ color: config?.theme.secondary.startsWith('#') ? config.theme.secondary : '#86efac' }}>{item.description}</td>
                            <td className="py-3 text-right">{item.quantity}</td>
                            <td className="py-3 text-right text-white">{item.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="text-right border-t-2 pt-4" style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary : '#22c55e' }}>
            <span className="animate-pulse mr-2">_</span>
            <span className="text-4xl text-white">{data.currency}{data.total}</span>
        </div>
        <PaymentAndSignature data={data} config={config} className="border-green-900" />
    </div>
);

const Design10_Magazine = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-white max-w-4xl mx-auto min-h-[1000px] relative overflow-hidden flex flex-col", config?.typography.fontFamily)} style={{ backgroundColor: config?.theme.background.startsWith('#') ? config.theme.background : undefined }}>
        <div className="absolute top-0 right-0 w-2/3 h-full bg-rose-50 -skew-x-12 translate-x-32 z-0" style={{ backgroundColor: config?.theme.primary.startsWith('#') ? config.theme.primary + '08' : undefined }}></div>
        <div className="relative z-10 p-16 flex flex-col h-full">
            <Text variant="h1" className="text-8xl mb-12 italic" config={config}>Invoice.</Text>
            <div className="flex gap-16 mb-20">
                <div className="w-32 pt-2 border-t-4 border-rose-900" style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary : undefined }}>
                    <Text variant="label" config={config}>Issue Date</Text>
                    <Text className="text-xl" config={config}>{data.date}</Text>
                </div>
                <div className="w-32 pt-2 border-t-4 border-rose-300" style={{ borderColor: config?.theme.secondary.startsWith('#') ? config.theme.secondary : undefined }}>
                    <Text variant="label" config={config}>Due Date</Text>
                    <Text className="text-xl" config={config}>{data.dueDate}</Text>
                </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 shadow-sm rounded-lg mb-8 flex-1">
                <Text variant="h2" className="mb-4" config={config}>Services Rendered</Text>
                <InvoiceTable data={data} config={config} variant="minimal" />
            </div>
            <div className="text-right mt-12">
                <Text variant="label" config={config}>Total Amount</Text>
                <Text className="text-6xl" config={config}>{data.currency}{data.total}</Text>
            </div>
            <div className="mt-12 bg-white/50 p-6 rounded-lg">
                <PaymentAndSignature data={data} config={config} />
            </div>
            <FooterSection data={data} config={config} />
        </div>
    </div>
);

const Design11_Monolith = ({ data, config }: LayoutProps) => (
    <div className="grayscale">
        <Design3_SplitVertical data={data} config={config} />
    </div>
);

const Design12_Classical = ({ data, config }: LayoutProps) => (
    <div className="font-serif bg-amber-50">
        <Design1_Executive data={data} config={config} />
    </div>
);

const Design13_DeepBlue = ({ data, config }: LayoutProps) => (
    <div className="bg-blue-900 text-white [&_*]:text-white">
        <Design6_BottomHeavy data={data} config={config} />
    </div>
);

const Design14_NeonNight = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-slate-900 p-12 min-h-[1000px] flex flex-col", config?.typography.fontFamily)} style={{ color: config?.theme.primary.startsWith('#') ? config.theme.primary : '#22d3ee' }}>
        <div className="border-2 rounded-lg p-12 flex-1 flex flex-col" style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary : '#0891b2', boxShadow: `0 0 20px ${config?.theme.primary.startsWith('#') ? config.theme.primary + '80' : 'rgba(34,211,238,0.5)'}` }}>
            <header className="flex justify-between border-b pb-8 mb-8" style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary + '50' : '#164e63' }}>
                <Text variant="h1" className="tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" config={config}>INVOICE</Text>
                <div className="text-right">
                    <Text variant="h2" config={config}>{data.vendor.name}</Text>
                </div>
            </header>
            <main className="flex-1">
                <InvoiceTable data={data} variant="minimal" config={config} className="text-cyan-200" />
            </main>
            <div className="text-right mt-8 border-t pt-8" style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary + '50' : '#164e63' }}>
                <Text variant="label" className="opacity-60" config={config}>Total Due</Text>
                <Text className="text-5xl font-mono drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" config={config}>{data.currency}{data.total}</Text>
            </div>
            <PaymentAndSignature data={data} config={config} />
            <FooterSection data={data} config={config} />
        </div>
    </div>
);

const Design15_MinimalistLines = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-white p-12 max-w-4xl mx-auto min-h-[1000px] flex flex-col", config?.typography.fontFamily)} style={{ backgroundColor: config?.theme.background.startsWith('#') ? config.theme.background : undefined }}>
        <div className="border-l-4 border-black pl-8 mb-16" style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary : undefined }}>
            <Text variant="h1" className="font-light mb-2" config={config}>{data.vendor.name}</Text>
            <Text className="text-gray-500" config={config}>{data.vendor.address}</Text>
        </div>
        <div className="flex-1">
            <InvoiceTable data={data} config={config} variant="minimal" />
        </div>
        <div className="text-right">
            <Text variant="label" config={config}>Total</Text>
            <Text className="text-4xl font-light" config={config}>{data.currency}{data.total}</Text>
        </div>
        <div className="my-12">
            <PaymentAndSignature data={data} config={config} />
        </div>
        <div className="mt-12 text-xs text-center text-gray-400">
            <Text variant="body" config={config}>simple. clean. paid.</Text>
        </div>
    </div>
);

const Design16_BoldBrutalism = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-zinc-200 p-8 max-w-4xl mx-auto min-h-[1000px] font-mono flex flex-col gap-8", config?.typography.fontFamily)}>
        <div className={cn("p-8", config?.theme.primary.startsWith('#') ? "" : "bg-zinc-900 text-white")} style={{ backgroundColor: config?.theme.primary.startsWith('#') ? config.theme.primary : undefined, color: config?.theme.primary.startsWith('#') ? '#fff' : undefined }}>
            <Text variant="h1" className="text-8xl font-black uppercase leading-none tracking-tighter" config={config}>PAY<br />NOW</Text>
        </div>
        <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Text variant="label" className="font-bold border-b-4 border-black pb-2 mb-4" config={config}>FROM</Text>
                <Text variant="h3" config={config}>{data.vendor.name}</Text>
            </div>
            <div className="bg-white p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Text variant="label" className="font-bold border-b-4 border-black pb-2 mb-4" config={config}>TO</Text>
                <Text variant="h3" config={config}>{data.client.company}</Text>
            </div>
        </div>
        <div className="bg-white p-8 border-4 border-black flex-1">
            <InvoiceTable data={data} variant="grid" config={config} />
        </div>
        <div className={cn("p-8 text-center", config?.theme.secondary.startsWith('#') ? "" : "bg-black text-white")} style={{ backgroundColor: config?.theme.secondary.startsWith('#') ? config.theme.secondary : undefined, color: config?.theme.secondary.startsWith('#') ? '#fff' : undefined }}>
            <Text variant="h1" config={config}>{data.currency}{data.total}</Text>
        </div>
        <div className="bg-white p-6 border-4 border-black">
            <PaymentAndSignature data={data} config={config} />
        </div>
    </div>
);

const Design17_NatureFresh = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-[#f0f9f0] p-12 max-w-4xl mx-auto min-h-[1000px] flex flex-col", config?.typography.fontFamily)} style={{ backgroundColor: config?.theme.background.startsWith('#') ? config.theme.background : undefined, color: config?.theme.text.startsWith('#') ? config.theme.text : '#2d5a27' }}>
        <header className="flex items-center justify-between mb-12 border-b-2 pb-6" style={{ borderColor: config?.theme.primary.startsWith('#') ? config.theme.primary : '#2d5a27' }}>
            <Text variant="h1" className="italic" config={config}>{data.vendor.name}</Text>
            <div className="text-right text-sm">
                <Text config={config}>{data.vendor.email}</Text>
            </div>
        </header>
        <main className="flex-1 bg-white p-8 rounded-lg shadow-sm border" style={{ borderColor: config?.theme.secondary.startsWith('#') ? config.theme.secondary : '#e0ece0' }}>
            <InvoiceTable data={data} variant="simple" config={config} />
            <PaymentAndSignature data={data} config={config} className="border-[#e0ece0]" />
        </main>
        <footer className="mt-8 text-center text-sm opacity-70">
            <Text variant="body" config={config}>Printed on recycled pixels.</Text>
        </footer>
    </div>
);

const Design18_AbstractShapes = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-white p-0 max-w-4xl mx-auto min-h-[1000px] relative overflow-hidden flex flex-col", config?.typography.fontFamily)}>
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-purple-200 rounded-full opacity-50 blur-3xl" style={{ backgroundColor: config?.theme.primary.startsWith('#') ? config.theme.primary + '30' : undefined }}></div>
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-200 rounded-full opacity-50 blur-3xl" style={{ backgroundColor: config?.theme.secondary.startsWith('#') ? config.theme.secondary + '30' : undefined }}></div>
        <div className="relative z-10 p-16 flex flex-col h-full">
            <div className="mb-12 glass p-8 rounded-2xl bg-white/30 backdrop-blur-md border border-white/50">
                <Text variant="h1" config={config}>{data.vendor.name}</Text>
            </div>
            <div className="glass p-8 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 flex-1 flex flex-col">
                <InvoiceTable data={data} variant="minimal" config={config} />
                <div className="mt-auto">
                    <div className="flex justify-between items-center mb-8 pb-8 border-b border-gray-100">
                        <Text variant="h3" config={config}>Total Amount</Text>
                        <Text variant="h1" config={config}>{data.currency}{data.total}</Text>
                    </div>
                    <PaymentAndSignature data={data} config={config} />
                </div>
            </div>
        </div>
    </div>
);

const Design19_CoderDark = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-[#1e1e1e] text-[#d4d4d4] p-12 font-mono min-h-[1000px] flex flex-col", config?.typography.fontFamily)}>
        <div className="mb-8">
            <span className="text-[#569cd6]">import</span> <span className="text-[#4ec9b0]">{data.vendor.name.replace(/\s/g, '')}</span> <span className="text-[#569cd6]">from</span> <span className="text-[#ce9178]">'vendor'</span>;
        </div>
        <div className="pl-4 border-l border-[#404040] mb-8">
            <p className="text-[#6a9955]">// Invoice Details</p>
            <p><span className="text-[#9cdcfe]">const</span> <span className="text-[#4fc1ff]">invoiceId</span> = <span className="text-[#b5cea8]">{data.id}</span>;</p>
            <p><span className="text-[#9cdcfe]">const</span> <span className="text-[#4fc1ff]">total</span> = <span className="text-[#b5cea8]">{data.total}</span>;</p>
        </div>
        <div className="flex-1 bg-[#252526] p-6 rounded-md">
            <InvoiceTable data={data} config={config} variant="simple" className="text-[#d4d4d4]" />
            <PaymentAndSignature data={data} config={config} className="border-[#404040]" />
        </div>
        <div className="mt-8 text-center text-[#808080]">
            <p>{`}`}</p>
        </div>
    </div>
);

const Design20_Blueprint = ({ data, config }: LayoutProps) => (
    <div className={cn("bg-[#0052cc] text-white p-12 font-mono min-h-[1000px] relative overflow-hidden", config?.typography.fontFamily)}
        style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundColor: config?.theme.primary.startsWith('#') ? config.theme.primary : undefined
        }}>
        <div className="border-4 border-white p-8 h-full flex flex-col bg-[#0052cc]/90 backdrop-blur-sm">
            <div className="border-b-2 border-white pb-4 mb-4 flex justify-between items-center">
                <Text variant="h1" className="uppercase text-white" config={config}>Blueprint</Text>
                <div className="border-2 border-white px-4 py-1 rounded text-white">APPROVED</div>
            </div>
            <div className="flex-1">
                <InvoiceTable data={data} variant="grid" config={config} className="border-white text-white" />
                <div className="mt-8 border-t border-white pt-4">
                    <PaymentAndSignature data={data} config={config} className="border-white" />
                </div>
            </div>
            <div className="border-t-2 border-white pt-4 text-right">
                <p className="text-sm opacity-70">PROJECT TOTAL</p>
                <Text variant="h1" className="text-white" config={config}>{data.currency}{data.total}</Text>
            </div>
        </div>
    </div>
);

// --- 4. MASTER COMPONENT ---

export const InvoiceLayoutEngine = ({ designId, data, config }: { designId: string; data: InvoiceData; config?: DesignConfig }) => {
    const props = { data, config };
    switch (designId) {
        case '1': case 'executive': return <Design1_Executive {...props} />;
        case '2': case 'sidebar-console': return <Design2_SidebarConsole {...props} />;
        case '3': case 'split-vertical': return <Design3_SplitVertical {...props} />;
        case '4': case 'thermal-receipt': return <Design4_ThermalReceipt {...props} />;
        case '5': case 'swiss-grid': return <Design5_SwissGrid {...props} />;
        case '6': case 'bottom-heavy': return <Design6_BottomHeavy {...props} />;
        case '7': case 'horizontal-strip': return <Design7_HorizontalStrip {...props} />;
        case '8': case 'floating-cards': return <Design8_FloatingCards {...props} />;
        case '9': case 'tech-terminal': return <Design9_TechTerminal {...props} />;
        case '10': case 'magazine': return <Design10_Magazine {...props} />;

        // Variations
        case '11': return <Design11_Monolith {...props} />;
        case '12': return <Design12_Classical {...props} />;
        case '13': return <Design13_DeepBlue {...props} />;
        case '14': return <Design14_NeonNight {...props} />;
        case '15': return <Design15_MinimalistLines {...props} />;
        case '16': return <Design16_BoldBrutalism {...props} />;
        case '17': return <Design17_NatureFresh {...props} />;
        case '18': return <Design18_AbstractShapes {...props} />;
        case '19': return <Design19_CoderDark {...props} />;
        case '20': return <Design20_Blueprint {...props} />;

        default: return <Design1_Executive {...props} />;
    }
};
