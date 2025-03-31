import React from 'react';
import { Transaction } from '../types/types';
import { 
  ExclamationIcon as ShieldExclamationIcon, 
  CashIcon as BanknotesIcon, 
  ClockIcon, 
  ShoppingCartIcon,
  TrendingUpIcon,
  CreditCardIcon,
  GlobeIcon,
  UserIcon,
  MailIcon,
  LockClosedIcon
} from '@heroicons/react/solid';

interface StatsPanelProps {
  transactions: Transaction[];
  totalCount?: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ transactions, totalCount }) => {
  // Calculate stats
  const displayCount = transactions.length;
  const actualCount = totalCount || displayCount;
  
  // Use a sample-based approach for large datasets
  const fraudCount = transactions.filter(t => t.is_fraud === 1 || t.is_fraud === true).length;
  
  // Estimate total fraud percentage based on the sample
  const fraudPercentage = displayCount > 0 ? (fraudCount / displayCount * 100).toFixed(1) : '0';
  
  // Calculate totals
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Estimate actual total amount based on the ratio
  const estimatedTotalAmount = displayCount > 0 ? totalAmount * (actualCount / displayCount) : 0;
  
  const averageAmount = displayCount > 0 ? totalAmount / displayCount : 0;
  const onlineCount = transactions.filter(t => t.is_online).length;
  const onlinePercentage = displayCount > 0 ? (onlineCount / displayCount * 100).toFixed(1) : '0';

  // Calculate fraud types using the sample
  const accountTakeovers = transactions.filter(t => t.category === 'Account Takeover').length;
  const phishingAttacks = transactions.filter(t => t.category === 'Phishing').length;
  const cyberAttacks = transactions.filter(t => t.category === 'Cyber Attack').length;

  // Latest transaction date
  const latestTransaction = transactions.length > 0 
    ? new Date(Math.max(...transactions.map(t => new Date(t.timestamp).getTime())))
    : new Date();

  // Foreign transactions
  const foreignTransactions = transactions.filter(t => t.transaction_type === 'foreign').length;
  const foreignPercentage = displayCount > 0 ? (foreignTransactions / displayCount * 100).toFixed(1) : '0';
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Stats for display
  const stats = [
    {
      name: 'Total Transactions',
      value: actualCount.toLocaleString(),
      change: displayCount !== actualCount ? `Sample: ${displayCount.toLocaleString()} transactions` : '+12% from last month',
      icon: ShoppingCartIcon,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Fraud Count',
      value: ((actualCount * parseFloat(fraudPercentage)) / 100).toLocaleString(undefined, {maximumFractionDigits: 0}),
      change: `${fraudPercentage}% of total (est.)`,
      icon: ShieldExclamationIcon,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      name: 'Total Volume',
      value: formatCurrency(estimatedTotalAmount),
      change: displayCount !== actualCount ? 'Estimated from sample' : '+8.1% from last month',
      icon: BanknotesIcon,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      name: 'Average Amount',
      value: formatCurrency(averageAmount),
      change: displayCount > 0 ? '-3.2% from last month' : 'No data',
      icon: TrendingUpIcon,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      name: 'Online Transactions',
      value: `${onlinePercentage}%`,
      change: `${onlineCount.toLocaleString()} transactions`,
      icon: CreditCardIcon,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      name: 'Latest Transaction',
      value: formatDate(latestTransaction),
      change: formatTime(latestTransaction),
      icon: ClockIcon,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      name: 'Foreign Transactions',
      value: `${foreignPercentage}%`,
      change: `${foreignTransactions.toLocaleString()} transactions`,
      icon: GlobeIcon,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      name: 'Account Takeovers',
      value: accountTakeovers.toString(),
      change: `${(accountTakeovers / displayCount * 100).toFixed(1)}% of total`,
      icon: UserIcon,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      name: 'Phishing Attacks',
      value: phishingAttacks.toString(),
      change: `${(phishingAttacks / displayCount * 100).toFixed(1)}% of total`,
      icon: MailIcon,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      name: 'Cyber Attacks',
      value: cyberAttacks.toString(),
      change: `${(cyberAttacks / displayCount * 100).toFixed(1)}% of total`,
      icon: LockClosedIcon,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }
  ];
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <p className="text-center text-gray-500">No transaction data available</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`relative overflow-hidden rounded-lg ${stat.bgColor} ${stat.borderColor} border p-5 transition-all hover:shadow-md`}
        >
          <dt>
            <div className={`absolute rounded-md ${stat.iconColor} p-2`}>
              <stat.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="ml-12 truncate text-sm font-medium text-gray-600">{stat.name}</p>
          </dt>
          <dd className="ml-12 mt-2">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="mt-2 text-xs text-gray-500">{stat.change}</p>
          </dd>
        </div>
      ))}
    </div>
  );
};

export default StatsPanel;