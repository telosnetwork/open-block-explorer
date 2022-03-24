/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it, beforeEach } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { shallowMount } from '@vue/test-utils';
import Header from 'src/components/Header.vue';

installQuasarPlugin();

describe('Header', () => {
  let wrapper: { vm: any };

  beforeEach(() => {
    wrapper = shallowMount(Header);
  });
  it('mounts', () => {
    expect(wrapper.vm).toBeTruthy();
  });
});
