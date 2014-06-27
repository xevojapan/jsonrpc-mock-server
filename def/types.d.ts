declare module bws {

  export interface IUserMaster {
    userid: string;
    username: string;
    email?: string;
    imageUrl?: string;
    lastLogin?: Date;
    auths: IUserProfile[];
  }
  export interface IUserProfile {
    provider: string;
    userid: string;
    username?: string;
    email?: string;
    imageUrl?: string;

    // for local user
    password?: {
      salt: string;
      hash: string;
      expire?: Date;
    };
    emailVerified?: boolean;
  }
  export interface IAuthToken {
    userId: string;
    token: string;
    vehicleId: string;
    pinNumber?: string;
    expire?: Date;
    lastLogin?: Date;
  }

  export interface IAppCategory {
    categoryId: number;
    name: string;
    iconUrl: string;
    items?: {
      appid: string;
      displayName: string;
      iconUrl: {
        small: string;
        medium: string;
        large: string;
      };
      fee: string;
      review: number;
      installed: boolean;
    }[];
  }

  export interface IReviewComment {
    username: string; // TODO replace user id
    rate: number;
    date: Date;
    comment: string;
  }
  export interface IAppInfo {
    appid: string;
    displayName: string;
    iconUrl: {
      small: string;
      medium: string;
      large: string;
    };
    version: string;
    released: Date;
    seller: string; // TODO replace artist id
    fee: string;
    description: string;
    installed?: boolean;
    installing?: boolean;
    categories: number[];
    screenShotURLs: string[];
    versionHistory: {
      version: string;
      released: Date;
      description: string;
    }[];
    review: {
      count: number[];  // for each rate
      latest: IReviewComment[];
      comments: IReviewComment[];
    };
  }

  export interface INewsData {
    title: string;
    time: string;
    detail: string[];
    imageUrl?: string;
  }

  export interface IDisplayApp {
    appid: string;
    displayName: string;
    iconUrl: string;
  }
  export interface IMyApps {
    apps: IDisplayApp[];
  }

  export interface IUpdateApps {
    apps: string[];
  }

  export interface IResult {
    result: boolean;
  }
  export interface ILoginResult extends IResult {
    first: boolean;
  }


  export interface IRooney<T> {
    response: {
      "session-key": string;
      result: T;
    }
  }
  export interface IDecartaPoiList {
    summary: IDecartaSummary;
    results: {
      result: IDecartaPoi[];
    };
  }
  export interface IDecartaSummary {
    query: string;
    queryType: string;
    queryTime: number;
    numResults: number;
    totalResults: number;
  }
  export interface IDecartaPoi {
    type: string;
    id: number;
    score: number;
    poi: {
      name: string;
      phone?: string;
      categories: string[];
    };
    address: {
      freeformAddress: string;
    };
    position: {
      lat: number;
      lon: number;
    };
  }
  export interface IRooneyPoiList {
    result: IRooneyPoi[];
  }
  export interface IRooneyPoi {
    "user-id": number;
    name: string;
    address: string;
    "poi-id": number;
    "tag-id": number;
    "favorite-id": number;
    lat: number;
    lon: number;
  }
  export interface INaviPoi {
    id: number;
    name: string;
    address: string;
    lat: number;
    lon: number;
    tagId?: number;
    favId?: number;
    fav?: boolean;
    selected?: boolean;
    updating?: boolean;
  }

}


