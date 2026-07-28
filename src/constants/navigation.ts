export interface NavItem {
  title: string;
  href: string;
  iconName: 'LayoutDashboard' | 'CreditCard' | 'ArrowLeftRight' | 'History' | 'Settings' | 'Wallet' | 'BrainCircuit';
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    title: 'Accounts',
    href: '/dashboard', // Links directly to the overview where accounts card links reside
    iconName: 'CreditCard',
  },
  {
    title: 'Transfers',
    href: '/transfers', // Fixed from /dashboard/transfers to prevent 404
    iconName: 'ArrowLeftRight',
  },
  {
    title: 'Transactions',
    href: '/transactions', // Fixed from /dashboard/transactions to prevent 404
    iconName: 'History',
  },
  {
    title: 'Budgets',
    href: '/budgets', // New budget planner page route
    iconName: 'Wallet',
  },
  {
    title: 'AI Assistant',
    href: '/assistant', // New AI financial assistant route page
    iconName: 'BrainCircuit',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    iconName: 'Settings',
  },
];
