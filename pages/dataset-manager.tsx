import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getLoggedInUser, isAdmin } from '../lib/auth';
import Head from 'next/head';
import Header from '../components/Header';

type ExcelStructure = {
  headers: string[];
  sampleRow: any[];
  rowCount: number;
  sheetName: string;
}

export default function DatasetManager() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [excelStructure, setExcelStructure] = useState<ExcelStructure | null>(null);
  const [activeDataset, setActiveDataset] = useState<string>('excel');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getLoggedInUser();
        
        if (!userData || !userData.role || userData.role !== 'admin') {
          router.push('/login');
          return;
        }
        
        setUser(userData);
        fetchExcelStructure();
        
        // Check localStorage for active dataset
        const storedDataset = localStorage.getItem('activeDataset');
        if (storedDataset) {
          setActiveDataset(storedDataset);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchExcelStructure = async () => {
    try {
      const response = await fetch('/api/excel-structure');
      const result = await response.json();
      
      if (result.success) {
        setExcelStructure(result.data);
      } else {
        setError('Failed to load Excel structure: ' + result.error);
      }
    } catch (error) {
      console.error('Error fetching Excel structure:', error);
      setError('Network error while loading Excel structure');
    }
  };

  const switchDataset = async (dataset: string) => {
    try {
      // In a real app, this would make an API call to switch the active dataset
      // For now, we'll just update the state
      setActiveDataset(dataset);
      
      // Store the preference in localStorage
      localStorage.setItem('activeDataset', dataset);
      
      // Refresh the page to load new data
      router.reload();
    } catch (error) {
      console.error('Error switching dataset:', error);
      setError('Failed to switch dataset');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-700">Loading...</h1>
        <p className="mt-2 text-gray-500">Please wait while we load the dataset information</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dataset Manager | Fraud Detection System</title>
        <meta name="description" content="Manage and inspect datasets for the fraud detection system" />
      </Head>
      
      <Header user={user} />
      
      <main className="container mx-auto px-4 py-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dataset Manager</h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage datasets used for fraud detection
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Active Dataset</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-white overflow-hidden shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Default Dataset</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          Synthetic Transactions
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => switchDataset('default')}
                    disabled={activeDataset === 'default'}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                      activeDataset === 'default'
                        ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    }`}
                  >
                    {activeDataset === 'default' ? 'Currently Active' : 'Switch to Default'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg border">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Excel Dataset</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {excelStructure ? 'Final Daksh.xlsx' : 'Not loaded'}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => switchDataset('excel')}
                    disabled={activeDataset === 'excel'}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                      activeDataset === 'excel'
                        ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }`}
                  >
                    {activeDataset === 'excel' ? 'Currently Active' : 'Switch to Excel Data'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {excelStructure && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Excel File Structure</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the Excel dataset.</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">File Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Final Daksh.xlsx</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Sheet Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{excelStructure.sheetName}</dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Row Count</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{excelStructure.rowCount} rows (excluding header)</dd>
                </div>
              </dl>
            </div>
            
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Data Preview</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Column headers in the Excel file.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Column Index
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Column Name
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {excelStructure.headers.map((header, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {header}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 