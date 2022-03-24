/* eslint-disable @typescript-eslint/no-explicit-any */
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
import SendDialog from 'src/components/SendDialog.vue';

installQuasarPlugin();

const setMount = () => {
  return shallowMount(SendDialog, {
    props: {
      callback: jest.fn(),
      openSendDialog: true,
      availableTokens: []
    },
    mocks: {
      $ual: {
        getAuthenticators: jest.fn()
      }
    }
  });
};

describe('SendDialog', () => {
  let wrapper: { vm: any };
  beforeEach(() => {
    wrapper = setMount();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('@show', () => {
    it('calls setDefaults', () => {
      const methodSpy = jest.spyOn(SendDialog.methods as any, 'setDefaults');
      wrapper = setMount();
      wrapper.vm.$nextTick(() => {
        expect(methodSpy).toHaveBeenCalled();
      });
    });
  });
  // describe('methods', () => {
  //   let wrapper: { vm: any };
  //   beforeEach(() => {
  //     wrapper = shallowMount(SendDialog, {
  //       mocks: {
  //         $ual: {
  //           getAuthenticators: jest.fn()
  //         }
  //       }
  //     });
  //   });
  //   afterEach(() => {
  //     jest.clearAllMocks();
  //   });
  //   describe('sendTransaction', () => {
  //     it('calls getTransactions', () => {
  //       expect(wrapper.vm.$api.getTransactions).toHaveBeenCalled();
  //     });
  //   });
  // });
});
