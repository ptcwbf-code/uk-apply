// 香港八校（港大 / 港中文 / 港科大 / 城大 / 理大 / 浸会 / 教育 / 岭南）A-Level/IB 直申数据（2026-09 核对，面向 A-Level/IB 单独申请 non-JUPAS Year 1）
// 与 data.js 相同字段结构；offer 口径：lower=港大官网参考下限 / ref=港中文参考收分区间 / ger=只公布大学通用门槛与科目要求
// 注意：港八均无需 DSE；test 字段在港八指"面试/附加甄选"（''=无特殊要求）

const HKSCHOOLS = [
  { key: 'hku',    zh: '港大',   en: 'University of Hong Kong',        group: '港八', mark: '港大', color: '#25603c' },
  { key: 'cuhk',   zh: '港中文', en: 'Chinese University of Hong Kong', group: '港八', mark: '中大', color: '#6c3a74' },
  { key: 'hkust',  zh: '港科大', en: 'Hong Kong University of Science & Tech', group: '港八', mark: '科大', color: '#1f5aa8' },
  { key: 'cityu',  zh: '城大',   en: 'City University of Hong Kong',    group: '港八', mark: '城大', color: '#b02a30' },
  { key: 'polyu',  zh: '理大',   en: 'Hong Kong Polytechnic University', group: '港八', mark: '理大', color: '#9b2f5f' },
  { key: 'hkbu',   zh: '浸会',   en: 'Hong Kong Baptist University',   group: '港八', mark: '浸会', color: '#a15c11' },
  { key: 'eduhk',  zh: '教育',   en: 'Education University of Hong Kong', group: '港八', mark: '教大', color: '#0f7a6c' },
  { key: 'lingnan', zh: '岭南',  en: 'Lingnan University',             group: '港八', mark: '岭南', color: '#8c1d40' }
];

