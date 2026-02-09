import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vendorService, tenantService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import AddVendorModal from '../components/AddVendorModal';

interface Vendor {
    _id: string;
    companyName: string;
    email: string;
    phone?: string;
    contactPerson: string;
    header: string;
    footer: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
    };
}

export default function Vendors() {
    const navigate = useNavigate();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [error, setError] = useState('');

    // Store tenant details for auto-population
    const [tenantDetails, setTenantDetails] = useState<{
        companyName: string;
        email: string;
        phone?: string;
        address?: string;
    } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vendorRes, tenantRes] = await Promise.all([
                vendorService.getAll(),
                tenantService.getCurrent()
            ]);

            setVendors(vendorRes.data.data.vendors);

            const tenant = tenantRes.data.data;
            setTenantDetails({
                companyName: tenant.companyName,
                email: tenant.ownerEmail,
                phone: tenant.branding?.phone || '',
                address: tenant.branding?.companyAddress || ''
            });

        } catch (error) {
            console.error('Failed to load data:', error);
            setError('Failed to load data. Please refresh.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setSelectedVendor(null);
        setShowModal(true);
        setError('');
    };

    const handleOpenEdit = (vendor: Vendor) => {
        setSelectedVendor(vendor);
        setShowModal(true);
        setError('');
    };

    const filteredVendors = vendors.filter((vendor) =>
        (vendor.companyName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (vendor.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (vendor.contactPerson?.toLowerCase() || '').includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-slate-600">Loading vendors...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Vendors</h1>
                    <p className="text-slate-600">Manage client database and invoices</p>
                </div>
                <Button
                    onClick={handleOpenCreate}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
                >
                    ➕ Add Vendor
                </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Search vendors by name, email, or contact person..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            {/* Error Message */}
            {error && !showModal && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {/* Vendor Table */}
            {filteredVendors.length > 0 ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Header (Auto)
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Footer (Auto)
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                    {vendor.companyName?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{vendor.companyName}</div>
                                                    <div className="text-sm text-slate-500">{vendor.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900">{vendor.contactPerson}</div>
                                            {vendor.phone && (
                                                <div className="text-sm text-slate-500">{vendor.phone}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700">
                                                {vendor.address?.city && vendor.address?.country
                                                    ? `${vendor.address.city}, ${vendor.address.country}`
                                                    : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-600 max-w-xs truncate"
                                                title={vendor.header}>
                                                {vendor.header ? vendor.header.substring(0, 50) + '...' : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-slate-600 max-w-xs truncate"
                                                title={vendor.footer}>
                                                {vendor.footer ? vendor.footer.substring(0, 50) + '...' : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(vendor)}
                                                    className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/invoices?vendorId=${vendor._id}`)}
                                                    className="px-3 py-1 text-sm bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                                                >
                                                    Invoices
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <Card className="p-16 text-center">
                    <div className="text-7xl mb-4">🏢</div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No vendors found</h3>
                    <p className="text-slate-500 mb-6">
                        {search ? 'Try adjusting your search' : 'Add your first vendor to get started'}
                    </p>
                    <Button onClick={handleOpenCreate}>Add Vendor</Button>
                </Card>
            )}

            {/* Create/Edit Modal */}
            <AddVendorModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                initialData={selectedVendor}
                onVendorAdded={() => {
                    loadData();
                    setShowModal(false);
                }}
            />
        </div>
    );
}
