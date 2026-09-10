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
  function shortUrl(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, ''); }
  // 统一的分数渲染：主分数 + 括注（各校同款字体与层级）
  function scoreHTML(v, cls) {
    if (!v) return '<span class="' + cls + '">—</span>';
    var i = v.indexOf('（');
    if (i < 0) return '<span class="' + cls + '">' + esc(v) + '</span>';
    return '<span class="' + cls + '">' + esc(v.slice(0, i)) +
      '<span class="score-sub">' + esc(v.slice(i)) + '</span></span>';
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
  // 结果区淡入的开关：默认播放，搜索框逐字输入时关掉，避免每敲一个字都闪一下
  var animate = true;

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
      { t: 'QS 学科排名（参考）', items: [
        '表内「QS2026 学科」列与卡片上的「QS2026 #N」标签，来自 **QS World University Rankings by Subject 2026**（各校在该学科的名次；含并列 "=4" 与区间 "51–100"）。',
        '一个专业对应的学科榜由其**学科方向**决定（如「工程」对应机械 / 电子电气 / 土木 / 化工四个榜）；表内最多列 3 个（按名次优先后排列），其余点「另 N 项」展开查看（点开即可，触屏同样可用）。',
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
      { t: 'QS 学科排名（参考）', items: [
        '表内「QS2026 学科」列与卡片上的「QS2026 #N」标签，来自 **QS World University Rankings by Subject 2026**。',
        '港校强项举例：**港大牙医 #2、KCL 牙医 #5；港中文护理 =6、KCL 护理 #2、曼大护理 =10；港大数据科学与AI #18、港科大 #25、港中文 #28**。',
        '一个专业对应的学科榜由其**学科方向**决定（如「人文·语言」对应历史 / 英语 / 现代语言 / 语言学 / 哲学）；表内最多列 3 个（按名次优先后排列），其余点「另 N 项」展开查看（点开即可，触屏同样可用）。',
        '「—」表示本站收录的学科里**没有**与该专业对应的榜，或该校在该学科**未进入前 200 名**（本站只收录前 200 名；200 名之后为区间段，未收录，不代表该校完全未上榜）。',
        '排名反映的是研究声誉与产出，与本科录取难度**不是同一回事**，仅作选校参考。'
      ]}
    ]
  };

  // ── 数据集索引 ──
  var schoolByKey = {}, schoolCount = {}, dirCount = {};
  function buildIndex() {
    schoolByKey = {}; schoolCount = {}; dirCount = {};
    cur.schools.forEach(function (s) { schoolByKey[s.key] = s; });
    cur.programs.forEach(function (p) {
      schoolCount[p.school] = (schoolCount[p.school] || 0) + 1;
      p.dirs.forEach(function (d) { dirCount[d] = (dirCount[d] || 0) + 1; });
    });
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
    var tests = [['ALL', '不限'], ['NONE', '无笔试'], ['YES', '需笔试'], ['ESAT', 'ESAT'], ['TMUA', 'TMUA'], ['TARA', 'TARA'], ['STEP', 'STEP'], ['UCAT', 'UCAT']];
    $('#filters-test').innerHTML = tests.map(function (t) {
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
    var show = list.slice(0, 3);
    var html = show.map(row).join('');
    if (list.length > show.length) {
      // 剩余学科用可点开的 details 展开（触屏可用、不依赖悬停）
      html += '<details class="qs-more"><summary>另 ' + (list.length - show.length) + ' 项</summary>' +
        list.slice(show.length).map(row).join('') + '</details>';
    }
    return html;
  }

  // ── 卡片视图 ──
  function cardHTML(p, idx, showSchool) {
    var s = schoolByKey[p.school];
    var key = cur === REGIONS.hk ? 'hk:' : 'uk:';
    return '<article class="card" style="--school:' + s.color + '">' +
      (showSchool ? '<div class="school-line">' + esc(s.zh) + ' · ' + esc(s.en) + '</div>' : '') +
      '<h3><span class="zh">' + esc(p.zh) + '</span><span class="en">' + esc(p.en) + '</span></h3>' +
      '<div class="card-meta">' + esc(p.degree) + '</div>' +
      '<div class="rating">' +
        '<div><div class="k">' + 'A-Level' + '</div>' + scoreHTML(p.alevel, 'v') +
        (p.alevelNote ? '<div class="score-note">' + esc(p.alevelNote) + '</div>' : '') + '</div>' +
        '<div><div class="k">IB（45 分制）</div>' + scoreHTML(p.ib, 'v') +
        (p.ibNote ? '<div class="score-note">' + esc(p.ibNote) + '</div>' : '') + '</div>' +
      '</div>' +
      '<div class="badges">' + offerBadge(p) + testBadge(p) + qsBadge(p) + cmpButton(key + idx) + '</div>' +
      (p.note ? '<p class="card-note">' + fmtBold(p.note) + '</p>' : '') +
      '<a class="go" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '">打开官网</a>' +
    '</article>';
  }
  function cardGroupHTML(items, idxMap, meta, showSchool) {
    return '<section class="group" style="--school:' + (meta.color || '#9aa3b8') + '">' +
      '<div class="group-head"><h2>' + esc(meta.zh) + '</h2>' + (meta.en ? '<span class="en">' + esc(meta.en) + '</span>' : '') +
      '<span class="cnt">' + items.length + ' 项</span></div>' +
      '<div class="cards">' + items.map(function (p, i) { return cardHTML(p, idxMap[i], showSchool); }).join('') + '</div></section>';
  }

  // ── 表格视图 ──
  function headHTML(items, meta) {
    return '<div class="group-head"><h2>' + esc(meta.zh) + '</h2>' +
      (meta.en ? '<span class="en">' + esc(meta.en) + '</span>' : '') +
      '<span class="cnt">' + items.length + ' 项</span></div>';
  }
  function tableGroupHTML(items, idxMap, meta, showSchool) {
    var extra = showSchool ? '<colgroup><col style="width:104px"></colgroup>' : '<colgroup><col style="width:0px"></colgroup>';
    var schoolTh = showSchool ? '<th scope="col">大学</th>' : '';
    var testHead = esc(cur.testHead);
    var rows = items.map(function (p, i) {
      var s = schoolByKey[p.school];
      var key = (cur === REGIONS.hk ? 'hk:' : 'uk:') + idxMap[i];
      var lead = showSchool
        ? '<td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + esc(s.zh) + '</span><span class="sub-line">' + esc(s.en) + '</span></td>'
        : '<td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + esc(p.zh) + '</span><span class="sub-line">' + esc(p.en) + '</span></td>';
      var testCol = p.test
        ? '<span class="t-test" title="' + (TEST_TITLE[p.test] || '') + '">' + esc(p.test) + '</span>'
        : '<span class="t-test no">—</span>';
      return '<tr>' + lead +
        (showSchool ? '<td><span class="lead-line">' + esc(p.zh) + '</span><span class="sub-line">' + esc(p.en) + '</span></td>' : '') +
        '<td>' + esc(p.degree) + '</td>' +
        '<td>' + scoreHTML(p.alevel, 'g') + (p.alevelNote ? '<div class="gn">' + esc(p.alevelNote) + '</div>' : '') + '</td>' +
        '<td>' + scoreHTML(p.ib, 'g g-ib') + '</td>' +
        '<td>' + testCol + '</td>' +
        '<td><span class="t-offer" title="' + esc(OFFER_TITLE[p.offer] || '') + '">' + esc(OFFER_ZH[p.offer] || p.offer) + '</span></td>' +
        '<td class="qs-cell">' + qsCell(p) + '</td>' +
        '<td class="note-cell">' + (p.note ? fmtBold(p.note) : '') + '</td>' +
        '<td>' + cmpButton(key) + '<a class="go2" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '">打开官网</a></td>' +
      '</tr>';
    }).join('');
    return '<section class="group" style="--school:' + (meta.color || '#9aa3b8') + '">' + headHTML(items, meta) +
      '<div class="tblwrap"><table class="tbl"><colgroup><col style="width:230px"><col style="width:120px"><col style="width:150px"><col style="width:150px"><col style="width:90px"><col style="width:90px"><col style="width:150px"><col><col style="width:150px"></colgroup>' +
      '<thead><tr>' + schoolTh + '<th scope="col">专业</th><th scope="col">代码/学制</th><th scope="col">' + 'A-Level' + '</th><th scope="col">IB（45 分制）</th><th scope="col">' + testHead + '</th><th scope="col">成绩口径</th><th scope="col">QS2026 学科</th><th scope="col">备注</th><th scope="col">操作</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></section>';
  }

  // ── 渲染 ──
  function apply() {
    // 取用后立即复位：apply 可能因空结果提前 return，留在 false 会让后续渲染永远不淡入
    var doAnim = animate; animate = true;
    var list = filtered();
    var scClear = $('#scope-clear');
    if (scClear) scClear.hidden = !(activeDirs.length || activeSchools.length || testSel !== 'ALL' || q);
    if (!list.length) {
      $('#empty').hidden = false;
      $('#groups').innerHTML = '';
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
      var groupItems = [], groupIdx = [];
      list.forEach(function (p) {
        if (groupBy === 'school' ? p.school === k : p.dirs.indexOf(k) !== -1) {
          groupItems.push(p); groupIdx.push(idxMap[cur.programs.indexOf(p)]);
        }
      });
      if (!groupItems.length) return;
      var meta = groupBy === 'school' ? schoolByKey[k] : cur.dirs[k];
      out.insertAdjacentHTML('beforeend',
        view === 'table' ? tableGroupHTML(groupItems, groupIdx, meta, showSchool) : cardGroupHTML(groupItems, groupIdx, meta, showSchool));
    });

    $('#groups').innerHTML = '';
    $('#groups').appendChild(out);
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
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = ''; groupBy = 'school';
    $('#q').value = ''; $('#groupby').value = 'school';
    Array.prototype.forEach.call($('#view-toggle').children, function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === 'table')); });
    renderChips(); apply();
    showToast('已重置：显示全部 ' + cur.programs.length + ' 项');
  });
  $('#scope-clear').addEventListener('click', function () {
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = ''; $('#q').value = '';
    renderChips(); apply(); showToast('已清除所选条件');
  });

  // 区域切换
  function switchRegion(r) {
    if ((cur === REGIONS.uk && r === 'uk') || (cur === REGIONS.hk && r === 'hk')) return;
    cur = REGIONS[r];
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = ''; groupBy = 'school'; view = 'table';
    // 对比清单跨板块保留，英国学校与香港学校可放进同一张对比表
    $('#q').value = ''; $('#groupby').value = 'school';
    Array.prototype.forEach.call($('#view-toggle').children, function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === 'table')); });
    document.body.classList.toggle('region-hk', r === 'hk');
    $('#tab-uk').setAttribute('aria-selected', String(r === 'uk'));
    $('#tab-hk').setAttribute('aria-selected', String(r === 'hk'));
    $('#region-desc').textContent = cur.sub;
    $('#stat-schools').textContent = cur.schools.length;
    $('#stat-programs').textContent = cur.programs.length;
    buildIndex(); renderManual(); renderChips(); apply();
  }
  $('#tab-uk').addEventListener('click', function () { switchRegion('uk'); });
  $('#tab-hk').addEventListener('click', function () { switchRegion('hk'); });

  // ── 对比（收藏）──
  function cmpKeyParts(key) { var i = key.indexOf(':'); return { r: key.slice(0, i), idx: +key.slice(i + 1) }; }
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
  $('#compare-clear').addEventListener('click', function () { compare.clear(); updateCompareBar(); syncCmpButtons(); });
  $('#compare-open').addEventListener('click', openCompare);
  $('#compare-close').addEventListener('click', closeCompare);
  $('#compare-overlay').addEventListener('click', function (e) { if (e.target === $('#compare-overlay')) closeCompare(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#compare-overlay').hidden) closeCompare(); });
  function syncCmpButtons() {
    Array.prototype.forEach.call(document.querySelectorAll('button.cmp'), function (b) {
      var on = compare.has(b.dataset.key);
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? '已加入对比' : '加入对比';
    });
  }
  function openCompare() {
    if (!compare.size) return;
    // 逐项解析其所归属的板块，英国学校与香港学校同表并列
    var rows = Array.from(compare).map(function (key) {
      var parts = cmpKeyParts(key);
      var isHK = parts.r === 'hk';
      var p = (isHK ? REGIONS.hk : REGIONS.uk).programs[parts.idx];
      if (!p) return '';
      var s = allSchoolByKey[p.school];
      var test = p.test ? esc(p.test) : '—';
      var offer = OFFER_ZH[p.offer] || p.offer;
      return '<tr><td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + esc(s.zh) + '</span><span class="sub-line">' + esc((isHK ? '香港' : '英国') + ' · ' + s.en) + '</span></td>' +
        '<td><span class="lead-line">' + esc(p.zh) + '</span><span class="sub-line">' + esc(p.en) + '</span></td>' +
        '<td>' + esc(p.degree) + '</td>' +
        '<td>' + scoreHTML(p.alevel, 'g') + (p.alevelNote ? '<div class="gn">' + esc(p.alevelNote) + '</div>' : '') + '</td>' +
        '<td>' + scoreHTML(p.ib, 'g g-ib') + '</td>' +
        '<td>' + test + '</td><td><span class="t-offer" title="' + esc(OFFER_TITLE[p.offer] || '') + '">' + esc(offer) + '</span></td>' +
        '<td class="qs-cell">' + qsCell(p) + '</td>' +
        '<td class="note-cell">' + (p.note ? fmtBold(p.note) : '') + '</td>' +
        '<td><a class="go2" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '">打开官网</a></td></tr>';
    }).join('');
    $('#compare-table').innerHTML =
      '<thead><tr><th scope="col">大学</th><th scope="col">专业</th><th scope="col">代码/学制</th><th scope="col">' + 'A-Level' + '</th><th scope="col">IB（45 分制）</th><th scope="col">笔试 / 面试</th><th scope="col">成绩口径</th><th scope="col">QS2026 学科</th><th scope="col">备注</th><th scope="col">官网</th></tr></thead><tbody>' + rows + '</tbody>';
    clearTimeout(closeCompare._t);
    var ov = $('#compare-overlay');
    ov.hidden = false;
    void ov.offsetWidth;   // 强制重排确立初始样式，再上 show 才能触发过渡（不用 rAF：后台标签页里 rAF 不触发）
    ov.classList.add('show');
    $('#compare-close').focus();
  }
  function closeCompare() {
    var ov = $('#compare-overlay');
    if (ov.hidden) return;
    ov.classList.remove('show');
    clearTimeout(closeCompare._t);
    closeCompare._t = setTimeout(function () { ov.hidden = true; }, 200);
  }

  // ── 导出 CSV ──
  $('#export').addEventListener('click', function () {
    var list = filtered();
    if (!list.length) { alert('当前没有可导出的条目，请先调整筛选条件。'); return; }
    var head = ['体系', '大学', 'School', '学科方向', '专业（中文）', '专业（英文）', '代码/学制', cur === REGIONS.uk ? 'A-level' : 'A-Level', '科目/要求', 'IB', cur.testHead, '成绩口径', 'QS2026 学科排名', '备注', '官网链接'];
    var rows = [head];
    list.forEach(function (p) {
      rows.push([
        cur.name, schoolByKey[p.school].zh, schoolByKey[p.school].en,
        p.dirs.map(function (d) { return cur.dirs[d].zh; }).join('、'),
        p.zh, p.en, p.degree, p.alevel, p.alevelNote || '', p.ib || '',
        p.test || '—', OFFER_ZH[p.offer] || p.offer,
        qsListFor(p).map(function (x) { return (QS_SUBJECT_ZH[x.sub] || x.sub) + ' #' + x.rank; }).join('；') || '—',
        p.note || '', p.url
      ]);
    });
    var csv = rows.map(function (r) {
      return r.map(function (c) {
        c = String(c == null ? '' : c);
        return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c;
      }).join(',');
    }).join('\r\n');
    var blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    var fname = (cur === REGIONS.uk ? 'UK_英国九校' : 'HK_香港八校') + '_' + list.length + '项.csv';
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a); a.click();
    showToast('已导出 ' + list.length + ' 行 CSV：' + fname);
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  });

  // ── 初始化 ──
  $('#stat-schools').textContent = cur.schools.length;
  $('#stat-programs').textContent = cur.programs.length;
  $('#compare-max').textContent = CMP_MAX;   // 对比上限只在 CMP_MAX 一处定义，避免文案与实际不符
  buildIndex(); renderManual(); renderChips(); apply();
})();
