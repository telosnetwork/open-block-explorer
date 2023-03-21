/* regex to validate EOSIO account name convention see: https://regex101.com/r/d8uKrG/1 */
import { getChain } from 'src/config/ConfigManager';
import { RexHistory } from 'src/types';

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
 * @param {boolean} skipPrettyPrinting - optional, whether to prevent commification & the trimming of trailing zeroes
 */
export function formatCurrency(
    amount: string | number,
    precision: number,
    symbol?: string,
    skipPrettyPrinting?: boolean,
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

    if (!skipPrettyPrinting) {
        // commify
        amountAsString = (() => {
            const [integer, fraction] = amountAsString.split('.');

            return `${(+integer).toLocaleString('en')}.${fraction}`;
        })();
    }


    if (+amountAsString === 0 && !skipPrettyPrinting) {
        amountAsString = '0';
    }

    if (symbol) {
        amountAsString += ` ${symbol}`;
    }

    return amountAsString;
}

/**
 * Given a string asset value (e.g. `12.3456 TLOS`), returns the numerical part as a number type.
 * @param {string} asset - the asset value string
 */
export function assetToAmount(asset: string): number {
    try {
        const qty: string = asset.split(' ')[0];
        return parseFloat(qty);
    } catch (error) {
        return 0;
    }
}

export function formatDate(date: string, showTime = true): string {
    return showTime ?
        new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        }) :
        new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
            day: 'numeric',
        });
}

export function getRexHistoryAsset(data: RexHistory): string {
    if (data.rex){
        return data.rex;
    }
    if (typeof data.amount === 'number') {
        const total = (assetToAmount(data.from_cpu) + assetToAmount(data.from_net));
        const symbol = getChain().getSystemToken().symbol;
        return `${total} ${symbol}`;
    }else{
        return data.amount;
    }
}
