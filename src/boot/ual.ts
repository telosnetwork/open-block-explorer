import { boot } from 'quasar/wrappers';
import { Authenticator, UAL, User } from 'universal-authenticator-library';
import { Anchor } from 'ual-anchor';
import { CleosAuthenticator } from '@telosnetwork/ual-cleos';
import { Dialog, Notify, copyToClipboard } from 'quasar';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $ual: UAL;
    $user: User;
  }
}

export default boot(({ app }) => {
  const mainChain = {
    chainId: process.env.NETWORK_CHAIN_ID,
    origin: process.env.TELOS_ORIGIN,
    rpcEndpoints: [
      {
        protocol: process.env.NETWORK_PROTOCOL,
        host: process.env.NETWORK_HOST,
        port: parseInt(process.env.NETWORK_PORT)
      }
    ]
  };

  async function loginHandler() {
    let accountName = 'eosio';
    let permission = 'active';
    if (localStorage.getItem('autoLogin') === 'cleos') {
      accountName = localStorage.getItem('account');
    } else {
      //accountName = prompt('Input you account name', '');
      await new Promise((resolve) => {
        Dialog.create({
          color: 'primary',
          title: 'Connect to cleos',
          message: 'Account name',
          prompt: {
            model: '',
            type: 'text' // optional
          },
          cancel: true,
          persistent: true
        })
          .onOk((data: string) => {
            accountName = data != '' ? data : 'eosio';
          })
          .onCancel(() => {
            //console.log('>>>> Cancel');
            throw 'Canceled!';
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
            // inline: true
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
            //console.log('>>>> Cancel');
            throw 'Canceled!';
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

  async function signHandler(trx: string) {
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
        message: `<pre>cleos -u https://${process.env.NETWORK_HOST} push transaction '${trxJSON}'</pre>`,
        html: true,
        cancel: true,
        fullWidth: true,
        ok: {
          label: 'Copy'
        }
      })
        .onOk(() => {
          // console.log('OK')
          copyToClipboard(
            `cleos -u https://${process.env.NETWORK_HOST} push transaction '${trxJSON}`
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
          //console.log('>>>> Cancel');
        })
        .onDismiss(() => {
          resolve(true);
        });
    });
  }

  const authenticators: Authenticator[] = [
    new Anchor([mainChain], { appName: process.env.APP_NAME }),
    new CleosAuthenticator([mainChain], {
      appName: process.env.APP_NAME,
      loginHandler,
      signHandler
    })
  ];

  const ual = new UAL([mainChain], 'ual', authenticators);

  app.config.globalProperties.$ual = ual;
});
