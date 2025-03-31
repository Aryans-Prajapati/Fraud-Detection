/**
 * Application configuration settings
 */

// Default dataset to use
// Options: 'default', 'excel'
export const DEFAULT_DATASET = 'excel';

// Path to the Excel file
export const EXCEL_FILENAME = 'Final Daksh.xlsx';

// Path settings
export const DATA_DIR = 'data';

// API settings
export const API_ENDPOINTS = {
  transactions: '/api/transactions',
  excelTransactions: '/api/excel-transactions',
  excelStructure: '/api/excel-structure',
  users: '/api/users',
}; 