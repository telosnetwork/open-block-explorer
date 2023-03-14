/* regex to validate EOSIO account name convention see: https://regex101.com/r/d8uKrG/1 */

export function isValidAccount(account: string): boolean {
    const regEx = /(^[a-z1-5.]{1,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-z1-5]$)/;
    return regEx.exec(account) !== null;
}

export function isValidTransactionHex(hexString: string): boolean {
    const regEx = /^([0-9A-Fa-f]){64}$/g;
    return regEx.exec(hexString) !== null;
}

/**
 * Given an amount of currency (e.g. `"1.0700"` or `3.4`), returns a pretty-printed string. Hidden-zero fractions
 * such as `.2` are not accepted.
 *
 * @param {number|string} amount - the quantity of the currency
 * @param {number} precision - the number of decimal places to be preserved
 * @param {string} symbol - optional, the symbol of the currency
 */
export function formatCurrency(
    amount: string | number,
    precision: number,
    symbol?: string,
): string {
    const floatingPointNumberRegex = /^-?(0|[1-9]\d*)(\.\d+)?$/;
    const amountIsValid =
        (typeof amount === 'number' || floatingPointNumberRegex.test(amount)) &&
        !Number.isNaN(amount);

    if (!amountIsValid) {
        throw `${amount} is not a valid number`;
    }

    let amountAsString = typeof amount === 'number' ? amount.toString() : amount;

    // ensure correct precision
    amountAsString = (+amountAsString).toFixed(precision);

    // commify
    amountAsString = (() => {
        const [integer, fraction] = amountAsString.split('.');

        return `${(+integer).toLocaleString()}.${fraction}`;
    })();

    if (+amountAsString === 0) {
        amountAsString = '0';
    }

    if (symbol) {
        amountAsString += ` ${symbol}`;
    }

    return amountAsString;
}
