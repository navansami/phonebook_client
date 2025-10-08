import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                FTP <span className="text-indigo-600">Admin</span>
              </h1>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 sm:gap-4">
              {user && (
                <div className="badge badge-primary hidden sm:inline-flex">
                  {user.username}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="btn-danger px-3 py-2 sm:px-4 sm:py-2 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
