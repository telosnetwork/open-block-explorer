<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import ValidatorDataTable from './ValidatorDataTable.vue';
import { api } from 'src/api';
import { useStore } from 'src/store';
import { BP } from 'src/types';

export default defineComponent({
  name: 'Validator',
  components: {
    ValidatorDataTable
  },
  setup() {
    const store = useStore();
    const account = computed(() => store.state.account.accountName);
    const lastUpdated = ref<string>('');
    const producerData = computed((): BP[] => store.state.chain.bpList);
    const producerVotes = ref([]);
    const showCpu = ref<boolean>(false);
    const voteChanged = ref<boolean>(false);
    const resetFlag = ref<boolean>(false);
    const lastWeight = ref<string>('0');
    const lastStaked = ref<number>(0);
    const stakedAmount = ref<number>(0);

    async function getVotes() {
      if (account.value) {
        const voterInfo = (await api.getAccount(account.value)).account
          .voter_info;
        console.log(voterInfo);
        producerVotes.value = voterInfo.producers;
        lastWeight.value = parseFloat(voterInfo.last_vote_weight).toFixed(2);
        lastStaked.value = voterInfo.last_stake;
        stakedAmount.value = voterInfo.staked;
      }
    }
    function toggleView() {
      showCpu.value = !showCpu.value;
    }
    function toggleVoteButtons(val: boolean) {
      voteChanged.value = val;
    }

    onMounted(async () => {
      await getVotes();
    });

    return {
      account,
      lastUpdated,
      producerData,
      producerVotes,
      showCpu,
      voteChanged,
      resetFlag,
      lastWeight,
      lastStaked,
      stakedAmount,
      toggleVoteButtons,
      toggleView,
      getVotes
    };
  }
});
</script>

<template lang="pug">
div
  q-btn.toggle(@click='toggleView' label='toggleLabel' color='primary')
  q-btn.toggle( v-if='account' @click='' :disable='!voteChanged' label='Vote' color='primary')
  q-btn.toggle( v-if='account' @click='' :disable='!voteChanged' label='Reset' color='primary')
  ValidatorDataTable(
    ref="ValidatorDataTable"
    :producerData='producerData'
    :producerVotes='producerVotes'
    :lastWeight='lastWeight'
    :lastStaked='lastStaked'
    :stakedAmount='stakedAmount'
    :lastUpdated='lastUpdated'
    @vote-changed='toggleVoteButtons'
    @get-votes='getVotes'
  )
</template>

<style lang="sass">
.toggle
  margin-top: 0.75rem
  margin-left: 1rem
</style>
