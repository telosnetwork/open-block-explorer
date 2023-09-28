import { describe, expect, it } from '@jest/globals';
import {
    isValidAccount,
    isValidTransactionHex,
    formatCurrency,
    assetToAmount,
    formatNumberWithCommas,
    formatDate,
    getRexHistoryAsset,
} from 'src/utils/string-utils';

describe('string-utils utility functions', () => {
    describe('isValidAccount', () => {
        it('returns true for accounts with lowercase letters, numbers 1-5, containing non-terminating periods up to 13 characters', () => {
            const validAntelopeAccount = '.abcdef.12345';
            expect(isValidAccount(validAntelopeAccount)).toBe(true);
        });
        it('returns false for account names containing digits > 5', () => {
            const invalidAntelopeAccount = '123456';
            expect(isValidAccount(invalidAntelopeAccount)).toBe(false);
        });
        it('returns false for account names ending with a period', () => {
            const invalidAntelopeAccount = 'abc.';
            expect(isValidAccount(invalidAntelopeAccount)).toBe(false);
        });
        it('returns false for accounts names exceeding 13 characters', () => {
            const invalidAntelopeAccount = 'abcdefghijklmn';
            expect(isValidAccount(invalidAntelopeAccount)).toBe(false);
        });
    });

    describe('isValidTransactionHex', () => {
        it('returns true if value is 64 characters in length containing valid hex (0-9, A-F, a-f)', () => {
            const validTransactionHex =
        '0000000000000000000000000000000000000000000123456789abcdefABCDEF';
            expect(isValidTransactionHex(validTransactionHex)).toBe(true);
        });
        it('returns false if hex does not contain 64 characters', () => {
            const invalidTransactionHex = 'FFFFFF';
            expect(isValidTransactionHex(invalidTransactionHex)).toBe(false);
        });
        it('returns false if string does not contain valid uppercase characters', () => {
            const invalidTransactionHex = 'ABCDEFG';
            expect(isValidTransactionHex(invalidTransactionHex)).toBe(false);
        });
        it('returns false if string does not contain valid lowercase characters', () => {
            const invalidTransactionHex = 'abcdefg';
            expect(isValidTransactionHex(invalidTransactionHex)).toBe(false);
        });
    });

    describe('formatCurrency', () => {
        it('should correctly handle both numbers and strings', () => {
            const inputs = [
                '-1',
                '1',
                '1.0',
                '1.00',
                '1.000',
                '1.0000',
                '1.1000',
                '1.0100',
                '1.0010',
                '1.0001',
                '0',
                '1000000',
                1,
                1.0,
                1.1,
                0,
                -1,
                1000000,
            ];

            const expectedOutputs = [
                '-1.0000',
                '1.0000',
                '1.0000',
                '1.0000',
                '1.0000',
                '1.0000',
                '1.1000',
                '1.0100',
                '1.0010',
                '1.0001',
                '0',
                '1,000,000.0000',
                '1.0000',
                '1.0000',
                '1.1000',
                '0',
                '-1.0000',
                '1,000,000.0000',
            ];

            inputs.forEach((input, index) => {
                expect(formatCurrency(input, 4)).toBe(expectedOutputs[index]);
            });
        });

        it('should handle varying precision', () => {
            const input = '1.000000';

            expect(formatCurrency(input, 2)).toBe('1.00');
            expect(formatCurrency(input, 4)).toBe('1.0000');

            expect(formatCurrency(0, 2)).toBe('0');
            expect(formatCurrency(0, 4)).toBe('0');
        });

        it('should return the symbol when it is supplied', () => {
            const input = '1.0000';

            expect(formatCurrency(input, 2, 'USD')).toBe('1.00 USD');
            expect(formatCurrency(input, 4, 'KOYN')).toBe('1.0000 KOYN');

            expect(formatCurrency(0, 2, 'USD')).toBe('0 USD');
            expect(formatCurrency(0, 4, 'KOYN')).toBe('0 KOYN');
        });

        it('should pretty print when skipPrettyPrinting is true', () => {
            // zero-trimming should be skipped
            expect(formatCurrency('0.0000', 2, null, true)).toBe('0.00');
            expect(formatCurrency('0.0000', 4, null, true)).toBe('0.0000');
            expect(formatCurrency('0.0000', 2, 'USD', true)).toBe('0.00 USD');
            expect(formatCurrency('0.0000', 4, 'KOYN', true)).toBe('0.0000 KOYN');
            expect(formatCurrency('0', 2, null, true)).toBe('0.00');
            expect(formatCurrency('0', 4, null, true)).toBe('0.0000');
            expect(formatCurrency('0', 2, 'USD', true)).toBe('0.00 USD');
            expect(formatCurrency('0', 4, 'KOYN', true)).toBe('0.0000 KOYN');

            // commification should be skipped
            expect(formatCurrency('1000', 4, 'KOYN', true)).toBe('1000.0000 KOYN');
        });

        it('should throw an error when supplied an invalid amount', () => {
            const inputs = [
                '',
                '.',
                '.1',
                '0.',
                'a',
                NaN,
                null,
                undefined,
            ];

            inputs.forEach((input) => {
                expect(() => formatCurrency(input, 2)).toThrow();
            });
        });
    });

    describe('assetToAmount', () => {
        it('given asset string, return numerical value as number type', () => {
            const testAsset = '12.3456 COIN';
            const expectedResult = 12.3456;
            expect(assetToAmount(testAsset)).toEqual(expectedResult);
        });
        it('should return NaN if passed invalid asset param', () => {
            const testAsset = 'x';
            expect(assetToAmount(testAsset)).toBeNaN();
        });
    });

    describe('formatNumberWithCommas', () => {
        it('passed a number less than one thousand returns the same number as a string', () => {
            const testValue = 123;
            const expectedResult = '123';
            expect(formatNumberWithCommas(testValue)).toEqual(expectedResult);
        });
        it('inserts commas for numbers larger than four digits', () => {
            const testValue = 123456789;
            const expectedResult = '123,456,789';
            expect(formatNumberWithCommas(testValue)).toEqual(expectedResult);
        });
        it('does not insert commas for trailing decimal places exceeding four digits', () => {
            const testValue = 12345.6789;
            const expectedResult = '12,345.6789';
            expect(formatNumberWithCommas(testValue)).toEqual(expectedResult);
        });
    });

    describe('formatDate', () => {
        it('formats ISO date timestamp string to `<Month> <day>, <Year> at H:MM:SS <AM/PM>`', () => {
            const testDate = '2023-03-21T21:26:16+01:23';
            const expectedResult = new Date(testDate).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            });
            expect(formatDate(testDate)).toBe(expectedResult);
        });
        it('omits time (`at H:MM:SS <AM/PM>`) if optional showTime param `false` is passed', () => {
            const testDate = '2023-03-21T21:26:16+01:23';
            const expectedResult = 'March 21, 2023';
            expect(formatDate(testDate, false)).toBe(expectedResult);
        });
        it('should return "Invalid Date" if passed invalid date param', () => {
            const testDate = 'x';
            const expectedResult = 'Invalid Date';
            expect(formatDate(testDate)).toBe(expectedResult);
        });
    });

    describe('getRexHistoryAsset', () => {
        it('returns rex asset string if exists', () => {
            const testData = {
                rex: '4 KOYN',
            };
            expect(getRexHistoryAsset(testData)).toBe(testData.rex);
        });
        it('returns sum of cpu and net staked if amount is of type number and appends the token symbol', () => {
            const testData = {
                amount: 1.2345,
            };
            const expectedResult = '1.2345 KOYN';
            expect(getRexHistoryAsset(testData)).toBe(expectedResult);
        });
        it('returns amount asset string if it is not of type number', () => {
            const testData = {
                amount: '3 KOYN',
            };
            expect(getRexHistoryAsset(testData)).toBe(testData.amount);
        });
        it('should return undefined if passed empty or invalid (no referenced properties) data param', () => {
            const testData = {};
            expect(getRexHistoryAsset(testData)).toBeUndefined();
        });
    });
});
