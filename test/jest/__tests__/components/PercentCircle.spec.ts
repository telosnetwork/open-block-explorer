/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount, VueWrapper } from '@vue/test-utils';
import PercentCircle from 'src/components/PercentCircle.vue';
import { DefineComponent } from 'vue';

installQuasarPlugin();
let wrapper: VueWrapper;
const push = jest.fn();
const $router = {
  push
};

describe('PercentCircle', () => {
  beforeEach(() => {
    wrapper = mount(PercentCircle as unknown, {
      props: {
        percentage: 50,
        label: 'test2'
      }
    });
    wrapper.vm.$router = $router as any;
  });
  describe('computed', () => {
    describe('strokeColor', () => {
      it('sets color to "white" if usage < 90', () => {
        expect((wrapper.vm as any).strokeColor).toBe('white');
      });
      it('sets color to "red" if usage >= 90', async () => {
        await wrapper.setProps({
          percentage: 90
        });
        expect((wrapper.vm as any).strokeColor).toBe('red');
      });
    });
    // describe('circumference', () => {
    //     it('returns circumference value', () => {
    //       expect((wrapper.vm as any).strokeColor).toBe('white');
    //     });
    //     it('sets color to "red" if usage >= 90', async () => {
    //       await wrapper.setProps({
    //         percentage: 90
    //       });
    //       expect((wrapper.vm as any).strokeColor).toBe('red');
    //     });
    //   });
  });
});
