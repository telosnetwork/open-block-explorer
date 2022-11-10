<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AccountFormatter',
  props: {
    account: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return {
      accType: props.type,
      accAccount: props.account
    };
  }
});
</script>

<template lang="pug">
a(:href=" '/' + type + '/' + accAccount" class="hover-dec") {{type === 'transaction' ? accAccount.slice(0, 8) : accAccount}}
</template>

<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  &:hover
    text-decoration: underline
</style>
