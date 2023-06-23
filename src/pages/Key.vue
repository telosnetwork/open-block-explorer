<script lang="ts">
import { defineComponent, ref, onMounted, watch } from 'vue';
import KeyAccountsCard from 'src/components/KeyAccountsCard.vue';
import { useRoute } from 'vue-router';
import { api } from 'src/api';
import { Name, PublicKey } from '@greymass/eosio';
import { useRouteDataNetwork } from 'src/router';

/* eslint-disable */
export default defineComponent({
    name: 'Key',
    setup() {
        const route = useRoute();
        const network = useRouteDataNetwork();
        const pubKey = ref<PublicKey>(PublicKey.from(route.params.key as string));
        const accounts = ref<Name[]>([]);

        onMounted(async () => {
            accounts.value = (await api.getKeyAccounts(pubKey.value)).account_names;
        });

        watch(network, async () => {
            accounts.value = (await api.getKeyAccounts(pubKey.value)).account_names;
        });

        return {
            pubKey,
            accounts
        };
    },
    components: {
        KeyAccountsCard
    }
});
</script>

<template>
<KeyAccountsCard :pubKey="pubKey" :accounts="accounts" />
</template>

<style scoped lang="sass">
.bg-blur
  background: rgba(255,255,255,0.2)
  backdrop-filter: blur(5px)
  border-radius: 5px
.full-vw
  width: 100vw
</style>
