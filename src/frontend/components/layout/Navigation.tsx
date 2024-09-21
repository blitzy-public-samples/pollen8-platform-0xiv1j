import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext, useThemeContext } from 'src/shared/contexts/index';
import Button from 'src/frontend/components/ui/Button';

interface NavItem {
  label: string;
  path: string;
  requiresAuth: boolean;
}

export const Navigation: React.FC = () => {
  const { user, logout } = useAuthContext();
  const { theme, toggleTheme } = useThemeContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Home', path: '/', requiresAuth: false },
    { label: 'Dashboard', path: '/dashboard', requiresAuth: true },
    { label: 'Profile', path: '/profile', requiresAuth: true },
    { label: 'Invites', path: '/invites', requiresAuth: true },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navClasses = `
    flex items-center justify-between
    px-4 py-2
    bg-white dark:bg-black
    text-black dark:text-white
    shadow-md
  `;

  const linkClasses = `
    px-3 py-2
    hover:bg-gray-100 dark:hover:bg-gray-800
    rounded transition-colors duration-200
  `;

  const activeLinkClasses = `
    bg-gray-200 dark:bg-gray-700
  `;

  return (
    <nav className={navClasses}>
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold">Pollen8</Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        {navItems.map((item) => (
          (item.requiresAuth && user) || !item.requiresAuth ? (
            <Link
              key={item.path}
              to={item.path}
              className={`${linkClasses} ${location.pathname === item.path ? activeLinkClasses : ''}`}
            >
              {item.label}
            </Link>
          ) : null
        ))}
        {user && (
          <Button onClick={logout} variant="secondary" size="small">Logout</Button>
        )}
        <Button onClick={toggleTheme} variant="outline" size="small">
          {theme === 'light' ? '🌙' : '☀️'}
        </Button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2"
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-black shadow-md">
          {navItems.map((item) => (
            (item.requiresAuth && user) || !item.requiresAuth ? (
              <Link
                key={item.path}
                to={item.path}
                className={`block ${linkClasses} ${location.pathname === item.path ? activeLinkClasses : ''}`}
                onClick={toggleMobileMenu}
              >
                {item.label}
              </Link>
            ) : null
          ))}
          {user && (
            <Button onClick={logout} variant="secondary" size="small" className="w-full mt-2">Logout</Button>
          )}
          <Button onClick={toggleTheme} variant="outline" size="small" className="w-full mt-2">
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </Button>
        </div>
      )}
    </nav>
  );
};