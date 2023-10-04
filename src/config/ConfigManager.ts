import chainsConfig from 'src/config/configuredChains';
import { Chain } from 'src/types/Chain';

export function getChain(): Chain {
    return ConfigManager.get().getCurrentChain();
}

export default class ConfigManager {
    public static CHAIN_LOCAL_STORAGE = 'selectedChainName';
    public static PREFERRED_CHAIN_LOCAL_STORAGE = 'preferredChainName';
    private static thisManager: ConfigManager;
    private testnets: Chain[];
    private mainnets: Chain[];
    private currentChain: Chain;

    public constructor() {
        this.init();
    }

    private init(): void {
        const showMultichainSelector = process.env.SHOW_MULTICHAIN_SELECTOR === 'true';
        const configuredChain = process.env.CHAIN_NAME;
        this.testnets = chainsConfig.testnets;
        this.mainnets = chainsConfig.mainnets;
        if (showMultichainSelector) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const userConfiguredChain = this.getSelectedChain();

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

    private getSelectedChain(): string {
        return sessionStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE);
    }

    public setCurrentChain(chain: Chain): boolean {
        if (!this.findChain(chain.getName())) {
            return false;
        }
        sessionStorage.setItem(
            ConfigManager.CHAIN_LOCAL_STORAGE,
            chain.getName(),
        );
        this.currentChain = chain;
        return true;
    }

    public getPreferredChain(): string {
        return localStorage.getItem(ConfigManager.PREFERRED_CHAIN_LOCAL_STORAGE);
    }

    public setPreferredChain(chain: Chain): boolean {
        if (!this.findChain(chain.getName())) {
            return false;
        }
        localStorage.setItem(
            ConfigManager.PREFERRED_CHAIN_LOCAL_STORAGE,
            chain.getName(),
        );
        return true;
    }

    public getAllChains(): Chain[] {
        return this.mainnets.concat(this.testnets);
    }

    public getMainnets(): Chain[] {
        return this.mainnets;
    }

    public getTestnets(): Chain[] {
        return this.testnets;
    }

    private findChain(chainName: string) {
        const fromMainnet = this.mainnets.find(
            c => c.getName() === chainName,
        );
        if (fromMainnet) {
            return fromMainnet;
        }

        return this.testnets.find(c => c.getName() === chainName);
    }
}
