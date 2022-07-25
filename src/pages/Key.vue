<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import KeyAccountsCard from 'src/components/KeyAccountsCard.vue';
import { useRoute } from 'vue-router';
import { api } from 'src/api';
import { Numeric } from 'eosjs';

/* eslint-disable */
export default defineComponent({
  name: 'Key',
  setup() {
    const route = useRoute();
    const pubkey = ref(route.params.key as string);
    const accounts = ref<string[]>(['']);
    onMounted(async () => {
      if (pubkey.value.startsWith('PUB_K1_')){
        pubkey.value = Numeric.publicKeyToLegacyString(
          Numeric.stringToPublicKey(pubkey.value)
        );
      }
      accounts.value = (await api.getKeyAccounts(pubkey.value)).account_names;
    });
    return {
      pubkey,
      accounts
    };
  },
  components: {
    KeyAccountsCard
  }
});
</script>

<template lang="pug">
KeyAccountsCard(:pubkey='pubkey' :accounts='accounts')

</template>

<style scoped lang="sass">
.bg-blur
  background: rgba(255,255,255,0.2)
  backdrop-filter: blur(5px)
  border-radius: 5px
.full-vw
  width: 100vw
</style>
