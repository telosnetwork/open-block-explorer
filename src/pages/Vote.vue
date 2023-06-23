<script lang="ts">
import ValidatorData from 'src/components/validators/ValidatorData.vue';
import { defineComponent, onMounted, watch } from 'vue';
import { useStore } from 'src/store';
import { api } from 'src/api';
import { useRouteDataNetwork } from 'src/router';

export default defineComponent({
    name: 'VotePage',
    components: { ValidatorData },
    setup() {
        const store = useStore();
        const network = useRouteDataNetwork();

        async function loadVote() {
            if (
                !store.state.account.data.voter_info &&
                store.state.account.accountName
            ) {
                const data = await api.getAccount(store.state.account.accountName);
                store.commit('account/setAccountData', data);
            }
            await store.dispatch('chain/updateBpList');
            window.setInterval(() => {
                void store.dispatch('chain/updateBlockData');
            }, 2000);
        }

        onMounted(loadVote);
        watch(network, loadVote);

    },
});
</script>
<template>
<ValidatorData />
</template>
