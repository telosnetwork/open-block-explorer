import { Authorization, Action } from './index';

export interface TreeNode {
  label: string;
  header: string;
  body: string;
  name: string;
  account: string;
  authorization: Authorization[];
  data: unknown;
  action: Action;
  children: TreeNode[];
  notifications: string[];
}
