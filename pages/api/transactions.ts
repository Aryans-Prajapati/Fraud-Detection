import { NextApiRequest, NextApiResponse } from 'next';
import * as fs from 'fs';
import path from 'path';
import { Transaction } from '../../types/types';
import { loadExcelTransactions } from '../../lib/excelDataLoader';
import { DEFAULT_DATASET } from '../../lib/config';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get pagination parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100; // Default to 100 transactions
    
    // Check if we should use Excel data based on environment variable
    const useExcel = DEFAULT_DATASET === 'excel';
    
    let transactions: Transaction[] = [];
    
    if (useExcel) {
      // Try to load Excel data
      const excelTransactions = await loadExcelTransactions();
      
      if (excelTransactions && excelTransactions.length > 0) {
        console.log(`[API] Loaded ${excelTransactions.length} Excel transactions, returning page ${page}`);
        transactions = excelTransactions;
      } else {
        console.log("[API] No Excel transactions found, falling back to default data");
        // Fall back to default data
        transactions = await loadDefaultTransactions();
      }
    } else {
      // Load default transactions
      transactions = await loadDefaultTransactions();
    }
    
    // Apply pagination to avoid large responses
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    console.log(`[API] Returning ${paginatedTransactions.length} transactions (page ${page} of ${Math.ceil(transactions.length / limit)})`);
    
    // Return paginated data with metadata
    res.status(200).json({
      success: true,
      transactions: paginatedTransactions,
      pagination: {
        total: transactions.length,
        page,
        limit,
        totalPages: Math.ceil(transactions.length / limit)
      }
    });
  } catch (error) {
    console.error('Error loading transactions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to load transactions' 
    });
  }
}

// Function to load the default transactions dataset
async function loadDefaultTransactions(): Promise<Transaction[]> {
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), 'data', 'transactions.json');
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData) as Transaction[];
  } catch (error) {
    console.error('Error loading default transactions:', error);
    return [];
  }
} 