///<reference path="../../def/node/node.d.ts" />
///<reference path="../../def/express/express.d.ts" />

import express = require('express');
import fs = require('fs');
import http = require('http');
import path = require('path');
import model = require('./model');

var bodyParser = require('body-parser');
var compress = require('compression');
var cookieParser = require('cookie-parser');
//var csrf = require('csurf');
var favicon = require('static-favicon');
var jsonrpc = require('multitransport-jsonrpc');
var methodOverride = require('method-override');
//var passport = require('passport');
var session = require('express-session');
var static = require('serve-static');
var MongoStore = require('connect-mongo')(session);

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
export function setJsonRpcRoutes(app: express.Application): void {
  var scope: {[index: string]: Function} = {
    loopback: (obj: any, callback: (err: any, res: any) => void) => {
      logger.debug('rpc: ' + JSON.stringify(obj));
      callback(null, obj);
    }
  };
  model.JsonRpcMethod.find({}, (err: any, result: model.IJsonRpcMethod[]) => {
    if (err) {
      logger.error('Methods Initialize Error: ' + err, err);
    } else {
      result.forEach((method) => {
        scope[method.name] = convertToCallback(method);
      });
    }
  });

  var jsonRpcMiddlewareServer: any = new jsonrpc.server(new jsonrpc.transports.server.middleware(), scope);
  app.post('/rpc', jsonRpcMiddlewareServer.transport.middleware);

  app.get('/api/method', (req: express.Request, res: express.Response): void => {
    logger.info('getMethod');

    model.JsonRpcMethod.find({}).sort({_id: 1}).exec((err: any, result: model.IJsonRpcMethod[]) => {
      if (err) {
        logger.error('getMethod Error: ' + err, err);
        res.json(500, { result: false, message: err.toString() });
      } else {
        logger.info('getMethod Success.');
        res.json({ result: true, methods: result });
      }
    });
  });
  app.post('/api/method/:name', (req: express.Request, res: express.Response): void => {
    var name = req.param('name');
    var data = req.body;
    if (!data) {
      res.json(400, { result: false, message: 'required post body' });
      return;
    }

    logger.info('updateMethod: name=' + name + ', ' + JSON.stringify(data));

    model.JsonRpcMethod.findByIdAndUpdate(name, { $set: data }, { upsert: true }, (err: any, method: model.IJsonRpcMethod) => {
      if (err) {
        logger.error('updateMethod Error: ' + err, err);
        res.json(500, { result: false, message: err.toString() });
      } else {
        logger.info('updateMethod Success: ' + name);
        logger.debug( method );
        scope[name] = convertToCallback(method);
        res.json({ result: true });
      }
    });
  });
  app.delete('/api/method/:name', (req: express.Request, res: express.Response): void => {
    var name = req.param('name');

    logger.info('deleteMethod: ' + name);

    scope[name] = undefined;
    model.JsonRpcMethod.remove({ _id: name }, (err: any) => {
      if (err) {
        logger.error('deleteMethod Error: ' + err, err);
        res.json(500, { result: false, message: err.toString() });
      } else {
        logger.info('deleteMethod Success: ' + name);
        res.json({ result: true });
      }
    });
  });
}
function convertToCallback(method: model.IJsonRpcMethod): Function {
  return (obj: any, callback: (err: any, res: any) => void): void => {
    logger.debug(' rpc called: ' + method._id + ', params=' + JSON.stringify(obj));
    if (method.isError) {
      callback(method.error, null);
    } else {
      callback(null, method.result);
    }
  };
}

export function setLogsRoutes(app: express.Application): void {
  app.get('/api/log/access', (req: express.Request, res: express.Response): void => {
    logger.info('getAccessLog');

    fs.readFile(config.log4js.filename.app, (err: any, data: Buffer) => {
      if (err) {
        logger.error('getAccessLog Error: ' + err, err);
        res.json(500, { result: false, message: err.toString() });
      } else {
        logger.info('getAccessLog Success.');
        res.json({ result: true, log: data.toString() });
      }
    });
  });
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
app.use(cookieParser('jrpcMockServer'));
app.use(bodyParser.json());
app.use(session({
  secret: 'jrpcMockServer',
  maxAge: new Date(Date.now() + config.session.duration),
  store: new MongoStore({
    db: config.mongodb.database,
    host: config.mongodb.hostname,
    username: config.mongodb.username,
    password: config.mongodb.password
  })
}));

setPageRoutes(app);
setJsonRpcRoutes(app);
setLogsRoutes(app);


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

