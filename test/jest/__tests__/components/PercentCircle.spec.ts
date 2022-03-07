/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount, VueWrapper } from '@vue/test-utils';
import PercentCircle from 'src/components/PercentCircle.vue';

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
        label: 'test2',
        radius: 10
      }
    });
    wrapper.vm.$router = $router as any;
  });
  describe('computed', () => {
    describe('diameter', () => {
      it('returns twice the radius', () => {
        const expectedVal = 2 * (wrapper.vm as any).radius;
        expect((wrapper.vm as any).diameter).toBe(expectedVal);
      });
    });
    describe('conatinerWidth', () => {
      it('returns diameter + 10', () => {
        const expectedVal = ((wrapper.vm as any).diameter as number) + 10;
        expect((wrapper.vm as any).containerWidth).toBe(expectedVal);
      });
    });
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
    describe('circumference', () => {
      it('returns circumference (2 * pi * r)', () => {
        const PI = 3.1459;
        const expectedVal = 2 * PI * (wrapper.vm as any).radius; //* (wrapper.vm as any).radius;
        expect((wrapper.vm as any).circumference).toBe(expectedVal);
      });
    });
    describe('dashArray', () => {
      it('returnsthe scaled path based on radius', () => {
        const circ = (wrapper.vm as any).circumference;
        const scaled = ((wrapper.vm as any).percentage / 100) * circ;
        expect((wrapper.vm as any).dashArray).toBe(
          `${scaled}, ${circ as string}`
        );
      });
    });
  });
});
