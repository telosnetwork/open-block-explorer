import { describe, expect, it } from '@jest/globals';
import {
    isValidAccount,
    isValidTransactionHex,
    formatCurrency,
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
            expect(formatCurrency(input, 4, 'TLOS')).toBe('1.0000 TLOS');

            expect(formatCurrency(0, 2, 'USD')).toBe('0 USD');
            expect(formatCurrency(0, 4, 'TLOS')).toBe('0 TLOS');
        });

        it('should not trim trailing zeroes when preserveTrailingZeroes is true', () => {
            expect(formatCurrency('0.0000', 2, null, true)).toBe('0.00');
            expect(formatCurrency('0.0000', 4, null, true)).toBe('0.0000');
            expect(formatCurrency('0.0000', 2, 'USD', true)).toBe('0.00 USD');
            expect(formatCurrency('0.0000', 4, 'TLOS', true)).toBe('0.0000 TLOS');
            expect(formatCurrency('0', 2, null, true)).toBe('0.00');
            expect(formatCurrency('0', 4, null, true)).toBe('0.0000');
            expect(formatCurrency('0', 2, 'USD', true)).toBe('0.00 USD');
            expect(formatCurrency('0', 4, 'TLOS', true)).toBe('0.0000 TLOS');
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
});
