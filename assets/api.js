/* Sutar Tech — talks to the Apps Script web app.
   Loaded as a plain script; everything hangs off window.API. */
(function () {
  var URL_EXEC = 'https://script.google.com/macros/s/AKfycbyKSBKoFabAXXxmt8RV-P0nE-gsYfuqKa1A6ZLi9EWidqbQ1XTUyijJOrDzxcI3An9n/exec';

  // Apps Script sends no CORS headers for application/json, so POST as
  // text/plain — the script still parses the body and no preflight happens.
  async function call(action, body) {
    var payload = Object.assign({ action: action, token: token() }, body || {});
    var res = await fetch(URL_EXEC, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    var data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  function token() { return sessionStorage.getItem('st_token') || ''; }

  async function login(userId, password) {
    var d = await call('login', { userId: userId, password: password });
    sessionStorage.setItem('st_token', d.token);
    sessionStorage.setItem('st_me', JSON.stringify(d.me));
    return d;
  }

  function me() {
    try { return JSON.parse(sessionStorage.getItem('st_me')); } catch (e) { return null; }
  }

  function logout() {
    sessionStorage.removeItem('st_token');
    sessionStorage.removeItem('st_me');
  }

  // Public read: GET, no token, served from the script's 5-minute cache.
  async function publicPage(slug) {
    var res = await fetch(URL_EXEC + '?slug=' + encodeURIComponent(slug));
    var data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Page not found');
    return data.page;
  }

  // Fire-and-forget: never blocks paint, never throws into the UI.
  function track(action, body) {
    try {
      fetch(URL_EXEC, {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ action: action }, body))
      }).catch(function () {});
    } catch (e) {}
  }

  window.API = {
    URL: URL_EXEC, call: call, login: login, logout: logout, me: me,
    token: token, publicPage: publicPage, track: track
  };
})();
