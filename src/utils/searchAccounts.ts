import { API, Name } from '@wharfkit/session';
import { getTableByScope } from 'src/api/antelopeV1';
import { OptionsObj } from 'src/types';
import { ACCOUNT_LENGTH } from 'src/utils/string-utils';
import { systemAccounts } from 'src/utils/systemAccount';

// remove leading and trailing spaces and periods from search input for query
const cleanSearchInput = (value: string): string => value.replace(/^[\s.]+|[\s.]+$/g, '');

export const searchAccounts = async (value: string): Promise<OptionsObj[]> => {
    try {
        const results = [] as OptionsObj[];
        if (value.length > ACCOUNT_LENGTH){
            return results;
        }
        const request = {
            code: 'eosio',
            limit: 5,
            lower_bound: cleanSearchInput(value),
            table: 'userres',
            upper_bound: value.padEnd(12, 'z'),
        };
        const accounts = (await getTableByScope(request)).rows;

        // get table by scope for userres does not include system account
        if (value.includes('eosio')) {
            for (const systemAccount of systemAccounts){
                accounts.push(
                    {
                        payer: Name.from(systemAccount),
                    } as API.v1.GetTableByScopeResponseRow,
                );
            }
        }

        if (accounts.length > 0) {

            results.push({
                label: 'Accounts',
                to: '',
                isHeader: true,
            });

            accounts.forEach((user: API.v1.GetTableByScopeResponseRow) => {
                const payer = String(user.payer);
                if (payer.includes(value)) {
                    results.push({
                        label: payer,
                        to: `/account/${payer}`,
                        isHeader: false,
                    });
                }
            });
        }
        return results;
    } catch (error) {
        return;
    }
};
