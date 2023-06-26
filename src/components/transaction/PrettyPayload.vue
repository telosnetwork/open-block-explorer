<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';

export default defineComponent({
    name: 'PrettyPayload',
    props: { depth: { type: Number, required: true },
        payload: { type: Object, required: true },
    },
    setup(props) {
        const { depth, payload } = toRefs(props);
        const indent = { transform: `translate(${depth.value}px)` };
        const type = payload.value === null ? 'null' : typeof payload.value;

        const list = computed(() => {
            if (type === 'object') {
                return Object.keys(payload.value);
            }
            return undefined;
        });

        return {
            indent,
            type,
            list,
        };
    },

});
</script>

<template>
<div v-for="key, index in list" :key="index" class="payload">
    <template v-if="Array.isArray(payload[key])">
        <span class="text-bold">{{ key }}:</span>
        <span v-if="payload[key].length === 0">{{` [ ]`}}</span>
        <ul v-else>
            <li v-for="(item, index) in payload[key]" :key="index">
                <PrettyPayload
                    :depth="depth + 1"
                    :payload="item"
                />
            </li>
        </ul>
    </template>
    <template v-else-if="typeof payload[key] === 'object'">
        <span class="text-bold">{{ key +':'}}</span>
        <div :style="indent">
            <PrettyPayload
                :depth="depth + 1"
                :payload="payload[key]"
            />
        </div>
    </template>
    <template v-else>
        <span class="text-bold">{{ key }}:</span> {{ payload[key] }}
    </template>
</div>
</template>

<style lang="sass" scoped>
.payload
    max-width: 100%
</style>
