///<reference path="../../def/node/node.d.ts" />
///<reference path="../../def/mongoose/mongoose.d.ts" />
///<reference path="../../def/types.d.ts" />

import mongoose = require('mongoose');

var util = require('util');
var conf = require('config');

var Schema = mongoose.Schema;
var connectionStr = util.format('mongodb://%s:%s@%s/%s?poolSize=%d',
    conf.mongodb.username,
    conf.mongodb.password,
    conf.mongodb.hostname,
    conf.mongodb.database,
    conf.mongodb.poolSize);
var db = mongoose.createConnection(connectionStr, (err: any) => {
  if (err) {
    console.log('MongoDB Connection Error: %s', err.toString());
    process.nextTick(() => {
      process.exit(1);
    });
  } else {
    console.log('MongoDB Connection Success.');
  }
});


export interface IJsonRpcMethod extends mongoose.Document, jrpc.IJsonRpcMethod {
}
var JsonRpcMethodSchema = new Schema({
  _id: { type: String, required: true },
  isError: { type: Boolean, required: true },
  error: {
    code: Number,
    message: String,
    data: Object
  },
  result: Object
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
JsonRpcMethodSchema.virtual('name')
  .get(function() {
    return this._id;
  });


export var JsonRpcMethod = db.model<IJsonRpcMethod>('jsonRpcMethod', JsonRpcMethodSchema);

