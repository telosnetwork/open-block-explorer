<script lang="ts">
import { defineComponent, ref, watch, toRefs, computed, onUpdated, toRaw } from 'vue';
import { TransferData } from 'src/types';
import AccountFormat from 'src/components/transaction/AccountFormat.vue';
import PrettyPayload from 'src/components/transaction/PrettyPayload.vue';

export default defineComponent({
    name: 'DataFormat',
    components: { AccountFormat, PrettyPayload },
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
        const { actionName, actionData } = toRefs(props);
        const dataBox = ref<null | HTMLElement>(null);
        const showOverflow = ref(false);
        const isOverflowing = ref(false);
        const transferData = computed(() => actionData.value as TransferData);
        const clientHeight = computed(() => dataBox.value?.clientHeight ?? 0);
        let currentData = ref<string | unknown>(null);
        const maxHeight = 98; // the maximum row height, should this be scalar (3) * constant (line height)?
        const switchHeight = 20;
        const maxHeightStyle = `calc(${maxHeight}px - ${switchHeight}px)`;

        function compareJsonObjects(obj1: unknown, obj2: unknown): boolean {
            if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
                return false;
            }

            const objectOne = obj1 as Record<string, unknown>;
            const objectTwo = obj2 as Record<string, unknown>;

            for (const key of Object.keys(obj1)) {
                if (!objectOne[key]) {
                    // this is an empty key
                    // sometimes the answer includes them, sometimes it doesn't
                    // so we won't compare them
                    continue;
                }

                if (typeof objectOne[key] !== typeof objectTwo[key]) {
                    return false;
                }

                if (typeof objectOne[key] === 'object') {
                    if (!compareJsonObjects(objectOne[key], objectTwo[key])) {
                        return false;
                    }
                } else {
                    if (objectOne[key] !== objectTwo[key]) {
                        return false;
                    }
                }
            }

            return true;
        }

        function formatGeneralData(data: unknown): unknown {
            if (currentData.value === null) {
                currentData.value = data;
                return currentData.value;
            }
            return compareJsonObjects(toRaw(currentData.value), data) ? currentData.value : data;
        }

        function updateOverflowing() {
            isOverflowing.value = (dataBox.value?.clientHeight ?? 0) > maxHeight;
        }

        watch([actionData, clientHeight], () => {
            updateOverflowing();
        });

        onUpdated(() => {
            updateOverflowing();
        });

        function toggleOverflow() {
            showOverflow.value = !showOverflow.value;
        }

        return {
            currentData,
            transferData,
            name: actionName,
            formatGeneralData,
            dataBox,
            isOverflowing,
            showOverflow,
            toggleOverflow,
            maxHeightStyle,
        };
    },
});
</script>

<template>
<div
    class="relative-position"
    :class="{'div-compressed': !showOverflow}"
>
    <div v-if="actionName === 'transfer'" ref="dataBox" class="row">
        <div class="col-12">
            <span class="text-bold">
                <AccountFormat :account="transferData.from" type="account"/></span><span class="text-bold">&nbsp; → &nbsp;
                <AccountFormat :account="transferData.to" type="account">&nbsp;</AccountFormat></span><span class="text-bold">{{ ' ' + transferData.quantity }}</span>
        </div>
        <div class="col-12">
            <div class="text-weight-bold">
                memo:&nbsp;<span v-if="transferData.memo" class="text-weight-regular">{{ transferData.memo }}</span><span v-else class="text-weight-regular">n/a</span>
            </div>
        </div>
    </div>
    <div v-else ref="dataBox" class="row">
        <PrettyPayload :depth="0" :payload="formatGeneralData(actionData)"/>
    </div>
    <q-btn
        v-if="isOverflowing"
        flat
        size="xs"
        :icon="showOverflow ? 'expand_less' : 'expand_more'"
        :class="{ 'q-btn--use-color': useColor, 'full-width': showOverflow, 'q-btn--floating': !showOverflow }"
        @click="toggleOverflow"
    />
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

.row
  display: flex
  flex-direction: column
  gap: 5px
  word-break: break-all

.div-compressed
    max-height: v-bind(maxHeightStyle)

</style>
