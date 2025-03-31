import { NextApiRequest, NextApiResponse } from 'next';
import { loadExcelTransactions } from '../../lib/excelDataLoader';

// Create a cache to store transactions
let cachedTransactions: any[] | null = null;
let lastFetchTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get pagination parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100; // Default to 100 transactions
    
    // Use cached transactions if available and not expired
    const currentTime = Date.now();
    if (!cachedTransactions || currentTime - lastFetchTime > CACHE_TTL) {
      console.log('Cache miss or expired, loading transactions from Excel file');
      // Load all transactions
      cachedTransactions = await loadExcelTransactions();
      lastFetchTime = currentTime;
    } else {
      console.log('Using cached transactions data');
    }
    
    if (!cachedTransactions || cachedTransactions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No transactions found in Excel file'
      });
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = cachedTransactions.slice(startIndex, endIndex);
    
    console.log(`[API] Excel: Returning ${paginatedTransactions.length} transactions (page ${page} of ${Math.ceil(cachedTransactions.length / limit)})`);
    
    // Return paginated data with metadata
    res.status(200).json({ 
      success: true, 
      count: cachedTransactions.length,
      data: paginatedTransactions,
      pagination: {
        total: cachedTransactions.length,
        page,
        limit,
        totalPages: Math.ceil(cachedTransactions.length / limit)
      }
    });
  } catch (error) {
    console.error('Error loading Excel transactions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load transactions from Excel file' 
    });
  }
} 