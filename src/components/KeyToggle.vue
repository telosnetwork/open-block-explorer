<script lang="ts">
import { useQuasar } from 'quasar';
import { defineComponent, PropType, ref } from 'vue';
import { copyToClipboard } from 'quasar';
import { Numeric } from 'eosjs';

export default defineComponent({
  name: 'KeyToggle',
  props: {
    pubkey: {
      type: String as PropType<string>,
      required: true
    },
    weight: {
      type: Number as PropType<number>,
      required: true
    }
  },
  setup(props) {
    const Key = ref(props.pubkey);
    const Weight = ref(props.weight);
    const $q = useQuasar();
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
      if (Key.value.startsWith('PUB_K1_')) {
        Key.value = Numeric.publicKeyToLegacyString(
          Numeric.stringToPublicKey(Key.value)
        );
      } else {
        Key.value = Numeric.convertLegacyPublicKey(Key.value);
      }
    }
    return {
      Key,
      Weight,
      copy,
      toggleKey
    };
  }
});
</script>

<template lang="pug">
.row.q-pb-md
	.col.wrap
		a(:href=" '/key/' + Key" class="hover-dec") {{`+${Weight} &nbsp &nbsp ${Key}`}}
		q-btn.rotate-315( @click="toggleKey()" flat round color="black" icon="vpn_key" size='xs') &nbsp;
		q-btn( @click="copy(Key)" flat round color="black" icon="content_copy" size='xs')

</template>

<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  &:hover
    text-decoration: underline
</style>
