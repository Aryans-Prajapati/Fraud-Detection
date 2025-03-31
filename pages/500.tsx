import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { ExclamationIcon } from '@heroicons/react/outline';

export default function ServerErrorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Head>
        <title>Server Error | Fraud Detection System</title>
        <meta name="description" content="An unexpected error occurred" />
      </Head>
      
      <main className="flex flex-grow flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ExclamationIcon className="h-10 w-10 text-red-600" />
          </div>
          
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            500 - Server Error
          </h1>
          
          <p className="mt-4 text-base text-gray-600">
            We apologize for the inconvenience. Our server encountered an unexpected condition that prevented it from fulfilling your request.
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