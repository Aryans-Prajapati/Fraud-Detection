import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getLoggedInUser } from '../lib/auth';
import Head from 'next/head';
import Header from '../components/Header';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  CogIcon, 
  ChartPieIcon,
  ExclamationCircleIcon,
  PencilAltIcon,
  TrashIcon,
  PlusSmIcon
} from '@heroicons/react/outline';
import { Doughnut } from 'react-chartjs-2';
import { Transaction } from '../types/types';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [fraudMetrics, setFraudMetrics] = useState({
    totalTransactions: 0,
    fraudulentTransactions: 0,
    fraudPercentage: 0,
    totalUsers: 0,
    activeUsers: 0,
    averageTransactionValue: 0
  });
  
  useEffect(() => {
    const checkAuth = async () => {
      const userData = await getLoggedInUser();
      if (!userData) {
        router.push('/login');
        return;
      }
      
      if (userData.role !== 'admin') {
        router.push('/');
        return;
      }
      
      setUser(userData);
      
      // Fetch data for admin dashboard
      try {
        // Fetch transactions
        const transactionsResponse = await fetch('/api/transactions');
        if (transactionsResponse.ok) {
          const data = await transactionsResponse.json();
          // Extract the transactions array from the response
          const transactionList = data.transactions || [];
          setTransactions(transactionList);
          
          // Calculate metrics
          const fraudCount = transactionList.filter((t: Transaction) => t.is_fraud === 1).length;
          const totalAmount = transactionList.reduce((sum: number, t: Transaction) => sum + t.amount, 0);
          
          setFraudMetrics({
            totalTransactions: transactionList.length,
            fraudulentTransactions: fraudCount,
            fraudPercentage: transactionList.length > 0 ? (fraudCount / transactionList.length) * 100 : 0,
            totalUsers: 0, // Would be set from users API
            activeUsers: 0, // Would be set from users API
            averageTransactionValue: transactionList.length > 0 ? totalAmount / transactionList.length : 0
          });
        }
        
        // Mock user data (would come from API in real application)
        setUsers([
          { id: 1, name: 'Admin User', email: 'admin@frauddetect.com', role: 'admin', status: 'active', lastLogin: '2023-06-15T10:30:00Z' },
          { id: 2, name: 'Regular User', email: 'user1@example.com', role: 'user', status: 'active', lastLogin: '2023-06-14T14:22:00Z' },
          { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'inactive', lastLogin: '2023-05-20T09:15:00Z' },
          { id: 4, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', lastLogin: '2023-06-13T11:45:00Z' }
        ]);
        
        // Update user metrics
        setFraudMetrics(prev => ({
          ...prev,
          totalUsers: 4,
          activeUsers: 3
        }));
        
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [router]);
  
  // Prepare chart data for fraud distribution
  const fraudChartData = {
    labels: ['Legitimate Transactions', 'Fraudulent Transactions'],
    datasets: [
      {
        data: [
          fraudMetrics.totalTransactions - fraudMetrics.fraudulentTransactions,
          fraudMetrics.fraudulentTransactions
        ],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = (value / fraudMetrics.totalTransactions * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Admin Dashboard | Fraud Detection System</title>
        <meta name="description" content="Admin dashboard for fraud detection system" />
      </Head>
      
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage users and view system analytics
          </p>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              <ChartPieIcon className="mr-2 h-5 w-5" />
              Analytics
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              <UsersIcon className="mr-2 h-5 w-5" />
              User Management
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } flex whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              <CogIcon className="mr-2 h-5 w-5" />
              System Settings
            </button>
          </nav>
        </div>
        
        {/* Analytics Tab Content */}
        {activeTab === 'analytics' && (
          <div>
            {/* Metrics Grid */}
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">Fraud Detection Rate</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {fraudMetrics.fraudPercentage.toFixed(1)}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                      <ChartPieIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">Total Transactions</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {fraudMetrics.totalTransactions.toLocaleString()}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                      <UsersIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">Active Users</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {fraudMetrics.activeUsers} / {fraudMetrics.totalUsers}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-red-500 p-3">
                      <ExclamationCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">Fraudulent Transactions</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {fraudMetrics.fraudulentTransactions.toLocaleString()}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 rounded-md bg-yellow-500 p-3">
                      <ChartPieIcon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="truncate text-sm font-medium text-gray-500">Avg. Transaction Value</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {formatCurrency(fraudMetrics.averageTransactionValue)}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Fraud Distribution</h3>
                  <div className="mt-5 h-80">
                    <Doughnut data={fraudChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Fraud Alerts</h3>
                  
                  <div className="mt-5 flow-root">
                    <ul className="-my-4 divide-y divide-gray-200">
                      {transactions
                        .filter(t => t.is_fraud === 1)
                        .slice(0, 5)
                        .map((transaction) => (
                          <li key={transaction.transaction_id} className="flex items-center py-4">
                            <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                              <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {transaction.merchant} - {formatCurrency(transaction.amount)}
                              </p>
                              <p className="truncate text-sm text-gray-500">
                                {transaction.category} • {formatDate(transaction.timestamp)}
                              </p>
                            </div>
                            <div>
                              <button
                                type="button"
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50"
                              >
                                View
                              </button>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* User Management Tab Content */}
        {activeTab === 'users' && (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Users</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    A list of all users in the system including their name, email, role and status.
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    <PlusSmIcon className="-ml-1 mr-2 h-5 w-5" />
                    Add User
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                            Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Email
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Role
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Last Login
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              {user.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role === 'admin' ? 'Administrator' : 'User'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatDate(user.lastLogin)}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                              <div className="flex space-x-3">
                                <button
                                  type="button"
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <PencilAltIcon className="h-5 w-5" />
                                  <span className="sr-only">Edit {user.name}</span>
                                </button>
                                <button
                                  type="button"
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                  <span className="sr-only">Delete {user.name}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">System Settings</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Configure fraud detection sensitivity and notification settings.</p>
                </div>
                
                <div className="mt-5">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="fraud-threshold" className="block text-sm font-medium text-gray-700">
                        Fraud Detection Threshold (%)
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="fraud-threshold"
                          id="fraud-threshold"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          defaultValue="70"
                          min="0"
                          max="100"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Transactions with a fraud probability above this threshold will be flagged as fraudulent.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="notification-email" className="block text-sm font-medium text-gray-700">
                        Notification Email
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          name="notification-email"
                          id="notification-email"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          defaultValue="alerts@frauddetect.com"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Email address to receive fraud alert notifications.
                      </p>
                    </div>
                    
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="real-time-alerts"
                          name="real-time-alerts"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="real-time-alerts" className="font-medium text-gray-700">
                          Enable Real-time Alerts
                        </label>
                        <p className="text-gray-500">
                          Send immediate alerts when fraudulent transactions are detected.
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="daily-reports"
                          name="daily-reports"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          defaultChecked
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="daily-reports" className="font-medium text-gray-700">
                          Enable Daily Reports
                        </label>
                        <p className="text-gray-500">
                          Send daily summary reports of all transaction activity.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">API Configuration</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Manage API keys and integration settings.</p>
                </div>
                
                <div className="mt-5">
                  <div className="rounded-md bg-gray-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <CogIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3 flex-1 md:flex md:justify-between">
                        <p className="text-sm text-gray-700">
                          Your API key: <code className="rounded bg-gray-200 px-2 py-1">sk_test_4eC39HqLyjWDarjtT1zdp7dc</code>
                        </p>
                        <p className="mt-3 text-sm md:mt-0 md:ml-6">
                          <button className="text-blue-600 hover:text-blue-500">
                            Regenerate
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      View API Documentation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 