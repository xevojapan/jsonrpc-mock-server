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

  export interface IMethodList extends IResult {
    methods: IJsonRpcMethod[];
  }

  export interface ILogResult extends IResult {
    log: string;
  }

  export interface IResult {
    result: boolean;
  }

}


