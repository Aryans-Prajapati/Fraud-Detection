import React, { useState, useMemo } from 'react';
import { Transaction } from '../types/types';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  SearchIcon,
  ExclamationIcon,
  CheckCircleIcon,
  FilterIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  GlobeIcon,
  DesktopComputerIcon
} from '@heroicons/react/solid';

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    showFraudOnly: false,
    showOnlineOnly: false,
    category: ''
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Get unique categories from transactions
  const categories = useMemo(() => {
    const uniqueCategories = new Set(transactions.map(t => t.category));
    return Array.from(uniqueCategories).sort();
  }, [transactions]);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    // Create a more efficient filtering approach for large datasets
    console.time('filtering');
    
    // Apply filters progressively to avoid re-running expensive operations
    let filtered = transactions;
    
    // Apply search filter if needed
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => {
        return (
          transaction.transaction_id.toLowerCase().includes(searchLower) ||
          transaction.merchant.toLowerCase().includes(searchLower) ||
          transaction.category.toLowerCase().includes(searchLower) ||
          transaction.timestamp.toString().toLowerCase().includes(searchLower) ||
          transaction.amount.toString().includes(searchLower)
        );
      });
    }
    
    // Apply category filter if needed
    if (filters.category) {
      filtered = filtered.filter(transaction => transaction.category === filters.category);
    }
    
    // Apply fraud filter if needed
    if (filters.showFraudOnly) {
      filtered = filtered.filter(transaction => transaction.is_fraud === 1 || transaction.is_fraud === true);
    }
    
    // Apply online filter if needed
    if (filters.showOnlineOnly) {
      filtered = filtered.filter(transaction => transaction.is_online);
    }
    
    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      
      return 0;
    });
    
    console.timeEnd('filtering');
    return sorted;
  }, [transactions, searchTerm, filters, sortField, sortDirection]);

  // Paginate
  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredTransactions.slice(startIndex, startIndex + pageSize);
  }, [filteredTransactions, page, pageSize]);

  // Total pages
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);

  // Handle sort
  const handleSort = (field: keyof Transaction) => {
    // Make sure the sorting works with both Excel and default datasets
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If date is invalid, try to parse as "YYYY-MM-DD" + optional time
        if (typeof dateString === 'string' && dateString.includes('-')) {
          const parts = dateString.split(' ');
          const datePart = parts[0];
          return datePart;
        }
        return 'Invalid Date';
      }
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return String(dateString);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      showFraudOnly: false,
      showOnlineOnly: false,
      category: ''
    });
    setPage(1);
  };

  // Handle category filter change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      category: e.target.value
    });
    setPage(1);
  };

  // Pagination controls
  const goToPage = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  // Add a new function to format customer account ID
  const formatAccount = (accountId: string) => {
    if (!accountId) return 'Unknown';
    
    // If account is number, format it
    if (!isNaN(Number(accountId))) {
      const accNum = accountId.toString();
      if (accNum.length > 4) {
        return `${accNum.substring(0, 4)}...${accNum.substring(accNum.length - 4)}`;
      }
    }
    return accountId;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-gray-500">No transaction data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filters.category}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <div className="inline-flex items-center">
            <input
              id="fraud-filter"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={filters.showFraudOnly}
              onChange={(e) => {
                setFilters({ ...filters, showFraudOnly: e.target.checked });
                setPage(1);
              }}
            />
            <label htmlFor="fraud-filter" className="ml-2 block text-sm text-gray-700">
              Fraud Only
            </label>
          </div>
          
          <div className="inline-flex items-center">
            <input
              id="online-filter"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={filters.showOnlineOnly}
              onChange={(e) => {
                setFilters({ ...filters, showOnlineOnly: e.target.checked });
                setPage(1);
              }}
            />
            <label htmlFor="online-filter" className="ml-2 block text-sm text-gray-700">
              Online Only
            </label>
          </div>
          
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FilterIcon className="-ml-0.5 mr-2 h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
      
      {/* Results summary */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredTransactions.length > 0 ? (page - 1) * pageSize + 1 : 0} to {Math.min(page * pageSize, filteredTransactions.length)} of {filteredTransactions.length} results
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                <button
                  type="button"
                  onClick={() => handleSort('transaction_id')}
                  className="group inline-flex items-center"
                >
                  ID
                  <span className="ml-1.5 flex-none rounded text-gray-400">
                    {sortField === 'transaction_id' ? (
                      sortDirection === 'asc' ? (
                        <SortAscendingIcon className="h-4 w-4" />
                      ) : (
                        <SortDescendingIcon className="h-4 w-4" />
                      )
                    ) : (
                      <SortAscendingIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </span>
                </button>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button
                  type="button"
                  onClick={() => handleSort('timestamp')}
                  className="group inline-flex items-center"
                >
                  Date
                  <span className="ml-1.5 flex-none rounded text-gray-400">
                    {sortField === 'timestamp' ? (
                      sortDirection === 'asc' ? (
                        <SortAscendingIcon className="h-4 w-4" />
                      ) : (
                        <SortDescendingIcon className="h-4 w-4" />
                      )
                    ) : (
                      <SortAscendingIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </span>
                </button>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button
                  type="button"
                  onClick={() => handleSort('merchant')}
                  className="group inline-flex items-center"
                >
                  Merchant
                  <span className="ml-1.5 flex-none rounded text-gray-400">
                    {sortField === 'merchant' ? (
                      sortDirection === 'asc' ? (
                        <SortAscendingIcon className="h-4 w-4" />
                      ) : (
                        <SortDescendingIcon className="h-4 w-4" />
                      )
                    ) : (
                      <SortAscendingIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </span>
                </button>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button
                  type="button"
                  onClick={() => handleSort('category')}
                  className="group inline-flex items-center"
                >
                  Category
                  <span className="ml-1.5 flex-none rounded text-gray-400">
                    {sortField === 'category' ? (
                      sortDirection === 'asc' ? (
                        <SortAscendingIcon className="h-4 w-4" />
                      ) : (
                        <SortDescendingIcon className="h-4 w-4" />
                      )
                    ) : (
                      <SortAscendingIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </span>
                </button>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button
                  type="button"
                  onClick={() => handleSort('amount')}
                  className="group inline-flex items-center"
                >
                  Amount
                  <span className="ml-1.5 flex-none rounded text-gray-400">
                    {sortField === 'amount' ? (
                      sortDirection === 'asc' ? (
                        <SortAscendingIcon className="h-4 w-4" />
                      ) : (
                        <SortDescendingIcon className="h-4 w-4" />
                      )
                    ) : (
                      <SortAscendingIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </span>
                </button>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button
                  type="button"
                  onClick={() => handleSort('customer_id')}
                  className="group inline-flex items-center"
                >
                  From Account
                  <span className="ml-1.5 flex-none rounded text-gray-400">
                    {sortField === 'customer_id' ? (
                      sortDirection === 'asc' ? (
                        <SortAscendingIcon className="h-4 w-4" />
                      ) : (
                        <SortDescendingIcon className="h-4 w-4" />
                      )
                    ) : (
                      <SortAscendingIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </span>
                </button>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <button
                  type="button"
                  onClick={() => handleSort('is_fraud')}
                  className="group inline-flex items-center"
                >
                  Status
                  <span className="ml-1.5 flex-none rounded text-gray-400">
                    {sortField === 'is_fraud' ? (
                      sortDirection === 'asc' ? (
                        <SortAscendingIcon className="h-4 w-4" />
                      ) : (
                        <SortDescendingIcon className="h-4 w-4" />
                      )
                    ) : (
                      <SortAscendingIcon className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                    )}
                  </span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {transaction.transaction_id.substring(0, 8)}...
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatDate(transaction.timestamp)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {transaction.merchant || 'Unknown'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {transaction.category || 'Uncategorized'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatCurrency(transaction.amount)}
                  {transaction.unusual_amount === 1 && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                      Unusual
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {formatAccount(transaction.customer_id)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                  {transaction.is_fraud === 1 || transaction.is_fraud === true ? (
                    <span className="inline-flex items-center text-red-800">
                      <ExclamationIcon className="mr-1.5 h-4 w-4 text-red-600" aria-hidden="true" />
                      Fraudulent
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-green-800">
                      <CheckCircleIcon className="mr-1.5 h-4 w-4 text-green-500" aria-hidden="true" />
                      Normal
                    </span>
                  )}
                  {transaction.is_online && (
                    <span className="ml-2 inline-flex items-center text-purple-800">
                      <GlobeIcon className="h-4 w-4 text-purple-500" aria-hidden="true" />
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white ${
                page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white ${
                page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable; 