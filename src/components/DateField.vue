<script lang="ts">
import { computed, defineComponent } from 'vue';
import * as moment from 'moment';

export default defineComponent({
    name: 'DateField',
    props: {
        timestamp: {
            type: String,
            default: '',
        },
        showAge: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        const friendlyDate = computed(() => {
            const actionTime = moment.utc(props.timestamp, 'YYYY-MM-DD HH:mm:ssZ');
            if (props.showAge) {
                return actionTime.fromNow();
            }
            return `${actionTime.local().format('YYYY-MM-DD HH:mm:ss')}`;
        });
        const tooltipDate = computed(() => {
            const actionTime = moment.utc(props.timestamp, 'YYYY-MM-DD HH:mm:ssZ');
            if (!props.showAge) {
                return actionTime.fromNow();
            }
            return `${actionTime.local().format('YYYY-MM-DD HH:mm:ss')}`;
        });
        return {
            friendlyDate,
            tooltipDate,
        };
    },
});
</script>

<template>
<div class="no-wrap">{{ friendlyDate }}
    <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">{{ tooltipDate }}</q-tooltip>
</div>
</template>
