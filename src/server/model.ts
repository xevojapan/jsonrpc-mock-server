///<reference path="../../def/node/node.d.ts" />
///<reference path="../../def/mongoose/mongoose.d.ts" />
///<reference path="../../def/types.d.ts" />

import mongoose = require('mongoose');

var util = require('util');
var conf = require('config');
var crypto = require('crypto');

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


var UserProfileSchema = new Schema({
  provider: { type: String, required: true, enum: ['email', 'facebook', 'google', 'twitter'] },
  userid: { type: String, required: true },
  username: String,
  email: String,
  imageUrl: String,
  password: {
    salt: String,
    hash: String,
    expire: Date
  },
  emailVerified: { type: Boolean, default: false }
});

export interface IUserMaster extends mongoose.Document, bws.IUserMaster {
}
var UserMasterSchema = new Schema({
  username: String,
  email: String,
  imageUrl: String,
  lastLogin: Date,
  auths: [UserProfileSchema]
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
UserMasterSchema.virtual('userid')
  .get(function() {
    return this._id;
  });
UserMasterSchema.index({
  "auths.provider": 1,
  "auths.userid": 1
});


export interface IAuthToken extends mongoose.Document, bws.IAuthToken {
}
var AuthTokenSchema = new Schema({
  _id: { type: String, required: true, index: true, unique: true },
  userId: { type: String, required: true, ref: 'user_master' },
  vehicleId: String,
  pinNumber: String,
  expire: Date,
  lastLogin: Date
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
AuthTokenSchema.virtual('token')
  .get(function() {
    return this._id;
  });


export interface IAppCategory extends mongoose.Document {
  categoryId: number;
  name: string;
  iconUrl: string;
}
var AppCategorySchema = new Schema({
  _id: { type: Number, required: true, index: true, unique: true },
  name: { type: String, required: true },
  iconUrl: { type: String }
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
AppCategorySchema.virtual('categoryId')
  .get(function() {
    return this._id;
  });

export interface IAppInfo extends mongoose.Document, bws.IAppInfo {
}
var ReviewCommentSchema = new Schema({
  username: { type: String, required: true },
  rate: { type: Number, required: true, min: 1, max: 5 },
  date: { type: Date, default: Date.now() },
  comment: { type: String, default: '' }
});
var AppInfoSchema = new Schema({
  _id: { type: String, required: true, index: true, unique: true },
  displayName: { type: String, required: true },
  iconUrl: {
    small: { type: String },
    medium: { type: String },
    large: { type: String }
  },
  seller: { type: String, required: true },
  fee: { type: String, default: 'free' },
  description: { type: String, default: '' },
  categories: { type: [Number] },
  screenShotURLs: { type: [String] },
  versionHistory: [{
    version: { type: String, required: true },
    released: { type: Date, required: true },
    description: { type: String, default: '' }
  }],
  review: {
    count: { type: [Number], required: true },
    latest: { type: [ReviewCommentSchema] },
    comments: { type: [ReviewCommentSchema] }
  }
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
AppInfoSchema.virtual('appid')
  .get(function() {
    return this._id;
  });


export interface IUserApp extends mongoose.Document {
  userid: string;
  apps: string[];
  last_updated: Date;
}
var UserAppSchema = new Schema({
  _id: { type: String, required: true, index: true, unique: true },
  apps: [{ type: String, required: true, index: true, ref: 'app_info' }],
  last_updated: { type: Date, default: Date.now() }
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
UserAppSchema.virtual('userid')
  .get(function() {
    return this._id;
  });


export interface INewsData extends mongoose.Document, bws.INewsData {
}
var NewsDataSchema = new Schema({
  title: { type: String, required: true },
  time: { type: String, required: true },
  detail: [{ type: String }],
  imageUrl: { type: String }
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});


export var UserMaster = db.model<IUserMaster>('user_master', UserMasterSchema);
export var AuthToken = db.model<IAuthToken>('auth_token', AuthTokenSchema);
export var AppCategory = db.model<IAppCategory>('app_category', AppCategorySchema);
export var AppInfo = db.model<IAppInfo>('app_info', AppInfoSchema);
export var UserApp = db.model<IUserApp>('user_app', UserAppSchema);
export var NewsData = db.model<INewsData>('news_data', NewsDataSchema);

