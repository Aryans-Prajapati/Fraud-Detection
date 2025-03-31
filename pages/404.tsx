import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { ExclamationCircleIcon } from '@heroicons/react/outline';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Head>
        <title>Page Not Found | Fraud Detection System</title>
        <meta name="description" content="The page you are looking for could not be found" />
      </Head>
      
      <main className="flex flex-grow flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <ExclamationCircleIcon className="mx-auto h-16 w-16 text-red-500" />
          
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            404 - Page Not Found
          </h1>
          
          <p className="mt-4 text-base text-gray-600">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          
          <div className="mt-10">
            <Link href="/">
              <a className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Go back to homepage
              </a>
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} FraudDetect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 