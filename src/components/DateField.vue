<template lang="pug">
div {{ friendlyDate }}
</template>

<script lang="ts">
import * as moment from 'moment';

export default {
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
};
</script>

<style scoped></style>
