import chainsConfig from './configuredChains';
import { Chain } from '../types/Chain';

export function getChain(): Chain {
  return ConfigManager.get().getCurrentChain();
}

export default class ConfigManager {
  public static CHAIN_LOCAL_STORAGE = 'selectedChainName';
  private static thisManager: ConfigManager;
  private testnets: Chain[];
  private mainnets: Chain[];
  private currentChain: Chain;

  public constructor() {
    this.init();
  }

  private init(): void {
    const showSidebar = process.env.SHOW_SIDEBAR;
    const configuredChain = process.env.CHAIN_NAME;
    console.log(showSidebar);
    if (showSidebar) {
      this.testnets = chainsConfig.testnets;
      this.mainnets = chainsConfig.mainnets;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const userConfiguredChain = localStorage.getItem(
        ConfigManager.CHAIN_LOCAL_STORAGE
      );

      if (userConfiguredChain) {
        this.currentChain = this.findChain(userConfiguredChain);

        if (!this.currentChain) {
          this.currentChain = this.findChain(configuredChain);
        }
      } else {
        this.currentChain = this.findChain(configuredChain);
      }
    } else {
      this.currentChain = this.findChain(configuredChain);
    }
  }

  public static get(): ConfigManager {
    if (!ConfigManager.thisManager) {
      ConfigManager.thisManager = new ConfigManager();
    }

    return ConfigManager.thisManager;
  }

  public getCurrentChain(): Chain {
    return this.currentChain;
  }

  public getAllChains(): Chain[] {
    return this.mainnets.concat(this.testnets);
  }

  private findChain(chainName: string) {
    const fromMainnet = this.mainnets.find((c) => c.getName() === chainName);
    if (fromMainnet) return fromMainnet;

    return this.testnets.find((c) => c.getName() === chainName);
  }
}
