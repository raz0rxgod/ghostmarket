import { authFetch } from './api';

export type RoleName = 'ADMIN' | 'MANAGER' | 'EDITOR' | 'CUSTOMER';

export interface Me {
  id: string;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  role: RoleName;
}

export function getMe() {
  return authFetch<Me>('/users/me');
}
