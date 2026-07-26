export interface User {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  merchant: string;
  date: string;
  category: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  accountNumber: string;
  type: 'checking' | 'savings' | 'credit';
}
