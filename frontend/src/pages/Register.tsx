import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/ui';

export default function Register() {
    const [formData, setFormData] = useState({
        companyName: '',
        subdomain: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerFirstName: '',
        ownerLastName: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 to-purple-700">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg">
                        📄
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Your Account</h1>
                    <p className="text-slate-600">Start managing invoices in minutes</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Info */}
                    <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Input
                                    label="Company Name"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="Acme Corporation"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subdomain</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        name="subdomain"
                                        value={formData.subdomain}
                                        onChange={handleChange}
                                        placeholder="acme"
                                        className="input flex-1"
                                        required
                                    />
                                    <span className="text-gray-600 font-medium">.invoice.app</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Choose a unique subdomain for your company</p>
                            </div>
                        </div>
                    </div>

                    {/* Owner Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Owner Account</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                name="ownerFirstName"
                                value={formData.ownerFirstName}
                                onChange={handleChange}
                                placeholder="John"
                                required
                            />

                            <Input
                                label="Last Name"
                                name="ownerLastName"
                                value={formData.ownerLastName}
                                onChange={handleChange}
                                placeholder="Doe"
                                required
                            />

                            <div className="md:col-span-2">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    name="ownerEmail"
                                    value={formData.ownerEmail}
                                    onChange={handleChange}
                                    placeholder="john@acme.com"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Input
                                    label="Password"
                                    type="password"
                                    name="ownerPassword"
                                    value={formData.ownerPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    helperText="At least 8 characters"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={loading}
                        className="w-full"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
