# JSON-RPC Mock Server

## Build for MacOSX

### Prepare

    brew install node mongodb
    npm install -g grunt-cli bower typescript

### Compile

    npm install
    bower install
    grunt release


## Usage

### API Configuration

open Browser to `/config`.

### API Call

The API endpoint depends to setting.
The params attribute of JSON-RPC is ignored, but params must be necessity and Object. 

#### API Endpoint

* Method: 'POST'
* Path: setting of `config.server.apiEndpoint` (default: '/v1/api')
