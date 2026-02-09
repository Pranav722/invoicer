import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/ui';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password, subdomain);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 to-purple-700">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg">
                        📄
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
                    <p className="text-slate-600">Sign in to your invoice dashboard</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Company Subdomain"
                        type="text"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value)}
                        placeholder="yourcompany"
                        helperText="The subdomain you registered with (e.g., 'acme' for acme.invoice.app)"
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={loading}
                        className="w-full mt-6"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                {/* Register Link */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                        Create one now
                    </Link>
                </div>
            </div>
        </div>
    );
}
