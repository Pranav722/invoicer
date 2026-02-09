import UserManagement from '../components/UserManagement';

export default function Users() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <UserManagement />
        </div>
    );
}
