var path = require('path');

module.exports = {
  mongodb: {
    hostname: "localhost",
    database: "bento-web",
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
    staticUrl: '/static',
    staticFolder: path.resolve(__dirname, '../public')
  },
  auth: {
    callbackHostname: "http://127.0.0.1:3000",
    facebook: {
      clientID: '1426039047681363',
      clientSecret: '34b952385bfc0cfc90fd05ee7f627d30'
    },
    twitter: {
      clientID: 'n74rbh3UB4HfRlTT4ZTVMHayH',
      clientSecret: 'wTswjk3grpN88pORwRDvGwAm3VuQ9eEs8PCeFGeInbP7mU5Imr'
    },
    google: {
      clientID: '821728822793-q7kp08evk5q58f4765gi8oohuj8e3rji.apps.googleusercontent.com',
      clientSecret: 'IZapFbAGBUJevGLCGICpGgRd'
    }
  },
  drivelytics: {
    email: "dconnect_test2@uievolution.com",
    password: "seattle2"
  },
  rooney: {
    user: "admin",
    pass: "test"
  }
};

