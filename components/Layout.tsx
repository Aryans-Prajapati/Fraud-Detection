import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getLoggedInUser, logout, isAdmin } from '../lib/auth';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Client-side only
    setUser(getLoggedInUser());
  }, []);
  
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const isActive = (path: string) => {
    return router.pathname === path ? 'bg-blue-800' : '';
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation bar */}
      <nav className="bg-blue-700 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Fraud Detection System
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span>Welcome, {user.name}</span>
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 transition">
              Login
            </Link>
          )}
        </div>
      </nav>
      
      {/* Sidebar and content */}
      <div className="flex flex-1">
        {user && (
          <aside className="w-64 bg-blue-900 text-white p-4">
            <div className="space-y-2">
              <div className={`p-2 rounded ${isActive('/')} hover:bg-blue-800`}>
                <Link href="/">Dashboard</Link>
              </div>
              
              {isAdmin() ? (
                <div className={`p-2 rounded ${isActive('/admin')} hover:bg-blue-800`}>
                  <Link href="/admin">Admin Dashboard</Link>
                </div>
              ) : (
                <div className={`p-2 rounded ${isActive('/transactions')} hover:bg-blue-800`}>
                  <Link href="/transactions">My Transactions</Link>
                </div>
              )}
              
              <div className={`p-2 rounded ${isActive('/profile')} hover:bg-blue-800`}>
                <Link href="/profile">Profile</Link>
              </div>
            </div>
          </aside>
        )}
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 