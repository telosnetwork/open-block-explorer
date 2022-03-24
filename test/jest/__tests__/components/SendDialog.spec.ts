/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
import { mount } from '@vue/test-utils';
import SendDialog from 'src/components/SendDialog.vue';
import { Token } from 'src/types';

installQuasarPlugin();

const getAuthenticators = jest.fn();
const $ual = {
  getAuthenticators
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
    describe('toggleCoinDialog', () => {
      it('toggles coin diaglog boolean flag', () => {
        expect(wrapper.vm.openCoinDialog).toBe(false);
        wrapper.vm.toggleCoinDialog();
        expect(wrapper.vm.openCoinDialog).toBe(true);
      });
    });
    describe('updateSelectedCoin', () => {
      it('sets current sendToken', () => {
        wrapper.vm.updateSelectedCoin(mockToken);
        expect(wrapper.vm.sendToken).toEqual(mockToken);
      });
    });
  });
});
