<template lang="pug">
q-dialog(v-model="value" maximized)
  q-card.gradient-box
    q-card-section.full-height.row.justify-center.items-center
      div(:style="{maxWidth: '600px'}")
        header.q-mb-lg
          img( src="~assets/send.svg").inline-block.vertical-middle.q-mr-md.q-mb-md
          span.text-h4.text-white.inline-block.vertical-middle.q-mb-md Proposal sent successfully
        p.text-h6.text-white.q-ma-none.q-mb-xl.
          Check proposal at
          <router-link :to="'/proposal/' + proposalName" class="text-primary text-white cursor-pointer">
            {{proposalName}}
          </router-link>
          and transaction at
          <router-link :to="'/transaction/' + transactionId" class="text-primary text-white cursor-pointer">
            {{transactionId}}
          </router-link>
        q-btn(
          unelevated
          padding="sm md"
          color="primary"
          label="Close and check proposal"
          type="submit"
          class="full-width"
          :to="'/proposal/' + proposalName"
        )
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    name: 'ProposalSuccess',
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        transactionId: {
            type: String,
        },
        proposalName: {
            type: String,
        },
    },
    emits: ['update:modelValue'],
    setup(props, context) {
        const value = computed({
            get: () => props.modelValue,
            set: (value) => {
                context.emit('update:modelValue', value);
            },
        });

        return {
            value,
        };
    },
});
</script>
