import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logout } from '../lib/auth';
import { 
  MenuIcon, 
  XIcon, 
  HomeIcon, 
  ChartBarIcon, 
  CogIcon, 
  LogoutIcon, 
  UserCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/outline';
import { User } from '../types/types';

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const isAdmin = user?.role === 'admin';
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and desktop nav */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center">
                <span className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-5 w-5">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3zm4.5 9.85c-1.35 1.35-3.15 2.09-5.06 2.14l-.44.01-.44-.01c-1.91-.05-3.71-.79-5.06-2.14-.85-.85-1.19-2.03-.94-3.22.33-1.53 1.63-2.63 3.18-2.63h6.52c1.55 0 2.85 1.1 3.18 2.63.25 1.19-.09 2.37-.94 3.22z" />
                  </svg>
                </span>
                <span className="ml-2 text-xl font-bold text-gray-900">FraudDetect</span>
              </a>
            </Link>
            
            <nav className="ml-8 hidden md:block">
              <ul className="flex space-x-6">
                <li>
                  <Link href="/">
                    <a className={`flex items-center text-sm font-medium ${router.pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                      <HomeIcon className="mr-1 h-4 w-4" />
                      Dashboard
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/transactions">
                    <a className={`flex items-center text-sm font-medium ${router.pathname === '/transactions' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                      <ChartBarIcon className="mr-1 h-4 w-4" />
                      Transactions
                    </a>
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link href="/admin">
                      <a className={`flex items-center text-sm font-medium ${router.pathname === '/admin' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                        <CogIcon className="mr-1 h-4 w-4" />
                        Admin
                      </a>
                    </Link>
                  </li>
                )}
                {isAdmin && (
                  <li>
                    <Link href="/dataset-manager">
                      <a className={`flex items-center text-sm font-medium ${router.pathname === '/dataset-manager' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                        <DocumentTextIcon className="mr-1 h-4 w-4" />
                        Datasets
                      </a>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
          
          {/* Desktop profile */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{isAdmin ? 'Administrator' : 'User'}</p>
                </div>
                <div className="relative">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <LogoutIcon className="h-5 w-5" />
                    <span className="sr-only">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="border-t border-gray-200">
            <div className="flex items-center space-x-3 px-4 py-3">
              <div className="flex-shrink-0">
                <UserCircleIcon className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-800">{user?.name || 'User'}</p>
                <p className="text-sm text-gray-500">{isAdmin ? 'Administrator' : 'User'}</p>
              </div>
            </div>
            <nav className="mt-1">
              <div className="space-y-1 px-2 pb-3 pt-2">
                <Link href="/">
                  <a className={`block rounded-md px-3 py-2 text-base font-medium ${
                    router.pathname === '/' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <div className="flex items-center">
                      <HomeIcon className="mr-3 h-5 w-5" />
                      Dashboard
                    </div>
                  </a>
                </Link>
                <Link href="/transactions">
                  <a className={`block rounded-md px-3 py-2 text-base font-medium ${
                    router.pathname === '/transactions' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <div className="flex items-center">
                      <ChartBarIcon className="mr-3 h-5 w-5" />
                      Transactions
                    </div>
                  </a>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <a className={`block rounded-md px-3 py-2 text-base font-medium ${
                      router.pathname === '/admin' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <CogIcon className="mr-3 h-5 w-5" />
                        Admin Panel
                      </div>
                    </a>
                  </Link>
                )}
                {isAdmin && (
                  <Link href="/dataset-manager">
                    <a className={`block rounded-md px-3 py-2 text-base font-medium ${
                      router.pathname === '/dataset-manager' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}>
                      <div className="flex items-center">
                        <DocumentTextIcon className="mr-3 h-5 w-5" />
                        Datasets
                      </div>
                    </a>
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <LogoutIcon className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 