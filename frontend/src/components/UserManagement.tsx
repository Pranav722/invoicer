import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { Card, CardHeader, CardTitle, CardBody, Button, Input } from './ui';

interface User {
    _id: string;
    email: string;
    role: 'owner' | 'admin' | 'employee' | 'viewer';
    isActive: boolean;
    profile?: {
        firstName?: string;
        lastName?: string;
    };
    createdAt: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Form State
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'employee'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await userService.getAll();
            setUsers(response.data.data.users);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await userService.create({
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                profile: {
                    firstName: newUser.firstName,
                    lastName: newUser.lastName
                }
            });
            setShowAddModal(false);
            setNewUser({ email: '', password: '', firstName: '', lastName: '', role: 'employee' });
            fetchUsers();
            alert('User created successfully!');
        } catch (error: any) {
            console.error('Failed to create user', error);
            alert(error.response?.data?.message || 'Failed to create user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeactivate = async (id: string, currentStatus: boolean) => {
        if (!confirm('Are you sure you want to deactivate this user?')) return;
        try {
            await userService.deactivate(id);
            fetchUsers();
        } catch (error) {
            console.error('Failed to deactivate user', error);
            alert('Failed to deactivate user');
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Team Management</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Manage access for your employees</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} variant="primary">
                    + Add Employee
                </Button>
            </CardHeader>
            <CardBody>
                {loading ? (
                    <div className="text-center py-8 text-gray-400">Loading users...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold bg-gray-50/50">
                                    <th className="p-4 rounded-tl-lg">User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right rounded-tr-lg">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-50">
                                {users.map(user => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">
                                                {user.profile?.firstName} {user.profile?.lastName}
                                            </div>
                                            <div className="text-gray-500 text-xs">{user.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${user.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-slate-100 text-slate-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium
                                                ${user.isActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.role !== 'owner' && (
                                                <button
                                                    onClick={() => handleDeactivate(user._id, user.isActive)}
                                                    className="text-red-600 hover:text-red-800 text-xs font-medium px-3 py-1.5 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                                            No other users found. Invite your team!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardBody>

            {/* Add User Modal - Simple Inline Implementation */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Add New Employee</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    value={newUser.firstName}
                                    onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                                    placeholder="Jane"
                                    required
                                />
                                <Input
                                    label="Last Name"
                                    value={newUser.lastName}
                                    onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                            <Input
                                label="Email Address"
                                type="email"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="jane@company.com"
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="••••••••"
                                required
                                helperText="Share this password with the employee"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow bg-white"
                                >
                                    <option value="employee">Employee (Can create invoices)</option>
                                    <option value="admin">Admin (Full access)</option>
                                    <option value="viewer">Viewer (Read only)</option>
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3 justify-end">
                                <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" loading={actionLoading}>Create User</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Card>
    );
}
