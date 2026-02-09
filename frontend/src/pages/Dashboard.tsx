import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { invoiceService } from '../services/api';
import { Card, CardHeader, CardTitle, CardBody, Button, StatusBadge } from '../components/ui';
import { useAuth } from '../context/AuthContext';

interface InvoiceStats {
    totalInvoices: number;
    totalRevenue: number;
    outstandingAmount: number;
    byStatus: Array<{ _id: string; count: number; totalAmount: number }>;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<InvoiceStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await invoiceService.getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-slate-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Invoices',
            value: stats?.totalInvoices || 0,
            icon: '📄',
            color: 'blue',
            trend: '+12%',
            gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
        },
        {
            label: 'Total Revenue',
            value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
            icon: '💰',
            color: 'green',
            trend: '+23%',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        },
        {
            label: 'Outstanding',
            value: `$${(stats?.outstandingAmount || 0).toLocaleString()}`,
            icon: '⏳',
            color: 'warning',
            trend: '-5%',
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
        }
    ];

    const statusData = stats?.byStatus || [];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-lg text-slate-600">
                        Welcome back! Here's an overview of your invoices.
                    </p>
                </div>
                <Link to="/invoices/create">
                    <Button variant="primary" size="lg">
                        <span className="mr-2">➕</span>
                        Create Invoice
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                                    {stat.label}
                                </p>
                                <h3 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                                    {stat.value}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.trend.startsWith('+')
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                        }`}>
                                        {stat.trend}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">vs last month</span>
                                </div>
                            </div>
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform transition-transform group-hover:scale-110"
                                style={{ background: stat.gradient }}
                            >
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/invoices/create">
                        <div className="flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group h-full">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center text-2xl transition-all transform group-hover:scale-110">
                                ➕
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                    Create Invoice
                                </h3>
                                <p className="text-xs text-slate-500">New invoice with AI</p>
                            </div>
                        </div>
                    </Link>

                    {['owner', 'admin'].includes(user?.role || '') && (
                        <>
                            <Link to="/vendors">
                                <div className="flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group h-full">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center text-2xl transition-all transform group-hover:scale-110">
                                        🏢
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                            Manage Vendors
                                        </h3>
                                        <p className="text-xs text-slate-500">Add or edit clients</p>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/services">
                                <div className="flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group h-full">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center text-2xl transition-all transform group-hover:scale-110">
                                        🛠️
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                            Manage Services
                                        </h3>
                                        <p className="text-xs text-slate-500">Service catalog</p>
                                    </div>
                                </div>
                            </Link>
                        </>
                    )}

                    <Link to="/invoices">
                        <div className="flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group h-full">
                            <div className="w-12 h-12 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center text-2xl transition-all transform group-hover:scale-110">
                                📊
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                                    View All Invoices
                                </h3>
                                <p className="text-xs text-slate-500">Complete list</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Invoice Status Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice Status Breakdown</CardTitle>
                    <Link to="/invoices">
                        <Button variant="ghost" size="sm">View All →</Button>
                    </Link>
                </CardHeader>
                <CardBody>
                    {statusData.length > 0 ? (
                        <div className="space-y-4">
                            {statusData.map((status) => (
                                <div
                                    key={status._id}
                                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${status._id === 'paid' ? 'bg-green-100 text-green-600' :
                                            status._id === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                                status._id === 'overdue' ? 'bg-red-100 text-red-600' :
                                                    'bg-slate-200 text-slate-600'
                                            }`}>
                                            <StatusBadge status={status._id} />
                                        </div>
                                        <span className="text-sm text-slate-600 font-medium">
                                            {status.count} invoice{status.count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="font-bold text-slate-900 text-lg tracking-tight group-hover:scale-105 transition-transform">
                                        ${status.totalAmount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <div className="text-5xl mb-3 opacity-50">📊</div>
                            <p className="text-slate-500 mb-4 text-base font-medium">
                                No invoice data available yet.
                            </p>
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
}