const HKPROGRAMS = [

  // ═══════════ 香港大学 HKU（官网公布参考下限） ═══════════
  { school: 'hku', dirs: ['bio'], zh: '内外全科医学士', en: 'MBBS',
    degree: 'JS6456 · 6 年制', alevel: '4A*', ib: '43/45', test: '面试',
    alevelNote: '须含生物或化学其一', offer: 'lower', note: '面试；化学或生物须修（医学相关）',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-medicine-and-bachelor-of-surgery' },

  { school: 'hku', dirs: ['bio'], zh: '牙医学士', en: 'BDS',
    degree: 'JS6107 · 6 年制', alevel: '2A*1A', ib: '41/45', test: '面试',
    alevelNote: '生物/化学/数学(高数/纯数)三类中两科 ≥A', offer: 'lower', note: '面试强制（无 offer 通常不经面试）',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-dental-surgery' },

  { school: 'hku', dirs: ['bio'], zh: '护理学学士', en: 'BNurs',
    degree: 'JS6468 · 5 年制', alevel: '3A', ib: '32/45', test: '面试（入围）', alevelNote: '', offer: 'lower', note: '官方：入围的国际资历申请人于 2026 年 1 月 / 3 月面试',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-nursing' },

  { school: 'hku', dirs: ['bio'], zh: '药剂学学士', en: 'BPharm',
    degree: 'JS6494 · 4 年制', alevel: '3A*', ib: '37/45', test: '面试（入围）',
    alevelNote: '须化学', offer: 'lower', note: 'IB 化学 HL≥4',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-pharmacy' },

  { school: 'hku', dirs: ['bio'], zh: '生物医学学士', en: 'BBiomedSc',
    degree: 'JS6949 · 4 年制', alevel: '2A*1A', ib: '38/45', test: '面试（入围）',
    alevelNote: '生物或化学 ≥A', offer: 'lower', note: 'IB 生物/化学 HL≥6',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-biomedical-sciences' },

  { school: 'hku', dirs: ['bio', 'physics', 'stats'], zh: '理学士（理学大类：化学/生物/物理/数学主修）', en: 'BSc',
    degree: 'JS6901 · 4 年制', alevel: '1A*2A', ib: '33/45', test: '',
    alevelNote: '数学类 ≥A 且 生物/化学/物理之一 ≥A', offer: 'lower', note: '理学大类，入学后任选主修',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-science' },

  { school: 'hku', dirs: ['econ', 'stats'], zh: '量化金融（理学士）', en: 'BSc(QFin)',
    degree: 'JS6884 · 4 年制', alevel: '3A*1A', ib: '40/45', test: '面试',
    alevelNote: '数学 A* + 高数 A*', offer: 'lower', note: '商学院；IB 数学 HL≥6、英文≥6；shortlisted 面试',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-science-quantitative-finance' },

  { school: 'hku', dirs: ['econ'], zh: '经济学 / 经济与金融', en: 'BEcon / BEcon&Fin',
    degree: 'JS6767 · 4 年制', alevel: '3A', ib: '36/45', test: '',
    alevelNote: '数学类 ≥A', offer: 'lower', note: '',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-economics-bachelor-of-economics-and-finance' },

  { school: 'hku', dirs: ['econ'], zh: '国际商业及环球管理', en: 'BBA(IBGM)',
    degree: 'JS6896 · 4 年制', alevel: '3A*1A', ib: '41/45', test: '面试',
    alevelNote: '数学类一科 ≥A', offer: 'lower', note: '须读第二主修',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-business-administration-international-business-and' },

  { school: 'hku', dirs: ['econ'], zh: '金融学（资产管理及私人银行）', en: 'BFin(AMPB)',
    degree: 'JS6860 · 4 年制', alevel: '3A*', ib: '39/45', test: '',
    alevelNote: '数学类 ≥A', offer: 'lower', note: '',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-finance-asset-management-and-private-banking' },

  { school: 'hku', dirs: ['econ'], zh: '会计与金融（含会计数据分析）', en: 'BBA(Acc&Fin)/(ADA)',
    degree: 'JS6781 · 4 年制', alevel: '3A', ib: '36/45', test: '',
    alevelNote: '数学 ≥A', offer: 'lower', note: '官网 BBA(A&F) 与 BBA(ADA) 双轨',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-business-administration-accounting-and-finance' },

  { school: 'hku', dirs: ['eng'], zh: '工程学士（计算机/电机/电子工程组合）', en: 'BEng (CE/EE/EEE)',
    degree: 'JS6987 · 4 年制', alevel: '3A', ib: '34/45', test: '',
    alevelNote: '数学 ≥A 且 理科 ≥A', offer: 'lower', note: '工程分专业直招；另有土木 JS6353、机械 JS6339 等',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-engineering-computer-engineering-electrical' },

  { school: 'hku', dirs: ['cs'], zh: '计算与数据科学（港大计算旗舰）', en: 'Computing and Data Science',
    degree: 'JS6999 · 4 年制', alevel: '2A*1A', ib: '38/45', test: '',
    alevelNote: '数学类 ≥A 且 相关科 ≥A', offer: 'lower', note: '',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/computing-and-data-science' },

  { school: 'hku', dirs: ['stats'], zh: '精算学（理学士）', en: 'BSc Actuarial Science',
    degree: 'JS6729 · 4 年制', alevel: '3A*', ib: '39/45', test: '',
    alevelNote: '数学 A* + 高数 A*', offer: 'lower', note: '香港唯一获英 IFoA 认可本科精算；IB 数学 HL≥6',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-science-actuarial-science' },

  { school: 'hku', dirs: ['stats'], zh: '统计决策科学', en: 'Statistical Decision Sciences',
    degree: 'JS6779 · 4 年制', alevel: '2A*1A', ib: '39/45', test: '',
    alevelNote: '数学类 ≥A', offer: 'lower', note: '',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/statistical-decision-sciences' },

  // ── 港大 · 文科 / 社科 / 传媒方向（文学院 · 社会科学学院 · 法律学院） ──
  { school: 'hku', dirs: ['arts'], zh: '文学士（文学院）', en: 'Bachelor of Arts',
    degree: 'JS6054 · 4 年制', alevel: '3A', ib: '32/45', test: '面试（入围）',
    alevelNote: '', offer: 'lower',
    note: '文学院统一招生，首年探索，入学后可选中国语文、英文研究、翻译、历史、哲学、语言学、音乐、艺术史等主修',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-arts' },

  { school: 'hku', dirs: ['social'], zh: '社会科学学士', en: 'Bachelor of Social Sciences',
    degree: 'JS6717 · 4 年制', alevel: '3A', ib: '32/45', test: '',
    alevelNote: '', offer: 'lower',
    note: '社会科学学院统一招生，含地理、政治与公共行政、社会学、心理学、媒体等主修方向',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-social-sciences' },

  { school: 'hku', dirs: ['social'], qs: ['psychology'], zh: '心理学学士', en: 'Bachelor of Psychology',
    degree: 'JS6705 · 4 年制', alevel: '3A', ib: '35/45', test: '',
    alevelNote: '', offer: 'lower', note: '',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-psychology' },

  { school: 'hku', dirs: ['social'], qs: ['social-policy-administration'], zh: '社会工作学士', en: 'Bachelor of Social Work',
    degree: 'JS6731 · 4 年制', alevel: '3A', ib: '32/45', test: '面试（入围）',
    alevelNote: '另需参加笔试', offer: 'lower', note: '',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-social-work' },

  { school: 'hku', dirs: ['social'], qs: ['law-legal-studies'], zh: '法学士', en: 'Bachelor of Laws',
    degree: 'JS6406 · 4 年制', alevel: '3A*', ib: '40/45', test: '面试（入围）',
    alevelNote: 'IB 各科不低于 6 分', offer: 'lower', note: '优先考虑第一志愿申请人',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-laws' },

  { school: 'hku', dirs: ['media', 'cs'], zh: '新闻媒体及人工智能学士', en: 'Bachelor of Journalism, Media and Artificial Intelligence',
    degree: 'JS6822 · 4 年制', alevel: '3A', ib: '32/45', test: '面试（入围）',
    alevelNote: '录取考虑面试表现、个人陈述及预估成绩', offer: 'lower', note: '',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-journalism-media-and-artificial-intelligence' },

  { school: 'hku', dirs: ['media', 'arts'], zh: '文学士（全球创意产业）', en: 'BA in Global Creative Industries',
    degree: 'JS6274 · 4 年制', alevel: '3A', ib: '32/45', test: '面试（入围）',
    alevelNote: '', offer: 'lower', note: '',
    url: 'https://admissions.hku.hk/programmes/undergraduate-programmes/bachelor-of-arts-global-creative-industries' },

  // ═══════════ 香港中文大学 CUHK（参考收分区间） ═══════════
  { school: 'cuhk', dirs: ['bio'], zh: '内外全科医学士', en: 'MBChB',
    degree: 'JS4501 · 6 年制', alevel: 'A*A*A*A–A*A*A*A*', ib: '42–43', test: '面试',
    alevelNote: '', offer: 'ref', note: 'GCE 另需平均 UMS ≥95%（含化学/生物）；IB 须化学或生物 HL（6/7/7）',
    url: 'https://admission.cuhk.edu.hk/programme/medun/' },

  { school: 'cuhk', dirs: ['bio'], zh: '生物医学', en: 'Biomedical Sciences',
    degree: 'JS4550 · 4 年制', alevel: 'AAB–AAA', ib: '36–38', test: '', alevelNote: '', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/bmscn/' },

  { school: 'cuhk', dirs: ['bio', 'physics', 'stats'], zh: '理学大类（化学/生化/生物/物理/数学/统计主修）', en: 'Science',
    degree: 'JS4601 · 4 年制', alevel: 'ABB–AAB', ib: '33–35', test: '',
    alevelNote: '', offer: 'ref', note: '理学大类，入学后任选主修',
    url: 'https://admission.cuhk.edu.hk/programme/bscin/' },

  { school: 'cuhk', dirs: ['stats'], zh: '数学精研', en: 'Enrichment Mathematics',
    degree: 'JS4682 · 4 年制', alevel: 'AAA–A*A*A', ib: '36–38', test: '', alevelNote: '', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/mathn/' },

  { school: 'cuhk', dirs: ['econ'], zh: '环球商业', en: 'Global Business Studies',
    degree: 'JS4214 · 4 年制', alevel: 'A*A*A*A–A*A*A*A*', ib: '41–42', test: '',
    alevelNote: '', offer: 'ref', note: '商学院旗舰、全场最高档之一',
    url: 'https://admission.cuhk.edu.hk/programme/ibbac-gbs/' },

  { school: 'cuhk', dirs: ['econ'], zh: '综合工商管理', en: 'Integrated BBA (IBBA)',
    degree: 'JS4202 · 4 年制', alevel: 'ABB–AAB', ib: '33–35', test: '', alevelNote: '', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/ibbac/' },

  { school: 'cuhk', dirs: ['econ'], zh: '量化金融', en: 'Quantitative Finance',
    degree: 'JS4252 · 4 年制', alevel: 'AAA–A*A*A', ib: '38–40', test: '', alevelNote: '', offer: 'ref',
    note: '勿与 JS4276（Quantitative Finance & Risk Management Science）混淆',
    url: 'https://admission.cuhk.edu.hk/programme/qfinn/' },

  { school: 'cuhk', dirs: ['econ'], zh: '精算金融分析', en: 'Insurance, Financial & Actuarial Analysis (IFAA)',
    degree: 'JS4238 · 4 年制', alevel: 'AAA–A*A*A', ib: '38–40', test: '', alevelNote: '', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/ifaab/' },

  { school: 'cuhk', dirs: ['econ'], zh: '经济学', en: 'Economics',
    degree: 'JS4824 · 4 年制', alevel: 'ABB–AAB', ib: '33–35', test: '',
    alevelNote: '', offer: 'ref', note: '属社会科学院',
    url: 'https://admission.cuhk.edu.hk/programme/econn/' },

  { school: 'cuhk', dirs: ['cs', 'eng'], zh: '金融科技', en: 'Financial Technology',
    degree: 'JS4428 · 4 年制', alevel: 'AAB–AAA', ib: '36–38', test: '',
    alevelNote: '', offer: 'ref', note: '工程学院',
    url: 'https://admission.cuhk.edu.hk/programme/ftecn/' },

  { school: 'cuhk', dirs: ['cs'], zh: '计算机科学与工程（2026 大一 CS 主入口）', en: 'Computer Science & Engineering',
    degree: 'JS4412 · 4 年制', alevel: 'ABB–AAB', ib: '33–35', test: '',
    alevelNote: '热门专业实际收生远高于区间', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/bcsen/' },

  { school: 'cuhk', dirs: ['cs'], zh: '人工智能（系统与科技）', en: 'AI: Systems and Technologies',
    degree: 'JS4468 · 4 年制', alevel: 'AAA–A*A*A', ib: '38–40', test: '', alevelNote: '', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/aistn/' },

  { school: 'cuhk', dirs: ['cs', 'stats'], zh: '计算数据科学', en: 'Computational Data Science',
    degree: 'JS4416 · 4 年制', alevel: 'AAA–A*A*A', ib: '41–42', test: '',
    alevelNote: '', offer: 'ref', note: '工程学院+统计系合办，非联招最热之一',
    url: 'https://admission.cuhk.edu.hk/programme/cdasn/' },

  { school: 'cuhk', dirs: ['stats'], zh: '风险管理科学', en: 'Risk Management Science',
    degree: 'JS4719 · 4 年制', alevel: 'ABB–AAB', ib: '33–35', test: '',
    alevelNote: '', offer: 'ref', note: '统计系，可衔接精算 SOA',
    url: 'https://admission.cuhk.edu.hk/programme/rmscn/' },

  // ── 港中文 · 文科 / 社科 / 传媒方向（文学院 · 社会科学院 · 新闻与传播学院 · 法律学院） ──
  { school: 'cuhk', dirs: ['arts'], zh: '中国语言及文学', en: 'Chinese Language and Literature',
    degree: 'JS4018 · 4 年制', alevel: 'BBB–ABB', ib: '31–33', test: '面试（入围）',
    alevelNote: 'IB 宜修 Chinese A: Literature 且宜 HL', offer: 'ref', note: '文学院王牌学系，设中大—北大双学位',
    url: 'https://admission.cuhk.edu.hk/programme/chlln/' },

  { school: 'cuhk', dirs: ['arts'], zh: '英文', en: 'English',
    degree: 'JS4032 · 4 年制', alevel: 'BBB–ABB', ib: '31–33', test: '面试',
    alevelNote: 'IB 偏好 English HL；A-Level 宜修英国文学', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/engen/' },

  { school: 'cuhk', dirs: ['arts'], zh: '翻译', en: 'Translation',
    degree: 'JS4123 · 4 年制', alevel: 'BBB–ABB', ib: '31–33', test: '',
    alevelNote: 'IB 偏好中文及英文，两科至少一科宜 HL', offer: 'ref', note: '亚洲最早设立的翻译学系之一',
    url: 'https://admission.cuhk.edu.hk/programme/trann/' },

  { school: 'cuhk', dirs: ['social'], qs: ['psychology'], zh: '心理学', en: 'Psychology',
    degree: 'JS4862 · 4 年制', alevel: 'AAB–AAA', ib: '36–38', test: '',
    alevelNote: 'IB 偏好数学（SL/HL）', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/psycn/' },

  { school: 'cuhk', dirs: ['social'], qs: ['politics'], zh: '政治与行政学', en: 'Government and Public Administration',
    degree: 'JS4848 · 4 年制', alevel: 'AAB–AAA', ib: '36–38', test: '',
    alevelNote: '', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/gpadn/' },

  { school: 'cuhk', dirs: ['media'], zh: '新闻与传播学', en: 'Journalism and Communication',
    degree: 'JS4850 · 4 年制', alevel: 'AAB–AAA', ib: '36–38', test: '',
    alevelNote: '', offer: 'ref', note: '香港历史最悠久的传播学院',
    url: 'https://admission.cuhk.edu.hk/programme/commn/' },

  { school: 'cuhk', dirs: ['media'], zh: '全球传播', en: 'Global Communication',
    degree: 'JS4858 · 4 年制', alevel: 'AAB–AAA', ib: '36–38', test: '面试',
    alevelNote: '', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/gcomn/' },

  { school: 'cuhk', dirs: ['social'], qs: ['law-legal-studies'], zh: '法学士', en: 'Bachelor of Laws',
    degree: 'JS4903 · 4 年制', alevel: 'AAB–AAA', ib: '36–38', test: '面试',
    alevelNote: 'IB 要求 English A（SL/HL）或 English B（HL）', offer: 'ref', note: '',
    url: 'https://admission.cuhk.edu.hk/programme/lawsn/' },

  // ═══════════ 香港科技大学 HKUST（大学通用门槛 + 科目要求） ═══════════
  { school: 'hkust', dirs: ['physics', 'stats'], zh: '理学院 Science (Group A)——物理科学方向', en: 'Science (Group A) — Physical Sciences',
    degree: 'School-based · 本地 JS5102', alevel: '≥3 AL', ib: 'Diploma（全校参考 35–40）', test: '',
    alevelNote: '科目：数学 + 物理或化学 其一（senior level）；全校参考 AAA–3A*', offer: 'ger',
    note: '主修池含化学/数学/物理/海洋科学/数据科学(AI)；先入组、大一后声明主修；面试非强制',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-science' },

  { school: 'hkust', dirs: ['bio'], zh: '理学院 Science (Group B)——自然科学方向', en: 'Science (Group B) — Natural Sciences',
    degree: 'School-based · 本地 JS5103', alevel: '≥3 AL', ib: 'Diploma（全校参考 35–40）', test: '',
    alevelNote: '科目：数学 + 化学或生物 其一（senior level）；全校参考 AAA–3A*', offer: 'ger',
    note: '主修池含生物化学与细胞生物学/生物科技/化学/海洋科学/生物医学与健康科学；先入组、大一后声明主修',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-science' },

  { school: 'hkust', dirs: ['bio'], zh: '生物医学与健康科学', en: 'BSc Biomedical and Health Sciences',
    degree: 'JS5118 · 4 年制', alevel: '≥3 AL', ib: 'Diploma（数学 + 化学HL/生物HL 之一）', test: '面试',
    alevelNote: '科目：数学 + 化学或生物 其一', offer: 'ger', note: '可直申（非 Group B 内声明）；面试强制',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-science/biomedical-and-health' },

  { school: 'hkust', dirs: ['cs'], zh: '计算机科学 / 人工智能（经 CSE 系）', en: 'BEng/BSc Computer Science & BEng AI',
    degree: '经 CSE 系（本地码 JS5240）', alevel: '≥3 AL', ib: 'Diploma（数学 + 物理/化学/生物/CS HL 之一）', test: '',
    alevelNote: '科目：senior 数学 + 物理/化学/生物/CS 之一', offer: 'ger', note: 'AI 与 CS 均于一年级后经 CSE 系选主修；另设“工程 + AI 延伸主修”学院大类（本地码 JS5282），非 BEng AI',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-engineering/computer-science' },

  { school: 'hkust', dirs: ['cs', 'eng'], zh: '计算机工程', en: 'BEng Computer Engineering',
    degree: 'JS5212 · 4 年制', alevel: '≥3 AL', ib: 'Diploma', test: '',
    alevelNote: '科目同 CS：数学+一理科', offer: 'ger', note: '',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-engineering/computer-engineering' },

  { school: 'hkust', dirs: ['econ', 'stats'], zh: '量化金融（理学士）', en: 'BSc Quantitative Finance',
    degree: 'JS5332 · 4 年制', alevel: '≥3 AL', ib: 'Diploma（科目：HL Math）', test: '面试',
    alevelNote: '科目：Further Maths', offer: 'ger', note: '面试强制；商学院',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-business-and-management/quantitative-finance' },

  { school: 'hkust', dirs: ['econ'], zh: '环球商业', en: 'BBA Global Business',
    degree: 'JS5313 · 4 年制', alevel: '≥3 AL', ib: 'Diploma', test: '面试',
    alevelNote: '无特定科目', offer: 'ger', note: '旗舰、高选拔；面试强制',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-business-and-management/global-business-management' },

  { school: 'hkust', dirs: ['econ'], zh: '经济学', en: 'BBA Economics',
    degree: 'JS5311 · 4 年制', alevel: '≥3 AL', ib: 'Diploma（SL/HL Math）', test: '',
    alevelNote: '科目：数学/Further Maths', offer: 'ger', note: '',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-business-and-management' },

  { school: 'hkust', dirs: ['econ'], zh: '金融学', en: 'BBA Finance',
    degree: 'JS5312 · 4 年制', alevel: '≥3 AL', ib: 'Diploma（SL/HL Math）', test: '',
    alevelNote: '科目：数学/Further Maths', offer: 'ger', note: '',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-business-and-management/finance' },

  { school: 'hkust', dirs: ['stats', 'econ'], zh: '风险管理与商业智能', en: 'BSc Risk Management and Business Intelligence',
    degree: 'JS5814 · 4 年制', alevel: '≥3 AL', ib: 'Diploma（HL Math）', test: '面试',
    alevelNote: '科目：Further Maths', offer: 'ger', note: '面试强制（商学院口径）',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-business-and-management' },

  { school: 'hkust', dirs: ['social'], zh: '环球中国研究', en: 'BSc in Global China Studies',
    degree: 'JS5411 · 4 年制', alevel: '≥3 AL', ib: 'Diploma（参考 35–40）', test: '',
    alevelNote: '无指定科目；英文须达 GCE AS/A-Level 英语或英国文学 E', offer: 'ger',
    note: '人文社会科学学院的两个本科专业之一；多学科中国研究，含海外交流学期',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-humanities-and-social-science/global-china-studies' },

  { school: 'hkust', dirs: ['social', 'stats'], zh: '定量社会数据分析', en: 'BSc in Quantitative Social Analysis',
    degree: 'JS5412 · 4 年制', alevel: '≥3 AL', ib: 'Diploma（参考 35–40）', test: '',
    alevelNote: '无指定科目；英文须达 GCE AS/A-Level 英语或英国文学 E', offer: 'ger',
    note: '社科理论 + 统计学 / 社会数据分析训练；人文社科学院可直接报读',
    url: 'https://join.hkust.edu.hk/our-programs/school-of-humanities-and-social-science/quantitative-social-analysis' },

  // ═══════════ 香港城市大学 CityU（大学最低入学标准 + 个别科目背景） ═══════════
  { school: 'cityu', dirs: ['cs'], zh: '数据科学', en: 'BSc Data Science',
    degree: 'JS1072 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma（Year1 无分数下限）', test: '',
    alevelNote: '数学为最低科目背景', offer: 'ger', note: 'College of Computing–数据科学系；专修含 AI/统计学习',
    url: 'https://www.jupas.edu.hk/en/programme/cityuhk/JS1072/' },

  { school: 'cityu', dirs: ['cs'], zh: '计算机科学', en: 'BSc Computer Science',
    degree: 'JS1204 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '',
    url: 'https://www.cs.cityu.edu.hk/en/academic-programmes/bsc-computer-science/admissions/admissions-direct-non-jupas' },

  { school: 'cityu', dirs: ['cs'], zh: '网络安全', en: 'BSc Cybersecurity',
    degree: 'JS1218 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '',
    url: 'https://www.cs.cityu.edu.hk/en/academic-programmes/bsc-cybersecurity/admissions/admissions-direct-non-jupas' },

  { school: 'cityu', dirs: ['eng'], zh: '电机工程（大类，入学后选主修）', en: 'Electrical Engineering',
    degree: 'JS1205 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '主修：计算机与数据/电子及电机/资讯/微电子工程；工程另见 JS1207 机械、JS1211 生医工程',
    url: 'https://www.ee.cityu.edu.hk/en/prospective_students/undergraduate_admission/admission_information' },

  { school: 'cityu', dirs: ['econ'], zh: '会计学', en: 'BBA Accountancy',
    degree: 'JS1002 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '专业会计 / ESG 与科技两流',
    url: 'https://www.cb.cityu.edu.hk/programmes/programme-finder/details?code=JS1002' },

  { school: 'cityu', dirs: ['econ'], zh: '金融学', en: 'BBA Finance',
    degree: 'JS1014 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '',
    url: 'https://www.cityu.edu.hk/admo/programmes/bba-finance' },

  { school: 'cityu', dirs: ['econ'], zh: '商业经济', en: 'BBA Business Economics',
    degree: 'JS1013 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '',
    url: 'https://www.cityu.edu.hk/admo/programmes/bba-business-economics' },

  { school: 'cityu', dirs: ['econ'], zh: '经济与金融系方案（商业经济/金融）', en: 'Economics and Finance',
    degree: 'JS1012 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '入系一年后按成绩分流主修（前 40% 自由选）',
    url: 'https://www.cb.cityu.edu.hk/programmes/programme-finder/details?code=JS1012' },

  { school: 'cityu', dirs: ['cs', 'econ'], zh: '计算金融与金融科技', en: 'BSc Computational Finance & FinTech',
    degree: 'JS1000 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '计算金融/金融科技两流；含 CityU–Columbia 双学位',
    url: 'https://www.cb.cityu.edu.hk/programmes/programme-finder/details?code=JS1000' },

  { school: 'cityu', dirs: ['econ'], zh: '环球商业', en: 'BBA Global Business',
    degree: 'JS1001 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '',
    url: 'https://www.cb.cityu.edu.hk/programmes/programme-finder/details?code=JS1001' },

  { school: 'cityu', dirs: ['econ'], zh: '商业决策分析', en: 'BBA Business Decision Analytics',
    degree: 'JS1026 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '决策分析/数据信息学两流',
    url: 'https://www.cb.cityu.edu.hk/programmes/programme-finder/details?code=JS1026' },

  { school: 'cityu', dirs: ['bio'], zh: '化学', en: 'BSc Chemistry',
    degree: 'JS1202 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '偏好化学/理科背景', offer: 'ger', note: '',
    url: 'https://web.jupas.edu.hk/f/pdf/catalog_CityUHK.pdf' },

  { school: 'cityu', dirs: ['stats'], zh: '计算数学', en: 'BSc Computing Mathematics',
    degree: 'JS1206 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '', offer: 'ger', note: '数学系本科',
    url: 'https://web.jupas.edu.hk/f/pdf/catalog_CityUHK.pdf' },

  { school: 'cityu', dirs: ['physics'], zh: '物理（含医学物理方向）', en: 'BSc Physics',
    degree: 'JS1208 · 4 年制', alevel: '3 AL ≥ E', ib: 'Diploma', test: '',
    alevelNote: '偏好理科背景', offer: 'ger', note: '',
    url: 'https://web.jupas.edu.hk/f/pdf/catalog_CityUHK.pdf' },

  // ── 城大 · 文科 / 社科 / 传媒方向（人文社会科学院 · 创意媒体学院） ──
  { school: 'cityu', dirs: ['media'], zh: '媒体与传播', en: 'Media and Communication',
    degree: 'JS1106 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '首年不定主修，主修：数码电视与广播 / 媒体与传播',
    url: 'https://www.cityu.edu.hk/admo/programmes/department-media-and-communication-options-ba-digital-television-and-broadcasting-ba' },

  { school: 'cityu', dirs: ['media'], zh: '创意媒体', en: 'Creative Media',
    degree: 'JS1041 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（未列分数）', test: '作品集',
    alevelNote: '', offer: 'ger', note: '主修：文学士 / 理学士（创意媒体）、文理学士（新媒体）；作品集 1 月下旬提交',
    url: 'https://www.cityu.edu.hk/admo/programmes/school-creative-media-options-ba-creative-media-bsc-creative-media-bas-new-media' },

  { school: 'cityu', dirs: ['arts'], zh: '文学士（英语语言）', en: 'BA English',
    degree: 'JS1104 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（未列分数）', test: '',
    alevelNote: '英语要求高于全校门槛：GCE AL 英语文学 C、或 GCSE 英语 B、或 IELTS 7、或 TOEFL 102', offer: 'ger',
    note: '方向：英语及专业传意 / 语言及文学',
    url: 'https://www.cityu.edu.hk/admo/programmes/ba-english' },

  { school: 'cityu', dirs: ['arts'], zh: '文学士（中文及历史）', en: 'BA Chinese and History',
    degree: 'JS1103 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（未列分数）', test: '',
    alevelNote: '【中文资历受限】须提交认可中文能力证明；无中文资历者实际难以申请', offer: 'ger',
    note: '方向：中文 / 历史及文化遗产',
    url: 'https://www.cityu.edu.hk/admo/programmes/ba-chinese-and-history-0' },

  { school: 'cityu', dirs: ['social'], qs: ['psychology'], zh: '社会科学学士（心理学）', en: 'BSocSc Psychology',
    degree: 'JS1112 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '专修：健康与人类发展 / 大脑与认知',
    url: 'https://www.cityu.edu.hk/admo/programmes/bsocsc-psychology' },

  { school: 'cityu', dirs: ['social'], zh: '社会科学学士（公共事务与管理）', en: 'BSocSc Public Affairs and Management',
    degree: 'JS1108 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '专修：公共事务与管治 / 公共政策与管理',
    url: 'https://www.cityu.edu.hk/admo/programmes/bsocsc-public-affairs-and-management' },

  // ═══════════ 香港理工大学 PolyU（通用门槛 + 科目偏好；个别专业面试） ═══════════
  { school: 'polyu', dirs: ['bio'], zh: '护理学（荣誉）', en: 'BSc (Hons) in Nursing',
    degree: 'JS3648 · 5 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '面试',
    alevelNote: '国际生档要求', offer: 'ger', note: '无 AL 偏好科目',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3648' },

  { school: 'polyu', dirs: ['bio'], zh: '物理治疗学（荣誉）', en: 'BSc (Hons) in Physiotherapy',
    degree: 'JS3636 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '面试',
    alevelNote: '国际生档要求', offer: 'ger', note: '理大门槛最高之一',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3636' },

  { school: 'polyu', dirs: ['bio'], zh: '放射学（荣誉）', en: 'BSc (Hons) in Radiography',
    degree: 'JS3612 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '面试',
    alevelNote: '国际生档要求', offer: 'ger', note: '医学影像/放射治疗两专修',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3612' },

  { school: 'polyu', dirs: ['bio'], zh: '医疗化验科学（荣誉）', en: 'BSc (Hons) in Medical Laboratory Science',
    degree: 'JS3478 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '面试',
    alevelNote: '国际生档要求', offer: 'ger', note: '含临床实习',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3478' },

  { school: 'polyu', dirs: ['bio'], zh: '生物科技及化学科技组合课程', en: 'Biotechnology & Chemical Technology',
    degree: 'JS3011 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '',
    alevelNote: '国际生档要求', offer: 'ger', note: 'Year2 分流 应用生物 / 化学科技',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3011' },

  { school: 'polyu', dirs: ['physics'], zh: '物理（AI 与数据分析/创新创业副主修）', en: 'BSc (Hons) in Physics',
    degree: 'JS3030 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '',
    alevelNote: '国际生档要求', offer: 'ger', note: '',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3030' },

  { school: 'polyu', dirs: ['eng'], zh: '机械工程组合（智能机器人/机械）', en: 'BEng Scheme in Mechanical Engineering',
    degree: 'JS3741 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '',
    alevelNote: 'AL 偏好：物理/数学成绩佳者优先；国际生档要求', offer: 'ger', note: '',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3741' },

  { school: 'polyu', dirs: ['eng', 'cs'], zh: '信息及人工智能工程组合（物联网/AI/信息安全）', en: 'Information & AI Engineering',
    degree: 'JS3180 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '',
    alevelNote: '国际生档要求', offer: 'ger', note: '',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3180' },

  { school: 'polyu', dirs: ['econ'], zh: '会计及金融（会计/会计金融/数字金融与投资）', en: 'BBA Scheme in Accounting and Finance',
    degree: 'JS3060 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '',
    alevelNote: '无 AL 偏好科目；国际生档要求', offer: 'ger', note: '',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3060' },

  { school: 'polyu', dirs: ['cs'], zh: '电子计算及人工智能（计算机科学/企业信息管理）', en: 'Computing and AI',
    degree: 'JS3868 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '',
    alevelNote: '国际生档要求', offer: 'ger', note: '',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3868' },

  { school: 'polyu', dirs: ['cs'], zh: '数据科学与人工智能（含数据科学及分析）', en: 'Data Science and AI',
    degree: 'JS3223 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '',
    alevelNote: '无 AL 偏好科目；国际生档要求', offer: 'ger', note: '',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3223' },

  { school: 'polyu', dirs: ['stats', 'econ'], zh: '应用数学及金融分析（量化金融/金融科技等）', en: 'Applied Mathematics and Finance Analytics',
    degree: 'JS3220 · 4 年制', alevel: '3 AL ≥ B', ib: 'Diploma（典型 ≥32）', test: '',
    alevelNote: '国际生档要求', offer: 'ger', note: '应用数学系，含量化金融 / 金融科技方向',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3220' },

  // ── 理大 · 文科 / 社科 / 设计方向（人文学院 · 设计学院；酒店及旅游管理为理大世界级强项） ──
  { school: 'polyu', dirs: ['arts'], qs: ['art-design'], zh: '设计学（荣誉）文学士组合课程', en: 'BA (Hons) Scheme in Design',
    degree: 'JS3569 · 4 年制', alevel: '3 AL ≥ B', ib: '文凭（典型 ≥32）', test: '作品集',
    alevelNote: '国际生档要求；官方列为无优先科目', offer: 'ger',
    note: '九项主修：广告 / 环境 / 沉浸式媒体与游戏 / 信息 / 交互 / 室内 / 产品 / 服务 / 社会设计；国际生须交作品集并线上面试',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3569' },

  { school: 'polyu', dirs: ['econ'], qs: ['hospitality-leisure-management'], zh: '酒店及旅游管理（荣誉）理学士组合课程', en: 'BSc (Hons) Scheme in Hotel and Tourism Management',
    degree: 'JS3310 · 4 年制', alevel: '3 AL ≥ B', ib: '文凭（典型 ≥32）', test: '面试（入围）',
    alevelNote: '国际生档要求；语文科成绩较佳者优先', offer: 'ger',
    note: '主修：酒店管理 / 智慧旅游及酒店产业 / 会展及体验管理；非在港申请人经线上会议面试',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3310' },

  { school: 'polyu', dirs: ['arts'], zh: '英文及应用语言学（荣誉）文学士', en: 'BA (Hons) in English and Applied Linguistics',
    degree: 'JS3240 · 4 年制', alevel: '3 AL ≥ B', ib: '文凭（典型 ≥32）', test: '面试（入围）',
    alevelNote: '国际生档要求；无优先科目', offer: 'ger',
    note: '国际生面试约 15 分钟个人面试（11 月至次年 3 月）',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3240' },

  { school: 'polyu', dirs: ['arts'], zh: '中国历史及文化（荣誉）文学士', en: 'BA (Hons) in Chinese History and Culture',
    degree: 'JS3320 · 4 年制', alevel: '3 AL ≥ B', ib: '文凭（典型 ≥32）', test: '面试（入围）',
    alevelNote: '【中文资历受限】须具中文能力：GCE A-Level 中文 E、HSK 5 级或 IB 中文 4 分；并须以普通话及英语面试',
    offer: 'ger', note: '',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3320' },

  { school: 'polyu', dirs: ['social'], zh: '应用社会科学（荣誉）文学士组合课程', en: 'BA (Hons) Scheme in Applied Social Sciences',
    degree: 'JS3250 · 4 年制', alevel: '3 AL ≥ B', ib: '文凭（典型 ≥32）', test: '面试（入围）',
    alevelNote: '国际生档要求；无优先科目', offer: 'ger',
    note: '主修：社会工作 / 社会政策及社会创业；国际生须交约 1,500 字英文自荐信并线上小组面试',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3250' },

  { school: 'polyu', dirs: ['arts'], zh: '语言科学与技术（荣誉）理学士', en: 'BSc (Hons) in Language Science and Technology',
    degree: 'JS3243 · 4 年制', alevel: '3 AL ≥ B', ib: '文凭（典型 ≥32）', test: '面试（入围）',
    alevelNote: '国际生档要求；无优先科目', offer: 'ger',
    note: '原「中文及双语」学科已并入本课程；国际生面试或含中英文笔试',
    url: 'https://www.polyu.edu.hk/study/ug/international/2026/js3243' },

  // ═══════════ 香港浸会大学 HKBU（只公布大学整体门槛 + 2025 入学录取区间；全部为 A-Level/IB 可直申的 non-JUPAS 课程） ═══════════
  // 大学整体门槛：GCE AL/IAL 3 门各 ≥E（或 2 AL + 2 ASL）；IB 文凭；2025 入学录取区间 AL 120–152 UCAS Tariff、IB 30–35（含 TOK/EE）；英文 IELTS 6.0 / TOEFL 79 等
  { school: 'hkbu', dirs: ['econ'], zh: '工商管理学士（荣誉）', en: 'BBA (Hons)',
    degree: 'JS2120 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '面试（入围）',
    alevelNote: '', offer: 'ger', note: '商学院大类招生，入学后可选经济及数据分析、财务、市场学、人力资源、资讯系统及商业智能等专修',
    url: 'https://admissions.hkbu.edu.hk/programmes/school-of-business/bachelor-of-business-administration-hons-year1.html' },

  { school: 'hkbu', dirs: ['econ'], zh: '工商管理学士（荣誉）— 会计学专修', en: 'BBA (Hons) — Accounting Concentration',
    degree: 'JS2110 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '面试（入围）',
    alevelNote: '', offer: 'ger', note: '会计学专修，课程获专业会计团体认可',
    url: 'https://admissions.hkbu.edu.hk/programmes/school-of-business/bachelor-of-business-administration-hons-accounting-concentration-year1.html' },

  { school: 'hkbu', dirs: ['cs', 'econ'], zh: '商业计算及数据分析（荣誉理学士）', en: 'BSc (Hons) in Business Computing and Data Analytics',
    degree: 'JS2910 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '',
    alevelNote: '', offer: 'ger', note: '理学院与商学院合办，结合商业应用与数据科学',
    url: 'https://admissions.hkbu.edu.hk/programmes/faculty-of-science/bachelor-of-science-hons-in-business-computing-and-data-analytics-year1.html' },

  { school: 'hkbu', dirs: ['bio', 'physics', 'cs', 'stats'], zh: '理学士（荣誉）（应用生物/计算机/数学统计/物理等主修）', en: 'BSc (Hons)',
    degree: 'JS2510 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '',
    alevelNote: '', offer: 'ger', note: '理学院大类招生，第一年通识理科，其后选主修（含应用生物、生物化学及检测科学、计算机科学、人工智能、数学及统计、数据科学、物理及绿色能源等）',
    url: 'https://admissions.hkbu.edu.hk/programmes/faculty-of-science/bachelor-of-science-hons-year1.html' },

  { school: 'hkbu', dirs: ['bio'], zh: '中医学学士及生物医学理学士（荣誉）', en: 'BCM & BSc (Hons) in Biomedical Science',
    degree: 'JS2410 · 6 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '面试（入围）',
    alevelNote: '须修读生物或化学；并须具备认可中文资历（GCE A/AS 中文 E 或 GCSE/IGCSE 中文 C/4）', offer: 'ger',
    note: '6 年制中医与生物医学双学位',
    url: 'https://admissions.hkbu.edu.hk/programmes/school-of-chinese-medicine/bachelor-of-chinese-medicine-and-bachelor-of-science-hons-in-biomedical-science-year1.html' },

  { school: 'hkbu', dirs: ['bio'], zh: '中药学学士（荣誉）', en: 'BPharm (Hons) in Chinese Medicine',
    degree: 'JS2420 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '面试（入围）',
    alevelNote: '须修读化学；并须具备认可中文资历（GCE A/AS 中文 E 或 GCSE/IGCSE 中文 C/4）', offer: 'ger', note: '',
    url: 'https://admissions.hkbu.edu.hk/programmes/school-of-chinese-medicine/bachelor-of-pharmacy-hons-in-chinese-medicine-year1.html' },

  { school: 'hkbu', dirs: ['media'], zh: '传理学学士（荣誉）（新闻与数码媒体／公关及广告）', en: 'BComm (Hons) (Journalism and Digital Media / Public Relations and Advertising)',
    degree: 'JS2310 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '',
    alevelNote: '', offer: 'ger', note: '传理学院大类招生，含新闻与数码媒体、公关及广告两个主修',
    url: 'https://admissions.hkbu.edu.hk/programmes/school-of-communication/bachelor-of-communication-hons-journalism-and-digital-media-public-relations-and-advertising-year1.html' },

  { school: 'hkbu', dirs: ['media'], zh: '传理学学士（荣誉）— 游戏设计与动画', en: 'BComm (Hons) in Game Design and Animation',
    degree: 'JS2370 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '面试（入围）',
    alevelNote: '入围的国际申请人须提交作品集（创意、视觉及设计、动画及／或游戏设计）', offer: 'ger', note: '',
    url: 'https://admissions.hkbu.edu.hk/programmes/school-of-communication/bachelor-of-communication-hons-in-game-design-and-animation-year1.html' },

  { school: 'hkbu', dirs: ['arts'], zh: '文学士（荣誉）（中国语言文学／创意及专业写作／英国语言文学／人文学／翻译学）', en: 'BA (Hons) (Chinese Language and Literature / Creative and Professional Writing / English Language and Literature / Humanities / Translation)',
    degree: 'JS2020 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '',
    alevelNote: '拟修中国语言文学、创意及专业写作、人文学或翻译学主修者，须具备认可中文资历（GCE A/AS 中文 E 或 GCSE/IGCSE 中文 C/4）',
    offer: 'ger', note: '文学院大类招生，第一年后再选主修',
    url: 'https://admissions.hkbu.edu.hk/programmes/faculty-of-arts-and-social-sciences/bachelor-of-arts-hons-chinese-language-and-literature-creative-and-professional-writing-english-language-and-literature-humanities-translation-year1.html' },

  { school: 'hkbu', dirs: ['media'], zh: '电影电视文学士（荣誉）', en: 'BA (Hons) in Film and Television',
    degree: 'JS2330 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '面试（入围）',
    alevelNote: '须提交数字作品集（含影像作品）及推荐信', offer: 'ger', note: '',
    url: 'https://admissions.hkbu.edu.hk/programmes/school-of-creative-arts/bachelor-of-arts-hons-in-film-and-television-year1.html' },

  { school: 'hkbu', dirs: ['arts'], qs: ['art-design'], zh: '视觉艺术文学士（荣誉）', en: 'BA (Hons) in Visual Arts',
    degree: 'JS2810 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '面试（入围）',
    alevelNote: '须提交作品集；入围者须参加实务测试及面试', offer: 'ger', note: '',
    url: 'https://admissions.hkbu.edu.hk/programmes/school-of-creative-arts/bachelor-of-arts-hons-in-visual-arts-year1.html' },

  { school: 'hkbu', dirs: ['arts'], qs: ['performing-arts'], zh: '文学士（荣誉）／音乐学士（荣誉）（音乐／创意产业）', en: 'BA (Hons) / BMus (Hons) (Music / Creative Industries)',
    degree: 'JS2060 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '面试（入围）',
    alevelNote: '音乐课程须具 ABRSM 8 级演奏及 5 级乐理或同等资历，并提交作品集', offer: 'ger', note: '入围者或须参加能力测试、面试及／或试演',
    url: 'https://admissions.hkbu.edu.hk/programmes/school-of-creative-arts/bachelor-of-arts-hons-bachelor-of-music-hons-music-creative-industries-year1.html' },

  { school: 'hkbu', dirs: ['arts', 'cs'], zh: '艺术及科技文理学士（荣誉）', en: 'BASc (Hons) in Arts and Technology',
    degree: 'JS2920 · 4 年制', alevel: '3 AL ≥ E', ib: '文凭（2025 录取 30–35）', test: '面试',
    alevelNote: '须经网上系统提交三件作品的作品集，未提交者不予处理', offer: 'ger', note: '跨学科文理学士，融合艺术与科技',
    url: 'https://admissions.hkbu.edu.hk/programmes/school-of-creative-arts/bachelor-of-arts-and-science-hons-in-arts-and-technology-year1.html' },

  // ═══════════ 香港教育大学 EdUHK（只公布大学整体门槛 + 科目要求；全部为 A-Level/IB 可直申的 non-JUPAS 课程） ═══════════
  // 大学整体门槛：GCE AL 3 门各 ≥D（或 2 AL + 2 ASL）；IB 文凭（官网未设最低总分，近年平均录取 30/45）；英文 IELTS 6.0 / TOEFL 80 等
  { school: 'eduhk', dirs: ['cs'], zh: '人工智能与教育科技（荣誉理学士）', en: 'BSc (Hons) in Artificial Intelligence and Educational Technology',
    degree: 'JS8714 · 4 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '不含中文 / 英文科目', offer: 'ger', note: '教大旗舰科技课程：机器学习、计算机视觉、自然语言处理、数据科学；设业界实习',
    url: 'https://www.apply.eduhk.hk/ug/programmes/aiet' },

  { school: 'eduhk', dirs: ['cs', 'edu'], zh: '人工智能与教育科技理学士及小学数学教育学士（双学位）', en: 'BSc (Hons) in AI and Educational Technology & BEd (Hons) (Primary Mathematics)',
    degree: 'JS8009 · 5 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '5 年制双学位，须由推荐人提交网上评核报告', offer: 'ger', note: 'AI 教育科技 + 小学数学教育，毕业可申请注册教师',
    url: 'https://www.apply.eduhk.hk/ug/programmes/aiet_pma' },

  { school: 'eduhk', dirs: ['bio'], zh: '言语病理学及复康（荣誉理学士）', en: 'BSc (Hons) in Speech Pathology and Rehabilitation',
    degree: 'JS8727 · 4 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '须能以流利粤语及英语沟通', offer: 'ger', note: '言语治疗与复康方向，属健康科学类本科',
    url: 'https://www.apply.eduhk.hk/ug/programmes/spr' },

  { school: 'eduhk', dirs: ['econ', 'edu'], zh: '个人理财文学士及企业、会计与财务概论教育学士（双学位）', en: 'BA (Hons) in Personal Finance & BEd (Hons) (Business, Accounting and Financial Studies)',
    degree: 'JS8007 · 5 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '5 年制双学位，须由推荐人提交网上评核报告', offer: 'ger', note: '个人理财 + 商科（会计与财务）教育，毕业可申请注册教师',
    url: 'https://www.apply.eduhk.hk/ug/programmes/pf_bafs' },

  { school: 'eduhk', dirs: ['edu'], zh: '特殊教育（荣誉文学士）', en: 'BA (Hons) in Special Education',
    degree: 'JS8663 · 4 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '', offer: 'ger', note: '特殊教育方向；非教师教育课程，可另读 PGDE 取得教师资格',
    url: 'https://www.apply.eduhk.hk/ug/programmes/base' },

  { school: 'eduhk', dirs: ['social'], qs: ['psychology'], zh: '心理学（荣誉社会科学学士）', en: 'BSocSc (Hons) in Psychology',
    degree: 'JS8651 · 4 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '', offer: 'ger', note: '心理学方向',
    url: 'https://www.apply.eduhk.hk/ug/programmes/psy' },

  // ── 教育大学 5 年制教师教育双学位（2025/26 起，教大所有师范课程均为「非教育学位 + BEd」双学位；须推荐人网上评核报告） ──
  { school: 'eduhk', dirs: ['bio', 'edu'], zh: '综合环境管理理学士及科学教育学士（双学位）', en: 'BSc (Hons) in Integrated Environmental Management & BEd (Hons) (Science)',
    degree: 'JS8011 · 5 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '5 年制双学位，须由推荐人提交网上评核报告', offer: 'ger', note: '环境管理 + 中学科学教育（生物 / 化学方向）',
    url: 'https://www.apply.eduhk.hk/ug/programmes/iem_sci' },

  { school: 'eduhk', dirs: ['arts', 'edu'], zh: '英语研究及数码传讯文学士及英文教育学士（双学位）', en: 'BA (Hons) in English Studies and Digital Communication & BEd (Hons) (English Language)',
    degree: 'JS8004 · 5 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '5 年制双学位，须由推荐人提交网上评核报告；英语授课，中文要求可按个案豁免', offer: 'ger',
    note: '英语研究 + 英文教育；第一学年结束前分派小学或中学教学重点',
    url: 'https://www.apply.eduhk.hk/ug/programmes/esdc_el' },

  { school: 'eduhk', dirs: ['social', 'edu'], zh: '心理学社会科学学士及幼儿教育学士（双学位）', en: 'BSocSc (Hons) in Psychology & BEd (Hons) (Early Childhood Education)',
    degree: 'JS8006 · 5 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '5 年制双学位，须由推荐人提交网上评核报告', offer: 'ger', note: '心理学 + 幼儿教育',
    url: 'https://www.apply.eduhk.hk/ug/programmes/psy_ece' },

  { school: 'eduhk', dirs: ['bio', 'edu'], zh: '运动科学及教练理学士及体育教育学士（双学位）', en: 'BSc (Hons) in Sports Science and Coaching & BEd (Hons) (Physical Education)',
    degree: 'JS8010 · 5 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '5 年制双学位，须由推荐人提交网上评核报告；另设笔试、体能测试与游泳测试', offer: 'ger',
    note: '运动科学 + 体育教育',
    url: 'https://www.apply.eduhk.hk/ug/programmes/spsc_pe' },

  { school: 'eduhk', dirs: ['arts', 'edu'], zh: '创意艺术与数码艺术文学士及视觉艺术教育学士（双学位）', en: 'BA (Hons) in Creative and Digital Arts & BEd (Hons) (Visual Arts)',
    degree: 'JS8002 · 5 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '5 年制双学位，须由推荐人提交网上评核报告；须通过实务测试，非本地申请人须上载作品集', offer: 'ger',
    note: '创意艺术 + 视觉艺术教育',
    url: 'https://www.apply.eduhk.hk/ug/programmes/ba_bed_va' },

  { school: 'eduhk', dirs: ['arts', 'edu'], zh: '数码中国文化与传意文学士及中文教育学士（双学位）', en: 'BA (Hons) in Digital Chinese Culture and Communication & BEd (Hons) (Chinese Language)',
    degree: 'JS8003 · 5 年制', alevel: '3 AL ≥ D', ib: '文凭（平均录取 30/45）', test: '面试（入围）',
    alevelNote: '【中文资历受限】教大明列本课程不接受 GCE / GCSE 等替代中文资历，中文要求不获豁免；5 年制双学位，须由推荐人提交网上评核报告',
    offer: 'ger', note: '中文教育方向；申请前须先向教大确认中文资历是否受理',
    url: 'https://www.apply.eduhk.hk/ug/programmes/dccc_cl' },

  // ═══════════ 岭南大学 Lingnan（只公布大学整体门槛；无分专业 A-Level/IB 分数；人文社科为主，国际资历途径不设中文科要求） ═══════════
  // 大学整体门槛：GCE AL/IAL 3 门合格（或 2 AL + 2 AS）不含中英文；IB 文凭（未列分数）；英文 IELTS 6.0 / TOEFL 79 / GCSE English C·4 等
  { school: 'lingnan', dirs: ['econ'], zh: '会计与企业管治（工商管理荣誉学士）', en: 'BBA (Hons) — Accounting and Corporate Governance',
    degree: 'JS7211 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '商学院 BBA（荣誉）学士主修之一',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/accounting-and-corporate-governance' },

  { school: 'lingnan', dirs: ['econ'], zh: '金融（工商管理荣誉学士）', en: 'BBA (Hons) — Finance',
    degree: 'JS7213 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '设 CFA 相关选修与专业团体考试豁免',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/finance' },

  { school: 'lingnan', dirs: ['econ'], zh: '风险及保险管理（工商管理荣誉学士）', en: 'BBA (Hons) — Risk and Insurance Management',
    degree: 'JS7216 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '同时设 UGC 资助及自资学额',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/risk-and-insurance-management' },

  { school: 'lingnan', dirs: ['econ'], zh: '市场学与社交媒体（工商管理荣誉学士）', en: 'BBA (Hons) — Marketing and Social Media',
    degree: 'JS7215 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/marketing-and-social-media' },

  { school: 'lingnan', dirs: ['econ'], zh: '经济学（社会科学荣誉学士）', en: 'BSocSc (Hons) — Economics',
    degree: 'JS7301 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '面试（入围）',
    alevelNote: '', offer: 'ger', note: '可选 Global Economics & Banking 方向',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/economics' },

  { school: 'lingnan', dirs: ['cs', 'stats'], zh: '数据科学（荣誉理学士）', en: 'BSc (Hons) in Data Science',
    degree: 'JS7225 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '官网未公布 A-Level / IB 数学先修要求', offer: 'ger', note: '数据科学学院开办，结合计算机、统计与人工智能',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/data-science' },

  { school: 'lingnan', dirs: ['social'], qs: ['psychology'], zh: '心理学（社会科学荣誉学士）', en: 'BSocSc (Hons) — Psychology',
    degree: 'JS7303 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '可选辅导心理学方向',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/psychology' },

  { school: 'lingnan', dirs: ['social'], zh: '政府与国际事务学（社会科学荣誉学士）', en: 'BSocSc (Hons) — Government and International Affairs',
    degree: 'JS7302 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/government-and-international-affairs' },

  { school: 'lingnan', dirs: ['arts'], zh: '中文（荣誉文学士）', en: 'BA (Hons) in Chinese',
    degree: 'JS7101 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '设创意写作方向，兼及文学与专业写作',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/chinese' },

  { school: 'lingnan', dirs: ['arts'], zh: '英语语言文学（荣誉文学士）', en: 'BA (Hons) in English Studies',
    degree: 'JS7503 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '设文学 / 语言学方向；前称当代英语研究',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/english-studies' },

  { school: 'lingnan', dirs: ['arts'], zh: '翻译（荣誉文学士）', en: 'BA (Hons) in Translation',
    degree: 'JS7204 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '设跨文化传意 / 数码企业传意方向',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/translation' },

  { school: 'lingnan', dirs: ['social'], zh: '环球可持续发展（环球博雅荣誉文学士）', en: 'BLA (Hons) in Global Development and Sustainability',
    degree: 'JS7123 · 4 年制', alevel: '3 AL 合格', ib: '文凭（官网未列分数）', test: '',
    alevelNote: '', offer: 'ger', note: '伍絜宜跨学科研究学院，含多校区全球体验',
    url: 'https://www.ln.edu.hk/admissions/ug/programme/overseas-and-mainland-applicants-holding-international-qualifications/global-development-and-sustainability' }
];
