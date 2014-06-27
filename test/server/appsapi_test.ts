///<reference path="../../def/node/node.d.ts" />
///<reference path="../../def/mocha/mocha.d.ts" />
///<reference path="../../def/types.d.ts" />

var assert = require('power-assert');
var asyncblock = require('asyncblock');
var http = require('http');
var request = require('supertest');

import utils = require('./test_utils');
import model = require('../../lib/server/model');
import main = require('../../lib/server/app');

describe('Apps API', () => {

  describe('all apps set test', () => {
    var port = 3001;
    var app = main.app;
    var server = http.createServer(app);
    var req = null;

    before((done) => {
      asyncblock((flow: any) => {
        flow.sync(model.AppCategory.remove(flow.callback()));
        flow.sync(model.AppInfo.remove(flow.callback()));
        flow.sync(model.UserApp.remove(flow.callback()));

        flow.sync(addCategory(flow.callback(), 1, 'Entertainment'));
        flow.sync(addCategory(flow.callback(), 2, 'Local'));
        flow.sync(addCategory(flow.callback(), 3, 'Information'));
        flow.sync(addCategory(flow.callback(), 4, 'Communication'));
        flow.sync(addCategory(flow.callback(), 5, 'Driver Assist'));

        flow.sync(addAppInfo(flow.callback(), 'appid.musicplayer', 'Music Player', 'music_player', [1, 4], [1, 2, 3, 4, 45]));
        flow.sync(addAppInfo(flow.callback(), 'appid.cloudnavi', 'Cloud Navi', 'clound_navi', [5], [1, 2, 3, 4, 50]));
        flow.sync(addAppInfo(flow.callback(), 'appid.localsearch', 'Local Search', 'local_search', [2, 3], [1, 2, 3, 4, 40]));
        flow.sync(addAppInfo(flow.callback(), 'appid.destination', 'eDestination', 'e_destination', [5], [1, 2, 3, 4, 22]));
        flow.sync(addAppInfo(flow.callback(), 'appid.parking', 'Parking Info', 'parking_info', [2, 4, 5], [1, 2, 3, 4, 20]));
        flow.sync(addAppInfo(flow.callback(), 'appid.traffic', 'Traffic Info', 'traffic_info', [2, 5], [1, 2, 3, 4, 30]));
        flow.sync(addAppInfo(flow.callback(), 'appid.news', 'News', 'news', [3], [1, 2, 3, 4, 25]));
        flow.sync(addAppInfo(flow.callback(), 'appid.weather', 'Weather', 'weather', [2, 3], [1, 2, 3, 4, 24]));
        flow.sync(addAppInfo(flow.callback(), 'appid.stock', 'Stock Info', 'stock_info', [3], [1, 2, 3, 4, 18]));
        flow.sync(addAppInfo(flow.callback(), 'appid.fuelprice', 'Fuel/Price', 'fuel_price', [2, 5], [1, 2, 3, 4, 17]));
        flow.sync(addAppInfo(flow.callback(), 'appid.calendar', 'Calendar', 'calendar', [3], [1, 2, 3, 4, 16]));
        flow.sync(addAppInfo(flow.callback(), 'appid.websearch', 'Web Search', 'web_search', [2, 3], [1, 2, 3, 4, 15]));
        flow.sync(addAppInfo(flow.callback(), 'appid.sns', 'SNS', 'sns', [1, 2, 4], [1, 2, 3, 4, 14]));
        flow.sync(addAppInfo(flow.callback(), 'appid.message', 'Message', 'message', [1, 4], [1, 2, 3, 4, 13]));
        flow.sync(addAppInfo(flow.callback(), 'appid.telephone', 'Telephone', 'telephone', [4], [1, 2, 3, 4, 12]));
        flow.sync(addAppInfo(flow.callback(), 'appid.voice', 'Voice Control', 'voice_control', [1, 2, 3, 5], [1, 2, 3, 4, 11]));
        flow.sync(addAppInfo(flow.callback(), 'appid.vehicle', 'Vehicle Info', 'vehicle_info', [5], [1, 2, 3, 4, 10]));
        flow.sync(addAppInfo(flow.callback(), 'appid.maintenance', 'Remote Maintenance', 'remote_maintenance', [5], [1, 2, 3, 4, 9]));
        flow.sync(addAppInfo(flow.callback(), 'appid.helpdesk', 'Help Desk', 'help_desk', [5], [1, 2, 3, 4, 8]));
        flow.sync(addAppInfo(flow.callback(), 'appid.security', 'Security Service', 'security_service', [5], [1, 2, 3, 4, 7]));
        flow.sync(addAppInfo(flow.callback(), 'appid.operator', 'Operator Service', 'security_service', [2, 5], [1, 2, 3, 4, 6]));
        flow.sync(addAppInfo(flow.callback(), 'appid.manual', 'Owner\'s Manual', 'owners_manual', [5], [1, 2, 3, 4, 5]));

        flow.sync(server.listen(port, flow.callback()));
        req = request.agent(app);
        done();
      });
    });
    after(() => {
      req = null;
      server.close();
    });


    function addCategory(callback: () => void, id: number, name: string) {
      var cat = new model.AppCategory({
        _id: '' + id,
        name: name
      });
      cat.save(callback);
    }
    function addAppInfo(callback: () => void, appid: string, displayName: string, icon: string, categories: number[], reviewCount: number[], fee?: string) {
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
        categories: categories,
        review: {
          count: reviewCount
        }
      });
      info.save(callback);
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
    function get_appstore_list(flow): bws.IAppCategory[] {
      var get = flow.sync(req
        .get('/api/appstore/list')
        .type('json')
        .expect(200)
        .end(flow.callback()));
      return get.body;
    }
    function get_appinfo(flow, appid: string): bws.IAppInfo {
      var get = flow.sync(req
        .get('/api/appinfo/' + appid)
        .type('json')
        .expect(200)
        .end(flow.callback()));
      return get.body;
    }
    function get_install(flow, appid: string) {
      var get = flow.sync(req
        .get('/api/userapps/install/' + appid)
        .type('json')
        .expect(200)
        .end(flow.callback()));
      return get.body;
    }
    function add_install(flow, appid: string, status = 200) {
      var cookie = utils.get_cookie(req, flow);
      var csrf = utils.get_csrf_token(cookie);
      var get = flow.sync(req
        .post('/api/userapps/install/' + appid)
        .set('x-csrf-token', csrf)
        .type('json')
        .send({})
        .expect(status)
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

    it('appstore list test', (done) => {
      asyncblock((flow) => {
        add_install(flow, 'appid.musicplayer', 404);
        assert.equal(true, put_myapps(flow, {apps:[]}).result);

        var list = get_appstore_list(flow);
        assert.equal(5, list.length);
        assert.equal("Entertainment", list[0].name);
        assert.equal("Local", list[1].name);
        assert.equal("Information", list[2].name);
        assert.equal("Communication", list[3].name);
        assert.equal("Driver Assist", list[4].name);

        var items = list[0].items;
        assert.equal(4, items.length);
        assert.equal('appid.musicplayer', items[0].appid);
        assert.equal(false, items[0].installed);
        assert.equal('appid.sns', items[1].appid);
        assert.equal(false, items[1].installed);
        assert.equal('appid.message', items[2].appid);
        assert.equal(false, items[2].installed);
        assert.equal('appid.voice', items[3].appid);
        assert.equal(false, items[3].installed);

        var items = list[1].items;
        assert.equal(9, items.length);
        assert.equal('appid.localsearch', items[0].appid);
        assert.equal(4.6, items[0].review);
        assert.equal(false, items[0].installed);
        assert.equal('appid.traffic', items[1].appid);
        assert.equal(4.5, items[1].review);


        assert.equal(true, add_install(flow, 'appid.musicplayer').result);
        assert.equal(true, add_install(flow, 'appid.message').result);

        var list = get_appstore_list(flow);
        assert.equal(5, list.length);
        var items = list[0].items;
        assert.equal(4, items.length);
        assert.equal('appid.musicplayer', items[0].appid);
        assert.equal(true, items[0].installed);
        assert.equal('appid.sns', items[1].appid);
        assert.equal(false, items[1].installed);
        assert.equal('appid.message', items[2].appid);
        assert.equal(true, items[2].installed);
        assert.equal('appid.voice', items[3].appid);
        assert.equal(false, items[3].installed);

        var musicplayer = get_appinfo(flow, items[0].appid);
        assert.ok(musicplayer != null);
        assert.equal('Music Player', musicplayer.displayName);
        assert.equal(true, musicplayer.installed);

        var sns = get_appinfo(flow, items[1].appid);
        assert.ok(sns != null);
        assert.equal('SNS', sns.displayName);
        assert.equal(false, sns.installed);

        done();
      });
    })

  });

});

