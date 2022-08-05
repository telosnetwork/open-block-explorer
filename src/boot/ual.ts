import { boot } from 'quasar/wrappers';
import { Authenticator, UAL, User } from 'universal-authenticator-library';
import { Anchor } from 'ual-anchor';
import { CleosAuthenticator } from '@telosnetwork/ual-cleos';

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

  function loginHandler() {
    let accountName = '';
    if (localStorage.getItem('autoLogin') === 'cleos') {
      accountName = localStorage.getItem('account');
    } else {
      accountName = prompt('Input you account name', '');
    }
    return {
      accountName,
      permission: 'active'
    };
  }

  function signHandler(trx: any) {
    // TODO: dialog prompt with cleos command for this transaction
    /*
    cleos -u https://telos.greymass.com push transaction '{
      "delay_sec": 0,
      "max_cpu_usage_ms": 0,
      "actions": []
      }'
     */
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

    alert(
      `cleos -u https://${process.env.NETWORK_HOST} push transaction '${trxJSON}'`
    );
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
