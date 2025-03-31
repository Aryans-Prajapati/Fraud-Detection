import { Transaction, User } from '../types/types';

// Mock transaction data
export const mockTransactions: Transaction[] = [
  {
    transaction_id: "tx_001",
    timestamp: "2023-06-01T10:30:00Z",
    amount: 125.50,
    merchant: "Amazon",
    category: "Shopping",
    is_fraud: 0,
    is_online: true,
    transaction_type: "online",
    customer_id: "1",
    source: "credit_card"
  },
  {
    transaction_id: "tx_002",
    timestamp: "2023-06-02T14:20:00Z",
    amount: 45.75,
    merchant: "Starbucks",
    category: "Food",
    is_fraud: 0,
    is_online: false,
    transaction_type: "in-store",
    customer_id: "1",
    source: "debit_card"
  },
  {
    transaction_id: "tx_003",
    timestamp: "2023-06-03T09:15:00Z",
    amount: 500.00,
    merchant: "Best Buy",
    category: "Electronics",
    is_fraud: 0,
    is_online: false,
    transaction_type: "in-store",
    customer_id: "1",
    source: "credit_card"
  },
  {
    transaction_id: "tx_004",
    timestamp: "2023-06-04T18:45:00Z",
    amount: 3500.00,
    merchant: "Unknown Merchant",
    category: "Other",
    is_fraud: 1,
    is_online: true,
    transaction_type: "online",
    customer_id: "1",
    source: "credit_card"
  },
  {
    transaction_id: "tx_005",
    timestamp: "2023-06-05T11:30:00Z",
    amount: 75.25,
    merchant: "Uber",
    category: "Transport",
    is_fraud: 0,
    is_online: true,
    transaction_type: "online",
    customer_id: "1",
    source: "credit_card"
  },
  {
    transaction_id: "tx_006",
    timestamp: "2023-06-06T20:10:00Z",
    amount: 225.00,
    merchant: "Nike",
    category: "Shopping",
    is_fraud: 0,
    is_online: true,
    transaction_type: "online",
    customer_id: "2",
    source: "credit_card"
  },
  {
    transaction_id: "tx_007",
    timestamp: "2023-06-07T12:45:00Z",
    amount: 1800.00,
    merchant: "Fake Electronics",
    category: "Electronics",
    is_fraud: 1,
    is_online: true,
    transaction_type: "online",
    customer_id: "2",
    source: "credit_card"
  },
  {
    transaction_id: "tx_008",
    timestamp: "2023-06-08T09:20:00Z",
    amount: 55.50,
    merchant: "Walmart",
    category: "Groceries",
    is_fraud: 0,
    is_online: false,
    transaction_type: "in-store",
    customer_id: "2",
    source: "debit_card"
  },
  {
    transaction_id: "tx_009",
    timestamp: "2023-06-09T15:30:00Z",
    amount: 95.75,
    merchant: "Apple",
    category: "Electronics",
    is_fraud: 0,
    is_online: true,
    transaction_type: "online",
    customer_id: "2",
    source: "credit_card"
  },
  {
    transaction_id: "tx_010",
    timestamp: "2023-06-10T17:15:00Z",
    amount: 35.25,
    merchant: "Netflix",
    category: "Entertainment",
    is_fraud: 0,
    is_online: true,
    transaction_type: "online",
    customer_id: "1",
    source: "credit_card"
  },
  {
    transaction_id: "tx_011",
    timestamp: "2023-06-11T13:40:00Z",
    amount: 1250.00,
    merchant: "Unknown Travel Agency",
    category: "Travel",
    is_fraud: 1,
    is_online: true,
    transaction_type: "online",
    customer_id: "1",
    source: "credit_card"
  },
  {
    transaction_id: "tx_012",
    timestamp: "2023-06-12T10:20:00Z",
    amount: 85.50,
    merchant: "Target",
    category: "Shopping",
    is_fraud: 0,
    is_online: false,
    transaction_type: "in-store",
    customer_id: "2",
    source: "debit_card"
  }
];

// Mock user data
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@frauddetect.com",
    role: "admin"
  },
  {
    id: "2",
    name: "Regular User",
    email: "user1@example.com",
    role: "user"
  }
]; 