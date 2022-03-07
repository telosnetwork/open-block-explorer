<template lang="pug">
  div {{ friendlyDate }}
</template>

<script>
import * as moment from 'moment';

export default {
  name: 'DateField',
  props: {
    epoch: {
      type: Number,
      required: true
    },
    showAge: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    friendlyDate() {
      if (this.showAge) {
        return moment.unix(this.epoch).fromNow();
      }
      return `${moment.unix(this.epoch).format('YYYY-MM-DD h:mm:ss')}`;
    }
  }
};
</script>

<style scoped></style>
