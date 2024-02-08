// system accounts without resources
export const systemAccounts: string[] = ['eosio.token', 'eosio'];

export const isSystemAccount = (accountName: string) => systemAccounts.includes(accountName);
