export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Transaction {
  transaction_id: string;
  timestamp: string;
  amount: number;
  merchant: string;
  category: string;
  is_fraud: number;
  is_online: boolean;
  transaction_type: string;
  customer_id: string;
  source: string;
} 