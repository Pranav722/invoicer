import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

export default function Layout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊', roles: ['owner', 'admin', 'employee', 'viewer'] },
        { path: '/invoices', label: 'Invoices', icon: '📄', roles: ['owner', 'admin', 'employee', 'viewer'] },
        { path: '/vendors', label: 'Vendors', icon: '🏢', roles: ['owner', 'admin'] },
        { path: '/services', label: 'Services', icon: '🛠️', roles: ['owner', 'admin'] },
        { path: '/users', label: 'Users', icon: '👥', roles: ['owner', 'admin'] },
        { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['owner', 'admin'] }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
            {/* Modern Sidebar */}
            <aside className="fixed top-0 left-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col shadow-xl z-40">
                {/* Logo Section */}
                <div className="p-6 border-b border-slate-200">
                    <Link to="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg transform transition-transform group-hover:scale-105">
                            📄
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Invoice SaaS</h1>
                            <p className="text-xs text-slate-500">{user?.profile.firstName}'s Workspace</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems
                        .filter((item) => item.roles.includes(user?.role || ''))
                        .map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group
                                    ${isActive(item.path)
                                        ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm border-l-4 border-indigo-600'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                    }
                                `}
                            >
                                <span className={`text-xl transition-transform ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                <span className="text-sm font-semibold">{item.label}</span>
                            </Link>
                        ))}
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md text-sm">
                            {user?.profile.firstName?.[0]}{user?.profile.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-slate-900 text-sm truncate">
                                {user?.profile.firstName} {user?.profile.lastName}
                            </div>
                            <div className="text-xs text-slate-500 capitalize font-medium">{user?.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all duration-200 font-medium text-sm"
                    >
                        <span>🚪</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="ml-60 mt-16 min-h-screen">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
