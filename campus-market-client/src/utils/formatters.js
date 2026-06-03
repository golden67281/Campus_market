import { formatDistanceToNow, format } from 'date-fns';

export const timeAgo = (dateStr) =>
  formatDistanceToNow(new Date(dateStr), { addSuffix: true });

export const formatDate = (dateStr) =>
  format(new Date(dateStr), 'MMM yyyy'); // → "Jan 2025"

export const formatPrice = (price, isFree) =>
  isFree ? 'Free' : `₹ ${price.toLocaleString('en-IN')}`;

export const truncate = (str, len = 40) =>
  str.length > len ? str.slice(0, len) + '…' : str;

export const initials = (name) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
