///<reference path="../../../def/node/node.d.ts" />
///<reference path="../../../def/express/express.d.ts" />
///<reference path="../../../def/passport/passport.d.ts" />
///<reference path="../../../def/moment/moment.d.ts" />
///<reference path="../../../def/types.d.ts" />

var util = require('util');
var asyncblock = require('asyncblock');
var log4js = require('log4js');
var config = require("config");
var crypto = require('crypto');
var randtoken = require('rand-token').generator({
  chars: 'abcdefghijklmnopqrstuvwxyz234567',  // base32
  source: crypto.randomBytes
});

import express = require('express');
import moment = require('moment');
import passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var AuthTokenStrategy = require('passport-authtoken').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

import model = require('../model');

var logger = log4js.getLogger('server');


export function getUserInfo(req: express.Request, res: express.Response): void {
  logger.info('getUserInfo: ' + JSON.stringify(req.user));
  if (!req.isAuthenticated()) {
    res.send(401, { error: 'not logged in' });
    return;
  }
  var profile = convertProfile(req.user);
  res.json(profile);
}

export function registerUser(req: express.Request, res: express.Response): void {
  var email = req.param('email');
  if (!email) {
    res.json(400, { result: false, message: 'email is required.' });
    return;
  }
  var pass = req.param('password');
  if (!pass) {
    res.json(400, { result: false, message: 'password is required.' });
    return;
  }
  var username = req.param('username');
  if (!username) {
    res.json(400, { result: false, message: 'username is required.' });
    return;
  }
  var imageUrl = req.param('imageurl');

  logger.info('registerUser: email=' + email + ', username=' + username + ', imageUrl=' + imageUrl);

  asyncblock((flow: any) => {
    flow.errorCallback = (err: any) => {
      logger.error('registerUser: error.', err);
      res.json(500, { result: false, message: 'Error: ' + err });
      return;
    };

    var exists = flow.sync(model.UserMaster.findOne({ auths: { $elemMatch: { provider: 'email', userid: email } } }, flow.callback()));
    if (exists) {
      res.json(400, { result: false, message: 'this email address is registered.' });
      return;
    }

    var user: bws.IUserProfile = {
      provider: 'email',
      userid: email,
      email: email,
      username: username,
      imageUrl: imageUrl,

      // TODO implement email verification
      //emailVerified: false
      emailVerified: true
    };
    flow.sync(setPassword(user, pass, flow.callback()));
    if (req.user) {
      var master: model.IUserMaster = req.user;
      master.auths.push(user);
    } else {
      var master = new model.UserMaster({
        username: username,
        imageUrl: imageUrl,
        email: email,
        auths: [ user ]
      });
    }
    flow.sync(master.save(flow.callback()));
    res.json({ result: true });
  });
}

function setPassword(user: bws.IUserProfile, password: string, callback: (err: any) => void): void {
  crypto.randomBytes(128, (err: any, buf: Buffer) => {
    if (err) {
      return callback(err);
    }
    var salt = buf.toString('base64');
    crypto.pbkdf2(password, salt, 10000, 512, (err: any, res: string) => {
      if (err) {
        return callback(err);
      }
      user.password = {
        hash: res,
        salt: salt
      };
      return callback(null);
    });
  });
}
function verifyPassword(user: bws.IUserProfile, password: string, callback: (err: any, result: boolean) => void): void {
  var hash = user.password.hash;
  crypto.pbkdf2(password, user.password.salt, 10000, 512, (err: any, res: string) => {
    callback(err, res == hash);
  });
}

export function updateUserProfile(req: express.Request, res: express.Response): void {
  if (!req.isAuthenticated()) {
    res.json(401, { result: false, message: 'login required.' });
  }
  var username = req.param('username');
  var imageUrl = req.param('imageurl');
  if (!username && !imageUrl) {
    res.json(400, { result: false, message: 'username or imageUrl are required.' });
    return;
  }

  logger.info('updateUserProfile: username=' + username + ', imageUrl=' + imageUrl);

  var user: model.IUserMaster = req.user;
  if (username) {
    user.username = username;
  }
  if (imageUrl) {
    user.imageUrl = imageUrl;
  }
  user.save((err: any) => {
    if (err) {
      res.json(500, { result: false, message: 'Error: ' + err });
    } else {
      res.json({ result: true });
    }
  });
}

