import { Transaction, User } from '../types/types';
import { mockTransactions, mockUsers } from '../data/mockData';
import fs from 'fs';
import path from 'path';
import { loadExcelTransactions } from './excelDataLoader';
import { DEFAULT_DATASET, DATA_DIR } from './config';

// Load transaction data with dataset selection support
export async function loadTransactions(userId?: string): Promise<Transaction[]> {
  try {
    // Default to excel dataset
    const defaultDataset = 'excel';
    
    // If running in browser, check localStorage which overrides the default
    let transactions: Transaction[] = [];
    
    if (typeof window !== 'undefined') {
      const activeDataset = localStorage.getItem('activeDataset') || defaultDataset;
      
      if (activeDataset === 'excel') {
        // In browser, fetch from API
        try {
          const response = await fetch('/api/excel-transactions');
          const result = await response.json();
          
          if (result.success && result.data && result.data.length > 0) {
            console.log(`Loaded ${result.data.length} Excel transactions`);
            transactions = result.data;
          } else {
            console.error('Error loading Excel transactions, falling back to default:', 
              result.error || 'No data returned');
            // Fallback to default data
            transactions = await loadDefaultTransactions();
          }
        } catch (error) {
          console.error('Error fetching Excel transactions, falling back to default:', error);
          transactions = await loadDefaultTransactions();
        }
      } else {
        // Load default data
        transactions = await loadDefaultTransactions();
      }
    } else {
      // Server-side
      try {
        // First try Excel
        transactions = await loadExcelTransactions();
        
        if (!transactions || transactions.length === 0) {
          console.log('No Excel transactions found, falling back to default');
          // Fallback to default if Excel loading fails
          transactions = await loadDefaultTransactions();
        } else {
          console.log(`Loaded ${transactions.length} Excel transactions on server`);
        }
      } catch (error) {
        console.error('Error loading Excel transactions on server, falling back to default:', error);
        transactions = await loadDefaultTransactions();
      }
    }

    // Filter by user if specified
    if (userId) {
      transactions = transactions.filter(t => t.customer_id === userId);
    }

    // Sort by date (newest first)
    return transactions.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
}

// Load transactions for a specific user
export const loadUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    // Filter transactions for this user
    return mockTransactions.filter(t => t.customer_id === userId);
  } catch (error) {
    console.error('Error loading user transactions:', error);
    return [];
  }
};

// Load user data 
export const loadUsers = async (): Promise<User[]> => {
  try {
    // Return mock users
    return mockUsers;
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = mockUsers.find(u => u.email === email);
    return user || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = mockUsers.find(u => u.id === id);
    return user || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Function to load the default transactions dataset
async function loadDefaultTransactions(): Promise<Transaction[]> {
  try {
    // In browser, use the existing fetch approach
    if (typeof window !== 'undefined') {
      return await fetchTransactions();
    }
    
    // Server-side, read the JSON file
    const filePath = path.join(process.cwd(), DATA_DIR, 'transactions.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData) as Transaction[];
  } catch (error) {
    console.error('Error loading default transactions:', error);
    return [];
  }
}

// Original fetch function for client-side data loading
async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const response = await fetch('/api/transactions');
    const data = await response.json();
    return data.transactions as Transaction[];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
} 