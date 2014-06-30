declare module jrpc {

  export interface IJsonRpcMethod {
    name: string;
    isError: boolean;
    error?: {
      code: number;
      message: string;
      data?: Object;
    };
    result?: any;
  }

  export interface IResult {
    result: boolean;
  }

}


