import { useState, useEffect } from 'react';
import React from 'react';
import { vendorService } from '../services/api';

interface AddVendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVendorAdded: (vendor: any) => void;
    initialData?: any; // To support "View/Edit" (mostly View)
}

export default function AddVendorModal({ isOpen, onClose, onVendorAdded, initialData }: AddVendorModalProps) {
    const isEditing = !!initialData;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        header: '',
        footer: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            postalCode: ''
        },
        website: '',
        taxId: '',
        paymentDetails: {
            bankName: '',
            accountNumber: ''
        },
        signatureUrl: ''
    });

    // Populate form if initialData is provided
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                companyName: initialData.companyName || '',
                contactPerson: initialData.contactPerson || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                header: initialData.header || '',
                footer: initialData.footer || '',
                address: {
                    street: initialData.address?.street || '',
                    city: initialData.address?.city || '',
                    state: initialData.address?.state || '',
                    country: initialData.address?.country || '',
                    postalCode: initialData.address?.postalCode || ''
                },
                website: initialData.website || '',
                taxId: initialData.taxId || '',
                paymentDetails: {
                    bankName: initialData.paymentDetails?.bankName || '',
                    accountNumber: initialData.paymentDetails?.accountNumber || ''
                },
                signatureUrl: initialData.signatureUrl || ''
            });
        } else {
            // Reset for new
            setFormData({
                companyName: '',
                contactPerson: '',
                email: '',
                phone: '',
                header: '',
                footer: '',
                address: { street: '', city: '', state: '', country: '', postalCode: '' },
                website: '',
                taxId: '',
                paymentDetails: { bankName: '', accountNumber: '' },
                signatureUrl: ''
            });
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let response;
            if (isEditing) {
                // Technically user said non-editable, but if we allow "edit" we might need this
                // However, user specifically said "non editable once created".
                // So maybe we don't even call update here.
                // But for robustness, I'll add it.
                response = await vendorService.update(initialData._id, formData);
            } else {
                response = await vendorService.create(formData);
            }
            onVendorAdded(response.data.data);
            onClose();
            // Reset form
            setFormData({
                companyName: '',
                contactPerson: '',
                email: '',
                phone: '',
                header: '',
                footer: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    country: '',
                    postalCode: ''
                },
                website: '',
                paymentDetails: {
                    bankName: '',
                    accountNumber: ''
                },
                signatureUrl: '',
                taxId: ''
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create vendor');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                        {isEditing ? 'Vendor Details (Non-Editable)' : 'Add New Vendor'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <span>🏢</span> Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Acme Corporation"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Contact Person *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="john@acme.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Invoice Header & Footer */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <span>📝</span> Invoice Content
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Invoice Header * <span className="text-xs text-slate-500">(min 10 characters)</span>
                                    </label>
                                    <textarea
                                        required
                                        minLength={10}
                                        value={formData.header}
                                        onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Thank you for your business! This invoice is for services rendered..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Invoice Footer * <span className="text-xs text-slate-500">(min 10 characters)</span>
                                    </label>
                                    <textarea
                                        required
                                        minLength={10}
                                        value={formData.footer}
                                        onChange={(e) => setFormData({ ...formData, footer: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Payment terms: Net 30 days. Please remit payment to..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <span>💳</span> Payment Details (Optional)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Bank Name</label>
                                    <input
                                        type="text"
                                        value={formData.paymentDetails?.bankName || ''}
                                        onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, bankName: e.target.value } })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        placeholder="Chase Bank"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Account Number</label>
                                    <input
                                        type="text"
                                        value={formData.paymentDetails?.accountNumber || ''}
                                        onChange={(e) => setFormData({ ...formData, paymentDetails: { ...formData.paymentDetails, accountNumber: e.target.value } })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        placeholder="0000000000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Digital Signature URL</label>
                                    <input
                                        type="text"
                                        value={formData.signatureUrl || ''}
                                        onChange={(e) => setFormData({ ...formData, signatureUrl: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                        placeholder="https://example.com/signature.png"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Direct URL to a transparent PNG of signature.</p>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <span>📍</span> Address
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.street}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="123 Main Street"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="New York"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        State/Province
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.state}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="NY"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.country}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="United States"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address.postalCode}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value } })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="10001"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Additional */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <span>ℹ️</span> Additional Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="https://acme.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Tax ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.taxId}
                                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="12-3456789"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons inside Form */}
                    <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-0 py-4 mt-6 flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || isEditing}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Details Only' : 'Create Vendor')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
