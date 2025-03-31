import * as XLSX from 'xlsx';
import * as fs from 'fs';
import path from 'path';
import { Transaction } from '../types/types';
import { DATA_DIR, EXCEL_FILENAME } from './config';

/**
 * Loads transaction data from an Excel file
 * @param filename The name of the Excel file to load
 * @returns Array of transaction objects
 */
export async function loadExcelTransactions(filename: string = EXCEL_FILENAME): Promise<Transaction[]> {
  try {
    const filePath = path.join(process.cwd(), DATA_DIR, filename);
    console.log('Loading Excel file from:', filePath);
    
    if (!fs.existsSync(filePath)) {
      console.error('Excel file not found at path:', filePath);
      return [];
    }
    
    const workbook = XLSX.readFile(filePath, {
      // Use streaming for better performance with large files
      cellFormula: false,
      cellHTML: false,
      cellStyles: false,
      sheetStubs: true,
      WTF: false // Don't need XLSX metadata
    });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    console.log('Using sheet:', sheetName);
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    console.log('Raw data rows:', rawData.length);
    
    if (rawData.length === 0) {
      console.error('No data found in Excel file');
      return [];
    }
    
    // Log the first row to help debug field mappings
    console.log('First row sample:', JSON.stringify(rawData[0]));
    
    // Improve Excel data processing with more efficient mapping for large datasets
    console.log('Beginning transformation of Excel data to transactions...');
    const startTime = Date.now();

    // Process in batches for better memory management
    const batchSize = 10000;
    let transactions: Transaction[] = [];

    for (let i = 0; i < rawData.length; i += batchSize) {
      const batch = rawData.slice(i, i + batchSize);
      const batchTransactions = batch.map((row: any, index) => {
        const actualIndex = i + index;
        
        // Create timestamp from date and time fields
        const dateStr = row.date || '';
        const timeStr = row.time || '';
        const timestamp = dateStr && timeStr 
          ? `${dateStr}T${timeStr}` 
          : new Date().toISOString();
        
        // Get fraud category
        let category = 'Uncategorized';
        
        // Check fraud type fields
        if (row.fraud_type_Account_takeover === 1) category = 'Account Takeover';
        else if (row.fraud_type_Phishing === 1) category = 'Phishing';
        else if (row.fraud_type_cyber_attack === 1) category = 'Cyber Attack';
        else if (row.fraud_type_mandate === 1) category = 'Mandate Fraud';
        else if (row.fraud_type_unauthorized_transaction === 1) category = 'Unauthorized Transaction';
        else if (row.fraud_type_No_Fraud === 1) category = 'Normal Transaction';
        
        return {
          transaction_id: row.transaction_id?.toString() || `excel-${actualIndex}`,
          amount: parseFloat(row.amount) || 0,
          timestamp: timestamp,
          merchant: `Transaction ${row.transaction_id?.substring(0, 8)}`, // No merchant in data
          category: category,
          is_fraud: row.fraud || 0,
          is_online: row.online_order === 1,
          transaction_type: row.foreign_transaction === 1 ? 'foreign' : 'domestic',
          customer_id: `${row.from_account || 'unknown'}`,
          source: 'excel',
          // Include additional fields that might be useful
          unusual_amount: row.unusual_amount || 0,
          distance_from_home: row.distance_from_home || 0,
          repeat_retailer: row.repeat_retailer || 0,
          to_account: row.to_account || ''
        };
      });
      
      transactions.push(...batchTransactions);
      
      // Log progress for long-running operations
      if ((i + batchSize) % 20000 === 0 || i + batchSize >= rawData.length) {
        console.log(`Processed ${Math.min(i + batchSize, rawData.length)} of ${rawData.length} records (${Math.round((Math.min(i + batchSize, rawData.length) / rawData.length) * 100)}%)`);
      }
    }

    const endTime = Date.now();
    console.log(`Successfully loaded ${transactions.length} transactions from Excel file in ${(endTime - startTime) / 1000} seconds`);
    
    return transactions;
  } catch (error) {
    console.error('Error loading Excel data:', error);
    return [];
  }
}

/**
 * Analyzes the Excel data structure and returns column mappings
 * @param filename The name of the Excel file to analyze
 * @returns Object containing column structure information
 */
export async function analyzeExcelStructure(filename: string = EXCEL_FILENAME) {
  try {
    const filePath = path.join(process.cwd(), DATA_DIR, filename);
    const workbook = XLSX.readFile(filePath);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // First row should be headers
    const headers = data[0] as string[];
    
    // Get a sample row 
    const sampleRow = data.length > 1 ? data[1] : null;
    
    return {
      headers,
      sampleRow,
      rowCount: data.length - 1, // Excluding header row
      sheetName
    };
  } catch (error) {
    console.error('Error analyzing Excel structure:', error);
    return { headers: [], sampleRow: null, rowCount: 0, sheetName: '' };
  }
} 