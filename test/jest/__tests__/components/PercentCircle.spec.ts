/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { mount, VueWrapper } from '@vue/test-utils';
import PercentCircle from 'src/components/PercentCircle.vue';

installQuasarPlugin();

let wrapper: VueWrapper<any>;
const push = jest.fn();

const $router = {
    push,
};

describe('PercentCircle', () => {
    beforeEach(() => {
        wrapper = mount(PercentCircle as unknown, {
            props: {
                fraction: 50,
                total: 100,
                label: 'test2',
                radius: 10,
            },
        });
        wrapper.vm.$router = $router as any;
    });
    describe('computed', () => {
        describe('diameter', () => {
            it('returns twice the radius', () => {
                const expectedVal = 2 * wrapper.vm.radius;
                expect(wrapper.vm.diameter).toBe(expectedVal);
            });
        });
        describe('conatinerWidth', () => {
            it('returns diameter + 10', () => {
                const expectedVal = (wrapper.vm.diameter as number) + 10;
                expect(wrapper.vm.containerWidth).toBe(expectedVal);
            });
        });
        describe('strokeColor', () => {
            it('sets color to "white" if usage < 90', () => {
                expect(wrapper.vm.strokeColor).toBe('white');
            });
            it('sets color to "red" if usage >= 90', async () => {
                await wrapper.setProps({
                    fraction: 90,
                    total: 100,
                });
                expect(wrapper.vm.strokeColor).toBe('red');
            });
        });
        describe('circumference', () => {
            it('returns circumference (2 * pi * r)', () => {
                const PI = 3.1459;
                const expectedVal = 2 * PI * wrapper.vm.radius; //* (wrapper.vm as any).radius;
                expect(wrapper.vm.circumference).toBe(expectedVal);
            });
        });
        describe('dashArray', () => {
            it('returns the scaled path based on radius', () => {
                const circ = wrapper.vm.circumference;
                const scaled = (wrapper.vm.fraction / 100) * circ;
                expect(wrapper.vm.dashArray).toBe(`${scaled}, ${circ as string}`);
            });
        });
        describe('fractionUnits', () => {
            it('returns fraction as formatted string with units', async () => {
                await wrapper.setProps({
                    fraction: 3,
                    total: 10,
                    unit: 'kb',
                });
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                const expectedVal = `${wrapper.vm.fraction}${wrapper.vm.unit}/${wrapper.vm.total}${wrapper.vm.unit}`;
                expect(wrapper.vm.fractionUnits).toBe(expectedVal);
            });
        });
    });
});
