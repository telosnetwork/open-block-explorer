import {
  describe,
  expect,
  it //,
  // jest,
  // afterEach,
  // beforeEach
} from '@jest/globals';
import { isValidAccount } from 'src/utils/stringValidator';

describe('stringValidator utility functions', () => {
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
});
