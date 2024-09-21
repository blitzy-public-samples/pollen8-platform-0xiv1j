import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import Button from 'src/frontend/components/ui/Button';

export const Header: React.FC = () => {
  const { user, logout } = useAuthContext();
  const { theme, toggleTheme } = useThemeContext();

  // Define header classes using Tailwind CSS
  const headerClasses = "bg-white dark:bg-black text-black dark:text-white shadow-md py-4 px-6 flex justify-between items-center";

  return (
    <header className={headerClasses}>
      {/* Logo component with link to home page */}
      <Link to="/" className="text-2xl font-bold">
        POLLEN8
      </Link>

      {/* Navigation menu */}
      <nav>
        <ul className="flex space-x-6">
          <li><Link to="/dashboard" className="hover:underline">Dashboard</Link></li>
          <li><Link to="/network" className="hover:underline">Network</Link></li>
          <li><Link to="/invites" className="hover:underline">Invites</Link></li>
        </ul>
      </nav>

      {/* User menu and theme toggle */}
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link to="/profile" className="hover:underline">{user.username}</Link>
            <Button onClick={logout} variant="secondary" size="small">Logout</Button>
          </>
        ) : (
          <Link to="/login">
            <Button variant="primary" size="small">Login</Button>
          </Link>
        )}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-800"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};