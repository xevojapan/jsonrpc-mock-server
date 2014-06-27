///<reference path="../../../def/node/node.d.ts" />
///<reference path="../../../def/express/express.d.ts" />
///<reference path="../../../def/types.d.ts" />

import express = require('express');
import model = require('../model');
import utils = require('../utils');

var asyncblock = require('asyncblock');
var log4js = require("log4js");
var config = require("config");

var logger = log4js.getLogger('server');


export function getAppInfo(req: express.Request, res: express.Response, next: () => void): void {
  var id = req.param('appid');

  logger.info('getAppInfo: appid=%s', id);

  asyncblock((flow: any) => {
    flow.errorCollback = (err:any) => {
      logger.error('getAppInfo error: ' + err, err);
      res.send(500, err.toString());
    };

    var userapps: model.IUserApp = flow.sync(model.UserApp.findById(utils.userid, {apps: 1}, flow.callback()));
    var info = flow.sync(model.AppInfo.findById(id)
      .populate('categories')
      .exec(flow.callback()));
    if (info) {
      var result: bws.IAppInfo = info.toObject();
      if (result) {
        result.installed = checkInstall(userapps, info.appid);
      }
    }
    logger.debug('getAppInfo success: %s', result ? result.displayName : 'not found');
    res.json(result);
  });
}


export function getAppstoreList(req: express.Request, res: express.Response, next: () => void): void {
  logger.info('getAppstoreList');

  asyncblock((flow: any) => {
    flow.errorCollback = (err: any) => {
      logger.error('getAppstoreList error: ' + err, err);
      res.send(500, err.toString());
    };

    var userapps: model.IUserApp = flow.sync(model.UserApp.findById(utils.userid, {apps: 1}, flow.callback()));
    var category: model.IAppCategory[] = flow.sync(model.AppCategory.find(flow.callback()));
    var categoryMap: {[index: number]: bws.IAppCategory} = {};
    category.forEach((c: bws.IAppCategory) => {
      categoryMap[c.categoryId] = {
        categoryId: c.categoryId,
        name: c.name,
        iconUrl: c.iconUrl
      };
    });

    var infos: model.IAppInfo[] = flow.sync(model.AppInfo.find({}, {appid: 1, displayName: 1, iconUrl: 1, fee: 1, categories: 1, 'review.count': 1}, flow.callback()));
    infos.forEach((info) => {
      var item = {
        appid: info.appid,
        displayName: info.displayName,
        iconUrl: info.iconUrl,
        fee: info.fee,
        review: calcReview(info.review.count),
        installed: checkInstall(userapps, info.appid)
      };
      info.categories.forEach((categoryId) => {
        var c = categoryMap[categoryId];
        if (!c.items) {
          c.items = [];
        }
        c.items.push(item);
      });
    });
    res.json(sortResult(categoryMap));
  });
}
function calcReview(reviewCount: number[]): number {
  var sum = 0;
  var count = 0;
  reviewCount.forEach((n, i) => {
    count += n;
    sum += (i + 1) * n;
  });
  return sum / count;
}
function sortResult(map: {[index: number]: bws.IAppCategory}): bws.IAppCategory[] {
  var work: any[][] = [];
  for (var key in map) {
    var category = map[key];
    if (category.items) {
      category.items.sort((a, b) => {
        return b['review'] - a['review'];
      });
      work.push([key, category]);
    }
  }
  work.sort((a, b) => {
    return a[0] - b[0];
  });
  var result: bws.IAppCategory[] = [];
  for (var i = 0, len = work.length; i < len; ++i) {
    result.push(work[i][1]);
  }
  return result;
}

function checkInstall(userapps: model.IUserApp, appid: string): boolean {
  if (!userapps || !userapps.apps) return false;
  return userapps.apps.indexOf(appid) >= 0;
}

