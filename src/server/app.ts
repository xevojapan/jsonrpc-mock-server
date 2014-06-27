///<reference path="../../def/node/node.d.ts" />
///<reference path="../../def/express/express.d.ts" />
///<reference path="../../def/moment/moment.d.ts" />

import express = require('express');
import http = require('http');
import path = require('path');
import login = require('./routes/login');
import appsapi = require('./routes/appsapi');
import userappsapi = require('./routes/userappsapi');
import newsdata = require('./routes/newsapi');
import admin = require('./routes/adminapi');
import drivelytics = require('./routes/drivelyticsproxy');
import rooney = require('./routes/rooneyproxy');

var bodyParser = require('body-parser');
var compress = require('compression');
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var favicon = require('static-favicon');
var jsonrpc = require('multitransport-jsonrpc');
var methodOverride = require('method-override');
var passport = require('passport');
var session = require('express-session');
var static = require('serve-static');
var MongoStore = require('connect-mongo')(session);

var moment = require('moment');
var log4js = require("log4js");
var config = require("config");


export function setPageRoutes(app: express.Application): void {
  // Sets up the favicon
  app.use(favicon(config.server.staticFolder + '/favicon.ico'));
  // First looks for a static file: index.html, css, images, etc.
  app.use(config.server.staticUrl, compress());
  app.use(config.server.staticUrl, static(config.server.staticFolder));
  app.use(config.server.staticUrl, (req: express.Request, res: express.Response, next: (err?: any) => void) => {
    res.send(404);
  });
}
export function setApiRoutes(app: express.Application): void {
  login.setPassportRoute(app);
  app.get('/api/userinfo', login.getUserInfo);

  app.get('/api/appstore/list', appsapi.getAppstoreList);
  app.get('/api/appinfo/:appid', appsapi.getAppInfo);

  app.get('/api/userapps/myapps', userappsapi.getMyApps);
  app.put('/api/userapps/myapps', userappsapi.updateMyApps);
  app.get('/api/userapps/install/:appid', userappsapi.checkInstallApps);
  app.post('/api/userapps/install/:appid', userappsapi.addMyApps);
  app.delete('/api/userapps/install/:appid', userappsapi.removeMyApps);

  app.get('/api/newsdata/list', newsdata.getNewsList);

  app.get('/api/drivelytics/*', drivelytics.login, drivelytics.proxy);
  app.get('/api/rooney/*', rooney.login, rooney.proxyGet);
  app.post('/api/rooney/*', rooney.login, rooney.proxyPost);

  admin.setRestApi(app, '/api/admin/');
}
export function setJsonRpcRoutes(app: express.Application): void {
  var jsonRpcMiddlewareServer: any = new jsonrpc.server(new jsonrpc.transports.server.middleware(), {
    loopback: (obj: any, callback: (err: any, res: any) => void) => {
      logger.debug('rpc: ' + JSON.stringify(obj));
      callback(null, obj);
    },
    newsdata: newsdata.rpcGetNewsList
  });
  app.post('/rpc', jsonRpcMiddlewareServer.transport.middleware);
}


export var app = express();

log4js.configure({
  appenders: [
    { type: 'console' },
    {
      type: 'file',
      filename: config.log4js.filename.app,
      maxLogSize: config.log4js.maxLogSize,
      backups: config.log4js.backups,
      category: [ 'server', 'console' ]
    },
  ],
  replaceConsole: true
});

var logger = log4js.getLogger('server');
app.use(log4js.connectLogger(logger, {
  level: log4js.levels.DEBUG,
  nolog: [ '\\.css', '\\.js', ],
  format: JSON.stringify({
    'date': ':date',
    'remote-addr': ':remote-addr',
    'method': ':method',
    'url': ':url',
    'http-version': ':http-version',
    'status': ':status',
    'content-length': ':content-length',
    'user-agent': ':user-agent'
  })
}));

app.set('port', process.env.PORT || config.server.listenPort);

app.enable('trust proxy');
app.use(methodOverride());
app.use(cookieParser('bentoWebServer'));
app.use(bodyParser.json());
app.use(session({
  secret: 'BentoWebServer',
  maxAge: new Date(Date.now() + config.session.duration),
  store: new MongoStore({
    db: config.mongodb.database,
    host: config.mongodb.hostname,
    username: config.mongodb.username,
    password: config.mongodb.password
  })
}));
setJsonRpcRoutes(app);

app.use(csrf());
app.use((req: express.Request, res: express.Response, next: () => void) => {
  logger.debug('res.csrfToken=' + req.csrfToken());
  res.cookie('XSRF-TOKEN', req.csrfToken());
  //res.locals.csrftoken = req.csrfToken();
  next();
});
app.use(passport.initialize());
app.use(passport.session());

setPageRoutes(app);
setApiRoutes(app);


// all other routes will be handled by client-side; thus forward missing files to the index.html
app.get('/*', (req: express.Request, res: express.Response) => {
  logger.debug('falldown index.html from ' + req.url);
  // Just send the index.html for other files to support HTML5Mode
  res.sendfile('index.html', { root: config.server.staticFolder });
});

app.use((err: any, req: express.Request, res: express.Response, next: () => void): void => {
  logger.error('error ' + req.url + ' : ' + err.message, err);
  next();
});


if (require.main === module) {
  var server = http.createServer(app);
  server.listen(app.get('port'), () => {
    console.log('%s server(%s) listening on port %d', process.argv[1], app.get('env'), app.get('port'));
    console.log(' check config:' + JSON.stringify(config));
  });
} else {
  console.log('NODE_ENV: ' + app.get('env'));
  // for unit test.
  log4js.configure({ appenders: [] });
}

