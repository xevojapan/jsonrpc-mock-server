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

export function proxyGet(req: express.Request, res: express.Response, next: () => void): void {
  var path = req.url.substr('/api/rooney'.length);

  logger.info('rooney proxyGet: ' + path);
  var r = requestC.get({
    url: 'http://rooney-dev3.herokuapp.com' + path
  }, (err: any, response: any, body: any) => {
    if (response.statusCode === 401 || response.statusCode === 403) {
      logger.warn('authentication error.');
      account = null;
    }
  });
  req.pipe(r).pipe(res);
}
export function proxyPost(req: express.Request, res: express.Response, next: () => void): void {
  var path = req.url.substr('/api/rooney'.length);

  logger.info('rooney proxyPost: ' + path);
  var r = requestC.post({
    url: 'http://rooney-dev3.herokuapp.com' + path
  }, (err: any, response: any, body: any) => {
    if (response.statusCode === 401 || response.statusCode === 403) {
      logger.warn('authentication error.');
      account = null;
    }
  }).form(req.body).json(false);
  req.pipe(r).pipe(res);
}

export function login(req: express.Request, res: express.Response, next: () => void): void {
  if (account) {
    next();
  } else {
    logger.info('rooney login.');
    requestC.post('http://rooney-dev3.herokuapp.com/auth/login.xml',
      (err: any, response: any, body: any) => {
        if (err) {
          logger.error('Error login: ' + err);
          res.send(500, err);
        } else if (response.statusCode !== 200) {
          logger.warn('Warning login: ' + response.statusCode);
          res.send(response.statusCode, body);
        } else {
          logger.info('Success login: ' + body);
          account = body;
          next();
        }
      }).form({
        'user[username]': config.rooney.user,
        'user[password]': config.rooney.pass
      }).json(false);
  }
}

