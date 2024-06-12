import { Name, UInt32 } from '@wharfkit/session';
import axios from 'axios';
import { defineStore } from 'pinia';
import { api } from 'src/api';
import { useNetworksStore } from 'src/stores/networks';
import { BP, GetTableRowsParams, Producer, Token } from 'src/types';
import { formatCurrency } from 'src/utils/string-utils';

export interface ChainStateInterface {
    token: Token;
    bpList: BP[];
    producers: Producer[];
    head_block_num: UInt32;
    last_irreversible_block_num: UInt32;
    head_block_producer: Name;
    producerSchedule: string[];
    ram_price: string;
}

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
        head_block_num: UInt32.from(0),
        last_irreversible_block_num: UInt32.from(0),
        head_block_producer: Name.from(''),
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
        setHead_block_num(hbn: number | UInt32) {
            this.head_block_num = UInt32.from(hbn);
        },
        setLIB(lib: number | UInt32) {
            this.last_irreversible_block_num = UInt32.from(lib);
        },
        setHead_block_producer(hbp: string | Name) {
            this.head_block_producer = Name.from(hbp);
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
                const networksStore = useNetworksStore();

                const producerSchedule = (await api.getProducerSchedule()).active.producers;
                const schedule = producerSchedule.map(el => String(el.producer_name));
                this.setProducerSchedule(schedule);
                const objectList = await axios.get(networksStore.getCurrentNetwork.getS3ProducerBucket());
                const parser = new DOMParser();
                const contentsArray = parser
                    .parseFromString(objectList.data as string, 'text/xml')
                    .getElementsByTagName('Contents');
                const lastEntry = contentsArray[contentsArray.length - 1];
                const lastKey = lastEntry.childNodes[0].textContent;
                const producerData: BP[] = (
            await axios.get(`${networksStore.getCurrentNetwork.getS3ProducerBucket()}/${lastKey}`)
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
                this.setProducers(producers);
                this.setBpList(producerData);
            } catch (err) {
                console.error(err);
            }
        },
        async updateBlockData() {
            try {
                const info = await api.getInfo();
                this.head_block_num  = info.head_block_num;
                this.last_irreversible_block_num = info.last_irreversible_block_num;
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

