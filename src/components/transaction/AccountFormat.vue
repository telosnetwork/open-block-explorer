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
<a class="hover-dec text-no-wrap" :href=" '/' + type + '/' + accAccount">{{type === 'transaction' ? accAccount.slice(0, 8) : accAccount}}</a>
</template>

<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  &:hover
    text-decoration: underline
</style>
