import { Link } from 'react-router-dom';
import { useAuth } from './auth/AuthProvider';

const Header = () => {
  const { user, loading, signOut } = useAuth();
  
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/trek-events', label: 'Trek Events' },
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Into the Wild
          </Link>
          
          <nav className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-gray-600 hover:text-gray-900">
                {link.label}
              </Link>
            ))}
            
            {!loading && (
              user ? (
                <>
                  <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Sign In
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
