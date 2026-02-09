import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const location = useLocation();
    const { user } = useAuth();

    // Generate breadcrumbs from current path
    const generateBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [{ label: 'Dashboard', path: '/' }];

        if (paths.length > 0) {
            paths.forEach((path, index) => {
                const label = path
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                const fullPath = '/' + paths.slice(0, index + 1).join('/');
                breadcrumbs.push({ label, path: fullPath });
            });
        }

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <header className="fixed top-0 right-0 left-60 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-30 shadow-sm">
            <div className="flex items-center justify-between h-full px-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2">
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb.path} className="flex items-center gap-2">
                            {index > 0 && (
                                <span className="text-slate-300 font-bold">/</span>
                            )}
                            <span
                                className={`text-sm font-semibold transition-colors ${index === breadcrumbs.length - 1
                                    ? 'text-indigo-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {crumb.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Right section */}
                <div className="flex items-center gap-4">
                    {/* Search - Optional */}
                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-64 px-4 py-2 pl-10 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                            🔍
                        </span>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <span className="text-xl">🔔</span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Avatar */}
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="text-right">
                            <div className="text-sm font-semibold text-slate-900">
                                {user?.profile.firstName} {user?.profile.lastName}
                            </div>
                            <div className="text-xs text-indigo-600 capitalize font-medium">
                                {user?.role}
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg text-sm">
                            {user?.profile.firstName?.[0]}{user?.profile.lastName?.[0]}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
