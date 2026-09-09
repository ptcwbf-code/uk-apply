// 英国九校本科录取要求速查 —— 数据（2026-09 抓取核对，面向 2027 年 9 月入学申请季）
// 方向编码：bio=生化医药化学 / physics=物理 / eng=工程 / econ=经济管理金融会计 / cs=计算机数据AI / stats=统计数学精算
// 分数口径见每页"解读"区：typical offer / 最低要求 / 录取区间 / 剑桥=各学院 Minimum offer level 等

const SCHOOLS = [
  { key: 'oxford',    zh: '牛津',   en: 'University of Oxford',  group: 'G5·牛剑', color: '#7c0f28' },
  { key: 'cambridge', zh: '剑桥',   en: 'University of Cambridge', group: 'G5·牛剑', color: '#0f4c81' },
  { key: 'imperial',  zh: '帝国理工', en: 'Imperial College London', group: 'G5', color: '#162d5c' },
  { key: 'lse',       zh: 'LSE',    en: 'London School of Economics', group: 'G5', color: '#a61c5b' },
  { key: 'ucl',       zh: 'UCL',    en: 'University College London', group: 'G5', color: '#511c5c' },
  { key: 'kcl',       zh: 'KCL',    en: "King's College London", group: '王爱曼华', color: '#3a5da8' },
  { key: 'manchester',zh: '曼大',   en: 'University of Manchester', group: '王爱曼华', color: '#73172d' },
  { key: 'edinburgh', zh: '爱丁堡', en: 'University of Edinburgh', group: '王爱曼华', color: '#1e2d3d' },
  { key: 'warwick',   zh: '华威',   en: 'University of Warwick',  group: '王爱曼华', color: '#4b1e64' }
];

const DIRS = {
  bio:      { zh: '生物·化学·医药', en: 'Biochem/Chem/Bio/Med', short: '生化医药' },
  physics:  { zh: '物理',           en: 'Physics',               short: '物理' },
  eng:      { zh: '工程',           en: 'Engineering',           short: '工程' },
  econ:     { zh: '经济·管理·金融·会计', en: 'Econ/Management/Finance', short: '经管金融' },
  cs:       { zh: '计算机·数据·AI', en: 'CS/Data/AI',            short: '计算机数据' },
  stats:    { zh: '统计·数学·精算', en: 'Stats/Maths',           short: '统计数学' }
};

