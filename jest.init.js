/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { config } from '@vue/test-utils';

config.global.mocks = {
  $api: {
    getTransactions: jest.fn()
  }
};
