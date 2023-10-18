import { Profile } from 'src/types/Profile';

export interface ProfilesStateInterface {
    // key is the account
    profiles: Map<string, Profile>;
}

export function state(): ProfilesStateInterface {
    return {
        profiles: new Map<string, Profile>(),
    };
}
