import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getLoggedInUser } from '../lib/auth';
import Head from 'next/head';
import TransactionTable from '../components/TransactionTable';
import Header from '../components/Header';
import { Transaction } from '../types/types';
import { FilterIcon } from '@heroicons/react/solid';

export default function TransactionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dataSource, setDataSource] = useState('excel'); // Default to Excel data
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 1
  });
  
  // Date range filter
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  // Amount range filter
  const [amountRange, setAmountRange] = useState({
    minAmount: '',
    maxAmount: ''
  });

  // Set a reasonable page size
  const [pageSize, setPageSize] = useState(100);
  const pageSizeOptions = [100, 250, 500, 1000];

  // Fetch data with current page
  const fetchTransactions = async (page: number = 1, limit: number = pageSize) => {
    try {
      setLoading(true);
      // Fetch transactions from Excel dataset
      const response = await fetch(`/api/excel-transactions?page=${page}&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          console.log(`Loaded ${data.data.length} Excel transactions (page ${data.pagination.page} of ${data.pagination.totalPages})`);
          setTransactions(data.data);
          setPagination(data.pagination);
          setDataSource('excel');
        } else {
          console.error('No Excel data available, falling back to default data');
          // If Excel data fails, fall back to default data
          fetchDefaultData(page, limit);
        }
      } else {
        console.error('Failed to load Excel transactions, falling back to default data');
        fetchDefaultData(page, limit);
      }
    } catch (error) {
      console.error('Error fetching Excel transactions:', error);
      fetchDefaultData(page, limit);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultData = async (page: number = 1, limit: number = 100) => {
    try {
      const response = await fetch(`/api/transactions?page=${page}&limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTransactions(data.transactions || []);
          setPagination(data.pagination || {
            total: data.transactions?.length || 0,
            page: 1,
            limit: 100,
            totalPages: 1
          });
          setDataSource('default');
        } else {
          setError('Failed to load transactions');
        }
      } else {
        setError('Failed to load transactions');
      }
    } catch (error) {
      console.error('Failed to fetch default transactions:', error);
      setError('An error occurred while fetching transaction data');
    }
  };

  // Load next page
  const loadNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      const nextPage = pagination.page + 1;
      fetchTransactions(nextPage, pagination.limit);
    }
  };

  // Load previous page
  const loadPrevPage = () => {
    if (pagination.page > 1) {
      const prevPage = pagination.page - 1;
      fetchTransactions(prevPage, pagination.limit);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const userData = await getLoggedInUser();
      if (!userData) {
        router.push('/login');
      } else {
        setUser(userData);
        
        // Fetch first page of transactions with reasonable size
        fetchTransactions(1, 100);
        
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  // Handle applying advanced filters
  const applyAdvancedFilters = () => {
    // This would normally call the API with filter parameters
    // For now, we'll just show how the UI would work
    console.log('Applying filters:', { dateRange, amountRange });
  };
  
  // Reset advanced filters
  const resetAdvancedFilters = () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
    setAmountRange({
      minAmount: '',
      maxAmount: ''
    });
  };

  // Page size change handler
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    fetchTransactions(1, newSize);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-bold text-red-600">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => router.reload()}
            className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Transactions | Fraud Detection System</title>
        <meta name="description" content="View and analyze your financial transactions" />
      </Head>
      
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Transactions</h1>
            <p className="mt-1 text-sm text-gray-500">
              View, filter and analyze transactions from {dataSource === 'excel' ? 'Excel dataset' : 'default dataset'}
            </p>
            {dataSource === 'excel' && (
              <div className="mt-1 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                Using Excel Data: {transactions.length} transactions loaded
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="mt-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0"
          >
            <FilterIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>
        </div>
        
        {/* Advanced filters section */}
        {showAdvancedFilters && (
          <div className="mb-8 rounded-lg bg-white p-4 shadow-md sm:p-6">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Advanced Filters</h2>
            
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Date range filters */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
              
              {/* Amount range filters */}
              <div>
                <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700">
                  Min Amount ($)
                </label>
                <input
                  type="number"
                  id="minAmount"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={amountRange.minAmount}
                  onChange={(e) => setAmountRange({ ...amountRange, minAmount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label htmlFor="maxAmount" className="block text-sm font-medium text-gray-700">
                  Max Amount ($)
                </label>
                <input
                  type="number"
                  id="maxAmount"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={amountRange.maxAmount}
                  onChange={(e) => setAmountRange({ ...amountRange, maxAmount: e.target.value })}
                  placeholder="9999.99"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button
                type="button"
                onClick={applyAdvancedFilters}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                Apply Filters
              </button>
              
              <button
                type="button"
                onClick={resetAdvancedFilters}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        )}
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <TransactionTable transactions={transactions} />
        </div>

        {/* Add pagination controls with page size selector */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0">
            {pagination.total === transactions.length ? (
              <span>Showing all {pagination.total.toLocaleString()} records</span>
            ) : (
              <span>Showing page {pagination.page} of {pagination.totalPages} ({pagination.total.toLocaleString()} total records)</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-end sm:items-center">
            <div className="flex items-center">
              <label htmlFor="page-size" className="mr-2 text-sm font-medium text-gray-700">Rows per page:</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            {pagination.total !== transactions.length && (
              <div className="flex space-x-2">
                <button
                  onClick={loadPrevPage}
                  disabled={pagination.page <= 1}
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    pagination.page <= 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={loadNextPage}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                    pagination.page >= pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 