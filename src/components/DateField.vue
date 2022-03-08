<template lang="pug">
div {{ friendlyDate }}
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as moment from 'moment';

export default defineComponent({
  name: 'DateField',
  props: {
    timestamp: {
      type: String,
      required: true
    },
    showAge: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    friendlyDate(): string {
      const actionTime = moment.utc(this.timestamp, 'YYYY-MM-DD HH:mm:ssZ');
      if (this.showAge) {
        return actionTime.fromNow();
      }
      return `${actionTime.format('YYYY-MM-DD h:mm:ss')}`;
    }
  }
});
</script>

<style scoped></style>
