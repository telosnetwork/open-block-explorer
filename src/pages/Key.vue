<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import KeyAccountsCard from 'src/components/KeyAccountsCard.vue';
import { useRoute } from 'vue-router';
import { api } from 'src/api';
import { Name, PublicKey } from '@wharfkit/session';

/* eslint-disable */
export default defineComponent({
    name: 'Key',
    setup() {
        const route = useRoute();
        const pubKey = ref<PublicKey>();
        const accounts = ref<Name[]>([]);
        onMounted(async () => {
            try{
                pubKey.value = PublicKey.from(route.params.key as string);
                accounts.value = (await api.getKeyAccounts(pubKey.value)).account_names;
            }catch(e){
                console.error(e);
            }
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
<KeyAccountsCard v-if="pubKey" :pubKey="pubKey" :accounts="accounts" />
<div v-else class="q-pa-lg">
    <div class="row justify-center">
        <q-card class="info-card" flat>
            <div class="q-pa-md-md q-pa-sm-sm q-pa-xs-xs q-pa-xl-lg">
                <q-card-section class="q-pl-sm">
                    <div class="text-h4 text-bold">key not found</div>
                </q-card-section>
            </div>
        </q-card>
    </div>
</div>
</template>

<style scoped lang="sass">
.bg-blur
  background: rgba(255,255,255,0.2)
  backdrop-filter: blur(5px)
  border-radius: 5px
.full-vw
  width: 100vw
</style>
