///<reference path="../../def/node/node.d.ts" />
///<reference path="../../def/mocha/mocha.d.ts" />
///<reference path="../../def/types.d.ts" />
require('source-map-support').install();

var assert = require('power-assert');
var asyncblock = require('asyncblock');
var http = require('http');
var request = require('supertest');

import utils = require('./test_utils');
import model = require('../../lib/server/model');
import main = require('../../lib/server/app');

describe('Admin API', () => {
  var port = 3001;
  var app = main.app;
  var server = http.createServer(app);
  var req = null;

  before((done) => {
    asyncblock((flow: any) => {
      flow.sync(model.AppCategory.remove(flow.callback()));
      flow.sync(server.listen(port, flow.callback()));
      req = request.agent(app);
      done();
    });
  });
  after(() => {
    req = null;
    server.close();
  });


  describe('AppCategory test', () => {

    function query_category(flow) {
      var get = flow.sync(req
        .get('/api/admin/category')
        .type('json')
        .expect(200)
        .end(flow.callback()));
      return get.body;
    }
    function get_category(flow, id, status = 200) {
      var get = flow.sync(req
        .get('/api/admin/category/' + id)
        .type('json')
        .expect(status)
        .end(flow.callback()));
      return get.body;
    }
    function post_category(flow, data, replace = false, status = 200) {
      var cookie = utils.get_cookie(req, flow);
      var csrf = utils.get_csrf_token(cookie);
      var post = flow.sync(req
        .post('/api/admin/category?replace=' + replace)
        .set('x-xsrf-token', csrf)
        .type('json')
        .send(data)
        .expect(status)
        .end(flow.callback()));
      return post.body;
    }
    function put_category(flow, id, data, status = 200) {
      var cookie = utils.get_cookie(req, flow);
      var csrf = utils.get_csrf_token(cookie);
      var put = flow.sync(req
        .put('/api/admin/category/' + id)
        .set('x-xsrf-token', csrf)
        .type('json')
        .send(data)
        .expect(status)
        .end(flow.callback()));
      return put.body;
    }
    function delete_category(flow, id, status = 200) {
      var cookie = utils.get_cookie(req, flow);
      var csrf = utils.get_csrf_token(cookie);
      var del = flow.sync(req
        .delete('/api/admin/category/' + id)
        .set('x-xsrf-token', csrf)
        .type('json')
        .send({})
        .expect(status)
        .end(flow.callback()));
      return del.body;
    }


    it('appstore list test', (done) => {
      asyncblock((flow) => {
        var list = query_category(flow);
        assert.equal(0, list.length);
        get_category(flow, 1, 404);

        post_category(flow, {
          array: [
            { _id: 1, name: 'Entertainment' },
            { _id: 2, name: 'Local' },
            { _id: 3, name: 'Information' },
          ]
        });

        var list = query_category(flow);
        assert.equal(3, list.length);
        var cat1 = get_category(flow, 1);
        assert.ok(cat1 != null);
        assert.equal('Entertainment', cat1.name);

        assert.equal(true, post_category(flow, { _id: 4, name: 'Communication' }).result);
        assert.equal(true, put_category(flow, 5, { name: 'Driver Assist' }).result);

        var list = query_category(flow);
        assert.equal(5, list.length);
        assert.deepEqual([
          'Entertainment',
          'Local',
          'Information',
          'Communication',
          'Driver Assist',
        ], list.map((x) => x.name));


        assert.equal(true, put_category(flow, 5, { name: 'Driver Assist2' }).result);
        var cat5 = get_category(flow, 5);
        assert.ok(cat5 != null);
        assert.equal('Driver Assist2', cat5.name);

        assert.equal(true, delete_category(flow, 3).result);
        delete_category(flow, 3, 404);

        var list = query_category(flow);
        assert.equal(4, list.length);
        get_category(flow, 3, 404);

        post_category(flow, {
          array: [
            { _id: 1, name: 'Entertainment' },
            { _id: 2, name: 'Local' },
            { _id: 3, name: 'Information' },
          ]
        }, false);
        var list = query_category(flow);
        assert.equal(5, list.length);

        post_category(flow, {
          array: [
            { _id: 1, name: 'Entertainment' },
            { _id: 2, name: 'Local' },
            { _id: 3, name: 'Information' },
          ]
        }, true);
        var list = query_category(flow);
        assert.equal(3, list.length);
        var cat1 = get_category(flow, 1);
        assert.ok(cat1 != null);
        assert.equal('Entertainment', cat1.name);
        get_category(flow, 4, 404);
        get_category(flow, 5, 404);

        done();
      });
    })

  });

});

