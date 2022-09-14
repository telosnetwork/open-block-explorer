<template lang="pug">
a(
  href="/examples/msig-transfer-batch.csv"
  target="_blank"
  style="text-decoration:none"
  download
)
  q-btn(
    outline
    padding="sm md"
    color="white"
    text-color="primary"
    label="Download example")

q-uploader(
  label="eosio.token:transfer"
  accept=".csv"
  style="width: 100%"
).q-mt-md
  template(#header="scope")
    div.row.no-wrap.items-center.q-pa-sm.q-gutter-xs
      q-spinner(v-if="scope.isUploading").q-uploader__spinner
      div.col
        div.q-uploader__title Upload CSV (eosio.token:transfer only)
        div.q-uploader__subtitle Download the example and fill in the information

      q-btn(
        v-if="scope.canAddFiles"
        type="a"
        icon="add_box"
        @click="scope.pickFiles"
        round
        dense
        flat
      )
        q-uploader-add-trigger
        q-tooltip Pick Files

      q-btn(
        v-if="scope.canUpload"
        icon="cloud_upload"
        @click="() => {onUploadCSV(scope.queuedFiles, scope.removeQueuedFiles);}"
        round
        dense
        flat
      )
        q-tooltip Upload Files

      q-btn(
        v-if="scope.isUploading"
        icon="clear"
        @click="scope.abort"
        round
        dense
        flat
      )
        q-tooltip Abort Upload
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import csvToJson from 'csvtojson';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'ProposalUploadCSV',
  props: {
    proposer: {
      type: String,
      required: true
    }
  },
  emits: ['actions'],
  setup(props, context) {
    const $q = useQuasar();

    function handleError(message: string) {
      $q.notify({
        color: 'negative',
        message,
        actions: [
          {
            label: 'Dismiss',
            color: 'white'
          }
        ]
      });
    }

    /* eslint-disable */
    async function onUploadCSV(files: File[], removeFiles: () => void) {
      const csvString = await files[0].text();
      const result: any = await csvToJson().fromString(csvString);

      if (result.length === 0) {
        handleError('CSV Invalid');
        return;
      }

      const transferKeys = ['from', 'to', 'quantity', 'memo'];
      const objectKeys = Object.keys(result[0]);
      const isObjectCorrect = transferKeys.every(key => objectKeys.includes(key))

      if (!isObjectCorrect || transferKeys.length !== objectKeys.length) {
        handleError('CSV Invalid');
        return;
      }

      const actions = result.map((item: any) => {
        return {
          account: 'eosio.token',
          name: 'transfer',
          authorization: [
            {
              actor: props.proposer,
              permission: 'active'
            }
          ],
          data: item
        }
      });

      context.emit('actions', actions)
      removeFiles();
    }
    /* eslint-enable */

    return {
      onUploadCSV
    };
  }
});
</script>
