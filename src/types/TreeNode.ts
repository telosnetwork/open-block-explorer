import { Authorization } from './index';

export interface TreeNode {
  label: string;
  header: string;
  body: string;
  name: string;
  account: string;
  authorization: Authorization[];
  data: unknown;
  children: TreeNode[];
  notifications: string[];
}
