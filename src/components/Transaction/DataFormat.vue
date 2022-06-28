<script lang="ts">
import { defineComponent, ref, toRef, onMounted } from 'vue';
import { TransferData } from 'src/types';
import AccountFormatter from 'src/components/Transaction/AccountFormat.vue';
/* eslint-disable */
export default defineComponent({
  name: 'TransactionsTable',
  components: { AccountFormatter },
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
    const transferData = ref<TransferData>({} as TransferData);

    onMounted(() => {
      if (actionName.value === 'transfer') {
        transferData.value = actionData.value as TransferData;
      }
    });

    function formatGeneralData(data: any): any[] {
      var dict: any[] = [];
      for (let key in data) {
        if (data[key] instanceof Object) {
          if (Array.isArray(data[key])) {
            var keyValArray: any[] = [];
            for (let i = 0; i < data[key].length; i++) {
              if (data[key][i] instanceof Object) {
                keyValArray = keyValArray.concat(formatGeneralData(data[key][i]));
              }
            }
            dict = dict.concat(keyValArray);
          } else {
            let keyValArray = [];
            keyValArray.push(formatGeneralData(data[key]));
            dict = dict.concat(keyValArray);
          }
        } else {
          dict.push({key, value:data[key]});
        }
      }
      return dict;
    }

    function isAccount(data: string): boolean {
      const accountRegEx = ['account', 'to', 'from', 'owner', 'account_name', 'voter'];
      return (accountRegEx.includes(data));
    }

    return {
      data: actionData,
      transferData,
      name: actionName,
      formatGeneralData,
      isAccount
    };
  }
});
</script>

<template lang="pug">
.row(v-if="actionName === 'transfer'")
  .col-12
    span.text-bold 
      AccountFormatter(:account="transferData.from" type="account")
    span.text-bold &nbsp; → &nbsp;
      AccountFormatter(:account="transferData.to" type="account") &nbsp; 
  .memo-card
    .memo-card-title MEMO
    .memo-card-memo {{transferData.memo}}
.row(v-else)
  .col-12( v-for="val in formatGeneralData(data)" :key="val.key")
    .text-weight-bold {{val.key}} : 
      span.text-weight-regular(v-if="isAccount(val.key)")
        AccountFormatter(:account="val.value" type="account") &nbsp; 
      span.text-weight-regular(v-else) {{val.value}} &nbsp; 

</template>

<style lang="sass" scoped>
.action
  // margin: 0.5rem 0
  padding: 0 0.5rem
  &.action-transfer
    background: rgba(196, 196, 196, 0.3)
    font-weight: bold
  &.action-general
    border: 0.1rem solid rgba(196, 196, 196, 0.3)
</style>