export function publishAuthToken(req: express.Request, res: express.Response): void {
  if (!req.isAuthenticated()) {
    res.json(401, { result: false, message: 'login required.' });
  }
  var vid = req.param('vid');
  if (!vid) {
    res.json(400, { result: false, message: 'vid is required.' });
    return;
  }
  var pin = req.param('pin');

  logger.info('publishAuthToken: pin=' + pin + ', vid=' + vid);

  var token = randtoken.generate(16);
  var auth = new model.AuthToken({
    userId: req.user.id,
    token: token,
    vehicleId: vid,
    pinNumber: pin
  });
  auth.save((err: any) => {
    if (err) {
      res.json(500, { result: false, message: 'Error: ' + err });
    } else {
      res.json({ result: true, token: token });
    }
  });
}


export function setPassportRoute(app: express.Application): void {
  initPassport(config.auth.callbackHostname);

  function authenticate(strategy: string): express.Handler {
    return (req: express.Request, res: express.Response, next: (err: any) => void) => {
      passport.authenticate(strategy, (err: any, user: model.IUserMaster, info: { message: string; }): void => {
        logger.debug('end authenticate: ' + strategy + ', id=' + (user ? user.userid : undefined));
        if (err) {
          return next(err);
        }
        if (!user) {
          res.json(401, { result: false, message: info.message });
          return;
        }
        req.login(user, (err: any) => {
          if (err) return next(err);
          res.json({
            result: true,
            user: convertProfile(user)
          });
        });
      })(req, res, next);
    };
  }

  app.post('/auth/login', authenticate('local'));
  app.post('/auth/token', authenticate('authtoken'));

  app.get('/auth/facebook', passport.authenticate('facebook'));
  app.get('/auth/facebook/callback', authenticate('facebook'));

  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback', authenticate('twitter'));

  app.get('/auth/google',
      passport.authenticate('google', { scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ] }));
  app.get('/auth/google/callback', authenticate('google'));

  app.post('/auth/logout', logout);
  app.post('/auth/register', registerUser);
  app.post('/auth/updateuser', updateUserProfile);
  app.post('/auth/publishtoken', publishAuthToken);
}

export function logout(req: express.Request, res: express.Response): void {
  logger.info('logout.');
  req.logout();
  res.json({ result: true });
}

