<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    name: 'AccountFormat',
    props: {
        account: {
            type: String,
            default: () => '',
        },
        type: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const accAccount = computed(() => props.account);
        return {
            accType: props.type,
            accAccount,
        };
    },
});
</script>

<template>
<a class="hover-dec" :href=" '/' + type + '/' + accAccount">{{type === 'transaction' ? accAccount.slice(0, 8) : accAccount}}</a>
</template>

<style lang="sass" scoped>
.hover-dec
  color: var(--q-primary, #2C2B2F)
  font-weight: 600
  text-decoration: underline
  text-decoration-color: var(--q-info, #00F2FE)
  text-decoration-thickness: 2px
  text-underline-offset: 2px
  &:hover, &:focus
    color: #5E217A
    text-decoration-color: var(--q-accent, #C471F5)
</style>
