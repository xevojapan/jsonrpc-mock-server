///<reference path="../../../def/node/node.d.ts" />
///<reference path="../../../def/express/express.d.ts" />
///<reference path="../../../def/mongoose/mongoose.d.ts" />
///<reference path="../../../def/types.d.ts" />

import express = require('express');
import mongoose = require('mongoose');
import model = require('../model');

var asyncblock = require('asyncblock');
var util = require('util');
var log4js = require("log4js");

var logger = log4js.getLogger('server');

export interface IRestApi {
  name: string;
  query(): express.Handler;
  get(): express.Handler;
  post(): express.Handler;
  put(): express.Handler;
  delete(): express.Handler;
}

export class RestApi<T extends mongoose.Document> implements IRestApi {
  constructor(private model: mongoose.Model<T>, public name: string) {}

  public query(): express.Handler {
    return (req: express.Request, res: express.Response): void => {
      logger.info(this.name + '_query.');
      this.model.find({})
        .exec((err: any, data: T[]) => {
          if (err) {
            logger.error(this.name + '_query error: ' + err, err);
            res.send(500, err.toString());
          } else {
            logger.debug(this.name + '_query count: %d', data == null ? -1 : data.length);
            res.json(data.map(x => x.toObject({virtuals: false})));
          }
        });
    };
  }
  public get(): express.Handler {
    return (req: express.Request, res: express.Response): void => {
      var id = req.param('id');
      logger.info(this.name + '_get id=%s', id);
      this.model.findById(id)
        .exec((err: any, data: T) => {
          if (err) {
            logger.error(this.name + '_get error: ' + err, err);
            res.send(500, err.toString());
          } else if (!data) {
            logger.warn(id + ' is not found.');
            res.send(404, id + ' is not found.');
          } else {
            logger.debug(this.name + '_get id: %s', id);
            res.json(data);
          }
        });
    };
  }
  public post(): express.Handler {
    return (req: express.Request, res: express.Response): void => {
      var body = req.body;
      if (!body) {
        logger.warn(this.name + '_post no data.');
        res.send(400, 'required post body.');
        return;
      }
      var replace = req.param('replace') === 'true';
      var data = util.isArray(body.array) ? body.array : [body];
      logger.info(this.name + '_post: %s, replace=%s', JSON.stringify(body), replace);
      asyncblock((flow: any) => {
        flow.errorCollback = (err: any) => {
          console.log('err: '+ err);
          logger.error(this.name + '_post error: ' + err, err);
          res.send(500, err.toString());
        };

        if (replace) {
          flow.sync(this.model.remove(flow.callback()));
        }
        data.forEach((row: T) => {
          var id = row._id;
          if (id) {
            delete row._id;
            flow.sync(this.model.findByIdAndUpdate(id, { $set: row }, { upsert: true }, flow.callback()));
          } else {
            flow.sync(new this.model(row).save(flow.callback()));
          }
        });
        logger.debug(this.name + '_post success.');
        res.json({ result: true });
      });
    };
  }
  public put(): express.Handler {
    return (req: express.Request, res: express.Response): void => {
      var id = req.param('id');
      var body = req.body;
      if (!body) {
        logger.warn(this.name + '_put no data.');
        res.send(400, 'required post body.');
        return;
      }
      logger.info(this.name + '_put id=%s, %s', id, JSON.stringify(body));
      this.model.findByIdAndUpdate(id, { $set: body }, { upsert: true })
        .exec((err: any, data: T) => {
          if (err) {
            logger.error(this.name + '_put error: ' + err, err);
            res.send(500, err.toString());
          } else if (!data) {
            logger.warn(id + ' is not found.');
            res.send(404, id + ' is not found.');
          } else {
            logger.debug(this.name + '_put id: %s', id);
            res.json({ result: true });
          }
        });
    };
  }
  public delete(): express.Handler {
    return (req: express.Request, res: express.Response): void => {
      var id = req.param('id');
      logger.info(this.name + '_delete id=', id);
      this.model.findByIdAndRemove(id)
        .exec((err: any, data: T) => {
          if (err) {
            logger.error(this.name + '_delete error: ' + err, err);
            res.send(500, err.toString());
          } else if (!data) {
            logger.warn(id + ' is not found.');
            res.send(404, id + ' is not found.');
          } else {
            logger.debug(this.name + '_delete id: %s', id);
            res.json({ result: true });
          }
        });
    };
  }
}

export function setRestApi(app: express.Application, path: string): void {
  var rests: IRestApi[] = [
    new RestApi(model.UserMaster, 'usermaster'),
    new RestApi(model.AuthToken, 'authtoken'),
    new RestApi(model.AppCategory, 'category'),
    new RestApi(model.AppInfo, 'appinfo'),
    new RestApi(model.UserApp, 'userapp'),
    new RestApi(model.NewsData, 'newsdata'),
  ];
  rests.forEach((api) => {
    app.get(path + api.name, api.query());
    app.get(path + api.name + '/:id', api.get());
    app.post(path + api.name, api.post());
    app.post(path + api.name + '/:id', api.put());
    app.put(path + api.name + '/:id', api.put());
    app.delete(path + api.name + '/:id', api.delete());
  });
}

