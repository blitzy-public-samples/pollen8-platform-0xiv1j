import React from 'react';
import { Link } from 'react-router-dom';
import { useThemeContext } from 'src/shared/contexts/index';

export const Footer: React.FC = () => {
  const { theme } = useThemeContext();

  const footerClasses = `
    w-full 
    py-6 
    px-4 
    bg-white 
    dark:bg-black 
    text-black 
    dark:text-white 
    border-t 
    border-gray-200 
    dark:border-gray-800
  `;

  const linkClasses = `
    hover:underline 
    transition-colors 
    duration-200
  `;

  const iconClasses = `
    w-6 
    h-6 
    fill-current 
    text-gray-600 
    dark:text-gray-400 
    hover:text-black 
    dark:hover:text-white 
    transition-colors 
    duration-200
  `;

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p>&copy; {new Date().getFullYear()} Pollen8. All rights reserved.</p>
        </div>
        <nav className="mb-4 md:mb-0">
          <ul className="flex space-x-4">
            <li><Link to="/about" className={linkClasses}>About</Link></li>
            <li><Link to="/privacy" className={linkClasses}>Privacy Policy</Link></li>
            <li><Link to="/terms" className={linkClasses}>Terms of Service</Link></li>
          </ul>
        </nav>
        <div className="flex space-x-4">
          <a href="https://twitter.com/pollen8" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <svg className={iconClasses} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="https://linkedin.com/company/pollen8" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg className={iconClasses} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};