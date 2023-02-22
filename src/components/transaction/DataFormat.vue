<script lang="ts">
import { defineComponent, ref, watch, toRefs, computed, onUpdated } from 'vue';
import { TransferData } from 'src/types';
import AccountFormat from 'src/components/transaction/AccountFormat.vue';
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
    const { actionName, actionData } = toRefs(props);
    const dataBox = ref(null);
    const showOverflow = ref(false);
    const maxHeight = ref(57);
    const switchHeight = ref(20);
    const isOverflowing = ref(false);
    const transferData = computed(() => actionData.value as TransferData);
    const clientHeight = computed(() => dataBox.value?.clientHeight ?? 0);

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
            if (keyValArray.length == 0) {
              dict.push({ key, value: JSON.stringify(data[key]) });
            } else {
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

    function updateOverflowing() {
      isOverflowing.value = (dataBox.value?.clientHeight ?? 0) > maxHeight.value;
    }

    watch([actionData,clientHeight], () => {
      updateOverflowing();
    });

    onUpdated(() => {
      updateOverflowing();
    });

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
      maxHeight,
      switchHeight
    };
  }
});
</script>

<template lang="pug">
div(
  :class="showOverflow ? '' : 'overflow-hidden'"
  :style=" (showOverflow || !isOverflowing) ? '' : `max-height: calc(${maxHeight}px - ${switchHeight}px)`"
)
  .row(v-if="actionName === 'transfer'" ref="dataBox")
    .col-12
      span.text-bold
        AccountFormat(:account="transferData.from" type="account")
      span.text-bold &nbsp; → &nbsp;
        AccountFormat(:account="transferData.to" type="account") &nbsp;
      span.text-bold {{ ' ' + transferData.quantity}}
    .col-12
      .text-weight-bold memo:&nbsp;
        span.text-weight-regular(v-if="transferData.memo") {{transferData.memo}}
        span.text-weight-regular(v-else) n/a
  .row(v-else ref="dataBox")
    .col-12( v-for="val in formatGeneralData(data)" :key="val.key")
      .text-weight-bold {{val.key}} :
        span.text-weight-regular(v-if="isAccount(val.key)")
          AccountFormat(:account="val.value" type="account") &nbsp;
        span.text-weight-regular(v-else) {{val.value}} &nbsp;
.row(v-if="isOverflowing")
  q-btn.full-width(
    flat size="xs"
    :icon="showOverflow ? 'expand_less' : 'expand_more'"
    :class="showOverflow ? '' : 'q-btn--floating'"
    @click="toggleOverflow")
</template>

<style lang="sass" scoped>

.q-btn--floating
  // gradient background from bottom 100% opaque to top 0% opaque
  background: rgb(255,255,255)
  background: linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,0.7) 80%, rgba(255,255,255,0.3) 100%)
  // make the button to float on top of the content
  position: absolute
  bottom: 0

</style>
