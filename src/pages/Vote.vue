<script lang="ts">
import ValidatorData from 'src/components/validators/ValidatorData.vue';
import { defineComponent, onMounted } from 'vue';
import { useStore } from 'src/store';
import { api } from 'src/api';
export default defineComponent({
    name: 'VotePage',
    components: { ValidatorData },
    setup() {
        const store = useStore();
        onMounted(async () => {
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
        });
    },
});
</script>
<template>
<ValidatorData />
</template>
