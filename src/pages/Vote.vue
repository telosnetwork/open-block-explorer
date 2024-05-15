<script lang="ts">
import ValidatorData from 'src/components/validators/ValidatorData.vue';
import { defineComponent, onMounted } from 'vue';
import { api } from 'src/api';
import { useAccountStore } from 'src/stores/account';
import { useChainStore } from 'src/stores/chain';
export default defineComponent({
    name: 'VotePage',
    components: { ValidatorData },
    setup() {
        const accountStore = useAccountStore();
        const chainStore = useChainStore();

        onMounted(async () => {
            if (
                !accountStore.data.voter_info &&
                accountStore.accountName
            ) {
                const data = await api.getAccount(accountStore.accountName);
                accountStore.setAccountData(data);
            }

            await chainStore.updateBpList();

            window.setInterval(() => {
                void chainStore.updateBlockData();
            }, 2000);
        });
    },
});
</script>
<template>
<ValidatorData />
</template>
