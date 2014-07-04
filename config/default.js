var path = require('path');

module.exports = {
  mongodb: {
    hostname: "localhost",
    database: "jrpc-mock",
    username: "",
    password: "",
    poolSize: 5
  },
  log4js: {
    filename: {
      app: "logs/access.log"
    },
    maxLogSize: 20 * 1024 * 1024, // 20MB
    backups: 20
  },
  session: {
    duration: 3600
  },
  server: {
    listenPort: 3000,
    apiEndpoint: '/v1/api',
    staticUrl: '/static',
    staticFolder: path.resolve(__dirname, '../public')
  }
};

