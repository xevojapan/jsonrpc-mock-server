# JSON-RPC API Mock Server

## Build

### Prepare

    brew install node mongodb
	npm install -g grunt-cli bower typescript

### Compile

    npm install
	bower install -f
	grunt release


## Usage

### API Configuration

`/config` をBrowserで開くことで、APIを追加・変更・削除が可能

### API Call

以下のEndpointに対して、設定した methodで requestを送ると設定した responseが返ってくる。
JSON-RPCのrequestにある、params は無視される。

#### API Endpoint

* Method: 'POST'
* Path: `config.server.apiEndpoint` の値（デフォルト： '/v1/api'）
