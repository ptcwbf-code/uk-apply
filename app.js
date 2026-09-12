/* UK·HK 本科录取要求速查 — 逻辑 3.0（英国九校 + 香港八校 双板块；对比清单可跨板块混选） */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtBold(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
  // 搜索命中高亮：只用在专业名与校名上——最需要回答「这一行为什么被搜出来」
  // 高亮：把查询按词切开，每个词的所有出现位置都标出来。
  // 原来只标整串、且只标第一处——搜「港大 CS」时两处都该亮，一处都亮不了。
  function hi(s) {
    var str = String(s == null ? '' : s);
    if (!q) return esc(str);
    var toks = qTokens();
    if (!toks.length) return esc(str);
    var low = str.toLowerCase(), ranges = [], i, k;
    for (k = 0; k < toks.length; k++) {
      i = low.indexOf(toks[k]);
      while (i >= 0) {
        ranges.push([i, i + toks[k].length]);
        i = low.indexOf(toks[k], i + toks[k].length);
      }
    }
    if (!ranges.length) return esc(str);
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [ranges[0]];                    // 合并重叠区间，免得套出嵌套的 mark
    for (k = 1; k < ranges.length; k++) {
      var last = merged[merged.length - 1];
      if (ranges[k][0] <= last[1]) last[1] = Math.max(last[1], ranges[k][1]);
      else merged.push(ranges[k]);
    }
    var out = '', pos = 0;
    merged.forEach(function (r) {
      out += esc(str.slice(pos, r[0])) + '<mark class="hl">' + esc(str.slice(r[0], r[1])) + '</mark>';
      pos = r[1];
    });
    return out + esc(str.slice(pos));
  }
  // ── 图标 ──
  // 原来用的是 ▾ ▴ ⇅ ✕ ▸ ↑ × 这些文字符号：不同字体下字重与基线各不相同，凑在一起很花。
  // 统一成一套：16 网格、1.7 描边、圆头圆角、不用填充；尺寸由各自上下文用 CSS 指定。
  // （CSS 伪元素上的三角用同一套几何做成 mask，见 styles.css 的 --ic-right / --ic-down）
  function svgIcon(d, cls) {
    return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 16 16" fill="none" ' +
      'stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + d + '</svg>';
  }
  var ICON = {
    sortAsc:  svgIcon('<path d="M4 9.6 8 5.6l4 4"/>'),
    sortDesc: svgIcon('<path d="M4 6.4 8 10.4l4-4"/>'),
    sortNone: svgIcon('<path d="M5 6.3 8 3.3l3 3"/><path d="M5 9.7l3 3 3-3"/>'),
    right:    svgIcon('<path d="M6 4l4 4-4 4"/>'),
    close:    svgIcon('<path d="M4.2 4.2 11.8 11.8"/><path d="M11.8 4.2 4.2 11.8"/>'),
    top:      svgIcon('<path d="M8 13V3.4"/><path d="M4.2 7.2 8 3.4l3.8 3.8"/>')
  };
  function shortUrl(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, ''); }
  // 统一的分数渲染：主分数 + 括注（各校同款字体与层级）
  function scoreHTML(v, cls) {
    if (!v) return '<span class="' + cls + '">—</span>';
    var i = v.indexOf('（');
    var main = i < 0 ? v : v.slice(0, i);
    var sub = i < 0 ? '' : v.slice(i);
    // 在 – — / + 之后留一个可断点：长分数（如 A*A*A*A–A*A*A*A*）会优先在这里折行，
    // 而不是被断词规则从中间劈开
    var brk = esc(main).replace(/([–—/+])/g, '$1<wbr>');
    return '<span class="' + cls + '">' + brk +
      (sub ? '<span class="score-sub">' + esc(sub) + '</span>' : '') + '</span>';
  }
  function hideToast() {
    var t = $('#toast'); if (t) t.classList.remove('show');
  }
  // action（可选）在提示条右侧挂一个按钮，用于「清空对比」这类需要一个后悔阀门的操作
  function showToast(msg, ms, action) {
    var t = $('#toast'); if (!t) return;
    clearTimeout(showToast._t);
    t.textContent = msg;                      // 顺带清掉上一条的按钮
    if (action) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'toast-act'; b.textContent = action.label;
      b.addEventListener('click', function () { hideToast(); action.fn(); });
      t.appendChild(b);
    }
    t.classList.add('show');
    showToast._t = setTimeout(hideToast, ms || 2800);
  }
  // 复制到剪贴板：安全上下文用 clipboard API，file:// 与旧浏览器回落 execCommand
  function copyText(text, onOk) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (ok) onOk(); else showToast('复制失败，请手动复制地址栏里的链接', 4200);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onOk, fallback);
    } else fallback();
  }
  // 弹层里的动作再给一次就地反馈：按钮自己变一下。
  // 提示条虽然已经抬到弹层之上，但视线停在按钮上时，按钮自己变化才是最直接的确认。
  function flashButton(btn, text) {
    if (!btn || btn._flashT) return;
    var old = btn.textContent;
    btn.textContent = text;
    btn.classList.add('done');
    btn._flashT = setTimeout(function () {
      btn.textContent = old;
      btn.classList.remove('done');
      btn._flashT = null;
    }, 1600);
  }

  // ── 成绩口径标签（全中文、短词，避免中英混排） ──
  var OFFER_ZH = { typical: '典型', min: '最低', range: '区间', college: '典型', standard: '典型',
    lower: '下限', ref: '区间', ger: '门槛' };
  var OFFER_TITLE = {
    typical: '典型：多数获得条件录取者的成绩水平，并非最低分',
    min: '最低：大学公布的最低录取条件',
    range: '区间：官网公布近年实际发出 offer 的成绩区间',
    college: '典型：剑桥课程页所列多数学院的最低 offer 水平；最终条件由各学院发出，可能更高',
    standard: '典型：牛津课程页公布的标准入学条件',
    lower: '下限：港大官网公布的非联招参考下限，达线不保证录取',
    ref: '区间：港中文官方参考收分（非联招），非保证线，热门专业实收更高',
    ger: '门槛：官网未公布分专业分数，仅列大学通用门槛与科目要求；条件见录取信'
  };
  var TEST_TITLE = {
    ESAT: 'Engineering and Science Admissions Test（工程与科学入学测试）',
    TMUA: 'Test of Mathematics for University Admission（大学入学数学测试）',
    TARA: 'Test of Academic Reasoning for Admissions（入学学术推理测试）',
    STEP: 'Sixth Term Examination Paper（剑桥数学录取后测试）',
    UCAT: 'University Clinical Aptitude Test（医学院临床能力测试）',
    LNAT: 'National Admissions Test for Law（法学入学测试）',
    '面试': '需面试 / 附加甄选'
  };

  // ── 两个板块（数据集 + 展示口径） ──
  // year / cycle 单独成字段：同一屏里英国是 2027 年入学、香港是 2026 入学轮次，
  // 跨板块混选进同一张对比表时，这是最容易被读错的一处，必须每行都带着。
  var REGIONS = {
    uk: {
      name: '英国九校', short: 'UK', schools: SCHOOLS, programs: PROGRAMS, dirs: DIRS,
      testIsExam: true, testHead: '入学笔试',
      year: '2027 年 9 月入学', cycle: '2026–27 申请季',
      sub: '牛剑 · G5 · 王爱曼华 · 2027 年入学（A-level / IB / 入学笔试）'
    },
    hk: {
      name: '香港八校', short: 'HK', schools: HKSCHOOLS, programs: HKPROGRAMS, dirs: DIRS,
      testIsExam: false, testHead: '面试 / 附加', testHeadHK: true, noDse: true,
      year: '2026 年 9 月入学', cycle: '2025–26 申请季',
      sub: '港大 · 港中文 · 港科大 · 城大 · 理大 · 浸会 · 教育 · 岭南 —— A-Level / IB 直申（无需 DSE；2026 入学轮次口径）'
    }
  };
  function cycleShort(rc) { return REGIONS[rc].year.replace(' 年 9 月入学', ' 入学'); }

  // ── 申请时间线 ──
  // 这是「申请季」级别的日历，不是专业数据，所以不进 data*.js 的合并流程，只在 app.js 里维护；
  // 每换一个申请季要整体重核一遍。
  // 硬性规矩：只有核到官方页面的日期才进 items（它们驱动「还剩 N 天」这种强提示）；
  // 只从第三方汇总看到的一律进 pending，明说「本站未核到官网」。
  var TIMELINE = {
    uk: {
      items: [
        { d: '2026-09-01', t: 'UCAS 开放提交申请', src: 'UCAS 官方日历' },
        { d: '2026-09-15', t: 'LNAT 报名截止——申请牛剑者须在此前报名，才能赶在 10 月 15 日前完成考试', src: 'LNAT 官网', u: 'https://lnat.ac.uk/registration/dates-and-deadlines/' },
        { d: '2026-09-16', t: 'UCAT 报名截止（15:00 英国时间）——医学 / 牙医必考，不接受逾期', src: 'UCAT 官网', u: 'https://www.ucat.ac.uk/' },
        { d: '2026-09-28', t: 'ESAT / TMUA 十月场报名截止（英国时间 18:00，不接受逾期报名）', src: 'UAT-UK 官网与考生手册', u: 'https://esat-tmua.ac.uk/' },
        { d: '2026-10-12', t: 'ESAT / TMUA 十月场考试（12–16 日；中国内地与港澳：ESAT 12–13 日、TMUA 15–16 日）', src: 'UAT-UK', u: 'https://esat-tmua.ac.uk/' },
        { d: '2026-10-15', t: '牛津、剑桥全部专业，及多数医学 / 牙医 / 兽医截止（18:00）；LNAT 亦须在此前完成', src: 'UCAS 官方日历', u: 'https://lnat.ac.uk/registration/dates-and-deadlines/' },
        { d: '2026-11-16', t: 'ESAT / TMUA 成绩公布', src: 'UAT-UK', u: 'https://esat-tmua.ac.uk/' },
        { d: '2027-01-13', t: '平权审核截止：多数专业（18:00）——此前提交的申请获得同等审核', src: 'UCAS 官方日历' },
        { d: '2027-01-20', t: 'LNAT 报名截止——申请 KCL / LSE / UCL 者（Bristol 与 Durham 的报名截止为 1 月 13 日）', src: 'LNAT 官网', u: 'https://lnat.ac.uk/registration/dates-and-deadlines/' },
        { d: '2027-06-30', t: '逾期申请截止；此后提交的自动进入 Clearing', src: 'UCAS 官方日历' }
      ],
      pending: [
        { t: 'STEP（剑桥数学等，录取后条件）', s: '2027 年 6 月考试，2024 年起由 OCR 主办；属录取后的条件考试，具体日期会写在 offer 上，本站未核到公开时间表', u: 'https://www.ocr.org.uk/students/step-mathematics/' }
      ],
      srcNote: '日期来源：UCAS 官方日历、各校官网、UAT-UK 官网与考生手册、UCAT 官网、LNAT 官网（2026-09 核对）。各校与考试局每年调整，正式申请前请再核对一次。'
    },
    hk: {
      items: [],
      notes: [
        '本板块数据为 **2026 入学轮次**：该轮申请已在 2025 年底至 2026 年初结束。',
        '**2027 入学轮次**（2026 年底开放）的各校 non-JUPAS 截止日期尚未公布；公布后这里会补上具体日期。',
        '香港没有像 UCAS 那样的统一申请平台，**八校各自独立招生**，A-Level / IB 申请人走各校的 non-JUPAS（国际资历）通道，因此有八个不同的截止日期。',
        '节奏上的大致规律：秋季开放申请，**11 月前后为早轮、次年 1 月上旬为主轮**，早轮提交通常更有利——但每年日期都不同，务必以各校官网为准。'
      ],
      srcNote: '本板块暂无经官方核实的日期，所以不做倒计时。上一轮的截止日期可作节奏参考，但不能当成本轮日期使用。'
    }
  };
  function daysTo(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return null;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((new Date(+m[1], +m[2] - 1, +m[3]) - today) / 86400000);
  }
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? (+m[2]) + ' 月 ' + (+m[3]) + ' 日' : '';
  }
  function daysWord(n) {
    if (n === 0) return '今天';
    if (n === 1) return '明天';
    return n < 0 ? '已过' : '还剩 ' + n + ' 天';
  }
  // 21 天以内算「近」：报名类截止一旦错过就没有补救（ESAT / TMUA 明确不接受逾期报名），
  // 留三周才够学生安排考试与准备
  var TL_SOON = 21;
  // 倒计时是打开页面时现算的：静态页也能给出「还剩几天」，不必每次改数据
  function renderTimeline() {
    var host = $('#timeline-body'), nx = $('#tl-next');
    if (!host) return;
    var rc = curRc();
    var tl = TIMELINE[rc] || { items: [] };
    var items = (tl.items || []).slice().sort(function (a, b) { return a.d < b.d ? -1 : 1; });
    var next = null;
    items.forEach(function (it) { if (!next && daysTo(it.d) >= 0) next = it; });
    if (nx) {
      if (next) {
        var n = daysTo(next.d);
        nx.className = 'tl-next' + (n <= TL_SOON ? ' urgent' : '');
        nx.textContent = '下一个：' + fmtDate(next.d) + ' ' + next.t.replace(/（[^）]*）/g, '') + '（' + daysWord(n) + '）';
      } else {
        nx.className = 'tl-next';
        nx.textContent = rc === 'hk' ? '上一轮已结束，下一轮日期尚未公布' : '本季关键日期均已过';
      }
    }
    var out = '';
    if (items.length) {
      out += '<ol class="tl-list">' + items.map(function (it) {
        var n = daysTo(it.d), past = n < 0, soon = n >= 0 && n <= TL_SOON;
        return '<li class="' + (past ? 'past' : '') + (soon ? ' soon' : '') + '">' +
          '<span class="tl-d">' + esc(fmtDate(it.d)) + '</span>' +
          '<span class="tl-c"><span class="tl-t">' + esc(it.t) + '</span>' +
          '<span class="tl-m">' + daysWord(n) + ' · ' + esc(it.src || '') +
          (it.u ? ' · <a href="' + esc(it.u) + '" target="_blank" rel="noopener noreferrer">官网</a>' : '') +
          '</span></span></li>';
      }).join('') + '</ol>';
    }
    if (tl.notes) out += '<ul class="tl-notes">' + tl.notes.map(function (s) { return '<li>' + fmtBold(s) + '</li>'; }).join('') + '</ul>';
    if (tl.pending && tl.pending.length) {
      out += '<section class="tl-pending"><h3>' +
        (tl.pending.length === 1 ? '另一个考试没有可核实的公开日期' : '另有 ' + tl.pending.length + ' 个考试没有可核实的公开日期') +
        '</h3><ul>' +
        tl.pending.map(function (p) {
          return '<li><b>' + esc(p.t) + '</b>：' + esc(p.s) + ' —— <a href="' + esc(p.u) + '" target="_blank" rel="noopener noreferrer">去官网确认</a></li>';
        }).join('') + '</ul></section>';
    }
    if (tl.srcNote) out += '<p class="tl-src">' + esc(tl.srcNote) + '</p>';
    host.innerHTML = out;
  }
  // 两个板块的大学索引合并，对比清单可跨板块混选
  var allSchoolByKey = {};
  Object.keys(REGIONS).forEach(function (r) {
    REGIONS[r].schools.forEach(function (s) { allSchoolByKey[s.key] = s; });
  });

  var cur = REGIONS.uk;
  var activeSchools = [], activeDirs = [], testSel = 'ALL', groupBy = 'school', view = 'table', q = '';
  var compare = new Set(); var CMP_MAX = 30;
  var cmpSort = 'default', cmpDir = 'desc';   // 对比表自身的排序（弹层内，不写进 URL）
  // 结果区淡入的开关：默认播放，搜索框逐字输入时关掉，避免每敲一个字都闪一下
  var animate = true;
  var sortKey = 'default';   // 排序键：default | name | alevel | ib | qs
  var sortDir = 'desc';      // 排序方向：asc | desc（default 键下无意义）
  var viewPicked = false;    // 用户是否手动切过视图（没切过就每次按屏幕宽度取默认）

  // ══ 视图状态：URL（可分享）> localStorage（记住上次）> 默认 ══
  // 所有筛选/视图/排序改动都只经由 apply() 落盘，避免各处各自为政
  var STORE_KEY = 'ukapply.state.v1';
  // 笔试筛选取值：筛选按钮与 URL 解码共用一份，避免两处漂移
  var TEST_OPTS = [['ALL', '不限'], ['NONE', '无笔试'], ['YES', '需笔试'], ['ESAT', 'ESAT'], ['TMUA', 'TMUA'], ['TARA', 'TARA'], ['LNAT', 'LNAT'], ['STEP', 'STEP'], ['UCAT', 'UCAT']];

  function snapshot() {
    return {
      r: cur === REGIONS.hk ? 'hk' : 'uk',
      d: activeDirs.slice(), s: activeSchools.slice(), t: testSel,
      g: groupBy, v: view, q: q, o: sortKey, od: sortDir
    };
  }
  function encodeState(st) {
    var p = new URLSearchParams();
    p.set('r', st.r);
    if (st.d.length) p.set('d', st.d.join(','));
    if (st.s.length) p.set('s', st.s.join(','));
    if (st.t !== 'ALL') p.set('t', st.t);
    if (st.g !== 'school') p.set('g', st.g);
    if (viewPicked) p.set('v', st.v);
    if (st.q) p.set('q', st.q);
    if (st.o !== 'default') { p.set('o', st.o); p.set('od', st.od); }
    return p.toString();
  }
  // 解码并对当前默认值做校验，非法值一律丢弃（链接可能来自旧版本或被手改过）
  function decodeState(str) {
    if (!str) return null;
    var p;
    try { p = new URLSearchParams(str); } catch (e) { return null; }
    if (!p.has('r')) return null;
    var r = p.get('r') === 'hk' ? 'hk' : 'uk';
    return {
      r: r,
      d: (p.get('d') || '').split(',').filter(Boolean),
      s: (p.get('s') || '').split(',').filter(Boolean),
      // 筛选项的取值随板块而变（英国是 ESAT，香港是「面试」），这里只做形式校验，
      // 能不能用由 applyState 按板块再核一次
      t: (p.get('t') || 'ALL').slice(0, 24),
      g: GROUP_MODES.indexOf(p.get('g')) >= 0 ? p.get('g') : 'school',
      v: p.get('v') === 'card' ? 'card' : p.get('v') === 'table' ? 'table' : null,
      q: p.get('q') || '',
      o: SORT_KEYS[p.get('o')] ? p.get('o') : 'default',
      od: p.get('od') === 'asc' ? 'asc' : p.get('od') === 'desc' ? 'desc' : null,
      // 清单分享链接里才有：对比清单不像筛选条件那样常驻 URL，只有点「复制清单」才带上
      c: p.get('c') || ''
    };
  }
  // 历史记录：原先一律 replaceState，于是按后退直接离开站点而不是回到上一个筛选。
  // 改成节流 pushState——连续改动（打字、连点筛选）只留一条历史，
  // 否则按一次后退要退十几步才回到有意义的状态。
  var PUSH_GAP = 700;
  var _lastPushAt = Date.now();   // 首屏那一次落盘只 replace，不额外占一条历史
  var _lastEnc = '';
  function persistState() {
    var enc = encodeState(snapshot());
    _lastEnc = enc;
    try { localStorage.setItem(STORE_KEY, enc); } catch (e) { /* 隐私模式 / 沙箱下忽略 */ }
    try {
      var now = location.hash.replace(/^#/, '');
      if (now === enc) return;
      var url = enc ? '#' + enc : location.href.split('#')[0];
      var t = Date.now();
      if (t - _lastPushAt > PUSH_GAP) {
        _lastPushAt = t;
        history.pushState(null, '', url);
      } else {
        history.replaceState(null, '', url);
      }
    } catch (e) { /* file:// 下可能被拒；地址栏不更新，但 localStorage 已记住 */ }
  }
  // 板块相关的界面（页签 / 说明 / 统计）——切换板块与从状态恢复共用
  // tabs 按 APG 补齐：aria-selected 之外还要管 roving tabindex 与面板的 aria-labelledby，
  // 否则读屏只会念「页签 1/2」却不知道它是哪块内容的开关。
  function syncTabs() {
    var tabs = [$('#tab-uk'), $('#tab-hk')];
    var active = cur === REGIONS.hk ? 1 : 0;
    tabs.forEach(function (t, i) {
      var on = i === active;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;     // 只让当前页签进 Tab 序列，其余靠左右方向键
    });
    var panel = $('#panel-data');
    if (panel) panel.setAttribute('aria-labelledby', tabs[active].id);
  }
  function syncRegionChrome() {
    var isHK = cur === REGIONS.hk;
    document.body.classList.toggle('region-hk', isHK);
    syncTabs();
    $('#region-desc').textContent = cur.sub;
    $('#cycle-badge').textContent = cur.year + ' · ' + cur.cycle;
    // 「无需 DSE」是港校这条路径成立的前提，紧挨着切换键比埋在图注里管用
    var dse = $('#dse-badge');
    if (dse) {
      dse.hidden = !cur.noDse;
      dse.textContent = cur.noDse ? 'A-Level / IB 直申 · 无需 DSE' : '';
    }
    $('#stat-schools').textContent = cur.schools.length;
    $('#stat-programs').textContent = cur.programs.length;
    renderTimeline();   // 时间线同样跟随板块（英国有倒计时，香港暂无可核实的日期）
  }
  // 控件回填（搜索框 / 分组 / 视图按钮）——重置、切换板块、从状态恢复共用
  function syncControlsChrome() {
    $('#q').value = q;
    $('#groupby').value = groupBy;
    $('#g-al').value = gAl; $('#g-ib').value = gIb;
    $('#g-ielts').value = gIelts; $('#g-l').value = gL; $('#g-r').value = gR;
    $('#g-w').value = gW; $('#g-s').value = gS;
    $('#g-toefl').value = gToefl; $('#g-toefl-scale').value = gToeflScale;
    $('#only-reach').checked = onlyReach;
    Array.prototype.forEach.call($('#view-toggle').children, function (x) {
      x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === view));
    });
  }
  function applyState(st) {
    cur = st.r === 'hk' ? REGIONS.hk : REGIONS.uk;
    var dirSet = cur.dirs, schoolSet = {};
    cur.schools.forEach(function (s) { schoolSet[s.key] = 1; });
    activeDirs = st.d.filter(function (d) { return !!dirSet[d]; });
    activeSchools = st.s.filter(function (k) { return !!schoolSet[k]; });
    // 链接里的筛选项可能来自另一个板块，对不上就重置——否则会筛出空结果还找不到原因
    testSel = testOptionsFor(st.r).some(function (o) { return o[0] === st.t; }) ? st.t : 'ALL';
    groupBy = st.g; view = st.v || defaultView(); q = st.q; sortKey = st.o;
    viewPicked = !!st.v;
    sortDir = st.od || defaultDir(sortKey);
    syncRegionChrome(); syncControlsChrome();
    buildIndex(); renderManual(); renderChips(); apply();
  }

  // ══ 排序 ══
  // ══ 成绩解析 ══
  // 排序与「我的成绩」判定共用这一套：两处若各解析各的，会出现「排序说它更高、判定说你够不着」。
  var GRADE_VAL = { 'A*': 4, A: 3, B: 2, C: 1, D: 0, E: -1 };
  function gradeSum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }
  // 把一段等级串拆成降序的等级值数组："A*A*A" → [4,4,3]；"4A*" → [4,4,4,4]
  function parseGrades(t) {
    var re = /(\d+)\s*([A-E])(\*)?|([A-E])(\*)?/g, m, out = [];
    while ((m = re.exec(String(t || '')))) {
      var v = m[1] ? GRADE_VAL[m[2] + (m[3] || '')] : GRADE_VAL[m[4] + (m[5] || '')];
      if (v === undefined) continue;
      var n = m[1] ? +m[1] : 1;
      while (n--) out.push(v);
    }
    return out.sort(function (a, b) { return b - a; });
  }
  // 一座专业的 A-Level 要求档。两处必须清洗，否则会读进不属于要求的字母：
  // 1) 括号里的「或 AAB + Art Foundation」是备选方案，会带进 Art 的 A、EPQ 的 E；
  // 2) 出现区间时取更高的一端——英国写「高–低」(A*A*A*–A*AA)，港中文写「低–高」(ABB–AAB)，
  //    方向相反，只取最大才两头都对（旧实现固定取第一段，对港中文等于取了低端）。
  // 解析结果按原串缓存：数据静态，而这个函数每次判定要被调用上千次
  //（238 条 × 摘要 + 每行徽章 + 冲稳保），正则在这里是热点。
  var _gpCache = {};
  function gradeProfile(s) {
    var ck = String(s == null ? '' : s);
    if (ck in _gpCache) return _gpCache[ck];
    return (_gpCache[ck] = _parseGradeProfile(ck));
  }
  function _parseGradeProfile(s) {
    if (!s) return [];
    // 先剔掉「A-Level / AL / IAL / ASL」这类资历名，否则「3 AL 合格」会被读成「3 个 A」
    var head = String(s).split('（')[0].trim()
      .replace(/A[\s-]?L(?:evel)?s?/gi, ' ').replace(/A[\s-]?S[\s-]?L/gi, ' ').trim();
    // 门槛写法「3 AL ≥ B」= 三门各达 B，要按门数展开，否则会被当成「一门 B」
    var g = head.match(/^(\d+)\s*[≥>=]+\s*([A-E])(\*)?/i);
    if (g) {
      var v = GRADE_VAL[g[2].toUpperCase() + (g[3] || '')];
      if (v !== undefined) {
        var out = [];
        for (var i = 0; i < +g[1]; i++) out.push(v);
        return out;
      }
    }
    // 「3 AL 合格」这类：中文里「合格」就是 E。学生填了成绩就该能对上，
    // 否则岭南那 18 条永远没有判定，还会被「只看达得到」误筛掉。
    if (/合格/.test(head)) {
      var cn = +((head.match(/(\d+)\s*AL/) || [])[1] || 3);   // 「3 AL 合格」按 3 门算
      var es = [];
      for (var ei = 0; ei < cn; ei++) es.push(GRADE_VAL.E);
      return es;
    }
    // 截到第一个非等级字符为止：剩下的中文说明（「或…」）不该再往下读
    var body = (head.match(/^[A-E*\d\s+–—~\/]*/) || [''])[0];
    var segs = body.split(/[–—~]|\s*\/\s*/).map(parseGrades).filter(function (a) { return a.length; });
    if (!segs.length) return [];
    return segs.reduce(function (best, cur) { return gradeSum(cur) > gradeSum(best) ? cur : best; });
  }
  // 「≥3 AL」这种只写了门数、没写等级的要求。它不是一个分数档，
  // 但也不能因此判不出——那会让「只看达得到」把这些专业整批筛掉，学生会误判成申不了。
  // 规则：够门数就「达到门槛」，不够才「低于门槛」。
  function gradeCountReq(s) {
    if (!s) return null;
    var head = String(s).split('（')[0].trim();
    if (/合格/.test(head)) return null;                 // 走上面「合格 = E」那条
    var m = head.match(/^[≥>=]{0,2}\s*(\d+)\s*AL(?:evel)?s?\s*$/i);
    return m ? +m[1] : null;
  }
  // 取平均而非求和，避免「要求 4 门」被误判成「更难」；折不出分数的排最后
  var _gsCache = {};
  function gradeScore(s) {
    var ck = String(s == null ? '' : s);
    if (ck in _gsCache) return _gsCache[ck];
    var p = gradeProfile(ck);
    return (_gsCache[ck] = p.length ? gradeSum(p) / p.length : null);
  }
  // IB 总分要求。区间同样取较高一端（"31–33" → 33）；只说「文凭 / Diploma」不给分数的返回 null
  function ibScore(s) {
    var t = String(s || '');
    var r = t.match(/(\d{2})\s*[–—~-]\s*(\d{2})/);
    var v = r ? Math.max(+r[1], +r[2]) : null;
    if (v == null) {
      // 数字要自成词：「Diploma（Year1 无分数下限）」里的 1 不是分数
      var m = t.match(/\b(\d{1,2})\b/);
      v = m ? +m[1] : null;
    }
    // IB 总分只可能是 24–45，超出这个范围的一定是误读（学年、科目数等）
    return (v != null && v >= 20 && v <= 45) ? v : null;
  }
  // QS 存成负名次：这样「降序」对所有键都等于「从好/从高到低」，方向语义统一
  function qsScore(p) { var l = qsListFor(p); return l.length ? -rankNum(l[0].rank) : null; }
  // 雅思要求：取字符串开头的分数（"6.5（各项≥6.0）" → 6.5）。
  // 需要 idx / rc 才能取到英语数据，所以排序时传的是整条 pair 而不是单条专业。
  function ieltsOf(x) {
    var e = engFor(x.idx, x.rc || curRc());
    if (!e || !e.ielts) return null;
    var m = String(e.ielts).match(/(\d(?:\.\d)?)/);
    if (!m) return null;
    var v = +m[1];
    return (v >= 4 && v <= 9) ? v : null;   // 雅思只可能是 4–9，超出范围的是误读
  }
  var SORT_KEYS = { name: 1, alevel: 1, ib: 1, qs: 1, ielts: 1 };
  // 每个键一个取值函数；取不到值返回 null，一律排最后
  var SORT_VAL = {
    name: function (x) { return String(x.p.zh); },
    alevel: function (x) { return gradeScore(x.p.alevel); },
    ib: function (x) { return ibScore(x.p.ib); },
    qs: function (x) { return qsScore(x.p); },
    ielts: function (x) { return ieltsOf(x); }
  };
  function defaultDir(k) { return k === 'name' ? 'asc' : 'desc'; }
  var SORT_TITLE = {
    name: '按专业名排序',
    alevel: '按 A-Level 要求排序：A*=4 / A=3 / B=2 / C=1 / D=0 / E=-1 取平均（不看科目难易，只看等级本身）；区间取较高一端，折不出分数的排在最后',
    ib: '按 IB 总分要求排序；区间取较高一端',
    qs: '按 QS2026 最好名次排序（名次数字越小越靠前）',
    ielts: '按雅思总分要求排序：数字越大要求越严。校级统一口径的学校，其所有专业按同一个分数排；官网未列 IELTS 的排在最后'
  };
  // pairs: [{p, idx}] —— 排序后仍要保持 p 与 idx 对应
  function sortPairs(pairs, key, dir) {
    var sign = dir === 'asc' ? 1 : -1;
    var val = SORT_VAL[key] || SORT_VAL.name;
    return pairs.slice().sort(function (a, b) {
      if (key === 'name') return sign * val(a).localeCompare(val(b), 'zh-Hans-CN');
      var va = val(a), vb = val(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;      // 取不到值的恒排最后，不受升降序影响
      if (vb == null) return -1;
      return sign * (va - vb);
    });
  }
  // 排序状态常驻提示：表头可能已被滚出视野，这里保证随时看得到、点得到（点一下取消）
  var SORT_LABEL = { name: '专业名', alevel: 'A-Level', ib: 'IB', qs: 'QS 名次', ielts: '雅思' };
  function dirWord(k, d) {
    if (k === 'name') return d === 'asc' ? 'A → Z' : 'Z → A';
    if (k === 'qs') return d === 'desc' ? '名次好 → 差' : '名次差 → 好';
    return d === 'desc' ? '高 → 低' : '低 → 高';
  }
  function renderSortChip() {
    var chip = $('#sort-chip'); if (!chip) return;
    if (sortKey === 'default') { chip.hidden = true; return; }
    chip.hidden = false;
    chip.innerHTML = esc('排序：' + SORT_LABEL[sortKey] + ' ' + dirWord(sortKey, sortDir)) + '<span class="ar">' + ICON.close + '</span>';
  }

  // ══ 结果构成 / 成绩口径图例 / 学校速跳 ══
  var OFFER_ORDER = ['典型', '最低', '区间', '下限', '门槛'];
  var OFFER_GLOSS = {
    '典型': '多数获条件录取者的成绩水平',
    '最低': '校方公布的最低录取条件',
    '区间': '近年实际发出 offer 的成绩区间',
    '下限': '非联招参考下限，达线不保证录取',
    '门槛': '未公布分专业分数，仅列通用门槛'
  };
  // 筛完只剩几所学校时，把构成列出来——否则不知道「少了谁」
  function renderBreakdown(list) {
    var el = $('#result-breakdown'); if (!el) return;
    var by = {};
    list.forEach(function (p) { by[p.school] = (by[p.school] || 0) + 1; });
    var schools = cur.schools.filter(function (s) { return by[s.key]; });
    el.textContent = (schools.length >= 2 && schools.length < cur.schools.length)
      ? '（' + schools.map(function (s) { return s.zh + ' ' + by[s.key]; }).join(' · ') + '）'
      : '';
  }
  // 口径图例常驻：新用户看到「门槛」两个字的标签时，不必翻折叠说明
  function renderLegend(list) {
    var el = $('#legend'); if (!el) return;
    var seen = {};
    list.forEach(function (p) { var l = OFFER_ZH[p.offer]; if (l) seen[l] = 1; });
    var labels = OFFER_ORDER.filter(function (l) { return seen[l]; });
    if (labels.length < 2) { el.hidden = true; return; }   // 只有一种口径时不必解释
    el.hidden = false;
    el.innerHTML = '<span class="lg-k">成绩口径</span>' + labels.map(function (l) {
      return '<span class="lg-i"><b>' + esc(l) + '</b>' + esc(OFFER_GLOSS[l] || '') + '</span>';
    }).join('');
  }
  // 学校速跳：长表里直接跳到某校
  function renderJumpbar(list) {
    var el = $('#jumpbar'); if (!el) return;
    if (groupBy !== 'school') { el.hidden = true; return; }
    var seen = {};
    list.forEach(function (p) { seen[p.school] = 1; });
    var schools = cur.schools.filter(function (s) { return seen[s.key]; });
    if (schools.length < 3) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = '<span class="jb-k">跳到</span>' + schools.map(function (s) {
      return '<button type="button" class="jb" data-jump="' + s.key + '">' + sealHTML(s, false) + esc(s.zh) + '</button>';
    }).join('');
  }
  // 打印时纸上那行上下文：一张脱离本站的纸，得能自己说清是哪一批、按什么条件筛的
  function renderPrintMeta(n) {
    var el = $('#print-meta'); if (!el) return;
    var bits = [cur.name + ' · ' + cur.year + '（' + cur.cycle + '）'];
    if (activeDirs.length) bits.push('学科方向：' + activeDirs.map(function (d) { return cur.dirs[d].zh; }).join('、'));
    if (activeSchools.length) bits.push('大学：' + activeSchools.map(function (k) { return schoolByKey[k].zh; }).join('、'));
    if (testSel !== 'ALL') bits.push(cur.testHead + '：' + (testSel === 'NONE' ? '无' : testSel === 'YES' ? '需笔试' : testSel));
    if (q) bits.push('搜索：' + q);
    if (hasProfile()) bits.push('学生成绩：' + gradeBrief());
    bits.push('共 ' + n + ' 项');
    el.textContent = bits.join(' ｜ ');
  }
  function prefersReduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  // 视图默认：表格（窄屏也用表格——卡片虽不需要列头，但竖向占地太大）。
  // 注：窄屏表格要横向滚动，而横向滚动容器里的表头吸不住「页面」，这是取舍。
  // 用户手动切过视图才持久化，没切过就每次取这里的默认。
  // 视图默认：窄屏给卡片，宽屏给表格。
  // 8.0 时窄屏也默认表格（注释里的理由是「卡片竖向占地太大」），可表格 min-width 是 900px，
  // 手机上唯一能做的就是横向拖。卡片压成紧凑几行之后这个理由就不成立了——
  // 「一眼扫到分数」比「拖到英语列再拖回来」快得多。用户手动切过视图就按用户的来。
  function defaultView() { return window.innerWidth <= 700 ? 'card' : 'table'; }

  // ── 术语说明（分板块） ──
  var MANUAL = {
    uk: [
      { t: '成绩口径', items: [
        '**典型**：大学公布的典型录取水平，为多数获得条件录取者的成绩，并非最低线。',
        '**最低**：部分大学（如帝国理工）同时公布最低与典型两级，最低一档在表内标“最低”。',
        '**区间**：爱丁堡公布近年实际发出 offer 的成绩区间（from X to Y），表内标“区间”。',
        '**降档政策**：面向英国特定家庭背景申请者的降分（contextual offer）；中国申请人一般以标准条件评估，表中不列。'
      ]},
      { t: '入学笔试（2027 年入学）', items: [
        '**ESAT**（帝国工科、UCL 电子电气、牛津物理/生物医学、剑桥自然科学/工程等）、**TMUA**（剑桥经济/计算机、牛津计算机/数学、帝国计算机/数学、UCL 经济、LSE 数学类）、**TARA**（UCL 计算机系、牛津经济与管理）、**STEP**（剑桥数学录取后附加）、**UCAT**（剑桥医学）——均见各行“入学笔试”列。',
        '2027 调整：牛津物理改考 ESAT、计算机/数学改考 TMUA、经济与管理考 TARA；LSE 经济类 2026 起必考 TMUA。'
      ]},
      { t: '课程结构（按名字找课）', items: [
        '**剑桥**：生物、化学、物理统一在 Natural Sciences 下招生，申请时选 Biological 或 Physical 流；统计学路线在 Mathematics 内。',
        '**牛津**：统计学路线与数学同一课程页；管理与金融方向在 Economics and Management 内。',
        '**帝国理工**：生物方向对应 Biological Sciences；商科本科为 Economics, Finance and Data Science。',
        '**曼大（2027）**：数据科学方向为 BAEcon Data Science and Economics；会计与金融分 BAEcon Accounting and Finance、BSc Accounting 两条。'
      ]},
      { t: '学制与学位', items: [
        '苏格兰（爱丁堡）本科一般四年，经管授 MA (Hons)（本科荣誉学位）；MEng/MSci/MMath/MBiochem 为本科直申本硕贯通。'
      ]},
      { t: '英语要求（IELTS / TOEFL / IGCSE-ESL）', items: [
        '**逐专业 or 校级**：帝国、UCL、KCL、曼大、爱丁堡、华威 6 校按专业（或档位）发布，表中标「逐专业」；点该行的「英语要求详情」（手机可直接点开）即可看 IELTS / TOEFL 旧新制 / GCSE / IGCSE-ESL / IB / GCE 全部值；牛津、剑桥、LSE 为**全校统一**，标「校级」。',
        '**常见量级**：牛津 7.5（各项 7.0）｜剑桥 7.5｜LSE 7.0（各项 7.0）｜帝国 Standard 6.5 / Higher 7.0｜UCL Level 1–5（6.5 → 8.0）｜KCL Band B 7.0 / Band D 6.5｜曼大 6.0–7.0｜爱丁堡 6.5（商科 7.0）｜华威 Band A 6.0 / C 7.0。',
        '**IGCSE 英语分两类，表内分两行列**：**EFL＝第一语言（First Language）**，**ESL＝第二语言（Second Language）**。优先级：**IELTS / TOEFL 为第一选择，EFL 次之、ESL 再次**（部分学校不接受 ESL）。表中 EFL / ESL 一栏给的是**该专业档位对应的具体成绩**（如 UCL Level 4 → EFL 6 + Distinction；曼大 EEE → ESL 不接受）。',
        '**TOEFL 分制变更**：2026-01-21 起改 1–6 分制，表内同时给旧制与新制两个值；多数学校不接受拼分（MyBest / One Skill Retake），且要求同一次考试出分。',
        '**豁免**：在英语国家完成学位或达到指定年限的英语授课，可申请豁免（各校规定不同，以官网为准）。'
      ]},
      { t: 'QS 学科排名（参考）', items: [
        '表内「QS2026 学科」列与卡片上的「QS2026 #N」标签，来自 **QS World University Rankings by Subject 2026**（各校在该学科的名次；含并列 "=4" 与区间 "51–100"）。',
        '一个专业对应的学科榜由其**学科方向**决定，方向内再按**专业名**收敛到本学科家族（如「社科·法律」里，法学给法学榜、犯罪学给法学＋社会政策榜，不会把同方向的心理学 / 地理名次一并列出）；表内**全部列出**（按名次优先后排列，最多 9 个）。',
        '「—」表示本站收录的学科里**没有**与该专业对应的榜，或该校在该学科**未进入前 200 名**（本站只收录前 200 名）。',
        '排名只反映研究声誉与产出，与本科录取难度**不是同一回事**，仅作选校参考。'
      ]}
    ],
    hk: [
      { t: '成绩口径（各校公布方式不同）', items: [
        '**典型**：大学直接公布“典型录取条件”的，表内标“典型”——多数获条件录取者的水平，并非最低线。',
        '**下限**：港大公布各专业 A-Level / IB 参考下限（如 MBBS 4A*、IB 43）；达线不等于录取。',
        '**区间**：港中文公布参考收分区间（官方 Reference Scores）；非保证线，热门专业实收更高。',
        '**门槛**：其余各校不公布分专业分数，只给大学通用要求与科目要求，表内标“门槛”；实际条件见录取信。',
        '标“门槛”的学校中，浸会、教育另公布**全校录取区间**（仅作参考），已写在表中 IB 列括注里，不代表录取线。',
        '以上都只是参考坐标，**热门专业实际录取普遍高于表中数字**。'
      ]},
      { t: '各校大学通用门槛（A-Level / IB 直申）', items: [
        '**港大**：官网按专业公布参考下限（表内“下限”）；A-Level 计分**不计中文、英文语文科及 EPQ 等非学术科目**；英文 IELTS 6.5 / TOEFL 93。',
        '**港中文**：官网公布参考收分区间（表内“区间”）；英文 IELTS 6.0 / TOEFL 80；中文要求对修读非本地课程的申请人可经院长酌情豁免。',
        '**港科大**：GCE AL 3 门合格；IB 文凭。英文 IELTS 6.0。',
        '**城大**：GCE AL 3 门各 ≥E；IB 文凭。英文 GCSE English Language / Literature 达 C/4，或 IELTS 6.5 / TOEFL 79。',
        '**理大**：国际生档 GCE AL 3 门各 ≥B；IB 文凭（近年录取典型 ≥32）。英文 IELTS 6.0 / TOEFL 80。',
        '**浸会**：GCE AL 3 门各 ≥E（或 2 AL + 2 ASL）；IB 文凭。英文 IELTS 6.0 / TOEFL 79；中医、中药及部分文学士主修另须认可中文资历。',
        '**教育**：GCE AL 3 门各 ≥D（或 2 AL + 2 ASL）；IB 文凭（官网未设最低分）。英文 IELTS 6.0 / TOEFL 80；部分课程另须认可中文资历。',
        '**岭南**：GCE AL/IAL 3 门合格（或 2 AL + 2 AS）；IB 文凭（官网未列分数）。英文 IELTS 6.0 / TOEFL 79。以人文社科为主，国际资历途径不设中文科要求。',
        'A-Level 与 IB 科目均**不含中文、英文两科**；ASL 与 AL 同一科目不可重复计入。'
      ]},
      { t: 'DSE 并非必需（A-Level / IB 单独可申）', items: [
        '香港八大 UGC 课程基本都接受 A-Level 或 IB 直申（non-JUPAS Year 1 / 国际生通道），本板块全部课程均可仅凭 AL 或 IB 申请，无需 HKDSE。',
        '**英文是硬门槛**：城大要求 GCSE English Language / Literature 达 C/4（非英文授课资历另需 IELTS 6.5 / TOEFL 79）；理大 IELTS 6.0 / TOEFL 80；港科 IELTS 6.0；港大、港中文亦各有英文要求并以 GCSE/GCE/IB 英语等级或 IELTS 达标。',
        '本表列出的是“大学通用门槛 + 分课程科目要求”；热门专业实际录取显著高于门槛。'
      ]},
      { t: '招生结构与申请方式', items: [
        '**港科大**：理科方向经 Science (Group A＝物理科学方向 / Group B＝自然科学方向) 入组，大一后再声明主修。',
        '**港中文 / 港大**：化学、生物、物理、数学等经理学大类入口（CUHK JS4601 / HKU JS6901），入学后再选主修。',
        '**港中文**：计算机科学经 JS4412（Computer Science and Engineering）入口。',
        '**教育大学**：师范课程自 2025/26 起统一改为 **5 年制「非教育学位 + 教育学士」双学位**（如「英语研究及数码传讯文学士及英文教育学士」）；报读这类双学位的申请人都须由推荐人提交一份网上评核报告，否则申请不获考虑。',
        '**报文科要留意中文资历**：城大「文学士（中文及历史）」、理大「中国历史及文化」、教大「数码中国文化与传意文学士及中文教育学士（JS8003）」都要求认可中文资历（GCE / GCSE 中文、HSK 5 级或 IB 中文 4 分等），无中文资历的 A-Level / IB 申请人实际难以申请。港大、港中文的文科专业不设此限（港中文的中文要求可经院长酌情豁免）。',
        '**表中的 JS 代码是 JUPAS（DSE 联招）代码**；A-Level / IB 申请人通过各校“国际资历 / non-JUPAS”通道按专业名称申请，不按 JS 码填报（JS 码仅用于对照识别专业）。',
        '**理大 / 城大**：医学相关学科在理大 FHSS（护理、物理治疗、放射、医疗化验等）。'
      ]},
      { t: '面试与甄选', items: [
        '医、牙（HKU BDS/JS6107）、护理、物理治疗、放射、医疗化验、量化金融、环球商业（HKUST Global Business/QFin）等有强制或选择性面试；**个别未标注的专业亦可能邀请面试**，具体以官网专业页为准。',
        '医、牙等有临床/实习前置要求；港中文 MBChB 另要求 GCE 平均 UMS ≥95%。'
      ]},
      { t: '数据口径与年份', items: [
        '本板块数据为 **2026 入学轮次**各校官网公布的最新要求（2027 轮更新前可参考）；分数来源均为各校官网：港大公布参考下限，港中文公布参考收分区间，其余各校只给大学通用门槛与科目要求。',
        '港中文参考分数由 2023–2025 年录取统计得出，官网明确“仅供参考、不用于预测录取机会”。'
      ]},
      { t: '英语要求（多为校级统一）', items: [
        '**港校一般不按专业设英语线**（表中标「校级」）：港大 IELTS 6.5 / TOEFL 93；港中文 6.0 / 80（**例外：环球商业 GBS 要 7.0 / 100**）；港科大 6.0 / 80；城大 6.5 / 79；理大 6.0 / 80；浸会 6.0 / 79；教大 6.0 / 80；岭南 6.0 / 79。',
        '**可用中学英语成绩替代**：GCE / GCSE English、IGCSE English、IB English 均可（等级要求点「英语要求详情」查看）；**城大**明确要求 GCSE English Language / Literature C/4，或 IELTS 6.5 / TOEFL 79。',
        '**IGCSE ESL**：港大、港科大、城大、浸会**接受但要求更高**（多为 B / 5 级）；港中文、理大、教大、岭南官网未区分 ESL/EFL。',
        '**同一次考试**：港大等明确要求 IELTS / TOEFL 在同一次考试达到、成绩两年内有效；不接受 IELTS Indicator / One Skill Retake 等。'
      ]},
      { t: 'QS 学科排名（参考）', items: [
        '表内「QS2026 学科」列与卡片上的「QS2026 #N」标签，来自 **QS World University Rankings by Subject 2026**。',
        '港校强项举例：**港大牙医 #2、KCL 牙医 #5；港中文护理 =6、KCL 护理 #2、曼大护理 =10；港大数据科学与AI #18、港科大 #25、港中文 #28**。',
        '一个专业对应的学科榜，先按**专业名**收敛到本学科家族（如「人文·语言」里，历史给历史榜、音乐给表演艺术榜），认不出学科名才退回**学科方向**桶；**师资培训学位（教育学士 / BEd）优先按「教育与培训」归类**——教大的五年制双学位课程名带着所教科目的前半截（如「AI 理学士及数学教育学士」），不先判定就会被 AI 等学科规则截走。表内**全部列出**（按名次优先后排列，最多 9 个）。',
        '「—」表示本站收录的学科里**没有**与该专业对应的榜，或该校在该学科**未进入前 200 名**（本站只收录前 200 名；200 名之后为区间段，未收录，不代表该校完全未上榜）。',
        '排名反映的是研究声誉与产出，与本科录取难度**不是同一回事**，仅作选校参考。'
      ]}
    ]
  };

  // ── 数据集索引 ──
  var schoolByKey = {}, schoolCount = {}, dirCount = {};
  var engByRegion = { uk: [], hk: [] };
  var engSchoolByKey = {};   // 两板块合并的学校索引（对比清单跨板块取英语用）
  // 专业名归一化：去掉末尾括注，便于与英语数据集的英文名匹配
  function engKey(en) { return String(en || '').replace(/\s*[（(].*?[)）]\s*$/, '').trim().toLowerCase(); }
  function engBuildFor(reg) {
    var used = {}, out = [];
    reg.programs.forEach(function (p) {
      engSchoolByKey[p.school] = p.school;
      var rec = null;
      var list = (typeof ENG_PROG !== 'undefined' && ENG_PROG[p.school]) ? ENG_PROG[p.school] : null;
      if (list && list.length) {
        var matches = list.filter(function (x) { return engKey(x.en) === engKey(p.en); });
        if (matches.length) {
          var k = p.school + '|' + engKey(p.en);
          var n = used[k] || 0;
          rec = matches[Math.min(n, matches.length - 1)];
          used[k] = n + 1;
        }
      }
      out.push(rec);
    });
    return out;
  }
  // ── 单页路径：每个专业一个独立的静态页（生成器在仓库外的 build_pages.js）──
  // 生成器按这行标记把下面两个函数整段抽出去复用——命名只有这一份实现。
  // 若在两边各写一遍 slug 规则，改一处忘一处就会让列表里的链接整片 404。
  function progSlug(en) {
    return String(en || '').toLowerCase()
      .replace(/&/g, ' and ').replace(/[（）()]/g, ' ')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'programme';
  }
  // 同校可能有同名专业（帝国 Computing 的 MEng/BEng），按出现顺序补 -2、-3
  function buildPagePaths(reg) {
    var used = {}, out = [];
    reg.programs.forEach(function (p) {
      var s = progSlug(p.en);
      if (used[s]) { used[s] += 1; s = s + '-' + used[s]; } else used[s] = 1;
      out.push(p.school + '/' + s + '.html');
    });
    return out;
  }
  var pagePaths = { uk: [], hk: [] };
  function pageLinkHTML(rc, idx) {
    var p = (pagePaths[rc] || [])[idx];
    if (!p) return '';
    return '<a class="pg-link" href="' + esc(p) + '" target="_blank" rel="noopener"' +
      ' title="这一条有独立页面，可单独发给同学或收藏：' + esc(p) + '">单页</a>';
  }

  function buildIndex() {
    schoolByKey = {}; schoolCount = {}; dirCount = {};
    cur.schools.forEach(function (s) { schoolByKey[s.key] = s; });
    cur.programs.forEach(function (p) {
      schoolCount[p.school] = (schoolCount[p.school] || 0) + 1;
      p.dirs.forEach(function (d) { dirCount[d] = (dirCount[d] || 0) + 1; });
    });
    engByRegion.uk = engBuildFor(REGIONS.uk);
    engByRegion.hk = engBuildFor(REGIONS.hk);
    pagePaths.uk = buildPagePaths(REGIONS.uk);
    pagePaths.hk = buildPagePaths(REGIONS.hk);
    if (!qBlob.uk.length) buildSearchBlobs();   // 数据静态，两个板块各建一次就够（切板块会重跑 buildIndex）
  }
  // 取某专业的英语要求：优先逐专业记录，否则回落到该校校级口径
  function engFor(idx, regCode) {
    var code = regCode || (cur === REGIONS.hk ? 'hk' : 'uk');
    var reg = REGIONS[code];
    var p = reg.programs[idx];
    var rule = (typeof ENG_RULES !== 'undefined' && p) ? ENG_RULES[p.school] : null;
    if (!rule) return null;
    var rec = engByRegion[code] ? engByRegion[code][idx] : null;
    if (rec) {
      return {
        scope: 'prog', tag: rec.tag || '逐专业', band: rec.band || '',
        ielts: rec.ielts || rule.ielts, toeflOld: rec.toeflOld || rule.toeflOld, toeflNew: rec.toeflNew || rule.toeflNew,
        gcse: rec.gcse || rule.gcse, igcseEFL: rec.igcseEFL || rule.igcseEFL,
        igcseESL: rec.igcseESL || rule.igcseESL,
        eslFlag: rec.eslFlag || rule.eslFlag || 'unknown', eslGrade: rec.eslGrade || '',
        ibEnglish: rec.ibEnglish || rule.ibEnglish, gceEnglish: rule.gceEnglish,
        note: rec.extra || '', rule: rule, progUrl: p ? p.url : ''
      };
    }
    return {
      scope: 'school', tag: '校级', band: '',
      ielts: rule.ielts, toeflOld: rule.toeflOld, toeflNew: rule.toeflNew,
      gcse: rule.gcse, igcseEFL: rule.igcseEFL, igcseESL: rule.igcseESL, ibEnglish: rule.ibEnglish, gceEnglish: rule.gceEnglish,
      eslFlag: rule.eslFlag || 'unknown', eslGrade: '',
      note: rule.note || '', rule: rule, progUrl: p ? p.url : ''
    };
  }
  function engTitle(e) {
    if (!e) return '';
    return '英语要求（' + e.tag + '）：IELTS ' + (e.ielts || '—') +
      '；TOEFL 旧制 ' + (e.toeflOld || '—') + '；TOEFL 新制 ' + (e.toeflNew || '—') +
      '；GCSE ' + (e.gcse || '—') + '；IGCSE-ESL ' + (e.igcseESL || '—') +
      '；IB English ' + (e.ibEnglish || '—') + '；GCE English ' + (e.gceEnglish || '—') +
      (e.note ? '；备注 ' + e.note : '');
  }
  function engIeltsShort(e) { // 摘要行只放分数本身，括注（单项要求等）留给详情
    if (!e || !e.ielts) return '—';
    return String(e.ielts).split('（')[0].trim();
  }
  function engPair(e) { // TOEFL 旧/新 简写（非数字的说明性文案一律折成“未列”，全文见详情）
    if (!e) return '—';
    function brief(v) {
      if (!v || v === '—') return '—';
      var t = String(v).split('（')[0].trim();
      if (/未列|未公开|—/.test(t)) return '—';
      return /^[0-9]/.test(t) ? t : '—';
    }
    return brief(e.toeflOld) + ' / ' + brief(e.toeflNew);
  }
  // IGCSE-ESL 是否接受——各校差异最大、最影响可申性，摘要行直接显示，不藏在悬停里
  // 把详情里的取值压成短标签
  // 原则：标签只给「一眼能比」的那点信息，附加条件（考局限制、口试要求等）留在详情里
  function engShortTag(prefix, v) {
    v = String(v || '').trim();
    if (!v || v === '—') return '';
    if (/不接受/.test(v)) return prefix + ' 不接受';
    if (/未区分/.test(v)) return prefix + ' 未区分';
    if (/未列/.test(v)) return prefix + ' 未列';
    if (/^有条件接受$/.test(v)) return prefix + ' 有条件';
    v = v.replace(/^IGCSE (?:First|Second) Language\s*/, '')
         .replace(/^(?:ESL|EFL)\s*/i, '')
         .replace(/^接受[：:]\s*/, '');
    // 分号后一般是附加条件（如「仅限 CAIE / Oxford AQA / Pearson Edexcel」）——不塞进标签
    v = v.split(/[；;，,]/)[0].trim();
    // 说明性括注丢掉；「（5）」「（4）」这类等效等级保留
    v = v.replace(/（(?![0-9A-D]）)[^）]*）/g, '')
         .replace(/^(?:Grade|等级)\s*/i, '')
         .replace(/Distinction/g, 'Dist')
         .replace(/\s*\+\s*/g, '+')
         .replace(/\s+/g, '');
    if (v === '可') v = '接受';
    if (!v) return '';
    if (v.length > 9) return prefix + ' 见详情';   // 兜底：实在压不下来就不硬塞
    return prefix + ' ' + v;
  }
  // 四大体系在粗略展示里都露出：IELTS / TOEFL 各自成行，EFL 与 ESL 各给一枚标签
  function engChipTags(e) {
    if (!e) return '';
    function chip(prefix, txt, full) {
      if (!txt) return '';
      return '<span class="eng-esl' + (prefix === 'EFL' ? ' efl' : '') + (/不接受/.test(txt) ? ' no' : '') +
        '" title="' + esc(full) + '">' + esc(txt) + '</span>';
    }
    // 标签是简写，完整原文挂在 title 上（桌面端悬停即见；手机上点「详情」看全）
    var eflFull = igcseValue(e, 'efl'), eslFull = igcseValue(e, 'esl');
    return chip('EFL', engShortTag('EFL', eflFull), eflFull) +
           chip('ESL', engShortTag('ESL', eslFull), eslFull);
  }
  // ── IGCSE 英语（EFL 第一语言 / ESL 第二语言）──
  // 从该校的 GCSE/IGCSE 档位文字里解析出等级（各校写法不同，按优先级匹配）
  function parseIgcseGrade(e) {
    var t = String((e && e.gcse) || '').split('（')[0].split('；')[0].trim();
    if (!t || /官网未列|官网未区分|随 Level|随专业/.test(t)) return '';
    var m;
    if ((m = t.match(/(\d)\s*\/\s*([A-D])(?![A-Za-z])/))) return m[1] + '/' + m[2];
    if ((m = t.match(/([A-D])\s*\/\s*(\d)/))) return m[1] + '/' + m[2];
    if ((m = t.match(/Band\s*[A-C]\s*\/\s*[A-C]\s*需\s*(\d\s*\/\s*[A-D])/i))) return m[1].replace(/\s+/g, '');
    if ((m = t.match(/(?:English|Language)[^0-9A-D]*?([A-D])(?![A-Za-z])/))) return m[1];
    if ((m = t.match(/(?:English|Grade)[^0-9]*?(\d)(?![0-9])/))) {
      var q = (t.match(/(Merit|Distinction|Pass)/i) || [])[1];
      return m[1] + (q ? ' + ' + q : '');
    }
    return '';
  }
  function igcseValue(e, kind) {
    var note = ((e && e.rule && e.rule.igcseTypeNote) || {})[kind] || '';
    var isStatus = /不接受|官网未列|官网未区分/.test(note);
    var prefix = kind === 'efl' ? 'IGCSE First Language ' : 'IGCSE Second Language ';
    if (isStatus) {
      // 状态词：不接受 / 官网未列 / 官网未区分
      if (kind === 'esl' && e && e.eslGrade && /Grade/.test(e.eslGrade)) {
        return prefix + e.eslGrade.replace(/^接受：/, '');
      }
      return note;
    }
    if (kind === 'esl') {
      // UCL：Level 1–2 接受、Level 3 起不接受（具体等级同 GCSE 档）
      if (e && e.eslFlag === 'no') return '不接受';
      var rg = (e && e.eslGrade) || '';
      if (rg && /Grade/.test(rg)) return prefix + rg.replace(/^接受：/, '');   // 曼大等：按课程给出 Grade 8 / Grade B
      if (rg && /^不接受/.test(rg)) return '不接受';
      if (rg && /未列/.test(rg)) return '未列';
      if (note) return prefix + note;                       // 港校：显式等级（如 B（5））
      var gEsl = parseIgcseGrade(e);
      if (gEsl) return prefix + gEsl + ((e.rule && e.rule.zh === 'UCL') ? '（ESL 最高只到 Level 2）' : '');
      return (e && e.eslFlag === 'cond') ? '有条件接受' : '—';
    }
    // EFL：等级来自 gcse 档位解析，或显式 note
    var g = parseIgcseGrade(e);
    var oral = (String((e && e.gcse) || '').match(/口语\s*(Merit|Distinction)/) || [])[0];
    if (g) return prefix + g + (oral ? '（' + oral + '）' : '');
    if (note) return prefix + note;
    return '官网未列';
  }
  // 英语详情的字段只在这里定义一次：表格的展开行与卡片的折叠列表共用同一份
  function engDetailItems(e) {
    if (!e) return [];
    var rule = e.rule || {};
    return [
      ['口径', e.tag + (e.band ? '（' + e.band + '）' : '')],
      ['IELTS', e.ielts || '—'],
      ['TOEFL 旧制', e.toeflOld || '—'],
      ['TOEFL 新制', e.toeflNew || '—'],
      ['EFL（第一语言）', igcseValue(e, 'efl')],
      ['ESL（第二语言）', igcseValue(e, 'esl')],
      ['GCSE / IGCSE 英语', e.gcse || ''],
      ['IB English', e.ibEnglish || '—'],
      ['GCE English', e.gceEnglish || '—'],
      ['备注', e.note || ''],
      // 来源分两条：逐专业记录的出处是该专业自己的课程页；校级要求的出处才是学校英语总页。
      // 只给学校总页的话，点进去看不到这个专业的线——曼大航空航天工程就是这种情况
      //（学校总页只给典型档，各专业分数写在各自课程页上）。
      ['该专业官网', e.progUrl || ''],
      ['学校英语要求页', rule.url || '']
    ].filter(function (kv) { return kv[1]; });   // 与原实现一致：值为空则不占一行
  }
  function engValHTML(k, v) {
    // 链接文字就用字段名，免得以后加来源时忘了同步标题、两边对不上
    return /^https?:/.test(v)
      ? '<a href="' + esc(v) + '" target="_blank" rel="noopener noreferrer">' + esc(k) + ' ↗</a>'
      : esc(v);
  }
  // 表格：整行展开用网格铺开
  function engDetailGrid(e) {
    var items = engDetailItems(e);
    if (!items.length) return '';
    return '<div class="eng-detail-grid">' + items.map(function (kv) {
      return '<div class="ed-i"><span class="ed-k">' + esc(kv[0]) + '</span><span class="ed-v">' + engValHTML(kv[0], kv[1]) + '</span></div>';
    }).join('') + '</div>';
  }
  // 卡片：宽度够，仍用折叠列表
  function engDetailHTML(e) {
    var items = engDetailItems(e);
    if (!items.length) return '';
    return '<details class="eng-more"><summary>英语要求详情</summary><ul>' + items.map(function (kv) {
      return '<li><b>' + esc(kv[0]) + '</b><span>' + engValHTML(kv[0], kv[1]) + '</span></li>';
    }).join('') + '</ul></details>';
  }
  // 只返回单元格「内容」——由调用方套 <td>。
  // （之前自带 <td>，对比表里再包一层就变成嵌套 td，浏览器会拆成两格，整行右移一位）
  function engCellInner(e, rowId, label) {
    if (!e) return '—';
    return '<span class="eng-1">IELTS ' + esc(engIeltsShort(e)) + engChip(e) + '</span>' +
      '<span class="eng-2">TOEFL ' + esc(engPair(e)) + (e.band ? ' · ' + esc(e.band) : '') + '</span>' +
      engChipTags(e) +
      '<span class="eng-tag' + (e.scope === 'prog' ? ' prog' : '') + '">' + esc(e.tag) + '</span>' +
      (rowId && engDetailItems(e).length ? '<button type="button" class="eng-open" data-eng="' + esc(rowId) +
        '" data-eng-label="' + esc(label || '') + '" aria-haspopup="dialog"' +
        ' title="打开英语要求详情（IELTS / TOEFL / EFL / ESL / IB / GCE）">详情</button>' : '');
  }

  var manualRendered = false;
  function renderManual() {
    var host = $('#manual-body');
    var isUK = cur === REGIONS.uk;
    host.innerHTML = MANUAL[isUK ? 'uk' : 'hk'].map(function (sec) {
      return '<section><h3>' + esc(sec.t) + '</h3><ul>' +
        sec.items.map(function (it) { return '<li>' + fmtBold(it) + '</li>'; }).join('') +
        '</ul></section>';
    }).join('');
    // 标出这套说明属于哪个板块——说明内容随板块整体替换
    var badge = $('#manual-region');
    if (badge) {
      badge.textContent = cur.name;
      // 切板块时脉冲一次，把视线引到这套板块专属口径；首次渲染不闪
      if (manualRendered) {
        badge.classList.remove('pulse'); void badge.offsetWidth; badge.classList.add('pulse');
        clearTimeout(badge._pulseT);
        badge._pulseT = setTimeout(function () { badge.classList.remove('pulse'); }, 1150);
      }
    }
    var box = $('#manual');
    if (box) box.setAttribute('aria-label', cur.name + '术语与口径说明');
    manualRendered = true;
  }

  // ── 筛选 chips ──
  // 各板块的「笔试 / 面试」筛选项。英国是固定几种入学笔试；
  // 香港的取值直接来自数据本身（面试 / 面试（入围）/ 作品集），不写死——
  // 原先整个筛选行在香港板块是 display:none，学生会以为香港不用考任何东西。
  function testOptionsFor(rc) {
    if (rc !== 'hk') return TEST_OPTS;
    var opts = [['ALL', '不限'], ['NONE', '无附加'], ['YES', '有附加']];
    var seen = { ALL: 1, NONE: 1, YES: 1 };
    REGIONS.hk.programs.forEach(function (p) {
      if (p.test && !seen[p.test]) { seen[p.test] = 1; opts.push([p.test, p.test]); }
    });
    return opts;
  }
  function chipRows(list, isSchool) {
    return list.map(function (s) {
      var on = (isSchool ? activeSchools : activeDirs).indexOf(s.key) !== -1;
      return '<button type="button" class="chip" data-k="' + s.key + '" aria-pressed="' + on + '">' +
        (isSchool ? '<span class="dot" style="--c:' + s.color + '"></span>' : '') +
        esc(s.zh) + '<span class="cnt">' + (isSchool ? (schoolCount[s.key] || 0) : dirCount[s.key] || 0) + '</span></button>';
    }).join('');
  }
  function renderChips() {
    // 只列出本板块确有专业的学科方向（英国板块无传媒类，香港板块物理 / 统计等方向不全）
    var dirKeys = Object.keys(cur.dirs).filter(function (d) { return (dirCount[d] || 0) > 0; });
    $('#filters-dir').innerHTML = chipRows(dirKeys.map(function (d) { return { key: d, zh: cur.dirs[d].zh }; }), false);
    $('#filters-school').innerHTML = chipRows(cur.schools, true);
    $('#filters-test').innerHTML = testOptionsFor(curRc()).map(function (t) {
      return '<button type="button" class="chip" data-k="' + esc(t[0]) + '" aria-pressed="' + (testSel === t[0]) + '"' +
        (TEST_TITLE[t[0]] ? ' title="' + TEST_TITLE[t[0]] + '"' : '') + '>' + esc(t[1]) + '</button>';
    }).join('');
    // 标签与说明随板块换：香港这一列装的是面试 / 作品集，不是入学笔试
    var lbl = $('#test-label');
    if (lbl) lbl.textContent = cur.testHead;
    var grp = $('#filters-test');
    if (grp) grp.setAttribute('aria-label', '按' + cur.testHead + '筛选');
    var note = $('#test-note');
    if (note) {
      note.hidden = !cur.testHeadHK;
      note.textContent = cur.testHeadHK ? '香港本轮多数专业不设入学笔试；这一列列的是面试 / 作品集等附加要求' : '';
    }
  }

  // ── 过滤 ──
  function testOK(p) {
    if (testSel === 'ALL') return true;
    if (testSel === 'NONE') return !p.test;
    if (testSel === 'YES') return !!p.test;
    return !!p.test && p.test.indexOf(testSel) !== -1;
  }
  // ── 搜索索引 ──
  // 这份字段清单同时干两件事：拼索引串，以及回答「这行为什么被搜出来」。
  // 关键：索引必须覆盖用户真会打的字。入学笔试（ESAT / 面试）与英语要求（IELTS / 雅思）
  // 原先完全不在索引里——搜「雅思」英港两边都是 0 条，搜香港的「面试」也是 0 条，
  // 而搜索框自己的占位文案还在推荐搜 ESAT。
  function searchFields(p, idx, rc) {
    var reg = REGIONS[rc], s = {};
    reg.schools.forEach(function (x) { if (x.key === p.school) s = x; });
    var e = engFor(idx, rc);
    var out = [];
    function add(label, val) { if (val) out.push([label, String(val)]); }
    add('', s.zh); add('', s.en);                      // 名字由 hi() 高亮，标签留空
    add('', p.zh); add('', p.en);
    add('代码 / 学制', p.degree);
    add('A-Level 要求', p.alevel);
    add('IB 要求', p.ib);
    add('科目要求', p.alevelNote);
    add('备注', p.note);
    add('学科方向', p.dirs.map(function (d) { return reg.dirs[d].zh; }).join('、'));
    // 院校分组：SCHOOLS 上的 group（G5·牛剑 / 王爱曼华 / 港八）是学生真会打的词，
    // 但它只画在分组标签上，不索引就等于搜「牛剑」「G5」返回空
    add('院校分组', s.group);
    if (p.test) add(reg.testIsExam ? '入学笔试' : '面试 / 附加甄选', p.test + ' ' + (TEST_TITLE[p.test] || ''));
    if (e) {
      // 每个值都补上英文缩写前缀：表里只渲染分数（「6.5（各项≥6.0）」），
      // 不补 "IELTS" 的话「ielts 6.5」这类查询永远搜不到。
      // 中文别名同理——表里写 IELTS / TOEFL，学生打的是「雅思 / 托福」。
      add('英语要求', e.tag); add('英语要求', e.band);
      if (e.ielts) { add('英语要求', 'IELTS ' + e.ielts); add('英语要求', '雅思 ' + e.ielts); }
      if (e.toeflOld) { add('英语要求', 'TOEFL ' + e.toeflOld); add('英语要求', '托福 ' + e.toeflOld); }
      if (e.toeflNew) add('英语要求', 'TOEFL 新制 ' + e.toeflNew);
      if (e.gcse) add('英语要求', 'GCSE ' + e.gcse);
      if (e.ibEnglish) add('英语要求', 'IB English ' + e.ibEnglish);
      if (e.gceEnglish) add('英语要求', 'GCE English ' + e.gceEnglish);
      add('英语要求', igcseValue(e, 'efl'));
      add('英语要求', igcseValue(e, 'esl'));
      add('英语要求', e.note);
    }
    return out;
  }
  // 索引串与字段表都预先算好：每敲一个字都重算 238 条会明显卡手
  var qBlob = { uk: [], hk: [] }, qCompact = { uk: [], hk: [] }, qFields = { uk: [], hk: [] };
  function buildSearchBlobs() {
    ['uk', 'hk'].forEach(function (rc) {
      qBlob[rc] = []; qCompact[rc] = []; qFields[rc] = [];
      REGIONS[rc].programs.forEach(function (p, i) {
        var f = searchFields(p, i, rc);
        qFields[rc].push(f);
        var blob = f.map(function (x) { return x[1]; }).join(' ').toLowerCase();
        qBlob[rc].push(blob);
        // 再去掉空白的第二份：表里写「雅思 6.5」，用户常打成「雅思6.5」，只做子串匹配就搜不到
        qCompact[rc].push(blob.replace(/\s+/g, ''));
      });
    });
  }
  function qTokens() { return q ? q.split(/\s+/).filter(Boolean) : []; }
  // 每个词都要命中（AND）。多词查询按整串做子串匹配本来就几乎搜不到东西——
  // 「港大 CS」在索引串里根本不是连在一起的，中间隔着英文校名。
  // 单词级的第二份去空白索引串，兜住「雅思6.5」这种不写空格的输入。
  function blobHit(rc, i, tokens) {
    var blob = qBlob[rc][i], compact = qCompact[rc][i];
    for (var k = 0; k < tokens.length; k++) {
      if (blob.indexOf(tokens[k]) < 0 && compact.indexOf(tokens[k]) < 0) return false;
    }
    return true;
  }
  // 命中说明：名字已经高亮过就不必再解释，其余字段被搜到时在行内点明是哪个字段
  function hitChip(p, idx) {
    if (!q) return '';
    var toks = qTokens();
    if (!toks.length) return '';
    var fields = qFields[curRc()][idx] || [];
    // 这个词命中这个字段了吗（去掉空白的写法也算）
    function hit(v) {
      var t = String(v).toLowerCase(), tc = t.replace(/\s+/g, '');
      return toks.some(function (k) { return t.indexOf(k) >= 0 || tc.indexOf(k) >= 0; });
    }
    // 标签为空的就是校名 / 专业名那几条——名字所在格已经有 hi() 的高亮，不必再解释
    if (fields.some(function (f) { return !f[0] && hit(f[1]); })) return '';
    var why = [];
    fields.forEach(function (f) {
      if (!f[0] || why.indexOf(f[0]) >= 0) return;
      if (hit(f[1])) why.push(f[0]);
    });
    if (!why.length) return '';
    return '<span class="hit">命中：' + esc(why.slice(0, 2).join('；') + (why.length > 2 ? ' 等' : '')) + '</span>';
  }
  // ── 学生成绩 → 哪些能申 ──
  // 站上回答的一直是「要求是多少」，而学生问的是「我这样够不够」。老师也会拿它查
  // 「这个分数能申哪儿」，所以叫「学生成绩」而不是「我的成绩」。
  // 判定只在这台机器上算：不联网、不外传，也刻意不写进 URL——分享链接里不该带着别人的成绩。
  var gAl = '', gIb = '';                                 // 学业成绩
  var gIelts = '', gL = '', gR = '', gW = '', gS = '';    // 雅思：总分 + 听 / 读 / 写 / 说
  var gToefl = '', gToeflScale = 'old';                   // 托福：总分 + 制式
  var onlyReach = false;                                  // 只看达得到的（滤掉「低于要求」）
  var MY_STORE = 'ukapply.grades.v2';

  // 取值：只认落在合理范围内的数字，越界一律当没填
  //（否则把入学年份之类的数字敲进来会被当成分数）
  function numOf(s, lo, hi) {
    var m = String(s == null ? '' : s).match(/(\d+(?:\.\d+)?)/);
    if (!m) return null;
    var v = +m[1];
    return (v >= lo && v <= hi) ? v : null;
  }
  function myAlGrades() { return parseGrades(String(gAl).replace(/[^A-E*\d\s+]/gi, ' ')); }
  function myIbTotal() { return numOf(gIb, 20, 45); }
  function ieltsOverall() { return numOf(gIelts, 4, 9); }
  // 雅思单项：听 / 读 / 写 / 说，填了几项就比几项
  function ieltsParts() {
    return [['听力', gL], ['阅读', gR], ['写作', gW], ['口语', gS]]
      .map(function (x) { return { k: x[0], v: numOf(x[1], 4, 9) }; })
      .filter(function (x) { return x.v != null; });
  }
  function toeflTotal() {
    return gToeflScale === 'old' ? numOf(gToefl, 20, 120) : numOf(gToefl, 1, 6);
  }
  // 学业成绩按「A-Level 优先、IB 回落」判：两项都填时，
  // 遇到只给 IB 分数、A-Level 只写门槛的专业，就自动改用 IB
  function gradeTracks() {
    var t = [];
    if (myAlGrades().length) t.push('alevel');
    if (myIbTotal() != null) t.push('ib');
    return t;
  }
  function hasGrades() { return gradeTracks().length > 0; }
  function primaryTrack() { var t = gradeTracks(); return t.length ? t[0] : null; }
  function hasEnglish() {
    return ieltsOverall() != null || ieltsParts().length > 0 || toeflTotal() != null;
  }
  function hasProfile() { return hasGrades() || hasEnglish(); }
  // 成绩的简写，用在按钮、打印行与悬停说明里
  function gradeBrief() {
    var bits = [];
    if (myAlGrades().length) bits.push('A-Level ' + String(gAl).trim());
    if (myIbTotal() != null) bits.push('IB ' + myIbTotal());
    if (ieltsOverall() != null) bits.push('雅思 ' + ieltsOverall().toFixed(1));
    var tp = ieltsParts();
    if (tp.length) bits.push('单项最低 ' + Math.min.apply(null, tp.map(function (x) { return x.v; })).toFixed(1));
    if (toeflTotal() != null) bits.push('托福 ' + toeflTotal() + (gToeflScale === 'old' ? '' : '（新制）'));
    return bits.join(' · ');
  }
  // 单条赛道的判定。A-Level 用「你最好的 N 门」对要求的 N 门求和比较（N = 要求门数）：
  // 用求和而不是平均——考四门拿到 A*AAA 的人应当按最好的三门算，不该被第四门拉低。
  function verdictByTrack(p, track) {
    if (track === 'alevel') {
      var mine0 = myAlGrades();
      if (!mine0.length) return null;
      var req = gradeProfile(p.alevel);
      if (!req.length) {
        // 只写了门数的要求（如港科「≥3 AL」）：够门数算达到门槛
        var need0 = gradeCountReq(p.alevel);
        if (need0 == null) return null;
        var en = mine0.length;
        return { kind: en >= need0 ? 'meet' : 'under', by: 'count', count: need0, have: en };
      }
      // 只填了一两个等级时，其余按 A 补足——用户习惯只填区分度最高的那几门，
      // 填「A*」的意思就是「另外两门是 A」。补足后是完整比对，不再有「部分比对」这回事；
      // 但补过这件事要说清楚，所以留下 padded 标记。
      var mine = mine0.slice(0, req.length);
      while (mine.length < req.length) mine.push(GRADE_VAL.A);
      var gap = gradeSum(mine) - gradeSum(req);
      return {
        kind: gap > 0 ? 'over' : gap === 0 ? 'meet' : 'under',
        by: 'alevel', gap: gap,
        padded: mine0.length < req.length, have: mine0.length, need: req.length
      };
    }
    var reqIb = ibScore(p.ib), v = myIbTotal();
    if (reqIb == null || v == null) return null;
    var g = v - reqIb;
    return { kind: g > 0 ? 'over' : g === 0 ? 'meet' : 'under', by: 'ib', gap: g };
  }
  function verdictFor(p) {
    var tracks = gradeTracks();
    for (var i = 0; i < tracks.length; i++) {
      var v = verdictByTrack(p, tracks[i]);
      if (v) return v;
    }
    return null;
  }
  // 「门槛」是大学通用最低要求，不是该专业的录取条件，措辞必须分开
  function barWord(p) { return p.offer === 'ger' ? '门槛' : '要求'; }
  // 分数达标 ≠ 条件满足。这些专业另有科目要求 / 入学笔试 / 面试 / 作品集，
  // 成绩档对得上也不代表能申——「高于要求」必须带上这句，否则最容易被读成「我稳了」。
  function extraReqs(p) {
    var out = [];
    if (p.alevelNote) out.push('科目要求：' + p.alevelNote);
    if (p.test) out.push((cur.testIsExam ? '入学笔试：' : '附加要求：') + p.test);
    if (p.note) out.push('备注：' + p.note);
    return out;
  }
  // 触发条件：只要不是「明说没有要求」或「整句只是建议」，就算另有要求。
  //   · 早先只用一张硬性措辞表（必修 / 仅限 / 必须…），漏掉了一大批真要求——
  //     爱丁堡的「数学 B + 化学 B」、曼大的「数学 / 物理 / 化学 中须有两门」都不含那些词。
  //   · 反过来，通篇只是「建议 / 偏好」的（如「建议修地理」）是建议不是要求，不标。
  //   · 「无特定科目要求」明说了没有，也不标。
  // 这两条否定判断都必须按分句来，整串匹配两种错都会犯：
  //   「…；GCSE：无特定科目要求」整串能匹配上，前一句「必修 English Literature 且达 A」就被一起放过；
  //   「无必修科目；偏好…」整串也能匹配上「必修」，一句「没有必修」反被当成必修要求标出来。
  // 这些标记的价值不在「稀有」，而在点开就能看到具体要哪几门、要到什么等级。
  var ADVICE_RE = /建议|推荐|鼓励|偏好|倾向/;
  var ADVICE_START_RE = /^(建议|强烈建议|推荐|鼓励|偏好|倾向)/;
  var HARD_RE = /必修|必须|仅限|须|指定|至少|不接受/;
  var NO_REQ_RE = /无必修|无特定科目|无科目要求|无任何科目要求|非必须|^不限$|^无$/;
  // 判断前先摘掉「没有要求」的说法本身，否则「无必修科目」里的「必修」会被 HARD_RE 当成要求
  var NO_REQ_STRIP_RE = /无必修|无特定科目|无科目要求|无任何科目要求|非必须/g;
  var GCSE_CLAUSE_RE = /^(GCSE|IGCSE|iGCSE)\b/;
  // 返回要求的种类，空串表示没有：
  //   'exam'    —— 要单独报名 / 准备的：入学笔试、面试、作品集
  //   'subject' —— 只是科目要求（哪几门必修、每门要到什么等级）
  // 分成两种是因为「科目要求」在英国几乎条条都有（77%），单靠它做记号没有区分度；
  // 「要另考一门」才是真正需要提前安排的，所以徽章上给两种不同的样式。
  function extraKind(p) {
    if (p.test) return 'exam';
    var n = String(p.alevelNote || '').trim();
    if (!n) return '';
    // 逗号也当分句：中文里「无必修科目，偏好至少一门社科科目」正是用逗号把
    // 「没有要求」和「建议」接在一起，不切开的话「偏好…至少…」会被当成硬要求
    var clauses = n.split(/[；;。，,]/);
    for (var i = 0; i < clauses.length; i++) {
      var c = clauses[i].trim();
      if (!c) continue;
      var s = c.replace(NO_REQ_STRIP_RE, '');
      // 句首就是「建议 / 偏好」的一定是建议；句中带建议词、又没有硬措辞的也算建议。
      // 反过来「至少两门 UCL 优先科目，建议数学/物理」不该被后半句的「建议」救成建议句——
      // 它句首没有建议词，且句中有「至少」，所以仍算要求。
      if (ADVICE_START_RE.test(s)) continue;
      if (ADVICE_RE.test(s) && !HARD_RE.test(s)) continue;
      if (NO_REQ_RE.test(c) && !HARD_RE.test(s)) continue;   // 明说没有要求（如「无必修科目」）
      // 只提 GCSE 英语的分句跳过：英语要求有自己的面板（含 IGCSE-ESL、口语等），
      // 而记号挂在 A-Level / IB 的判定徽章上。但 GCSE 数学这类门槛是实打实的附加条件
      //（「GCSE 数学 7/A + 英语 6/B」——不少学生就卡在这一条），要留。
      if (GCSE_CLAUSE_RE.test(c) && !/数学|Math/.test(c)) continue;
      return 'subject';
    }
    return '';
  }
  function hasExtraReqs(p) { return !!extraKind(p); }
  var VERDICT_ZH = { over: '高于', meet: '达到', under: '低于' };
  function verdictBadge(p) {
    var v = verdictFor(p);
    if (!v) return '';
    var label = VERDICT_ZH[v.kind] + barWord(p);
    var mine = v.by === 'alevel' ? 'A-Level ' + String(gAl).trim() : 'IB ' + myIbTotal();
    var req = v.by === 'alevel' ? 'A-Level ' + p.alevel : 'IB ' + p.ib;
    var extra = extraReqs(p), kind = extraKind(p), marked = !!kind;
    var tip = '按你输入的 ' + mine + ' 对照 ' + req + '：' + label + '。' +
      (v.padded ? '你只填了 ' + v.have + ' 门，该专业要求 ' + v.need +
        ' 门，未填的 ' + (v.need - v.have) + ' 门按 A 计。' : '') +
      (v.by === 'count' ? '该专业只公布了需要的科目门数（' + v.count + ' 门），没有公布具体等级，所以只比门数。' : '') +
      (marked ? '另外，这个专业还有下面这些要求，成绩对上了也要逐条确认：' + extra.join('；') + '。' : '') +
      (OFFER_TITLE[p.offer] || '') + '—— 只对照公布口径，不是录取概率。';
    return '<span class="verdict ' + v.kind + (v.padded ? ' partial' : '') + '" title="' + esc(tip) + '">' +
      esc(label) + (v.padded ? '<span class="pv">按A补</span>' : '') +
      (marked ? '<span class="pvx' + (kind === 'exam' ? ' exam' : '') + '" title="' + esc('该专业另有要求：' + extra.join('；')) + '">' + (kind === 'exam' ? '考' : '+') + '</span>' : '') +
      '</span>';
  }
  function myCounts() {
    var c = { over: 0, meet: 0, under: 0, na: 0, partial: 0 };
    var toks = qTokens();
    cur.programs.forEach(function (p, i) {
      if (!matches(p, i, toks)) return;
      var v = verdictFor(p);
      if (!v) { c.na++; return; }
      c[v.kind]++;
      if (v.padded) c.partial++;
    });
    return c;
  }
  // 主页面不再摆输入框，但状态要看得见：按钮上直接写清「填了什么、结果如何」
  function updateMyChrome() {
    var g = hasGrades(), en = hasEnglish();
    // 摘要、按钮、警示三处都要用，各算一遍等于把 238 条判定跑三遍
    var gc = g ? myCounts() : null;
    var ec = en ? engCounts() : null;
    var btn = $('#grade-open'), brief = $('#grade-brief');
    if (btn) btn.classList.toggle('filled', hasProfile());
    if (brief) {
      if (!hasProfile()) brief.textContent = '填入后看哪些能申';
      else {
        var bits = [];
        if (g) {
          var c = gc, n = c.over + c.meet + c.under;
          if (n) bits.push('够得着 ' + (c.over + c.meet) + '/' + n);
        }
        if (en) {
          var e2 = ec, m = e2.ok + e2.under;
          if (m) bits.push('英语达标 ' + e2.ok + '/' + m);
        }
        brief.textContent = gradeBrief() + (bits.length ? '｜' + bits.join(' · ') : '');
      }
    }
    var only = $('#only-reach');
    if (only) {
      only.disabled = !hasProfile();            // 学业或英语任一填了就能用
      var box = only.closest('.onlyreach');
      if (box) box.classList.toggle('off', !g);
      if (!g && only.checked) { only.checked = false; onlyReach = false; }
    }
    // 面板里的实时小结：在面板里改一个数字，立刻能看到判定怎么变
    var gb = $('#gb-sum');
    if (gb) {
      var parts = [];
      if (g) {
        var c3 = gc, n3 = c3.over + c3.meet + c3.under;
        parts.push('分数：可比对 ' + n3 + ' 项 · 够得着 ' + (c3.over + c3.meet) +
          '（高于 ' + c3.over + ' · 达到 ' + c3.meet + '）· 够不着 ' + c3.under +
          (c3.na ? ' · 无分数可比 ' + c3.na : ''));
      }
      if (en) {
        var e3 = ec;
        parts.push('英语：可比对 ' + (e3.ok + e3.under) + ' 项 · 达标 ' + e3.ok +
          (e3.under ? ' · 不够 ' + e3.under : '') +
          (e3.none ? ' · 未列 IELTS / TOEFL ' + e3.none : ''));
      }
      gb.textContent = parts.join('；');
    }
    // 判定那三个词各是什么意思，就在色块旁边写一遍（悬停说明手机上等于不存在）
    var vl = $('#vlegend');
    if (vl) {
      vl.hidden = !g;
      if (!g) vl.innerHTML = '';
      else {
        // 「+」的解释只在这批结果里确实有带标记的行时才出现，否则是噪音
        var toks2 = qTokens(), hasSub = false, hasExam = false;
        for (var k = 0; k < cur.programs.length; k++) {
          if (!matches(cur.programs[k], k, toks2)) continue;
          var kk = extraKind(cur.programs[k]);
          if (kk === 'exam') hasExam = true; else if (kk === 'subject') hasSub = true;
          if (hasExam && hasSub) break;
        }
        vl.innerHTML = '<span class="vl-k">判定怎么读</span>' +
          '<span class="vl-i"><b class="verdict over">高于要求</b>你的成绩超出该校公布的分数口径</span>' +
          '<span class="vl-i"><b class="verdict meet">达到要求</b>正好持平；热门专业实收常更高</span>' +
          '<span class="vl-i"><b class="verdict under">低于要求</b>还差一些</span>' +
          (hasSub ? '<span class="vl-i"><b class="verdict meet">达到要求<i class="pvx">+</i></b>' +
            '该专业另有科目要求（哪几门必修、每门要到什么等级），成绩对上了也要逐条核</span>' : '') +
          (hasExam ? '<span class="vl-i"><b class="verdict meet">达到要求<i class="pvx exam">考</i></b>' +
            '还要单独报名或准备笔试 / 面试 / 作品集，别只对着分数看</span>' : '');
      }
    }
    // 面板里的口径提醒（主页面另有一行可见的同款说明）
    var gw = $('#gb-warn');
    if (gw) {
      gw.textContent = hasProfile()
        ? '判定只对照各校公布的分数口径，不等于录取概率：热门专业实际录取普遍高于公布数字，「达到 / 高于」也应当冲刺看。'
        : '';
    }
    var warn = $('#my-warn');
    if (warn) {
      warn.hidden = !hasProfile();
      if (!hasProfile()) warn.textContent = '';
      else {
        var bits2 = [];
        if (g) {
          var c4 = gc;
          if (c4 && c4.partial) {
            bits2.push('你只填了 ' + myAlGrades().length + ' 门 A-Level，有 ' + c4.partial +
              ' 个专业要求更多门——它们带「按A补」标记，未填的科目按 A 计。');
          }
        }
        bits2.push('判定只对照各校公布的分数口径，不等于录取概率：热门专业实际录取普遍高于公布数字，「达到 / 高于」也应当冲刺看。');
        bits2.push('另外，判定只比成绩档——科目要求、入学笔试、面试 / 作品集等附加条件写在各行自己的列里，成绩对上了也要逐条核。');
        warn.textContent = bits2.join(' ');
      }
    }
  }

  // ── 英语成绩的判定 ──
  // 表里的写法有「7.0（各项6.5）」「6.5（各项≥5.5）」「7.5（各项不低于 7.0）」，
  // 也有「6.5（同一次考试、两年内）」这种纯说明；只有跟着
  // 各项 / 单项 / 不低于 / 其余 的数字才是单项线，别把说明里的数字当成要求。
  var _irCache = {};
  function ieltsReqOf(e) {
    if (!e || !e.ielts) return null;
    var ck = String(e.ielts);
    if (ck in _irCache) return _irCache[ck];
    return (_irCache[ck] = _parseIeltsReq(ck));
  }
  function _parseIeltsReq(t) {
    var om = t.match(/(\d+(?:\.\d+)?)/);
    if (!om) return null;
    var out = { over: +om[1], band: null, writing: null, raw: t };
    var par = (t.match(/（([^）]*)）/) || [])[1] || '';
    if (!par) return out;
    var w = par.match(/写作[^0-9]{0,4}(\d+(?:\.\d+)?)/);
    if (w) out.writing = +w[1];
    var g = par.match(/(?:其余|各项|单项|不低于)[^0-9]{0,4}(\d+(?:\.\d+)?)/);
    if (g) out.band = +g[1];
    return out;
  }
  var _trCache = {};
  function toeflReqOf(e) {
    if (!e) return null;
    var ck = String(e.toeflOld || '') + '|' + String(e.toeflNew || '');
    if (ck in _trCache) return _trCache[ck];
    return (_trCache[ck] = _parseToeflReq(e));
  }
  function _parseToeflReq(e) {
    function lead(v) {                            // 「未列」之类取不到数，返回 null
      var m = String(v == null ? '' : v).match(/^\s*(\d+(?:\.\d+)?)/);
      return m ? +m[1] : null;
    }
    var o = lead(e.toeflOld), n = lead(e.toeflNew);
    if (o == null && n == null) return null;
    return { old: o, 'new': n, raw: e.toeflOld || e.toeflNew };
  }
  // 雅思：总分先要够；填了单项就逐项对「各项不低于 X」；官网另写写作线的，写作单独对
  function ieltsVerdictOf(e) {
    var req = ieltsReqOf(e);
    if (!req) return null;
    var o = ieltsOverall(), parts = ieltsParts();
    if (o == null && !parts.length) return null;
    var lowOver = (o != null && o < req.over);
    // 小分：逐项对「各项不低于 X」，写作另有专项线时也算进小分。
    // 只说「小分不够」，不点名某一门——多门不够时点名一门是以偏概全；
    // 到底是哪几门写在悬停说明里，既不占芯片宽度也不丢信息。
    var lowNames = [];
    if (req.band != null) {
      parts.forEach(function (x) { if (x.v < req.band) lowNames.push(x.k); });
    }
    if (req.writing != null) {
      var w = parts.filter(function (x) { return x.k === '写作'; })[0];
      if (w && w.v < req.writing && lowNames.indexOf('写作') < 0) lowNames.push('写作');
    }
    if (lowOver && lowNames.length) return { kind: 'under', why: '雅思总分与小分', low: lowNames };
    if (lowOver) return { kind: 'under', why: '雅思总分' };
    if (lowNames.length) return { kind: 'under', why: '雅思小分', low: lowNames };
    return { kind: 'ok' };
  }
  function toeflVerdictOf(e) {
    var req = toeflReqOf(e), t = toeflTotal();
    if (!req || t == null) return null;
    var line = gToeflScale === 'old' ? req.old : req['new'];
    if (line == null) return null;                // 该校没给这个制式的线，就不硬比
    return { kind: t < line ? 'under' : 'ok', why: '托福' };
  }
  // 各校基本是雅思 / 托福二选一，所以「任一达标即算达标」；
  // 两个都填就都算一遍，全不达标时才报最接近的那条的原因。
  function engVerdict(e) {
    var tries = [];
    var i1 = ieltsVerdictOf(e); if (i1) tries.push(i1);
    var t1 = toeflVerdictOf(e); if (t1) tries.push(t1);
    if (!tries.length) return null;
    for (var i = 0; i < tries.length; i++) if (tries[i].kind === 'ok') return { kind: 'ok' };
    return tries[0];
  }
  function engChip(e) {
    var v = engVerdict(e);
    if (!v) return '';
    var label = v.kind === 'ok' ? '英语达标' : v.why + '不够';
    var tip = '按你填的 ' + gradeBrief() + ' 对照 ' + (e.ielts || e.toeflOld || '—') + '：' + label +
      (v.low && v.low.length ? '（不够的是：' + v.low.join('、') + '）' : '') +
      '。雅思 / 托福任一达标即算达标；只填总分时只比总分。';
    return '<span class="everdict ' + v.kind + '" title="' + esc(tip) + '">' + esc(label) + '</span>';
  }
  function engCounts() {
    var c = { ok: 0, under: 0, none: 0 };
    var rc = curRc(), toks = qTokens();
    cur.programs.forEach(function (p, i) {
      if (!matches(p, i, toks)) return;
      var v = engVerdict(engFor(i, rc));
      if (!v) c.none++; else c[v.kind]++;
    });
    return c;
  }

  function loadGrades() {
    try {
      var raw = JSON.parse(localStorage.getItem(MY_STORE) || 'null');
      if (raw && typeof raw === 'object') {
        gAl = String(raw.al || '').slice(0, 24);
        gIb = String(raw.ib || '').slice(0, 6);
        gIelts = String(raw.ie || '').slice(0, 6);
        gL = String(raw.l || '').slice(0, 6);
        gR = String(raw.r || '').slice(0, 6);
        gW = String(raw.w || '').slice(0, 6);
        gS = String(raw.s || '').slice(0, 6);
        gToefl = String(raw.tf || '').slice(0, 6);
        gToeflScale = raw.tfs === 'new' ? 'new' : 'old';
        onlyReach = !!raw.only;
      }
    } catch (e) { /* 隐私模式忽略 */ }
  }
  function saveGrades() {
    try {
      localStorage.setItem(MY_STORE, JSON.stringify({
        al: gAl, ib: gIb, ie: gIelts, l: gL, r: gR, w: gW, s: gS,
        tf: gToefl, tfs: gToeflScale, only: onlyReach
      }));
    } catch (e) {}
  }

  // ── 最近搜索 ──
  // 存最近 5 条，只在搜索框空着且正在用时显示——平时不占首屏高度。
  // 记的是用户敲进去的原样（大小写保留），不是匹配用的那份小写。
  var HIST_STORE = 'ukapply.searches.v1', HIST_MAX = 5;
  var HISTORY = [];
  function loadHistory() {
    try {
      var raw = JSON.parse(localStorage.getItem(HIST_STORE) || '[]');
      if (Array.isArray(raw)) {
        HISTORY = raw.filter(function (x) { return typeof x === 'string' && x.trim(); }).slice(0, HIST_MAX);
      }
    } catch (e) { HISTORY = []; }
  }
  function saveHistory() {
    try { localStorage.setItem(HIST_STORE, JSON.stringify(HISTORY)); } catch (e) {}
  }
  function pushHistory(term) {
    term = String(term || '').trim();
    if (term.length < 2) return;
    var i = HISTORY.indexOf(term);
    if (i === 0) return;                       // 已经是最新一条，不重排
    if (i > 0) HISTORY.splice(i, 1);
    HISTORY.unshift(term);
    HISTORY = HISTORY.slice(0, HIST_MAX);
    saveHistory(); renderHistory();
  }
  function renderHistory() {
    var host = $('#hist'), input = $('#q');
    if (!host || !input) return;
    var show = HISTORY.length > 0 && document.activeElement === input && !input.value.trim() && !q;
    host.hidden = !show;
    if (!show) { host.innerHTML = ''; return; }
    host.innerHTML = '<span class="hist-k">最近搜索</span>' +
      HISTORY.map(function (t) {
        return '<button type="button" class="hist-b" data-hist="' + esc(t) + '">' + esc(t) + '</button>';
      }).join('') +
      '<button type="button" class="hist-x" data-hist-clear="1">清除</button>';
  }

  // 除「只看达得到」之外的全部筛选——摘要要能回答「我正看的这批里能上几个」
  // 「只看达得到」：学业成绩与英语成绩**都要**达标才算够得着。
  // 原先只看学业——填了雅思却筛不掉英语不够的专业，等于白填。
  // 两者都没填时不参与过滤（这时开关本身也是禁用的）。
  function reachOK(p, i) {
    if (hasGrades()) {
      var v = verdictFor(p);
      if (!v || v.kind === 'under') return false;
    }
    if (hasEnglish()) {
      var e = engVerdict(engFor(i, curRc()));
      if (!e || e.kind === 'under') return false;
    }
    return true;
  }
  function matches(p, i, toks) {
    if (activeSchools.length && activeSchools.indexOf(p.school) === -1) return false;
    if (activeDirs.length && !p.dirs.some(function (d) { return activeDirs.indexOf(d) !== -1; })) return false;
    if (!testOK(p)) return false;
    if (q) {
      if (!toks) toks = qTokens();
      if (!blobHit(curRc(), i, toks)) return false;
    }
    return true;
  }
  // 空结果时逐条给出「放宽哪一项还剩几项」——是能直接点的解法，比一句「请放宽条件」管用
  // o 里写了哪个键就表示「这一项不参与过滤」，用来试算放宽后的数量
  function countWithout(o) {
    o = o || {};
    var toks = qTokens();
    return cur.programs.filter(function (p, i) {
      if (!o.school && activeSchools.length && activeSchools.indexOf(p.school) === -1) return false;
      if (!o.dir && activeDirs.length && !p.dirs.some(function (d) { return activeDirs.indexOf(d) !== -1; })) return false;
      if (!o.test && !testOK(p)) return false;
      if (!o.q && q && !blobHit(curRc(), i, toks)) return false;
      if (!o.only && onlyReach && !reachOK(p, i)) return false;
      return true;
    }).length;
  }
  var RELAX = [
    { k: 'q', on: function () { return !!q; },
      label: function () { return '清除搜索「' + q + '」'; },
      fn: function () { q = ''; } },
    { k: 'school', on: function () { return activeSchools.length > 0; },
      label: function () { return '不限大学（当前限了 ' + activeSchools.length + ' 所）'; },
      fn: function () { activeSchools = []; } },
    { k: 'dir', on: function () { return activeDirs.length > 0; },
      label: function () { return '不限学科方向（当前限了 ' + activeDirs.length + ' 个）'; },
      fn: function () { activeDirs = []; } },
    { k: 'test', on: function () { return testSel !== 'ALL'; },
      label: function () { return '不限' + cur.testHead; },
      fn: function () { testSel = 'ALL'; } },
    { k: 'only', on: function () { return onlyReach; },
      label: function () { return '取消「只看达得到」'; },
      fn: function () { onlyReach = false; } }
  ];
  function renderEmptyHelp() {
    var host = $('#empty-help'); if (!host) return;
    var active = RELAX.filter(function (r) { return r.on(); });
    if (!active.length) { host.innerHTML = ''; return; }
    host.innerHTML = '<p class="eh-k">放宽任意一条就能看到结果：</p><div class="eh-list">' +
      active.map(function (r) {
        var o = {}; o[r.k] = 1;
        var n = countWithout(o);
        return '<button type="button" class="eh-b" data-relax="' + r.k + '"' + (n ? '' : ' disabled') + '>' +
          esc(r.label()) + '<span class="eh-n">' + (n ? n + ' 项' : '仍无结果') + '</span></button>';
      }).join('') + '</div>';
  }
  $('#empty-help').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-relax]'); if (!b) return;
    var r = RELAX.filter(function (x) { return x.k === b.dataset.relax; })[0];
    if (!r) return;
    r.fn(); saveGrades(); syncControlsChrome(); renderChips(); apply();
  });
  function filtered() {
    var toks = qTokens();
    return cur.programs.filter(function (p, i) {
      if (!matches(p, i, toks)) return false;
      if (onlyReach && !reachOK(p, i)) return false;
      return true;
    });
  }

  // ── 分组维度 ──
  // 除「按大学 / 按学科方向」外再加三种：按 QS 名次段、按成绩难度段、按是否需要笔试 / 面试。
  // 这三种都是把同一个问题铺开看——排名大概在哪一档、分数要求大概多难、要不要单独报名考试。
  var GROUP_ZH = { school: '按大学', dir: '按学科方向', qs: '按 QS 名次段',
                   grade: '按成绩难度段', test: '按是否需要笔试 / 面试' };
  var GROUP_MODES = ['school', 'dir', 'qs', 'grade', 'test'];
  var QS_SEGS = [
    { k: 'q1', zh: 'QS 前 10', color: '#1c6248' },
    { k: 'q2', zh: 'QS 11–50', color: '#1e4a80' },
    { k: 'q3', zh: 'QS 51–100', color: '#6b4e10' },
    { k: 'q4', zh: 'QS 101–200', color: '#5b6577' },
    { k: 'q0', zh: '未进前 200 / 无对应学科榜', color: '#9aa3b8' }
  ];
  // 难度段按 A-Level 折算分切：A*A*A=3.67、A*AA=3.33、AAA=3.00
  var GRADE_SEGS = [
    { k: 'g1', zh: 'A*A*A 及以上', color: '#7c0f28' },
    { k: 'g2', zh: 'A*AA', color: '#a61c5b' },
    { k: 'g3', zh: 'AAA', color: '#1e4a80' },
    { k: 'g4', zh: 'AAB 及以下', color: '#4b5563' },
    { k: 'g0', zh: '无分数档（只公布门槛）', color: '#9aa3b8' }
  ];
  function groupKeys() {
    if (groupBy === 'school') return cur.schools.map(function (x) { return x.key; });
    if (groupBy === 'dir') return Object.keys(cur.dirs);
    if (groupBy === 'qs') return QS_SEGS.map(function (x) { return x.k; });
    if (groupBy === 'grade') return GRADE_SEGS.map(function (x) { return x.k; });
    if (groupBy === 'test') {
      // 笔试卷的取值各板块不同，从数据现取，写死会漂
      var seen = {};
      cur.programs.forEach(function (p) { seen[p.test || ''] = 1; });
      var ks = Object.keys(seen).filter(Boolean).sort();
      ks.push('');                       // 「无需」排最后
      return ks.map(function (t) { return 't:' + t; });
    }
    return cur.schools.map(function (x) { return x.key; });
  }
  function groupOf(p) {
    if (groupBy === 'school') return [p.school];
    if (groupBy === 'dir') return p.dirs;
    if (groupBy === 'qs') {
      var l = qsListFor(p);
      if (!l.length) return ['q0'];
      var r = rankNum(l[0].rank);
      return [r <= 10 ? 'q1' : r <= 50 ? 'q2' : r <= 100 ? 'q3' : 'q4'];
    }
    if (groupBy === 'grade') {
      var g = gradeScore(p.alevel);
      if (g == null) return ['g0'];
      return [g >= 3.67 ? 'g1' : g >= 3.33 ? 'g2' : g >= 3 ? 'g3' : 'g4'];
    }
    if (groupBy === 'test') return ['t:' + (p.test || '')];
    return [p.school];
  }
  function groupMeta(k) {
    if (groupBy === 'school') return schoolByKey[k];
    if (groupBy === 'dir') return cur.dirs[k];
    if (groupBy === 'qs') return QS_SEGS.filter(function (x) { return x.k === k; })[0] || { zh: k };
    if (groupBy === 'grade') return GRADE_SEGS.filter(function (x) { return x.k === k; })[0] || { zh: k };
    if (groupBy === 'test') {
      var t = k.slice(2);
      if (!t) return { zh: cur.testIsExam ? '无需入学笔试' : '无附加要求', color: '#9aa3b8' };
      return { zh: (cur.testIsExam ? '需 ' : '需') + t, color: '#1e4a80' };
    }
    return { zh: k };
  }

  // ── 通用小件 ──
  function offerBadge(p) {
    return '<span class="badge offer" title="' + esc(OFFER_TITLE[p.offer] || '') + '">' + esc(OFFER_ZH[p.offer] || p.offer) + '</span>';
  }
  function testBadge(p) {
    if (!cur.testIsExam) {
      return p.test ? '<span class="badge test">需' + esc(p.test) + '</span>' : '<span class="badge test no">—</span>';
    }
    return p.test ? '<span class="badge test">需考 ' + esc(p.test) + '</span>' : '<span class="badge test no">无笔试</span>';
  }
  function cmpButton(key) {
    var on = compare.has(key);
    return '<button type="button" class="cmp' + (on ? ' on' : '') + '" data-key="' + key + '" aria-pressed="' + on + '"' +
      ' title="加入/移出对比">' + (on ? '已加入对比' : '加入对比') + '</button>';
  }
  // 本校同方向（以首个方向为准）的专业数量——数据是静态的，构建一次即可
  var sibCount = {};
  function buildSibCount() {
    sibCount = {};
    ['uk', 'hk'].forEach(function (rc) {
      REGIONS[rc].programs.forEach(function (p) {
        var k = rc + '|' + p.school + '|' + p.dirs[0];
        sibCount[k] = (sibCount[k] || 0) + 1;
      });
    });
  }
  function cmpSibButton(rc, p, key) {
    var n = sibCount[rc + '|' + p.school + '|' + p.dirs[0]] || 0;
    if (n <= 1) return '';   // 本校该方向只有它自己，不显示
    return '<button type="button" class="cmp-sib" data-key="' + key + '"' +
      ' title="把本校同学科方向的 ' + n + ' 个专业全部加入对比（含本行）">同方向 ' + n + ' 项</button>';
  }

  // ── QS 2026 学科排名标签 ──
  function rankNum(r) { var m = String(r).replace('=', '').match(/\d+/); return m ? +m[0] : 9999; }
  // ══ 专业名 → QS 学科家族 ══
  // 方向（dir）是粗桶：bio 里同时装着医学/药学/护理/化学/生物，
  // 直接取「桶内最佳名次」会把「化学」显示成「医学 #2」、把「航空工程」显示成「化学工程 #4」。
  // 这里按专业名收敛到它自己的学科家族，只保留真正相关的榜；越具体的规则排越前。
  var ENG4 = ['mechanical-aeronautical-manufacturing-engineering', 'electrical-electronic-engineering',
    'civil-structural-engineering', 'chemical-engineering'];
  var ARTS5 = ['english-language-literature', 'modern-languages', 'linguistics', 'history', 'philosophy'];
  var SOC6 = ['sociology', 'social-policy-administration', 'psychology', 'geography', 'anthropology', 'politics'];
  var SCI4 = ['chemistry', 'biological-sciences', 'physics-astronomy', 'mathematics'];
  var QS_NAME_RULES = [
    // 师资培训学位（教育学士 / BEd）先判定：它本身就是「教育与培训」类专业，
    // 但课程名常带着所教科目的前半截（如「…理学士及数学教育学士（双学位）」「AI and Educational
    // Technology & BEd」），若不先判定会被 AI / 会计金融 / 环境 / 传媒等学科规则截走，
    // 结果挂到本校并不一定上榜的学科上、反而显示「—」。两个板块共 8 条命中，全部在香港教育大学。
    [/教育学士|Bachelor of Education|BEd\b/, ['education-training']],
    // 宽口径大类（本身横跨多个学科）：必须最先判定。
    // 带括号的细分不算大类（如「社会科学学士（心理学）」按心理走），故用 (?![（(]) 排除
    [/理学大类|理学院[\s（]|science \(group|bachelor of science\s*$|应用生物\/计算机|自然科学|natural science/i, SCI4],
    [/文学士（文学院）|文学院统一/i, ARTS5],
    [/社会科学学士(?![（(])|社会科学学院统一/i, SOC6],
    // 工程必须排在生物／医学之前，否则「生物医学工程」「化学工程与生物技术」会被判成医学
    [/人工智能|artificial intelligence|AI/i, ['data-science-artificial-intelligence', 'computer-science-information-systems']],
    [/数据科学|data science/i, ['data-science-artificial-intelligence', 'computer-science-information-systems']],
    [/计算机|计算|computing|computer|软件|网络安全|cybersecurity|资讯|information/i, ['computer-science-information-systems']],
    [/化学工程|chemical engineering/i, ['chemical-engineering']],
    [/土木|结构工程|civil/i, ['civil-structural-engineering']],
    [/电子|电气|电机|electronic|electrical/i, ['electrical-electronic-engineering']],
    [/机械|航空|航天|制造|机器人|mechanical|aeronautical|aerospace|manufacturing|设计工程|design engineering/i,
      ['mechanical-aeronautical-manufacturing-engineering']],
    [/生物医学工程|biomedical engineering/i, ['mechanical-aeronautical-manufacturing-engineering', 'electrical-electronic-engineering']],
    // 计算机与数据（排在通用「工程」之前，「计算机工程」才不会被当成通用工程）
    [/工程|engineering/i, ENG4],
    // 医学与健康
    [/生物医学|biomedical|医学生物|medical bioscience/i, ['biological-sciences']],
    [/物理|physics/i, ['physics-astronomy']],
        [/内外全科|医学士|MBBS|MBChB|medicine|医学/i, ['medicine']],
    [/牙医|dental|BDS/i, ['dentistry']],
    [/护理|nursing|BNurs/i, ['nursing']],
    [/药剂|药学|药理|中药|中医|pharmacy|pharmacolog/i, ['pharmacy-pharmacology']],
    [/物理治疗|放射|医疗化验|言语病理|言语治疗|复康|physiotherap|radiograph|medical laboratory|speech pathology|speech therapy|rehabilit/i, ['nursing']],
    // 理学生命
    [/生物化学|biochemistry/i, ['biological-sciences', 'chemistry']],
    [/生物科技|生物技术|biotechnology/i, ['biological-sciences', 'chemistry']],
    [/环境|environmental/i, ['environmental-sciences']],
    [/生物|biology|biological/i, ['biological-sciences']],
    [/化学|chemistry/i, ['chemistry']],
    [/精算|actuarial|统计|statistic|运筹|风险|量化|quantitative/i, ['statistics-operational-research', 'mathematics']],
    [/数学|mathematics|maths/i, ['mathematics', 'statistics-operational-research']],
    // 经管（公共事务／社会政策要排在「管理」之前，否则「公共事务与管理」会被当成商科）
    [/社会政策|社会工作|social policy|social work|公共行政|公共事务|public affairs|public policy/i,
      ['social-policy-administration', 'sociology']],
    [/经济|econom/i, ['economics-econometrics']],
    [/会计|金融|财务|accounting|finance/i, ['accounting-finance']],
    [/管理|商务|商业|市场|business|management|marketing|BBA/i, ['business-management-studies']],
    // 人文社科
    [/犯罪|criminolog/i, ['law-legal-studies', 'social-policy-administration']],
    [/法|law|LLB/i, ['law-legal-studies']],
    [/心理|psycholog/i, ['psychology']],
    [/国际关系|international relations|战争研究|war studies/i, ['politics', 'social-policy-administration']],
    [/政治|政府|government|politic|国际事务|international affairs/i, ['politics', 'social-policy-administration']],
    [/社会学|社会科学|social science|sociolog/i, ['sociology']],
    [/地理|geograph/i, ['geography']],
    [/人类科学|human sciences/i, ['anthropology', 'sociology', 'biological-sciences']],
    [/人类学|anthropolog/i, ['anthropology']],
    [/传媒|传播|媒体|新闻|communication|media|journalism|广告|advertis|电影|film/i, ['communication-media-studies']],
    [/教育|education/i, ['education-training']],
    [/翻译|translation/i, ['linguistics', 'modern-languages']],
    [/语言学|语言科学|linguistic|language science/i, ['linguistics']],
    [/中文|中国语言|汉语|chinese/i, ['modern-languages', 'linguistics']],
    [/英文|英语|english/i, ['english-language-literature']],
    [/现代语言|语言|language/i, ['modern-languages']],
    [/历史|history/i, ['history']],
    [/哲学|philosoph/i, ['philosophy']],
    [/音乐|music|表演艺术|performing/i, ['performing-arts']],
    [/艺术|设计|视觉|visual art|fine art|art history|design/i, ['art-design']],
    [/酒店|旅游|tourism|hotel|hospitality/i, ['hospitality-leisure-management']],
    [/体育|运动|sport/i, ['sports-related-subjects']]
  ];

  function qsListFor(p) {
    // 结果只取决于静态数据，缓存挂在专业对象上——分组维度、QS 列、卡片徽章都要用它
    if (p._qsList) return p._qsList;
    return (p._qsList = qsListCalc(p));
  }
  function qsListCalc(p) {
    var sch = (typeof QS_RANKS !== 'undefined' ? QS_RANKS[p.school] : null) || {};
    var subs = [];
    if (p.qs) {
      // 显式指定该专业对应的学科榜；qs: [] 表示本站收录的学科里没有对应榜，不显示
      subs = p.qs;
    } else {
      // 先按专业名收敛到本学科家族，避免粗方向桶里的「医学/药学」挤掉「化学」
      var name = p.zh + ' ' + p.en;
      for (var r = 0; r < QS_NAME_RULES.length; r++) {
        if (QS_NAME_RULES[r][0].test(name)) { subs = QS_NAME_RULES[r][1]; break; }
      }
      if (!subs.length) {   // 没能从名字认出学科，才退回方向桶
        p.dirs.forEach(function (d) {
          ((typeof QS_DIR_SUBJECTS !== 'undefined' ? QS_DIR_SUBJECTS[d] : null) || []).forEach(function (s) { subs.push(s); });
        });
      }
    }
    var out = [], seen = {};
    subs.forEach(function (sub) {
      if (sch[sub] && !seen[sub]) { seen[sub] = 1; out.push({ sub: sub, rank: sch[sub] }); }
    });
    return out.sort(function (a, b) { return rankNum(a.rank) - rankNum(b.rank); });
  }
  // QS 名次的写法统一：并列的「=4」把等号收缩成一个小标记（读数仍是 4），
  // 区间统一成 en dash——数据里混着「51-100」这种半角连字符，跟「101–200」排在一起很花
  function rankText(r) {
    return String(r == null ? '' : r).replace(/(\d)\s*[-–—]\s*(\d)/g, '$1–$2');
  }
  function rankHTML(r) {
    var s = String(r == null ? '' : r);
    var tie = s.charAt(0) === '=';
    return (tie ? '<span class="tie" title="并列">=</span>' : '') + esc(rankText(tie ? s.slice(1) : s));
  }
  function qsBadge(p) {
    var list = qsListFor(p);
    if (!list.length) return '';
    var title = list.map(function (x) { return (QS_SUBJECT_ZH[x.sub] || x.sub) + ' #' + rankText(x.rank); }).join(' · ');
    // 徽章带上学科名：只写「#24」看不出是哪个学科的排名，容易误读
    var top = list[0];
    return '<span class="badge qs" title="QS 2026 学科排名（' + esc(title) + '）">' +
      esc(QS_SUBJECT_ZH[top.sub] || top.sub) + ' #' + rankHTML(top.rank) + '</span>';
  }
  function qsCell(p) {
    var list = qsListFor(p);
    if (!list.length) return '<span class="t-qs no">—</span>';
    function row(x) {
      return '<div class="t-qs"><span class="qn">#' + rankHTML(x.rank) + '</span>' +
        '<span class="qz">' + esc(QS_SUBJECT_ZH[x.sub] || x.sub) + '</span></div>';
    }
    return list.map(row).join('');
  }

  // 校印字标：拉丁校名（LSE/UCL/KCL）直接用原名，中文校名取首字——旁边永远跟着全名，不会歧义
  function schoolMark(s) {
    if (s && s.mark) return s.mark;
    var zh = String((s && s.zh) || '');
    return /^[A-Za-z]/.test(zh) ? zh : zh.slice(0, 2);
  }
  function sealHTML(s, lg) {
    if (!s || !s.color) return '';
    return '<span class="seal' + (lg ? ' lg' : '') + '" style="--c:' + s.color + '" aria-hidden="true">' + esc(schoolMark(s)) + '</span>';
  }
  // 逐条可追溯到「哪个月核对过」——页脚只写一个总的月份，单行上看不出来
  function checkedTag(meta) {
    return (meta && meta.checked)
      ? '<span class="gd-checked" title="这所大学的数据逐条核对的月份；每一行的来源页面见「操作」列里的官网链接">核对 ' + esc(meta.checked) + '</span>'
      : '';
  }
  // 「这行和官网不一致？」总得有个出口：本站的可信度就等于数据准确度，
  // 用户发现了却无处可说，下一个人还会踩同一处。
  var REPORT_EMAIL = 'ptcwbf@gmail.com';
  // 报告文本与 GitHub 链接都由这同一份内容生成，保证两边一致
  function reportText(p) {
    var s = allSchoolByKey[p.school] || {};
    return [
      '【数据核对】' + (s.zh || p.school) + ' · ' + p.zh,
      '',
      '专业：' + p.zh + ' / ' + p.en,
      '大学：' + (s.zh || '') + '（' + (s.en || '') + '）',
      '本站记录：A-Level ' + (p.alevel || '—') + ' ｜ IB ' + (p.ib || '—') +
        ' ｜ 成绩口径 ' + (OFFER_ZH[p.offer] || p.offer),
      '本站核对日期：' + (s.checked || '—'),
      '该行来源页：' + p.url,
      '',
      '与官网不一致之处：',
      '（请贴官网原文或截图）'
    ].join('\n');
  }
  // 邮件入口：主题带学校与专业，正文就是上面那份报告——用户点一下就能发出去
  function reportMailto(p) {
    var s = allSchoolByKey[p.school] || {};
    return 'mailto:' + REPORT_EMAIL +
      '?subject=' + encodeURIComponent('数据核对 · ' + (s.zh || p.school) + ' ' + p.zh) +
      '&body=' + encodeURIComponent(reportText(p));
  }
  // 真链接留给「去 GitHub」用；行内那处改成按钮，点开面板先给一份可复制的报告
  function reportLink(p, idx) {
    return '<button type="button" class="report" data-report="' + idx + '"' +
      ' title="这一行和官网不一致？点这里生成一份带专业、当前记录与来源页的报告，复制即可反馈">报告错误</button>';
  }

  // ── 卡片视图 ──
  function cardHTML(p, idx, showSchool) {
    var s = schoolByKey[p.school];
    var key = cur === REGIONS.hk ? 'hk:' : 'uk:';
    var e = engFor(idx);
    var mode = primaryTrack();
    var vb = verdictBadge(p);
    return '<article class="card" style="--school:' + s.color + '">' +
      (showSchool ? '<div class="school-line">' + sealHTML(s, false) + hi(s.zh) + ' · ' + hi(s.en) + '</div>' : '') +
      '<h3><span class="zh">' + hi(p.zh) + '</span><span class="en">' + hi(p.en) + '</span></h3>' +
      hitChip(p, idx) +
      '<div class="card-meta">' + esc(p.degree) + '</div>' +
      '<div class="rating">' +
        '<div><div class="k">' + 'A-Level' + '</div>' + scoreHTML(p.alevel, 'v') +
        (p.alevelNote ? '<div class="score-note">' + esc(p.alevelNote) + '</div>' : '') +
        (mode === 'alevel' ? vb : '') + '</div>' +
        '<div><div class="k">IB（45 分制）</div>' + scoreHTML(p.ib, 'v') +
        (mode === 'ib' ? vb : '') + '</div>' +
      '</div>' +
      (e ? '<div class="eng-block">' +
        '<div class="eng-line"><span class="eng-k">英语</span>' +
        '<span class="eng-v">IELTS ' + esc(engIeltsShort(e)) + ' ｜ TOEFL ' + esc(engPair(e)) + '</span>' +
        (e.band ? '<span class="eng-band">' + esc(e.band) + '</span>' : '') +
        engChipTags(e) +
        '<span class="eng-tag' + (e.scope === 'prog' ? ' prog' : '') + '">' + esc(e.tag) + '</span></div>' +
        engDetailHTML(e) + '</div>' : '') +
      '<div class="badges">' + offerBadge(p) + testBadge(p) + qsBadge(p) + pageLinkHTML(cur === REGIONS.hk ? 'hk' : 'uk', idx) + cmpButton(key + idx) + cmpSibButton(cur === REGIONS.hk ? 'hk' : 'uk', p, key + idx) + '</div>' +
      (p.note ? '<p class="card-note">' + fmtBold(p.note) + '</p>' : '') +
      '<a class="go" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '">打开官网</a>' +
    '</article>';
  }
  function cardGroupHTML(items, idxMap, meta, showSchool, groupKey) {
    return '<section class="group" data-key="' + esc(groupKey || '') + '" style="--school:' + (meta.color || '#9aa3b8') + '">' +
      '<div class="group-head"><h2>' + esc(meta.zh) + '</h2>' + (meta.en ? '<span class="en">' + esc(meta.en) + '</span>' : '') + checkedTag(meta) +
      '<span class="cnt">' + items.length + ' 项</span></div>' +
      '<div class="cards">' + items.map(function (p, i) { return cardHTML(p, idxMap[i], showSchool); }).join('') + '</div></section>';
  }

  // ── 表格视图 ──
  // 可排序表头：点一下按该列排序，再点反向，第三下回到默认顺序
  function thSort(label, key) {
    var on = sortKey === key;
    var arrow = on ? (sortDir === 'desc' ? ICON.sortDesc : ICON.sortAsc) : ICON.sortNone;
    var sortAttr = on ? ' aria-sort="' + (sortDir === 'desc' ? 'descending' : 'ascending') + '"' : '';
    return '<th scope="col" class="th-sortable"' + sortAttr + '>' +
      '<button type="button" class="th-sort' + (on ? ' on' : '') + '" data-sort="' + key + '"' +
      ' title="' + esc(SORT_TITLE[key]) + '">' + esc(label) +
      '<span class="ar">' + arrow + '</span></button></th>';
  }
  function headHTML(items, meta) {
    var seal = sealHTML(meta, true);
    return '<div class="group-head' + (seal ? ' has-seal' : '') + '">' + seal + '<h2>' + esc(meta.zh) + '</h2>' +
      (meta.en ? '<span class="en">' + esc(meta.en) + '</span>' : '') + checkedTag(meta) +
      '<span class="cnt">' + items.length + ' 项</span></div>';
  }
  // colgroup 必须与表头同列数——原来按大学分组时表头 11 列、colgroup 只有 10 个 col，
  // 浏览器会把宽度整体错位一格，英语列因此被压到 97px
  function colgroupHTML(showSchool) {
    return '<colgroup>' + (showSchool ? '<col style="width:104px">' : '') +
      '<col style="width:186px"><col style="width:100px"><col style="width:108px"><col style="width:116px">' +
      '<col style="width:86px"><col style="width:76px"><col style="width:152px"><col style="width:116px">' +
      '<col style="width:176px"><col style="width:116px"></colgroup>';
  }
  function tableGroupHTML(items, idxMap, meta, showSchool, groupKey) {
    var extra = showSchool ? '<colgroup><col style="width:104px"></colgroup>' : '<colgroup><col style="width:0px"></colgroup>';
    var schoolTh = showSchool ? '<th scope="col">大学</th>' : '';
    var testHead = esc(cur.testHead);
    var mode = primaryTrack();   // 判定徽章贴在它对照的那一列下面：A-Level 贴 A-Level，IB 贴 IB
    var rows = items.map(function (p, i) {
      var s = schoolByKey[p.school];
      var key = (cur === REGIONS.hk ? 'hk:' : 'uk:') + idxMap[i];
      var vb = verdictBadge(p);
      var lead = showSchool
        ? '<td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + hi(s.zh) + '</span><span class="sub-line">' + hi(s.en) + '</span></td>'
        : '<td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + hi(p.zh) + '</span><span class="sub-line">' + hi(p.en) + '</span>' + hitChip(p, idxMap[i]) + '</td>';
      var testCol = p.test
        ? '<span class="t-test" title="' + (TEST_TITLE[p.test] || '') + '">' + esc(p.test) + '</span>'
        : '<span class="t-test no">—</span>';
      var e = engFor(idxMap[i]);
      // 行标识要带分组 key：按方向分组时同一专业会在多个组里各出现一次
      var rid = 'eng-' + (groupKey || 'g') + '-' + idxMap[i];
      var engCol = '<td class="eng-cell">' + engCellInner(e, rid, (showSchool ? '' : s.zh + ' · ') + p.zh) + '</td>';
      // 详情统一走抽屉（竖排更好读，且不受表格横向滚动影响），不再渲染行内展开行
      return '<tr>' + lead +
        (showSchool ? '<td><span class="lead-line">' + hi(p.zh) + '</span><span class="sub-line">' + hi(p.en) + '</span>' + hitChip(p, idxMap[i]) + '</td>' : '') +
        '<td>' + esc(p.degree) + '</td>' +
        '<td>' + scoreHTML(p.alevel, 'g') + (p.alevelNote ? '<div class="gn">' + esc(p.alevelNote) + '</div>' : '') + (mode === 'alevel' ? vb : '') + '</td>' +
        '<td>' + scoreHTML(p.ib, 'g g-ib') + (mode === 'ib' ? vb : '') + '</td>' +
        '<td>' + testCol + '</td>' +
        '<td><span class="t-offer" title="' + esc(OFFER_TITLE[p.offer] || '') + '">' + esc(OFFER_ZH[p.offer] || p.offer) + '</span></td>' +
        engCol +
        '<td class="qs-cell">' + qsCell(p) + '</td>' +
        '<td class="note-cell">' + (p.note ? fmtBold(p.note) : '') + '</td>' +
        '<td>' + cmpButton(key) + cmpSibButton(cur === REGIONS.hk ? 'hk' : 'uk', p, key) + '<a class="go2" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '">打开官网</a>' + pageLinkHTML(cur === REGIONS.hk ? 'hk' : 'uk', idxMap[i]) + reportLink(p, idxMap[i]) + '</td>' +
      '</tr>';
    }).join('');
    return '<section class="group" data-key="' + esc(groupKey || '') + '" style="--school:' + (meta.color || '#9aa3b8') + '">' + headHTML(items, meta) +
      '<div class="tblwrap"><table class="tbl">' + colgroupHTML(showSchool) +
      '<thead><tr>' + schoolTh + thSort('专业', 'name') + '<th scope="col">代码/学制</th>' + thSort('A-Level', 'alevel') + thSort('IB（45 分制）', 'ib') + '<th scope="col">' + testHead + '</th><th scope="col">成绩口径</th>' + thSort('英语要求', 'ielts') + thSort('QS2026 学科', 'qs') + '<th scope="col">备注</th><th scope="col">操作</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></section>';
  }

  // 表格能放下就不做滚动容器（overflow:clip）——这样表头才能像学校头一样相对「页面」吸顶；
  // 放不下时才加 .hscroll 横向滚动（此时它是滚动容器，表头吸不住，但至少页面仍是统一滚动）
  function syncTableOverflow() {
    Array.prototype.forEach.call(document.querySelectorAll('#groups .tblwrap'), function (w) {
      w.classList.toggle('hscroll', w.scrollWidth > w.clientWidth + 1);
    });
    // 表头吸顶要停在吸顶的学校头下方，所以偏移取学校头的实际高度
    var g = document.querySelector('#groups .group-head');
    if (g) document.documentElement.style.setProperty('--stick-top', g.offsetHeight + 'px');
  }
  var _syncT;
  window.addEventListener('resize', function () {
    clearTimeout(_syncT);
    _syncT = setTimeout(function () {
      // 对比栏在窄屏会换行变高，提示条的抬升量要跟着重算
      syncTableOverflow(); syncCmpBarLift();
      // 用户没手动挑过视图时，跟着屏幕宽度走（手机横竖屏切换、桌面拖窗口都算）
      if (!viewPicked && view !== defaultView()) { view = defaultView(); syncControlsChrome(); apply(); }
    }, 150);
  }, { passive: true });

  // ── 渲染 ──
  function apply() {
    // 取用后立即复位：apply 可能因空结果提前 return，留在 false 会让后续渲染永远不淡入
    var doAnim = animate; animate = true;
    persistState();   // 所有状态改动都汇到这里，统一写 URL + localStorage
    renderSortChip();
    var list = filtered();
    updateMyChrome();
    renderPrintMeta(list.length);   // 放在空结果提前 return 之前，两种情况下纸上都有上下文
    renderBreakdown(list); renderLegend(list); renderJumpbar(list);   // 列表为空时会各自隐藏
    var scClear = $('#scope-clear');
    if (scClear) scClear.hidden = !(activeDirs.length || activeSchools.length || testSel !== 'ALL' || q);
    if (!list.length) {
      $('#empty').hidden = false;
      $('#groups').innerHTML = '';
      syncTableOverflow();
      renderEmptyHelp();
      $('#result-count').textContent = 0;
      $('#result-context').textContent = '';
      return;
    }
    $('#empty').hidden = true;

    // 建立全库索引 → 便于稳定 key（跨板块不串）
    var idxMap = {}; cur.programs.forEach(function (p, i) { idxMap[i] = i; });
    // 按大学分组时第一列写校名，其余维度都写专业名（否则不知道这行是哪个专业）
    var showSchool = groupBy !== 'school';
    var keyOrder = groupKeys();
    // 每个专业的归属只算一次：qsListFor 要跑一遍学科名规则，放在「桶 × 专业」的双层循环里会放大几十倍
    var entries = list.map(function (p) {
      return { p: p, idx: idxMap[cur.programs.indexOf(p)], buckets: groupOf(p) };
    });

    var out = document.createElement('div');
    keyOrder.forEach(function (k) {
      var pairs = [];
      entries.forEach(function (e) {
        if (e.buckets.indexOf(k) === -1) return;
        pairs.push({ p: e.p, idx: e.idx });
      });
      if (!pairs.length) return;
      if (sortKey !== 'default') pairs = sortPairs(pairs, sortKey, sortDir);
      var groupItems = pairs.map(function (x) { return x.p; });
      var groupIdx = pairs.map(function (x) { return x.idx; });
      var meta = groupMeta(k);
      out.insertAdjacentHTML('beforeend',
        view === 'table' ? tableGroupHTML(groupItems, groupIdx, meta, showSchool, k) : cardGroupHTML(groupItems, groupIdx, meta, showSchool, k));
    });

    $('#groups').innerHTML = '';
    $('#groups').appendChild(out);
    syncTableOverflow();
    // 内容整体换过就淡入一次；先移除再加，确保连续两次渲染也能重放
    if (doAnim) {
      var g = $('#groups');
      g.classList.remove('anim'); void g.offsetWidth; g.classList.add('anim');
    }
    $('#result-count').textContent = list.length;
    var scope = [];
    if (activeDirs.length) scope.push(activeDirs.map(function (d) { return cur.dirs[d].zh; }).join('、'));
    if (activeSchools.length) scope.push(activeSchools.map(function (k) { return schoolByKey[k].zh; }).join('、'));
    if (testSel !== 'ALL') scope.push(testSel === 'NONE' ? '无笔试' : testSel === 'YES' ? '需笔试' : testSel);
    $('#result-context').textContent = scope.length ? '· 当前范围：' + scope.join(' / ') : '';
  }

  // ── 交互事件 ──
  $('#filters-dir').addEventListener('click', onChip('#filters-dir', function (arr, k) { return toggleSet(arr, k); }));
  $('#filters-school').addEventListener('click', onChip('#filters-school', function (arr, k) { return toggleSet(arr, k); }));
  function toggleSet(arr, k) { var i = arr.indexOf(k); if (i === -1) arr.push(k); else arr.splice(i, 1); }
  function onChip(sel, fn) {
    return function (e) {
      var b = e.target.closest('button[data-k]'); if (!b || b.closest('.region-tab')) return;
      fn(sel === '#filters-dir' ? activeDirs : activeSchools, b.dataset.k);
      renderChips(); apply();
    };
  }
  $('#filters-test').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]'); if (!b || b.dataset.k === testSel) return;
    testSel = b.dataset.k; renderChips(); apply();
  });
  $('#school-all').addEventListener('click', function () { activeSchools = cur.schools.map(function (s) { return s.key; }); renderChips(); apply(); });
  $('#school-none').addEventListener('click', function () { activeSchools = []; renderChips(); apply(); });
  $('#groupby').addEventListener('change', function (e) { groupBy = e.target.value; apply(); });
  var _histT;
  $('#q').addEventListener('input', function (e) {
    q = e.target.value.trim().toLowerCase(); animate = false; apply();
    // 停手 1.5 秒才记进历史：一边打字一边记会把「港」「港大」「港大 C」全塞进去
    clearTimeout(_histT);
    var term = e.target.value.trim();
    if (term.length >= 2) _histT = setTimeout(function () { pushHistory(term); }, 1500);
    else renderHistory();          // 清空输入时把历史重新露出来
  });
  $('#q').addEventListener('focus', renderHistory);
  $('#q').addEventListener('blur', function () { var h = $('#hist'); if (h) { h.hidden = true; h.innerHTML = ''; } });
  // 用 mousedown 而不是 click：click 之前输入框会先失焦，列表已经被收起来，点不中
  $('#hist').addEventListener('mousedown', function (e) {
    var b = e.target.closest('button[data-hist]');
    if (b) {
      e.preventDefault();
      $('#q').value = b.dataset.hist;
      $('#q').dispatchEvent(new Event('input', { bubbles: true }));
      renderHistory();             // 有内容了，历史自行收起
      return;
    }
    if (e.target.closest('button[data-hist-clear]')) {
      e.preventDefault();
      HISTORY = []; saveHistory(); renderHistory();
    }
  });
  // 我的成绩：每次输入都要重算全表判定
  // 面板里的每个字段：改一下就重算全表判定
  var GRADE_FIELDS = [
    ['#g-al', function (v) { gAl = v; }],
    ['#g-ib', function (v) { gIb = v; }],
    ['#g-ielts', function (v) { gIelts = v; }],
    ['#g-l', function (v) { gL = v; }],
    ['#g-r', function (v) { gR = v; }],
    ['#g-w', function (v) { gW = v; }],
    ['#g-s', function (v) { gS = v; }],
    ['#g-toefl', function (v) { gToefl = v; }]
  ];
  // 输入防抖 220ms：改成面板之后每敲一个字母仍会整表重渲染一次，
  // 手机上（CPU 4 倍降速）单次要 0.8–1.3 秒，等于每按一个键就冻住一秒。
  // 打字时不渲染，停手后再算——判定结果本来也不需要逐字刷新。
  var _gradeT, _gradeStale = false;
  function applyGradesSoon() {
    saveGrades();
    clearTimeout(_gradeT);
    _gradeT = setTimeout(function () {
      animate = false;
      // 窄屏上面板整屏盖住结果区，此刻重渲染 238 条纯属浪费（手机上一次 200ms+）。
      // 只刷新摘要与按钮，整表等关面板时再补——宽屏上面板是居中的，背后看得见，照常渲染。
      if (!$('#grade-sheet').hidden && window.innerWidth <= 760) {
        _gradeStale = true;
        updateMyChrome();
        return;
      }
      apply();
    }, 220);
  }
  GRADE_FIELDS.forEach(function (f) {
    $(f[0]).addEventListener('input', function (e) {
      f[1](e.target.value.trim()); applyGradesSoon();
    });
  });
  $('#g-toefl-scale').addEventListener('change', function (e) {
    gToeflScale = e.target.value === 'new' ? 'new' : 'old'; applyGradesSoon();
  });
  $('#g-clear').addEventListener('click', function () {
    gAl = gIb = gIelts = gL = gR = gW = gS = gToefl = '';
    gToeflScale = 'old'; onlyReach = false;
    syncControlsChrome(); saveGrades(); apply();
    showToast('已清空学生成绩');
  });
  // 学生成绩面板：与英语抽屉同一套开合手感（关闭时把焦点还给触发按钮）
  var gradeBack = null;
  function openGradeSheet() {
    gradeBack = document.activeElement;
    var ov = $('#grade-sheet');
    ov.hidden = false;
    void ov.offsetWidth;        // 先确立初始样式，再上 show 才能触发过渡
    ov.classList.add('show');
    $('#g-al').focus();
  }
  function closeGradeSheet() {
    var ov = $('#grade-sheet');
    if (ov.hidden) return;
    ov.classList.remove('show');
    clearTimeout(closeGradeSheet._t);
    closeGradeSheet._t = setTimeout(function () {
      ov.hidden = true;
      if (gradeBack && gradeBack.focus && document.contains(gradeBack)) gradeBack.focus();
      if (_gradeStale) { _gradeStale = false; apply(); }   // 补上被推迟的那次整表渲染
    }, 200);
  }
  $('#grade-open').addEventListener('click', openGradeSheet);
  $('#grade-close').addEventListener('click', closeGradeSheet);
  $('#g-done').addEventListener('click', closeGradeSheet);
  $('#grade-sheet').addEventListener('click', function (e) {
    if (e.target === $('#grade-sheet')) closeGradeSheet();
  });

  $('#only-reach').addEventListener('change', function (e) {
    onlyReach = e.target.checked; saveGrades(); apply();
  });
  // 视图切换单独成函数：点击、键盘快捷键、状态回填三处共用
  function setView(v) {
    if (v === view) return;
    view = v; viewPicked = true;
    Array.prototype.forEach.call($('#view-toggle').children, function (x) {
      x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === v));
    });
    apply();
  }
  $('#view-toggle').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-v]'); if (!b) return;
    setView(b.dataset.v);
  });
  // 方向键在页签间移动、Home/End 到两端——tabs 模式该有的键盘行为
  $('.region-tabs').addEventListener('keydown', function (e) {
    var i = cur === REGIONS.hk ? 1 : 0, n = 2, next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i + n - 1) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    if (next === null || next === i) return;
    e.preventDefault();
    var btn = [$('#tab-uk'), $('#tab-hk')][next];
    switchRegion(next === 1 ? 'hk' : 'uk');
    btn.focus();     // 焦点跟着选中项走，键盘用户不会掉到页面别处
  });
  $('#reset').addEventListener('click', function () {
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = ''; groupBy = 'school'; sortKey = 'default';
    // 视图也回到「按屏幕自动」而不是钉死在表格：既然是重置全部，就不该继续把视图写进分享链接
    view = defaultView(); viewPicked = false;
    syncControlsChrome(); renderChips(); apply();
    showToast('已重置：显示全部 ' + cur.programs.length + ' 项');
  });
  $('#scope-clear').addEventListener('click', function () {
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = '';
    syncControlsChrome(); renderChips(); apply(); showToast('已清除所选条件');
  });
  // 「把这批筛选结果发到群里」是这个站最常被需要、界面上却一直没有入口的动作：
  // 状态全在 hash 里，能分享这件事本身没人知道。
  // 链接从 snapshot() 现拼，而不是读 location.href——file:// 下 replaceState 可能被拒，
  // 地址栏未必是最新的那份状态。
  function shareURL() {
    var enc = encodeState(snapshot());
    var base = location.href.split('#')[0];
    return enc ? base + '#' + enc : base;
  }
  $('#share').addEventListener('click', function () {
    copyText(shareURL(), function () {
      var n = activeDirs.length + activeSchools.length + (testSel !== 'ALL' ? 1 : 0) + (q ? 1 : 0);
      showToast(n ? '已复制链接：含当前板块与 ' + n + ' 项筛选条件'
                  : '已复制本页链接（当前是默认视图）');
    });
  });
  $('#sort-chip').addEventListener('click', function () { sortKey = 'default'; apply(); });
  // 学校速跳：长表里直接跳到某校（吸顶分组头会接管定位，所以只滚到该组顶端即可）
  $('#jumpbar').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-jump]'); if (!b) return;
    var sec = document.querySelector('#groups .group[data-key="' + b.dataset.jump + '"]');
    if (!sec) return;
    window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - 6, behavior: prefersReduced() ? 'auto' : 'smooth' });
  });
  // 回到顶部
  var toTop = $('#to-top');
  function updateToTop() { toTop.classList.toggle('show', window.scrollY > 600); }
  window.addEventListener('scroll', updateToTop, { passive: true });
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' }); });
  updateToTop();

  // 区域切换
  function switchRegion(r) {
    if (cur === REGIONS[r]) return;
    cur = REGIONS[r];
    // 筛选条件必须清掉（校 Key、方向都换了一套），但「分组方式」与「排序」是看法不是条件，
    // 正在按 QS 名次段看的人切到香港，应当还在按名次段看
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = '';
    view = defaultView();   // 切板块也重新按屏幕宽度取默认（窄屏卡片、宽屏表格）
    // 对比清单跨板块保留，英国学校与香港学校可放进同一张对比表
    syncRegionChrome(); syncControlsChrome();
    buildIndex(); renderManual(); renderChips(); apply();
  }
  $('#tab-uk').addEventListener('click', function () { switchRegion('uk'); });
  $('#tab-hk').addEventListener('click', function () { switchRegion('hk'); });

  // 表头排序：默认 → 反向 → 回到默认
  $('#groups').addEventListener('click', function (e) {
    var b = e.target.closest('button.th-sort'); if (!b) return;
    var k = b.dataset.sort;
    if (sortKey !== k) { sortKey = k; sortDir = defaultDir(k); }
    else if (sortDir === defaultDir(k)) { sortDir = defaultDir(k) === 'desc' ? 'asc' : 'desc'; }
    else { sortKey = 'default'; }
    apply();
  });

  // ── 对比（收藏）──
  function cmpKeyParts(key) { var i = key.indexOf(':'); return { r: key.slice(0, i), idx: +key.slice(i + 1) }; }
  function cmpProgram(key) {
    var parts = cmpKeyParts(key);
    return (parts.r === 'hk' ? REGIONS.hk : REGIONS.uk).programs[parts.idx] || null;
  }
  // 对比清单的持久化标识：用「学校|英文名」而不是下标——下标会随数据增删而错位
  var CMP_STORE = 'ukapply.compare.v1';
  function saveCompare() {
    var arr = Array.from(compare).map(function (k) {
      var p = cmpProgram(k);
      return p ? p.school + '|' + p.en : null;
    }).filter(Boolean);
    try { localStorage.setItem(CMP_STORE, JSON.stringify(arr)); } catch (e) {}
  }
  function loadCompare() {
    var raw;
    try { raw = JSON.parse(localStorage.getItem(CMP_STORE) || '[]'); } catch (e) { return; }
    if (!Array.isArray(raw)) return;
    raw.forEach(addCompareSig);
  }
  // 认领一条还没被占用的记录：同名同校可能有两条（如帝国 Computing 的 MEng/BEng），按顺序各认一条
  function addCompareSig(sig) {
    if (!sig) return false;
    return ['uk', 'hk'].some(function (rc) {
      var progs = REGIONS[rc].programs;
      for (var i = 0; i < progs.length; i++) {
        if (progs[i].school + '|' + progs[i].en !== sig) continue;
        var key = rc + ':' + i;
        if (compare.has(key)) continue;
        compare.add(key);
        return true;
      }
      return false;
    });
  }
  // 一键加入「本校同方向」的全部专业（以该专业的首个方向为准，结果确定可预期）
  function addSameSchoolDir(key) {
    var p = cmpProgram(key); if (!p) return 0;
    var rc = cmpKeyParts(key).r, dir = p.dirs[0], progs = (rc === 'hk' ? REGIONS.hk : REGIONS.uk).programs;
    var added = 0, full = false;
    progs.forEach(function (q, i) {
      if (q.school !== p.school || q.dirs[0] !== dir) return;
      var k = rc + ':' + i;
      if (compare.has(k)) return;
      if (compare.size >= CMP_MAX) { full = true; return; }
      compare.add(k); added++;
    });
    if (full) showToast('已达对比上限 ' + CMP_MAX + ' 项，只加入了部分同方向专业。', 4200);
    return added;
  }
  $('#groups').addEventListener('click', function (e) {
    var b = e.target.closest('button.cmp'); if (!b) return;
    var key = b.dataset.key;
    if (compare.has(key)) compare.delete(key);
    else {
      if (compare.size >= CMP_MAX) { showToast('已达对比上限 ' + CMP_MAX + ' 项。请先移除一些，再加入新的。', 4200); return; }
      compare.add(key);
    }
    b.classList.toggle('on', compare.has(key));
    b.setAttribute('aria-pressed', String(compare.has(key)));
    b.textContent = compare.has(key) ? '已加入对比' : '加入对比';
    // 闪一下所在行/卡片：长表格里确认自己点中的是哪一条
    var host = b.closest('tr') || b.closest('.card');
    if (host) {
      host.classList.remove('flash'); void host.offsetWidth; host.classList.add('flash');
      clearTimeout(host._flashT);
      host._flashT = setTimeout(function () { host.classList.remove('flash'); }, 900);
    }
    updateCompareBar();
    saveCompare();
  });
  // 英语详情：统一用抽屉竖排展示
  // （表格单元格只有约 90px 宽、且要横向滚动，无论如何都不适合直接铺开）
  var engSheetBack = '';
  // 按钮的 id 形如 eng-<分组key>-<专业索引>，末段就是 cur.programs 的下标
  function engForRowId(id) {
    var idx = +String(id).split('-').pop();
    return cur.programs[idx] ? engFor(idx) : null;
  }
  function openEngSheet(id, label) {
    var html = engDetailGrid(engForRowId(id));
    if (!html) return;
    $('#eng-sheet-title').textContent = label ? '英语要求 · ' + label : '英语要求';
    $('#eng-sheet-body').innerHTML = html;
    engSheetBack = id;
    var ov = $('#eng-sheet');
    ov.hidden = false;
    void ov.offsetWidth;
    ov.classList.add('show');
    $('#eng-sheet-close').focus();
  }
  function closeEngSheet() {
    var ov = $('#eng-sheet');
    if (ov.hidden) return;
    ov.classList.remove('show');
    clearTimeout(closeEngSheet._t);
    closeEngSheet._t = setTimeout(function () {
      ov.hidden = true;
      var back = document.querySelector('button.eng-open[data-eng="' + engSheetBack + '"]');
      if (back && document.contains(back)) back.focus();
    }, 200);
  }
  $('#eng-sheet-close').addEventListener('click', closeEngSheet);
  $('#eng-sheet').addEventListener('click', function (e) { if (e.target === $('#eng-sheet')) closeEngSheet(); });

  $('#groups').addEventListener('click', function (e) {
    var b = e.target.closest('button.eng-open'); if (!b) return;
    openEngSheet(b.dataset.eng, b.dataset.engLabel);
  });

  // 一键把本校同方向的全部专业加入对比
  $('#groups').addEventListener('click', function (e) {
    var b = e.target.closest('button.cmp-sib'); if (!b) return;
    var n = addSameSchoolDir(b.dataset.key);
    syncCmpButtons(); updateCompareBar(); saveCompare();
    showToast(n ? '已加入本校同方向 ' + n + ' 项' : '本校该方向没有其他可加入的专业');
  });
  // 对比栏是常驻的底部 fixed 栏，而提示条与「回到顶部」也是底部 fixed——
  // 不把对比栏的高度告诉它们，提示条就会被整个盖住（对比栏 z-index 更高），
  // 窄屏上「回到顶部」也会被压在栏下面。高度随窄屏换行而变，所以出现时与改尺寸时都重算。
  function syncCmpBarLift() {
    var bar = $('#comparebar');
    var lift = (bar && !bar.hidden && compare.size) ? bar.offsetHeight + 8 : 0;
    // 封顶：极度窄 / 矮的视口里对比栏会换行成很高的一条，一味上移会把提示条顶出屏幕。
    // 顶到上限时提示条会压住对比栏一角，所以它的 z-index 也高于对比栏——被压住还能读，
    // 顶出屏幕就什么也看不见了。
    if (lift && window.innerHeight) lift = Math.min(lift, Math.max(0, window.innerHeight - 160));
    document.documentElement.style.setProperty('--cmpbar-lift', lift + 'px');
  }
  function updateCompareBar() {
    var bar = $('#comparebar');
    if (!compare.size) {
      // 先播完收起动画再真正隐藏，避免「啪」地消失
      if (!bar.hidden) {
        $('#compare-count').textContent = 0;   // 留着旧数字会被读屏念出来
        bar.classList.remove('show');
        clearTimeout(updateCompareBar._t);
        updateCompareBar._t = setTimeout(function () {
          if (!compare.size) { bar.hidden = true; syncCmpBarLift(); }
        }, 220);
      }
      return;
    }
    clearTimeout(updateCompareBar._t);
    // 收起动画要跑 220ms 才把 hidden 置上，而这段时间里用户完全可能又加回来（例如点「撤销」）——
    // 只认 bar.hidden 会漏掉这一类：hidden 还是 false，但 .show 已经被拿掉，
    // 于是对比栏停在不透明度 0 的状态再也不会自己回来。真正的判据是「它现在看不看得见」。
    var wasHidden = bar.hidden || !bar.classList.contains('show');
    bar.hidden = false;
    $('#compare-count').textContent = compare.size;
    // 只在真正从无到有时滑入；之后改数字不重播动画
    if (wasHidden) { void bar.offsetWidth; bar.classList.add('show'); }
    syncCmpBarLift();
  }
  // 清空是「一下没了 30 项」的动作，给一个 5 秒的后悔阀门
  $('#compare-clear').addEventListener('click', function () {
    if (!compare.size) return;
    var backup = Array.from(compare);
    compare.clear(); updateCompareBar(); syncCmpButtons(); saveCompare();
    showToast('已清空对比清单 ' + backup.length + ' 项', 5200, {
      label: '撤销',
      fn: function () {
        backup.forEach(function (k) { compare.add(k); });
        updateCompareBar(); syncCmpButtons(); saveCompare();
        showToast('已恢复 ' + backup.length + ' 项');
      }
    });
  });
  $('#compare-open').addEventListener('click', openCompare);
  $('#compare-close').addEventListener('click', closeCompare);
  $('#compare-overlay').addEventListener('click', function (e) { if (e.target === $('#compare-overlay')) closeCompare(); });
  // ── 报告错误面板 ──
  // 静态站没有后端，也不能假定用户有 GitHub 账号：给一份写好的报告让他自己复制，
  // 粘到微信 / 邮件 / 任何渠道都行。GitHub 只是给有账号的人多留一个入口。
  var reportIdx = null, reportBack = null;
  function openReportSheet(idx) {
    var p = cur.programs[idx];
    if (!p) return;
    reportIdx = idx;
    reportBack = document.activeElement;
    $('#report-text').value = reportText(p);
    $('#report-sum').textContent = cur.name + ' · ' + p.zh;
    var ov = $('#report-sheet');
    ov.hidden = false;
    void ov.offsetWidth;
    ov.classList.add('show');
    $('#report-copy').focus();
  }
  function closeReportSheet() {
    var ov = $('#report-sheet');
    if (ov.hidden) return;
    ov.classList.remove('show');
    clearTimeout(closeReportSheet._t);
    closeReportSheet._t = setTimeout(function () {
      ov.hidden = true;
      if (reportBack && reportBack.focus && document.contains(reportBack)) reportBack.focus();
    }, 200);
  }
  $('#groups').addEventListener('click', function (e) {
    var b = e.target.closest('button.report'); if (!b) return;
    openReportSheet(+b.dataset.report);
  });
  $('#report-close').addEventListener('click', closeReportSheet);
  $('#report-sheet').addEventListener('click', function (e) {
    if (e.target === $('#report-sheet')) closeReportSheet();
  });
  $('#report-copy').addEventListener('click', function () {
    var btn = this;
    copyText($('#report-text').value, function () {
      flashButton(btn, '已复制 ✓');
      showToast('已复制报告内容，粘到微信 / 邮件里即可', 3600);
    });
  });
  $('#report-mail').addEventListener('click', function () {
    var p = cur.programs[reportIdx];
    if (!p) return;
    location.href = reportMailto(p);
  });

  // 四个弹层：谁在最上层就管谁。顺序即层级（后开的在上）
  var OVERLAYS = [
    { id: 'report-sheet', close: function () { closeReportSheet(); } },
    { id: 'grade-sheet', close: function () { closeGradeSheet(); } },
    { id: 'eng-sheet', close: function () { closeEngSheet(); } },
    { id: 'compare-overlay', close: function () { closeCompare(); } }
  ];
  function topOverlay() {
    for (var i = 0; i < OVERLAYS.length; i++) {
      var el = $('#' + OVERLAYS[i].id);
      if (el && !el.hidden) return OVERLAYS[i];
    }
    return null;
  }
  document.addEventListener('keydown', function (e) {
    var top = topOverlay();
    if (!top) return;
    var ov = $('#' + top.id);
    if (e.key === 'Escape') { top.close(); return; }
    if (e.key !== 'Tab') return;
    // 焦点陷阱：Tab 只在弹层内循环，否则键盘用户会跑到被遮住的页面上
    var f = ov.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1], act = document.activeElement;
    if (e.shiftKey) {
      if (act === first || !ov.contains(act)) { e.preventDefault(); last.focus(); }
    } else if (act === last || !ov.contains(act)) { e.preventDefault(); first.focus(); }
  });
  // 全局键盘快捷：此前只有弹层内部能纯键盘操作。
  // 全部限定在「没有弹层打开、且焦点不在输入框里」时才生效——否则打字打到一半就被劫持
  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (topOverlay()) return;   // 弹层开着时归上面那个处理
    var el = document.activeElement;
    var typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    if (e.key === '/' && !typing) {
      e.preventDefault(); $('#q').focus(); $('#q').select(); return;
    }
    // Esc 清空搜索：只在焦点确实在搜索框、且里面真有内容时动手，
    // 否则 Esc 该保持「什么都不发生」，不该顺手把用户的筛选抹掉
    if (e.key === 'Escape' && el === $('#q') && (q || $('#q').value)) {
      $('#q').value = ''; q = ''; apply(); $('#q').blur(); return;
    }
    if (typing) return;
    if (e.key === 't' || e.key === 'T') setView('table');
    else if (e.key === 'c' || e.key === 'C') setView('card');
  });
  // 打印样式早就写好了（去交互件、每页重复表头、强制展开口径说明），只是界面上一直没有兑现它的按钮。
  // <details> 收起时内容仍会被隐藏，所以打印前后要真的开合一次；
  // 挂在 beforeprint 上，用户直接按 Ctrl+P 也走得通。
  var printOpened = [];
  window.addEventListener('beforeprint', function () {
    printOpened = [];
    [$('#manual'), $('#timeline')].forEach(function (d) {
      if (d && !d.open) { d.open = true; printOpened.push(d); }
    });
  });
  window.addEventListener('afterprint', function () {
    printOpened.forEach(function (d) { d.open = false; });
    printOpened = [];
  });
  $('#print').addEventListener('click', function () { window.print(); });
  function syncCmpButtons() {
    Array.prototype.forEach.call(document.querySelectorAll('button.cmp'), function (b) {
      var on = compare.has(b.dataset.key);
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '已加入对比' : '加入对比';
    });
  }
  // 对比表内容：先解析成条目（带所属板块与全库索引），排序后再渲染
  function cmpItems() {
    var items = Array.from(compare).map(function (key) {
      var parts = cmpKeyParts(key);
      var isHK = parts.r === 'hk';
      var p = (isHK ? REGIONS.hk : REGIONS.uk).programs[parts.idx];
      return p ? { p: p, isHK: isHK, rc: isHK ? 'hk' : 'uk', idx: parts.idx } : null;
    }).filter(Boolean);
    if (cmpSort !== 'default') {
      // 借 sortPairs 的比较器：把整条记录挂在 ref 上带过去。
      // ielts 键还要 rc 才能取到英语数据（对比表里英港混排，不能靠当前板块推断）
      items = sortPairs(items.map(function (x) { return { p: x.p, idx: x.idx, rc: x.rc, ref: x }; }), cmpSort, cmpDir)
        .map(function (x) { return x.ref; });
    }
    return items;
  }
  function renderCmpSort() {
    var host = $('#cmp-sort'); if (!host) return;
    host.innerHTML = '<span class="cs-label">排序</span>' +
      ['default', 'alevel', 'ib', 'ielts', 'qs'].map(function (k) {
        var on = cmpSort === k;
        var txt = k === 'default' ? '默认' : (SORT_LABEL[k] + (on ? (cmpDir === 'desc' ? ' ▾' : ' ▴') : ''));
        return '<button type="button" class="cs-btn' + (on ? ' on' : '') + '" data-ck="' + k + '"' +
          (k === 'default' ? '' : ' title="' + esc(SORT_TITLE[k]) + '"') + '>' + esc(txt) + '</button>';
      }).join('');
  }
  // ── 冲 / 稳 / 保 ──
  // 把「我的成绩」的判定翻成选校语言：低于公布要求＝冲，达到＝稳，高于＝保。
  // UCAS 本科一般只能填 5 个志愿，学生真正要的是一张排过优先级的短名单，而不是 30 项对照表。
  // 用「冲刺 / 匹配 / 保底」而不是「冲 / 稳 / 保」：
  // 刚够线叫「稳」是误导——正好达到公布口径既不高也不低，热门专业实收普遍更高，
  // 把它当稳妥志愿会出事。「匹配」只说「你的成绩和要求对得上」，不含把握的含义。
  var POS_ZH = { under: '冲刺', meet: '匹配', over: '保底' };
  var POS_TITLE = {
    under: '冲刺：成绩低于该校公布的分数口径，属于冲刺志愿',
    meet: '匹配：成绩正好达到公布的分数口径。叫「匹配」不叫「稳」——刚够线不等于录取把握，热门专业实收普遍高于公布数字，仍要留保底',
    over: '保底：成绩高于公布的分数口径'
  };
  var POS_LONG = {
    under: '冲刺 · 低于公布要求', meet: '匹配 · 达到公布要求',
    over: '保底 · 高于公布要求', none: '无分数可比（该校只公布通用门槛，或没给分数）'
  };
  var cmpGroupPos = false;                 // 对比清单按冲/稳/保分段
  var CMP_COLS_TOTAL = 13;                 // 分组标题行 colspan 用；与 renderCompareTable 的表头数一致
  // 清单里每一条都要能单独移出、能调顺序。
  // 用上/下按钮而不是拖动：触屏拖动要自己实现指针事件，而按钮顺带把键盘和读屏一起覆盖了。
  // 手排的顺序只在「默认」排序下成立，所以套了排序键时把按钮禁用并说明原因。
  function cmpOps(key) {
    var manual = cmpSort === 'default';
    var dis = manual ? '' : ' disabled';
    var tip = manual ? '' : '（先切回「默认」排序才能手排顺序）';
    return '<span class="ops">' +
      '<button type="button" class="op" data-mv="-1" data-key="' + esc(key) + '"' + dis +
        ' title="上移' + tip + '" aria-label="上移">' + ICON.sortAsc + '</button>' +
      '<button type="button" class="op" data-mv="1" data-key="' + esc(key) + '"' + dis +
        ' title="下移' + tip + '" aria-label="下移">' + ICON.sortDesc + '</button>' +
      '<button type="button" class="op rm" data-rm="' + esc(key) + '"' +
        ' title="从清单里移除这一条" aria-label="移除">' + ICON.close + '</button></span>';
  }
  // 手动排序：Set 本身保持插入顺序，所以调顺序就是把 Set 重排一遍
  function moveCompare(key, delta) {
    var arr = Array.from(compare);
    var i = arr.indexOf(key), j = i + delta;
    if (i < 0 || j < 0 || j >= arr.length) return false;
    arr.splice(j, 0, arr.splice(i, 1)[0]);
    compare = new Set(arr);
    return true;
  }
  function posChip(it) {
    var v = verdictFor(it.p);
    if (!v) return '';
    // 部分比对（科目数不够）加个星号，对比表的小结里会解释它的含义
    var extra = extraReqs(it.p), kind = extraKind(it.p), marked = !!kind;
    return '<span class="pos ' + v.kind + (v.padded ? ' partial' : '') + '" title="' +
      esc(POS_TITLE[v.kind] + (v.padded ? '（你只填了 ' + v.have + ' 门，未填的按 A 计）' : '') +
        (v.by === 'count' ? '（该专业只公布门数，未公布等级）' : '') +
        (marked ? '该专业另有要求：' + extra.join('；') : '')) + '">' +
      POS_ZH[v.kind] + (v.padded ? '*' : '') + (marked ? '<i class="pvx' + (kind === 'exam' ? ' exam' : '') + '">' + (kind === 'exam' ? '考' : '+') + '</i>' : '') + '</span>';
  }
  // CSV 里只有「冲」两个字太单薄——导出的表常常是直接发给顾问的，要能自己说明白
  function posText(p) {
    var v = verdictFor(p);
    if (!v) return '';
    return POS_ZH[v.kind] + '（' + VERDICT_ZH[v.kind] + barWord(p) + '）';
  }
  function updatePosSum(items) {
    var el = $('#cmp-pos-sum'); if (!el) return;
    var c = { under: 0, meet: 0, over: 0, na: 0, partial: 0 };
    items.forEach(function (it) {
      var v = verdictFor(it.p);
      if (v) { c[v.kind]++; if (v.padded) c.partial++; } else c.na++;
    });
    var n = c.under + c.meet + c.over;
    if (!n) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.innerHTML = '<span class="pss-k">按你输入的成绩</span>' +
      '<span class="pos under">' + POS_ZH.under + ' ' + c.under + '</span>' +
      '<span class="pos meet">' + POS_ZH.meet + ' ' + c.meet + '</span>' +
      '<span class="pos over">' + POS_ZH.over + ' ' + c.over + '</span>' +
      (c.na ? '<span class="pss-na">另有 ' + c.na + ' 项无分数可比</span>' : '') +
      '<span class="pss-tip">UCAS 本科一般只能填 5 个志愿，建议 1–2 冲刺、2–3 匹配、1–2 保底' +
      (c.partial ? '；带 <b>*</b> 的项你只填了部分科目，未填的按 A 计' : '') + '</span>';
  }
  function renderCompareTable() {
    var items = cmpItems();
    // 逐列比对：全都一样的列没必要细看，把有差异的列标出来，省掉逐格对眼
    var CMP_COLS = [
      { i: 4, get: function (it) { return it.p.alevel || ''; } },
      { i: 5, get: function (it) { return it.p.ib || ''; } },
      { i: 6, get: function (it) { return it.p.test || ''; } },
      { i: 7, get: function (it) { return it.p.offer || ''; } },
      // 英语按「取值」比较而不是整格 HTML，否则几乎永远算作有差异
      { i: 8, get: function (it) {
        var e = engFor(it.idx, it.rc) || {};
        return [e.ielts, e.toeflOld, e.toeflNew, e.band, igcseValue(e, 'efl'), igcseValue(e, 'esl')].join('|');
      } }
    ];
    var varies = {};
    if (items.length > 1) {
      CMP_COLS.forEach(function (c) {
        var seen = {}, n = 0;
        items.forEach(function (it) { var v = c.get(it); if (!seen[v]) { seen[v] = 1; n++; } });
        varies[c.i] = n > 1;
      });
    }
    function td(i, html, cls) {
      var c = (cls || '') + (varies[i] ? (cls ? ' ' : '') + 'diff' : '');
      return '<td' + (c ? ' class="' + c + '"' : '') + '>' + html + '</td>';
    }
    // 每行单独成函数：按冲/稳/保分组时要分桶铺行
    function cmpRow(it) {
      var p = it.p, isHK = it.isHK;
      var s = allSchoolByKey[p.school];
      var test = p.test ? esc(p.test) : '—';
      var offer = OFFER_ZH[p.offer] || p.offer;
      var key = (it.rc === 'hk' ? 'hk:' : 'uk:') + it.idx;
      return '<tr><td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + esc(s.zh) + '</span><span class="sub-line">' + esc((isHK ? '香港' : '英国') + ' · ' + s.en) + '</span></td>' +
        '<td><span class="lead-line">' + esc(p.zh) + '</span><span class="sub-line">' + esc(p.en) + '</span></td>' +
        // 入学年份逐行写死：跨板块混选时这一列就是防读错的
        '<td class="cycle-cell"><span class="cy">' + esc(cycleShort(it.rc)) + '</span>' +
          '<span class="cy-sub">' + esc(REGIONS[it.rc].cycle) + '</span></td>' +
        td(3, esc(p.degree)) +
        td(4, scoreHTML(p.alevel, 'g') + (p.alevelNote ? '<div class="gn">' + esc(p.alevelNote) + '</div>' : '')) +
        td(5, scoreHTML(p.ib, 'g g-ib')) +
        td(6, test) +
        td(7, '<span class="t-offer" title="' + esc(OFFER_TITLE[p.offer] || '') + '">' + esc(offer) + '</span>' + posChip(it)) +
        td(8, engCellInner(engFor(it.idx, isHK ? 'hk' : 'uk')), 'eng-cell') +
        '<td class="qs-cell">' + qsCell(p) + '</td>' +
        '<td class="note-cell">' + (p.note ? fmtBold(p.note) : '') + '</td>' +
        '<td><a class="go2" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '">打开官网</a></td>' +
        '<td class="cmp-ops">' + cmpOps(key) + '</td></tr>';
    }
    var rows;
    if (cmpGroupPos && hasGrades()) {
      var buckets = { under: [], meet: [], over: [], none: [] };
      items.forEach(function (it) { var v = verdictFor(it.p); buckets[v ? v.kind : 'none'].push(it); });
      rows = ['under', 'meet', 'over', 'none'].map(function (k) {
        var g = buckets[k];
        if (!g.length) return '';
        return '<tr class="cmp-group"><td colspan="' + CMP_COLS_TOTAL + '">' + esc(POS_LONG[k]) +
          '<span class="cg-n">' + g.length + ' 项</span></td></tr>' + g.map(cmpRow).join('');
      }).join('');
    } else {
      rows = items.map(cmpRow).join('');
    }
    function th(i, label, extra) {
      return '<th scope="col"' + (extra || '') + (varies[i] ? ' class="diff"' : '') + '>' + label + '</th>';
    }
    var anyDiff = Object.keys(varies).some(function (k) { return varies[k]; });
    $('#compare-table').innerHTML =
      '<thead><tr>' + th(0, '大学') + th(1, '专业') + th(2, '入学') + th(3, '代码/学制') + th(4, 'A-Level') + th(5, 'IB（45 分制）') +
      th(6, '笔试 / 面试') + th(7, '成绩口径') + th(8, '英语要求') + th(9, 'QS2026 学科') + th(10, '备注') + th(11, '官网') +
      th(12, '操作') + '</tr></thead><tbody>' + rows + '</tbody>';
    updatePosSum(items);
    var note = $('#cmp-diff-note');
    if (note) {
      if (items.length > 1 && anyDiff) {
        var names = CMP_COLS.filter(function (c) { return varies[c.i]; })
          .map(function (c) { return ['', '', '', '', 'A-Level', 'IB', '笔试 / 面试', '成绩口径', '英语要求'][c.i]; });
        note.hidden = false;
        note.textContent = '底色标出的是各专业有差异的列：' + names.join('、') + '；其余列所有专业一致。';
      } else note.hidden = true;
    }
  }
  function openCompare() {
    if (!compare.size) return;
    renderCompareTable();
    renderCmpSort();
    clearTimeout(closeCompare._t);
    openCompare._back = document.activeElement;   // 关闭后把焦点还给触发它的那个按钮
    var ov = $('#compare-overlay');
    ov.hidden = false;
    void ov.offsetWidth;   // 强制重排确立初始样式，再上 show 才能触发过渡（不用 rAF：后台标签页里 rAF 不触发）
    ov.classList.add('show');
    $('#compare-close').focus();
  }
  // 对比表排序：与表头同一套比较器与方向规则
  $('#cmp-sort').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-ck]'); if (!b) return;
    var k = b.dataset.ck, dd = defaultDir(k);
    if (k === 'default') cmpSort = 'default';
    else if (cmpSort !== k) { cmpSort = k; cmpDir = dd; }
    else cmpDir = cmpDir === dd ? (dd === 'desc' ? 'asc' : 'desc') : dd;
    renderCmpSort(); renderCompareTable();
  });
  function closeCompare() {
    var ov = $('#compare-overlay');
    if (ov.hidden) return;
    ov.classList.remove('show');
    clearTimeout(closeCompare._t);
    closeCompare._t = setTimeout(function () {
      ov.hidden = true;
      var back = openCompare._back;
      if (back && back.focus && document.contains(back)) back.focus();
    }, 200);
  }

  // ── 对比清单长图 ──
  // 自己拼 SVG、再画进 canvas 导出 PNG。不引第三方库（本站要能离线用），
  // 也就不必把「把 DOM 截成图」的那套依赖带进来。SVG 里不放任何外部资源，
  // 所以 canvas 不会被污染，toDataURL 拿得到数据。
  var SHARE_W = 720, SHARE_MAX = 12;

  function svgEsc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // SVG 的 <text> 不会自动折行，只能按字宽估：中日韩全角约等于字号，拉丁约 0.55 字号
  function textW(s, size) {
    var w = 0;
    for (var i = 0; i < s.length; i++) w += s.charCodeAt(i) > 0x2e80 ? size : size * 0.55;
    return w;
  }
  function wrapText(s, maxW, size, maxLines) {
    s = String(s || '');
    var lines = [], cur = '';
    for (var i = 0; i < s.length; i++) {
      if (textW(cur + s[i], size) > maxW && cur) {
        lines.push(cur);
        cur = '';
        if (lines.length === maxLines) { cur = s.slice(i); break; }
      }
      cur += s[i];
    }
    if (cur) lines.push(cur);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + '…';
    }
    return lines.length ? lines : [''];
  }
  function svgText(x, y, s, size, fill, weight) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + fill + '"' +
      (weight ? ' font-weight="' + weight + '"' : '') + '>' + svgEsc(s) + '</text>';
  }
  function cmpImageSVG(items) {
    var PAD = 32, INNER = SHARE_W - PAD * 2, HEAD = 104, GAP = 13, FOOT = 58;
    var shown = items.slice(0, SHARE_MAX);
    var dropped = items.length - shown.length;

    var FIELDS = ['alevel', 'ib', 'ielts', 'cycle', 'test', 'offer', 'pos'];
    var cards = shown.map(function (it) {
      var p = it.p, s = allSchoolByKey[p.school] || {}, e = engFor(it.idx, it.rc) || {};
      var v = verdictFor(p);
      var zh = wrapText(p.zh, INNER - 54, 24, 2);
      var en = wrapText(p.en, INNER - 54, 14, 2);
      var rows = [
        ['A-Level', p.alevel || '—'],
        ['IB', p.ib || '—'],
        ['雅思', e.ielts ? ('IELTS ' + String(e.ielts).split('（')[0].trim()) : '—'],
        ['入学', cycleShort(it.rc)],
        ['笔试 / 面试', p.test || '—'],
        ['成绩口径', OFFER_ZH[p.offer] || p.offer],
        ['你的位置', v ? (POS_ZH[v.kind] + (v.padded ? '（未填科目按 A 计）' : '') +
         ' · ' + POS_LONG[v.kind].split(' · ')[1]) : '—']
      ];
      var h = 20 + zh.length * 30 + en.length * 19 + 10 + rows.length * 24 + 16;
      return { it: it, p: p, s: s, zh: zh, en: en, rows: rows, h: h };
    });

    var totalH = HEAD + cards.reduce(function (a, c) { return a + c.h + GAP; }, 0) + FOOT;
    var o = [];
    o.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + SHARE_W + '" height="' + totalH + '" viewBox="0 0 ' + SHARE_W + ' ' + totalH + '">');
    o.push('<defs><linearGradient id="h" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#1a3a68"/><stop offset="1" stop-color="#0d1524"/></linearGradient></defs>');
    o.push('<rect width="' + SHARE_W + '" height="' + totalH + '" fill="#f6f7fa"/>');

    // 页眉
    o.push('<rect width="' + SHARE_W + '" height="' + HEAD + '" fill="url(#h)"/>');
    o.push('<rect y="' + (HEAD - 4) + '" width="' + SHARE_W + '" height="4" fill="#c9a227"/>');
    o.push('<g font-family="Microsoft YaHei,PingFang SC,sans-serif">');
    o.push(svgText(PAD, 44, '英港本科录取要求 · 对比清单', 25, '#ffffff', 700));
    o.push(svgText(PAD, 74, items.length + ' 项 · 生成于 ' + todayStr() +
      (dropped ? '（图内只放前 ' + SHARE_MAX + ' 项）' : ''), 15, '#b9c7dd'));
    o.push('</g>');

    // 每一条：各自一个 <g>。SVG 是 XML，标签必须严格配对——
    // 少一个闭合就会直接在 <img> 那步 onerror，什么都看不到。
    var y = HEAD + GAP;
    cards.forEach(function (c) {
      o.push('<g font-family="Microsoft YaHei,PingFang SC,sans-serif">');
      o.push('<rect x="' + PAD + '" y="' + y + '" width="' + INNER + '" height="' + c.h + '" rx="12" fill="#ffffff" stroke="#e6e9f0"/>');
      o.push('<rect x="' + PAD + '" y="' + y + '" width="5" height="' + c.h + '" rx="2.5" fill="' + svgEsc(c.s.color || '#9aa3b8') + '"/>');
      var ty = y + 38;
      c.zh.forEach(function (ln) { o.push(svgText(PAD + 22, ty, ln, 24, '#0f1a2e', 700)); ty += 30; });
      c.en.forEach(function (ln) { o.push(svgText(PAD + 22, ty, ln, 14, '#5b6577')); ty += 19; });
      ty += 10;
      c.rows.forEach(function (kv) {
        o.push(svgText(PAD + 22, ty, kv[0], 14, '#5b6577'));
        o.push(svgText(PAD + 130, ty, wrapText(kv[1], INNER - 150, 15, 1)[0], 15, '#0f1a2e', 600));
        ty += 24;
      });
      o.push('</g>');
      y += c.h + GAP;
    });

    // 页脚
    o.push('<g font-family="Microsoft YaHei,PingFang SC,sans-serif">');
    o.push(svgText(PAD, y + 24, '数据来源：各大学官网公开信息（核对 2026-09），仅供参考，以官网为准', 13, '#8f9cb0'));
    o.push(svgText(PAD, y + 44, 'mtennnn.cn · 本科录取要求速查', 13, '#16325c', 700));
    o.push('</g></svg>');
    return o.join('');
  }
  function todayStr() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  // SVG → PNG：先 base64 成 data URI 喂给 Image，再按 2 倍画到 canvas（手机上不糊）
  function downloadSVGImage(svg, fname) {
    var url = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    var img = new Image();
    img.onload = function () {
      var SCALE = 2;
      var cv = document.createElement('canvas');
      cv.width = img.width * SCALE;
      cv.height = img.height * SCALE;
      var g = cv.getContext('2d');
      g.fillStyle = '#ffffff';
      g.fillRect(0, 0, cv.width, cv.height);
      g.drawImage(img, 0, 0, cv.width, cv.height);
      cv.toBlob(function (blob) {
        if (!blob) { showToast('导出长图失败，请换个浏览器试试', 4000); return; }
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fname;
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
        showToast('已导出对比长图：' + fname, 4200);
      }, 'image/png');
    };
    img.onerror = function () { showToast('导出长图失败，请换个浏览器试试', 4000); };
    img.src = url;
  }
  // ── 导出 CSV：范围（当前筛选 / 本板块全部 / 对比清单）+ 列 可选 ──
  function curRc() { return cur === REGIONS.hk ? 'hk' : 'uk'; }
  // 先把每条记录摊平成字段对象，列定义只负责挑字段——加列/减列不用改渲染
  function csvRowOf(it) {
    var p = it.p, reg = REGIONS[it.rc];
    var e = engFor(it.idx, it.rc) || {}, sch = allSchoolByKey[p.school] || {};
    return {
      sys: reg.name, uni: sch.zh || '', sch: sch.en || '',
      cycle: reg.year + '（' + reg.cycle + '）',
      pos: posText(p),
      checked: sch.checked || '',
      dirs: p.dirs.map(function (d) { return reg.dirs[d].zh; }).join('、'),
      zh: p.zh, en: p.en, degree: p.degree, alevel: p.alevel,
      alevelNote: p.alevelNote || '', ib: p.ib || '', test: p.test || '—',
      offer: OFFER_ZH[p.offer] || p.offer,
      ielts: e.ielts || '', toeflOld: e.toeflOld || '', toeflNew: e.toeflNew || '',
      gcse: e.gcse || '', igcseESL: e.igcseESL || '', ibEng: e.ibEnglish || '', gceEng: e.gceEnglish || '',
      engTag: e.tag || '',
      qs: qsListFor(p).map(function (x) { return (QS_SUBJECT_ZH[x.sub] || x.sub) + ' #' + rankText(x.rank); }).join('；') || '—',
      note: p.note || '', url: p.url
    };
  }
  var CSV_COLS = [
    { k: 'sys', h: '体系', base: 1 }, { k: 'uni', h: '大学', base: 1 }, { k: 'sch', h: 'School', base: 1 },
    { k: 'cycle', h: '入学 / 申请季', base: 1 }, { k: 'pos', h: '你的位置（冲刺/匹配/保底）' }, { k: 'checked', h: '核对' },
    { k: 'dirs', h: '学科方向', base: 1 }, { k: 'zh', h: '专业（中文）', base: 1 }, { k: 'en', h: '专业（英文）', base: 1 },
    { k: 'degree', h: '代码/学制', base: 1 }, { k: 'alevel', h: 'A-Level', base: 1 }, { k: 'alevelNote', h: '科目/要求', base: 1 },
    { k: 'ib', h: 'IB', base: 1 }, { k: 'test', h: '笔试 / 面试', base: 1 }, { k: 'offer', h: '成绩口径', base: 1 },
    { k: 'ielts', h: '英语-IELTS' }, { k: 'toeflOld', h: '英语-TOEFL旧' }, { k: 'toeflNew', h: '英语-TOEFL新' },
    { k: 'gcse', h: '英语-GCSE' }, { k: 'igcseESL', h: '英语-IGCSE-ESL' }, { k: 'ibEng', h: '英语-IB' },
    { k: 'gceEng', h: '英语-GCE' }, { k: 'engTag', h: '英语口径' },
    { k: 'qs', h: 'QS2026 学科排名', base: 1 }, { k: 'note', h: '备注', base: 1 }, { k: 'url', h: '官网链接', base: 1 }
  ];
  var COL_STORE = 'ukapply.csvcols.v1';
  var csvCols = {};
  CSV_COLS.forEach(function (c) { csvCols[c.k] = true; });
  try {
    var savedCols = JSON.parse(localStorage.getItem(COL_STORE) || 'null');
    if (savedCols && typeof savedCols === 'object') {
      CSV_COLS.forEach(function (c) { if (c.k in savedCols) csvCols[c.k] = !!savedCols[c.k]; });
    }
  } catch (e) {}
  function saveCols() { try { localStorage.setItem(COL_STORE, JSON.stringify(csvCols)); } catch (e) {} }

  var epScope = 'filtered';
  function scopeItems() {
    if (epScope === 'all') return cur.programs.map(function (p, i) { return { p: p, rc: curRc(), idx: i }; });
    if (epScope === 'compare') return cmpItems();
    var rc = curRc();
    return filtered().map(function (p) { return { p: p, rc: rc, idx: cur.programs.indexOf(p) }; });
  }
  function csvText(items) {
    var cols = CSV_COLS.filter(function (c) { return csvCols[c.k]; });
    if (!cols.length) return '';
    var rows = [cols.map(function (c) { return c.h; })];
    items.forEach(function (it) {
      var r = csvRowOf(it);
      rows.push(cols.map(function (c) { return r[c.k]; }));
    });
    return rows.map(function (r) {
      return r.map(function (c) {
        c = String(c == null ? '' : c);
        return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
      }).join(',');
    }).join('\r\n');
  }
  function downloadCSV(text, fname) {
    var blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  // 导出面板：范围与列
  var EP_SCOPES = [
    { k: 'filtered', zh: '当前筛选结果' },
    { k: 'all', zh: '本板块全部' },
    { k: 'compare', zh: '对比清单' }
  ];
  function renderExportPanel() {
    var host = $('#ep-scope'); if (!host) return;
    var counts = {
      filtered: filtered().length,
      all: cur.programs.length,
      compare: compare.size
    };
    host.innerHTML = EP_SCOPES.map(function (s) {
      var on = epScope === s.k;
      return '<button type="button" class="ep-btn' + (on ? ' on' : '') + '" data-scope="' + s.k + '"' +
        (counts[s.k] ? '' : ' title="该项当前没有条目"') + '>' + esc(s.zh) +
        '<span class="ep-n">' + counts[s.k] + '</span></button>';
    }).join('');
    var cols = $('#ep-cols');
    cols.innerHTML = CSV_COLS.map(function (c) {
      return '<label class="ep-col"><input type="checkbox" data-col="' + c.k + '"' +
        (csvCols[c.k] ? ' checked' : '') + '><span>' + esc(c.h) + '</span></label>';
    }).join('');
    var n = CSV_COLS.filter(function (c) { return csvCols[c.k]; }).length;
    $('#ep-hint').textContent = (counts[epScope] || 0) + ' 行 × ' + n + ' 列';
  }
  function openExportPanel(open) {
    var panel = $('#export-panel');
    panel.hidden = !open;
    $('#export').setAttribute('aria-expanded', String(open));
    if (open) renderExportPanel();
  }
  $('#export').addEventListener('click', function () { openExportPanel($('#export-panel').hidden); });
  $('#ep-cancel').addEventListener('click', function () { openExportPanel(false); });
  $('#ep-scope').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-scope]'); if (!b) return;
    epScope = b.dataset.scope; renderExportPanel();
  });
  $('#ep-cols').addEventListener('change', function (e) {
    var cb = e.target.closest('input[data-col]'); if (!cb) return;
    csvCols[cb.dataset.col] = cb.checked; saveCols(); renderExportPanel();
  });
  $('#ep-all').addEventListener('click', function () {
    CSV_COLS.forEach(function (c) { csvCols[c.k] = true; }); saveCols(); renderExportPanel();
  });
  $('#ep-none').addEventListener('click', function () {
    CSV_COLS.forEach(function (c) { csvCols[c.k] = !!c.base; }); saveCols(); renderExportPanel();
  });
  $('#ep-go').addEventListener('click', function () {
    var items = scopeItems().filter(function (it) { return it && it.p; });
    if (!items.length) { showToast('该范围当前没有可导出的条目'); return; }
    var cols = CSV_COLS.filter(function (c) { return csvCols[c.k]; });
    if (!cols.length) { showToast('至少要勾选一列'); return; }
    var tag = epScope === 'all' ? '全部' : epScope === 'compare' ? '对比' : '筛选';
    var fname = (curRc() === 'uk' ? 'UK_英国九校' : 'HK_香港八校') + '_' + tag + '_' + items.length + '项.csv';
    downloadCSV(csvText(items), fname);
    showToast('已导出 ' + items.length + ' 行 × ' + cols.length + ' 列：' + fname);
    openExportPanel(false);
  });
  // 制表符分隔：Excel、Notion、微信里粘出来都能各归各位（CSV 直接粘进 Excel 会挤在一列）
  function tsvText(items) {
    var cols = CSV_COLS.filter(function (c) { return csvCols[c.k]; });
    if (!cols.length) return '';
    var rows = [cols.map(function (c) { return c.h; })];
    items.forEach(function (it) {
      var r = csvRowOf(it);
      rows.push(cols.map(function (c) {
        return String(r[c.k] == null ? '' : r[c.k]).replace(/[\t\n\r]+/g, ' ');
      }));
    });
    return rows.map(function (r) { return r.join('\t'); }).join('\n');
  }
  $('#ep-copy').addEventListener('click', function () {
    var items = scopeItems().filter(function (it) { return it && it.p; });
    if (!items.length) { showToast('该范围当前没有可复制的条目'); return; }
    var cols = CSV_COLS.filter(function (c) { return csvCols[c.k]; });
    if (!cols.length) { showToast('至少要勾选一列'); return; }
    copyText(tsvText(items), function () {
      showToast('已复制 ' + items.length + ' 行 × ' + cols.length + ' 列，可直接粘进 Excel / Notion');
    });
  });
  // 对比弹层里的快捷导出（沿用同一套列设置）
  $('#cmp-export').addEventListener('click', function () {
    var items = cmpItems();
    if (!items.length) { showToast('对比清单是空的'); return; }
    var fname = '对比_' + items.length + '项.csv';
    downloadCSV(csvText(items), fname);
    showToast('已导出对比清单 ' + items.length + ' 行：' + fname);
  });
  // 对比清单导出长图（微信传播场景：图片比链接好发）
  $('#cmp-image').addEventListener('click', function () {
    var items = cmpItems();
    if (!items.length) { showToast('对比清单是空的'); return; }
    var btn = this;
    downloadSVGImage(cmpImageSVG(items), '对比_' + items.length + '项.png');
    flashButton(btn, '已生成 ✓');
  });
  // 清单分享：把短名单编进链接（c=校|英文名，~ 分隔），顾问点开就是同一份。
  // 刻意不做成常驻 URL——筛选条件该进 URL，30 项清单不该每次都拖着。
  var CMP_SEP = '~';
  function shortlistURL() {
    var sigs = Array.from(compare).map(function (k) {
      var p = cmpProgram(k);
      return p ? encodeURIComponent(p.school + '|' + p.en) : null;
    }).filter(Boolean);
    var base = location.href.split('#')[0];
    return base + '#' + encodeState(snapshot()) + (sigs.length ? '&c=' + sigs.join(CMP_SEP) : '');
  }
  $('#cmp-share').addEventListener('click', function () {
    var btn = this;
    if (!compare.size) { showToast('对比清单是空的'); return; }
    copyText(shortlistURL(), function () {
      flashButton(btn, '已复制 ✓');
      showToast('已复制清单链接：' + compare.size + ' 项，对方打开会看到同一份短名单');
    });
  });
  // 清单行内操作：上移 / 下移 / 移出
  $('#compare-table').addEventListener('click', function (e) {
    var mv = e.target.closest('button[data-mv]');
    if (mv) {
      if (mv.disabled) return;
      if (moveCompare(mv.dataset.key, +mv.dataset.mv)) { saveCompare(); renderCompareTable(); }
      return;
    }
    var rm = e.target.closest('button[data-rm]');
    if (!rm) return;
    compare.delete(rm.dataset.rm);
    saveCompare(); updateCompareBar(); syncCmpButtons();
    if (!compare.size) { closeCompare(); showToast('对比清单已空'); return; }
    renderCompareTable();
    showToast('已移出 1 项，还剩 ' + compare.size + ' 项');
  });
  // 按冲 / 稳 / 保分段：先把清单分好段，导出与复制清单也就自然带上了这个层次
  $('#cmp-group').addEventListener('click', function () {
    if (!hasGrades()) { showToast('先在「学生成绩」里填上 A-Level / IB，才能按冲 / 稳 / 保分组', 4200); return; }
    cmpGroupPos = !cmpGroupPos;
    this.setAttribute('aria-pressed', String(cmpGroupPos));
    this.classList.toggle('on', cmpGroupPos);
    renderCompareTable();
  });

  // ── PWA：注册 service worker，让站离线可用 ──
  // 版本号从自己的 <script src> 上取（app.js?v=9.3），只此一处维护；
  // sw.js 再从它自己的脚本地址上读出同一个版本号当缓存名。
  // 只在 https 下注册：file:// 与 http 本来就不允许 service worker。
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      var el = document.querySelector('script[src*="app.js"]');
      var m = el && el.getAttribute('src').match(/[?&]v=([\w.]+)/);
      navigator.serviceWorker.register('sw.js?v=' + (m ? m[1] : '0')).catch(function () {});
    });
  }

  // 后退 / 前进，以及手改地址栏：都把 URL 里的状态还原回界面。
  // 两个事件在「后退到另一个 hash」时会同时触发，用一个记号挡掉重复应用。
  function applyFromURL() {
    var enc = location.hash.replace(/^#/, '');
    if (enc === _lastEnc) return;
    var st = decodeState(enc);
    if (!st) return;
    _lastEnc = encodeState(st);
    applyState(st);
  }
  window.addEventListener('popstate', applyFromURL);
  window.addEventListener('hashchange', applyFromURL);

  // ── 初始化：URL 优先，其次上次的状态，最后默认 ──
  // 对比上限仍只在 CMP_MAX 一处定义；分母不再挂条上（学生只关心手上的 5 个），改放悬停说明
  $('#comparebar').title = '清单最多 ' + CMP_MAX + ' 项。UCAS 本科一般只能填 5 个志愿，建议先留 5–8 项当短名单。';
  loadCompare();                             // 对比清单也要跨会话保留；渲染前恢复，按钮状态直接就对
  loadGrades();                            // 成绩也只存本机：分享链接里不带别人的分数
  loadHistory();                             // 最近搜索（同样只在本机）
  buildSibCount();                           // 「同方向 +N」的数量（数据静态，构建一次）
  var boot = decodeState(location.hash.replace(/^#/, ''));
  if (!boot) { try { boot = decodeState(localStorage.getItem(STORE_KEY) || ''); } catch (e) { boot = null; } }
  // 清单链接：带 c= 打开时以链接里的清单为准——对方点开要看到同一份短名单，
  // 而不是和自己本地那份混在一起
  if (boot && boot.c) {
    compare.clear();
    boot.c.split('~').forEach(addCompareSig);
    saveCompare();
  }
  if (boot) applyState(boot);
  else { view = defaultView(); syncRegionChrome(); syncControlsChrome(); buildIndex(); renderManual(); renderChips(); apply(); }
  updateCompareBar();
})();
