<script lang="ts">
import { defineComponent, computed, toRefs } from 'vue';

export default defineComponent({
    name: 'PrettyPayload',
    props: {
        depth: { type: Number, required: true },
        payload: { type: Object, required: true },
    },
    setup(props) {
        const { depth, payload } = toRefs(props);
        const type = payload.value === null ? 'null' : typeof payload.value;

        const list = computed(() => {
            if (type === 'object') {
                return Object.keys(payload.value);
            }
            return undefined;
        });

        const classObject = computed(() => ({
            'payload': true,
            'payload__indent': depth.value > 0,
        }));

        return {
            type,
            list,
            classObject,
        };
    },

});
</script>

<template>
<div
    v-for="key, index in list"
    :key="index"
    :class="classObject"
>
    <template v-if="Array.isArray(payload[key])">
        <span class="text-bold">{{ key }}:</span>
        <span v-if="payload[key].length === 0">{{` [ ]`}}</span>
        <ul v-else class="payload__list">
            <li
                v-for="(item, index) in payload[key]"
                :key="index"
                class="payload__list-item"
            >
                <PrettyPayload
                    :depth="depth + 1"
                    :payload="item"
                />
            </li>
        </ul>
    </template>
    <template v-else-if="typeof payload[key] === 'object'">
        <div class="text-bold">{{ key +':'}}</div>
        <PrettyPayload
            :depth="depth + 1"
            :payload="payload[key]"
        />
    </template>
    <template v-else>
        <span class="text-bold">{{ key }}:</span> {{ payload[key] }}
    </template>
</div>
</template>

<style lang="sass" scoped>
.payload
    max-width: 100%
    white-space: normal
    &__indent
        margin-left: 1rem
    &__list
        margin: 0
        padding: 0
    &__list-item
        list-style-position: inside
        list-style: none
        margin: 0
        padding: 0

</style>
