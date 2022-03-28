/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount, VueWrapper } from '@vue/test-utils';
import Header from 'src/components/Header.vue';

installQuasarPlugin();
let wrapper: VueWrapper;
const push = jest.fn();
const $router = {
  push
};

describe('Header', () => {
  beforeEach(() => {
    wrapper = mount(Header);
    wrapper.vm.$router = $router as any;
  });
  describe('methods', () => {
    describe('clicked', () => {
      it('logs string to console', () => {
        const methodSpy = jest.spyOn(console, 'log');
        (wrapper.vm as any).clicked();
        expect(methodSpy).toHaveBeenCalledWith('connect btn clicked');
      });
    });
  });
});