function initPassport(basepath: string): void {
  passport.serializeUser((user: model.IUserMaster, done: (err: any, id: string) => void) => {
    done(null, user._id);
  });
  passport.deserializeUser((id: string, done: (err: any, user: bws.IUserMaster) => void) => {
    model.UserMaster.findById(id,
      (err: any, result: model.IUserMaster) => {
        if (err) {
          done(err, null);
        } else {
          done(null, result);
        }
      });
  });

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password'
    },
    function(email: string, password: string, done: (err: any, res: model.IUserMaster, info?: { message: string; }) => void): void {
      logger.debug('local auth called: email=' + email + ', password=' + password);
      asyncblock((flow: any) => {
        flow.errorCallback = (err: any) => {
          logger.error('local auth: error callback: ' + email, err);
          return done(err, null, { message: err.toString() });
        };

        logger.debug('local auth: query user: ' + email);
        var data: model.IUserMaster = flow.sync(
          model.UserMaster.findOne(
            {
              auths: {
                $elemMatch: {
                  provider: 'email',
                  userid: email
                }
              }
            },
            flow.callback()));
        if (!data) {
          logger.warn('local auth: user is not found: ' + email);
          return done(null, null, { message: 'user not found.' });
        }
        var emailAuths = data.auths.filter((x) => x.provider === 'email');
        if (emailAuths.length === 0) {
          logger.warn('local auth: user is not found: ' + email);
          return done(null, null, { message: 'user not found.' });
        }
        var auth = emailAuths[0];
        if (!auth.emailVerified) {
          logger.warn('local auth: email is not verified: ' + email);
          return done(null, null, { message: 'email is not verified.' });
        }

        logger.debug('local auth: check password: ' + email);
        var verified: boolean = flow.sync(verifyPassword(auth, password, flow.callback()));
        if (!verified) {
          logger.warn('local auth: password is not matched: ' + email);
          return done(null, null, { message: 'password is not matched.' });
        }

        data.lastLogin = new Date();
        flow.sync(data.save(flow.callback()));
        logger.info('local auth: Authentication OK.');
        return done(null, data);
      });
    }
  ));

  passport.use(new AuthTokenStrategy({
      authtokenField: 'token',
      checkFields: ['pinNumber', 'vid']
    },
    function(token: string, pinNumber: string, vid: string, done: (err: any, res: model.IUserMaster, info?: { message: string; }) => void): void {
      logger.debug('auth token called: token=' + token + ', pinNumber=' + pinNumber + ', vid=' + vid);
      asyncblock((flow: any) => {
        flow.errorCallback = (err: any) => {
          logger.error('auth token: Error callback: ' + token, err);
          return done(err, null);
        };

        var auth: model.IAuthToken = flow.sync(model.AuthToken.findById(token, flow.callback()));
        if (!auth) {
          logger.warn('auth token: token is not found: ' + token);
          return done(null, null);
        }

        if (auth.expire && auth.expire < new Date()) {
          logger.warn('auth token: auth token is expired: ' + auth.expire);
        }
        if (auth.vehicleId != vid) {
          logger.warn('auth token: vehicle id is not matched: ' + auth.vehicleId);
          return done(null, null);
        }
        if (auth.pinNumber && auth.pinNumber != pinNumber) {
          logger.warn('auth token: pin number id is not matched: ' + auth.pinNumber);
          return done(null, null);
        }

        var data: model.IUserMaster = flow.sync(model.UserMaster.findById(auth.userId, flow.callback()));
        if (!data) {
          logger.warn('auth token: user is not found: ' + auth.userId);
          return done(null, null);
        }

        auth.lastLogin = new Date();
        flow.sync(auth.save(flow.callback()));
        logger.info('auth token: Authentication OK.');
        return done(null, data);
      });
    }
  ));

  passport.use(new FacebookStrategy({
      clientID: config.auth.facebook.clientID,
      clientSecret: config.auth.facebook.clientSecret,
      callbackURL: callbackUrl('facebook'),
      passReqToCallback: true
    }, receiveAuth('facebook')
  ));
  passport.use(new TwitterStrategy({
      consumerKey: config.auth.twitter.clientID,
      consumerSecret: config.auth.twitter.clientSecret,
      callbackURL: callbackUrl('twitter'),
      passReqToCallback: true
    }, receiveAuth('twitter')
  ));
  passport.use(new GoogleStrategy({
      clientID: config.auth.google.clientID,
      clientSecret: config.auth.google.clientSecret,
      callbackURL: callbackUrl('google'),
      passReqToCallback: true
    }, receiveAuth('google')
  ));

  function callbackUrl(service: string): string {
    return util.format('%s/auth/%s/callback', basepath, service);
  }
  function receiveAuth(service: string): Function {
    return (req: express.Request, token: string, tokenSecret: string, profile: passport.Profile, done: (err: any, res: model.IUserMaster) => void) => {
      logger.info(service + ' auth result:' + profile.displayName);
      //logger.debug(profile);
      asyncblock((flow: any) => {
        flow.errorCallback = (err: any) => {
          logger.error(' auth error: ' + err);
          done(err, null);
        };

        var data = convertToProfile(profile);
        var cond = {
          auths: {
            $elemMatch: {
              provider: data.provider,
              userid: data.userid
            }
          }
        };
        var user = flow.sync(model.UserMaster.findOne(cond, flow.callback()));
        if (user) {
          user.lastLogin = new Date();
        } else  if (req.user) {
          user = req.user;
          user.auths.push(data);
        } else {
          user = new model.UserMaster({
            userid: data.userid,
            username: data.username,
            email: data.email,
            imageUrl: data.imageUrl,
            auths: [data]
          });
        }
        flow.sync(user.save(flow.callback()));
        return done(null, user);
      });
    };
  }
  function convertToProfile(profile: passport.Profile): bws.IUserProfile {
    return {
      provider: profile.provider,
      userid: profile.id,
      username: profile.displayName || '',
      email: profile.emails ? profile.emails[0].value : '',
      imageUrl: profile.photos ? profile.photos[0].value : ''
    };
  }

}

function convertProfile(user: bws.IUserMaster): Object {
  return {
    userid: user.userid,
    username: user.username,
    email: user.email,
    imageUrl: user.imageUrl,
    lastLogin: user.lastLogin
  };
}

