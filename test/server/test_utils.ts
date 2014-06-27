
export function get_cookie(req, flow): string {
  var res = flow.sync(req
    .get('/')
    .expect(200)
    .end(flow.callback()));
  return res.headers['set-cookie'];
}

export function get_csrf_token(cookie: string): string {
  var match = /XSRF-TOKEN=(.*?);/.exec(cookie);
  if (!match) {
    return "";
  }
  return decodeURIComponent(match[1]);
}

