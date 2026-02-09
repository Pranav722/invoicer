import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { invoiceService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface Invoice {
    _id: string;
    invoiceNumber: string;
    vendorId: string;
    vendorSnapshot?: {
        companyName?: string;
    };
    issueDate: string;
    dueDate: string;
    total: number;
    status: string;
}

export default function Invoices() {
    const [searchParams, setSearchParams] = useSearchParams();
    const vendorIdParam = searchParams.get('vendorId');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const response = await invoiceService.getAll();
            setInvoices(response.data.data.invoices);
        } catch (error) {
            console.error('Failed to load invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
            (invoice.vendorSnapshot?.companyName?.toLowerCase() || '').includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        const matchesVendor = !vendorIdParam || invoice.vendorId === vendorIdParam;

        return matchesSearch && matchesStatus && matchesVendor;
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-slate-100 text-slate-700',
            sent: 'bg-blue-100 text-blue-700',
            paid: 'bg-green-100 text-green-700',
            overdue: 'bg-red-100 text-red-700',
            canceled: 'bg-gray-100 text-gray-500'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-slate-600">Loading invoices...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Invoices</h1>
                    <p className="text-slate-600">Manage all your invoices in one place</p>
                </div>
                <Link to="/invoices/create">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
                        ➕ Create Invoice
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
                <input
                    type="text"
                    placeholder="🔍 Search by invoice number or vendor..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="flex gap-2 flex-wrap">
                    {['all', 'draft', 'sent', 'paid', 'overdue', 'canceled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${statusFilter === status
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {vendorIdParam && (
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100">
                        <span className="text-sm font-medium">Filtering by Vendor</span>
                        <button
                            onClick={() => setSearchParams({})}
                            className="text-xs bg-white border border-blue-200 px-2 py-1 rounded hover:bg-blue-50"
                        >
                            Clear Filter
                        </button>
                    </div>
                )}
            </div>

            {/* Invoice List */}
            {filteredInvoices.length > 0 ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Invoice #
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Vendor
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Issue Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/invoices/${invoice._id}`}
                                                className="font-mono text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                                            >
                                                {invoice.invoiceNumber}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-xs">
                                                    {invoice.vendorSnapshot?.companyName?.charAt(0) || '?'}
                                                </div>
                                                <div className="font-medium text-slate-900">
                                                    {invoice.vendorSnapshot?.companyName || 'Unknown Vendor'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(invoice.issueDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-lg font-bold text-slate-900">
                                                ${invoice.total.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                                                {invoice.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/invoices/${invoice._id}`}>
                                                <button className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium">
                                                    Edit
                                                </button>
                                            </Link>

                                            {/* PDF Download */}
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const res = await invoiceService.downloadPDF(invoice._id);
                                                        const url = window.URL.createObjectURL(new Blob([res.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `Invoice-${invoice.invoiceNumber}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                    } catch (err) {
                                                        alert('Failed to download PDF');
                                                    }
                                                }}
                                                className="px-3 py-1 text-sm bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                                                title="Download PDF"
                                            >
                                                📄
                                            </button>

                                            {/* Send Reminder */}
                                            {['sent', 'viewed', 'overdue'].includes(invoice.status) && (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Send payment reminder to client?')) return;
                                                        try {
                                                            await invoiceService.sendEmail(invoice._id, { templateId: 'reminder' });
                                                            alert('Reminder sent successfully!');
                                                        } catch (err) {
                                                            alert('Failed to send reminder');
                                                        }
                                                    }}
                                                    className="px-3 py-1 text-sm bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                                                    title="Send Reminder"
                                                >
                                                    🔔
                                                </button>
                                            )}

                                            {/* Mark as Paid */}
                                            {invoice.status !== 'paid' && invoice.status !== 'canceled' && (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Mark this invoice as Paid?')) return;
                                                        try {
                                                            await invoiceService.updateStatus(invoice._id, 'paid');
                                                            loadInvoices(); // Refresh list
                                                        } catch (err) {
                                                            alert('Failed to update status');
                                                        }
                                                    }}
                                                    className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
                                                    title="Mark as Paid"
                                                >
                                                    ✓ Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <Card className="p-16 text-center">
                    <div className="text-7xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No invoices found</h3>
                    <p className="text-slate-500 mb-6">
                        {search || statusFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first invoice to get started'}
                    </p>
                    <Link to="/invoices/create">
                        <Button>Create Invoice</Button>
                    </Link>
                </Card>
            )}
        </div>
    );
}
