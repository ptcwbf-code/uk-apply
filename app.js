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
  function hi(s) {
    var str = String(s == null ? '' : s);
    if (!q) return esc(str);
    var i = str.toLowerCase().indexOf(q);
    if (i < 0) return esc(str);
    return esc(str.slice(0, i)) + '<mark class="hl">' + esc(str.slice(i, i + q.length)) + '</mark>' + esc(str.slice(i + q.length));
  }
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
  function showToast(msg, ms) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { t.classList.remove('show'); }, ms || 2800);
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
    '面试': '需面试 / 附加甄选'
  };

  // ── 两个板块（数据集 + 展示口径） ──
  var REGIONS = {
    uk: {
      name: '英国九校', short: 'UK', schools: SCHOOLS, programs: PROGRAMS, dirs: DIRS,
      testVisible: true, testHead: '入学笔试',
      sub: '牛剑 · G5 · 王爱曼华 · 2027 年入学（A-level / IB / 入学笔试）'
    },
    hk: {
      name: '香港八校', short: 'HK', schools: HKSCHOOLS, programs: HKPROGRAMS, dirs: DIRS,
      testVisible: false, testHead: '面试 / 附加',
      sub: '港大 · 港中文 · 港科大 · 城大 · 理大 · 浸会 · 教育 · 岭南 —— A-Level / IB 直申（无需 DSE；2026 入学轮次口径）'
    }
  };
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

  // ══ 视图状态：URL（可分享）> localStorage（记住上次）> 默认 ══
  // 所有筛选/视图/排序改动都只经由 apply() 落盘，避免各处各自为政
  var STORE_KEY = 'ukapply.state.v1';
  // 笔试筛选取值：筛选按钮与 URL 解码共用一份，避免两处漂移
  var TEST_OPTS = [['ALL', '不限'], ['NONE', '无笔试'], ['YES', '需笔试'], ['ESAT', 'ESAT'], ['TMUA', 'TMUA'], ['TARA', 'TARA'], ['STEP', 'STEP'], ['UCAT', 'UCAT']];
  var TEST_KEYS = TEST_OPTS.map(function (t) { return t[0]; });

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
    if (st.v !== 'table') p.set('v', st.v);
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
      t: TEST_KEYS.indexOf(p.get('t')) >= 0 ? p.get('t') : 'ALL',
      g: p.get('g') === 'dir' ? 'dir' : 'school',
      v: p.get('v') === 'card' ? 'card' : 'table',
      q: p.get('q') || '',
      o: SORT_KEYS[p.get('o')] ? p.get('o') : 'default',
      od: p.get('od') === 'asc' ? 'asc' : p.get('od') === 'desc' ? 'desc' : null
    };
  }
  function persistState() {
    var enc = encodeState(snapshot());
    try { localStorage.setItem(STORE_KEY, enc); } catch (e) { /* 隐私模式 / 沙箱下忽略 */ }
    try {
      var now = location.hash.replace(/^#/, '');
      if (now !== enc) history.replaceState(null, '', enc ? '#' + enc : location.href.split('#')[0]);
    } catch (e) { /* file:// 下 replaceState 可能被拒；地址栏不更新，但 localStorage 已记住 */ }
  }
  // 板块相关的界面（页签 / 说明 / 统计）——切换板块与从状态恢复共用
  function syncRegionChrome() {
    var isHK = cur === REGIONS.hk;
    document.body.classList.toggle('region-hk', isHK);
    $('#tab-uk').setAttribute('aria-selected', String(!isHK));
    $('#tab-hk').setAttribute('aria-selected', String(isHK));
    $('#region-desc').textContent = cur.sub;
    $('#stat-schools').textContent = cur.schools.length;
    $('#stat-programs').textContent = cur.programs.length;
  }
  // 控件回填（搜索框 / 分组 / 视图按钮）——重置、切换板块、从状态恢复共用
  function syncControlsChrome() {
    $('#q').value = q;
    $('#groupby').value = groupBy;
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
    testSel = st.t; groupBy = st.g; view = st.v; q = st.q; sortKey = st.o;
    sortDir = st.od || defaultDir(sortKey);
    syncRegionChrome(); syncControlsChrome();
    buildIndex(); renderManual(); renderChips(); apply();
  }

  // ══ 排序 ══
  // 把 A-Level 字符串折成一个可比较的分数：A*=4 / A=3 / B=2 / C=1 / D=0 / E=-1，取平均
  // （取平均而非求和，避免「要求 4 门」被误判成「更难」；区间取较高一端；折不出分数的排最后）
  var GRADE_VAL = { 'A*': 4, A: 3, B: 2, C: 1, D: 0, E: -1 };
  function gradeScore(s) {
    if (!s) return null;
    var t = String(s)
      // 先剔掉「A-Level / AL / IAL / ASL」这类资历名——否则 "3 AL" 会被读成「3 个 A」
      .replace(/A[\s-]?L(?:evel)?s?/gi, ' ').replace(/A[\s-]?S[\s-]?L/gi, ' ')
      .split(/[–—~]|\s*\/\s*/)[0];                    // 区间 / 并列写法一律取第一段
    var re = /(\d+)\s*([A-E])(\*)?|([A-E])(\*)?/g, m, total = 0, n = 0;
    while ((m = re.exec(t))) {
      var v = m[1] ? GRADE_VAL[m[2] + (m[3] || '')] : GRADE_VAL[m[4] + (m[5] || '')];
      if (v === undefined) continue;
      var cnt = m[1] ? +m[1] : 1;
      total += cnt * v; n += cnt;
    }
    return n ? total / n : null;
  }
  function ibScore(s) { var m = String(s || '').match(/\d+/); return m ? +m[0] : null; }
  // QS 存成负名次：这样「降序」对所有键都等于「从好/从高到低」，方向语义统一
  function qsScore(p) { var l = qsListFor(p); return l.length ? -rankNum(l[0].rank) : null; }
  var SORT_KEYS = { name: 1, alevel: 1, ib: 1, qs: 1 };
  function defaultDir(k) { return k === 'name' ? 'asc' : 'desc'; }
  var SORT_TITLE = {
    name: '按专业名排序',
    alevel: '按 A-Level 要求排序：A*=4 / A=3 / B=2 / C=1 / D=0 / E=-1 取平均（不看科目难易，只看等级本身）；区间取较高一端，折不出分数的排在最后',
    ib: '按 IB 总分要求排序；区间取较高一端',
    qs: '按 QS2026 最好名次排序（名次数字越小越靠前）'
  };
  // pairs: [{p, idx}] —— 排序后仍要保持 p 与 idx 对应
  function sortPairs(pairs, key, dir) {
    var sign = dir === 'asc' ? 1 : -1;
    return pairs.slice().sort(function (a, b) {
      if (key === 'name') return sign * String(a.p.zh).localeCompare(String(b.p.zh), 'zh-Hans-CN');
      var va = key === 'alevel' ? gradeScore(a.p.alevel) : key === 'ib' ? ibScore(a.p.ib) : qsScore(a.p);
      var vb = key === 'alevel' ? gradeScore(b.p.alevel) : key === 'ib' ? ibScore(b.p.ib) : qsScore(b.p);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;      // 折不出分数的恒排最后，不受升降序影响
      if (vb == null) return -1;
      return sign * (va - vb);
    });
  }
  // 排序状态常驻提示：表头可能已被滚出视野，这里保证随时看得到、点得到（点一下取消）
  var SORT_LABEL = { name: '专业名', alevel: 'A-Level', ib: 'IB', qs: 'QS 名次' };
  function dirWord(k, d) {
    if (k === 'name') return d === 'asc' ? 'A → Z' : 'Z → A';
    if (k === 'qs') return d === 'desc' ? '名次好 → 差' : '名次差 → 好';
    return d === 'desc' ? '高 → 低' : '低 → 高';
  }
  function renderSortChip() {
    var chip = $('#sort-chip'); if (!chip) return;
    if (sortKey === 'default') { chip.hidden = true; return; }
    chip.hidden = false;
    chip.textContent = '排序：' + SORT_LABEL[sortKey] + ' ' + dirWord(sortKey, sortDir) + ' ✕';
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
  function prefersReduced() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

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
        '一个专业对应的学科榜由其**学科方向**决定（如「工程」对应机械 / 电子电气 / 土木 / 化工四个榜）；表内**全部列出**（按名次优先后排列，最多 9 个）。',
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
        '一个专业对应的学科榜由其**学科方向**决定（如「人文·语言」对应历史 / 英语 / 现代语言 / 语言学 / 哲学）；表内**全部列出**（按名次优先后排列，最多 9 个）。',
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
  function buildIndex() {
    schoolByKey = {}; schoolCount = {}; dirCount = {};
    cur.schools.forEach(function (s) { schoolByKey[s.key] = s; });
    cur.programs.forEach(function (p) {
      schoolCount[p.school] = (schoolCount[p.school] || 0) + 1;
      p.dirs.forEach(function (d) { dirCount[d] = (dirCount[d] || 0) + 1; });
    });
    engByRegion.uk = engBuildFor(REGIONS.uk);
    engByRegion.hk = engBuildFor(REGIONS.hk);
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
        note: rec.extra || '', rule: rule
      };
    }
    return {
      scope: 'school', tag: '校级', band: '',
      ielts: rule.ielts, toeflOld: rule.toeflOld, toeflNew: rule.toeflNew,
      gcse: rule.gcse, igcseEFL: rule.igcseEFL, igcseESL: rule.igcseESL, ibEnglish: rule.ibEnglish, gceEnglish: rule.gceEnglish,
      eslFlag: rule.eslFlag || 'unknown', eslGrade: '',
      note: rule.note || '', rule: rule
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
      ['来源', rule.url || '']
    ].filter(function (kv) { return kv[1]; });   // 与原实现一致：值为空则不占一行
  }
  function engValHTML(k, v) {
    return (k === '来源' && /^https?:/.test(v))
      ? '<a href="' + esc(v) + '" target="_blank" rel="noopener noreferrer">学校英语要求官方页 ↗</a>'
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
  function engCellHTML(e, rowId, label) {
    if (!e) return '<td class="eng-cell">—</td>';
    return '<td class="eng-cell">' +
      '<span class="eng-1">IELTS ' + esc(engIeltsShort(e)) + '</span>' +
      '<span class="eng-2">TOEFL ' + esc(engPair(e)) + (e.band ? ' · ' + esc(e.band) : '') + '</span>' +
      engChipTags(e) +
      '<span class="eng-tag' + (e.scope === 'prog' ? ' prog' : '') + '">' + esc(e.tag) + '</span>' +
      (rowId && engDetailItems(e).length ? '<button type="button" class="eng-open" data-eng="' + esc(rowId) +
        '" data-eng-label="' + esc(label || '') + '" aria-haspopup="dialog"' +
        ' title="打开英语要求详情（IELTS / TOEFL / EFL / ESL / IB / GCE）">详情</button>' : '') +
      '</td>';
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
  function chipRows(list, isSchool) {
    return list.map(function (s) {
      var on = (isSchool ? activeSchools : activeDirs).indexOf(s.key) !== -1;
      return '<button type="button" class="chip" data-k="' + s.key + '" aria-pressed="' + on + '">' +
        (isSchool ? '<span class="dot" style="--c:' + s.color + '"></span>' : '') +
        esc(s.zh) + '<span class="cnt">' + (isSchool ? (schoolCount[s.key] || 0) : dirCount[s.key] || 0) + '</span></button>';
    }).join('');
  }
  function renderChips() {
    // 只列出本板块确有专业的学科方向（英国无教育类，香港无物理以外的部分方向等）
    var dirKeys = Object.keys(cur.dirs).filter(function (d) { return (dirCount[d] || 0) > 0; });
    $('#filters-dir').innerHTML = chipRows(dirKeys.map(function (d) { return { key: d, zh: cur.dirs[d].zh }; }), false);
    $('#filters-school').innerHTML = chipRows(cur.schools, true);
    $('#filters-test').innerHTML = TEST_OPTS.map(function (t) {
      return '<button type="button" class="chip" data-k="' + t[0] + '" aria-pressed="' + (testSel === t[0]) + '"' +
        (TEST_TITLE[t[0]] ? ' title="' + TEST_TITLE[t[0]] + '"' : '') + '>' + esc(t[1]) + '</button>';
    }).join('');
  }

  // ── 过滤 ──
  function testOK(p) {
    if (!cur.testVisible || testSel === 'ALL') return true;
    if (testSel === 'NONE') return !p.test;
    if (testSel === 'YES') return !!p.test;
    return !!p.test && p.test.indexOf(testSel) !== -1;
  }
  function qText(p) {
    return (schoolByKey[p.school].zh + ' ' + schoolByKey[p.school].en + ' ' + p.zh + ' ' + p.en + ' ' +
      p.degree + ' ' + (p.alevel || '') + ' ' + (p.ib || '') + ' ' + (p.alevelNote || '') + ' ' +
      (p.note || '') + ' ' + p.dirs.map(function (d) { return cur.dirs[d].zh; }).join(' ')).toLowerCase();
  }
  function filtered() {
    return cur.programs.filter(function (p) {
      if (activeSchools.length && activeSchools.indexOf(p.school) === -1) return false;
      if (activeDirs.length && !p.dirs.some(function (d) { return activeDirs.indexOf(d) !== -1; })) return false;
      if (!testOK(p)) return false;
      if (q && qText(p).indexOf(q) === -1) return false;
      return true;
    });
  }

  // ── 通用小件 ──
  function offerBadge(p) {
    return '<span class="badge offer" title="' + esc(OFFER_TITLE[p.offer] || '') + '">' + esc(OFFER_ZH[p.offer] || p.offer) + '</span>';
  }
  function testBadge(p) {
    if (!cur.testVisible) {
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
  function qsListFor(p) {
    var sch = (typeof QS_RANKS !== 'undefined' ? QS_RANKS[p.school] : null) || {};
    var subs = [];
    if (p.qs) {
      // 显式指定该专业对应的学科榜；qs: [] 表示本站收录的学科里没有对应榜，不显示
      subs = p.qs;
    } else {
      p.dirs.forEach(function (d) {
        ((typeof QS_DIR_SUBJECTS !== 'undefined' ? QS_DIR_SUBJECTS[d] : null) || []).forEach(function (s) { subs.push(s); });
      });
    }
    var out = [], seen = {};
    subs.forEach(function (sub) {
      if (sch[sub] && !seen[sub]) { seen[sub] = 1; out.push({ sub: sub, rank: sch[sub] }); }
    });
    return out.sort(function (a, b) { return rankNum(a.rank) - rankNum(b.rank); });
  }
  function qsBadge(p) {
    var list = qsListFor(p);
    if (!list.length) return '';
    var title = list.map(function (x) { return (QS_SUBJECT_ZH[x.sub] || x.sub) + ' #' + x.rank; }).join(' · ');
    return '<span class="badge qs" title="QS 2026 学科排名（' + esc(title) + '）">QS2026 #' + esc(list[0].rank) + '</span>';
  }
  function qsCell(p) {
    var list = qsListFor(p);
    if (!list.length) return '<span class="t-qs no">—</span>';
    function row(x) {
      return '<div class="t-qs"><span class="qn">#' + esc(x.rank) + '</span>' +
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

  // ── 卡片视图 ──
  function cardHTML(p, idx, showSchool) {
    var s = schoolByKey[p.school];
    var key = cur === REGIONS.hk ? 'hk:' : 'uk:';
    var e = engFor(idx);
    return '<article class="card" style="--school:' + s.color + '">' +
      (showSchool ? '<div class="school-line">' + sealHTML(s, false) + hi(s.zh) + ' · ' + hi(s.en) + '</div>' : '') +
      '<h3><span class="zh">' + hi(p.zh) + '</span><span class="en">' + hi(p.en) + '</span></h3>' +
      '<div class="card-meta">' + esc(p.degree) + '</div>' +
      '<div class="rating">' +
        '<div><div class="k">' + 'A-Level' + '</div>' + scoreHTML(p.alevel, 'v') +
        (p.alevelNote ? '<div class="score-note">' + esc(p.alevelNote) + '</div>' : '') + '</div>' +
        '<div><div class="k">IB（45 分制）</div>' + scoreHTML(p.ib, 'v') +
        (p.ibNote ? '<div class="score-note">' + esc(p.ibNote) + '</div>' : '') + '</div>' +
      '</div>' +
      (e ? '<div class="eng-block">' +
        '<div class="eng-line"><span class="eng-k">英语</span>' +
        '<span class="eng-v">IELTS ' + esc(engIeltsShort(e)) + ' ｜ TOEFL ' + esc(engPair(e)) + '</span>' +
        (e.band ? '<span class="eng-band">' + esc(e.band) + '</span>' : '') +
        engChipTags(e) +
        '<span class="eng-tag' + (e.scope === 'prog' ? ' prog' : '') + '">' + esc(e.tag) + '</span></div>' +
        engDetailHTML(e) + '</div>' : '') +
      '<div class="badges">' + offerBadge(p) + testBadge(p) + qsBadge(p) + cmpButton(key + idx) + cmpSibButton(cur === REGIONS.hk ? 'hk' : 'uk', p, key + idx) + '</div>' +
      (p.note ? '<p class="card-note">' + fmtBold(p.note) + '</p>' : '') +
      '<a class="go" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '">打开官网</a>' +
    '</article>';
  }
  function cardGroupHTML(items, idxMap, meta, showSchool, groupKey) {
    return '<section class="group" data-key="' + esc(groupKey || '') + '" style="--school:' + (meta.color || '#9aa3b8') + '">' +
      '<div class="group-head"><h2>' + esc(meta.zh) + '</h2>' + (meta.en ? '<span class="en">' + esc(meta.en) + '</span>' : '') +
      '<span class="cnt">' + items.length + ' 项</span></div>' +
      '<div class="cards">' + items.map(function (p, i) { return cardHTML(p, idxMap[i], showSchool); }).join('') + '</div></section>';
  }

  // ── 表格视图 ──
  // 可排序表头：点一下按该列排序，再点反向，第三下回到默认顺序
  function thSort(label, key) {
    var on = sortKey === key;
    var arrow = on ? (sortDir === 'desc' ? '▾' : '▴') : '⇅';
    var sortAttr = on ? ' aria-sort="' + (sortDir === 'desc' ? 'descending' : 'ascending') + '"' : '';
    return '<th scope="col" class="th-sortable"' + sortAttr + '>' +
      '<button type="button" class="th-sort' + (on ? ' on' : '') + '" data-sort="' + key + '"' +
      ' title="' + esc(SORT_TITLE[key]) + '">' + esc(label) +
      '<span class="ar" aria-hidden="true">' + arrow + '</span></button></th>';
  }
  function headHTML(items, meta) {
    var seal = sealHTML(meta, true);
    return '<div class="group-head' + (seal ? ' has-seal' : '') + '">' + seal + '<h2>' + esc(meta.zh) + '</h2>' +
      (meta.en ? '<span class="en">' + esc(meta.en) + '</span>' : '') +
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
    var rows = items.map(function (p, i) {
      var s = schoolByKey[p.school];
      var key = (cur === REGIONS.hk ? 'hk:' : 'uk:') + idxMap[i];
      var lead = showSchool
        ? '<td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + hi(s.zh) + '</span><span class="sub-line">' + hi(s.en) + '</span></td>'
        : '<td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + hi(p.zh) + '</span><span class="sub-line">' + hi(p.en) + '</span></td>';
      var testCol = p.test
        ? '<span class="t-test" title="' + (TEST_TITLE[p.test] || '') + '">' + esc(p.test) + '</span>'
        : '<span class="t-test no">—</span>';
      var e = engFor(idxMap[i]);
      // 行标识要带分组 key：按方向分组时同一专业会在多个组里各出现一次
      var rid = 'eng-' + (groupKey || 'g') + '-' + idxMap[i];
      var engCol = engCellHTML(e, rid, (showSchool ? '' : s.zh + ' · ') + p.zh);
      // 详情统一走抽屉（竖排更好读，且不受表格横向滚动影响），不再渲染行内展开行
      return '<tr>' + lead +
        (showSchool ? '<td><span class="lead-line">' + hi(p.zh) + '</span><span class="sub-line">' + hi(p.en) + '</span></td>' : '') +
        '<td>' + esc(p.degree) + '</td>' +
        '<td>' + scoreHTML(p.alevel, 'g') + (p.alevelNote ? '<div class="gn">' + esc(p.alevelNote) + '</div>' : '') + '</td>' +
        '<td>' + scoreHTML(p.ib, 'g g-ib') + '</td>' +
        '<td>' + testCol + '</td>' +
        '<td><span class="t-offer" title="' + esc(OFFER_TITLE[p.offer] || '') + '">' + esc(OFFER_ZH[p.offer] || p.offer) + '</span></td>' +
        engCol +
        '<td class="qs-cell">' + qsCell(p) + '</td>' +
        '<td class="note-cell">' + (p.note ? fmtBold(p.note) : '') + '</td>' +
        '<td>' + cmpButton(key) + cmpSibButton(cur === REGIONS.hk ? 'hk' : 'uk', p, key) + '<a class="go2" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '">打开官网</a></td>' +
      '</tr>';
    }).join('');
    return '<section class="group" data-key="' + esc(groupKey || '') + '" style="--school:' + (meta.color || '#9aa3b8') + '">' + headHTML(items, meta) +
      '<div class="tblwrap"><table class="tbl">' + colgroupHTML(showSchool) +
      '<thead><tr>' + schoolTh + thSort('专业', 'name') + '<th scope="col">代码/学制</th>' + thSort('A-Level', 'alevel') + thSort('IB（45 分制）', 'ib') + '<th scope="col">' + testHead + '</th><th scope="col">成绩口径</th><th scope="col">英语要求</th>' + thSort('QS2026 学科', 'qs') + '<th scope="col">备注</th><th scope="col">操作</th></tr></thead>' +
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
    _syncT = setTimeout(syncTableOverflow, 150);
  }, { passive: true });

  // ── 渲染 ──
  function apply() {
    // 取用后立即复位：apply 可能因空结果提前 return，留在 false 会让后续渲染永远不淡入
    var doAnim = animate; animate = true;
    persistState();   // 所有状态改动都汇到这里，统一写 URL + localStorage
    renderSortChip();
    var list = filtered();
    renderBreakdown(list); renderLegend(list); renderJumpbar(list);   // 列表为空时会各自隐藏
    var scClear = $('#scope-clear');
    if (scClear) scClear.hidden = !(activeDirs.length || activeSchools.length || testSel !== 'ALL' || q);
    if (!list.length) {
      $('#empty').hidden = false;
      $('#groups').innerHTML = '';
      syncTableOverflow();
      $('#result-count').textContent = 0;
      $('#result-context').textContent = '';
      return;
    }
    $('#empty').hidden = true;

    // 建立全库索引 → 便于稳定 key（跨板块不串）
    var idxMap = {}; cur.programs.forEach(function (p, i) { idxMap[i] = i; });
    var showSchool = groupBy === 'dir';
    var keyOrder = groupBy === 'school' ? cur.schools.map(function (s) { return s.key; }) : Object.keys(cur.dirs);

    var out = document.createElement('div');
    keyOrder.forEach(function (k) {
      var pairs = [];
      list.forEach(function (p) {
        if (groupBy === 'school' ? p.school === k : p.dirs.indexOf(k) !== -1) {
          pairs.push({ p: p, idx: idxMap[cur.programs.indexOf(p)] });
        }
      });
      if (!pairs.length) return;
      if (sortKey !== 'default') pairs = sortPairs(pairs, sortKey, sortDir);
      var groupItems = pairs.map(function (x) { return x.p; });
      var groupIdx = pairs.map(function (x) { return x.idx; });
      var meta = groupBy === 'school' ? schoolByKey[k] : cur.dirs[k];
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
  $('#q').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); animate = false; apply(); });
  $('#view-toggle').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-v]'); if (!b || b.dataset.v === view) return;
    view = b.dataset.v;
    Array.prototype.forEach.call($('#view-toggle').children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    apply();
  });
  $('#reset').addEventListener('click', function () {
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = ''; groupBy = 'school'; view = 'table'; sortKey = 'default';
    syncControlsChrome(); renderChips(); apply();
    showToast('已重置：显示全部 ' + cur.programs.length + ' 项');
  });
  $('#scope-clear').addEventListener('click', function () {
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = '';
    syncControlsChrome(); renderChips(); apply(); showToast('已清除所选条件');
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
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = ''; groupBy = 'school'; view = 'table'; sortKey = 'default';
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
    raw.forEach(function (sig) {
      // 同名同校可能有两条（如帝国 Computing 的 MEng/BEng），按顺序各认领一条未占用的
      ['uk', 'hk'].some(function (rc) {
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
  function updateCompareBar() {
    var bar = $('#comparebar');
    if (!compare.size) {
      // 先播完收起动画再真正隐藏，避免「啪」地消失
      if (!bar.hidden) {
        bar.classList.remove('show');
        clearTimeout(updateCompareBar._t);
        updateCompareBar._t = setTimeout(function () { if (!compare.size) bar.hidden = true; }, 220);
      }
      return;
    }
    clearTimeout(updateCompareBar._t);
    var wasHidden = bar.hidden;
    bar.hidden = false;
    $('#compare-count').textContent = compare.size;
    // 只在首次出现时滑入；之后改数字不重播动画
    if (wasHidden) { void bar.offsetWidth; bar.classList.add('show'); }
  }
  $('#compare-clear').addEventListener('click', function () { compare.clear(); updateCompareBar(); syncCmpButtons(); saveCompare(); });
  $('#compare-open').addEventListener('click', openCompare);
  $('#compare-close').addEventListener('click', closeCompare);
  $('#compare-overlay').addEventListener('click', function (e) { if (e.target === $('#compare-overlay')) closeCompare(); });
  document.addEventListener('keydown', function (e) {
    // 谁在最上层就管谁：英语抽屉优先于对比弹层
    var ov = !$('#eng-sheet').hidden ? $('#eng-sheet') : (!$('#compare-overlay').hidden ? $('#compare-overlay') : null);
    if (!ov) return;
    if (e.key === 'Escape') { (ov.id === 'eng-sheet' ? closeEngSheet : closeCompare)(); return; }
    if (e.key !== 'Tab') return;
    // 焦点陷阱：Tab 只在弹层内循环，否则键盘用户会跑到被遮住的页面上
    var f = ov.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1], act = document.activeElement;
    if (e.shiftKey) {
      if (act === first || !ov.contains(act)) { e.preventDefault(); last.focus(); }
    } else if (act === last || !ov.contains(act)) { e.preventDefault(); first.focus(); }
  });
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
      // 借 sortPairs 的比较器：把整条记录塞进 idx 一并带过去
      items = sortPairs(items.map(function (x) { return { p: x.p, idx: x }; }), cmpSort, cmpDir)
        .map(function (x) { return x.idx; });
    }
    return items;
  }
  function renderCmpSort() {
    var host = $('#cmp-sort'); if (!host) return;
    host.innerHTML = '<span class="cs-label">排序</span>' +
      ['default', 'alevel', 'ib', 'qs'].map(function (k) {
        var on = cmpSort === k;
        var txt = k === 'default' ? '默认' : (SORT_LABEL[k] + (on ? (cmpDir === 'desc' ? ' ▾' : ' ▴') : ''));
        return '<button type="button" class="cs-btn' + (on ? ' on' : '') + '" data-ck="' + k + '"' +
          (k === 'default' ? '' : ' title="' + esc(SORT_TITLE[k]) + '"') + '>' + esc(txt) + '</button>';
      }).join('');
  }
  function renderCompareTable() {
    var items = cmpItems();
    // 逐列比对：全都一样的列没必要细看，把有差异的列标出来，省掉逐格对眼
    var CMP_COLS = [
      { i: 3, get: function (it) { return it.p.alevel || ''; } },
      { i: 4, get: function (it) { return it.p.ib || ''; } },
      { i: 5, get: function (it) { return it.p.test || ''; } },
      { i: 6, get: function (it) { return it.p.offer || ''; } }
    ];
    var varies = {};
    if (items.length > 1) {
      CMP_COLS.forEach(function (c) {
        var seen = {}, n = 0;
        items.forEach(function (it) { var v = c.get(it); if (!seen[v]) { seen[v] = 1; n++; } });
        varies[c.i] = n > 1;
      });
    }
    function td(i, html) { return '<td' + (varies[i] ? ' class="diff"' : '') + '>' + html + '</td>'; }
    var rows = items.map(function (it) {
      var p = it.p, isHK = it.isHK;
      var s = allSchoolByKey[p.school];
      var test = p.test ? esc(p.test) : '—';
      var offer = OFFER_ZH[p.offer] || p.offer;
      return '<tr><td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + esc(s.zh) + '</span><span class="sub-line">' + esc((isHK ? '香港' : '英国') + ' · ' + s.en) + '</span></td>' +
        '<td><span class="lead-line">' + esc(p.zh) + '</span><span class="sub-line">' + esc(p.en) + '</span></td>' +
        td(2, esc(p.degree)) +
        td(3, scoreHTML(p.alevel, 'g') + (p.alevelNote ? '<div class="gn">' + esc(p.alevelNote) + '</div>' : '')) +
        td(4, scoreHTML(p.ib, 'g g-ib')) +
        td(5, test) +
        td(6, '<span class="t-offer" title="' + esc(OFFER_TITLE[p.offer] || '') + '">' + esc(offer) + '</span>') +
        engCellHTML(engFor(it.idx, isHK ? 'hk' : 'uk')) +
        '<td class="qs-cell">' + qsCell(p) + '</td>' +
        '<td class="note-cell">' + (p.note ? fmtBold(p.note) : '') + '</td>' +
        '<td><a class="go2" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '">打开官网</a></td></tr>';
    }).join('');
    function th(i, label, extra) {
      return '<th scope="col"' + (extra || '') + (varies[i] ? ' class="diff"' : '') + '>' + label + '</th>';
    }
    var anyDiff = Object.keys(varies).some(function (k) { return varies[k]; });
    $('#compare-table').innerHTML =
      '<thead><tr>' + th(0, '大学') + th(1, '专业') + th(2, '代码/学制') + th(3, 'A-Level') + th(4, 'IB（45 分制）') +
      th(5, '笔试 / 面试') + th(6, '成绩口径') + th(7, '英语要求') + th(8, 'QS2026 学科') + th(9, '备注') + th(10, '官网') +
      '</tr></thead><tbody>' + rows + '</tbody>';
    var note = $('#cmp-diff-note');
    if (note) {
      if (items.length > 1 && anyDiff) {
        var names = CMP_COLS.filter(function (c) { return varies[c.i]; })
          .map(function (c) { return ['', '', '', 'A-Level', 'IB', '笔试 / 面试', '成绩口径'][c.i]; });
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

  // ── 导出 CSV：范围（当前筛选 / 本板块全部 / 对比清单）+ 列 可选 ──
  function curRc() { return cur === REGIONS.hk ? 'hk' : 'uk'; }
  // 先把每条记录摊平成字段对象，列定义只负责挑字段——加列/减列不用改渲染
  function csvRowOf(it) {
    var p = it.p, reg = REGIONS[it.rc];
    var e = engFor(it.idx, it.rc) || {}, sch = allSchoolByKey[p.school] || {};
    return {
      sys: reg.name, uni: sch.zh || '', sch: sch.en || '',
      dirs: p.dirs.map(function (d) { return reg.dirs[d].zh; }).join('、'),
      zh: p.zh, en: p.en, degree: p.degree, alevel: p.alevel,
      alevelNote: p.alevelNote || '', ib: p.ib || '', test: p.test || '—',
      offer: OFFER_ZH[p.offer] || p.offer,
      ielts: e.ielts || '', toeflOld: e.toeflOld || '', toeflNew: e.toeflNew || '',
      gcse: e.gcse || '', igcseESL: e.igcseESL || '', ibEng: e.ibEnglish || '', gceEng: e.gceEnglish || '',
      engTag: e.tag || '',
      qs: qsListFor(p).map(function (x) { return (QS_SUBJECT_ZH[x.sub] || x.sub) + ' #' + x.rank; }).join('；') || '—',
      note: p.note || '', url: p.url
    };
  }
  var CSV_COLS = [
    { k: 'sys', h: '体系', base: 1 }, { k: 'uni', h: '大学', base: 1 }, { k: 'sch', h: 'School', base: 1 },
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
  // 对比弹层里的快捷导出（沿用同一套列设置）
  $('#cmp-export').addEventListener('click', function () {
    var items = cmpItems();
    if (!items.length) { showToast('对比清单是空的'); return; }
    var fname = '对比_' + items.length + '项.csv';
    downloadCSV(csvText(items), fname);
    showToast('已导出对比清单 ' + items.length + ' 行：' + fname);
  });

  // 地址栏被手改 / 粘贴新链接时跟随（落盘走 replaceState，不产生历史，因此不会回环）
  window.addEventListener('hashchange', function () {
    var st = decodeState(location.hash.replace(/^#/, ''));
    if (st && encodeState(st) !== encodeState(snapshot())) applyState(st);
  });

  // ── 初始化：URL 优先，其次上次的状态，最后默认 ──
  $('#compare-max').textContent = CMP_MAX;   // 对比上限只在 CMP_MAX 一处定义，避免文案与实际不符
  loadCompare();                             // 对比清单也要跨会话保留；渲染前恢复，按钮状态直接就对
  buildSibCount();                           // 「同方向 +N」的数量（数据静态，构建一次）
  var boot = decodeState(location.hash.replace(/^#/, ''));
  if (!boot) { try { boot = decodeState(localStorage.getItem(STORE_KEY) || ''); } catch (e) { boot = null; } }
  if (boot) applyState(boot);
  else { syncRegionChrome(); syncControlsChrome(); buildIndex(); renderManual(); renderChips(); apply(); }
  updateCompareBar();
})();
