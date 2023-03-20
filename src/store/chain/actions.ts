import { ActionTree } from 'vuex';
import { StateInterface } from 'src/store/index';
import { ChainStateInterface } from 'src/store/chain/state';
import { BP, GetTableRowsParams } from 'src/types';
import axios from 'axios';
import { api } from 'src/api/index';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';
import { formatCurrency } from 'src/utils/string-utils';

const chain: Chain = getChain();

export const actions: ActionTree<ChainStateInterface, StateInterface> = {
    async updateBpList({ commit }) {
        try {
            const producerSchedule = (await api.getSchedule()).active.producers;
            const schedule = producerSchedule.map(el => el.producer_name);
            commit('setProducerSchedule', schedule);
            const objectList = await axios.get(chain.getS3ProducerBucket());
            const parser = new DOMParser();
            const contentsArray = parser
                .parseFromString(objectList.data, 'text/xml')
                .getElementsByTagName('Contents');
            const lastEntry = contentsArray[contentsArray.length - 1];
            const lastKey = lastEntry.childNodes[0].textContent;
            const producerData: BP[] = (
        await axios.get(`${chain.getS3ProducerBucket()}/${lastKey}`)
      ).data as BP[];
            let producers = (await api.getProducers()).rows;
            producers = producers.filter(producer => producer.is_active === 1);
            producers = producers.map((data) => {
                const bp = producerData.find(
                    producer => producer.owner === data.owner,
                );
                if (bp) {
                    try {
                        return {
                            ...data,
                            name: bp.org.candidate_name,
                            location: bp.org.location.name,
                        };
                    } catch (error) {
                        return data;
                    }
                } else {
                    return {
                        ...data,
                        name: data.owner,
                        location: '',
                    };
                }
            });
            producerData.sort((a, b) => b.total_votes - a.total_votes);
            producers.sort((a, b) => b.total_votes - a.total_votes);
            commit('setProducers', producers);
            commit('setBpList', producerData);
        } catch (err) {
            console.error(err);
        }
    },
    async updateBlockData({ commit }) {
        try {
            const info = await api.getInfo();
            commit('setHead_block_num', info.head_block_num);
            commit('setLIB', info.last_irreversible_block_num);
            commit('setHead_block_producer', info.head_block_producer);
        } catch (err) {
            console.error(err);
        }
    },
    async updateRamPrice({ commit }) {
        try {
            const paramsRammarket = {
                code: 'eosio',
                scope: 'eosio',
                table: 'rammarket',
                json: true,
            } as GetTableRowsParams;
            const rammarket = (
        (await api.getTableRows(paramsRammarket)) as {
          rows: {
            supply: string;
            base: { balance: string; weight: string };
            quote: { balance: string; weight: string };
          }[];
        }
            ).rows[0];
            const base = Number(rammarket.base.balance.split(' ')[0]);
            const quote = Number(rammarket.quote.balance.split(' ')[0]);
            const price = (quote * 1000) / (base - 1000);
            // add 0.5% fee to the price
            const formattedPrice = formatCurrency((price / 0.995), 4, null, true);

            commit('setRamPrice', formattedPrice);
        } catch (err) {
            console.error(err);
        }
    },
};
