export function encodeAccount(account: string): string {
  return encodeURIComponent(account.replace(/\./g, '%2E;'));
}

export function decodeAccount(account: string): string {
  return decodeURIComponent(account).replace(/%2E;/g, '');
}
