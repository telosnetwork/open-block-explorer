/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  describe,
  expect,
  it,
  jest,
  afterEach,
  beforeEach
} from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { shallowMount } from '@vue/test-utils';
import TransactionsTable from 'src/components/TransactionsTable.vue';

installQuasarPlugin();

describe('TransactionsTable', () => {
  describe('mounted', () => {
    it('calls loadTransactions', () => {
      const methodSpy = jest.spyOn(
        TransactionsTable.methods as any,
        'loadTransactions'
      );
      const wrapper = shallowMount(TransactionsTable, {
        mocks: {
          $api: {
            getTransactions: jest.fn()
          }
        }
      });

      wrapper.vm.$nextTick(() => {
        expect(methodSpy).toHaveBeenCalled();
      });
    });
  });
  describe('methods', () => {
    let wrapper: { vm: any };
    beforeEach(() => {
      wrapper = shallowMount(TransactionsTable, {
        mocks: {
          $api: {
            getTransactions: jest.fn()
          }
        }
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    describe('loadTransactions', () => {
      it('calls getTransactions', () => {
        expect(wrapper.vm.$api.getTransactions).toHaveBeenCalled();
      });
    });
  });
});
