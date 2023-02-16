import { boot } from 'quasar/wrappers';
import {
  Authenticator,
  RpcEndpoint,
  UAL,
  User
} from 'universal-authenticator-library';
import { Anchor } from 'ual-anchor';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';
import { CleosAuthenticator } from '@telosnetwork/ual-cleos';
import { Dialog, Notify, copyToClipboard } from 'quasar';
import { isValidAccount } from 'src/utils/stringValidator';

const chain: Chain = getChain();

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $ual: UAL;
    $user: User;
  }
}

const mainChain = {
  chainId: chain.getChainId(),
  rpcEndpoints: [chain.getRPCEndpoint()]
};

async function loginHandler() {
  let accountName = 'eosio';
  let permission = 'active';
  if (localStorage.getItem('autoLogin') === 'cleos') {
    accountName = localStorage.getItem('account');
  } else {
    await new Promise((resolve) => {
      Dialog.create({
        color: 'primary',
        title: 'Connect to cleos',
        message: 'Account name',
        prompt: {
          model: '',
          type: 'text',
          isValid: (val) => isValidAccount(val)
        },
        cancel: true,
        persistent: true
      })
        .onOk((data: string) => {
          data = data;
          accountName = data != '' ? data : 'eosio';
        })
        .onCancel(() => {
          throw 'Cancelled!';
        })
        .onDismiss(() => {
          resolve(true);
        });
    });
    await new Promise((resolve) => {
      Dialog.create({
        color: 'primary',
        title: 'Connect to cleos',
        message: 'Account permission',
        options: {
          type: 'radio',
          model: [],
          items: [
            { label: 'Active', value: 'active' },
            { label: 'Owner', value: 'owner' }
          ]
        },
        cancel: true,
        persistent: true
      })
        .onOk((data: string) => {
          permission = data;
        })
        .onCancel(() => {
          throw 'Cancelled!';
        })
        .onDismiss(() => {
          resolve(true);
        });
    });
  }
  return {
    accountName,
    permission
  };
}

async function signHandler(rpc: RpcEndpoint, trx: string) {
  const trxJSON: string = JSON.stringify(
    Object.assign(
      {
        delay_sec: 0,
        max_cpu_usage_ms: 0
      },
      trx
    ),
    null,
    4
  );
  await new Promise((resolve) => {
    Dialog.create({
      color: 'primary',
      message: `<pre>cleos -u ${rpc.protocol}://${rpc.host}:${rpc.port} push transaction '${trxJSON}'</pre>`,
      html: true,
      cancel: true,
      fullWidth: true,
      ok: {
        label: 'Copy'
      }
    })
      .onOk(() => {
        copyToClipboard(
          `cleos -u ${rpc.protocol}://${rpc.host}:${rpc.port} push transaction '${trxJSON}'`
        )
          .then((): void => {
            Notify.create({
              color: 'green-4',
              textColor: 'white',
              message: 'Copied to clipboard',
              timeout: 1000
            });
          })
          .catch(() => {
            Notify.create({
              color: 'red-8',
              textColor: 'white',
              message: 'Could not copy',
              timeout: 1000
            });
          });
      })
      .onCancel(() => {
        throw 'Cancelled!';
      })
      .onDismiss(() => {
        resolve(true);
      });
  });
}

async function signHandlerForMainChain(trx: string) {
  return signHandler(chain.getRPCEndpoint(), trx);
}

export const authenticators: Authenticator[] = [
  new Anchor([mainChain], { appName: process.env.APP_NAME }),
  new CleosAuthenticator([mainChain], {
    appName: process.env.APP_NAME,
    loginHandler,
    signHandler: signHandlerForMainChain
  })
];

export default boot(({ app }) => {
  const ual = new UAL([mainChain], 'ual', authenticators);

  app.config.globalProperties.$ual = ual;
});
