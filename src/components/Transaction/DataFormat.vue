<script lang="ts">
import { defineComponent, ref, toRef, computed } from 'vue';
import { TransferData } from 'src/types';
import AccountFormat from 'src/components/Transaction/AccountFormat.vue';
/* eslint-disable */
export default defineComponent({
  name: 'DataFormat',
  components: { AccountFormat },
  props: {
    actionName: {
      type: String,
      required: true
    },
    actionData: {
      type: Object as any,
      required: true
    }
  },
  setup(props) {
    const actionName = toRef(props, 'actionName');
    const actionData = toRef(props, 'actionData');
    const dataBox = ref(null);
    const showOverflow = ref(false);
    const maxHeight = ref(200);
    const isOverflowing = computed(() => dataBox.value?.clientHeight > maxHeight.value);
    const transferData = computed(() => actionData.value as TransferData);
    
    function formatGeneralData(data: any): any[] {
      var dict: any[] = [];
      for (let key in data) {
        if (data[key] instanceof Object) {
          if (Array.isArray(data[key])) {
            var keyValArray: any[] = [];
            for (let i = 0; i < data[key].length; i++) {
              if (data[key][i] instanceof Object) {
                keyValArray = keyValArray.concat(
                  formatGeneralData(data[key][i])
                );
              }
            }
            if(keyValArray.length == 0) {
              dict.push({ key, value: JSON.stringify(data[key]) });
            } else{
              dict = dict.concat(keyValArray);
            }
          } else {
            var keyValArray: any[] = [];
            let formatData = formatGeneralData(data[key]);
            if (formatData.length > 0) {
              keyValArray = keyValArray.concat(formatGeneralData(data[key]));
              dict = dict.concat(keyValArray);
            }
          }
        } else {
          dict.push({ key, value: data[key] });
        }
      }
      return dict;
    }

    function isAccount(data: string): boolean {
      const accountRegEx = [
        'account',
        'to',
        'from',
        'owner',
        'account_name',
        'voter'
      ];
      return accountRegEx.includes(data);
    }

    function toggleOverflow() {
      showOverflow.value = !showOverflow.value;
    }

    return {
      data: actionData,
      transferData,
      name: actionName,
      formatGeneralData,
      isAccount,
      dataBox,
      isOverflowing,
      showOverflow,
      toggleOverflow,
      maxHeight
    };
  }
});
</script>

<template lang="pug">
div(:class="showOverflow ? '' : 'overflow-hidden'" :style=" showOverflow ? '' : `max-height: ${maxHeight}px`")
  .row(v-if="actionName === 'transfer'" ref="dataBox")
    .col-12
      span.text-bold
        AccountFormat(:account="transferData.from" type="account")
      span.text-bold &nbsp; → &nbsp;
        AccountFormat(:account="transferData.to" type="account") &nbsp;
      span.text-bold {{ ' ' + transferData.quantity}}
    .col-12
    .memo-card
      .memo-card-title MEMO
      .memo-card-memo(v-if="transferData.memo") {{transferData.memo}}
      .memo-card-memo.placeholder(v-else) no memo
  .row(v-else ref="dataBox")
    .col-12( v-for="val in formatGeneralData(data)" :key="val.key")
      .text-weight-bold {{val.key}} :
        span.text-weight-regular(v-if="isAccount(val.key)")
          AccountFormat(:account="val.value" type="account") &nbsp;
        span.text-weight-regular(v-else) {{val.value}} &nbsp;
.row(v-if="isOverflowing")
  q-btn.full-width( flat size="xs" :icon="showOverflow ? 'expand_less' : 'expand_more'" @click="toggleOverflow")
</template>

<style lang="sass" scoped>

.memo-card
  background: var(--q-color-tertiary-gradient)
  border-radius: 3px
  flex-grow: 1
  display: flex
  .memo-card-title
    padding: 0.5rem
    background: var(--q-color-tertiary-gradient)
    font-weight: bold
    flex-shrink: 0
    display: flex
    justify-content: center
    align-items: center
  .memo-card-memo
    padding: 0.5rem
    &.placeholder
      opacity: 0.5
      font-style: italic
</style>
