/* Sutar Tech — themes, channel definitions, and the public page renderer.
   Shared by the dashboard preview and every member page. window.ST */
(function () {

  var THEMES = {
    cream: { name: 'Cream', bg: '#FBF7F1', card: '#FFFFFF', ink: '#221E1A', body: '#5C544B', muted: '#6B6157', accent: '#5B3FB8', hairline: '#E8DFD1' },
    ink:   { name: 'Ink',   bg: '#211E24', card: '#2C2832', ink: '#F6F1EA', body: '#C6BEB4', muted: '#A69C90', accent: '#D8B45A', hairline: '#3C3644' },
    sand:  { name: 'Sand',  bg: '#F3E9D9', card: '#FFFDFA', ink: '#33291F', body: '#5E5142', muted: '#6E6152', accent: '#A63D13', hairline: '#E2D3BC' },
    sea:   { name: 'Sea',   bg: '#E9F0EF', card: '#FFFFFF', ink: '#152726', body: '#455655', muted: '#526362', accent: '#12625E', hairline: '#D3E0DE' }
  };

  var SHAPES = { rounded: '12px', pill: '999px', square: '2px' };

  var NETWORKS = {
    facebook:  { name: 'Facebook page',    mark: 'f',  brand: '#1877F2', hint: 'facebook.com/' },
    instagram: { name: 'Instagram',        mark: 'ig', brand: '#C13584', hint: 'instagram.com/' },
    youtube:   { name: 'YouTube',          mark: 'yt', brand: '#CC0000', hint: 'youtube.com/@' },
    whatsapp:  { name: 'WhatsApp',         mark: 'wa', brand: '#1F8A54', hint: 'wa.me/91' },
    gmb:       { name: 'Google Business',  mark: 'g',  brand: '#B0620A', hint: 'g.page/' },
    x:         { name: 'X',                mark: 'x',  brand: '#221E1A', hint: 'x.com/' }
  };

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var href = function (u) {
    u = String(u || '').trim();
    if (!u) return '#';
    return /^(https?:|mailto:|tel:)/i.test(u) ? u : 'https://' + u.replace(/^\/+/, '');
  };

  function theme(page) { return THEMES[(page.profile && page.profile.theme) || 'cream'] || THEMES.cream; }
  function shape(page) { return SHAPES[(page.profile && page.profile.shape) || 'rounded'] || SHAPES.rounded; }

  /* Renders the public member page.
     opts.scale = 'sm' for the dashboard's phone preview. */
  function renderPage(page, opts) {
    opts = opts || {};
    var sm = opts.scale === 'sm';
    var t = theme(page), r = shape(page);
    var pf = page.profile || {};
    var wa = String(pf.phone || '').replace(/[^0-9]/g, '');
    var avatar = opts.avatar || ('/' + page.slug + '/avatar.jpg');

    var f = {
      wrap: 'max-width:' + (sm ? '100%' : '440px') + ';margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:' + (sm ? '11px' : '18px') + ';padding:' + (sm ? '10px 18px 26px' : '38px 20px 64px') + ';',
      av: 'width:' + (sm ? '66px' : '96px') + ';height:' + (sm ? '66px' : '96px') + ';border-radius:50%;object-fit:cover;background:' + t.card + ';border:1px solid ' + t.hairline + ';',
      name: 'margin:0;font-family:Newsreader,Georgia,serif;font-weight:500;letter-spacing:-0.01em;line-height:1.15;font-size:' + (sm ? '19px' : '29px') + ';color:' + t.ink + ';',
      head: 'font-size:' + (sm ? '12.5px' : '15px') + ';margin-top:' + (sm ? '3px' : '6px') + ';color:' + t.accent + ';',
      loc: 'font-size:' + (sm ? '11px' : '12.5px') + ';margin-top:' + (sm ? '3px' : '5px') + ';color:' + t.muted + ';',
      bio: 'margin:0;text-align:center;text-wrap:pretty;font-size:' + (sm ? '12px' : '14.5px') + ';line-height:1.65;color:' + t.body + ';',
      link: 'display:block;width:100%;box-sizing:border-box;text-align:center;text-decoration:none;font-weight:500;padding:' + (sm ? '9px 10px' : '13px 14px') + ';font-size:' + (sm ? '12px' : '14.5px') + ';border:1px solid ' + t.hairline + ';border-radius:' + r + ';background:' + t.card + ';color:' + t.ink + ';',
      prim: 'display:block;width:100%;box-sizing:border-box;text-align:center;text-decoration:none;font-weight:600;padding:' + (sm ? '9px 10px' : '13px 14px') + ';font-size:' + (sm ? '12px' : '14.5px') + ';border:1px solid ' + t.accent + ';border-radius:' + r + ';background:' + t.accent + ';color:' + t.bg + ';'
    };

    var chips = (page.channels || []).filter(function (c) { return c.show !== false; }).map(function (c) {
      var n = NETWORKS[c.network] || { mark: '?', brand: t.muted, name: c.network };
      var d = sm ? 28 : 38;
      return '<a href="' + esc(href(c.handle)) + '" target="_blank" rel="noopener" aria-label="' + esc(n.name) + '"'
        + ' style="width:' + d + 'px;height:' + d + 'px;border-radius:' + (sm ? 9 : 11) + 'px;display:flex;align-items:center;justify-content:center;'
        + 'font-family:ui-monospace,monospace;font-size:' + (sm ? 10.5 : 13) + 'px;font-weight:500;text-decoration:none;color:#fff;background:' + n.brand + ';">'
        + esc(n.mark) + '</a>';
    }).join('');

    var links = (page.links || []).map(function (l) {
      return '<a href="' + esc(href(l.url)) + '" data-tap="' + esc(l.label) + '" style="' + f.link + '">' + esc(l.label) + '</a>';
    }).join('');

    var nav = (page.pages || []).filter(function (p) { return p.live !== false && p.path; }).map(function (p) {
      return '<a href="/' + esc(page.slug) + '/' + esc(p.path) + '" style="text-decoration:none;white-space:nowrap;font-size:'
        + (sm ? '10.5px' : '12.5px') + ';color:' + (sm ? t.muted : t.body) + ';">' + esc(p.title) + '</a>';
    }).join('');

    return ''
      + '<div style="' + f.wrap + '">'
      +   '<img src="' + esc(avatar) + '" alt="" width="' + (sm ? 66 : 96) + '" height="' + (sm ? 66 : 96) + '" loading="lazy" style="' + f.av + '" onerror="this.style.visibility=\'hidden\'">'
      +   '<div style="text-align:center;">'
      +     '<h1 style="' + f.name + '">' + esc(pf.name || page.slug) + '</h1>'
      +     (pf.headline ? '<div style="' + f.head + '">' + esc(pf.headline) + '</div>' : '')
      +     (pf.location ? '<div style="' + f.loc + '">' + esc(pf.location) + '</div>' : '')
      +   '</div>'
      +   (pf.bio ? '<p style="' + f.bio + '">' + esc(pf.bio) + '</p>' : '')
      +   (chips ? '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:' + (sm ? '6px' : '8px') + ';">' + chips + '</div>' : '')
      +   '<div style="width:100%;display:flex;flex-direction:column;gap:' + (sm ? '7px' : '9px') + ';margin-top:2px;">'
      +     links
      +     (wa ? '<a href="https://wa.me/' + wa + '" data-tap="WhatsApp" style="' + f.prim + '">' + (sm ? 'WhatsApp' : 'Message on WhatsApp') + '</a>' : '')
      +   '</div>'
      +   (nav ? '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:' + (sm ? '10px' : '16px') + ';margin-top:' + (sm ? '2px' : '12px') + ';">' + nav + '</div>' : '')
      +   '<div style="margin-top:6px;font-family:ui-monospace,monospace;font-size:10.5px;color:' + t.muted + ';">sutartech.github.io/' + esc(page.slug) + '</div>'
      + '</div>';
  }

  window.ST = { THEMES: THEMES, SHAPES: SHAPES, NETWORKS: NETWORKS, esc: esc, href: href, theme: theme, shape: shape, renderPage: renderPage };
})();
