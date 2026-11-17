/*! Resonance lite — plain lesson text to Exploragram HTML. No build or dependencies. */
(function (root) {
  'use strict';

  var DEFAULT_ENGINE = 'https://cdn.jsdelivr.net/gh/N-lifescience/resonance@2/engine/';
  var GRID = 'display:grid;grid-template-columns:600px 1fr;gap:28px;align-items:start';
  var RESERVED = ('abs min max round floor ceil sqrt pow exp ln log sin cos tan asin acos atan rad deg clamp if fix len sign pi e true false x constructor prototype __proto__').split(' ');
  var TEMPLATES = { '끌려가기': 'drift', '고르기': 'choice', '전자 이동': 'electron', '그래프': 'graph', '퍼지기': 'diffusion', '단계': 'stages', '스펙트럼': 'spectrum', '구조': 'structure', '퀴즈': 'quiz', '분류': 'sort', '순서': 'order' };
  var COLORS = { '파랑': '#2563EB', '빨강': '#DC2626', '주황': '#B45309', '초록': '#15803D', '보라': '#7C3AED', '회색': '#6B7280' };
  var LITE_CSS = [
    '.slide{word-break:keep-all;overflow-wrap:anywhere}',
    '.lite-body,.lite-cols>*,.lite-model>*{min-width:0}',
    '.lite-cols{display:grid;grid-template-columns:minmax(0,1fr) 440px;gap:28px;align-items:start}',
    '.lite-pictures{display:grid;gap:16px;align-content:start}',
    '.lite-pictures.lite-many{grid-template-columns:repeat(2,minmax(0,1fr))}',
    '.fig img[hidden]{display:none !important}',
    'body[data-theme="ppt"] section.slide[data-bg]::before{display:none}',
    'body[data-theme="ppt"] section.slide[data-bg]:not(.cover):not(.chapter){padding-top:160px}',
    'body[data-theme="ppt"] section.slide[data-bg] .lite-figure-only .fig,body[data-theme="ppt"] section.slide[data-bg] .lite-figure-only .fig img{max-height:350px}',
    'body[data-theme="ppt"] section.slide.cover[data-bg] .band{background:transparent}',
    'body[data-theme="ppt"] section.slide.chapter[data-bg],body[data-theme="ppt"] section.slide.chapter[data-bg] p{color:#1F2328}',
    '.lite-pictures .fig,.lite-figure-only .fig{width:100%}',
    '.lite-pictures .fig img,.lite-pictures .ch-ppt-ph{max-height:300px;width:100%;object-fit:contain;box-sizing:border-box}',
    '.lite-pictures.lite-two .fig img,.lite-pictures.lite-two .ch-ppt-ph{height:180px;max-height:200px}',
    '.lite-pictures.lite-many .fig img,.lite-pictures.lite-many .ch-ppt-ph{max-height:120px}',
    // 작은 그림 자리(3~4개 격자)에는 '끌어다 놓으세요' 안내를 빼고 쪽·그림 번호를 아래 왼쪽에 둔다
    // (위 오른쪽 돋보기 단추에 가리지 않게). 글자는 엔진 최소 20px, 넘치면 자른다.
    '.lite-pictures.lite-many .ch-ppt-ph{height:120px;padding:6px 8px;overflow:hidden;align-content:end !important;justify-items:start;text-align:left}',
    '.lite-pictures.lite-many .ch-ppt-ph b{display:none}',
    '.lite-pictures.lite-many .ch-ppt-ph small{font-size:20px;line-height:1.2}',
    '.lite-figure-only{display:flex;justify-content:center;gap:24px}',
    '.lite-figure-only .fig{display:flex;flex-direction:column;max-width:900px;max-height:460px}',
    '.lite-figure-only .fig img,.lite-figure-only .ch-ppt-ph{min-height:0;flex-shrink:1}',
    '.lite-figure-only figcaption{flex-shrink:0}',
    '.lite-figure-only .fig img,.lite-figure-only .ch-ppt-ph{max-height:460px;width:100%;object-fit:contain;box-sizing:border-box}',
    '.lite-model{margin:0}',
    '.lite-model svg{display:block;width:600px;height:340px;max-width:100%;overflow:visible}',
    '.lite-model p{margin:0 0 12px;font-size:26px;line-height:1.45}',
    '.lite-model .q{font-size:28px;padding-left:0;margin-bottom:16px}',
    '.lite-buttons{display:flex;flex-wrap:wrap;margin-bottom:4px}',
    '.lite-buttons>button{margin:0 8px 8px 0}',
    '.lite-model button{font:600 22px/1.3 var(--ch-font,sans-serif);white-space:normal;min-height:56px;padding:10px 14px}',
    '.lite-model .ch-stops{margin-top:12px}',
    '.lite-electron .lite-buttons>button{margin:0 6px 6px 0}',
    '.lite-electron button{padding:8px 12px}',
    '.lite-stages .fig img,.lite-stages .ch-ppt-ph{max-height:280px;object-fit:contain}',
    '.lite-stages>p{margin-bottom:12px}',
    '.lite-stages .fig{max-width:600px}',
    '.lite-spectrum p{font-size:22px;line-height:1.35;margin-bottom:6px}',
    '.lite-spectrum .q,.lite-structure .q{font-size:26px;line-height:1.4;margin-bottom:12px}',
    '.lite-spectrum .bar{height:10px;margin:0 0 10px}',
    '.lite-spectrum .lite-wavelength{display:flex;align-items:center;flex-wrap:wrap;gap:8px}',
    '.lite-spectrum .lite-swatch{width:24px;height:24px;flex:none}',
    '.lite-structure p{font-size:24px;line-height:1.4;margin-bottom:12px}',
    '.lite-spectrum .lite-model-note,.lite-structure .lite-model-note{font-size:20px;line-height:1.4;margin-top:12px}',
    '.lite-measure{position:fixed;left:-20000px;top:0;width:1280px;height:720px;visibility:hidden;pointer-events:none}',
    '.lite-measure .slide{display:block !important;position:relative;width:1280px;height:720px;overflow:visible;animation:none;transform:none}',
    '.lite-measure .step{transform:none}',
    '@media print{.lite-measure{display:none}}'
  ].join('\n');

  function esc(value) {
    return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function attr(name, value) { return ' ' + name + '="' + esc(value) + '"'; }
  // Escape before applying our three inline marks; user HTML is never interpreted.
  function inline(value) {
    return esc(value).replace(/\{([^{}]+)\}/g, '<span class="blank">$1</span>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/==([^=]+)==/g, '<mark>$1</mark>');
  }
  function normalize(line) {
    var from = '＃－＞［］｜＊：＝';
    var to = '#->[]|*:=';
    return line.replace(/[＃－＞［］｜＊：＝]/g, function (c) { return to.charAt(from.indexOf(c)); }).trim();
  }
  function pipes(text) { return text.split('|').map(function (s) { return s.trim(); }); }
  function unbullet(text) { return text.replace(/^[-*•·]\s*/, '').trim(); }
  function hash(text) {
    var n = 2166136261;
    for (var i = 0; i < text.length; i++) n = Math.imul(n ^ text.charCodeAt(i), 16777619);
    return n >>> 0;
  }
  function deckKey(title) { return 'lite-' + ('000000' + hash(title).toString(36)).slice(-6); }
  function shuffled(items, seed) {
    var copy = items.slice();
    var n = hash(seed) || 1;
    for (var i = copy.length - 1; i > 0; i--) {
      n ^= n << 13; n ^= n >>> 17; n ^= n << 5;
      var j = (n >>> 0) % (i + 1);
      var t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy;
  }
  function activityLine(type, text) {
    var s = unbullet(text);
    var allowed = {
      drift: /^(왼쪽|오른쪽|켜기|고르기|처음|끝)\s*:/,
      choice: /^(값|그림)\s*:/,
      graph: /^(가로|세로|식|고르기|문장)\s*:/,
      diffusion: /^막\s*:/
    };
    if (allowed[type] && allowed[type].test(text)) return true;
    if (!/^[-*•·]/.test(text)) return false;
    if (type === 'electron') return /^\S+\s+\S+\s+\d+\s+(잃음|얻음)\s+\d+$/.test(s);
    if (type === 'diffusion') return /^\S+\s+\d+\s+\d+\s+(통과|막힘)\s+\S+$/.test(s);
    if (type === 'choice') return /^.+?\s*=\s*.+/.test(s);
    if (type === 'sort') return /^.+?\s*=\s*.+/.test(s);
    return ['quiz', 'order', 'stages', 'spectrum', 'structure'].indexOf(type) >= 0;
  }
  // '[그림 7-4] 설명', '- 그림 6-1, 6-2, 6-5: 설명', '그림 9-3~9-8: 설명', '(그림 19-9·19-13) 설명'을 모두 그림 자리로 읽는다.
  // 한 줄에서 그림은 4개까지만 받는다(장이 넘치지 않게).
  function figureRefs(line) {
    var m = /^(?:[-*•·]\s*)?[\[(（]?\s*그림\s*(\d+\s*-\s*\d+(?:\s*(?:,|·|~|및|와|과)\s*\d+(?:\s*-\s*\d+)?)*)\s*[\])）]?\s*[:：]?\s*(.*)$/.exec(line);
    if (!m) return null;
    var refs = [];
    m[1].replace(/\s+/g, '').split(/,|·|및|와|과/).forEach(function (token) {
      var r = /^(\d+)-(\d+)~(?:(\d+)-)?(\d+)$/.exec(token);
      if (r && (!r[3] || r[3] === r[1])) {
        for (var k = Number(r[2]); k <= Number(r[4]) && refs.length < 4; k++) refs.push(r[1] + '-' + k);
      } else if (/^\d+-\d+$/.test(token)) refs.push(token);
    });
    if (!refs.length) return null;
    return { refs: refs.slice(0, 4), text: m[2].trim() };
  }

    // ---- PPT 원문(text/x-ppt) → 수업 글: '@쪽' 줄을 PPT 장으로 펼친다 ----
    // 마주온 1번 코드가 슬라이드 XML과 장별 틀 이름을 zlib+base64로 넣는다. DOM 없이 정규식으로 읽어 Node 시험도 같은 코드를 쓴다.
  var EMU = 9525;

  function xmlText(s) {
    return String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, function (a, n) { return String.fromCharCode(Number(n)); }).replace(/&#x([\da-f]+);/gi, function (a, n) { return String.fromCharCode(parseInt(n, 16)); }).replace(/&amp;/g, '&');
  }
  function tidy(s) {
    return s.replace(/[\u00a0\s]+/g, ' ').replace(/\s+([?!.,:;)\]」』])/g, '$1').replace(/([(\[「『])\s+/g, '$1').trim();
  }
  function num(re, s, i) { var m = re.exec(s); return m ? Number(m[i || 1]) : null; }

  // 한 장의 도형들: 글상자(문단), 표, 그림
  function slideShapes(xml) {
    var anim = {};
    var timing = /<p:timing>[\s\S]*<\/p:timing>/.exec(xml);
    if (timing) timing[0].replace(/spid="(\d+)"/g, function (a, id) { anim[id] = true; });
    var shapes = [];
    var re = /<p:sp>([\s\S]*?)<\/p:sp>|<p:graphicFrame>([\s\S]*?)<\/p:graphicFrame>/g, m;
    while ((m = re.exec(xml))) {
      var body = m[1] || m[2];
      var id = /<p:cNvPr [^>]*id="(\d+)"/.exec(body);
      var off = /<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(\d+)" cy="(\d+)"/.exec(body);
      var ph = /<p:ph\b([^>]*)\/?>/.exec(body);
      var shape = {
        id: id ? id[1] : '', anim: !!(id && anim[id[1]]),
        x: off ? Number(off[1]) / EMU : 0, y: off ? Number(off[2]) / EMU : 0, w: off ? Number(off[3]) / EMU : 0, h: off ? Number(off[4]) / EMU : 0,
        ph: ph ? ((/type="(\w+)"/.exec(ph[1]) || [, 'body'])[1]) : '', paras: [], table: null
      };
      if (m[2]) {
        if (/<a:tbl>/.test(body)) {
          shape.table = [];
          body.replace(/<a:tr\b[\s\S]*?<\/a:tr>/g, function (tr) {
            var row = [];
            tr.replace(/<a:tc\b[\s\S]*?<\/a:tc>/g, function (tc) { row.push(tidy(paragraphs(tc).map(function (p) { return p.text; }).join(' '))); return ''; });
            shape.table.push(row); return '';
          });
        }
      } else shape.paras = paragraphs(body);
      if (shape.paras.length || (shape.table && shape.table.length)) shapes.push(shape);
    }
    return shapes;
  }
  function paragraphs(xml) {
    var out = [];
    xml.replace(/<a:p>([\s\S]*?)<\/a:p>|<a:p\/>/g, function (all, p) {
      if (!p) return '';
      var text = '', size = 0, colors = {};
      p.replace(/<a:(r|fld)\b[\s\S]*?<\/a:\1>|<a:br\b[^>]*\/>/g, function (run) {
        if (/^<a:br/.test(run)) { text += ' '; return ''; }
        var t = /<a:t>([\s\S]*?)<\/a:t>/.exec(run);
        if (!t) return '';
        var piece = xmlText(t[1]);
        text += piece;
        var sz = num(/\bsz="(\d+)"/, run);
        if (sz && piece.trim()) size = Math.max(size, sz);
        var c = /<a:solidFill>\s*<a:srgbClr val="([\dA-Fa-f]{6})"/.exec(run);
        if (c && piece.trim()) colors[c[1].toUpperCase()] = (colors[c[1].toUpperCase()] || 0) + piece.trim().length;
        return '';
      });
      if (!size) size = num(/<a:endParaRPr [^>]*sz="(\d+)"/, p) || 0;
      text = tidy(text);
      if (text) out.push({ text: text, size: size / 100, colors: colors, bullet: /<a:bu(Char|AutoNum)\b/.test(p) });
      return '';
    });
    return out;
  }
  function pictures(xml) {
    // 그림 번호는 슬라이드 XML의 blip 순서(1번 코드와 같다)
    var pics = [], k = 0, re = /<a:blip [^>]*r:embed="[^"]+"/g, m;
    while ((m = re.exec(xml))) {
      k++;
      var before = xml.lastIndexOf('<p:cNvPr', m.index);
      var descr = before >= 0 ? /descr="([^"]*)"/.exec(xml.slice(before, m.index)) : null;
      var after = xml.slice(m.index);
      var off = /<a:off x="(-?\d+)" y="(-?\d+)"\/>\s*<a:ext cx="(\d+)" cy="(\d+)"/.exec(after);
      pics.push({ k: k, descr: descr ? xmlText(descr[1]).trim() : '', y: off ? Number(off[2]) / EMU : 0, x: off ? Number(off[1]) / EMU : 0 });
    }
    return pics;
  }


  // ---- PPT 한 벌 → 장마다 수업 글 ----
  var PAGE_REF = /^(?:\d+\s*쪽\s*(?:[~∼-]\s*\d+\s*쪽?)?|\d+\s*[~∼-]\s*\d+\s*쪽|p\.?\s*\d+(?:\s*[~-]\s*\d+)?)$/;
  var NUMBER = /^(?:\d{1,2}|[ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ]|[IVX]{1,4})\.?$/;
  var MARKER = /^(?:\(\d+\)|\d+[.)]|[①-⑳]|[●○■□◆◇▶▷►•·※-]|[가-하][.)])/;
  function key(text) { return text.replace(/\s+/g, ''); }
  function endsOpen(text) { return /(?:[,，]|(?:의|를|을|으로|로|과|와|에서|에|하여|하고|하며|은|는|및))$/.test(text); }
  function isObjective(text) { return /수\s*있다\.?$/.test(text); }

  function analyzeDeck(ppt) {
    var slides = ppt.s.map(function (xml, i) {
      return { n: i + 1, layout: (ppt.l && ppt.l[i]) || '', shapes: slideShapes(xml), pics: pictures(xml) };
    });
    // 여러 장에 되풀이되는 글: 장 수를 센다(한 장 안의 되풀이는 한 번)
    var seen = {};
    slides.forEach(function (s) {
      var mine = {};
      s.shapes.forEach(function (sh) { sh.paras.forEach(function (p) { mine[key(p.text)] = true; }); });
      Object.keys(mine).forEach(function (k) { seen[k] = (seen[k] || 0) + 1; });
    });
    var many = Math.max(3, Math.ceil(slides.length * 0.4));
    slides.forEach(function (s) {
      s.shapes.forEach(function (sh) {
        sh.paras.forEach(function (p) {
          var k = key(p.text), count = seen[k] || 0;
          p.count = count;
          p.role = PAGE_REF.test(p.text) ? 'page'
            : NUMBER.test(p.text) ? 'number'
            : count >= many ? 'chrome'
            : '';
        });
      });
    });
    return { slides: slides, coverLayout: slides.length ? slides[0].layout : '' };
  }

  function convertSlide(deck, s, figKeys, prevTitle) {
    var shapes = s.shapes.slice().sort(function (a, b) { return a.y - b.y || a.x - b.x; });
    var live = function (p) { return !p.role; };
    // 장표지: 표지와 같은 틀을 쓰는 장(표지 뒤)
    var chapter = s.n > 1 && deck.coverLayout && s.layout === deck.coverLayout;
    var titleShape = null, title = '';
    var ph = shapes.filter(function (sh) { return /title|ctrTitle/i.test(sh.ph) && sh.paras.some(live); })[0];
    if (s.n === 1) {
      var top = null, rest = [];
      shapes.forEach(function (sh) { sh.paras.forEach(function (p) { if (!p.role && (!top || p.size > top.size)) top = p; }); });
      shapes.forEach(function (sh) { sh.paras.forEach(function (p) { if (p !== top && (p.role === 'chrome' || p.role === 'page' || !p.role)) rest.push(p.text); }); });
      return { n: 1, layout: s.layout, title: top ? top.text : '', cover: true, kicker: rest.join(' · '), lines: [] };
    }
    if (chapter) {
      var big = null;
      shapes.forEach(function (sh) { sh.paras.forEach(function (p) { if (live(p) && (!big || p.size > big.p.size)) big = { sh: sh, p: p }; }); });
      if (big) { titleShape = big.sh; title = big.p.text; }
      var kick = [];
      shapes.forEach(function (sh) { sh.paras.forEach(function (p) { if (p !== (big && big.p) && (p.role === 'number' || live(p))) kick.push(p.text); }); });
      return { n: s.n, layout: s.layout, title: title, chapter: true, kicker: kick.join(' '), lines: [] };
    }
    if (ph) titleShape = ph;
    else {
      // 위쪽(150px 안) 머리 글 가운데 가장 큰 것, 같으면 위의 것
      var best = null;
      shapes.forEach(function (sh) {
        if (sh.y >= 150 || !sh.paras.some(live)) return;
        var size = Math.max.apply(null, sh.paras.filter(live).map(function (p) { return p.size; }));
        if (!best || size > best.size) best = { sh: sh, size: size };
      });
      if (best) titleShape = best.sh;
    }
    if (titleShape) title = joinParas(titleShape.paras.filter(live).map(function (p) { return p.text; })).join(' ');
    // 머리에 없으면: 짧고 큰 글 하나
    if (!title) {
      var cand = null;
      shapes.forEach(function (sh) {
        var ps = sh.paras.filter(live), joined = joinParas(ps.map(function (p) { return p.text; }));
        if (joined.length !== 1 || joined[0].length > 30 || /[.。]$/.test(joined[0]) || isObjective(joined[0])) return;
        var size = Math.max.apply(null, ps.map(function (p) { return p.size; }));
        if (size >= 28 && (!cand || size > cand.size)) cand = { sh: sh, size: size, text: joined[0] };
      });
      if (cand && shapes.filter(function (sh) { return sh.paras.some(live); }).length <= 2) { titleShape = cand.sh; title = cand.text; }
    }
    // 묶음: 여러 장에 되풀이되는 큰 글(+ 바로 옆 숫자)
    var section = '';
    shapes.forEach(function (sh) {
      if (sh === titleShape || sh.y < 150) return;
      sh.paras.forEach(function (p) {
        if (!section && !p.role && p.count >= 3 && p.size >= 24 && p.text.length <= 30) {
          var no = shapes.filter(function (o) { return o !== sh && Math.abs(o.y - sh.y) < 20 && o.paras.length === 1 && o.paras[0].role === 'number'; })[0];
          section = (no ? no.paras[0].text.replace(/\.$/, '') + '. ' : '') + p.text;
          p.role = 'section';
        }
      });
    });
    var body = [];
    shapes.forEach(function (sh) {
      if (sh === titleShape) return;
      if (sh.table) { body.push({ table: sh.table }); return; }
      var texts = joinParas(sh.paras.filter(live).map(function (p) { return p.text; }));
      texts.forEach(function (t) { body.push({ text: t, sh: sh }); });
    });
    if (!title) title = body.length && body.every(function (b) { return b.text && isObjective(b.text); }) ? '학습 목표' : prevTitle || '';
    // 물음과 답: '?'로 끝나는 본문 줄 뒤의 다른 글상자 줄은 답(눌러서 연다)
    var lines = [], qShape = null;
    var titleAsks = /[?？]$/.test(title) && body.length && body.every(function (b) { return b.sh && b.sh.anim; });
    body.forEach(function (b) {
      if (b.table) { qShape = null; b.table.forEach(function (row) { lines.push('| ' + row.map(function (c) { return c.replace(/\|/g, '/'); }).join(' | ') + ' |'); }); return; }
      var t = b.text;
      if (/[?？]$/.test(t)) { lines.push('Q. ' + t.replace(/^[●○■□◆◇▶▷►•·※]\s*/, '')); qShape = b.sh; return; }
      if ((qShape && b.sh !== qShape) || titleAsks) { lines.push('답: ' + t); return; }
      lines.push('- ' + t);
    });
    s.pics.forEach(function (p) { if (figKeys.indexOf(s.n + '-' + p.k) >= 0) lines.push('[그림 ' + s.n + '-' + p.k + ']'); });
    return { n: s.n, layout: s.layout, title: title, section: section, lines: lines };
  }
  function joinParas(texts) {
    var out = [];
    texts.forEach(function (t) {
      var last = out[out.length - 1];
      if (last && endsOpen(last) && !MARKER.test(t)) out[out.length - 1] = last + ' ' + t;
      else out.push(t);
    });
    return out;
  }

  function convertDeck(ppt, figKeys) {
    var deck = analyzeDeck(ppt), prev = '';
    return deck.slides.map(function (s) { var c = convertSlide(deck, s, figKeys || [], prev); if (!c.chapter) prev = c.title; return c; });
  }

  // 장 하나를 수업 글로. opts: { title, blanks: [] }
  function slideText(c, opts, state) {
    opts = opts || {};
    var title = (opts.title || c.title || '').trim();
    var safe = function (t) { return /^\[/.test(t) ? '​' + t : t; };
    var out = [];
    if (c.layout) out.push('[바탕] ' + c.layout.replace(/\.xml$/, ''));
    if (c.chapter) {
      out.push('# [장표지] ' + safe(title || 'PPT ' + c.n + '쪽'));
      if (c.kicker) out.push(c.kicker);
      state.section = title;
      return out.join('\n');
    }
    if (c.section && c.section !== state.section) { out.unshift('[묶음] ' + c.section); state.section = c.section; }
    out.push('# ' + safe(title || 'PPT ' + c.n + '쪽'));
    var lines = c.lines.slice();
    (opts.blanks || []).forEach(function (word) {
      for (var i = 0; i < lines.length; i++) {
        var at = lines[i].indexOf(word);
        if (at >= 0 && !/^\[그림/.test(lines[i])) { lines[i] = lines[i].slice(0, at) + '{' + word + '}' + lines[i].slice(at + word.length); return; }
      }
    });
    return out.concat(lines).join('\n');
  }

  // 수업 글의 '@쪽' 줄을 PPT 장으로 펼친다. '@'이 하나도 없으면 그대로 둔다.
  var ANCHOR = /^\s*[@＠]\s*(\d+)(?:\s*[-~∼]\s*(\d+))?\s*(?:쪽)?(.*)$/;
  function expandAnchors(text, ppt, figKeys) {
    var src = String(text || '').split(/\r\n?|\n/);
    if (!ppt || !ppt.s || !src.some(function (l) { return ANCHOR.test(l); })) return { text: text, used: false, missing: [] };
    var conv = convertDeck(ppt, figKeys);
    var total = conv.length, placed = 0, state = { section: '' }, out = [];
    var hasCover = src.some(function (l) { return /^\s*[#＃]\s*\[표지\]/.test(l); });
    if (hasCover) placed = 1;
    var coverLayout = conv.length ? conv[0].layout : '';
    function upto(n, opts) {
      n = Math.min(n, total);
      while (placed < n) {
        placed++;
        var c = conv[placed - 1];
        if (c.cover) { if (!hasCover) out.push(coverText(c)); }
        else out.push(slideText(c, placed === n ? opts : null, state));
        out.push('');
      }
    }
    src.forEach(function (line) {
      var m = ANCHOR.exec(line);
      if (!m) {
        if (/^\s*[#＃]\s*\[표지\]/.test(line) && coverLayout) out.push('[바탕] ' + coverLayout.replace(/\.xml$/, ''));
        out.push(line); return;
      }
      var n = Number(m[2] || m[1]), rest = m[3] || '', opts = { blanks: [] };
      var tm = /제목\s*[:：]\s*([^{]+)/.exec(rest);
      if (tm) opts.title = tm[1].trim();
      rest.replace(/[{｛]([^}｝]+)[}｝]/g, function (a, w) { opts.blanks.push(w.trim()); return ''; });
      out.push('');
      upto(n, opts);
    });
    upto(total);
    return { text: out.join('\n'), used: true, missing: [] };
  }
  function coverText(c) {
    return (c.layout ? '[바탕] ' + c.layout.replace(/\.xml$/, '') + '\n' : '') + '# [표지] ' + (c.title || '수업') + (c.kicker ? '\n' + c.kicker : '');
  }


  // PPT에서 많이 쓴 색 가운데 흰 글자와 대비가 4.5 넘는 것(도형 칠은 두 배로 센다). 없으면 ''.
  function pptAccent(ppt) {
    var count = {};
    (ppt && ppt.s || []).forEach(function (xml) {
      xml.replace(/<p:spPr>[\s\S]*?<\/p:spPr>|<a:rPr\b[\s\S]*?<\/a:rPr>/g, function (part) {
        var w = /^<p:spPr/.test(part) ? 2 : 1;
        part.replace(/<a:srgbClr val="([\dA-Fa-f]{6})"/g, function (a, c) { c = c.toUpperCase(); count[c] = (count[c] || 0) + w; return a; });
        return part;
      });
    });
    function lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
    var best = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; }).filter(function (c) {
      var r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4), 16);
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (max - min < 60) return false;   // 회색·검정·흰색
      var L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      return 1.05 / (L + 0.05) >= 4.5;
    })[0];
    return best ? '#' + best : '';
  }

  function parseLesson(text) {
    var lesson = { settings: { accent: '', deck: '' }, slides: [], warnings: [] };
    var lines = String(text == null ? '' : text).replace(/^\uFEFF/, '').split(/\r\n?|\n/).map(normalize);
    var current = null;
    var section = '';
    var bg = '';
    var figureTitleSlide = null;
    function newSlide(title, type) {
      current = { id: 's' + (lesson.slides.length + 1), title: title, type: type || 'normal', section: section, bg: bg, blocks: [] };
      lesson.slides.push(current);
      return current;
    }
    function add(block) {
      if (!current) newSlide('수업');
      current.blocks.push(block);
    }
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var m;
      if (!line) continue;
      if ((m = /^\[묶음\]\s*(.*)$/.exec(line))) { section = m[1]; continue; }
      if ((m = /^\[바탕\]\s*([\w-]*)$/.exec(line))) { bg = m[1]; continue; }
      // 약한 모델은 '색:'을 빼고 '#568A35'만 쓰거나 '색 568A35'로 쓴다. 장 제목으로 읽지 않는다.
      if ((m = /^(?:(?:주\s*)?색\s*:?\s*)?#?([\da-f]{6}|[\da-f]{3})$/i.exec(line)) && (/^#[\da-f]+$/i.test(line) || /색/.test(line))) {
        lesson.settings.accent = '#' + m[1];
        continue;
      }
      // '# [그림 23-1] 설명'처럼 그림을 장 제목 줄에 쓰면 그 그림의 장으로 받는다. 잇달아 오면 같은 장에 모은다.
      var figureTitle = /^#\s*(\[?\s*그림\s*\d.*)$/.exec(line), titleFigs = figureTitle && figureRefs(figureTitle[1]);
      if (titleFigs) {
        if (!current || current !== figureTitleSlide) { newSlide(titleFigs.text || '그림', 'normal'); figureTitleSlide = current; }
        titleFigs.refs.forEach(function (ref) { add({ type: 'figure', ppt: ref, text: titleFigs.text || '그림 ' + ref, line: i + 1 }); });
        continue;
      }
      var figs = figureRefs(line);
      if (figs) {
        if (current && current.type !== 'normal') continue;   // 표지·장표지에 그림 자리를 넣으면 제목이 밀려난다
        figs.refs.forEach(function (ref, k) { add({ type: 'figure', ppt: ref, text: figs.text || '그림 ' + ref, auto: !figs.text, line: i + 1 }); });
        continue;
      }
      // 약한 모델은 활동·모형을 '# [퀴즈] 물음'처럼 장 제목 줄에 붙여 쓴다. 장을 만들고 그 줄을 활동 머리로 다시 읽는다.
      if ((m = /^#\s*\[([^\]]+)\]\s*(.*)$/.exec(line)) && Object.prototype.hasOwnProperty.call(TEMPLATES, m[1])) {
        var kind = TEMPLATES[m[1]], rest = m[2].trim();
        var defaults = { quiz: '확인 문제', sort: '나누어 보자', order: '순서대로 놓아 보자', drift: '어느 쪽으로 끌려갈까?', choice: '골라서 비교해 보자', electron: '원자는 어떻게 이온이 될까?', graph: '어떻게 변할까?', diffusion: '어떻게 퍼질까?', stages: '과정을 따라가 보자', spectrum: '파장에 따라 어떻게 달라질까?', structure: '각 부분은 어떤 일을 할까?' };
        var activity = kind === 'quiz' || kind === 'sort' || kind === 'order';
        // 다음 줄에 같은 활동 머리('[분류] 칸1 | 칸2')가 또 오면 제목 줄은 제목으로만 쓴다.
        var next = i + 1; while (next < lines.length && !lines[next]) next++;
        if (next < lines.length && lines[next].indexOf('[' + m[1] + ']') === 0) {
          newSlide(rest && !/\|/.test(rest) ? rest : defaults[kind], 'normal');
          continue;
        }
        // 물음은 장 제목으로 쓴다(활동 안의 물음 줄은 그리지 않아 높이를 아낀다). '칸1 | 칸2'는 제목이 아니다.
        newSlide(!rest || /\|/.test(rest) ? defaults[kind] : rest, 'normal');
        lines[i] = '[' + m[1] + '] ' + (activity || kind === 'stages' || kind === 'structure' || /\|/.test(rest) ? rest : '');
        i--;
        continue;
      }
      if ((m = /^#\s*(?:\[(표지|장표지)\]\s*)?(.*)$/.exec(line))) {
        if (m[1] === '장표지') section = m[2];
        // '# [모형] 제목', '# [그림] 제목'처럼 틀이 아닌 머리는 떼고 제목만 쓴다.
        var title = m[1] ? m[2] : m[2].replace(/^\[([^\]\d]{1,8})\]\s*(.*)$/, function (all, tag, rest) { return rest || tag; });
        newSlide(title, m[1] === '표지' ? 'cover' : m[1] === '장표지' ? 'chapter' : 'normal');
        continue;
      }
      if (!current && (m = /^(색|덱)\s*:\s*(.*)$/.exec(line))) {
        if (m[1] === '덱') lesson.settings.deck = m[2];
        else if (/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(m[2])) lesson.settings.accent = m[2];
        else lesson.warnings.push({ line: i + 1, message: '색은 #RGB 또는 #RRGGBB로 쓴다.' });
        continue;
      }
      if (current && current.type === 'cover') {
        if (!current.blocks.length) current.blocks.push({ type: 'kicker', text: unbullet(line), line: i + 1 });
        continue;
      }
      if (current && current.type === 'chapter') {
        if (!current.blocks.length) current.blocks.push({ type: 'kicker', text: unbullet(line), line: i + 1 });
        continue;
      }
      if ((m = /^\[([^\]]+)\]\s*(.*)$/.exec(line)) && Object.prototype.hasOwnProperty.call(TEMPLATES, m[1])) {
        var block = { type: TEMPLATES[m[1]], text: m[2], source: line, lines: [], line: i + 1 };
        // 물음이 장 제목과 같으면 활동 안에서 물음 줄을 다시 그리지 않는다.
        block.asTitle = !!(current && block.text && current.title === block.text);
        var unknown = [];
        while (i + 1 < lines.length && lines[i + 1] && !/^(#|\[[^\]]+\])/.test(lines[i + 1])) {
          i++;
          if (activityLine(block.type, lines[i])) block.lines.push({ text: lines[i], line: i + 1 });
          else {
            unknown.push({ type: 'paragraph', text: lines[i], line: i + 1 });
            lesson.warnings.push({ line: i + 1, message: '활동 문법을 알 수 없어 문단으로 표시한다: ' + lines[i] });
          }
        }
        // 보기·카드·항목이 2개 안 되는 퀴즈·분류·순서는 엔진이 오류로 알리므로 버린다.
        var listed = block.lines.filter(function (l) { return /^[-*•·]/.test(l.text); }).length;
        if ((['quiz', 'order'].indexOf(block.type) >= 0 && listed < 2) || (block.type === 'sort' && listed < 1)) lesson.warnings.push({ line: block.line, message: '보기·카드·항목이 2개보다 적어 활동을 뺐다: ' + block.source });
        else {
          if (block.type === 'spectrum') prepareSpectrum(block, lesson.warnings);
          if (block.type === 'structure') prepareStructure(block, lesson.warnings);
          add(block);
        }
        unknown.forEach(add);
      } else if (/^\|/.test(line)) {
        var rows = [];
        var start = i + 1;
        do {
          var cells = pipes(lines[i].replace(/^\|/, '').replace(/\|$/, ''));
          if (!cells.every(function (c) { return /^:?-{3,}:?$/.test(c); })) rows.push(cells);
          i++;
        } while (i < lines.length && /^\|/.test(lines[i]));
        i--;
        if (rows.length) add({ type: 'table', rows: rows, line: start });
      } else if ((m = /^\[그림\s+([^\]]+)\]\s*(.*)$/.exec(line))) {
        add({ type: 'figure', ppt: m[1], text: m[2] || '그림 ' + m[1], line: i + 1 });
      } else if ((m = /^\[영상\]\s*(.*)$/.exec(line)) && /^https?:\/\//i.test(m[1])) {
        // 엔진 영상 카드는 유튜브만 튼다. 유튜브 영상 ID(11자)가 있으면 영상 카드, 다른 주소면 링크 카드.
        // 약한 모델은 'watch?v='처럼 빈 유튜브 주소를 쓴다. 그런 줄은 버리고 경고만 남긴다.
        var video = pipes(m[1]);
        var isYoutube = /(?:youtube\.com|youtu\.be)\//i.test(video[0]);
        var vid = /(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})(?![\w-])/.exec(video[0]);
        if (vid) add({ type: 'video', url: video[0], text: video[1] || '영상', line: i + 1 });
        else if (!isYoutube) add({ type: 'link', url: video[0], text: video[1] || '자료 보기', line: i + 1 });
        else lesson.warnings.push({ line: i + 1, message: '영상 주소를 읽지 못해 영상 카드를 만들지 않았다: ' + video[0] });
      } else if ((m = /^\[(꼬리표|AI)\]\s*(.*)$/.exec(line))) {
        add({ type: m[1] === 'AI' ? 'ai' : 'kicker', text: m[2], line: i + 1 });
      } else if ((m = /^(?:답\s*:|A\.)\s*(.*)$/.exec(line))) {
        add({ type: 'answer', text: m[1], line: i + 1 });
      } else if ((m = /^Q(?:\.\s*|\s+)(.*)$/.exec(line))) {
        add({ type: 'question', text: m[1], line: i + 1 });
      } else if ((m = /^(?:->|→|>)\s*(.*)$/.exec(line))) {
        add({ type: 'step', text: m[1], line: i + 1 });
      } else add({ type: 'paragraph', text: unbullet(line), line: i + 1 });
    }
    return lesson;
  }

  function fields(block) {
    var values = Object.create(null);
    block.lines.forEach(function (l) {
      var m = /^([^:]+):\s*(.*)$/.exec(l.text);
      if (m) {
        var key = m[1].trim();
        if (!Object.prototype.hasOwnProperty.call(values, key)) values[key] = [];
        values[key].push(m[2]);
      }
    });
    return values;
  }
  function first(f, key, fallback) { return f[key] && f[key].length ? f[key][0] : fallback; }
  function items(block) { return block.lines.filter(function (l) { return /^[-*•·]/.test(l.text); }); }
  function output(expr, unit, digits) {
    return '<output' + attr('data-expr', expr) + (unit ? attr('data-unit', unit) : '') + (digits == null ? '' : attr('data-digits', digits)) + '></output>';
  }
  function button(name, value, label, pressed) {
    return '<button type="button"' + attr('data-set', name) + attr('data-value', value) + (pressed ? ' aria-pressed="true"' : '') + '>' + inline(label) + '</button>';
  }
  function buttons(name, labels) {
    return '<div class="lite-buttons">' + labels.map(function (label, i) { return button(name, i + 1, label, i === 0); }).join('') + '</div>';
  }
  function selectExpr(name, values) {
    if (!values.length) return '0';
    return values.map(function (value, i) { return i === values.length - 1 ? value : name + ' == ' + (i + 1) + ' ? ' + value + ' : '; }).join('');
  }
  // Engine strings have no backslash escapes. Use concatenated single/double
  // quoted pieces so names containing either quote still remain plain data.
  function quoted(text) {
    return String(text).replace(/[\r\n]/g, ' ').split(/(['"])/).map(function (piece) {
      return piece === "'" ? '"\'"' : piece === '"' ? "'\"'" : "'" + piece + "'";
    }).join(' + ');
  }
  function svg(content, label) { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" role="img"' + attr('aria-label', label) + '>' + content + '</svg>'; }
  function svgText(x, y, text, extra) {
    return '<text' + attr('x', x) + attr('y', y) + ' text-anchor="middle" font-size="26" fill="#1F2328"' + (extra || '') + '>' + esc(text) + '</text>';
  }
  function model(type, lets, left, right, extra) {
    return '<div class="calc lite-model lite-' + type + '" data-ai="모형" data-activity' + attr('data-let', lets) + (extra || '') + attr('style', GRID) + '>' + left + '<div>' + right + '</div></div>';
  }
  function figure(ppt, text, auto) {
    return '<figure class="fig"><img' + attr('data-ppt', ppt) + attr('alt', text) + '><figcaption' + (auto ? ' data-auto' : '') + '>' + inline(text) + '</figcaption></figure>';
  }
  function fallback(block) {
    return '<p>' + inline(block.source || block.text) + '</p>' + (block.lines || []).map(function (l) { return '<p>' + inline(l.text) + '</p>'; }).join('');
  }

  // SVG 글자 폭 어림: 한글·한자는 글자 크기만큼, 영문·숫자는 0.6배, 위·아래첨자는 0.4배.
  function labelWidth(text, size) {
    var w = 0;
    String(text).split('').forEach(function (ch) {
      if (/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉]/.test(ch)) w += size * 0.4;
      else if (/[ᄀ-ᇿ㄰-㆏가-힯一-鿿]/.test(ch)) w += size * 0.95;
      else w += size * 0.6;
    });
    return w;
  }
  function renderDrift(block) {
    var f = fields(block);
    var choices = (f['고르기'] || []).map(function (line) {
      var m = /^(.*?)\s*=\s*(.*)$/.exec(line);
      if (!m) return null;
      var parts = m[2].split(',').map(function (part) {
        var p = /^(.+?)\s+(왼쪽|오른쪽|위|아래|그대로)\s+(\d+)$/.exec(part.trim());
        return p ? { name: p[1], dir: p[2], count: Number(p[3]) } : null;
      });
      return parts.length && parts.every(Boolean) ? { label: m[1], parts: parts } : null;
    }).filter(Boolean);
    if (!choices.length) return fallback(block);
    // 입자 이름을 양쪽 끝 이름과 똑같이 쓰면(왼쪽: 융털, 입자 '융털 왼쪽 2') 뜻 없는 움직임이 된다. 글로만 보여 준다.
    var sides = [first(f, '왼쪽', ''), first(f, '오른쪽', '')].map(function (s) { return s.trim(); });
    if (choices.some(function (c) { return c.parts.some(function (p) { return sides.indexOf(p.name.trim()) >= 0; }); })) {
      return (f['처음'] ? '<p>' + inline(first(f, '처음', '')) + '</p>' : '') + (f['끝'] ? '<p class="step">' + inline(first(f, '끝', '')) + '</p>' : '');
    }
    var dirColor ={ '왼쪽': '#DC2626', '오른쪽': '#2563EB', '위': '#7C3AED', '아래': '#B45309', '그대로': '#6B7280' };
    var art = '<rect x="10" y="48" width="580" height="280" rx="16" fill="#EFF6FF" stroke="#94A3B8" stroke-width="2"/>';
    art += '<rect x="26" y="65" width="18" height="245" fill="#64748B"/><rect x="556" y="65" width="18" height="245" fill="#64748B"/>';
    art += svgText(90, 31, first(f, '왼쪽', '왼쪽')) + svgText(510, 31, first(f, '오른쪽', '오른쪽'));
    var nL = [], nR = [];
    choices.forEach(function (choice, ci) {
      var parts = [];
      choice.parts.forEach(function (p) { for (var k = 0; k < p.count; k++) parts.push(p); });
      var counts = { '왼쪽': 0, '오른쪽': 0, '위': 0, '아래': 0, '그대로': 0 };
      var totals = {};
      Object.keys(counts).forEach(function (dir) { totals[dir] = parts.filter(function (p) { return p.dir === dir; }).length; });
      nL.push(String(totals['왼쪽'])); nR.push(String(totals['오른쪽']));
      art += '<g' + attr('data-show', 'sol == ' + (ci + 1)) + '>';
      if (totals['위']) art += '<rect x="140" y="49" width="320" height="10" fill="#7C3AED"/>';
      if (totals['아래']) art += '<rect x="140" y="317" width="320" height="10" fill="#B45309"/>';
      var cols = Math.min(5, Math.max(1, Math.ceil(Math.sqrt(parts.length))));
      var rows = Math.ceil(parts.length / cols);
      parts.forEach(function (p, i) {
        // 이름이 길면(예: 지방산·모노글리세리드) 원 대신 글자 길이에 맞춘 둥근 상자로 그린다.
        var textW = labelWidth(p.name, 22);
        var pill = textW > 40;
        var half = pill ? Math.round(Math.min(150, textW / 2 + 12)) : 22;
        var x0 = cols === 1 ? 300 : 160 + (i % cols) * 280 / (cols - 1);
        x0 = Math.max(52 + half, Math.min(548 - half, x0));
        var y0 = rows === 1 ? 180 : 80 + Math.floor(i / cols) * 220 / (rows - 1);
        var at = counts[p.dir]++;
        var total = totals[p.dir];
        var x1 = x0, y1 = y0;
        if (p.dir === '왼쪽' || p.dir === '오른쪽') { x1 = p.dir === '왼쪽' ? 52 + half : 548 - half; y1 = 85 + at * 210 / Math.max(1, total - 1); }
        if (p.dir === '위' || p.dir === '아래') { x1 = Math.max(52 + half, Math.min(548 - half, 160 + at * 280 / Math.max(1, total - 1))); y1 = p.dir === '위' ? 85 : 285; }
        var ex = x0 + ' + (' + x1 + ' - ' + x0 + ') * p';
        var ey = y0 + ' + (' + y1 + ' - ' + y0 + ') * p';
        if (pill) art += '<rect height="40" rx="20"' + attr('width', 2 * half) + attr('fill', dirColor[p.dir]) + attr('data-attr', 'x: ' + ex + ' - ' + half + '; y: ' + ey + ' - 20') + '/>';
        else art += '<circle r="22"' + attr('fill', dirColor[p.dir]) + attr('data-attr', 'cx: ' + ex + '; cy: ' + ey) + '/>';
        art += '<text text-anchor="middle"' + attr('font-size', pill ? 20 : 22) + ' fill="white"' + attr('data-attr', 'x: ' + ex + '; y: ' + ey + ' + 8') + '>' + esc(p.name) + '</text>';
      });
      art += '</g>';
    });
    var lets = 'p = on * t; nL = round((' + selectExpr('sol', nL) + ') * p); nR = round((' + selectExpr('sol', nR) + ') * p)';
    var constants = [];
    var right = choices.length > 1 ? buttons('sol', choices.map(function (c) { return c.label; })) : '';
    if (choices.length === 1) constants.push('sol = 1');
    if (f['켜기']) {
      var label = first(f, '켜기', '전원');
      right += '<div class="lite-buttons">' + button('on', 0, label + ' 끔', true) + button('on', 1, label + ' 켬') + '</div>';
    } else constants.push('on = 1');
    right += '<input type="range" name="t" min="0" max="1" step="0.1" value="0" data-play="5" aria-label="시간">';
    right += '<p>' + inline(first(f, '왼쪽', '왼쪽')) + ' 쪽 ' + output('nL', '개') + ' · ' + inline(first(f, '오른쪽', '오른쪽')) + ' 쪽 ' + output('nR', '개') + ' (모형)</p>';
    right += '<p data-show="p == 0">' + inline(first(f, '처음', '아직 이동하지 않았다.')) + '</p><p data-show="p > 0 &amp;&amp; p &lt; 1">끌려가는 중이다.</p><p data-show="p == 1">' + inline(first(f, '끝', '입자가 끝에 도착했다.')) + '</p>';
    return model('drift', lets, svg(art, '방향에 따른 입자 이동 모형'), right, constants.length ? attr('data-const', constants.join('; ')) : '');
  }

  // 판정 말(통한다/통하지 않는다, 있다/없다, 켜진다/꺼진다)을 1/0으로 읽는다. 모르면 null.
  function verdict(text) {
    var s = String(text || '');
    if (/않|없|안\s|아니|꺼|못|×/.test(s)) return 0;
    if (/통한다|통함|난다|켜|있|흐른다|흐름|○/.test(s)) return 1;
    return null;
  }
  function renderChoice(block) {
    var f = fields(block);
    var choices = items(block).map(function (line) {
      var parts = pipes(unbullet(line.text));
      var m = /^(.*?)\s*=\s*(.+)$/.exec(parts[0]);
      if (!m) return null;
      var n = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(m[2].trim()) ? Number(m[2]) : verdict(m[2]);
      return n === null ? null : { label: m[1], value: n, text: parts.slice(1).join(' | ') || m[2], word: isNaN(Number(m[2])) };
    }).filter(Boolean);
    if (!choices.length) {
      // '= 기계적 소화'처럼 갈래 이름을 쓴 고르기는 분류 카드로 펼친다(약한 모델이 분류와 고르기를 섞는다).
      var cats = items(block).filter(function (l) { return /=/.test(l.text); });
      var parsed = cats.map(function (l) { var p = pipes(unbullet(l.text)); var m = /^(.*?)\s*=\s*(.*)$/.exec(p[0]); return { label: m[1], result: m[2], why: p.slice(1).join(' | ') }; });
      var distinct = parsed.filter(function (c, i) { return parsed.findIndex(function (d) { return d.result === c.result; }) === i; }).length;
      // 고를 때마다 결과가 하나씩 다르면(시험관 A = 녹말이 그대로다, B = 당분으로 바뀐다) 비교 전환으로 연다.
      // 결과가 모두 다르면(칸마다 카드 한 장뿐인 분류가 되므로) 비교 전환으로, 같은 결과가 있으면 분류로.
      if (cats.length >= 2 && distinct === cats.length) {
        return (block.text ? '<p class="q" data-n="?">' + inline(block.text) + '</p>' : '') + '<div class="switch"' + attr('data-stops', '시작|' + parsed.map(function (c) { return c.label.replace(/\|/g, ' '); }).join('|')) + '>' +
          parsed.map(function (c, i) { return '<div' + attr('data-only', i + 1) + '><p><b>' + inline(c.result) + '</b></p>' + (c.why ? '<p>' + inline(c.why) + '</p>' : '') + '</div>'; }).join('') + '</div>';
      }
      if (cats.length >= 2) return renderSort({ text: block.text, lines: cats });
      return fallback(block);
    }
    var value = pipes(first(f, '값', '값'));
    // 약한 모델이 값 자리에 번호(1, 2, 3…)를 쓰면 설탕물이 가장 밝은 전구처럼 틀린 모형이 된다.
    // 번호처럼 보이고 문장마다 판정이 있으면 문장의 판정(1/0)으로 바로잡는다.
    var numbered = choices.length >= 3 && choices.every(function (c, i) { return c.value === i + 1; });
    var judged = choices.map(function (c) { return verdict(c.text); });
    var onOff = choices.every(function (c) { return c.word; });
    if (numbered && judged.every(function (v) { return v !== null; })) {
      choices.forEach(function (c, i) { c.value = judged[i]; });
      onOff = true;
    }
    if (onOff) value = ['전기가 통하는 정도', ''];
    var max = Math.max.apply(null, choices.map(function (c) { return c.value; }).concat([0])) || 1;
    var lets = 'v = ' + selectExpr('c', choices.map(function (c) { return String(c.value); })) + '; m = ' + max;
    var art = '';
    var kind = first(f, '그림', '막대');
    if (kind === '전구') {
      art = '<path d="M230 150 H100 V290 H500 V150 H370 M270 290 V275 M270 305 V290 M300 265 V310" fill="none" stroke="#64748B" stroke-width="8"/><path d="M280 220 V242 H320 V220" fill="none" stroke="#64748B" stroke-width="12"/><circle cx="300" cy="145" r="70" fill="#FACC15" stroke="#92400E" stroke-width="4" data-attr="fill-opacity: 0.08 + 0.92 * v / m"/>';
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4;
        art += '<line' + attr('x1', 300 + 90 * Math.cos(a)) + attr('y1', 145 + 90 * Math.sin(a)) + attr('x2', 300 + 112 * Math.cos(a)) + attr('y2', 145 + 112 * Math.sin(a)) + ' stroke="#CA8A04" stroke-width="6" data-attr="opacity: v > 0 ? v / m : 0"/>';
      }
      art = svg(art + svgText(300, 337, '전구 밝기(모형)'), '전구 밝기 모형');
    } else if (kind === '점') {
      var count = Math.max(1, Math.ceil(max));
      var cols = Math.ceil(Math.sqrt(count * 1.6));
      var rows = Math.ceil(count / cols);
      var gap = Math.min(52, 500 / cols, 260 / rows);
      for (var j = 0; j < count; j++) art += '<circle' + attr('cx', 300 + (j % cols - (cols - 1) / 2) * gap) + attr('cy', 150 + (Math.floor(j / cols) - (rows - 1) / 2) * gap) + attr('r', Math.min(18, gap / 3)) + ' fill="#2563EB"' + attr('data-attr', 'opacity: v >= ' + (j + 1) + ' ? 1 : 0.12') + '/>';
      art = svg(art + svgText(300, 330, '입자 수(모형)'), '값에 따른 점 개수 모형');
    } else art = '<div style="padding:120px 24px 0"><div class="bar" data-value="v"' + attr('data-max', max) + '></div><p>' + output('v', value[1]) + ' (모형)</p></div>';
    var right = (block.text ? '<p class="q">' + inline(block.text) + '</p>' : '') + buttons('c', choices.map(function (c) { return c.label; }));
    if (!onOff) right += '<p>' + inline(value[0]) + ' ' + output('v', value[1]) + ' (모형)</p>';
    choices.forEach(function (c, i) { right += '<p' + attr('data-show', 'c == ' + (i + 1)) + '>' + inline(c.text) + '</p>'; });
    return model('choice', lets, art, right);
  }

  function superscript(value) { return String(value).replace(/\d/g, function (n) { return '⁰¹²³⁴⁵⁶⁷⁸⁹'.charAt(Number(n)); }); }
  function shells(z) {
    var result = [];
    [2, 8, 8, 2].forEach(function (cap) { var n = Math.min(cap, z); if (n > 0) result.push(n); z -= n; });
    return result;
  }
  // Above 20 only the outer shell is shown (ground-state neutral main/transition atoms).
  function outerElectrons(z) {
    if (z <= 20) { var s = shells(z); return s[s.length - 1]; }
    var ends = [2, 10, 18, 36, 54, 86, 118];
    var start = 18, end = 36;
    for (var i = 3; i < ends.length; i++) { if (z <= ends[i]) { start = ends[i - 1]; end = ends[i]; break; } }
    var pos = z - start;
    if (pos <= 2) return pos;
    if (z > end - 6) return z - (end - 8);
    return [24, 29, 41, 42, 44, 45, 47, 78, 79].indexOf(z) >= 0 ? 1 : z === 46 ? 0 : 2;
  }
  function renderElectron(block) {
    var atoms = items(block).map(function (line) {
      var m = /^(\S+)\s+(\S+)\s+(\d+)\s+(잃음|얻음)\s+(\d+)$/.exec(unbullet(line.text));
      if (!m || Number(m[3]) < 1 || Number(m[3]) > 118 || Number(m[5]) < 1 || (m[4] === '잃음' && Number(m[5]) > Number(m[3]))) return null;
      var lose = m[4] === '잃음';
      return { symbol: m[1], name: m[2], z: Number(m[3]), k: Number(m[5]), lose: lose,
        formula: m[1] + (Number(m[5]) === 1 ? '' : superscript(m[5])) + (lose ? '⁺' : '⁻'),
        ion: lose ? m[2] + ' 이온' : m[2].replace(/소$/, '') + '화 이온' };
    }).filter(Boolean);
    if (!atoms.length) return fallback(block);
    var lets = 'z = ' + selectExpr('el', atoms.map(function (a) { return String(a.z); })) + '; d = ' + selectExpr('el', atoms.map(function (a) { return String(a.lose ? -a.k : a.k); })) + '; ne = z + (st == 2 ? d : 0); q = z - ne; f = ' + selectExpr('el', atoms.map(function (a) { return quoted(a.formula); })) + '; nm = ' + selectExpr('el', atoms.map(function (a) { return quoted(a.ion); }));
    var art = '';
    atoms.forEach(function (atom, ai) {
      art += '<g' + attr('data-show', 'el == ' + (ai + 1)) + '><circle cx="265" cy="170" r="34" fill="#DC2626"/>' + svgText(265, 178, '+' + atom.z, ' style="fill:white"');
      var neutral = atom.z <= 20 ? shells(atom.z) : [outerElectrons(atom.z)];
      var finalShells = atom.z <= 20 ? shells(atom.z + (atom.lose ? -atom.k : atom.k)) : [Math.max(0, neutral[0] + (atom.lose ? -atom.k : atom.k))];
      var count = Math.max(neutral.length, finalShells.length);
      for (var si = 0; si < (atom.z <= 20 ? Math.max(3, count) : 1); si++) art += '<circle cx="265" cy="170"' + attr('r', atom.z <= 20 ? [70, 110, 150, 160][si] : 150) + ' fill="none" stroke="#94A3B8" stroke-width="2" stroke-dasharray="6 6"/>';
      var lostIndex = 0, gainedIndex = 0;
      for (var shell = 0; shell < count; shell++) {
        var n0 = neutral[shell] || 0;
        var n1 = finalShells[shell] || 0;
        var slots = Math.max(n0, n1);
        for (var ei = 0; ei < slots; ei++) {
          var angle = -Math.PI / 2 + ei * 2 * Math.PI / slots;
          var radius = atom.z <= 20 ? [70, 110, 150, 160][shell] : 150;
          var sx = Math.round(265 + radius * Math.cos(angle));
          var sy = Math.round(170 + radius * Math.sin(angle));
          var fromX = sx, fromY = sy, toX = sx, toY = sy;
          var moving = false;
          if (ei >= n1 && atom.lose) { toX = 560; toY = 95 + 150 * lostIndex++ / Math.max(1, atom.k - 1); moving = true; }
          if (ei >= n0 && !atom.lose) { fromX = 560; fromY = 95 + 150 * gainedIndex++ / Math.max(1, atom.k - 1); moving = true; }
          var expression = 'cx: st == 2 ? ' + toX + ' : ' + fromX + '; cy: st == 2 ? ' + toY + ' : ' + fromY;
          if (moving) expression += '; opacity: st == 2 ? ' + (atom.lose ? '0.35' : '1') + ' : ' + (atom.lose ? '1' : '0.35');
          art += '<circle r="9" fill="#2563EB"' + attr('data-attr', expression) + '/>';
        }
      }
      if (atom.z > 20) art += svgText(300, 335, '안쪽 껍질은 생략(모형)', ' style="font-size:22px"');
      art += '</g>';
    });
    var right = '<div data-at="1">' + buttons('el', atoms.map(function (a) { return a.symbol; }));
    right += '<p>양성자 ' + output('z', '개') + ' · 전자 ' + output('ne', '개') + '</p><p>전하의 합 ' + output("q > 0 ? '+' + q : q == 0 ? '0' : q") + ' (모형)</p>';
    right += '<p data-show="st == 1">양성자 수와 전자 수가 같아 전기적으로 중성이다.</p><p data-show="st == 2 &amp;&amp; q > 0">전자를 잃어 (+)전하가 더 많아졌다. 양이온 <b>' + output('f') + '</b>, ' + output('nm') + '이다.</p><p data-show="st == 2 &amp;&amp; q &lt; 0">전자를 얻어 (−)전하가 더 많아졌다. 음이온 <b>' + output('f') + '</b>, ' + output('nm') + '이다.</p></div>';
    return '<div class="calc lite-model lite-electron" data-ai="모형" data-activity' + attr('data-let', lets) + '><div class="reveal" data-name="st" data-stops="시작|원자|이온"><div' + attr('style', GRID) + '><div class="veil">' + svg(art, '전자를 잃거나 얻어 이온이 되는 모형') + '</div>' + right + '</div></div></div>';
  }

  function safeVariable(name, fallback, taken) { return /^[a-zA-Z]$/.test(name) && RESERVED.indexOf(name) < 0 && taken.indexOf(name) < 0 ? name : fallback; }
  function replaceVariables(expr, map) {
    return expr.replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|\b[A-Za-z_][A-Za-z_0-9]*\b/g, function (token) { return Object.prototype.hasOwnProperty.call(map, token) ? map[token] : token; });
  }
  function cleanExpr(expr) { return expr.replace(/\bMath\s*\.\s*/g, ''); }
  function renderGraph(block) {
    var f = fields(block);
    var horizontal = pipes(first(f, '가로', 't 0~10 1 | 시간 | 초'));
    var m = /^(\S+)\s+(-?[\d.]+)\s*~\s*(-?[\d.]+)\s+([\d.]+)$/.exec(horizontal[0]);
    var vertical = pipes(first(f, '세로', '0~10 | 값'));
    var vm = /^(-?[\d.]+)\s*~\s*(-?[\d.]+)$/.exec(vertical[0]);
    if (!m || !vm || ![m[2], m[3], m[4], vm[1], vm[2]].every(function (n) { return isFinite(Number(n)); }) || Number(m[3]) <= Number(m[2]) || Number(m[4]) <= 0 || Number(vm[2]) <= Number(vm[1])) return fallback(block);
    var raw = m[1];
    var variable = safeVariable(raw, 'a', ['y']);
    var rename = Object.create(null);
    rename[raw] = variable;
    var choice = first(f, '고르기', '');
    var cm = /^(\S+)\s*=\s*(.*)$/.exec(choice);
    var controls = '';
    if (cm) {
      var chosen = safeVariable(cm[1], variable === 'c' ? 'b' : 'c', ['y', variable]);
      // If the same input name was used twice, the horizontal axis owns it.
      if (cm[1] !== raw) rename[cm[1]] = chosen;
      var values = cm[2].split(',').map(pipes).filter(function (p) { return p[0] !== '' && isFinite(Number(p[0])); });
      controls += '<div class="lite-buttons">' + values.map(function (v, i) { return button(chosen, Number(v[0]), v[1] || v[0], i === 0); }).join('') + '</div>';
    }
    var expr = replaceVariables(cleanExpr(first(f, '식', '0')), rename);
    var curveMap = {}; curveMap[variable] = 'x';
    var line = replaceVariables(expr, curveMap);
    var play = horizontal.indexOf('재생') >= 0;
    var xlabel = (horizontal[1] || variable) + (horizontal[2] ? '(' + horizontal[2] + ')' : '');
    var ylabel = (vertical[1] || '값') + (vertical[2] ? '(' + vertical[2] + ')' : '');
    var art = '<figure class="plot"' + attr('data-x', m[2] + ', ' + m[3]) + attr('data-y', vm[1] + ', ' + vm[2]) + ' data-height="320"' + attr('data-xlabel', xlabel) + attr('data-ylabel', ylabel) + '><i' + attr('data-line', line) + (play ? attr('data-x', m[2] + ', max(' + variable + ', ' + (Number(m[2]) + 0.01) + ')') : '') + '></i><i' + attr('data-point', variable + ', y') + '></i></figure>';
    var right = (block.text ? '<p class="q">' + inline(block.text) + '</p>' : '') + controls;
    right += '<p>' + inline(horizontal[1] || variable) + ' ' + output(variable, horizontal[2]) + '</p><input type="range"' + attr('name', variable) + attr('min', m[2]) + attr('max', m[3]) + attr('step', m[4]) + attr('value', m[2]) + (play ? ' data-play="8"' : '') + attr('aria-label', horizontal[1] || '가로 값') + '>';
    right += '<p>' + inline(vertical[1] || '값') + ' ' + output('y', vertical[2], 1) + ' (모형)</p>';
    (f['문장'] || []).forEach(function (sentence) {
      var s = /^(.*?)\s*(?:→|->)\s*(.*)$/.exec(sentence);
      if (s) right += '<p' + attr('data-show', replaceVariables(cleanExpr(s[1]), rename)) + '>' + inline(s[2]) + '</p>';
      else right += '<p>' + inline(sentence) + '</p>';
    });
    return model('graph', 'y = ' + expr, art, right);
  }

  function renderDiffusion(block) {
    var f = fields(block);
    var membrane = pipes(first(f, '막', '없음 | 왼쪽 | 오른쪽'));
    var species = items(block).map(function (line) {
      var m = /^(\S+)\s+(\d+)\s+(\d+)\s+(통과|막힘)\s+(\S+)$/.exec(unbullet(line.text));
      return m ? { name: m[1], left: Number(m[2]), right: Number(m[3]), pass: m[4] === '통과', color: COLORS[m[5]] || COLORS['회색'] } : null;
    }).filter(Boolean);
    if (!species.length) return fallback(block);
    var labels = (membrane[1] || '왼쪽') + '|' + (membrane[2] || '오른쪽');
    var art = '<figure class="particles"' + (membrane[0] === '있음' ? ' data-membrane="0.5"' : '') + attr('data-labels', labels) + ' data-height="300">';
    var right = '<p>입자의 움직임(모형)</p>';
    species.forEach(function (s, i) {
      var l = 'a' + (i + 1) + 'L', r = 'a' + (i + 1) + 'R';
      art += '<i' + attr('data-kind', s.name) + attr('data-left', s.left) + attr('data-right', s.right) + attr('data-pass', s.pass ? 1 : 0) + attr('data-color', s.color) + attr('data-size', s.pass ? 5 : 8) + attr('data-count', l + ', ' + r) + '></i>';
      right += '<p>' + inline(s.name) + ': ' + inline(membrane[1] || '왼쪽') + ' ' + output(l, '개') + ', ' + inline(membrane[2] || '오른쪽') + ' ' + output(r, '개') + '</p>';
      right += '<div class="bar"' + attr('data-value', r) + attr('data-max', Math.max(1, s.left + s.right)) + attr('style', '--bar-c:' + s.color) + attr('aria-label', s.name + ' 오른쪽 개수') + '></div>';
    });
    return model('diffusion', '', art + '</figure>', right);
  }

  // One set of peaks supplies both the static SVG and the engine expressions.
  var SPECTRUM = [
    { id: 'ca', name: '엽록소 a', aliases: ['엽록소a', '클로로필a'], color: '#166534', width: 4, peaks: [[430, 16, 0.95], [410, 14, 0.35], [662, 12, 0.80], [615, 18, 0.14]] },
    { id: 'cb', name: '엽록소 b', aliases: ['엽록소b', '클로로필b'], color: '#0F766E', width: 4, dash: '8 6', peaks: [[455, 14, 1.0], [430, 14, 0.25], [642, 11, 0.55], [595, 16, 0.10]] },
    { id: 'cc', name: '카로티노이드', aliases: ['카로티노이드', '카로틴', '잔토필'], color: '#C2410C', width: 4, peaks: [[425, 12, 0.55], [450, 14, 0.85], [480, 14, 0.80]] },
    { id: 'cp', name: '광합성 속도', aliases: ['광합성속도', '작용스펙트럼'], color: '#111827', width: 3, peaks: [[425, 55, 0.80], [475, 25, 0.22], [560, 70, 0.30], [672, 22, 0.66], [635, 30, 0.22]] }
  ];
  function bioKey(text) { return String(text).replace(/\s+/g, '').toLowerCase(); }
  function prepareSpectrum(block, warnings) {
    block.series = [];
    items(block).forEach(function (line) {
      var name = pipes(unbullet(line.text))[0], key = bioKey(name);
      var found = SPECTRUM.filter(function (s) { return s.aliases.indexOf(key) >= 0; })[0];
      if (!found) warnings.push({ line: line.line, message: '스펙트럼 항목을 알 수 없어 뺐다: ' + name });
      else if (block.series.indexOf(found.id) < 0) block.series.push(found.id);
    });
    if (!block.series.length) block.series = ['ca', 'cb', 'cp'];
  }
  function spectrumExpr(series) {
    var sum = series.peaks.map(function (p) { return p[2] + ' * exp(-(((w - ' + p[0] + ') / ' + p[1] + ') ^ 2))'; }).join(' + ');
    return series.id === 'cp' ? 'min(1, ' + sum + ')' : sum;
  }
  function spectrumValue(series, wavelength) {
    var sum = 0;
    series.peaks.forEach(function (p) { sum += p[2] * Math.exp(-Math.pow((wavelength - p[0]) / p[1], 2)); });
    return series.id === 'cp' ? Math.min(1, sum) : sum;
  }
  function renderSpectrum(block) {
    var series = block.series.map(function (id) { return SPECTRUM.filter(function (s) { return s.id === id; })[0]; });
    var bands = [[450, '청자색', '#6D28D9'], [500, '청색', '#2563EB'], [560, '초록색', '#16A34A'], [600, '황색', '#EAB308'], [650, '적황색', '#F97316'], [701, '적색', '#DC2626']];
    function bandExpr(index) {
      return bands.map(function (b, i) { return (i < bands.length - 1 ? 'w < ' + b[0] + ' ? ' : '') + quoted(b[index]) + (i < bands.length - 1 ? ' : ' : ''); }).join('');
    }
    var lets = SPECTRUM.map(function (s) { return s.id + ' = ' + spectrumExpr(s); }).join('; ') + '; nm = ' + bandExpr(1) + '; col = ' + bandExpr(2);
    var gradient = 'lite-spectrum-' + block.line;
    var stops = [[400, '#6D28D9'], [450, '#2563EB'], [495, '#0EA5E9'], [525, '#16A34A'], [565, '#84CC16'], [585, '#FACC15'], [610, '#F97316'], [650, '#EF4444'], [700, '#991B1B']];
    var art = '<defs><linearGradient' + attr('id', gradient) + '>' + stops.map(function (s) { return '<stop' + attr('offset', (s[0] - 400) / 3 + '%') + attr('stop-color', s[1]) + '/>'; }).join('') + '</linearGradient></defs>';
    art += '<rect x="60" y="30" width="520" height="260"' + attr('fill', 'url(#' + gradient + ')') + ' opacity="0.28"/>';
    [0, 0.5, 1].forEach(function (v) {
      var y = 290 - 260 * v;
      art += '<line x1="60" x2="580"' + attr('y1', y) + attr('y2', y) + ' stroke="#64748B" stroke-opacity="0.25"/>';
      art += '<text x="50"' + attr('y', y + 7) + ' text-anchor="end" font-size="20">' + v + '</text>';
    });
    for (var wavelength = 400; wavelength <= 700; wavelength += 50) {
      var x = 60 + (wavelength - 400) * 520 / 300;
      art += '<line' + attr('x1', x) + attr('x2', x) + ' y1="290" y2="296" stroke="#1F2937"/>';
      art += '<text' + attr('x', x) + ' y="316" text-anchor="middle" font-size="20">' + wavelength + '</text>';
    }
    art += '<path d="M60 30V290H580" fill="none" stroke="#1F2937" stroke-width="2"/>';
    art += '<text x="320" y="338" text-anchor="middle" font-size="20">파장(nm)</text><text transform="translate(18 160) rotate(-90)" text-anchor="middle" font-size="20">상대값(모형)</text>';
    series.forEach(function (s) {
      var points = [];
      for (var w = 400; w <= 700; w += 2) points.push((60 + (w - 400) * 520 / 300).toFixed(2) + ',' + (290 - 260 * spectrumValue(s, w)).toFixed(2));
      art += '<polyline' + attr('data-series', s.id) + attr('points', points.join(' ')) + ' fill="none"' + attr('stroke', s.color) + attr('stroke-width', s.width) + (s.dash ? attr('stroke-dasharray', s.dash) : '') + '/>';
    });
    var cursor = '60 + (w - 400) * 520 / 300';
    art += '<line y1="30" y2="290" stroke="#475569" stroke-width="2"' + attr('data-attr', 'x1: ' + cursor + '; x2: ' + cursor) + '/>';
    series.forEach(function (s) {
      art += '<circle r="9"' + attr('fill', s.color) + attr('data-attr', 'cx: ' + cursor + '; cy: 290 - 260 * ' + s.id) + '/>';
    });
    art += '<g font-size="20">' + series.map(function (s, i) {
      var y = 52 + i * 27;
      return '<line x1="240" x2="270"' + attr('y1', y - 7) + attr('y2', y - 7) + attr('stroke', s.color) + attr('stroke-width', s.width) + (s.dash ? attr('stroke-dasharray', s.dash) : '') + '/><text x="278"' + attr('y', y) + '>' + esc(s.name) + '</text>';
    }).join('') + '</g>';
    var right = block.text && !block.asTitle ? '<p class="q">' + inline(block.text) + '</p>' : '';
    right += '<input type="range" name="w" min="400" max="700" step="5" value="450" aria-label="파장">';
    right += '<p class="lite-wavelength"><span>파장 ' + output('w') + ' nm</span><svg class="lite-swatch" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" data-attr="fill: col"/></svg>' + output('nm') + '</p>';
    series.forEach(function (s) {
      right += '<p>' + esc(s.name) + (s.id === 'cp' ? ' ' : ' 흡수율 ') + output(s.id + ' * 100', '%', 0) + '</p><div class="bar"' + attr('data-value', s.id) + ' data-max="1"' + attr('style', '--bar-c:' + s.color) + attr('aria-label', s.name + (s.id === 'cp' ? '' : ' 흡수율')) + '></div>';
    });
    right += '<p class="lite-model-note">(모형) 교과서 그래프 모양을 본뜬 상대값이다.</p>';
    return model('spectrum', lets, svg(art, '파장에 따른 색소의 흡수율과 광합성 속도 모형'), right);
  }

  var STRUCTURE_PARTS = {
    outer: ['외막'], inner: ['내막'], space: ['막사이공간', '막간공간'],
    stroma: ['스트로마'], thylakoid: ['타이라코이드', '틸라코이드', '타이라코이드막'],
    granum: ['그라나', '그라눔'], lumen: ['타이라코이드내부', '틸라코이드내부', '루멘', '타이라코이드안'],
    crista: ['크리스타'], matrix: ['기질', '미토콘드리아기질', '매트릭스']
  };
  function structureKey(name) {
    var key = bioKey(name), keys = Object.keys(STRUCTURE_PARTS);
    for (var i = 0; i < keys.length; i++) if (STRUCTURE_PARTS[keys[i]].indexOf(key) >= 0) return keys[i];
    return '';
  }
  function prepareStructure(block, warnings) {
    var head = pipes(block.text);
    block.organelle = /엽록체/.test(head[0]) ? 'chloroplast' : /미토콘드리아|마이토콘드리아/.test(head[0]) ? 'mitochondrion' : '';
    block.question = head.length > 1 ? head.slice(1).join(' | ') : /^(엽록체|미토콘드리아|마이토콘드리아)$/.test(head[0]) || block.asTitle ? '' : block.text;
    block.parts = [];
    items(block).forEach(function (line) {
      var p = pipes(unbullet(line.text));
      if (!p[0] || block.parts.length >= 6) {
        warnings.push({ line: line.line, message: '구조 항목은 이름이 있는 것 6개까지 받는다: ' + p[0] });
        return;
      }
      block.parts.push({ name: p[0], text: p.slice(1).join(' | '), key: structureKey(p[0]), line: line.line });
    });
    if (!block.organelle) block.parts.some(function (p) {
      if (['stroma', 'thylakoid', 'granum', 'lumen'].indexOf(p.key) >= 0) block.organelle = 'chloroplast';
      if (['crista', 'matrix'].indexOf(p.key) >= 0) block.organelle = 'mitochondrion';
      return !!block.organelle;
    });
    if (!block.organelle || !block.parts.length) {
      warnings.push({ line: block.line, message: '소기관이나 구조 항목을 알 수 없어 글로 표시한다: ' + block.source });
      return;
    }
    var allowed = ['outer', 'inner', 'space'].concat(block.organelle === 'chloroplast' ? ['stroma', 'thylakoid', 'granum', 'lumen'] : ['crista', 'matrix']);
    block.parts.forEach(function (p) {
      if (allowed.indexOf(p.key) < 0) {
        warnings.push({ line: p.line, message: '구조 그림에 강조할 부분이 없다: ' + p.name });
        p.key = '';
      }
    });
  }
  function structureCondition(block, key) {
    var choices = [];
    block.parts.forEach(function (p, i) { if (p.key === key) choices.push('pt == ' + (i + 1)); });
    return choices.join(' || ') || 'false';
  }
  function structureColor(block, key, property, original) {
    return attr('data-attr', property + ': ' + structureCondition(block, key) + " ? '#F59E0B' : " + quoted(original));
  }
  function chloroplastArt(block) {
    var art = '<ellipse cx="300" cy="175" rx="270" ry="125" fill="#D9F99D" stroke="#166534" stroke-width="5"' + attr('data-attr', 'fill: ' + structureCondition(block, 'space') + " ? '#F59E0B' : '#D9F99D'; stroke: " + structureCondition(block, 'outer') + " ? '#F59E0B' : '#166534'; stroke-width: " + structureCondition(block, 'outer') + ' ? 8 : 5') + '/>';
    art += '<ellipse cx="300" cy="175" rx="258" ry="113" fill="#ECFCCB" stroke="#15803D" stroke-width="3"' + attr('data-attr', 'fill: ' + structureCondition(block, 'stroma') + " ? '#F59E0B' : '#ECFCCB'; stroke: " + structureCondition(block, 'inner') + " ? '#F59E0B' : '#15803D'; stroke-width: " + structureCondition(block, 'inner') + ' ? 7 : 3') + '/>';
    var stacks = [[88, 148], [178, 120], [268, 146], [358, 122], [448, 148]];
    stacks.forEach(function (s, i) {
      if (i < stacks.length - 1) art += '<path' + attr('d', 'M' + (s[0] + 56) + ' ' + (s[1] + 34) + 'L' + stacks[i + 1][0] + ' ' + (stacks[i + 1][1] + 34)) + ' fill="none" stroke="#4D7C0F" stroke-width="7"/>';
    });
    stacks.forEach(function (s, i) {
      for (var disk = 0; disk < 6; disk++) {
        var middle = i === 2 && disk === 2, y = s[1] + disk * 12;
        art += '<rect' + attr('x', s[0]) + attr('y', y) + ' width="56" height="11" rx="5" fill="#65A30D" stroke="#166534" stroke-width="2"' + (middle ? attr('data-attr', 'stroke: ' + structureCondition(block, 'thylakoid') + " ? '#F59E0B' : '#166534'; stroke-width: " + structureCondition(block, 'thylakoid') + ' ? 5 : 2') : '') + '/>';
        art += '<rect' + attr('x', s[0] + 5) + attr('y', y + 3) + ' width="46" height="5" rx="2" fill="#D9F99D"' + (middle ? structureColor(block, 'lumen', 'fill', '#D9F99D') : '') + '/>';
      }
    });
    art += '<rect x="262" y="140" width="68" height="83" rx="8" fill="none" stroke-width="5"' + structureColor(block, 'granum', 'stroke', 'none') + '/>';
    return art;
  }
  function mitochondrionArt(block) {
    var art = '<ellipse cx="300" cy="175" rx="270" ry="125" fill="#FED7AA" stroke="#9A3412" stroke-width="5"' + attr('data-attr', 'fill: ' + structureCondition(block, 'space') + " ? '#F59E0B' : '#FED7AA'; stroke: " + structureCondition(block, 'outer') + " ? '#F59E0B' : '#9A3412'; stroke-width: " + structureCondition(block, 'outer') + ' ? 8 : 5') + '/>';
    // A single closed inner membrane: each fold remains continuous with it.
    var inner = 'M58 175 C58 112 110 82 176 70 L176 157 Q176 177 188 177 Q200 177 200 157 L200 68 Q236 62 265 65 L265 162 Q265 190 277 190 Q289 190 289 162 L289 65 Q325 63 354 69 L354 151 Q354 174 366 174 Q378 174 378 151 L378 75 C471 92 542 126 542 175 C542 224 510 250 456 268 L456 221 Q456 201 444 201 Q432 201 432 221 L432 275 Q395 284 362 284 L362 229 Q362 207 350 207 Q338 207 338 229 L338 284 Q306 287 278 282 L278 223 Q278 201 266 201 Q254 201 254 223 L254 280 Q218 279 190 271 L190 220 Q190 200 178 200 Q166 200 166 220 L166 263 C100 244 58 224 58 175 Z';
    art += '<path' + attr('d', inner) + ' fill="#FFF7ED" stroke="#C2410C" stroke-width="4"' + attr('data-attr', 'fill: ' + structureCondition(block, 'matrix') + " ? '#F59E0B' : '#FFF7ED'; stroke: " + structureCondition(block, 'inner') + " ? '#F59E0B' : '#C2410C'; stroke-width: " + structureCondition(block, 'inner') + ' ? 7 : 4') + '/>';
    art += '<path d="M265 65 L265 162 Q265 190 277 190 Q289 190 289 162 L289 65" fill="none" stroke-width="7"' + structureColor(block, 'crista', 'stroke', 'none') + '/>';
    return art;
  }
  function renderStructure(block) {
    if (!block.organelle || !block.parts.length) return fallback(block);
    var chloroplast = block.organelle === 'chloroplast';
    var art = chloroplast ? chloroplastArt(block) : mitochondrionArt(block);
    // Label position, elbow, and target; only the selected label is visible.
    var labels = chloroplast ? {
      outer: [300, 27, 300, 35, 300, 50], inner: [482, 62, 482, 72, 478, 94], space: [128, 38, 144, 44, 155, 76],
      stroma: [148, 318, 178, 291, 210, 247], thylakoid: [440, 271, 397, 245, 324, 175],
      granum: [430, 306, 390, 279, 330, 217], lumen: [407, 290, 367, 260, 306, 176]
    } : {
      outer: [300, 27, 300, 35, 300, 50], inner: [485, 81, 488, 91, 484, 108], space: [126, 46, 140, 53, 158, 75],
      crista: [420, 317, 383, 288, 289, 174], matrix: [491, 300, 485, 269, 485, 196]
    };
    block.parts.forEach(function (p, i) {
      var a = labels[p.key];
      if (!a) return;
      art += '<g' + attr('data-show', 'pt == ' + (i + 1)) + '><path' + attr('d', 'M' + a[0] + ' ' + (a[1] - 8) + 'L' + a[2] + ' ' + a[3] + 'L' + a[4] + ' ' + a[5]) + ' fill="none" stroke="#92400E" stroke-width="2"/>';
      art += svgText(a[0], a[1], p.name, ' style="font-size:22px;paint-order:stroke;stroke:#fff;stroke-width:4px;stroke-linejoin:round"') + '</g>';
    });
    var right = (block.question ? '<p class="q">' + inline(block.question) + '</p>' : '') + buttons('pt', block.parts.map(function (p) { return p.name; }));
    right += block.parts.map(function (p, i) { return '<p' + attr('data-show', 'pt == ' + (i + 1)) + '><b>' + inline(p.name) + '</b>' + (p.text ? ' ' + inline(p.text) : '') + '</p>'; }).join('');
    right += '<p class="lite-model-note">(모형) 단순화한 그림이다.</p>';
    return model('structure', '', svg(art, (chloroplast ? '엽록체' : '미토콘드리아') + ' 구조 모형'), right);
  }

  function renderStages(block) {
    var stages = items(block).map(function (l) { return pipes(unbullet(l.text)); });
    if (!stages.length) return fallback(block);
    return '<div class="reveal lite-stages" data-ai="모형"' + attr('data-stops', '시작|' + stages.map(function (s) { return s[0]; }).join('|')) + '>' + (block.text ? '<p class="q">' + inline(block.text) + ' (모형)</p>' : '<p>(모형)</p>') + stages.map(function (s, i) {
      var p = /^그림\s+(.+)$/.exec(s[2] || '');
      return '<div' + attr('data-only', i + 1) + '><p>' + inline(s[1] || s[0]) + '</p>' + (p ? figure(p[1], s[0]) : '') + '</div>';
    }).join('') + '</div>';
  }
  function renderQuiz(block) {
    var choices = items(block).map(function (l) { var p = pipes(unbullet(l.text)); return { text: p[0], why: p.slice(1).join(' | '), ok: l.text.charAt(0) === '*' }; });
    if (!choices.length) return fallback(block);
    return (block.text && !block.asTitle ? '<p class="q" data-n="?">' + inline(block.text) + '</p>' : '') + '<div class="quiz"' + (choices.length > 4 ? ' data-cols="2"' : '') + (choices.filter(function (c) { return c.ok; }).length > 1 ? ' data-multi' : '') + '>' + shuffled(choices, block.text).map(function (c) { return '<button type="button" class="opt"' + (c.ok ? ' data-ok' : '') + attr('data-why', c.why) + '>' + inline(c.text) + '</button>'; }).join('') + '</div>';
  }
  function renderSort(block) {
    var bins = pipes(block.text).filter(Boolean);
    var cards = items(block).map(function (line) {
      var p = pipes(unbullet(line.text));
      var m = /^(.*?)\s*=\s*(.*)$/.exec(p[0]);
      return m ? { name: m[1], bin: m[2].trim(), why: p.slice(1).join(' | ') } : null;
    }).filter(Boolean);
    // 약한 모델은 첫 줄에 '칸1 | 칸2' 대신 물음을 쓴다. 그러면 카드의 '= 칸'에서 칸을 모은다.
    var question = '';
    if (bins.length < 2) {
      question = block.asTitle ? '' : block.text;
      bins = [];
      cards.forEach(function (c) { if (bins.indexOf(c.bin) < 0) bins.push(c.bin); });
    }
    var key = function (s) { return String(s).replace(/[\s'"‘’“”()（）]/g, ''); };
    function findBin(name) {
      var k = key(name);
      for (var i = 0; i < bins.length; i++) if (key(bins[i]) === k) return i;
      for (var j = 0; j < bins.length; j++) if (key(bins[j]).indexOf(k) >= 0 || k.indexOf(key(bins[j])) >= 0) return j;
      // '= 통한다'와 칸 '전기가 통하는 물질'처럼 말이 조금 다를 때: 겹치는 글자가 가장 긴 칸,
      // 같으면 부정어(않·없·못·안) 유무가 같은 칸을 고른다.
      var neg = function (s) { return /않|없|못|안\s|아니/.test(s); };
      // 한글은 활용하면 음절이 바뀐다(통한다/통하는). 자모로 풀어서 겹친 길이를 잰다.
      var jamo = function (s) { return s.normalize ? s.normalize('NFD') : s; };
      var kj = jamo(k);
      var best = -1, bestScore = 3;
      bins.forEach(function (b, bi) {
        var kb = jamo(key(b)), common = 0;
        for (var a = 0; a < kj.length; a++) for (var z = a + common + 1; z <= kj.length; z++) { if (kb.indexOf(kj.slice(a, z)) >= 0) common = z - a; else break; }
        var score = common + (neg(name) === neg(b) ? 1.5 : 0);
        if (common >= 4 && score > bestScore) { best = bi; bestScore = score; }
      });
      return best;
    }
    var html = (question ? '<p class="q" data-n="?">' + inline(question) + '</p>' : '') + '<div class="sort">' + bins.slice(0, 4).map(function (bin, i) { return '<div class="bin"' + attr('data-bin', 'b' + (i + 1)) + '><h3>' + inline(bin) + '</h3></div>'; }).join('');
    cards.forEach(function (c) {
      var at = findBin(c.bin);
      if (at < 0 || at > 3) return;
      var p = [c.name, c.why];
      var m = [null, c.name];
      html += '<span' + attr('data-bin', 'b' + (at + 1)) + attr('data-why', p.slice(1).join(' | ')) + ' data-hint="칸 이름의 특징을 다시 보자.">' + inline(m[1]) + '</span>';
    });
    return html + '</div>';
  }
  function renderOrder(block) {
    // 엔진은 맞은 칸 아래에 이유를 붙여 길어진다. 항목이 5개 이상이면 이유를 빼서 다 푼 뒤 넘치지 않게 한다.
    var list = items(block);
    var keepWhy = list.length < 5;
    return (block.text && !block.asTitle ? '<p class="q" data-n="?">' + inline(block.text) + '</p>' : '') + '<ol class="order">' + list.map(function (l) { var p = pipes(unbullet(l.text)); return '<li' + (keepWhy ? attr('data-why', p.slice(1).join(' | ')) : '') + '>' + inline(p[0]) + '</li>'; }).join('') + '</ol>';
  }
  function renderBlock(b) {
    switch (b.type) {
      case 'paragraph': return '<p>' + inline(b.text) + '</p>';
      case 'step': return '<p class="step">' + inline(b.text) + '</p>';
      case 'question': return '<p class="q" data-n="Q">' + inline(b.text) + '</p>';
      case 'answer': return '<div class="answer"><p>' + inline(b.text) + '</p></div>';
      case 'kicker': return '<p class="kicker">' + inline(b.text) + '</p>';
      case 'ai': return '<p data-ai="AI 작성">' + inline(b.text) + '</p>';
      case 'figure': return figure(b.ppt, b.text, b.auto);
      case 'video': return '<div class="video"' + attr('data-youtube', b.url) + attr('data-title', b.text) + '></div>';
      case 'link': return '<p><a class="link-card"' + attr('href', b.url) + ' target="_blank" rel="noopener">' + inline(b.text) + '</a></p>';
      case 'table': return '<table class="compare"><thead><tr>' + b.rows[0].map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>' + b.rows.slice(1).map(function (row) { return '<tr>' + row.map(function (c, i) { var tag = i === 0 ? 'th' : 'td'; return '<' + tag + '>' + inline(c) + '</' + tag + '>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
      case 'quiz': return renderQuiz(b);
      case 'sort': return renderSort(b);
      case 'order': return renderOrder(b);
      case 'drift': return renderDrift(b);
      case 'choice': return renderChoice(b);
      case 'electron': return renderElectron(b);
      case 'graph': return renderGraph(b);
      case 'diffusion': return renderDiffusion(b);
      case 'stages': return renderStages(b);
      case 'spectrum': return renderSpectrum(b);
      case 'structure': return renderStructure(b);
      default: return fallback(b);
    }
  }
  function renderSlide(slide) {
    var attrs = attr('id', slide.id) + attr('data-title', slide.title) + (slide.section ? attr('data-sec', slide.section) : '') + (slide.bg ? attr('data-bg', slide.bg) : '');
    if (slide.type === 'cover') return '<section class="slide cover"' + attrs + '><div class="band">' + (slide.blocks.length ? renderBlock(slide.blocks[0]) : '') + '</div><h1>' + inline(slide.title) + '</h1></section>';
    if (slide.type === 'chapter') {
      var m = /^(\d+)\s*[.．)]?\s*(.*)$/.exec(slide.title);
      var kick = m ? m[1] : slide.blocks.length ? slide.blocks[0].text : '';
      return '<section class="slide chapter"' + attrs + '><p class="kicker">' + esc(kick) + '</p><h1>' + inline(m ? m[2] : slide.title) + '</h1></section>';
    }
    var figures = slide.blocks.filter(function (b) { return b.type === 'figure'; });
    var others = slide.blocks.filter(function (b) { return b.type !== 'figure'; });
    var body;
    if (figures.length && others.length) body = '<div class="lite-cols"><div>' + others.map(renderBlock).join('\n') + '</div><div class="lite-pictures' + (figures.length === 2 ? ' lite-two' : figures.length > 2 ? ' lite-many' : '') + '">' + figures.map(renderBlock).join('\n') + '</div></div>';
    else if (figures.length) body = '<div class="lite-figure-only">' + figures.map(renderBlock).join('\n') + '</div>';
    else body = others.map(renderBlock).join('\n');
    return '<section class="slide"' + attrs + '><h2>' + inline(slide.title) + '</h2><div class="lite-body">' + body + '</div></section>';
  }
  function renderLesson(text, opts) {
    var lesson = parseLesson(text);
    var slides = opts && opts.paginate ? paginateLesson(lesson).slides : lesson.slides;
    return slides.map(renderSlide).join('\n');
  }

  // The browser supplies a real CSS measurement; Node can exercise the same split
  // logic with the conservative 34 characters / 48px fallback (opts.paginate).
  function estimateSlide(slide) {
    var pictureBlocks = slide.blocks.filter(function (b) { return b.type === 'figure'; });
    var figures = pictureBlocks.length;
    var chars = figures ? 20 : 34;
    var total = 0;
    slide.blocks.forEach(function (b) {
      if (b.type === 'figure') return;
      if (b.type === 'table') total += b.rows.length * 56;
      else if (b.type === 'answer') total += Math.max(170, Math.ceil(b.text.length / chars) * 48 + 56);
      else if (['drift', 'choice', 'electron', 'graph', 'diffusion', 'stages', 'spectrum', 'structure', 'sort', 'quiz', 'order'].indexOf(b.type) >= 0) total += 460;
      else if (b.type === 'video') total += 430;
      else total += Math.max(1, Math.ceil(b.text.length / chars)) * 48 + 14;
    });
    var pictureHeight = 0;
    if (figures && figures === slide.blocks.length) pictureHeight = 460;
    else if (figures) {
      var width = figures > 2 ? 212 : 440;
      var heights = pictureBlocks.map(function (b) {
        var caption = Math.max(1, Math.ceil((b.text.length * 22 + 32) / width)) * 36 + 12;
        return (figures === 1 ? 300 : figures === 2 ? 180 : 120) + caption;
      });
      for (var i = 0; i < heights.length; i += figures > 2 ? 2 : 1) pictureHeight += Math.max(heights[i], figures > 2 && heights[i + 1] || 0) + (i ? 16 : 0);
    }
    return Math.max(total, pictureHeight);
  }
  function continuationId(id, index) {
    // b … z, aa …; stable IDs even for an exceptionally long lesson.
    var suffix = '', n = index;
    do { suffix = String.fromCharCode(97 + n % 26) + suffix; n = Math.floor(n / 26) - 1; } while (n >= 0);
    return id + suffix;
  }
  function paginateLesson(lesson, measure) {
    var result = { settings: lesson.settings, warnings: lesson.warnings.slice(), slides: [] };
    lesson.slides.forEach(function (source) {
      // 블록이 하나뿐이어도 그것이 표면 행을 나눌 수 있으니 건너뛰지 않는다.
      if (source.type !== 'normal' || !source.blocks.length || (source.blocks.length < 2 && source.blocks[0].type !== 'table')) { result.slides.push(source); return; }
      var part = 0;
      var current = Object.assign({}, source, { blocks: [] });
      // 잴 때와 실제 화면의 글꼴·어절 감싸기 차이로 20px쯤 더 길어질 수 있어 여유를 둔다.
      // 배경 장은 틀 꼬리표를 피해 위 여백이 160px(묶음 장 112px)이라 48px 덜 쓴다.
      var budget = (source.bg ? 422 : source.section ? 470 : 510) - 20;
      function heightOf(slide) {
        var measured = measure ? measure(slide) : 0;
        return measured > 0 && isFinite(measured) ? measured : estimateSlide(slide);
      }
      // 표 하나가 혼자서도 넘치면 머리줄을 되풀이해 행을 나눈다.
      var blocks = [];
      source.blocks.forEach(function (block) {
        if (block.type !== 'table' || block.rows.length < 3 || heightOf(Object.assign({}, source, { blocks: [block] })) <= budget) { blocks.push(block); return; }
        var head = block.rows[0], chunk = [];
        block.rows.slice(1).forEach(function (row) {
          var trial = chunk.concat([row]);
          if (chunk.length && heightOf(Object.assign({}, source, { blocks: [Object.assign({}, block, { rows: [head].concat(trial) })] })) > budget) {
            blocks.push(Object.assign({}, block, { rows: [head].concat(chunk) }));
            chunk = [row];
          } else chunk = trial;
        });
        if (chunk.length) blocks.push(Object.assign({}, block, { rows: [head].concat(chunk) }));
      });
      // 그림은 쪽을 나누는 까닭이 되지 않는다. 한 쪽에 4개까지 묶어 첫 쪽부터 차례로 붙이고,
      // 글만 쪽 높이에 맞춰 나눈다. 남은 그림 묶음은 그림만 있는 이어지는 쪽이 된다.
      function isFigure(b) { return b.type === 'figure'; }
      // 설명이 길어 그림 둘도 한 쪽에 넘치면 묶음을 줄인다(글 한 줄이 곁에 있다고 보고 어림한다).
      // 둘은 세로로, 셋 이상은 두 줄 격자로 놓여 셋이 둘보다 낮을 수 있으니 4개부터 줄여 본다.
      var figureChunks = [], probe = { type: 'p', text: '' };
      var figureList = blocks.filter(isFigure), textless = figureList.length === blocks.length;
      for (var f = 0; f < figureList.length;) {
        var n = Math.min(4, figureList.length - f);
        while (!textless && n > 1 && estimateSlide({ blocks: figureList.slice(f, f + n).concat([probe]) }) > budget) n--;
        figureChunks.push(figureList.slice(f, f + n));
        f += n;
      }
      var chunk = 0, hasText = false;
      function nextPage(extra) {
        result.slides.push(current);
        part++;
        current = Object.assign({}, source, { id: continuationId(source.id, part), title: source.title + ' (' + (part + 1) + ')', blocks: (figureChunks[++chunk] || []).concat(extra) });
      }
      current.blocks = (figureChunks[0] || []).slice();
      blocks.filter(function (b) { return !isFigure(b); }).forEach(function (block) {
        var candidate = Object.assign({}, current, { blocks: current.blocks.concat([block]) });
        if (hasText && heightOf(candidate) > budget) nextPage([block]);
        else current = candidate;
        hasText = true;
      });
      while (chunk < figureChunks.length - 1) nextPage([]);
      result.slides.push(current);
    });
    return result;
  }

  function log(message) { if (root.console && root.console.warn) root.console.warn('[lite] ' + message); }
  function loadEngine(doc, base) {
    if (Array.prototype.some.call(doc.scripts, function (s) { return /(?:^|\/)exploragram\.js(?:[?#]|$)/.test(s.src || ''); })) return;
    var script = doc.createElement('script'); script.src = base + 'exploragram.js';
    script.onerror = function () { log('엔진 JS를 불러오지 못했다: ' + script.src); };
    doc.body.appendChild(script);
  }
  function loadCSS(doc, base) {
    function liteStyle() {
      if (!doc.getElementById('lite-css')) { var style = doc.createElement('style'); style.id = 'lite-css'; style.textContent = LITE_CSS; doc.head.appendChild(style); }
    }
    return new Promise(function (resolve) {
      var link = Array.prototype.filter.call(doc.querySelectorAll('link[rel="stylesheet"]'), function (l) { return /(?:^|\/)exploragram\.css(?:[?#]|$)/.test(l.href || ''); })[0];
      var done = false;
      var timer;
      function finish() { if (!done) { done = true; root.clearTimeout(timer); resolve(); } }
      if (link && link.sheet) { liteStyle(); resolve(); return; }
      timer = root.setTimeout(function () { log('CSS를 5초 안에 불러오지 못해 계속 진행한다.'); finish(); }, 5000);
      if (!link) { link = doc.createElement('link'); link.rel = 'stylesheet'; link.href = base + 'exploragram.css'; }
      link.addEventListener('load', finish);
      link.addEventListener('error', function () { log('엔진 CSS를 불러오지 못했다.'); finish(); });
      if (!link.parentNode) doc.head.appendChild(link);
      liteStyle();
    });
  }
  // 엔진 글꼴(Pretendard, 글자별 나눠 받기)이 오기 전에 재면 줄바꿈이 달라 실제 화면에서 넘친다.
  // 수업 글의 글자로 글꼴을 미리 불러 두고, 3초 넘으면 그냥 잰다.
  function waitFonts(doc, text) {
    if (!doc.fonts || !doc.fonts.load) return Promise.resolve();
    var sample = String(text || '').replace(/\s+/g, '').slice(0, 3000) || '가';
    var load = Promise.all(['400', '700'].map(function (w) { return doc.fonts.load(w + ' 30px "Pretendard Variable"', sample); })).then(function () { return doc.fonts.ready; });
    return Promise.race([load, new Promise(function (r) { root.setTimeout(r, 3000); })]).catch(function () {});
  }
  // 마주온 코드 실행이 원본 PPT에서 꺼낸 그림을 <script type="text/x-figures">{"7-4":"(WebP base64)"}</script>로 넣는다.
  // 값은 data URL이어도 된다. 읽은 뒤 문서에서 떼어 내서, 엔진의 「그림 넣어 저장」이 그림을 두 번 담지 않게 한다.
  function readFigures(doc) {
    var el = doc.querySelector('script[type="text/x-figures"]') || doc.getElementById('lite-figures'), map = {};
    if (!el) return map;
    try { map = JSON.parse(el.textContent || '{}') || {}; } catch (err) { log('그림 묶음을 읽지 못했다: ' + err.message); }
    if (el.parentNode) el.parentNode.removeChild(el);
    return map;
  }
  function figureSrc(value) {
    var s = String(value || '');
    if (/^data:image\/(?:png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/.test(s)) return s;
    return /^[A-Za-z0-9+/]+={0,2}$/.test(s) ? 'data:image/webp;base64,' + s : '';
  }
  // 그림 크기를 먼저 알아 두어야 장 나누기가 실제 그림 높이로 잰다.
  function loadFigures(map) {
    var keys = Object.keys(map).filter(function (k) { return /^\d+-\d+$/.test(k) && figureSrc(map[k]); });
    return Promise.all(keys.map(function (k) {
      return new Promise(function (resolve) {
        var im = new root.Image(), src = figureSrc(map[k]);
        im.onload = function () { resolve([k, { src: src, w: im.naturalWidth, h: im.naturalHeight }]); };
        im.onerror = function () { log('그림 ' + k + '을 열지 못했다.'); resolve(null); };
        im.src = src;
      });
    })).then(function (list) {
      var out = {};
      list.forEach(function (pair) { if (pair && pair[1].w && pair[1].h) out[pair[0]] = pair[1]; });
      return out;
    });
  }
  // 마주온이 준 파일 링크(Azure 임시 저장소)는 7일 뒤 사라진다. 그 주소로 열었을 때만 저장하라는 띠를 띄운다.
  // 닫힌 그림자 루트 안에 그려서, 엔진이 문서를 저장할 때 띠의 글과 모양이 파일에 따라가지 않게 한다.
  function linkNotice(doc) {
    var loc = root.location || {};
    if (!/\.blob\.core\.windows\.net$/i.test(loc.hostname || '') || !doc.body) return;
    var box = doc.createElement('lite-note');
    if (!box.attachShadow) return;
    var when = '7일 뒤에', se = /[?&]se=([^&]+)/.exec(loc.search || ''), end = se && new Date(decodeURIComponent(se[1]));
    if (end && !isNaN(end)) when = (end.getMonth() + 1) + '월 ' + end.getDate() + '일에';
    var shadow = box.attachShadow({ mode: 'closed' });
    shadow.innerHTML = '<style>' +
      'div{position:fixed;z-index:2147483000;top:12px;left:50%;transform:translateX(-50%);box-sizing:border-box;width:max-content;max-width:calc(100% - 32px);' +
      'display:flex;gap:16px;align-items:center;padding:10px 12px 10px 20px;border-radius:14px;background:#1f2937;color:#fff;' +
      'font:600 20px/1.45 "Pretendard Variable",Pretendard,"Malgun Gothic",sans-serif;word-break:keep-all;overflow-wrap:anywhere;box-shadow:0 8px 24px rgba(0,0,0,.25)}' +
      'button{flex:none;min-width:64px;min-height:44px;border:0;border-radius:10px;background:#fff;color:#1f2937;font:inherit;cursor:pointer}' +
      '</style><div role="status"><span>이 링크는 ' + when + ' 사라져요. 아래 「설정」에서 「그림 넣어 저장」을 눌러 내 컴퓨터에 저장해 두세요.</span><button type="button">닫기</button></div>';
    shadow.querySelector('button').addEventListener('click', function (e) { e.stopPropagation(); if (box.parentNode) box.parentNode.removeChild(box); });
    doc.body.appendChild(box);
  }
  // 마주온 실행 칸은 차례마다 새로 시작하고, 모델은 앞 차례 코드에 넣은 수업 글을 기억하지 못한다(2026-11-16 확인).
  // 그래서 AI에게 고쳐 달라고 보낼 글에 지금 수업 글을 함께 담는다.
  // 실행 칸이 새로 시작하므로 그림 묶음(F)도 없다. 1번 PPT 목록 코드부터 다시 돌려야 그림이 빠지지 않는다.
  var FIX_HEAD = '공명 라이트 수업 파일을 고쳐 주세요. 먼저 1번 PPT 목록 코드를 다시 돌려 그림을 담고, 아래 [지금 수업 글]에서 고칠 곳만 고쳐 파일 만들기 코드를 돌린 뒤 새 링크를 주세요.';
  var ENGINE_AUDIT_HEAD = /^이 수업 HTML을 Exploragram 엔진의 자동 점검으로[^\n]*\n/;
  function lessonSource(doc) {
    var s = doc.querySelector('script[type="text/x-lesson"], script[type="text/plain"]#lesson');
    return s ? String(s.textContent || '').trim() : '';
  }
  function fixMessage(doc, items) {
    var text = lessonSource(doc);
    return FIX_HEAD + '\n\n' + (items || '[고칠 곳]\n- (여기에 고칠 곳을 쓰세요)') + (text ? '\n\n[지금 수업 글]\n```text\n' + text + '\n```' : '');
  }
  // 엔진 「점검」의 「AI에게 보낼 말」은 HTML 전체를 다시 달라는 말이다. 점검 항목만 살리고 수업 글을 붙인다.
  function liteAuditText(doc, text) {
    if (!ENGINE_AUDIT_HEAD.test(text) || !lessonSource(doc)) return text;
    return fixMessage(doc, text.replace(ENGINE_AUDIT_HEAD, '').split('\n[지킬 것]')[0].trim());
  }
  function copyText(doc, text) {
    var nav = root.navigator;
    if (nav && nav.clipboard && nav.clipboard.writeText) return nav.clipboard.writeText(text).then(function () { return true; }, function () { return copyByBox(doc, text); });
    return Promise.resolve(copyByBox(doc, text));
  }
  function copyByBox(doc, text) {
    var box = doc.createElement('textarea'); box.value = text; box.setAttribute('readonly', '');
    box.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    doc.body.appendChild(box); box.select();
    var ok = false; try { ok = doc.execCommand('copy'); } catch (err) { ok = false; }
    doc.body.removeChild(box);
    return ok;
  }
  function hookFixCopy(doc) {
    if (doc.__liteFixCopy || !lessonSource(doc)) return;
    doc.__liteFixCopy = true;
    var nav = root.navigator;
    if (nav && nav.clipboard && nav.clipboard.writeText) {
      var write = nav.clipboard.writeText.bind(nav.clipboard);
      try { nav.clipboard.writeText = function (text) { return write(liteAuditText(doc, String(text))); }; } catch (err) { log('복사 글을 바꿔 끼우지 못했다: ' + err.message); }
    }
    // 클립보드 권한이 없을 때 엔진은 숨은 글 상자(.ch-audit-copybox)를 골라 복사한다. 그때도 바꿔 끼운다.
    doc.addEventListener('copy', function (e) {
      var box = doc.activeElement;
      if (!box || !box.classList || !box.classList.contains('ch-audit-copybox') || !e.clipboardData) return;
      e.clipboardData.setData('text/plain', liteAuditText(doc, box.value));
      e.preventDefault();
    }, true);
    // ⚙ 설정의 「파일」 칸에 「AI에게 보낼 말 복사」를 더한다. 점검에 걸리지 않은 것도 고쳐 달라고 할 수 있게.
    if (!root.MutationObserver) return;
    new root.MutationObserver(function () {
      var panel = doc.querySelector('.ch-set-file');
      if (!panel || panel.querySelector('.lite-fix-copy')) return;
      var button = doc.createElement('button');
      button.type = 'button'; button.className = 'ch-menu-item lite-fix-copy'; button.textContent = 'AI에게 보낼 말 복사';
      button.addEventListener('click', function () {
        copyText(doc, fixMessage(doc)).then(function (ok) {
          button.textContent = ok ? '복사했어요. 마주온 대화에 붙여 넣고 고칠 곳을 쓰세요.' : '복사하지 못했어요.';
          root.setTimeout(function () { button.textContent = 'AI에게 보낼 말 복사'; }, 4000);
        });
      });
      var items = panel.querySelectorAll('.ch-menu-item');
      var after = items.length ? items[items.length - 1] : null;
      panel.insertBefore(button, after ? after.nextSibling : null);
    }).observe(doc.body, { childList: true, subtree: true });
  }
  function fillFigures(node, figs) {
    Array.prototype.forEach.call(node.querySelectorAll('img[data-ppt]'), function (img) {
      var f = figs[img.getAttribute('data-ppt')];
      if (!f || img.getAttribute('src')) return;
      img.setAttribute('src', f.src);
      img.style.aspectRatio = f.w + ' / ' + f.h;   // 그림을 다 풀기 전에도 같은 높이로 잰다
      var cap = img.parentNode && img.parentNode.querySelector('figcaption[data-auto]');
      if (cap) cap.parentNode.removeChild(cap);
    });
  }
  function measureSlides(doc, lesson, figs) {
    var host = doc.createElement('div'); host.className = 'lite-measure'; host.setAttribute('aria-hidden', 'true'); doc.body.appendChild(host);
    try {
      return paginateLesson(lesson, function (candidate) {
        host.innerHTML = renderSlide(candidate);
        fillFigures(host, figs || {});
        // The engine will replace empty images with these placeholders later.
        // Include their real CSS and caption height while measuring, rather
        // than measuring a broken img with zero intrinsic height.
        Array.prototype.forEach.call(host.querySelectorAll('img[data-ppt]'), function (img) {
          if (img.getAttribute('src')) return;
          img.hidden = true;
          var ph = doc.createElement('span'); ph.className = 'ch-ppt-ph';
          var label = doc.createElement('b'); label.textContent = '원본 PPT를 이 화면에 끌어다 놓으세요';
          var detail = doc.createElement('small'); detail.textContent = 'PPT ' + img.getAttribute('data-ppt') + ' · ' + (img.getAttribute('alt') || '');
          ph.appendChild(label); ph.appendChild(detail);
          img.parentNode.insertBefore(ph, img.nextSibling);
        });
        var body = host.querySelector('.lite-body');
        if (!body) return 0;
        var rect = body.getBoundingClientRect();
        var height = rect.height;
        // Engine-created controls are not in the DOM yet. Reserve their full
        // published height so pagination does not depend on the closed state.
        candidate.blocks.forEach(function (b) {
          if (['drift', 'choice', 'electron', 'graph', 'diffusion', 'stages', 'spectrum', 'structure', 'quiz', 'sort', 'order', 'figure', 'video'].indexOf(b.type) >= 0) height = Math.max(height, estimateSlide(candidate));
        });
        var heading = host.querySelector('h2');
        if (heading) height += Math.max(0, heading.getBoundingClientRect().height - 51);
        return height;
      });
    } finally { doc.body.removeChild(host); }
  }
  function start(doc, script) {
    if (doc.__resonanceLiteStarted) return;
    doc.__resonanceLiteStarted = true;
    var base = script && script.getAttribute('data-engine') || DEFAULT_ENGINE;
    if (base.charAt(base.length - 1) !== '/') base += '/';
    if (doc.body.querySelector('section.slide')) { hookFixCopy(doc); loadEngine(doc, base); return; }
    var source = doc.querySelector('script[type="text/x-lesson"], script[type="text/plain"]#lesson');
    if (!source) { log('수업 글 script를 찾지 못했다.'); return; }
    var figs = {}, figMap = readFigures(doc);
    // 원문 묶음이 없으면(옛 파일) 예전처럼 곧바로 펼친다.
    if (!doc.querySelector('script[type="text/x-ppt"]')) { begin(doc, base, source, figMap, null); return; }
    readPpt(doc).then(function (ppt) { begin(doc, base, source, figMap, ppt); }, function (err) { log('PPT 원문을 풀지 못했다: ' + err.message); begin(doc, base, source, figMap, null); });
  }
  // x-ppt: zlib으로 줄인 JSON {s: [슬라이드 XML], l: [틀 이름]}을 base64로. 읽은 뒤 문서에서 떼어 낸다.
  function readPpt(doc) {
    var el = doc.querySelector('script[type="text/x-ppt"]');
    if (!el) return Promise.resolve(null);
    var b64 = (el.textContent || '').replace(/\s+/g, '');
    if (el.parentNode) el.parentNode.removeChild(el);
    if (!b64) return Promise.resolve(null);
    if (typeof root.DecompressionStream !== 'function') return Promise.reject(new Error('이 브라우저는 압축 풀기를 지원하지 않는다'));
    var bin = root.atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var stream = new root.Blob([bytes]).stream().pipeThrough(new root.DecompressionStream('deflate'));
    return new root.Response(stream).text().then(function (t) { return JSON.parse(t); });
  }
  function begin(doc, base, source, figMap, ppt) {
    var text = source.textContent;
    if (ppt) {
      var ex = expandAnchors(text, ppt, Object.keys(figMap));
      if (ex.used) text = ex.text;
      else log("수업 글에 '@쪽' 줄이 없어 PPT 원문을 넣지 않았다.");
    }
    var lesson = parseLesson(text);
    if (ppt && !lesson.settings.accent) lesson.settings.accent = pptAccent(ppt);
    // 배경 그림이 없는 틀은 엔진 모양 그대로 둔다
    var bgs = {};
    lesson.slides.forEach(function (sl) { if (sl.bg && figureSrc(figMap[sl.bg])) bgs[sl.bg] = figureSrc(figMap[sl.bg]); else sl.bg = ''; });
    if (Object.keys(bgs).length) {
      var st = doc.createElement('style'); st.id = 'lite-bg';
      st.textContent = Object.keys(bgs).map(function (k) { return 'body[data-theme="ppt"] section.slide[data-bg="' + k + '"]{background:url("' + bgs[k] + '") center/100% 100% no-repeat,#fff}'; }).join('\n');
      doc.head.appendChild(st);
    }
    doc.documentElement.lang = 'ko';
    // 마주온 파일 만들기 코드는 <title>을 쓰지 않는다. 표지 제목을 문서 제목으로 삼아야 수업마다 판서 저장 칸(덱)이 갈린다.
    var cover = lesson.slides.filter(function (s) { return s.type === 'cover' && s.title; })[0];
    if (!String(doc.title || '').trim() && cover) doc.title = cover.title;
    doc.documentElement.setAttribute('data-deck', lesson.settings.deck || deckKey(doc.title || '수업'));
    doc.body.setAttribute('data-theme', 'ppt');
    if (lesson.settings.accent) { doc.body.style.setProperty('--accent', lesson.settings.accent); doc.body.style.setProperty('--tab', lesson.settings.accent); doc.body.style.setProperty('--tab-ink', '#fff'); }
    if (!doc.querySelector('meta[name="viewport"]')) { var meta = doc.createElement('meta'); meta.name = 'viewport'; meta.content = 'width=device-width, initial-scale=1'; doc.head.appendChild(meta); }
    lesson.warnings.forEach(function (w) { log(w.line + '행: ' + w.message); });
    var figs = {};
    linkNotice(doc);
    hookFixCopy(doc);
    loadCSS(doc, base).then(function () {
      return Promise.all([waitFonts(doc, text), loadFigures(figMap).then(function (loaded) { figs = loaded; })]);
    }).then(function () {
      var marker = doc.createElement('div');
      doc.body.appendChild(marker);
      // Expand first, measure offscreen, then replace only these new slides.
      var slides = [];
      function insert(list) {
        list.forEach(function (slide) { var wrap = doc.createElement('div'); wrap.innerHTML = renderSlide(slide); var node = wrap.firstElementChild; fillFigures(node, figs); doc.body.insertBefore(node, marker); slides.push(node); });
      }
      try {
        insert(lesson.slides);
        var divided = measureSlides(doc, lesson, figs);
        slides.forEach(function (s) { s.parentNode.removeChild(s); }); slides = [];
        insert(divided.slides);
      } catch (err) { log('장을 나누는 중: ' + err.message); }
      marker.parentNode.removeChild(marker);
      loadEngine(doc, base);
    }).catch(function (err) { log(err.message); loadEngine(doc, base); });
  }

  var api = { parseLesson: parseLesson, renderLesson: renderLesson, paginateLesson: paginateLesson, expandAnchors: expandAnchors, pptAccent: pptAccent, css: LITE_CSS };
  if (typeof module !== 'undefined' && module.exports) module.exports = { parseLesson: parseLesson, renderLesson: renderLesson, paginateLesson: paginateLesson, expandAnchors: expandAnchors, pptAccent: pptAccent, css: LITE_CSS };
  if (typeof document !== 'undefined') {
    root.ResonanceLite = api;
    var ownScript = document.currentScript;
    var boot = function () { try { start(document, ownScript); } catch (err) { log(err.message); } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
  }
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
