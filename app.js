/* 英国九校本科录取要求速查 — 逻辑 1.1 */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtBold(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  }
  function shortUrl(u) { return u.replace(/^https?:\/\//, '').replace(/\/$/, ''); }
  function showToast(msg) {
    var t = $('#toast'); if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }
  function hasScope() { return !!(activeDirs.length || activeSchools.length || testSel !== 'ALL' || q); }
  function clearConditions() {
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = '';
    $('#q').value = '';
    renderChips(); apply();
  }

  var OFFER_ZH = { typical: '典型条件', min: '最低要求', range: '录取区间', college: '学院制最低', standard: '标准要求' };
  var OFFER_TITLE = {
    typical: '典型条件（typical）· 多数获得条件录取者的水平，并非最低分',
    min: '最低要求（minimum）· 部分大学（如帝国理工）公布的最低录取条件',
    range: '录取区间（range）· 爱丁堡公布近年实际发出 offer 的成绩区间（from X to Y）',
    college: '学院制最低（college）· 剑桥多数学院的最低 offer 水平，最终条件由各学院发出',
    standard: '标准要求（standard）· 牛津课程页公布的标准入学条件'
  };
  var TEST_TITLE = {
    ESAT: 'Engineering and Science Admissions Test（工程与科学入学测试）',
    TMUA: 'Test of Mathematics for University Admission（大学入学数学测试）',
    TARA: 'Test of Academic Reasoning for Admissions（入学学术推理测试）',
    STEP: 'Sixth Term Examination Paper（剑桥数学录取后测试）',
    UCAT: 'University Clinical Aptitude Test（医学院临床能力测试）'
  };

  var schoolByKey = {}; SCHOOLS.forEach(function (s) { schoolByKey[s.key] = s; });

  var schoolCount = {}, dirCount = {};
  PROGRAMS.forEach(function (p) {
    schoolCount[p.school] = (schoolCount[p.school] || 0) + 1;
    p.dirs.forEach(function (d) { dirCount[d] = (dirCount[d] || 0) + 1; });
  });

  // 状态：空集合 = 不限
  var activeSchools = [];
  var activeDirs = [];
  var testSel = 'ALL';   // ALL | NONE | YES | ESAT | TMUA | TARA | STEP | UCAT
  var groupBy = 'school';
  var view = 'table';    // table | card
  var q = '';

  var TEST_OPTIONS = [['ALL', '不限'], ['NONE', '无笔试'], ['YES', '需笔试'], ['ESAT', 'ESAT'], ['TMUA', 'TMUA'], ['TARA', 'TARA'], ['STEP', 'STEP'], ['UCAT', 'UCAT']];

  // ── 术语与口径说明 ──
  var MANUAL = [
    { t: '录取条件的公开口径', items: [
      '**典型条件（typical）**：大学公布的“典型录取水平”，为多数获得条件录取者的成绩，并非最低线。',
      '**最低要求（minimum）**：部分大学（如帝国理工）同时公布最低与典型两级，本表在“口径”列分别标注。',
      '**录取区间（range）**：爱丁堡公布近年实际发出 offer 的成绩区间（from X to Y），反映实际竞争水平。',
      '**学院制最低（college）**：剑桥课程页所列为“多数学院的最低 offer 水平”；最终条件由各学院发出，部分学院更高，实际录取者普遍达 A*A*A* / IB 43 以上。',
      '**降档政策（contextual offer）**：面向英国特定家庭背景申请者的降分条件；中国申请人一般以标准条件评估。'
    ]},
    { t: '入学笔试（2027 Entry）', items: [
      '**ESAT**：工程与科学入学测试。适用于剑桥自然科学/工程/化工与生物技术、帝国工科、UCL 电子电气、牛津物理/生物医学/工程科学等；申请阶段参加。',
      '**TMUA**：大学入学数学测试。适用于剑桥经济学/计算机、牛津计算机/数学、帝国计算机/数学/EFDS、UCL 经济学、LSE 数学统计类等；申请阶段参加。',
      '**TARA**：入学学术推理测试。适用于 UCL 计算机系及牛津经济与管理。',
      '**STEP**：剑桥数学专业的录取后测试（offer 条件），须达到 grade 1。',
      '**UCAT**：医学院入学测试（剑桥医学）。',
      '2027 年主要调整：牛津物理改考 ESAT，牛津计算机与数学改考 TMUA，牛津经济与管理考 TARA；UCL 经济学考 TMUA、计算机系考 TARA；LSE 经济学与计量经济自 2026 年起必考 TMUA。'
    ]},
    { t: '课程归属与专业命名说明', items: [
      '**剑桥**：生物、化学、物理未分设课程，统一在 Natural Sciences（申请时选择 Biological / Physical 方向）；统计学并入 Mathematics。',
      '**牛津**：统计学未单独设学位，并入 Mathematics（联合数学与统计路线）；管理与金融仅在 Economics and Management 中。',
      '**LSE**：社科类院校，无物理、工程、生化类课程；未设独立 Statistics 学位。',
      '**帝国理工**：无独立“Biology”及纯经济/金融/管理学位（商科对应 Economics, Finance and Data Science）。',
      '**曼大（2027）**：未设独立 Data Science 学位，亦无以“BSc”命名的 Accounting and Finance。',
      '**爱丁堡 / 华威**：统计学分别并入 Mathematics and Statistics（爱丁堡）与 MORSE（华威）。'
    ]},
    { t: '学制与学位', items: [
      '苏格兰大学（爱丁堡）本科通常为四年制；经济、商科、会计授予 MA (Hons)，属本科荣誉学位而非硕士。',
      'MEng、MSci、MMath、MBiochem 等学位为本科阶段直接申请的本硕贯通课程。',
      '爱丁堡工程 BEng (Hons) 为三年或四年，成绩合格者可直入二年级、三年完成。'
    ]},
    { t: '检索与使用建议', items: [
      '建议先按学科方向筛选，再通过“分组方式=按大学”横向比较同一方向各校要求。',
      '“导出当前结果”将当前筛选结果导出为 CSV（含官网链接列），可用 Excel 建立学生申请台账。',
      '转交学生核对时，请以各校官网当年页面为准；本表核对时间为 2026 年 9 月。'
    ]}
  ];

  (function renderManual() {
    var host = $('#manual-body');
    host.innerHTML = MANUAL.map(function (sec) {
      return '<section><h3>' + esc(sec.t) + '</h3><ul>' +
        sec.items.map(function (it) { return '<li>' + fmtBold(it) + '</li>'; }).join('') +
        '</ul></section>';
    }).join('');
  })();

  // ── 筛选 chips ──
  function chipsHTML(list, isSchool) {
    return list.map(function (s) {
      var on = (isSchool ? activeSchools : activeDirs).indexOf(s.key) !== -1;
      return '<button type="button" class="chip" data-k="' + s.key + '" aria-pressed="' + on + '">' +
        (isSchool ? '<span class="dot" style="--c:' + s.color + '"></span>' : '') +
        esc(s.zh) + '<span class="cnt">' + (isSchool ? (schoolCount[s.key] || 0) : dirCount[s.key]) + '</span></button>';
    }).join('');
  }
  function renderChips() {
    $('#filters-dir').innerHTML = chipsHTML(Object.keys(DIRS).map(function (d) { return { key: d, zh: DIRS[d].zh }; }), false);
    $('#filters-school').innerHTML = chipsHTML(SCHOOLS, true);
    $('#filters-test').innerHTML = TEST_OPTIONS.map(function (t) {
      return '<button type="button" class="chip" data-k="' + t[0] + '" aria-pressed="' + (testSel === t[0]) + '"' +
        (TEST_TITLE[t[0]] ? ' title="' + TEST_TITLE[t[0]] + '"' : '') + '>' + esc(t[1]) + '</button>';
    }).join('');
  }

  $('#filters-dir').addEventListener('click', onClickDir);
  $('#filters-school').addEventListener('click', onClickSchool);
  $('#filters-test').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-k]'); if (!b || b.dataset.k === testSel) return;
    testSel = b.dataset.k; renderChips(); apply();
  });
  function onClickDir(e) {
    var b = e.target.closest('button[data-k]'); if (!b) return;
    toggleSet(activeDirs, b.dataset.k); renderChips(); apply();
  }
  function onClickSchool(e) {
    var b = e.target.closest('button[data-k]'); if (!b) return;
    toggleSet(activeSchools, b.dataset.k); renderChips(); apply();
  }
  function toggleSet(arr, k) {
    var i = arr.indexOf(k);
    if (i === -1) arr.push(k); else arr.splice(i, 1);
  }

  $('#school-all').addEventListener('click', function () { activeSchools = SCHOOLS.map(function (s) { return s.key; }); renderChips(); apply(); });
  $('#school-none').addEventListener('click', function () { activeSchools = []; renderChips(); apply(); });
  $('#groupby').addEventListener('change', function (e) { groupBy = e.target.value; apply(); });
  $('#q').addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); apply(); });
  $('#view-toggle').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-v]'); if (!b || b.dataset.v === view) return;
    view = b.dataset.v;
    Array.prototype.forEach.call($('#view-toggle').children, function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    apply();
  });
  $('#reset').addEventListener('click', function () {
    var had = hasScope() || groupBy !== 'school' || view !== 'table';
    activeSchools = []; activeDirs = []; testSel = 'ALL'; q = ''; groupBy = 'school'; view = 'table';
    $('#q').value = ''; $('#groupby').value = 'school';
    Array.prototype.forEach.call($('#view-toggle').children, function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === 'table')); });
    renderChips(); apply();
    if (had) showToast('已重置：显示全部 ' + PROGRAMS.length + ' 项');
  });
  $('#scope-clear').addEventListener('click', function () {
    clearConditions();
    showToast('已清除所选条件');
  });

  // ── 过滤 ──
  function testOK(p) {
    if (testSel === 'ALL') return true;
    if (testSel === 'NONE') return !p.test;
    if (testSel === 'YES') return !!p.test;
    return !!p.test && p.test.indexOf(testSel) !== -1;
  }
  function qText(p) {
    var s = schoolByKey[p.school].zh + ' ' + schoolByKey[p.school].en + ' ' + p.zh + ' ' + p.en + ' ' +
      p.degree + ' ' + (p.alevel || '') + ' ' + (p.ib || '') + ' ' + (p.alevelNote || '') + ' ' +
      (p.note || '') + ' ' + p.dirs.map(function (d) { return DIRS[d].zh; }).join(' ');
    return s.toLowerCase();
  }
  function filtered() {
    return PROGRAMS.filter(function (p) {
      if (activeSchools.length && activeSchools.indexOf(p.school) === -1) return false;
      if (activeDirs.length && !p.dirs.some(function (d) { return activeDirs.indexOf(d) !== -1; })) return false;
      if (!testOK(p)) return false;
      if (q && qText(p).indexOf(q) === -1) return false;
      return true;
    });
  }

  // ── 视图渲染 ──
  function metaOf(k) {
    return groupBy === 'school' ? schoolByKey[k] : DIRS[k];
  }
  function groupKeys() {
    return groupBy === 'school' ? SCHOOLS.map(function (s) { return s.key; })
      : Object.keys(DIRS);
  }

  function headHTML(items, meta) {
    return '<div class="group-head"><h2>' + esc(meta.zh) + '</h2>' +
      (meta.en ? '<span class="en">' + esc(meta.en) + '</span>' : '') +
      '<span class="cnt">' + items.length + ' 项</span></div>';
  }

  // —— 卡片视图 ——
  function cardHTML(p, showSchool) {
    var s = schoolByKey[p.school];
    var t = p.test
      ? '<span class="badge test">' + esc(p.test) + '</span>'
      : '<span class="badge test no">无笔试</span>';
    return '<article class="card" style="--school:' + s.color + '">' +
      (showSchool ? '<div class="school-line">' + esc(s.zh) + ' · ' + esc(s.en) + '</div>' : '') +
      '<h3><span class="zh">' + esc(p.zh) + '</span><span class="en">' + esc(p.en) + '</span></h3>' +
      '<div class="card-meta">' + esc(p.degree) + '</div>' +
      '<div class="rating">' +
        '<div><div class="k">A-level</div><div class="v">' + esc(p.alevel) + '</div>' +
        (p.alevelNote ? '<div class="sub">' + esc(p.alevelNote) + '</div>' : '') + '</div>' +
        '<div><div class="k">IB</div><div class="v ib-v">' + esc(p.ib) + '</div>' +
        (p.ibNote ? '<div class="sub">' + esc(p.ibNote) + '</div>' : '') + '</div>' +
      '</div>' +
      '<div class="badges"><span class="badge offer" title="' + esc(OFFER_TITLE[p.offer] || '') + '">' + esc(OFFER_ZH[p.offer] || p.offer) + '</span>' + t + '</div>' +
      (p.note ? '<p class="card-note">' + fmtBold(p.note) + '</p>' : '') +
      '<a class="go" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '" aria-label="打开' + esc(schoolByKey[p.school].zh + p.zh) + '官网课程页">打开官网</a>' +
    '</article>';
  }

  function cardGroupHTML(items, meta, showSchool) {
    return '<section class="group" style="--school:' + (meta.color || '#9aa3b8') + '">' +
      headHTML(items, meta) +
      '<div class="cards">' + items.map(function (p) { return cardHTML(p, showSchool); }).join('') + '</div></section>';
  }

  // —— 表格视图 ——
  function tableGroupHTML(items, meta, showSchool) {
    var cols = showSchool
      ? '<colgroup><col style="width:110px"><col style="width:230px"><col style="width:150px"><col style="width:150px"><col style="width:170px"><col style="width:110px"><col style="width:80px"><col><col style="width:120px"></colgroup>'
      : '<colgroup><col style="width:250px"><col style="width:150px"><col style="width:150px"><col style="width:170px"><col style="width:110px"><col style="width:80px"><col><col style="width:120px"></colgroup>';
    var thead = showSchool
      ? '<thead><tr><th scope="col">大学</th><th scope="col">专业</th><th scope="col">学位 / 学制</th><th scope="col">A-level</th><th scope="col">IB</th><th scope="col">入学笔试</th><th scope="col">成绩口径</th><th scope="col">备注</th><th scope="col">官网</th></tr></thead>'
      : '<thead><tr><th scope="col">专业</th><th scope="col">学位 / 学制</th><th scope="col">A-level</th><th scope="col">IB</th><th scope="col">入学笔试</th><th scope="col">成绩口径</th><th scope="col">备注</th><th scope="col">官网</th></tr></thead>';
    var rows = items.map(function (p) {
      var s = schoolByKey[p.school];
      var lead = showSchool
        ? '<td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + esc(s.zh) + '</span><span class="sub-line">' + esc(s.en) + '</span></td>'
        : '<td style="border-left:3px solid ' + s.color + '"><span class="lead-line">' + esc(p.zh) + '</span><span class="sub-line">' + esc(p.en) + '</span></td>';
      var name = showSchool
        ? '<td><span class="lead-line">' + esc(p.zh) + '</span><span class="sub-line">' + esc(p.en) + '</span></td>'
        : '';
      var testCol = p.test
        ? '<span class="t-test" title="' + (TEST_TITLE[p.test] || '') + '">' + esc(p.test) + '</span>'
        : '<span class="t-test no">—</span>';
      return '<tr>' + lead + name +
        '<td>' + esc(p.degree) + '</td>' +
        '<td><span class="g">' + esc(p.alevel) + '</span>' + (p.alevelNote ? '<div class="gn">' + esc(p.alevelNote) + '</div>' : '') + '</td>' +
        '<td><span class="g g-ib">' + esc(p.ib) + '</span></td>' +
        '<td>' + testCol + '</td>' +
        '<td><span class="t-offer" title="' + esc(OFFER_TITLE[p.offer] || '') + '">' + esc(OFFER_ZH[p.offer] || p.offer) + '</span></td>' +
        '<td class="note-cell">' + (p.note ? fmtBold(p.note) : '') + '</td>' +
        '<td><a class="go2" href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer" title="' + esc(p.url) + '" aria-label="打开' + esc(schoolByKey[p.school].zh + p.zh) + '官网课程页">打开官网</a></td>' +
      '</tr>';
    }).join('');
    return '<section class="group" style="--school:' + (meta.color || '#9aa3b8') + '">' +
      headHTML(items, meta) +
      '<div class="tblwrap"><table class="tbl">' + cols + thead + '<tbody>' + rows + '</tbody></table></div></section>';
  }

  function apply() {
    var list = filtered();
    var out = document.createElement('div');
    var showSchool = groupBy === 'dir'; // 按方向分组时在行内标注大学
    var scClear = $('#scope-clear');
    if (scClear) scClear.hidden = !hasScope();

    if (!list.length) {
      $('#empty').hidden = false;
      $('#groups').innerHTML = '';
      var ss = activeSchools.length ? activeSchools : SCHOOLS.map(function (s) { return s.key; });
      $('#empty-gaps').innerHTML = ss.map(function (k) {
        return '<strong>' + esc(schoolByKey[k].zh) + '</strong>：' + esc(SCHOOL_GAPS[k]);
      }).join('<br>');
      $('#result-count').textContent = 0;
      $('#result-context').textContent = '';
      return;
    }

    $('#empty').hidden = true;
    groupKeys().forEach(function (k) {
      var items = list.filter(function (p) {
        return groupBy === 'school' ? p.school === k : p.dirs.indexOf(k) !== -1;
      });
      if (!items.length) return;
      out.insertAdjacentHTML('beforeend',
        view === 'table' ? tableGroupHTML(items, metaOf(k), showSchool) : cardGroupHTML(items, metaOf(k), showSchool));
    });

    $('#groups').innerHTML = '';
    $('#groups').appendChild(out);
    $('#result-count').textContent = list.length;

    // 当前范围说明
    var scope = [];
    if (activeDirs.length) scope.push(activeDirs.map(function (d) { return DIRS[d].zh; }).join('、'));
    if (activeSchools.length) scope.push(activeSchools.map(function (k) { return schoolByKey[k].zh; }).join('、'));
    if (testSel !== 'ALL') scope.push(TEST_OPTIONS.filter(function (t) { return t[0] === testSel; })[0][1]);
    $('#result-context').textContent = scope.length ? '· 当前范围：' + scope.join(' / ') : '';
  }

  // ── 导出 CSV ──
  $('#export').addEventListener('click', function () {
    var list = filtered();
    if (!list.length) { alert('当前没有可导出的条目，请先调整筛选条件。'); return; }
    var head = ['大学', 'School', '学科方向', '专业（中文）', '专业（英文）', '学位/学制', 'A-level', 'A-level 科目要求', 'IB', '入学笔试', '成绩口径', '备注', '官网链接'];
    var rows = [head];
    list.forEach(function (p) {
      rows.push([
        schoolByKey[p.school].zh, schoolByKey[p.school].en,
        p.dirs.map(function (d) { return DIRS[d].zh; }).join('、'),
        p.zh, p.en, p.degree, p.alevel, p.alevelNote || '', p.ib,
        p.test || '无笔试', OFFER_ZH[p.offer] || p.offer, p.note || '', p.url
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
    a.href = URL.createObjectURL(blob);
    a.download = 'UK_九校条件_' + list.length + '项_2027Entry.csv';
    document.body.appendChild(a); a.click();
    showToast('已导出 ' + list.length + ' 行 CSV，文件名：UK_九校条件_' + list.length + '项_2027Entry.csv');
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  });

  // ── 初始化 ──
  $('#stat-schools').textContent = SCHOOLS.length;
  $('#stat-programs').textContent = PROGRAMS.length;
  renderChips();
  apply();
})();
