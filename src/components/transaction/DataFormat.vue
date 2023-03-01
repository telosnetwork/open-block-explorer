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
            required: true,
        },
        actionData: {
            type: Object,
            required: true,
        },
        useColor: {
            type: Boolean,
            required: true,
        },
    },
    setup(props) {
        const { actionName, actionData, useColor } = toRefs(props);
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
                                    formatGeneralData(data[key][i]),
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

        watch([actionData, clientHeight], () => {
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
                'voter',
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
            switchHeight,
            useColor,
        };
    },
});
</script>

<template>

<div class="relative-position" :class="showOverflow ? '' : 'overflow-hidden'" :style=" (showOverflow || !isOverflowing) ? '' : `max-height: calc(${maxHeight}px - ${switchHeight}px)`">
  <div class="row" v-if="actionName === 'transfer'" ref="dataBox">
    <div class="col-12"><span class="text-bold">
        <AccountFormat :account="transferData.from" type="account"></AccountFormat></span><span class="text-bold">&nbsp; → &nbsp;
        <AccountFormat :account="transferData.to" type="account">&nbsp;</AccountFormat></span><span class="text-bold">{{ ' ' + transferData.quantity}}</span></div>
    <div class="col-12">
      <div class="text-weight-bold">memo:&nbsp;<span class="text-weight-regular" v-if="transferData.memo">{{transferData.memo}}</span><span class="text-weight-regular" v-else>n/a</span></div>
    </div>
  </div>
  <div class="row" v-else ref="dataBox">
    <div class="col-12" v-for="val in formatGeneralData(data)" :key="val.key">
      <div class="text-weight-bold">{{val.key}} :<span class="text-weight-regular" v-if="isAccount(val.key)">
          <AccountFormat :account="val.value" type="account">&nbsp;</AccountFormat></span><span class="text-weight-regular" v-else>{{val.value}} &nbsp;</span></div>
    </div>
  </div>
  <q-btn v-if="isOverflowing" flat size="xs" :icon="showOverflow ? 'expand_less' : 'expand_more'" :class="{'q-btn--use-color': useColor, 'full-width': showOverflow, 'q-btn--floating': !showOverflow }" @click="toggleOverflow"></q-btn>
</div>

</template>

<style lang="sass" scoped>
.q-btn
  &--floating
    // gradient background from bottom 100% opaque to top 0% opaque
    background: rgb(255,255,255)
    background: linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 40%, rgba(255,255,255,0.6) 80%, rgba(255,255,255,0.3) 100%)
    // make the button to float on top of the content
    position: absolute
    bottom: 0
    right: 0
    left: 0
  &--use-color
    background: linear-gradient(0deg, #f3effbff 0%, #f3effbaa 40%, #f3effb77 80%, #f3effb33 100%)

</style>
