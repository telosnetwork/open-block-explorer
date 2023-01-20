export interface StakeResourcesTransactionData {
  from: string;
  receiver: string;
  transfer: boolean;
  stake_cpu_quantity?: string;
  stake_net_quantity?: string;
}
