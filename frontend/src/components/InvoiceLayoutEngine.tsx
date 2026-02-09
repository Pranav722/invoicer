
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
    footer?: {
        contact?: string;
        email?: string;
        address?: string;
        terms?: string;
    };
}

interface LayoutProps {
    data: InvoiceData;
}

// --- 2. REUSABLE ATOMS (Building Blocks) ---

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

const Text = ({ children, className, variant = 'body' }: { children: React.ReactNode; className?: string; variant?: 'h1' | 'h2' | 'h3' | 'label' | 'body' | 'mono' }) => {
    const styles = {
        h1: 'text-3xl font-bold tracking-tight',
        h2: 'text-xl font-semibold',
        h3: 'text-lg font-medium',
        label: 'text-xs uppercase tracking-wider opacity-70',
        body: 'text-sm',
        mono: 'font-mono text-sm',
    };
    return <div className={cn(styles[variant], className)}>{children}</div>;
};

const InvoiceTable = ({ data, variant = 'simple', className }: { data: InvoiceData; variant?: 'simple' | 'striped' | 'grid' | 'minimal'; className?: string }) => (
    <table className={cn("w-full text-left border-collapse", className)}>
        <thead>
            <tr className={cn(
                variant === 'striped' && "bg-slate-100",
                variant === 'grid' && "border-y-2 border-black",
                "text-sm"
            )}>
                <th className="py-2 px-3">Description</th>
                <th className="py-2 px-3 text-right">Qty</th>
                <th className="py-2 px-3 text-right">Rate</th>
                <th className="py-2 px-3 text-right">Amount</th>
            </tr>
        </thead>
        <tbody className="text-sm">
            {data.items.map((item, i) => (
                <tr key={i} className={cn(
                    variant === 'striped' && i % 2 === 0 && "bg-slate-50",
                    variant === 'grid' && "border-b border-gray-300"
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

const PaymentAndSignature = ({ data, className }: LayoutProps & { className?: string }) => (
    <div className={cn("grid grid-cols-2 gap-8 mt-8 border-t border-gray-100 pt-6", className)}>
        <div>
            <Text variant="label" className="mb-2">Contact & Information</Text>
            <div className="text-sm space-y-1">
                {data.footer?.contact && <p><span className="opacity-60">Phone:</span> {data.footer.contact}</p>}
                {data.footer?.email && <p><span className="opacity-60">Email:</span> {data.footer.email}</p>}
                {data.footer?.address && <p><span className="opacity-60">Address:</span> {data.footer.address}</p>}
                {data.vendor.taxId && <p><span className="opacity-60">Tax ID:</span> {data.vendor.taxId}</p>}
            </div>
        </div>
        <div className="text-right flex flex-col items-end">
            {data.vendor.signature && (
                <>
                    <img src={data.vendor.signature} alt="Signature" className="h-16 mb-2 object-contain" />
                    <Text variant="label">Authorized Signature</Text>
                </>
            )}
        </div>
    </div>
);

const FooterSection = ({ data }: LayoutProps) => (
    <div className="mt-auto pt-8 border-t border-gray-200 text-sm opacity-80">
        <div className="grid grid-cols-1 gap-8 text-center">
            <div className="text-xs opacity-60">
                <p>{data.footer?.terms || 'Thank you for your business. Payment is due within 30 days.'}</p>
            </div>
        </div>
    </div>
);

// --- 3. THE 20 UNIQUE DESIGNS ---

const Design1_Executive = ({ data }: LayoutProps) => (
    <div className="bg-white p-12 max-w-4xl mx-auto shadow-lg min-h-[1000px] flex flex-col gap-10">
        <header className="flex justify-between items-start border-b-2 border-slate-800 pb-6">
            <div>
                <Text variant="h1" className="text-slate-900">INVOICE</Text>
                <Text variant="mono" className="mt-2">#{data.id}</Text>
            </div>
            <div className="text-right">
                <Text variant="h2">{data.vendor.name}</Text>
                <Text className="text-slate-500 mt-1">{data.vendor.email}</Text>
            </div>
        </header>
        <div className="grid grid-cols-2 gap-12">
            <div>
                <Text variant="label" className="mb-2">Bill To</Text>
                <Text variant="h3">{data.client.company}</Text>
                <Text className="mt-1 whitespace-pre-line">{data.client.address}</Text>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><Text variant="label">Date</Text><Text>{data.date}</Text></div>
                <div><Text variant="label">Due Date</Text><Text>{data.dueDate}</Text></div>
            </div>
        </div>
        <InvoiceTable data={data} variant="striped" />
        <div className="self-end w-64 border-t pt-4">
            <div className="flex justify-between text-lg font-bold text-slate-900">
                <span>Total</span>
                <span>{data.currency}{data.total}</span>
            </div>
        </div>
        <PaymentAndSignature data={data} />
        <FooterSection data={data} />
    </div>
);

const Design2_SidebarConsole = ({ data }: LayoutProps) => (
    <div className="bg-white max-w-4xl mx-auto shadow-lg min-h-[1000px] grid grid-cols-[280px_1fr]">
        <aside className="bg-slate-900 text-slate-300 p-8 flex flex-col gap-8">
            <div>
                <div className="h-12 w-12 bg-indigo-500 rounded-lg mb-4"></div>
                <Text variant="h2" className="text-white">{data.vendor.name}</Text>
            </div>
            <div className="mt-auto">
                <Text variant="label" className="text-slate-500">Invoice ID</Text>
                <Text variant="mono" className="text-white text-xl">#{data.id}</Text>
            </div>
            <div>
                <Text variant="label" className="text-slate-500">Issued</Text>
                <Text className="text-white">{data.date}</Text>
            </div>
        </aside>
        <main className="p-12 flex flex-col gap-10">
            <div>
                <Text variant="label" className="text-slate-400 mb-2">Billed To</Text>
                <Text variant="h1" className="text-slate-800">{data.client.company}</Text>
            </div>
            <InvoiceTable data={data} variant="simple" />
            <div className="bg-slate-50 p-6 rounded-xl self-end w-full max-w-xs">
                <div className="flex justify-between items-center">
                    <Text variant="h3">Total Due</Text>
                    <Text variant="h2" className="text-indigo-600">{data.currency}{data.total}</Text>
                </div>
            </div>
            <PaymentAndSignature data={data} />
            <FooterSection data={data} />
        </main>
    </div>
);

const Design3_SplitVertical = ({ data }: LayoutProps) => (
    <div className="bg-white max-w-4xl mx-auto shadow-lg min-h-[1000px] grid grid-cols-2">
        <div className="bg-emerald-600 text-white p-12 flex flex-col justify-between">
            <div>
                <Text variant="label" className="text-emerald-200">Vendor</Text>
                <Text variant="h1" className="mt-2">{data.vendor.name}</Text>
                <Text className="mt-4 opacity-90">{data.vendor.address}</Text>
            </div>
            <div>
                <Text variant="h1" className="text-6xl font-thin opacity-50">#{data.id}</Text>
            </div>
        </div>
        <div className="p-12 flex flex-col gap-8">
            <div>
                <Text variant="label" className="text-emerald-800">Client</Text>
                <Text variant="h2">{data.client.company}</Text>
            </div>
            <InvoiceTable data={data} variant="minimal" />
            <div className="mt-auto pt-8 border-t border-emerald-100">
                <Text variant="h1" className="text-right text-emerald-800">{data.currency}{data.total}</Text>
            </div>
            <PaymentAndSignature data={data} className="border-emerald-100" />
            <FooterSection data={data} />
        </div>
    </div>
);

const Design4_ThermalReceipt = ({ data }: LayoutProps) => (
    <div className="bg-yellow-50 max-w-[400px] mx-auto shadow-xl min-h-[800px] p-6 font-mono text-sm border-x-4 border-dashed border-gray-300 relative flex flex-col">
        <div className="text-center mb-8">
            <div className="h-10 w-10 bg-black rounded-full mx-auto mb-2"></div>
            <Text variant="h2" className="uppercase">{data.vendor.name}</Text>
            <Text className="text-xs">{data.vendor.address}</Text>
        </div>
        <div className="border-y-2 border-black border-dashed py-4 mb-6">
            <div className="flex justify-between"><span>DATE:</span><span>{data.date}</span></div>
            <div className="flex justify-between"><span>INV #:</span><span>{data.id}</span></div>
        </div>
        <div className="flex flex-col gap-2 mb-6">
            {data.items.map((item, i) => (
                <div key={i} className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="font-bold">{item.description}</span>
                        <span className="text-xs opacity-60">x{item.quantity} @ {item.rate}</span>
                    </div>
                    <span>{item.amount}</span>
                </div>
            ))}
        </div>
        <div className="border-t-2 border-black pt-4 flex justify-between text-lg font-bold">
            <span>TOTAL</span>
            <span>{data.currency}{data.total}</span>
        </div>
        <PaymentAndSignature data={data} className="border-black border-dashed" />
        <div className="mt-auto pt-8 text-center text-xs">
            <p>THANK YOU COME AGAIN</p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-4 bg-white" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>
    </div >
);

const Design5_SwissGrid = ({ data }: LayoutProps) => (
    <div className="bg-white max-w-4xl mx-auto shadow-none min-h-[1000px] border-4 border-black p-4">
        <div className="grid grid-cols-3 gap-4 h-full">
            <div className="col-span-2 border-2 border-black p-6 bg-orange-500">
                <Text variant="h1" className="text-7xl font-bold tracking-tighter">INVOICE</Text>
            </div>
            <div className="border-2 border-black p-6 flex items-center justify-center bg-yellow-400">
                <Text variant="h2">#{data.id}</Text>
            </div>
            <div className="border-2 border-black p-6 h-40">
                <Text variant="label" className="font-bold">From</Text>
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

const Design6_BottomHeavy = ({ data }: LayoutProps) => (
    <div className="bg-stone-100 max-w-4xl mx-auto shadow-lg min-h-[1000px] flex flex-col p-16">
        <div className="mb-12">
            <Text variant="label" className="text-stone-500 mb-2">Amount Due</Text>
            <Text className="text-9xl font-bold text-stone-900 tracking-tighter">{data.currency}{data.total}</Text>
        </div>
        <div className="grid grid-cols-2 gap-12 mb-12 border-t border-stone-300 pt-8">
            <div>
                <Text variant="h3">{data.client.company}</Text>
                <Text className="text-stone-500">Client ID: 8829</Text>
            </div>
            <div className="text-right">
                <Text variant="h3">{data.vendor.name}</Text>
                <Text className="text-stone-500">{data.date}</Text>
            </div>
        </div>
        <InvoiceTable data={data} variant="simple" className="opacity-80" />
        <div className="mb-12">
            <PaymentAndSignature data={data} />
        </div>
        <FooterSection data={data} />
    </div>
);

const Design7_HorizontalStrip = ({ data }: LayoutProps) => (
    <div className="bg-white max-w-4xl mx-auto shadow-lg min-h-[1000px] flex flex-col">
        <div className="h-32 p-12">
            <Text variant="h2" className="text-indigo-600">{data.vendor.name}</Text>
        </div>
        <div className="bg-indigo-900 text-white p-12 grid grid-cols-3 gap-8">
            <div>
                <Text variant="label" className="text-indigo-300">Invoice</Text>
                <Text variant="h2">#{data.id}</Text>
            </div>
            <div>
                <Text variant="label" className="text-indigo-300">Bill To</Text>
                <Text>{data.client.company}</Text>
            </div>
            <div>
                <Text variant="label" className="text-indigo-300">Total</Text>
                <Text variant="h2">{data.currency}{data.total}</Text>
            </div>
        </div>
        <div className="p-12 flex-1">
            <InvoiceTable data={data} variant="striped" />
        </div>
        <div className="px-12 pb-4">
            <PaymentAndSignature data={data} />
        </div>
        <div className="p-12">
            <FooterSection data={data} />
        </div>
    </div>
);

const Design8_FloatingCards = ({ data }: LayoutProps) => (
    <div className="bg-gray-100 max-w-4xl mx-auto min-h-[1000px] p-12 flex flex-col gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm flex justify-between items-center">
            <Text variant="h2" className="text-gray-700">{data.vendor.name}</Text>
            <div className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-xs font-bold">PAID</div>
        </div>
        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
                <Text variant="label" className="mb-2">From</Text>
                <Text className="font-medium">{data.vendor.address}</Text>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
                <Text variant="label" className="mb-2">To</Text>
                <Text variant="h3">{data.client.company}</Text>
            </div>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm flex-grow">
            <InvoiceTable data={data} variant="minimal" />
        </div>
        <div className="bg-gray-800 text-white p-8 rounded-2xl shadow-sm flex justify-between items-center">
            <Text>Thank you.</Text>
            <Text variant="h1">{data.currency}{data.total}</Text>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm">
            <PaymentAndSignature data={data} />
        </div>
    </div>
);

const Design9_TechTerminal = ({ data }: LayoutProps) => (
    <div className="bg-black max-w-4xl mx-auto min-h-[1000px] p-12 font-mono text-green-500 flex flex-col">
        <div className="mb-8 border-b border-green-900 pb-4">
            <p>{'>'} SYSTEM_CHECK: <span className="text-green-300">OK</span></p>
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
                    <tr className="border-b border-green-500/30 text-green-700">
                        <th className="py-2">CMD</th>
                        <th className="py-2 text-right">QTY</th>
                        <th className="py-2 text-right">VAL</th>
                    </tr>
                </thead>
                <tbody>
                    {data.items.map((item, i) => (
                        <tr key={i} className="border-b border-green-900/50">
                            <td className="py-3 text-green-300">{item.description}</td>
                            <td className="py-3 text-right">{item.quantity}</td>
                            <td className="py-3 text-right text-white">{item.amount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="text-right border-t-2 border-green-500 pt-4">
            <span className="animate-pulse mr-2">_</span>
            <span className="text-4xl text-white">{data.currency}{data.total}</span>
        </div>
        <PaymentAndSignature data={data} className="border-green-900" />
    </div>
);

const Design10_Magazine = ({ data }: LayoutProps) => (
    <div className="bg-white max-w-4xl mx-auto min-h-[1000px] relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-rose-50 -skew-x-12 translate-x-32 z-0"></div>
        <div className="relative z-10 p-16 flex flex-col h-full">
            <Text variant="h1" className="text-8xl font-serif text-rose-900 mb-12 italic">Invoice.</Text>
            <div className="flex gap-16 mb-20">
                <div className="w-32 pt-2 border-t-4 border-rose-900">
                    <Text variant="label" className="text-black">Issue Date</Text>
                    <Text className="font-serif text-xl">{data.date}</Text>
                </div>
                <div className="w-32 pt-2 border-t-4 border-rose-300">
                    <Text variant="label" className="text-black">Due Date</Text>
                    <Text className="font-serif text-xl">{data.dueDate}</Text>
                </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 shadow-sm rounded-lg mb-8 flex-1">
                <Text variant="h2" className="font-serif mb-4">Services Rendered</Text>
                <InvoiceTable data={data} variant="minimal" />
            </div>
            <div className="text-right mt-12">
                <Text variant="label">Total Amount</Text>
                <Text className="text-6xl font-serif text-rose-600">{data.currency}{data.total}</Text>
            </div>
            <div className="mt-12 bg-white/50 p-6 rounded-lg">
                <PaymentAndSignature data={data} />
            </div>
            <FooterSection data={data} />
        </div>
    </div>
);

const Design11_Monolith = ({ data }: LayoutProps) => (
    <div className="grayscale">
        <Design3_SplitVertical data={data} />
    </div>
);

const Design12_Classical = ({ data }: LayoutProps) => (
    <div className="font-serif bg-amber-50">
        <Design1_Executive data={data} />
    </div>
);

const Design13_DeepBlue = ({ data }: LayoutProps) => (
    <div className="bg-blue-900 text-white [&_*]:text-white">
        <Design6_BottomHeavy data={data} />
    </div>
);

const Design14_NeonNight = ({ data }: LayoutProps) => (
    <div className="bg-slate-900 text-cyan-400">
        <div className="p-12 border-2 border-cyan-500 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] min-h-[1000px] flex flex-col">
            <header className="flex justify-between border-b border-cyan-800 pb-8 mb-8">
                <h1 className="text-4xl font-bold tracking-widest text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">INVOICE</h1>
                <div className="text-right">
                    <h2 className="text-xl text-cyan-100">{data.vendor.name}</h2>
                </div>
            </header>
            <main className="flex-1">
                <InvoiceTable data={data} variant="minimal" className="text-cyan-200" />
            </main>
            <div className="text-right mt-8 border-t border-cyan-800 pt-8">
                <p className="text-sm uppercase tracking-widest text-cyan-600">Total Due</p>
                <p className="text-5xl font-mono text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">{data.currency}{data.total}</p>
            </div>
            <PaymentAndSignature data={data} className="border-cyan-800 text-cyan-400" />
            <FooterSection data={data} />
        </div>
    </div>
);

const Design15_MinimalistLines = ({ data }: LayoutProps) => (
    <div className="bg-white p-12 max-w-4xl mx-auto min-h-[1000px] flex flex-col">
        <div className="border-l-4 border-black pl-8 mb-16">
            <h1 className="text-6xl font-light mb-2">{data.vendor.name}</h1>
            <p className="text-gray-500">{data.vendor.address}</p>
        </div>
        <div className="flex-1">
            <InvoiceTable data={data} variant="minimal" />
        </div>
        <div className="text-right">
            <p className="text-xs uppercase tracking-widest">Total</p>
            <p className="text-4xl font-light">{data.currency}{data.total}</p>
        </div>
        <div className="my-12">
            <PaymentAndSignature data={data} />
        </div>
        <div className="mt-12 text-xs text-center text-gray-400">
            simple. clean. paid.
        </div>
    </div>
);

const Design16_BoldBrutalism = ({ data }: LayoutProps) => (
    <div className="bg-zinc-200 p-8 max-w-4xl mx-auto min-h-[1000px] font-mono">
        <div className="bg-zinc-900 text-white p-8 mb-8">
            <h1 className="text-8xl font-black uppercase leading-none tracking-tighter">PAY<br />NOW</h1>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-8 border-4 border-black box-shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-bold border-b-4 border-black pb-2 mb-4">FROM</p>
                <p className="text-xl font-bold">{data.vendor.name}</p>
            </div>
            <div className="bg-white p-8 border-4 border-black box-shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-bold border-b-4 border-black pb-2 mb-4">TO</p>
                <p className="text-xl font-bold">{data.client.company}</p>
            </div>
        </div>
        <div className="bg-white p-8 border-4 border-black">
            <InvoiceTable data={data} variant="grid" />
        </div>
        <div className="bg-black text-white p-8 mt-8 text-center">
            <p className="text-4xl font-black">{data.currency}{data.total}</p>
        </div>
        <div className="bg-white p-6 border-4 border-black mt-8">
            <PaymentAndSignature data={data} />
        </div>
    </div>
);

const Design17_NatureFresh = ({ data }: LayoutProps) => (
    <div className="bg-[#f0f9f0] p-12 max-w-4xl mx-auto min-h-[1000px] flex flex-col text-[#2d5a27]">
        <header className="flex items-center justify-between mb-12 border-b-2 border-[#2d5a27] pb-6">
            <h1 className="text-3xl font-serif italic">{data.vendor.name}</h1>
            <div className="text-right text-sm">
                <p>{data.vendor.email}</p>
            </div>
        </header>
        <main className="flex-1 bg-white p-8 rounded-lg shadow-sm border border-[#e0ece0]">
            <InvoiceTable data={data} variant="simple" />
            <PaymentAndSignature data={data} className="border-[#e0ece0]" />
        </main>
        <footer className="mt-8 text-center text-sm opacity-70">
            <p>Printed on recycled pixels.</p>
        </footer>
    </div>
);

const Design18_AbstractShapes = ({ data }: LayoutProps) => (
    <div className="bg-white p-0 max-w-4xl mx-auto min-h-[1000px] relative overflow-hidden flex flex-col">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] bg-purple-200 rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-blue-200 rounded-full opacity-50 blur-3xl"></div>
        <div className="relative z-10 p-16 flex flex-col h-full">
            <div className="mb-12 glass p-8 rounded-2xl bg-white/30 backdrop-blur-md border border-white/50">
                <h1 className="text-4xl font-bold text-gray-800">{data.vendor.name}</h1>
            </div>
            <div className="glass p-8 rounded-2xl bg-white/60 backdrop-blur-md border border-white/50 flex-1">
                <InvoiceTable data={data} variant="minimal" />
                <PaymentAndSignature data={data} />
            </div>
        </div>
    </div>
);

const Design19_CoderDark = ({ data }: LayoutProps) => (
    <div className="bg-[#1e1e1e] text-[#d4d4d4] p-12 font-mono min-h-[1000px] flex flex-col">
        <div className="mb-8">
            <p className="text-[#569cd6]">import</p> <span className="text-[#4ec9b0]">{data.vendor.name.replace(/\s/g, '')}</span> <p className="text-[#569cd6]">from</p> <span className="text-[#ce9178]">'vendor'</span>;
        </div>
        <div className="pl-4 border-l border-[#404040] mb-8">
            <p className="text-[#6a9955]">// Invoice Details</p>
            <p><span className="text-[#9cdcfe]">const</span> <span className="text-[#4fc1ff]">invoiceId</span> = <span className="text-[#b5cea8]">{data.id}</span>;</p>
            <p><span className="text-[#9cdcfe]">const</span> <span className="text-[#4fc1ff]">total</span> = <span className="text-[#b5cea8]">{data.total}</span>;</p>
        </div>
        <div className="flex-1 bg-[#252526] p-6 rounded-md">
            <InvoiceTable data={data} variant="simple" className="text-[#d4d4d4]" />
            <PaymentAndSignature data={data} className="border-[#404040]" />
        </div>
        <div className="mt-8 text-center text-[#808080]">
            <p>{`}`}</p>
        </div>
    </div>
);

const Design20_Blueprint = ({ data }: LayoutProps) => (
    <div className="bg-[#0052cc] text-white p-12 font-mono min-h-[1000px] relative overflow-hidden"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        <div className="border-4 border-white p-8 h-full flex flex-col bg-[#0052cc]/90 backdrop-blur-sm">
            <div className="border-b-2 border-white pb-4 mb-4 flex justify-between items-center">
                <h1 className="text-4xl font-bold uppercase">Blueprint</h1>
                <div className="border-2 border-white px-4 py-1 rounded">APPROVED</div>
            </div>
            <div className="flex-1">
                <InvoiceTable data={data} variant="grid" className="border-white text-white" />
                <div className="mt-8 border-t border-white pt-4">
                    <PaymentAndSignature data={data} className="border-white" />
                </div>
            </div>
            <div className="border-t-2 border-white pt-4 text-right">
                <p className="text-sm opacity-70">PROJECT TOTAL</p>
                <p className="text-5xl font-bold">{data.currency}{data.total}</p>
            </div>
        </div>
    </div>
);

// --- 4. MASTER COMPONENT ---

export const InvoiceLayoutEngine = ({ designId, data }: { designId: string; data: InvoiceData }) => {
    switch (designId) {
        case '1': case 'executive': return <Design1_Executive data={data} />;
        case '2': case 'sidebar-console': return <Design2_SidebarConsole data={data} />;
        case '3': case 'split-vertical': return <Design3_SplitVertical data={data} />;
        case '4': case 'thermal-receipt': return <Design4_ThermalReceipt data={data} />;
        case '5': case 'swiss-grid': return <Design5_SwissGrid data={data} />;
        case '6': case 'bottom-heavy': return <Design6_BottomHeavy data={data} />;
        case '7': case 'horizontal-strip': return <Design7_HorizontalStrip data={data} />;
        case '8': case 'floating-cards': return <Design8_FloatingCards data={data} />;
        case '9': case 'tech-terminal': return <Design9_TechTerminal data={data} />;
        case '10': case 'magazine': return <Design10_Magazine data={data} />;

        // Variations
        case '11': return <Design11_Monolith data={data} />;
        case '12': return <Design12_Classical data={data} />;
        case '13': return <Design13_DeepBlue data={data} />;
        case '14': return <Design14_NeonNight data={data} />;
        case '15': return <Design15_MinimalistLines data={data} />;
        case '16': return <Design16_BoldBrutalism data={data} />;
        case '17': return <Design17_NatureFresh data={data} />;
        case '18': return <Design18_AbstractShapes data={data} />;
        case '19': return <Design19_CoderDark data={data} />;
        case '20': return <Design20_Blueprint data={data} />;

        default: return <Design1_Executive data={data} />;
    }
};
