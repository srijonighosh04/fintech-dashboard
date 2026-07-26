export interface NavItem {
  title: string;
  href: string;
  iconName: 'LayoutDashboard' | 'CreditCard' | 'ArrowLeftRight' | 'History' | 'Settings';
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    iconName: 'LayoutDashboard',
  },
  {
    title: 'Accounts',
    href: '/dashboard/accounts',
    iconName: 'CreditCard',
  },
  {
    title: 'Transfers',
    href: '/dashboard/transfers',
    iconName: 'ArrowLeftRight',
  },
  {
    title: 'Transactions',
    href: '/dashboard/transactions',
    iconName: 'History',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    iconName: 'Settings',
  },
];