// test 取值：''（无笔试）| 'ESAT' | 'TMUA' | 'TARA' | 'STEP'（剑桥数学offer附加）| 'UCAT' | 组合如 'ESAT'+说明写 note
// offer 口径：'typical' 典型/标准 | 'min' 最低要求 | 'range' 录取区间 | 'college' 剑桥学院最低offer | 'standard' 牛津标准要求
const PROGRAMS = [

  // ═══════════ 牛津 Oxford（standard：课程页标准要求；均需线上面试） ═══════════
  { school: 'oxford', dirs: ['bio'], zh: '生物化学（分子与细胞生物学）', en: 'Biochemistry (Molecular and Cellular Biology)',
    degree: 'MBiochem · 4 年', alevel: 'A*AA', ib: 'IB 39（HL 化学 7 + 另两门相关 6）', test: '',
    alevelNote: '化学必修 + 另一门科学/数学；A* 须在科学/数学科目', offer: 'standard', note: '无笔试；须线上面试',
    url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/biochemistry-molecular-and-cellular' },

  { school: 'oxford', dirs: ['bio'], zh: '生物学', en: 'Biology',
    degree: 'BA / MBiol · 3 或 4 年', alevel: 'A*AA', ib: 'IB 39（HL 生物 + 科学/数学之一 7）', test: '',
    alevelNote: '生物必修 + 化学/物理/数学之一；A* 须在科学/数学', offer: 'standard', note: '无笔试；须线上面试',
    url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/biology' },

  { school: 'oxford', dirs: ['bio'], zh: '生物医学', en: 'Biomedical Sciences',
    degree: 'MBiomedSci / BA · 3 或 4 年', alevel: 'A*AA', ib: 'IB 39（HL 766）', test: 'ESAT',
    alevelNote: '生物/化学/物理/数学须选两门；不收 Critical Thinking 等', offer: 'standard', note: 'ESAT：Maths 1 + 自选两门；须线上面试',
    url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/biomedical-sciences' },

  { school: 'oxford', dirs: ['bio'], zh: '化学', en: 'Chemistry',
    degree: 'MChem · 4 年', alevel: 'A*A*A', ib: 'IB 40（HL 化学 7）', test: '',
    alevelNote: '化学 + 数学必修，两个 A* 均须在科学/数学科目', offer: 'standard', note: '无笔试；须线上面试',
    url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/chemistry' },

  { school: 'oxford', dirs: ['physics'], zh: '物理', en: 'Physics',
    degree: 'MPhys / BA · 3 或 4 年', alevel: 'A*AA', ib: 'IB 39（HL 766，7 在物理或数学）', test: 'ESAT',
    alevelNote: '数学 + 物理必修；A* 须在数学/物理/高数', offer: 'standard', note: '2027 起 ESAT 取代 PAT（Maths1/2 + Physics）；须线上面试',
    url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/physics' },

  { school: 'oxford', dirs: ['eng'], zh: '工程科学', en: 'Engineering Science',
    degree: 'MEng · 4 年', alevel: 'A*A*A', ib: 'IB 40（HL 776，数学与物理均 7）', test: 'ESAT',
    alevelNote: '数学 + 物理必修，两个 A* 在数学/物理/高数', offer: 'standard', note: 'ESAT（Maths1/2 + Physics）；须线上面试',
    url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/engineering-science' },

  { school: 'oxford', dirs: ['econ'], zh: '经济与管理', en: 'Economics and Management',
    degree: 'BA · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766，HL 数学 6 或 7）', test: 'TARA',
    alevelNote: '数学必修（A* 或 A）', offer: 'standard', note: 'TARA 考 Critical Thinking + Problem Solving 两模块（牛津此课可不考写作）；管理/金融无独立专业，均在此课',
    url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/economics-and-management' },

  { school: 'oxford', dirs: ['cs'], zh: '计算机科学', en: 'Computer Science',
    degree: 'BA / MCompSci · 3 或 4 年', alevel: 'A*AA', ib: 'IB 39（HL 766，7 在 HL 数学）', test: 'TMUA',
    alevelNote: '数学 + 高数 A*A（学校开高数须选）；不开高数则 A*AAa 或 A*AA（数学 A*）', offer: 'standard', note: '2027 起 TMUA 取代 MAT；近年约 96% 录取者修过高数',
    url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/computer-science' },

  { school: 'oxford', dirs: ['stats'], zh: '数学（含数学与统计路线）', en: 'Mathematics / Mathematics and Statistics',
    degree: 'BA / MMath · 3 或 4 年', alevel: 'A*A*A', ib: 'IB 39（HL 766，7 在 HL 数学）', test: 'TMUA',
    alevelNote: '数学 + 高数均 A*（同 CS 的不开高数替代路径）', offer: 'standard', note: '统计无独立专业：申请即联合 Math & Stats，第四学期末才分纯数/数统路线',
    url: 'https://www.ox.ac.uk/admissions/undergraduate/courses/course-listing/mathematics' },

  // ═══════════ 剑桥 Cambridge（Minimum offer level=多数学院标准条件，实际录取普遍更高；offer 由各学院发出） ═══════════
  { school: 'cambridge', dirs: ['bio', 'physics'], zh: '自然科学（生物/化学/物理均在此一门）', en: 'Natural Sciences',
    degree: 'BA (Hons) / MSci · 3 或 4 年', alevel: 'A*A*A', ib: 'IB 41–42（HL 776）', test: 'ESAT',
    alevelNote: '数学 + 另 2 门科学/数学科目', offer: 'college', note: '申请时须选 Biological 或 Physical 流；实际录取约 76%（生物）/97%（物理）达 A*A*A*',
    url: 'https://www.undergraduate.study.cam.ac.uk/courses/natural-sciences-ba-hons-msci' },

  { school: 'cambridge', dirs: ['eng', 'bio'], zh: '化学工程与生物技术', en: 'Chemical Engineering and Biotechnology',
    degree: 'BA (Hons) / MEng · 3 或 4 年', alevel: 'A*A*A', ib: 'IB 41–42（HL 776，HL 数学 AA）', test: 'ESAT',
    alevelNote: '数学 + 化学 + 第三门科学/数学', offer: 'college', note: 'ESAT',
    url: 'https://www.undergraduate.study.cam.ac.uk/courses/chemical-engineering-biotechnology-ba-hons-meng' },

  { school: 'cambridge', dirs: ['eng'], zh: '工程', en: 'Engineering',
    degree: 'BA (Hons) / MEng · 3 或 4 年', alevel: 'A*A*A', ib: 'IB 41–42（HL 776，HL 数学 AA）', test: 'ESAT',
    alevelNote: '数学 + 物理；学校开高数须至 AS/A；多数学院 A* 落数学/高数', offer: 'college', note: 'Churchill/Selwyn 等学院更高；Peterhouse 申请人可能另加 STEP II grade 2',
    url: 'https://www.undergraduate.study.cam.ac.uk/courses/engineering-ba-hons-meng' },

  { school: 'cambridge', dirs: ['econ'], zh: '经济学', en: 'Economics',
    degree: 'BA (Hons) · 3 年', alevel: 'A*A*A', ib: 'IB 41–42（HL 776，HL 数学 AA）', test: 'TMUA',
    alevelNote: '数学为唯一必修；6 所学院另要求高数', offer: 'college', note: '实际约 80% 录取者 A*A*A*',
    url: 'https://www.undergraduate.study.cam.ac.uk/courses/economics-ba-hons' },

  { school: 'cambridge', dirs: ['cs'], zh: '计算机科学', en: 'Computer Science',
    degree: 'BA (Hons) / MEng · 3 或 4 年', alevel: 'A*A*A', ib: 'IB 41–42（HL 776，HL 数学 AA）', test: 'TMUA',
    alevelNote: '数学必修；高数须至 AS/A（学校开设时）；多数学院 A* 在数学/高数', offer: 'college', note: '2027 此课用 TMUA 而非 ESAT；申 Peterhouse/Trinity 另考 CSAT；2025 cycle 约 14 人/位',
    url: 'https://www.undergraduate.study.cam.ac.uk/courses/computer-science-ba-hons-meng' },

  { school: 'cambridge', dirs: ['stats'], zh: '数学（统计并入，无独立统计本科）', en: 'Mathematics',
    degree: 'BA (Hons) / MMath · 3 或 4 年', alevel: 'A*A*A', ib: 'IB 41–42（HL 776，HL 数学 AA）', test: 'STEP',
    alevelNote: '数学 + 高数必修；学院常要求 A* 在数学/高数', offer: 'college', note: 'offer 附加 STEP 2&3 各 grade 1（录取后考）；flexible-offer 学院可 A*A*A*+单 STEP grade 1 替代；申请阶段全体考 TMUA',
    url: 'https://www.undergraduate.study.cam.ac.uk/courses/mathematics-ba-hons-mmath' },

  { school: 'cambridge', dirs: ['bio'], zh: '医学', en: 'Medicine',
    degree: 'MB, BChir · 6 年', alevel: 'A*A*A', ib: 'IB 41–42（HL 776）', test: 'UCAT',
    alevelNote: '化学必修 + 1 或 2 门科学/数学；多数学院要求化学 A*', offer: 'college', note: '实际多数录取 44+/HL777',
    url: 'https://www.undergraduate.study.cam.ac.uk/courses/medicine-mb-bchir' },

  { school: 'cambridge', dirs: ['econ'], zh: '环境、法律与经济（原土地经济）', en: 'Environment, Law, and Economics',
    degree: 'BA (Hons) · 3 年', alevel: 'A*AA', ib: 'IB 41–42（HL 776）', test: '',
    alevelNote: '无必修科目（推荐经济与数学）', offer: 'college', note: '剑桥本科无独立管理/金融/会计专业，此为商科最接近的直申课程；无考试，部分学院要书面作品',
    url: 'https://www.undergraduate.study.cam.ac.uk/courses/environment-law-economics-ba-hons' },

  // ═══════════ 帝国理工 Imperial（/2027/ 版官方页；工程系普遍 ESAT，数学/计算机 TMUA） ═══════════
  { school: 'imperial', dirs: ['bio'], zh: '医学生物科学', en: 'Medical Biosciences',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 38（HL 生物 6 + 相关科 6）', test: '',
    alevelNote: '生物 A + 化学/数学/高数/物理之一 A', offer: 'min', note: '最低=typical；无笔试',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/medical-biosciences/' },

  { school: 'imperial', dirs: ['bio'], zh: '生物化学', en: 'Biochemistry',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 38（HL 化学 6 + 相关科）', test: 'ESAT',
    alevelNote: '化学 A + 生物/数学/物理之一 A', offer: 'min', note: '2027 须考 ESAT',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/biochemistry-bsc/' },

  { school: 'imperial', dirs: ['bio'], zh: '生物科学', en: 'Biological Sciences',
    degree: 'BSc / MSci · 3–4 年', alevel: 'AAA', ib: 'IB 38（HL 生物 6 + 相关科）', test: 'ESAT',
    alevelNote: '生物 A + 化学/数学/物理之一 A', offer: 'min', note: '帝国无名为 Biology 的课，此为生物方向；2027 起须 ESAT',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/biological-sciences/' },

  { school: 'imperial', dirs: ['bio'], zh: '化学', en: 'Chemistry',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 38（HL 化学+数学各 6）', test: '',
    alevelNote: '化学 A、数学 A', offer: 'min', note: 'typical A*AA；无笔试',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/chemistry-bsc/' },

  { school: 'imperial', dirs: ['physics'], zh: '物理', en: 'Physics',
    degree: 'BSc · 3 年', alevel: 'A*A*A', ib: 'IB 40（HL 数学 7、物理 7）', test: 'ESAT',
    alevelNote: '数学 A*、物理 A*', offer: 'min', note: 'typical A*A*A',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/physics-bsc/' },

  { school: 'imperial', dirs: ['eng'], zh: '航空工程', en: 'Aeronautical Engineering',
    degree: 'MEng · 4 年', alevel: 'A*A*A', ib: 'IB 40（HL 数学 7、物理 7）', test: 'ESAT',
    alevelNote: '数学 A*、物理 A*（3 科制须 A*）', offer: 'min', note: 'typical A*A*A*',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/aeronautical-engineering/' },

  { school: 'imperial', dirs: ['eng'], zh: '机械工程', en: 'Mechanical Engineering',
    degree: 'MEng · 4 年', alevel: 'A*A*A', ib: 'IB 40（HL 数学、物理各 6）', test: 'ESAT',
    alevelNote: '数学 A*；物理 3 科制须 A*', offer: 'min', note: 'typical A*A*A*',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/mechanical-engineering/' },

  { school: 'imperial', dirs: ['eng'], zh: '电子与电气工程', en: 'Electrical and Electronic Engineering',
    degree: 'MEng · 4 年', alevel: 'A*A*A', ib: 'IB 40（HL 数学 7、物理 7）', test: 'ESAT',
    alevelNote: '数学 A*、物理 A*', offer: 'min', note: 'typical A*A*A；官方名为 Electrical and Electronic',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/electrical-electronic-engineering-meng/' },

  { school: 'imperial', dirs: ['eng'], zh: '土木工程', en: 'Civil Engineering',
    degree: 'MEng · 4 年', alevel: 'A*A*A', ib: 'IB 40（HL 数学 7、物理 6）', test: 'ESAT',
    alevelNote: '数学 A*、物理 A*', offer: 'min', note: 'typical A*A*A/A*AAA',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/civil-engineering/' },

  { school: 'imperial', dirs: ['eng'], zh: '化学工程', en: 'Chemical Engineering',
    degree: 'MEng · 4 年', alevel: 'A*A*A', ib: 'IB 40（HL 数学 7、化学 7）', test: 'ESAT',
    alevelNote: '化学 A*、数学 A*', offer: 'min', note: 'typical A*A*A',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/chemical-engineering/' },

  { school: 'imperial', dirs: ['eng'], zh: '设计工程', en: 'Design Engineering',
    degree: 'MEng · 4 年', alevel: 'A*AA', ib: 'IB 39（HL 数学 7 + 一科 6）', test: 'ESAT',
    alevelNote: '数学 A* + 两门 AA', offer: 'min', note: 'typical A*AA；戴森设计学院',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/design-engineering/' },

  { school: 'imperial', dirs: ['eng'], zh: '生物医学工程', en: 'Biomedical Engineering',
    degree: 'MEng · 4 年', alevel: 'A*AA', ib: 'IB 39（HL 数学 6、物理 6）', test: '',
    alevelNote: '数学 A*、物理 A、第三科 A', offer: 'min', note: '页面未列笔试（与其他工程系不同，留意）',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/biomedical-engineering/' },

  { school: 'imperial', dirs: ['econ'], zh: '经济学、金融与数据科学', en: 'Economics, Finance and Data Science',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 数学 7 + 两门 6）', test: 'TMUA',
    alevelNote: '数学 A*', offer: 'min', note: '帝国商学院唯一本科（无纯经济/金融/管理）；TMUA + 线上面试',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/economics-finance-data-science/' },

  { school: 'imperial', dirs: ['cs'], zh: '计算机', en: 'Computing',
    degree: 'MEng · 4 年', alevel: 'A*A*A', ib: 'IB 41（HL 数学 7 + 相关科 7）', test: 'TMUA',
    alevelNote: '数学 A*', offer: 'min', note: 'typical A*A*A；TMUA + 面试',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/computing-meng/' },

  { school: 'imperial', dirs: ['cs'], zh: '计算机（三年制）', en: 'Computing',
    degree: 'BEng · 3 年', alevel: 'A*A*A', ib: 'IB 41（HL 数学 7 + 相关科 7）', test: 'TMUA',
    alevelNote: '数学 A*', offer: 'min', note: '与 Computing MEng 同系同要求；TMUA + 面试',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/computing-beng/' },

  { school: 'imperial', dirs: ['stats'], zh: '数学', en: 'Mathematics',
    degree: 'BSc · 3 年', alevel: 'A*A*A', ib: 'IB 39（HL 数学 7）', test: 'TMUA',
    alevelNote: '数学 A* + 高数 A*', offer: 'min', note: 'typical A*A*A；数学系各方向要求一致',
    url: 'https://www.imperial.ac.uk/study/courses/undergraduate/2027/mathematics-bsc/' },

  // ═══════════ LSE（社科：无理工；数学类专业普遍 TMUA；成绩 typical） ═══════════
  { school: 'lse', dirs: ['econ'], zh: '经济学', en: 'Economics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766、数学 7）', test: 'TMUA',
    alevelNote: '数学 A* 必修；高数强烈建议', offer: 'typical', note: 'TMUA 必考；高数未修不受损',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-economics' },

  { school: 'lse', dirs: ['econ'], zh: '计量与数理经济', en: 'Econometrics and Mathematical Economics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766、数学 7）', test: 'TMUA',
    alevelNote: '数学 A*', offer: 'typical', note: 'TMUA 必考',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-econometrics-and-mathematical-economics' },

  { school: 'lse', dirs: ['econ'], zh: '金融学', en: 'Finance',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766、数学 7）', test: '',
    alevelNote: '数学 A*', offer: 'typical', note: '',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-finance' },

  { school: 'lse', dirs: ['econ'], zh: '会计与金融', en: 'Accounting and Finance',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766、数学 6）', test: '',
    alevelNote: '数学 A', offer: 'typical', note: 'A-level Accounting 可算传统科目但非必需',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-accounting-and-finance' },

  { school: 'lse', dirs: ['econ', 'cs'], zh: '经济学与数据科学', en: 'Economics and Data Science',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766、数学 AA 7）', test: 'TMUA',
    alevelNote: '数学 A*；高数若开设须 A', offer: 'typical', note: '2026 新开；TMUA 鼓励；物理/化学等量化科目为良好准备',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-economics-and-data-science' },

  { school: 'lse', dirs: ['econ'], zh: '管理学', en: 'Management',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 38（HL 766、含数学）', test: '',
    alevelNote: '数学 A', offer: 'typical', note: '偏爱文理混合科目组合',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-management' },

  { school: 'lse', dirs: ['cs'], zh: '数据科学', en: 'Data Science',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766、数学 AA 7）', test: 'TMUA',
    alevelNote: '数学 A*；高数若开设须 A', offer: 'typical', note: 'TMUA 鼓励',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-data-science' },

  { school: 'lse', dirs: ['stats'], zh: '精算科学', en: 'Actuarial Science',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766、数学 AA 7）', test: 'TMUA',
    alevelNote: '数学 A*；高数若开设须 A', offer: 'typical', note: 'TMUA 鼓励',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-actuarial-science' },

  { school: 'lse', dirs: ['stats'], zh: '金融数学与统计', en: 'Financial Mathematics and Statistics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766、数学 AA 7）', test: 'TMUA',
    alevelNote: '数学 A*；高数若开设须 A', offer: 'typical', note: 'TMUA 鼓励',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-financial-mathematics-and-statistics' },

  { school: 'lse', dirs: ['stats', 'econ'], zh: '数学与经济', en: 'Mathematics with Economics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766、数学 AA 7）', test: 'TMUA',
    alevelNote: '数学 A*；高数若开设须 A', offer: 'typical', note: 'TMUA 鼓励',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-mathematics-with-economics' },

  { school: 'lse', dirs: ['stats'], zh: '数学、统计与商务', en: 'Mathematics, Statistics and Business',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 766、数学 AA 7）', test: 'TMUA',
    alevelNote: '数学 A*；高数若开设须 A', offer: 'typical', note: 'TMUA 鼓励',
    url: 'https://www.lse.ac.uk/study-at-lse/undergraduate/bsc-mathematics-statistics-and-business' },

  // ═══════════ UCL（新版 /courses/ 课程页；官网有反爬，链接与分数经官网+UCAS 核对） ═══════════
  { school: 'ucl', dirs: ['bio'], zh: '生物医学', en: 'Biomedical Sciences',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 38（HL 生物+化学各 6）', test: '',
    alevelNote: '生物 + 化学须 AA', offer: 'typical', note: '无笔试；GCSE 英语+数学 B/6',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/biomedical-sciences-bsc' },

  { school: 'ucl', dirs: ['bio'], zh: '生物化学', en: 'Biochemistry',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 38（HL 18、无低于 5）', test: '',
    alevelNote: '化学必修', offer: 'typical', note: '',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/biochemistry-bsc' },

  { school: 'ucl', dirs: ['bio'], zh: '化学', en: 'Chemistry',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 38（HL 18、化学 6）', test: '',
    alevelNote: '化学 A + 生物/物理/数学之一 A', offer: 'typical', note: 'GCSE 英语 C/4、数学 B/6',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/chemistry-bsc' },

  { school: 'ucl', dirs: ['physics'], zh: '物理', en: 'Physics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 19、数学 7 + 物理 6）', test: '',
    alevelNote: '数学与物理 A*A（不分先后）', offer: 'typical', note: '无额外笔试',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/physics-bsc' },

  { school: 'ucl', dirs: ['eng'], zh: '机械工程', en: 'Mechanical Engineering',
    degree: 'MEng · 4 年（另 3 年 BEng）', alevel: 'A*AA', ib: 'IB 39（HL 19、数学+物理 7,6）', test: 'TARA',
    alevelNote: '数学与物理必修，A* 落其一', offer: 'typical', note: '2027 官网列为 TARA（第一轮核验时尚未定稿）',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/mechanical-engineering-meng' },

  { school: 'ucl', dirs: ['eng'], zh: '土木工程', en: 'Civil Engineering',
    degree: 'MEng · 4 年（另 3 年 BEng）', alevel: 'A*AA', ib: 'IB 39（HL 19、物理须 SL/HL）', test: '',
    alevelNote: '至少两门 UCL 优先科目，建议数学/物理', offer: 'typical', note: '无笔试',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/civil-engineering-meng' },

  { school: 'ucl', dirs: ['eng'], zh: '电子与电气工程', en: 'Electronic and Electrical Engineering',
    degree: 'BEng · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 19、数学 7）', test: 'ESAT',
    alevelNote: '数学 A*；物理或高数优先', offer: 'typical', note: 'IET 认证；ESAT',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/electronic-and-electrical-engineering-beng' },

  { school: 'ucl', dirs: ['econ'], zh: '经济学', en: 'Economics',
    degree: 'BSc (Econ) · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 数学 7）', test: 'TMUA',
    alevelNote: '数学必修且 A*', offer: 'typical', note: '2027 起须考 TMUA；不收重考',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/economics-bsc-econ' },

  { school: 'ucl', dirs: ['econ'], zh: '管理科学', en: 'Management Science',
    degree: 'BSc · 3 年（另 4 年 MSci）', alevel: 'A*AA', ib: 'IB 39（HL 19、数学 7）', test: '',
    alevelNote: '数学 A*', offer: 'typical', note: 'GCSE 英语 B/6',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/management-science-bsc' },

  { school: 'ucl', dirs: ['cs'], zh: '计算机科学', en: 'Computer Science',
    degree: 'BSc · 3 年', alevel: 'A*A*A', ib: 'IB 40（HL 20、数学 7）', test: 'TARA',
    alevelNote: '数学或高数 A*', offer: 'typical', note: 'CS 系全部本科须考 TARA',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/computer-science-bsc' },

  { school: 'ucl', dirs: ['cs'], zh: '计算机科学（四年制）', en: 'Computer Science',
    degree: 'MEng · 4 年', alevel: 'A*A*A', ib: 'IB 40（HL 20、数学 7）', test: 'TARA',
    alevelNote: '“AAA 且数学 A*”或“数学 A + 高数 A*”', offer: 'typical', note: '含 Study Abroad / Year in Industry 变体；TARA',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/computer-science-meng' },

  { school: 'ucl', dirs: ['cs', 'stats'], zh: '数据科学（属统计系）', en: 'Data Science',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 19、数学 7）', test: '',
    alevelNote: 'A* 必须数学；高数偏好', offer: 'typical', note: 'RSS 认证、2023 新设；属统计科学系（不在 CS 系 TARA 名单内）',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/data-science-bsc' },

  { school: 'ucl', dirs: ['stats'], zh: '统计科学', en: 'Statistics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 19、数学 7）', test: '',
    alevelNote: '数学 A*；高数优先', offer: 'typical', note: '无笔试无面试',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/statistics-bsc' },

  { school: 'ucl', dirs: ['stats', 'econ'], zh: '统计、经济与金融', en: 'Statistics with Economics and Finance',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 39（HL 19、数学 7）', test: '',
    alevelNote: 'A* 必须数学；高数偏好', offer: 'typical', note: '统计系不收重考；无笔试',
    url: 'https://www.ucl.ac.uk/study/prospective-students/undergraduate/courses/statistics-economics-and-finance-bsc' },

  // ═══════════ KCL（成绩在 /requirements 子页） ═══════════
  { school: 'kcl', dirs: ['bio'], zh: '生物医学', en: 'Biomedical Science',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 36（HL 生物+化学各 6）', test: '',
    alevelNote: '生物与化学各 A', offer: 'typical', note: '',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/biomedical-science-bsc/entry-requirements' },

  { school: 'kcl', dirs: ['bio'], zh: '生物化学', en: 'Biochemistry',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 36（HL 生物+化学各 6）', test: '',
    alevelNote: '生物与化学各 A', offer: 'typical', note: '与 Biomedical Science 同档',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/biochemistry-bsc/requirements' },

  { school: 'kcl', dirs: ['bio'], zh: '药学', en: 'Pharmacy',
    degree: 'MPharm · 4 年', alevel: 'AAA', ib: 'IB 36（HL 化学 6 + 相关 6）', test: '',
    alevelNote: '化学 A + 生物/数学/物理之一 A；GCSE 英语+数学 6/B', offer: 'typical', note: '',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/pharmacy-mpharm/requirements' },

  { school: 'kcl', dirs: ['physics'], zh: '物理', en: 'Physics',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 36（HL 数学 AA+物理各 6）', test: '',
    alevelNote: '数学与物理各 A', offer: 'typical', note: '',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/physics-bsc/requirements' },

  { school: 'kcl', dirs: ['eng'], zh: '通用工程', en: 'General Engineering',
    degree: 'BEng · 3 年', alevel: 'AAA', ib: 'IB 36（HL 数学 AA 6）', test: '',
    alevelNote: '数学 A', offer: 'typical', note: '同系另有电子/生物医学工程同档',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/general-engineering-beng/entry-requirements' },

  { school: 'kcl', dirs: ['eng'], zh: '电子工程', en: 'Electronic Engineering',
    degree: 'BEng · 3 年', alevel: 'AAA', ib: 'IB 36（HL 数学 AA 6）', test: '',
    alevelNote: '数学 A；另需理科实践考核', offer: 'typical', note: '',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/electronic-engineering-beng/requirements' },

  { school: 'kcl', dirs: ['eng'], zh: '生物医学工程', en: 'Biomedical Engineering',
    degree: 'BEng · 3 年', alevel: 'AAA', ib: 'IB 36（HL 相关 6）', test: '',
    alevelNote: '数学 A + 生物/化学/CS/高数/物理之一 A', offer: 'typical', note: '',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/biomedical-engineering-beng/requirements' },

  { school: 'kcl', dirs: ['econ'], zh: '经济学', en: 'Economics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 38（HL 数学 6）', test: '',
    alevelNote: '数学 A', offer: 'typical', note: '',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/economics-bsc/requirements' },

  { school: 'kcl', dirs: ['econ'], zh: '经济与管理', en: 'Economics and Management',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 38（HL 数学 6 + HL 人文/社科 6）', test: '',
    alevelNote: '数学 A + 一门人文/社科 A', offer: 'typical', note: '',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/economics-and-management-bsc/requirements' },

  { school: 'kcl', dirs: ['econ'], zh: '商业管理', en: 'Business Management',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 38（HL 人文/社科 6）', test: '',
    alevelNote: '须含一门人文/社科 A', offer: 'typical', note: '',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/business-management-bsc/entry-requirements' },

  { school: 'kcl', dirs: ['cs'], zh: '计算机科学', en: 'Computer Science',
    degree: 'BSc · 3 年', alevel: 'A*A*A', ib: 'IB 39（HL 数学 AA 6）', test: '',
    alevelNote: '数学或高数 A', offer: 'typical', note: '',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/computer-science-bsc/requirements' },

  { school: 'kcl', dirs: ['cs'], zh: '人工智能', en: 'Artificial Intelligence',
    degree: 'BSc · 3 年', alevel: 'A*A*A', ib: 'IB 39（HL 数学 AA 6）', test: '',
    alevelNote: '数学或高数 A', offer: 'typical', note: 'Informatics 旗舰（无 Data Science 本科，AI 为替代）',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/artificial-intelligence-bsc/requirements' },

  { school: 'kcl', dirs: ['stats'], zh: '数学与统计', en: 'Mathematics with Statistics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 38（HL 数学 AA 7）', test: '',
    alevelNote: '数学 A* + 高数 A', offer: 'typical', note: '',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/mathematics-with-statistics-bsc/entry-requirements' },

  { school: 'kcl', dirs: ['stats'], zh: '数学', en: 'Mathematics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 38（HL 数学 AA 7）', test: '',
    alevelNote: '数学+高数合计 A*A（未学高数可用 AS 高数 A）', offer: 'typical', note: '高数近乎必选',
    url: 'https://www.kcl.ac.uk/study/undergraduate/courses/mathematics-bsc/requirements' },

  // ═══════════ 曼大 Manchester（2027 页；typical；CS 已较 2026 下调） ═══════════
  { school: 'manchester', dirs: ['bio'], zh: '生物化学', en: 'Biochemistry',
    degree: 'BSc · 3 年', alevel: 'AAA–AAB', ib: 'IB 35（HL 6,6,5）', test: '',
    alevelNote: '含化学；另需生物/物理/数学之一 AB', offer: 'typical', note: '',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/00521/bsc-biochemistry/' },

  { school: 'manchester', dirs: ['physics'], zh: '物理', en: 'Physics',
    degree: 'BSc · 3 年', alevel: 'A*A*A', ib: 'IB 38（HL 7,7,6）', test: '',
    alevelNote: '物理 A* + 数学/高数 A*', offer: 'typical', note: '',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/00638/bsc-physics/' },

  { school: 'manchester', dirs: ['eng'], zh: '机械工程', en: 'Mechanical Engineering',
    degree: 'MEng · 4 年', alevel: 'A*A*A', ib: 'IB 38（HL 7,7,6）', test: '',
    alevelNote: '数学、物理 + 另 1 门', offer: 'typical', note: '',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/03921/meng-mechanical-engineering/' },

  { school: 'manchester', dirs: ['eng'], zh: '电子与电气工程', en: 'Electrical and Electronic Engineering',
    degree: 'MEng · 4 年', alevel: 'A*AA', ib: 'IB 37（HL 7,6,6、数学 7）', test: '',
    alevelNote: '数学 A* + 物理/电子/高数/化学/CS 之一 A', offer: 'typical', note: 'BEng 版同存',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/03894/meng-electrical-and-electronic-engineering/' },

  { school: 'manchester', dirs: ['eng'], zh: '航空航天工程', en: 'Aerospace Engineering',
    degree: 'MEng · 4 年', alevel: 'A*AA', ib: 'IB 37（HL 7,6,6）', test: '',
    alevelNote: '数学+物理+另 1 门（无物理个案可看高数）', offer: 'typical', note: '',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/03826/meng-aerospace-engineering/' },

  { school: 'manchester', dirs: ['eng'], zh: '化学工程', en: 'Chemical Engineering',
    degree: 'MEng · 4 年', alevel: 'AAA', ib: 'IB 36（HL 6,6,6、数学仅 AA）', test: '',
    alevelNote: '数学 + 化学或物理', offer: 'typical', note: '',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/03848/meng-chemical-engineering/' },

  { school: 'manchester', dirs: ['econ'], zh: '经济学', en: 'Economics',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 36（HL 6,6,6）', test: '',
    alevelNote: '数学必修', offer: 'typical', note: 'BAEcon Economics 为 AAA 且数学非强制',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/10224/bsc-economics/' },

  { school: 'manchester', dirs: ['econ'], zh: '会计与金融（BAEcon）', en: 'Accounting and Finance',
    degree: 'BAEcon · 3 年', alevel: 'AAA', ib: 'IB 36（HL 6,6,6）', test: '',
    alevelNote: '认可科目至少 1 门（修 2 门优先）', offer: 'typical', note: '曼大无“BSc A&F”，此为旗舰',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/05151/baecon-accounting-and-finance/' },

  { school: 'manchester', dirs: ['econ'], zh: '会计学', en: 'Accounting',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 36（HL 6,6,6）', test: '',
    alevelNote: '有优先科目清单（会计/商务/经济/法律/数学等）', offer: 'typical', note: '',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/07808/bsc-accounting/' },

  { school: 'manchester', dirs: ['econ'], zh: '管理学', en: 'Management',
    degree: 'BSc · 3 年', alevel: 'AAA', ib: 'IB 36（HL 6,6,6）', test: '',
    alevelNote: '', offer: 'typical', note: '',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/03519/bsc-management/' },

  { school: 'manchester', dirs: ['cs'], zh: '计算机科学', en: 'Computer Science',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 37（HL 7,6,6、数学 AA 7）', test: '',
    alevelNote: '数学 A* + CS/高数/生物/化学/物理之一', offer: 'typical', note: '2027 已从 2026 的 A*A*A/IB38 下调',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/00560/bsc-computer-science/' },

  { school: 'manchester', dirs: ['cs', 'econ'], zh: '数据科学与经济学（BAEcon，社科院）', en: 'Data Science and Economics',
    degree: 'BAEcon · 3 年', alevel: 'AAA', ib: 'IB 36（HL 6,6,6）', test: '',
    alevelNote: '认可科目 ≥1', offer: 'typical', note: '曼大 2027 唯一含 “Data Science” 的本科',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/21873/baecon-data-science-and-economics/' },

  { school: 'manchester', dirs: ['stats'], zh: '数学与统计', en: 'Mathematics and Statistics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 37（HL 7,6,6、数学 7 仅 AA）', test: '',
    alevelNote: '数学或高数 A*', offer: 'typical', note: '',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/07101/bsc-mathematics-and-statistics/' },

  { school: 'manchester', dirs: ['stats'], zh: '数学', en: 'Mathematics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 37（HL 7,6,6、数学 7 仅 AA）', test: '',
    alevelNote: '数学或高数 A*', offer: 'typical', note: '',
    url: 'https://www.manchester.ac.uk/study/undergraduate/courses/2027/00590/bsc-mathematics/' },

  // ═══════════ 爱丁堡 Edinburgh（分数=近年获 offer 区间 from–to；苏格兰一般 4 年；经管为 MA(Hons) 本科） ═══════════
  { school: 'edinburgh', dirs: ['bio'], zh: '生物科学（生化方向）', en: 'Biological Sciences (Biochemistry)',
    degree: 'BSc (Hons) · 4 年', alevel: 'AAA–ABB', ib: 'IB 37(HL666)–32(HL655)', test: '',
    alevelNote: '生物 B、化学 B，并有一科 A', offer: 'range', note: '爱大无独立 Biochemistry 课名',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/13-biological-sciences-biochemistry' },

  { school: 'edinburgh', dirs: ['bio'], zh: '化学', en: 'Chemistry',
    degree: 'BSc (Hons) · 3–4 年', alevel: 'AAA–ABB', ib: 'IB 37(HL666)–32(HL655)', test: '',
    alevelNote: '化学 B + 数学 B', offer: 'range', note: '可直入大二 3 年读完',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/21-chemistry' },

  { school: 'edinburgh', dirs: ['physics'], zh: '物理', en: 'Physics',
    degree: 'BSc (Hons) · 4 年', alevel: 'AAA–ABB', ib: 'IB 37(HL666)–32(HL655)', test: '',
    alevelNote: '数学 A + 物理 B', offer: 'range', note: '',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/33-physics' },

  { school: 'edinburgh', dirs: ['eng'], zh: '电子与电气工程', en: 'Electronics and Electrical Engineering',
    degree: 'BEng (Hons) · 3–4 年', alevel: 'AAA–ABB', ib: 'IB 37(HL666)–32(HL655)', test: '',
    alevelNote: '数学 B + 相关理科 B', offer: 'range', note: '',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/88-electronics-and-electrical-engineering' },

  { school: 'edinburgh', dirs: ['eng'], zh: '机械工程', en: 'Mechanical Engineering',
    degree: 'BEng (Hons) · 3–4 年', alevel: 'AAA–ABB', ib: 'IB 37(HL666)–32(HL655)', test: '',
    alevelNote: '数学至少 B + 科学类 B（首选物理）', offer: 'range', note: '',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/82-mechanical-engineering' },

  { school: 'edinburgh', dirs: ['eng'], zh: '化学工程', en: 'Chemical Engineering',
    degree: 'BEng (Hons) · 3–4 年', alevel: 'AAA–ABB', ib: 'IB 37(HL666)–32(HL655)', test: '',
    alevelNote: '数学 B + 化学 B', offer: 'range', note: '',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/99-chemical-engineering' },

  { school: 'edinburgh', dirs: ['eng'], zh: '土木工程', en: 'Civil Engineering',
    degree: 'BEng (Hons) · 3–4 年', alevel: 'ABB–BBB', ib: 'IB 34(HL655)–32(HL555)', test: '',
    alevelNote: '数学 B + 科学类 B', offer: 'range', note: '土木门槛明显低于其他工程',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/76-civil-engineering' },

  { school: 'edinburgh', dirs: ['econ'], zh: '经济学', en: 'Economics',
    degree: 'MA (Hons) · 4 年', alevel: 'A*A*A*–A*AA', ib: 'IB 40(HL766)–37(HL666)', test: '',
    alevelNote: '数学 B 或 AS 数学 A', offer: 'range', note: '竞争极高，分差上限全 A*；MA=本科荣誉学位',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/122-economics' },

  { school: 'edinburgh', dirs: ['econ'], zh: '会计与金融', en: 'Accounting and Finance',
    degree: 'MA (Hons) · 4 年', alevel: 'A*AA–AAA', ib: 'IB 40(HL766)–37(HL666)', test: '',
    alevelNote: '无必修 A-level（GCSE 数学 B/6）', offer: 'range', note: '商学院极热门',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/464-accounting-and-finance' },

  { school: 'edinburgh', dirs: ['econ'], zh: '商业管理', en: 'Business Management',
    degree: 'MA (Hons) · 4 年', alevel: 'A*AA–AAA', ib: 'IB 40(HL766)–37(HL666)', test: '',
    alevelNote: 'GCSE 数学 B/6', offer: 'range', note: '',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/182-business-management' },

  { school: 'edinburgh', dirs: ['cs'], zh: '计算机科学', en: 'Computer Science',
    degree: 'BSc (Hons) · 4 年', alevel: 'A*A*A*–AAB', ib: 'IB 43(HL777)–34(HL665)', test: '',
    alevelNote: '数学 A，须入学前 2 年内取得', offer: 'range', note: '信息学院；爱大无名为 Data Science 的本科',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/57-computer-science' },

  { school: 'edinburgh', dirs: ['stats'], zh: '数学与统计', en: 'Mathematics and Statistics',
    degree: 'BSc (Hons) · 4 年', alevel: 'A*A*A*–A*AB', ib: 'IB 38(HL766)–34(HL765)', test: '',
    alevelNote: '数学 A*；建议高数', offer: 'range', note: '爱大无独立 Statistics 本科',
    url: 'https://study.ed.ac.uk/programmes/undergraduate/63-mathematics-and-statistics' },

  // ═══════════ 华威 Warwick（2027 官方页；typical） ═══════════
  { school: 'warwick', dirs: ['bio'], zh: '生物医学', en: 'Biomedical Sciences',
    degree: 'BSc · 3 年', alevel: 'AAB / AAA', ib: 'IB 34 / 36', test: '',
    alevelNote: 'AAB 含生物+第二门科学；或 AAA 含生物', offer: 'typical', note: '',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-biomedical-sciences/' },

  { school: 'warwick', dirs: ['bio'], zh: '生物化学', en: 'Biochemistry',
    degree: 'BSc · 3 年', alevel: 'AAB / AAA', ib: 'IB 34 / 36', test: '',
    alevelNote: 'AAB 含生物+化学；或 AAA 含化学+数学/物理/统计并补生物', offer: 'typical', note: '',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-biochemistry/' },

  { school: 'warwick', dirs: ['bio'], zh: '化学', en: 'Chemistry',
    degree: 'BSc · 3 年', alevel: 'AAB', ib: 'IB 34（HL 化学 6 + 第二门理科 5）', test: '',
    alevelNote: '化学 + 数学/高数/物理/生物等之一', offer: 'typical', note: '',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-chemistry/' },

  { school: 'warwick', dirs: ['physics'], zh: '物理', en: 'Physics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 38（HL 数学 AA 6 + 物理 6）', test: '',
    alevelNote: '数学或高数 + 物理 A', offer: 'typical', note: '',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-physics/' },

  { school: 'warwick', dirs: ['eng'], zh: '工程（通用，大一通识）', en: 'Engineering',
    degree: 'BEng · 3 年', alevel: 'AAA', ib: 'IB 36（数学+物理 6,6）', test: '',
    alevelNote: '数学与物理（强 profile 可只含其一）', offer: 'typical', note: '',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/beng-engineering/' },

  { school: 'warwick', dirs: ['econ'], zh: '经济学', en: 'Economics',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 38（HL 数学 6）', test: '',
    alevelNote: '数学 A', offer: 'typical', note: 'TMUA 高分可降至 AAA',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-economics/' },

  { school: 'warwick', dirs: ['econ'], zh: '会计与金融', en: 'Accounting and Finance',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 38（HL 数学 6）', test: '',
    alevelNote: '数学 A；GCSE 英语 6/B', offer: 'typical', note: '',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-accounting-finance/' },

  { school: 'warwick', dirs: ['econ'], zh: '商务与管理', en: 'Business and Management',
    degree: 'BSc · 3 年', alevel: 'A*AA', ib: 'IB 38', test: '',
    alevelNote: 'GCSE 数学 7/A + 英语 6/B', offer: 'typical', note: '2026 名 Management，2027 起更名',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-business-management/' },

  { school: 'warwick', dirs: ['econ'], zh: '国际商务与管理（4 年含海外）', en: 'International Business and Management',
    degree: 'BSc · 4 年', alevel: 'A*AA', ib: 'IB 38', test: '',
    alevelNote: 'GCSE 数学 7/A + 英语 6/B', offer: 'typical', note: '第三年海外/实习',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-international-business-management/' },

  { school: 'warwick', dirs: ['cs'], zh: '计算机科学', en: 'Computer Science',
    degree: 'BSc · 3 年', alevel: 'A*A*A', ib: 'IB 39（HL 数学 AA 7）', test: '',
    alevelNote: '数学 A*；只取前三门成绩', offer: 'typical', note: '',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-computer-science/' },

  { school: 'warwick', dirs: ['cs', 'stats'], zh: '数据科学（统计系）', en: 'Data Science',
    degree: 'BSc · 3 年', alevel: 'A*A*A', ib: 'IB 39（HL 数学 AA 7）', test: '',
    alevelNote: '数学+高数 A*A，或 A*AA + STEP2/TMUA5.0/AEA；不读高数则 A*A*A*', offer: 'typical', note: '2023 新开热门；可叠加 STEP/TMUA 替代路径',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-data-science/' },

  { school: 'warwick', dirs: ['stats'], zh: 'MORSE（数学-运筹-统计-经济）', en: 'MORSE',
    degree: 'BSc · 3 年', alevel: 'A*A*A', ib: 'IB 39（HL 数学 AA 7）', test: '',
    alevelNote: '有高数者：A*A*A 含数学+高数 A*A；无高数者 A*A*A*', offer: 'typical', note: '统计系旗舰；可 +STEP2/TMUA5.0/AEA 替代；华威无独立 Statistics 本科',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-morse/' },

  { school: 'warwick', dirs: ['stats'], zh: '数学', en: 'Mathematics',
    degree: 'BSc · 3 年', alevel: 'A*A* + A', ib: 'IB 39（3HL 数学 AA 6）', test: '',
    alevelNote: '数学+高数均 A*', offer: 'typical', note: '普遍要求 TMUA，未达标 offer 加 STEP grade 2',
    url: 'https://warwick.ac.uk/study/undergraduate/courses/bsc-mathematics/' }
];

// 各校“没有独立/无此方向”对应说明，用于筛出空白时提示
const SCHOOL_GAPS = {
  oxford:     '统计无独立专业（数学合页内 Math & Stats 路线）；管理/金融无独立本科（在 Economics and Management 内）',
  cambridge:  '生物/化学/物理并入 Natural Sciences（选 Biological/Physical 流）；统计并入数学；无独立管理/金融/会计本科（Management Studies 仅读后可转，商科直申为 Environment, Law & Economics）',
  imperial:   '无纯经济/金融/管理本科（商科仅 EFDS）；无名为 Biology 的课（对应 Biological Sciences）；统计并入数学方向',
  lse:        '社科院校：无物理/工程/生化类本科；无独立 BSc Statistics（统计由数据科学/精算/金融数学统计等承担）',
  ucl:        '计算机为 BSc/MEng 无 BEng；Data Science 属统计系（非 CS 系 TARA 名单）',
  kcl:        'Informatics 无 Data Science 本科（AI BSc 为旗舰替代）',
  manchester: '2027 无纯 BSc Data Science（对应 BAEcon Data Science and Economics）；无“BSc A&F”（对应 BAEcon A&F + BSc Accounting）',
  edinburgh:  '无独立 Biochemistry / Statistics / Data Science 课名（见对应承担课程）',
  warwick:    '无独立 BSc Statistics / Mathematics and Statistics（统计方向即 MORSE）；“International Management”已更名 International Business and Management'
};
