/* regex to validate EOSIO account name convention see: https://regex101.com/r/d8uKrG/1 */

export function isValidAccount(account: string): boolean {
  const regEx = /(^[a-z1-5.]{1,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/;
  return regEx.exec(account.toLocaleLowerCase()) != null;
}

export function isValidHex(hexString: string): boolean {
  const regEx = /[0-9A-Fa-f]{6}/g;
  return regEx.exec(hexString) != null;
}
