import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { ChainStateInterface } from './state';
import { BP } from 'src/types';
import axios from 'axios';
import { api } from 'src/api/index';

export const actions: ActionTree<ChainStateInterface, StateInterface> = {
  async updateBpList({ commit }) {
    // const producersParams = {
    //   code: 'eosio',
    //   limit: '1000',
    //   scope: 'eosio',
    //   table: 'producers',
    //   reverse: false,
    //   json: true
    // } as GetTableRowsParams;
    // const producers = (await api.getTableRows(producersParams)) as ProducerRows;
    // const bpList = [];
    // for (const producer of producers.rows) {
    //   const url = producer.url;
    //   const blockProducer: BP = await axios.get(url + '/bp.json');
    //   bpList.push(blockProducer);
    // }

    try {
      const objectList = await axios.get(process.env.PRODUCER_BUCKET_URL);
      const parser = new DOMParser();
      const contentsArray = parser
        .parseFromString(objectList.data, 'text/xml')
        .getElementsByTagName('Contents');
      const lastEntry = contentsArray[contentsArray.length - 1];
      //const lastUpdated = lastEntry.childNodes[1].textContent;
      const lastKey = lastEntry.childNodes[0].textContent;
      const producerData: BP[] = (
        await axios.get(`${process.env.PRODUCER_BUCKET_URL}/${lastKey}`)
      ).data as BP[];
      commit('setBpList', producerData);
    } catch (err) {
      console.log('Error', err);
    }
  },
  async updateBlockData({ commit }) {
    console.log('updateblockdata');
    try {
      const info = await api.getInfo();
      commit('setHead_block_num', info.head_block_num);
      commit('setLIB', info.last_irreversible_block_num);
      commit('setHead_block_producer', info.head_block_producer);
    } catch (err) {
      console.log('Error', err);
    }
  }
};
