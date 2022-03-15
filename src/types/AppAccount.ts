import { Account } from './Actions';

export interface AppAccount extends Account {
  linkedAccounts: AppAccount[];
  isAuthenticated: boolean;
}
