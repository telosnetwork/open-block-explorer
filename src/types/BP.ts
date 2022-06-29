export interface BP {
  producer_account_name: string;
  org: {
    candidate_name: string;
    website: string;
    code_of_conduct: string;
    ownership_disclosure: string;
    email: string;
    branding: {
      logo_256: string;
      logo_1024: string;
      caleos_white_png: string;
      logo_svg: string;
      caleos_white_svg: string;
    };
    location: {
      name: string;
      country: string;
      latitude: number;
      longitude: number;
    };
    social: {
      twitter: string;
      medium: string;
      github: string;
      telegram: string;
      steemit: string;
    };
  };
  owner: string;
  producer_key: string;
  nodes: Location[];
  total_votes: number;
}

interface Location {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  node_type: string;
}
