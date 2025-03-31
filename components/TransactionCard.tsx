import React from 'react';
import { Transaction } from '../lib/dataLoader';
import { ExclamationIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/solid';

interface TransactionCardProps {
  transaction: Transaction;
  fraudAnalysis?: {
    probability: number;
    isFraud: boolean;
    warningLevel: 'high' | 'medium' | 'low' | 'none';
    reasons: string[];
  };
}

const TransactionCard: React.FC<TransactionCardProps> = ({ 
  transaction, 
  fraudAnalysis 
}) => {
  // Format date from timestamp
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Determine card color based on fraud status or analysis
  const getCardClass = () => {
    if (transaction.is_fraud === 1) {
      return 'border-red-500 bg-red-50';
    }
    
    if (fraudAnalysis) {
      if (fraudAnalysis.warningLevel === 'high') {
        return 'border-red-500 bg-red-50';
      } else if (fraudAnalysis.warningLevel === 'medium') {
        return 'border-orange-500 bg-orange-50';
      } else if (fraudAnalysis.warningLevel === 'low') {
        return 'border-yellow-500 bg-yellow-50';
      }
    }
    
    return 'border-green-500 bg-green-50';
  };
  
  // Get fraud warning icon and text
  const getFraudWarning = () => {
    if (transaction.is_fraud === 1) {
      return {
        icon: <ExclamationIcon className="h-6 w-6 text-red-600" />,
        text: 'Fraudulent Transaction',
        textColor: 'text-red-700',
        badgeColor: 'bg-red-100 text-red-800'
      };
    }
    
    if (fraudAnalysis) {
      if (fraudAnalysis.warningLevel === 'high') {
        return {
          icon: <ExclamationIcon className="h-6 w-6 text-red-600" />,
          text: 'High Fraud Risk',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-800'
        };
      } else if (fraudAnalysis.warningLevel === 'medium') {
        return {
          icon: <ExclamationCircleIcon className="h-6 w-6 text-orange-600" />,
          text: 'Medium Fraud Risk',
          textColor: 'text-orange-700',
          badgeColor: 'bg-orange-100 text-orange-800'
        };
      } else if (fraudAnalysis.warningLevel === 'low') {
        return {
          icon: <InformationCircleIcon className="h-6 w-6 text-yellow-600" />,
          text: 'Low Fraud Risk',
          textColor: 'text-yellow-700',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      }
    }
    
    return {
      icon: <CheckCircleIcon className="h-6 w-6 text-green-600" />,
      text: 'Safe Transaction',
      textColor: 'text-green-700',
      badgeColor: 'bg-green-100 text-green-800'
    };
  };
  
  const warning = getFraudWarning();
  
  // Get risk score percentage display
  const getRiskScore = () => {
    if (!fraudAnalysis) return null;
    
    const percentage = Math.round(fraudAnalysis.probability * 100);
    let colorClass = 'text-green-700';
    
    if (percentage > 70) {
      colorClass = 'text-red-700';
    } else if (percentage > 40) {
      colorClass = 'text-orange-700';
    } else if (percentage > 20) {
      colorClass = 'text-yellow-700';
    }
    
    return (
      <div className="mt-2">
        <p className="text-sm font-medium text-gray-600">Risk Score</p>
        <p className={`text-lg font-bold ${colorClass}`}>{percentage}%</p>
      </div>
    );
  };
  
  return (
    <div className={`rounded-lg shadow-md border-l-4 ${getCardClass()} hover:shadow-lg transition-shadow duration-200`}>
      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold">{transaction.merchant}</h3>
              <span className={`ml-3 text-xs font-medium px-2.5 py-0.5 rounded ${warning.badgeColor}`}>
                {warning.text}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-gray-700">{formatDate(transaction.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-gray-900 font-semibold">{formatCurrency(transaction.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-gray-700">{transaction.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="text-gray-700 capitalize">{transaction.transaction_type}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 md:ml-6 md:min-w-[120px] md:text-right flex flex-col items-start md:items-end">
            <div className="flex items-center mb-1">
              {warning.icon}
              <span className={`ml-2 font-semibold ${warning.textColor}`}>{warning.text}</span>
            </div>
            
            {getRiskScore()}
            
            {fraudAnalysis && fraudAnalysis.warningLevel !== 'none' && fraudAnalysis.reasons.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-3 w-full">
                <p className="text-sm font-semibold text-gray-700">Risk factors:</p>
                <ul className="text-sm mt-1">
                  {fraudAnalysis.reasons.map((reason, index) => (
                    <li key={index} className="flex items-start mt-1">
                      <ExclamationCircleIcon className="h-4 w-4 text-red-500 mt-0.5 mr-1.5 flex-shrink-0" />
                      <span className="text-gray-600">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard; 