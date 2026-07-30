export interface NavItem {
  title: string;
  href: string;
  iconName: 'LayoutDashboard' | 'CreditCard' | 'ArrowLeftRight' | 'History' | 'Settings' | 'Wallet' | 'BrainCircuit' | 'Cpu' | 'Shield';
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    title: 'Accounts',
    href: '/dashboard',
    iconName: 'CreditCard',
  },
  {
    title: 'Transfers',
    href: '/transfers',
    iconName: 'ArrowLeftRight',
  },
  {
    title: 'Transactions',
    href: '/transactions',
    iconName: 'History',
  },
  {
    title: 'Budgets',
    href: '/budgets',
    iconName: 'Wallet',
  },
  {
    title: 'AI Assistant',
    href: '/assistant',
    iconName: 'BrainCircuit',
  },
  {
    title: 'Automation',
    href: '/automation',
    iconName: 'Cpu',
  },
  {
    title: 'Fraud Center',
    href: '/dashboard/fraud', // New fraud analytics and queue route page
    iconName: 'Shield',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    iconName: 'Settings',
  },
];
