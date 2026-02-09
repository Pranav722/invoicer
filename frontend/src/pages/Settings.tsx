import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardBody, Button, Input } from '../components/ui';
import UserManagement from '../components/UserManagement';
import { tenantService, uploadService } from '../services/api';

export default function Settings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Combined state for easier management, though we could separate them
    const [companySettings, setCompanySettings] = useState({
        companyName: '',
        email: '',
        phone: '',
        website: '',
        taxNumber: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
        }
    });

    const [invoiceSettings, setInvoiceSettings] = useState({
        invoicePrefix: 'INV',
        invoiceNumberPadding: 4,
        defaultCurrency: 'USD',
        defaultPaymentTerms: 30
    });

    const [branding, setBranding] = useState({
        logo: '',
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        signatureUrl: ''
    });

    const [paymentDetails, setPaymentDetails] = useState({
        bankName: '',
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: '',
        iban: '',
        ifscCode: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await tenantService.getCurrent();
            const tenant = response.data.data;

            if (tenant) {
                setCompanySettings({
                    companyName: tenant.companyName || '',
                    email: tenant.email || '',
                    phone: tenant.phone || '',
                    website: tenant.website || '',
                    taxNumber: tenant.taxId || '', // Backend calls it taxId
                    address: tenant.address || { street: '', city: '', state: '', postalCode: '', country: '' }
                });

                if (tenant.settings) {
                    setInvoiceSettings({
                        invoicePrefix: tenant.settings.invoicePrefix || 'INV',
                        invoiceNumberPadding: tenant.settings.invoiceNumberPadding || 4,
                        defaultCurrency: tenant.settings.defaultCurrency || 'USD',
                        defaultPaymentTerms: tenant.settings.defaultPaymentTerms || 30
                    });
                }

                if (tenant.branding) {
                    setBranding({
                        logo: tenant.branding.logo || '',
                        primaryColor: tenant.branding.primaryColor || '#3B82F6',
                        accentColor: tenant.branding.accentColor || '#10B981',
                        signatureUrl: tenant.branding.signatureUrl || ''
                    });
                }

                if (tenant.paymentDetails) {
                    setPaymentDetails({
                        bankName: tenant.paymentDetails.bankName || '',
                        accountName: tenant.paymentDetails.accountName || '',
                        accountNumber: tenant.paymentDetails.accountNumber || '',
                        routingNumber: tenant.paymentDetails.routingNumber || '',
                        swiftCode: tenant.paymentDetails.swiftCode || '',
                        iban: tenant.paymentDetails.iban || '',
                        ifscCode: tenant.paymentDetails.ifscCode || ''
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
        }
    };

    const handleCompanyChange = (field: string, value: string) => {
        if (field.startsWith('address.')) {
            const addressField = field.split('.')[1];
            setCompanySettings(prev => ({
                ...prev,
                address: { ...prev.address, [addressField]: value }
            }));
        } else {
            setCompanySettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const handlePaymentChange = (field: string, value: string) => {
        setPaymentDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveCompany = async () => {
        setLoading(true);
        try {
            await tenantService.updateProfile({
                ...companySettings,
                // Map taxNumber to taxId for backend
                taxId: companySettings.taxNumber,
                paymentDetails
            });
            alert("Company profile and payment details saved!");
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save company profile");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInvoiceSettings = async () => {
        setLoading(true);
        try {
            await tenantService.updateSettings(invoiceSettings);
            alert("Invoice settings saved!");
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save invoice settings");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const response = await uploadService.uploadFile(file);
            const url = response.data.data.url;

            const newBranding = { ...branding, [type === 'logo' ? 'logo' : 'signatureUrl']: url };
            setBranding(newBranding);

            // Auto-save branding when file is uploaded
            await tenantService.updateBranding(newBranding);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. PLease try again.");
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your workspace preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Branding - MOVED TO TOP FOR IMPORTANCE */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branding & Identity</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-6">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Logo
                                </label>
                                <div className="flex items-center gap-4">
                                    {branding.logo && (
                                        <img src={branding.logo} alt="Logo" className="h-16 w-16 object-contain border rounded-lg bg-gray-50" />
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="block w-full text-sm text-slate-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-indigo-50 file:text-indigo-700
                                                hover:file:bg-indigo-100
                                            "
                                            onChange={(e) => handleFileUpload(e, 'logo')}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 5MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Digital Signature Upload */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Digital Signature (for Invoices)
                                </label>
                                <div className="flex items-center gap-4">
                                    {branding.signatureUrl && (
                                        <img src={branding.signatureUrl} alt="Signature" className="h-12 object-contain border rounded bg-white p-1" />
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="block w-full text-sm text-slate-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-indigo-50 file:text-indigo-700
                                                hover:file:bg-indigo-100
                                            "
                                            onChange={(e) => handleFileUpload(e, 'signature')}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Upload a scan of your signature (transparent PNG recommended)</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={branding.primaryColor}
                                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                            className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            value={branding.primaryColor}
                                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                            className="flex-1 text-sm border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full mt-2"
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        await tenantService.updateBranding(branding);
                                        alert("Branding saved!");
                                    } catch (e) { console.error(e); alert("Failed to save branding"); }
                                    finally { setLoading(false); }
                                }}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Branding'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Company Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <Input
                                label="Company Name"
                                value={companySettings.companyName}
                                onChange={(e) => handleCompanyChange('companyName', e.target.value)}
                                placeholder="Acme Corporation"
                            />

                            <Input
                                label="Email"
                                type="email"
                                value={companySettings.email}
                                onChange={(e) => handleCompanyChange('email', e.target.value)}
                                placeholder="contact@acme.com"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Phone"
                                    value={companySettings.phone}
                                    onChange={(e) => handleCompanyChange('phone', e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                />

                                <Input
                                    label="Website"
                                    value={companySettings.website}
                                    onChange={(e) => handleCompanyChange('website', e.target.value)}
                                    placeholder="www.acme.com"
                                />
                            </div>

                            <Input
                                label="Tax Number"
                                value={companySettings.taxNumber}
                                onChange={(e) => handleCompanyChange('taxNumber', e.target.value)}
                                placeholder="XX-XXXXXXX"
                            />

                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Address</h4>

                                <div className="space-y-3">
                                    <Input
                                        placeholder="Street Address"
                                        value={companySettings.address.street}
                                        onChange={(e) => handleCompanyChange('address.street', e.target.value)}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder="City"
                                            value={companySettings.address.city}
                                            onChange={(e) => handleCompanyChange('address.city', e.target.value)}
                                        />
                                        <Input
                                            placeholder="State/Province"
                                            value={companySettings.address.state}
                                            onChange={(e) => handleCompanyChange('address.state', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Postal Code"
                                            value={companySettings.address.postalCode}
                                            onChange={(e) => handleCompanyChange('address.postalCode', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Country"
                                            value={companySettings.address.country}
                                            onChange={(e) => handleCompanyChange('address.country', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={handleSaveCompany}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Company Info'}
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Bank Accounts / Payment Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Details (Bank Info)</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 mb-4">
                                These details will be automatically added to your invoices.
                            </p>

                            <Input
                                label="Bank Name"
                                value={paymentDetails.bankName}
                                onChange={(e) => handlePaymentChange('bankName', e.target.value)}
                                placeholder="e.g. Chase Bank"
                            />

                            <Input
                                label="Account Name"
                                value={paymentDetails.accountName}
                                onChange={(e) => handlePaymentChange('accountName', e.target.value)}
                                placeholder="e.g. Acme Corp Inc."
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Account Number"
                                    value={paymentDetails.accountNumber}
                                    onChange={(e) => handlePaymentChange('accountNumber', e.target.value)}
                                    placeholder="0000000000"
                                />
                                <Input
                                    label="Routing / Sort Code"
                                    value={paymentDetails.routingNumber}
                                    onChange={(e) => handlePaymentChange('routingNumber', e.target.value)}
                                    placeholder="000000"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="SWIFT / BIC (Optional)"
                                    value={paymentDetails.swiftCode}
                                    onChange={(e) => handlePaymentChange('swiftCode', e.target.value)}
                                    placeholder="CHASUS33"
                                />
                                <Input
                                    label="IBAN (Optional)"
                                    value={paymentDetails.iban}
                                    onChange={(e) => handlePaymentChange('iban', e.target.value)}
                                    placeholder="US00 0000..."
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={handleSaveCompany}
                                    disabled={loading}
                                >
                                    Save Payment Details
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Invoice Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoice Rules</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Invoice Prefix"
                                    value={invoiceSettings.invoicePrefix}
                                    onChange={(e) => setInvoiceSettings(prev => ({ ...prev, invoicePrefix: e.target.value }))}
                                    placeholder="INV"
                                    helperText="e.g., INV-0001"
                                />

                                <Input
                                    label="Number Padding"
                                    type="number"
                                    value={invoiceSettings.invoiceNumberPadding}
                                    onChange={(e) => setInvoiceSettings(prev => ({ ...prev, invoiceNumberPadding: parseInt(e.target.value) }))}
                                    helperText="Zero padding digits"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default Currency
                                </label>
                                <select
                                    className="input w-full p-2 border rounded-md"
                                    value={invoiceSettings.defaultCurrency}
                                    onChange={(e) => setInvoiceSettings(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="INR">INR - Indian Rupee</option>
                                </select>
                            </div>

                            <Input
                                label="Default Payment Terms (days)"
                                type="number"
                                value={invoiceSettings.defaultPaymentTerms}
                                onChange={(e) => setInvoiceSettings(prev => ({ ...prev, defaultPaymentTerms: parseInt(e.target.value) }))}
                                helperText="Default due date offset"
                            />

                            <div className="pt-4">
                                <Button
                                    variant="primary"
                                    className="w-full"
                                    onClick={handleSaveInvoiceSettings}
                                    disabled={loading}
                                >
                                    Save Invoice Rules
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* User Management */}
                <UserManagement />

                {/* Subscription */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-lg font-semibold text-primary-900">Free Plan</h4>
                                        <p className="text-sm text-primary-600">Currently active</p>
                                    </div>
                                    <div className="text-3xl">🆓</div>
                                </div>
                                <ul className="space-y-2 text-sm text-primary-800">
                                    <li className="flex items-center gap-2">
                                        <span>✓</span> Up to 50 invoices/month
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>✓</span> Basic AI features
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span>✓</span> PDF generation with watermark
                                    </li>
                                </ul>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={() => {
                                    alert('Upgrade feature coming soon! Stay tuned for premium features.');
                                }}
                            >
                                🚀 Upgrade to Pro
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
