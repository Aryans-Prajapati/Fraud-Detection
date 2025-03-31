import React, { useEffect, useState } from 'react';
import { getLoggedInUser } from '../lib/auth';
import { loadUserTransactions } from '../lib/dataLoader';
import { Transaction } from '../lib/dataLoader';
import StatsPanel from '../components/StatsPanel';
import Head from 'next/head';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const currentUser = getLoggedInUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Load user transactions
          const userTransactions = await loadUserTransactions(currentUser.id);
          setTransactions(userTransactions);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p>You must be logged in to view this page.</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Profile | Fraud Detection System</title>
      </Head>
      
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* User Info Card */}
          <div className="card col-span-1">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </div>
          
          {/* User Stats Summary */}
          <div className="card col-span-2">
            <h2 className="text-xl font-semibold mb-4">Activity Summary</h2>
            
            {transactions.length > 0 ? (
              <div>
                <p>You have made <span className="font-bold">{transactions.length}</span> transactions.</p>
                <p>
                  <span className="font-bold">{transactions.filter(t => t.is_fraud === 1).length}</span> of 
                  your transactions have been flagged as fraudulent.
                </p>
                
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Transaction Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(transactions.map(t => t.category))).map(category => (
                      <span 
                        key={category} 
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p>You have no transaction history yet.</p>
            )}
          </div>
        </div>
        
        {/* Transaction Stats */}
        {transactions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Transaction Statistics</h2>
            <StatsPanel transactions={transactions} />
          </div>
        )}
        
        {/* Security Tips */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Security Tips</h2>
          
          <ul className="list-disc pl-5 space-y-2">
            <li>Monitor your transactions regularly for any suspicious activity.</li>
            <li>Never share your banking credentials or personal information with anyone.</li>
            <li>Be cautious with online transactions from unfamiliar merchants.</li>
            <li>Enable two-factor authentication for all your financial accounts.</li>
            <li>Report any suspicious transactions immediately to your financial institution.</li>
          </ul>
        </div>
      </div>
    </>
  );
} 