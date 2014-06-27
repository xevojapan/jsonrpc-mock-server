///<reference path="../../../def/node/node.d.ts" />
///<reference path="../../../def/express/express.d.ts" />
///<reference path="../../../def/moment/moment.d.ts" />

import express = require('express');
import model = require('../model');
import utils = require('../utils');

var util = require('util');
var asyncblock = require('asyncblock');
var moment = require('moment');
var log4js = require("log4js");
var config = require("config");


var logger = log4js.getLogger('server');


export function getMyApps(req: express.Request, res: express.Response, next: () => void): void {
  logger.info('getMyApps: userid=%s', utils.userid);

  model.UserApp.findById(utils.userid)
    .populate('apps', 'appid displayName iconUrl')
    .exec((err: any, data: model.IUserApp): void => {
      if (err) {
        logger.error('getMyApps error: ' + err, err);
        res.send(500, err.toString());
      } else if (!data) {
        logger.warn(utils.userid + ' is not found.');
        res.send(404, utils.userid + ' is not found.');
      } else {
        logger.debug('getMyApps success: %s', data.last_updated);
        res.json(data);
      }
    });
}

export function updateMyApps(req: express.Request, res: express.Response, next: () => void): void {
  var body = req.body;
  if (!body || !body.apps || !util.isArray(body.apps)) {
    logger.warn('updateMyApps no data.');
    res.send(400, 'required post body.');
    return;
  }

  logger.info('updateMyApps: %s', JSON.stringify(body.apps));

  model.UserApp.findByIdAndUpdate(utils.userid,
    {
      $set: {
        apps: body.apps,
        last_updated: new Date()
      }
    },
    { upsert: true },
    (err: any): void => {
      if (err) {
        logger.error('updateMyApps error: ' + err, err);
        res.send(500, err.toString());
      } else {
        logger.debug('updateMyApps success.');
        res.json({ result: true });
      }
    });
}

export function checkInstallApps(req: express.Request, res: express.Response, next: () => void): void {
  var appid = req.param('appid');
  if (!appid) {
    logger.warn('checkInstallApps no appid.');
    res.send(400, 'required appid.');
    return;
  }

  logger.info('checkInstallApps: appid=%s', appid);

  model.UserApp.find(
    {
      _id: utils.userid,
      apps: appid
    },
    (err: any, data: model.IUserApp[]) => {
      if (err) {
        logger.error('checkInstallApps error: ' + err, err);
        res.send(500, err.toString());
      } else {
        logger.debug('checkInstallApps success: %s', data.length);
        res.json({ result: data.length > 0 });
      }
    });
}

export function addMyApps(req: express.Request, res: express.Response, next: () => void): void {
  var appid = req.param('appid');
  if (!appid) {
    logger.warn('addMyApps no appid.');
    res.send(400, 'required appid.');
    return;
  }

  logger.info('addMyApps: appid=%s', appid);

  asyncblock((flow: any) => {
    flow.errorCollback = (err: any) => {
      logger.error('addMyApps error: ' + err, err);
      res.send(500, err.toString());
    };

    var data: model.IUserApp = flow.sync(model.UserApp.findById(utils.userid, flow.callback()));
    if (!data) {
      logger.warn(utils.userid + ' is not found.');
      res.send(404, utils.userid + ' is not found.');
      return;
    }

    if (data.apps.indexOf(appid) >= 0) {
      res.json({ result: false });
      return;
    }

    data.apps.push(appid);
    flow.sync(data.save(flow.callback()));
    res.json({ result: true });
  });
}

export function removeMyApps(req: express.Request, res: express.Response, next: () => void): void {
  var appid = req.param('appid');
  if (!appid) {
    logger.warn('removeMyApps no appid.');
    res.send(400, 'required appid.');
    return;
  }

  logger.info('removeMyApps: appid=%s', appid);

  asyncblock((flow: any) => {
    flow.errorCollback = (err: any) => {
      logger.error('removeMyApps error: ' + err, err);
      res.send(500, err.toString());
    };

    var data: model.IUserApp = flow.sync(model.UserApp.findById(utils.userid, flow.callback()));
    if (!data) {
      logger.warn(utils.userid + ' is not found.');
      res.send(404, utils.userid + ' is not found.');
      return;
    }

    var index = data.apps.indexOf(appid);
    if (index < 0) {
      res.json({ result: false });
      return;
    }

    data.apps.splice(index, 1);
    flow.sync(data.save(flow.callback()));
    res.json({ result: true });
  });
}



