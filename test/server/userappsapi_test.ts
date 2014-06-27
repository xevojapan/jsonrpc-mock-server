///<reference path="../../def/node/node.d.ts" />
///<reference path="../../def/mocha/mocha.d.ts" />

var assert = require('power-assert');
var asyncblock = require('asyncblock');
var http = require('http');
var request = require('supertest');

import utils = require('./test_utils');
import model = require('../../lib/server/model');
import main = require('../../lib/server/app');

describe('UserApps API', () => {

  describe('myapps set test', () => {
    var port = 3001;
    var app = main.app;
    var server = http.createServer(app);
    var req = null;

    before((done) => {
      asyncblock((flow: any) => {
        flow.sync(model.AppCategory.remove(flow.callback()));
        flow.sync(model.AppInfo.remove(flow.callback()));
        flow.sync(model.UserApp.remove(flow.callback()));

        for (var i = 0; i < 16; ++i) {
          var id = i + 1;
          flow.sync(addAppInfo(flow.callback(), 'appid.' + id, 'App' + id, 'icon_app' + id, [id & 1, id & 2, id & 4, id & 8, id & 16]));
        }

        flow.sync(server.listen(port, flow.callback()));
        req = request.agent(app);
        done();
      });
    });
    after(() => {
      req = null;
      server.close();
    });

    function addAppInfo(callback: () => void, appid: string, displayName: string, icon: string, reviewCount: number[], fee?: string) {
      var info = new model.AppInfo({
        _id: appid,
        displayName: displayName,
        iconUrl: {
          small: '/static/img/apps_icon/appicon_' + icon + '_72x72.png',
          medium: '/static/img/apps_icon/appicon_' + icon + '_96x96.png',
          large: '/static/img/apps_icon/appicon_' + icon + '_192x192.png'
        },
        seller: 'UIEvolution K.K.',
        fee: fee || 'free',
        review: {
          count: reviewCount
        }
      });
      info.save(callback);
    }

    function get_myapps(flow, status = 200) {
      var get = flow.sync(req
        .get('/api/userapps/myapps')
        .type('json')
        .expect(status)
        .end(flow.callback()));
      return get.body;
    }
    function put_myapps(flow, data) {
      var cookie = utils.get_cookie(req, flow);
      var csrf = utils.get_csrf_token(cookie);
      var put = flow.sync(req
        .put('/api/userapps/myapps')
        .set('x-csrf-token', csrf)
        .type('json')
        .send(data)
        .expect(200)
        .end(flow.callback()));
      return put.body;
    }
    function get_install(flow, appid: string) {
      var get = flow.sync(req
        .get('/api/userapps/install/' + appid)
        .type('json')
        .expect(200)
        .end(flow.callback()));
      return get.body;
    }
    function add_install(flow, appid: string) {
      var cookie = utils.get_cookie(req, flow);
      var csrf = utils.get_csrf_token(cookie);
      var get = flow.sync(req
        .post('/api/userapps/install/' + appid)
        .set('x-csrf-token', csrf)
        .type('json')
        .send({})
        .expect(200)
        .end(flow.callback()));
      return get.body;
    }
    function del_install(flow, appid: string) {
      var cookie = utils.get_cookie(req, flow);
      var csrf = utils.get_csrf_token(cookie);
      var get = flow.sync(req
        .del('/api/userapps/install/' + appid)
        .set('x-csrf-token', csrf)
        .type('json')
        .send({})
        .expect(200)
        .end(flow.callback()));
      return get.body;
    }

    it('myapp update test', (done) => {
      var data = {
        apps: ['appid.1', 'appid.3', 'appid.2', 'appid.12']
      };

      asyncblock((flow) => {
        get_myapps(flow, 404);

        var res = put_myapps(flow, data);
        assert.equal(true, res.result);

        var myapps = get_myapps(flow);
        assert.ok(myapps.userid);
        assert.ok(myapps.last_updated);

        var apps = myapps.apps;
        assert.equal(4, apps.length);
        assert.equal('appid.1', apps[0].appid);
        assert.equal('App1', apps[0].displayName);
        assert.equal('/static/img/apps_icon/appicon_icon_app1_72x72.png', apps[0].iconUrl.small);
        assert.equal('/static/img/apps_icon/appicon_icon_app1_96x96.png', apps[0].iconUrl.medium);
        assert.equal('/static/img/apps_icon/appicon_icon_app1_192x192.png', apps[0].iconUrl.large);
        assert.equal('appid.3', apps[1].appid);
        assert.equal('App3', apps[1].displayName);
        assert.equal('appid.2', apps[2].appid);
        assert.equal('appid.12', apps[3].appid);

        done();
      });
    })
    it('apps install test', (done) => {
      var data = {
        apps: ['appid.1', 'appid.3', 'appid.2', 'appid.12']
      };

      asyncblock((flow) => {
        var res = put_myapps(flow, data);
        assert.equal(true, res.result);

        assert.equal(true, get_install(flow, 'appid.1').result);
        assert.equal(true, get_install(flow, 'appid.2').result);
        assert.equal(true, get_install(flow, 'appid.12').result);
        assert.equal(false, get_install(flow, 'appid.10').result);

        assert.equal(true, add_install(flow, 'appid.4').result);
        assert.equal(true, add_install(flow, 'appid.5').result);
        assert.equal(true, add_install(flow, 'appid.6').result);
        assert.equal(true, add_install(flow, 'appid.7').result);
        assert.equal(true, add_install(flow, 'appid.8').result);
        assert.equal(true, add_install(flow, 'appid.9').result);
        assert.equal(true, add_install(flow, 'appid.10').result);

        assert.equal(true, get_install(flow, 'appid.4').result);
        assert.equal(true, get_install(flow, 'appid.5').result);
        assert.equal(true, get_install(flow, 'appid.8').result);
        assert.equal(true, get_install(flow, 'appid.10').result);

        var myapps = get_myapps(flow);
        var apps = myapps.apps;
        assert.equal(11, apps.length);
        assert.equal('appid.1', apps[0].appid);
        assert.equal('appid.3', apps[1].appid);
        assert.equal('appid.2', apps[2].appid);
        assert.equal('appid.12', apps[3].appid);
        assert.equal('appid.4', apps[4].appid);
        assert.equal('appid.10', apps[10].appid);

        assert.equal(true, del_install(flow, 'appid.4').result);
        assert.equal(false, del_install(flow, 'appid.14').result);
        assert.equal(false, del_install(flow, 'appid.4').result);

        var myapps = get_myapps(flow);
        var apps = myapps.apps;
        assert.equal(10, apps.length);
        assert.equal('appid.5', apps[4].appid);
        assert.equal('appid.10', apps[9].appid);

        done();
      });
    })

  });

});

