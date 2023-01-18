<script lang="ts">
import { useQuasar } from 'quasar';
import { computed, defineComponent, ref } from 'vue';
import { copyToClipboard } from 'quasar';
import { PublicKey, Weight } from '@greymass/eosio';

export default defineComponent({
  name: 'KeyToggle',
  props: {
    pubkey: {
      type: PublicKey,
      required: true
    },
    weight: {
      type: Weight,
      required: true
    }
  },
  setup(props) {
    const key = ref(props.pubkey);
    const legacyKeyFormat = ref<boolean>(false);
    const $q = useQuasar();
    const keyDisplay = computed(() =>
      legacyKeyFormat.value ? key.value.toLegacyString() : key.value.toString()
    );
    function copy(value: string) {
      copyToClipboard(value)
        .then((): void => {
          $q.notify({
            color: 'green-4',
            textColor: 'white',
            message: 'Copied to clipboard',
            timeout: 1000
          });
        })
        .catch(() => {
          $q.notify({
            color: 'red-8',
            textColor: 'white',
            message: 'Could not copy',
            timeout: 1000
          });
        });
    }
    function toggleKey() {
      legacyKeyFormat.value = !legacyKeyFormat.value;
    }
    return {
      keyDisplay,
      copy,
      toggleKey
    };
  }
});
</script>

<template lang="pug">
.row.q-pb-md
	.col.wrap
		a(:href=" '/key/' + keyDisplay" class="hover-dec") {{`+${weight} &nbsp &nbsp ${keyDisplay}`}}
		q-btn.rotate-315( @click="toggleKey()" flat round color="black" icon="vpn_key" size='xs') &nbsp;
		q-btn( @click="copy(keyDisplay)" flat round color="black" icon="content_copy" size='xs')

</template>

<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  &:hover
    text-decoration: underline
</style>
