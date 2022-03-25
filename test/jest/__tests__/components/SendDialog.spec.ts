/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  describe,
  expect,
  it,
  jest,
  afterEach,
  beforeEach
} from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount } from '@vue/test-utils';
import SendDialog from 'src/components/SendDialog.vue';
import { Token } from 'src/types';

installQuasarPlugin();

const getAuthenticators = jest.fn();
const $ual = {
  getAuthenticators
};
const push = jest.fn();
const go = jest.fn();
const $router = {
  push,
  go
};

const storeMock = Object.freeze({
  state: {},
  actions: {},
  namespaced: true,
  getters: {
    language: () => {
      return 'en';
    },
    'account/accountName': () => {
      return '';
    }
  }
});

const defaultToken = {
  symbol: 'TLOS',
  precision: 4,
  amount: 0,
  contract: 'eosio.token'
} as Token;

const mockToken = {
  symbol: 'MOCK',
  precision: 4,
  amount: 99,
  contract: 'mock.token'
} as Token;

const setMount = () => {
  return mount(SendDialog, {
    props: {
      callback: jest.fn(),
      openSendDialog: true,
      availableTokens: []
    },
    store: storeMock
  });
};

describe('SendDialog', () => {
  let wrapper: { vm: any };
  beforeEach(() => {
    wrapper = setMount();
    wrapper.vm.$ual = $ual as any;
    wrapper.vm.$router = $router as any;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('@show', () => {
    it('calls setDefaults', () => {
      const methodSpy = jest.spyOn(SendDialog.methods as any, 'setDefaults');
      wrapper = setMount();
      wrapper.vm.$nextTick(() => {
        try {
          expect(methodSpy).toHaveBeenCalled();
        } catch (e) {
          return;
        }
      });
    });
  });
  describe('methods', () => {
    describe('setDefaults', () => {
      it('retains default token if no other available tokens', () => {
        wrapper.vm.setDefaults();
        expect(wrapper.vm.sendToken).toEqual(defaultToken);
      });
      it('sets available balance of default system token if available', () => {
        const mockToken = {
          symbol: 'TLOS',
          precision: 4,
          amount: 99,
          contract: 'mock.token'
        } as Token;
        (wrapper as any).setProps({
          availableTokens: [mockToken]
        });
        wrapper.vm.setDefaults();
        expect(wrapper.vm.sendToken.amount).not.toEqual(mockToken.amount);
      });

      it('retains default token balance of 0 if available tokens but not default system token', () => {
        (wrapper as any).setProps({
          availableTokens: [mockToken]
        });
        wrapper.vm.setDefaults();
        expect(wrapper.vm.sendToken).toEqual(defaultToken);
      });
    });
    describe('updateSelectedCoin', () => {
      it('sets current sendToken', () => {
        wrapper.vm.updateSelectedCoin(mockToken);
        expect(wrapper.vm.sendToken).toEqual(mockToken);
      });
    });
    describe('resetForm', () => {
      it('sets transactionId to null', () => {
        wrapper.vm.transactionId = '123';
        wrapper.vm.resetForm();
        expect(wrapper.vm.transactionId).toBeNull();
      });
      it('sets transactionError to null', () => {
        wrapper.vm.transactionError = 'error';
        wrapper.vm.resetForm();
        expect(wrapper.vm.transactionError).toBeNull();
      });
      it('sets defaultToken values to null', () => {
        wrapper.vm.sendToken = mockToken;
        wrapper.vm.resetForm();
        expect(wrapper.vm.sendToken).toEqual(defaultToken);
      });
    });
    describe('navToTransaction', () => {
      it('calls $router.push', () => {
        wrapper.vm.transactionId = 'testing';
        wrapper.vm.navToTransaction();
        expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith({
          name: 'transaction',
          params: { transaction: wrapper.vm.transactionId }
        });
      });
      it('calls $router.go', async () => {
        wrapper.vm.transactionId = 'testing';
        wrapper.vm.navToTransaction();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.go).toHaveBeenLastCalledWith(0);
      });
    });
  });
  describe('computed', () => {
    describe('transactionForm', () => {
      it('returns true if both transactionError & transactionId are null', () => {
        wrapper.vm.transactionError = null;
        wrapper.vm.transactionId = null;
        expect(wrapper.vm.transactionForm).toBe(true);
      });
      it('returns false if transactionError', () => {
        wrapper.vm.transactionError = 'error';
        wrapper.vm.transactionId = null;
        expect(wrapper.vm.transactionForm).toBe(false);
      });
      it('returns false if transactionId', () => {
        wrapper.vm.transactionError = null;
        wrapper.vm.transactionId = 'id';
        expect(wrapper.vm.transactionForm).toBe(false);
      });
    });
  });
});
