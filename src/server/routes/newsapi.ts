///<reference path="../../../def/node/node.d.ts" />
///<reference path="../../../def/express/express.d.ts" />
///<reference path="../../../def/types.d.ts" />


import express = require('express');
import model = require('../model');
import utils = require('../utils');

var asyncblock = require('asyncblock');
var log4js = require("log4js");

var logger = log4js.getLogger('server');


export function getNewsList(req: express.Request, res: express.Response, next: () => void): void {
  logger.info('getNewsList.');

  model.NewsData.find({})
    .exec((err: any, data: model.INewsData[]) => {
      if (err) {
        logger.error('getNewsList error: ' + err, err);
        res.send(500, err.toString());
      } else {
        logger.debug('getNewsList success: ' + (data != null ? data.length : -1));
        res.send(data);
      }
    });
}

export function rpcGetNewsList(callback: (err: any, res: model.INewsData[]) => void): void {
  logger.info('rcpGetNewsList.');

  model.NewsData.find({}, callback);
}

