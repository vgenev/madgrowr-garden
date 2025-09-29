import { LayoutDashboard, Calendar, ListTodo, Sprout, BookHeart } from 'lucide-react';
export const NAV_LINKS = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/beds',
    label: 'My Beds',
    icon: Sprout,
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: Calendar,
  },
  {
    href: '/tasks',
    label: 'Tasks',
    icon: ListTodo,
  },
  {
    href: '/journal',
    label: 'Journal',
    icon: BookHeart,
  },
];