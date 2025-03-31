import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { loadTransactions } from '../lib/dataLoader';
import FraudDetectionModel from '../lib/fraudModel';
import { Transaction } from '../lib/dataLoader';
import StatsPanel from '../components/StatsPanel';
import TransactionCard from '../components/TransactionCard';
import { getLoggedInUser, isAdmin } from '../lib/auth';
import Head from 'next/head';
import Link from 'next/link';
import TransactionTable from '../components/TransactionTable';
import FraudRiskChart from '../components/FraudRiskChart';
import TransactionMap from '../components/TransactionMap';
import Header from '../components/Header';

// Chart imports for dashboard visualization
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [fraudAnalysis, setFraudAnalysis] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get user data
        const userData = await getLoggedInUser();
        if (!userData) {
          router.push('/login');
          return;
        }
        setUser(userData);
        
        // Get transaction data with a reasonable page size
        const response = await fetch('/api/excel-transactions?page=1&limit=500');
        const data = await response.json();
        
        if (data.success) {
          setTransactions(data.data || []);
          setTotalRecords(data.pagination?.total || 0);
          console.log(`Loaded ${data.data?.length || 0} transactions (page 1 of ${data.pagination?.totalPages || 1})`);
        } else {
          console.error('Failed to load transactions:', data.error);
          
          // Fallback to regular transactions endpoint
          const fallbackResponse = await fetch('/api/transactions?page=1&limit=500');
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData.success) {
            setTransactions(fallbackData.transactions || []);
            setTotalRecords(fallbackData.pagination?.total || 0);
          } else {
            console.error('Failed to load fallback transactions:', fallbackData.error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [router]);
  
  // Prepare category chart data
  const prepareCategoryData = () => {
    const categories: { [key: string]: { count: number; fraudCount: number } } = {};
    
    transactions.forEach(transaction => {
      if (!categories[transaction.category]) {
        categories[transaction.category] = { count: 0, fraudCount: 0 };
      }
      
      categories[transaction.category].count += 1;
      
      if (transaction.is_fraud === 1) {
        categories[transaction.category].fraudCount += 1;
      }
    });
    
    const labels = Object.keys(categories);
    const data = {
      labels,
      datasets: [
        {
          label: 'Total Transactions',
          data: labels.map(label => categories[label].count),
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Fraudulent Transactions',
          data: labels.map(label => categories[label].fraudCount),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };
    
    return data;
  };
  
  // Prepare pie chart data for fraud distribution
  const prepareFraudData = () => {
    const fraudCount = transactions.filter(t => t.is_fraud === 1).length;
    const safeCount = transactions.length - fraudCount;
    
    const data = {
      labels: ['Safe Transactions', 'Fraudulent Transactions'],
      datasets: [
        {
          data: [safeCount, fraudCount],
          backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
          borderWidth: 1,
        },
      ],
    };
    
    return data;
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 max-w-lg w-full">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <Link href="/login">
          <a className="text-blue-600 hover:underline mt-4">Return to Login</a>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard | Fraud Detection System</title>
        <meta name="description" content="Monitor your financial transactions and detect fraud in real-time" />
      </Head>
      
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Financial Fraud Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor your transaction data and detect potential fraud in real-time
          </p>
        </div>
        
        <div className="mb-8">
          <StatsPanel transactions={transactions} totalCount={totalRecords} />
          <div className="mt-1 mb-4 text-sm text-gray-500">
            Showing {transactions.length} transactions from a total of {totalRecords.toLocaleString()} records in the dataset
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Fraud Risk by Category</h2>
            <div className="h-80">
              <FraudRiskChart transactions={transactions} />
            </div>
          </div>
          
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Transaction Locations</h2>
            <div className="h-80">
              <TransactionMap transactions={transactions} />
            </div>
          </div>
        </div>
        
        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Recent Transactions</h2>
          <TransactionTable transactions={transactions} />
        </div>
      </main>
    </div>
  );
} 