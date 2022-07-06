import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { ChainStateInterface } from './state';
import { BP } from 'src/types';
import axios from 'axios';
import { api } from 'src/api/index';

export const actions: ActionTree<ChainStateInterface, StateInterface> = {
  async updateBpList({ commit }) {
    try {
      const producerSchedule = (await api.getSchedule()).active.producers;
      const schedule = producerSchedule.map((el) => el.producer_name);
      commit('setProducerSchedule', schedule);
      const objectList = await axios.get(process.env.PRODUCER_BUCKET_URL);
      const parser = new DOMParser();
      const contentsArray = parser
        .parseFromString(objectList.data, 'text/xml')
        .getElementsByTagName('Contents');
      const lastEntry = contentsArray[contentsArray.length - 1];
      const lastKey = lastEntry.childNodes[0].textContent;
      const producerData: BP[] = (
        await axios.get(`${process.env.PRODUCER_BUCKET_URL}/${lastKey}`)
      ).data as BP[];
      let producers = (await api.getProducers()).rows;
      producers = producers.filter((producer) => producer.is_active === 1);
      producers = producers.map((data) => {
        const bp = producerData.find(
          (producer) => producer.owner === data.owner
        );
        if (bp) {
          try {
            return {
              ...data,
              name: bp.org.candidate_name,
              location: bp.org.location.name
            };
          } catch (error) {
            return data;
          }
        } else {
          return {
            ...data,
            name: data.owner,
            location: ''
          };
        }
      });
      producerData.sort((a, b) => b.total_votes - a.total_votes);
      producers.sort((a, b) => b.total_votes - a.total_votes);
      commit('setProducers', producers);
      commit('setBpList', producerData);
    } catch (err) {
      console.log('Error', err);
    }
  },
  async updateBlockData({ commit }) {
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
