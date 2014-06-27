///<reference path="../../../def/node/node.d.ts" />
///<reference path="../../../def/express/express.d.ts" />
///<reference path="../../../def/request/request.d.ts" />

import express = require('express');
import request = require('request');

var log4js = require("log4js");
var config = require("config");

var logger = log4js.getLogger('server');
var requestC = request.defaults({jar: true});


var account: any = null;

export function proxy(req: express.Request, res: express.Response, next: () => void): void {
  var method = req.method;
  var path = req.url.substr('/api/drivelytics'.length);

  logger.info('drivelytics proxy:' + method + ' ' + path);
  req.pipe(
    requestC({
      method: method,
      url: 'http://oxford.uievolution.co.jp/api' + path,
      json: true
    }, (err: any, response: any, body: any) => {
      if (response.statusCode === 401 || response.statusCode === 403) {
        logger.warn('authentication error.');
        account = null;
      }
    })
  ).pipe(res);
}

export function login(req: express.Request, res: express.Response, next: () => void): void {
  if (account) {
    next();
  } else {
    logger.info('drivelytics login.');
    requestC.post('http://oxford.uievolution.co.jp/login',
      (err: any, response: any, body: any) => {
        if (err) {
          logger.error('Error login: ' + err);
          res.send(500, err);
        } else if (response.statusCode !== 200) {
          logger.warn('Warning login: ' + response.statusCode);
          res.send(response.statusCode, body);
        } else {
          logger.info('Success login: ' + JSON.stringify(body));
          account = body.user;
          next();
        }
      }).form({
        username: config.drivelytics.email,
        password: config.drivelytics.password
      }).json(true);
  }
}

