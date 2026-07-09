import { defineStore } from 'pinia';
import { BP, GetTableRowsParams, Producer, Token } from 'src/types';
import { api } from 'src/api';
import axios from 'axios';
import { formatCurrency } from 'src/utils/string-utils';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';
import { Name } from '@wharfkit/session';


export interface ChainStateInterface {
    token: Token;
    bpList: BP[];
    producers: Producer[];
    head_block_num: number;
    last_irreversible_block_num: number;
    head_block_producer: string;
    producerSchedule: string[];
    ram_price: string;
}

const chain: Chain = getChain();

export const useChainStore = defineStore('chain', {
    state: (): ChainStateInterface => ({
        token: {
            symbol: '',
            precision: 0,
            amount: 0,
            contract: '',
        },
        bpList: [],
        producers: [],
        head_block_num: 0,
        last_irreversible_block_num: 0,
        head_block_producer: '',
        producerSchedule: [],
        ram_price: '0',
    }),
    getters: {
        getToken({ token }): Token {
            return token;
        },
    },
    actions: {
        setToken(token: Token) {
            this.token = token;
        },
        setsSymbol(symbol: string) {
            this.token.symbol = symbol;
        },
        setPrecision(precision: number) {
            this.token.precision = precision;
        },
        setBpList(bpList: BP[]) {
            this.bpList = bpList;
        },
        setHead_block_num(hbn: number) {
            this.head_block_num = hbn;
        },
        setLIB(lib: number) {
            this.last_irreversible_block_num = lib;
        },
        setHead_block_producer(hbp: string) {
            this.head_block_producer = hbp;
        },
        setProducerSchedule(schedule: string[]) {
            this.producerSchedule = schedule;
        },
        setProducers(bpList: Producer[]) {
            this.producers = bpList;
        },
        setRamPrice(price: string) {
            this.ram_price = price;
        },
        async updateBpList() {
            try {
                const producerSchedule = (await api.getSchedule()).active.producers;
                const schedule = producerSchedule.map(el => el.producer_name);
                this.setProducerSchedule(schedule);
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
                const activeProducerOwners = new Set(
                    producers.map(producer => producer.owner),
                );
                const activeProducerData = producerData.filter(
                    bp => activeProducerOwners.has(bp.owner),
                );
                producers = await Promise.all(producers.map(async (data) => {
                    const bp = producerData.find(
                        producer => producer.owner === data.owner,
                    );
                    const producerVote = await api.getTableRows({
                        code: 'eosio',
                        scope: 'eosio',
                        table: 'voters',
                        lower_bound: Name.from(data.owner),
                        limit: 1,
                    }) as { rows:  { owner: string; self_stake_boost: number; producers: string[]; last_vote_weight: number }[] };
                    let selfStakedBoost = 0;
                    if (producerVote.rows.length > 0 && producerVote.rows[0].owner === data.owner && producerVote.rows[0].self_stake_boost > 0 && producerVote.rows[0].producers.includes(data.owner)) {
                        selfStakedBoost = (producerVote.rows[0].self_stake_boost / 100) * producerVote.rows[0].last_vote_weight;
                    }
                    if (bp) {
                        try {
                            return {
                                ...data,
                                name: bp.org.candidate_name,
                                location: bp.org.location.name,
                                self_staked_boost: selfStakedBoost,
                            };
                        } catch (error) {
                            return {
                                ...data,
                                self_staked_boost: selfStakedBoost,
                            };
                        }
                    } else {
                        return {
                            ...data,
                            name: data.owner,
                            location: '',
                            self_staked_boost: selfStakedBoost,
                        };
                    }
                }));
                activeProducerData.sort((a, b) => b.total_votes - a.total_votes);
                producers.sort((a, b) => b.total_votes - a.total_votes);
                this.setProducers(producers);
                this.setBpList(activeProducerData);
            } catch (err) {
                console.error(err);
            }
        },
        async updateBlockData() {
            try {
                const info = await api.getInfo();
                this.head_block_num  = info.head_block_num;
                this.last_irreversible_block_num  =info.last_irreversible_block_num;
                this.head_block_producer = info.head_block_producer;
            } catch (err) {
                console.error(err);
            }
        },
        async updateRamPrice() {
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

                this.setRamPrice(formattedPrice);
            } catch (err) {
                console.error(err);
            }
        },
    },
});
