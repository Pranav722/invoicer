
import { useState, useEffect } from 'react';
import { serviceService } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface Service {
    _id: string;
    name: string;
    description?: string;
    pricing: {
        type: string;
        amount: number;
        currency: string;
    };
    category: string;
    isActive: boolean;
}

export default function Services() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Service State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        description: '',
        amount: 0,
        category: '',
        pricingType: 'fixed'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const response = await serviceService.getAll();
            setServices(response.data.data.services);
        } catch (error) {
            console.error('Failed to load services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateService = async () => {
        setError('');
        if (!createForm.name || !createForm.category || createForm.amount < 0) {
            setError('Please fill in all required fields.');
            return;
        }

        try {
            await serviceService.create({
                ...createForm,
                pricing: {
                    type: createForm.pricingType,
                    amount: createForm.amount
                }
            });
            setShowCreateModal(false);
            setCreateForm({ name: '', description: '', amount: 0, category: '', pricingType: 'fixed' });
            loadServices();
        } catch (err: any) {
            console.error('Failed to create service:', err);
            setError(err.response?.data?.message || 'Failed to create service');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl text-slate-600">Loading services...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Service Registry</h1>
                    <p className="text-slate-600">Manage standard services available for invoicing</p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all shadow-lg"
                >
                    ➕ Create Service
                </Button>
            </div>

            {services.length === 0 ? (
                <Card className="p-16 text-center">
                    <div className="text-7xl mb-4">🛠️</div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No services found</h3>
                    <p className="text-slate-500 mb-6">Create standard services to use them in invoices</p>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Create Your First Service
                    </Button>
                </Card>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Service Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Base Rate</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {services.map((service) => (
                                    <tr key={service._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{service.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {service.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-md truncate">
                                            {service.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            ${service.pricing.amount.toLocaleString()}
                                            <span className="text-xs font-normal text-slate-500 ml-1">
                                                /{service.pricing.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {service.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Service Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4">
                        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Create New Service</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Service Name</label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Web Development"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                                    <input
                                        type="text"
                                        value={createForm.category}
                                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="e.g. Development"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Pricing Type</label>
                                    <select
                                        value={createForm.pricingType}
                                        onChange={(e) => setCreateForm({ ...createForm, pricingType: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="fixed">Fixed Price</option>
                                        <option value="hourly">Hourly Rate</option>
                                        <option value="daily">Daily Rate</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Base Rate ($)</label>
                                <input
                                    type="number"
                                    value={createForm.amount}
                                    onChange={(e) => setCreateForm({ ...createForm, amount: Number(e.target.value) })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    placeholder="Service details..."
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                            <button onClick={handleCreateService} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg">Create Service</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
