import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardBody, Button, Input } from '../components/ui';
import UserManagement from '../components/UserManagement';
import { tenantService, uploadService } from '../services/api';
import type { SignaturePadRef } from '../components/SignaturePad';
import SignaturePad from '../components/SignaturePad';

// Unified Settings Form Interface
interface SettingsForm {
    // Company Info
    companyName: string;
    email: string;
    phone: string;
    website: string;
    taxId: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    // Branding
    logo: string;
    primaryColor: string;
    accentColor: string;
    signatureUrl: string;
    // Payment Details
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode: string;
    iban: string;
    ifscCode: string;
    // Invoice Rules & Preferences
    invoicePrefix: string;
    invoiceNumberPadding: number;
    defaultCurrency: string;
    defaultPaymentTerms: number;
    autoEmailInvoices: boolean; // NEW
}

export default function Settings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const sigPadRef = useRef<SignaturePadRef>(null);

    // Initial State
    const [formData, setFormData] = useState<SettingsForm>({
        companyName: '',
        email: '',
        phone: '',
        website: '',
        taxId: '',
        address: { street: '', city: '', state: '', postalCode: '', country: '' },
        logo: '',
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        signatureUrl: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: '',
        iban: '',
        ifscCode: '',
        invoicePrefix: 'INV',
        invoiceNumberPadding: 4,
        defaultCurrency: 'USD',
        defaultPaymentTerms: 30,
        autoEmailInvoices: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await tenantService.getCurrent();
            const tenant = response.data.data;

            if (tenant) {
                setFormData(prev => ({
                    ...prev,
                    // Company
                    companyName: tenant.companyName || '',
                    email: tenant.email || '',
                    phone: tenant.phone || '',
                    website: tenant.website || '',
                    taxId: tenant.taxId || '',
                    address: tenant.address || prev.address,
                    // Branding
                    logo: tenant.branding?.logo || '',
                    primaryColor: tenant.branding?.primaryColor || '#3B82F6',
                    accentColor: tenant.branding?.accentColor || '#10B981',
                    signatureUrl: tenant.branding?.signatureUrl || '',
                    // Payment
                    bankName: tenant.paymentDetails?.bankName || '',
                    accountName: tenant.paymentDetails?.accountName || '',
                    accountNumber: tenant.paymentDetails?.accountNumber || '',
                    routingNumber: tenant.paymentDetails?.routingNumber || '',
                    swiftCode: tenant.paymentDetails?.swiftCode || '',
                    iban: tenant.paymentDetails?.iban || '',
                    ifscCode: tenant.paymentDetails?.ifscCode || '',
                    // Rules
                    invoicePrefix: tenant.settings?.invoicePrefix || 'INV',
                    invoiceNumberPadding: tenant.settings?.invoiceNumberPadding || 4,
                    defaultCurrency: tenant.settings?.defaultCurrency || 'USD',
                    defaultPaymentTerms: tenant.settings?.defaultPaymentTerms || 30,
                    autoEmailInvoices: tenant.settings?.autoEmailInvoices || false
                }));
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        if (field.startsWith('address.')) {
            const addressField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: { ...prev.address, [addressField]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const response = await uploadService.uploadFile(file);
            const url = response.data.data.url;
            setFormData(prev => ({ ...prev, [type === 'logo' ? 'logo' : 'signatureUrl']: url }));
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. PLease try again.");
        }
    };

    const handleSaveAll = async () => {
        setSaving(true);

        let currentSignatureUrl = formData.signatureUrl;

        // Process Signature Pad if used
        if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
            try {
                // Convert base64 to blob and upload
                const dataUrl = sigPadRef.current.toDataURL();
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], 'signature.png', { type: 'image/png' });

                const uploadRes = await uploadService.uploadFile(file);
                currentSignatureUrl = uploadRes.data.data.url;
                // Update local state too
                setFormData(prev => ({ ...prev, signatureUrl: currentSignatureUrl }));
                sigPadRef.current.clear(); // Clear after save
            } catch (err) {
                console.error("Failed to upload drawn signature", err);
                alert("Failed to save drawn signature.");
                setSaving(false);
                return;
            }
        }

        try {
            // Concurrent updates
            await Promise.all([
                // 1. Profile & Payment
                tenantService.updateProfile({
                    companyName: formData.companyName,
                    email: formData.email,
                    phone: formData.phone,
                    website: formData.website,
                    taxId: formData.taxId,
                    address: formData.address,
                    paymentDetails: {
                        bankName: formData.bankName,
                        accountName: formData.accountName,
                        accountNumber: formData.accountNumber,
                        routingNumber: formData.routingNumber,
                        swiftCode: formData.swiftCode,
                        iban: formData.iban,
                        ifscCode: formData.ifscCode
                    }
                }),
                // 2. Branding (Logo & Sig)
                tenantService.updateBranding({
                    logo: formData.logo,
                    primaryColor: formData.primaryColor,
                    accentColor: formData.accentColor,
                    signatureUrl: currentSignatureUrl
                }),
                // 3. Settings (Rules + AutoEmail)
                tenantService.updateSettings({
                    invoicePrefix: formData.invoicePrefix,
                    invoiceNumberPadding: formData.invoiceNumberPadding,
                    defaultCurrency: formData.defaultCurrency,
                    defaultPaymentTerms: formData.defaultPaymentTerms,
                    autoEmailInvoices: formData.autoEmailInvoices
                })
            ]);

            alert("All settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading settings...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto pb-24 relative">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your workspace preferences</p>
            </div>

            <div className="space-y-8">
                {/* 1. Company Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Company Details</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Company Name" value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} />
                            <Input label="Email" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                            <Input label="Phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                            <Input label="Website" value={formData.website} onChange={e => handleChange('website', e.target.value)} />
                            <Input label="Tax ID / VAT Number" value={formData.taxId} onChange={e => handleChange('taxId', e.target.value)} />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Address</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input placeholder="Street Address" value={formData.address.street} onChange={e => handleChange('address.street', e.target.value)} className="md:col-span-2" />
                                <Input placeholder="City" value={formData.address.city} onChange={e => handleChange('address.city', e.target.value)} />
                                <Input placeholder="State/Province" value={formData.address.state} onChange={e => handleChange('address.state', e.target.value)} />
                                <Input placeholder="Postal Code" value={formData.address.postalCode} onChange={e => handleChange('address.postalCode', e.target.value)} />
                                <Input placeholder="Country" value={formData.address.country} onChange={e => handleChange('address.country', e.target.value)} />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* 2. Branding (Logo & Signature) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branding & Identity</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-6">
                            {/* Logo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                                <div className="flex items-center gap-4">
                                    {formData.logo && (
                                        <img src={formData.logo} alt="Logo" className="h-16 w-16 object-contain border rounded-lg bg-gray-50" />
                                    )}
                                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                </div>
                            </div>

                            {/* Colors */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={formData.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} className="h-9 w-16 cursor-pointer border rounded" />
                                        <input type="text" value={formData.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} className="flex-1 text-sm border-gray-300 rounded-md" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" value={formData.accentColor} onChange={e => handleChange('accentColor', e.target.value)} className="h-9 w-16 cursor-pointer border rounded" />
                                        <input type="text" value={formData.accentColor} onChange={e => handleChange('accentColor', e.target.value)} className="flex-1 text-sm border-gray-300 rounded-md" />
                                    </div>
                                </div>
                            </div>

                            {/* Signature Section */}
                            <div className="pt-6 border-t border-gray-100">
                                <h4 className="text-sm font-medium text-gray-900 mb-4">Digital Signature</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Existing Signature */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Signature</label>
                                        {formData.signatureUrl ? (
                                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-center">
                                                <img src={formData.signatureUrl} alt="Signature" className="h-24 mx-auto object-contain" />
                                                <p className="text-xs text-gray-500 mt-2">Will be used on invoices</p>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 text-sm">
                                                No signature uploaded
                                            </div>
                                        )}
                                        <div className="mt-4">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Or upload image:</label>
                                            <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'signature')} className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                                        </div>
                                    </div>

                                    {/* Drawing Board */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Draw New Signature</label>
                                        <SignaturePad ref={sigPadRef} />
                                        <p className="text-xs text-gray-500 mt-2">Draw here to update your signature. Click Save to apply.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* 3. Payment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Details</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Bank Name" value={formData.bankName} onChange={e => handleChange('bankName', e.target.value)} />
                            <Input label="Account Name" value={formData.accountName} onChange={e => handleChange('accountName', e.target.value)} />
                            <Input label="Account Number" value={formData.accountNumber} onChange={e => handleChange('accountNumber', e.target.value)} />
                            <Input label="Routing / Sort Code" value={formData.routingNumber} onChange={e => handleChange('routingNumber', e.target.value)} />
                            <Input label="SWIFT / BIC" value={formData.swiftCode} onChange={e => handleChange('swiftCode', e.target.value)} />
                            <Input label="IBAN" value={formData.iban} onChange={e => handleChange('iban', e.target.value)} />
                        </div>
                    </CardBody>
                </Card>

                {/* 4. Invoice Rules & Preferences */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Rules & Preferences</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Invoice Prefix" value={formData.invoicePrefix} onChange={e => handleChange('invoicePrefix', e.target.value)} />
                            <Input label="Number Padding" type="number" value={formData.invoiceNumberPadding} onChange={e => handleChange('invoiceNumberPadding', parseInt(e.target.value))} />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                                <select className="input w-full p-2 border rounded-md" value={formData.defaultCurrency} onChange={e => handleChange('defaultCurrency', e.target.value)}>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="INR">INR - Indian Rupee</option>
                                </select>
                            </div>

                            <Input label="Default Payment Terms (Days)" type="number" value={formData.defaultPaymentTerms} onChange={e => handleChange('defaultPaymentTerms', parseInt(e.target.value))} />
                        </div>

                        {/* NEW: Auto-Email Toggle */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-medium text-gray-900">Auto-Send Invoices</h4>
                                <p className="text-sm text-gray-500">Automatically email invoices to clients when they are created.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.autoEmailInvoices}
                                    onChange={e => handleChange('autoEmailInvoices', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </CardBody>
                </Card>

                <UserManagement />
            </div>

            {/* Sticky Save Button */}
            <div className="fixed bottom-6 right-8 z-50">
                <Button
                    variant="primary"
                    size="lg"
                    className="shadow-xl"
                    onClick={handleSaveAll}
                    disabled={saving}
                >
                    {saving ? 'Saving Changes...' : 'Save All Changes'}
                </Button>
            </div>
        </div>
    );
}
