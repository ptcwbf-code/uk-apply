// 科目要求的结构化形式（由 build_req.js 从 alevelNote 解析生成，勿手改）
// 键 = 学校|英文专业名；只收录解析出硬性规则的条目，解析不了的留在备注里人工核对。
const SUBJ_REQ = {
 "oxford|Biochemistry (Molecular and Cellular Biology)": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": null
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "生物",
     "化学",
     "物理",
     "数学",
     "高数"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": [
   "生物",
   "化学",
   "物理",
   "数学",
   "高数"
  ],
  "approx": false,
  "unknown": 1
 },
 "oxford|Biology": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "生物"
    ],
    "min": null
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "数学",
     "物理",
     "化学"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": [
   "生物",
   "化学",
   "物理",
   "数学",
   "高数"
  ],
  "approx": false,
  "unknown": 1
 },
 "oxford|Chemistry": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": null
   },
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": [
   "生物",
   "化学",
   "物理",
   "数学",
   "高数"
  ],
  "approx": false,
  "unknown": 1
 },
 "oxford|Physics": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   },
   {
    "any": [
     "物理"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": [
   "高数",
   "数学",
   "物理"
  ],
  "approx": false,
  "unknown": 1
 },
 "oxford|Engineering Science": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   },
   {
    "any": [
     "物理"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": [
   "高数",
   "数学",
   "物理"
  ],
  "approx": false,
  "unknown": 1
 },
 "oxford|Economics and Management": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "oxford|Computer Science": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "高数"
    ],
    "min": "A*"
   },
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "oxford|Mathematics / Mathematics and Statistics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   },
   {
    "any": [
     "高数"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "oxford|Law (Jurisprudence)": {
  "kind": "none"
 },
 "oxford|Psychology (Experimental)": {
  "kind": "none"
 },
 "oxford|Human Sciences": {
  "kind": "none"
 },
 "oxford|Geography": {
  "kind": "none"
 },
 "oxford|Psychology, Philosophy and Linguistics": {
  "kind": "none"
 },
 "oxford|History": {
  "kind": "none"
 },
 "oxford|Classics": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "古典文明",
     "现代语言"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "oxford|Archaeology and Anthropology BA": {
  "kind": "none"
 },
 "oxford|Music": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "音乐"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "oxford|Philosophy and Theology": {
  "kind": "none"
 },
 "oxford|Theology and Religion": {
  "kind": "none"
 },
 "oxford|Fine Art": {
  "kind": "none"
 },
 "cambridge|Natural Sciences": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [
   {
    "n": 2,
    "of": [
     "生物",
     "化学",
     "物理",
     "数学",
     "高数"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "cambridge|Chemical Engineering and Biotechnology": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   },
   {
    "any": [
     "化学"
    ],
    "min": null
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "生物",
     "化学",
     "物理",
     "数学",
     "高数"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "cambridge|Engineering": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   },
   {
    "any": [
     "物理"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "cambridge|Economics": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "cambridge|Computer Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   },
   {
    "any": [
     "高数"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "cambridge|Mathematics": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   },
   {
    "any": [
     "高数"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": [
   "高数",
   "数学"
  ],
  "approx": false,
  "unknown": 1
 },
 "cambridge|Environment, Law, and Economics": {
  "kind": "none"
 },
 "cambridge|Law": {
  "kind": "none"
 },
 "cambridge|Human, Social, and Political Sciences": {
  "kind": "none"
 },
 "cambridge|Psychological and Behavioural Sciences": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "生物",
     "化学",
     "物理",
     "数学",
     "计算机"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "cambridge|Geography": {
  "kind": "none"
 },
 "cambridge|Education": {
  "kind": "none"
 },
 "cambridge|History": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "历史"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "cambridge|Philosophy": {
  "kind": "none"
 },
 "cambridge|English": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "英语文学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "cambridge|Classics": {
  "kind": "none"
 },
 "cambridge|Archaeology BA": {
  "kind": "none"
 },
 "cambridge|Modern and Medieval Languages": {
  "kind": "partial",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "现代语言"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "cambridge|Music": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "音乐"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "cambridge|History of Art": {
  "kind": "none"
 },
 "cambridge|Asian and Middle Eastern Studies": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "现代语言"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "cambridge|Theology, Religion and Philosophy of Religion": {
  "kind": "none"
 },
 "cambridge|History and Modern Languages": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "历史"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "cambridge|History and Politics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "历史"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Medical Biosciences": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "生物"
    ],
    "min": "A"
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "高数",
     "数学",
     "物理",
     "化学"
    ],
    "min": "A"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Biochemistry": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": "A"
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "数学",
     "物理",
     "生物"
    ],
    "min": "A"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Biological Sciences": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "生物"
    ],
    "min": "A"
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "数学",
     "物理",
     "化学"
    ],
    "min": "A"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Chemistry": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": "A"
   },
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Physics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "物理"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Aeronautical Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "物理"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Mechanical Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "物理"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Electrical and Electronic Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "物理"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Civil Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "物理"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Chemical Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Design Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Economics, Finance and Data Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Computing": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "imperial|Mathematics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "高数"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Economics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Econometrics and Mathematical Economics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Finance": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Accounting and Finance": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Economics and Data Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "高数"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Management": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Data Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "高数"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Actuarial Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "高数"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Financial Mathematics and Statistics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "高数"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Mathematics with Economics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "高数"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|Mathematics, Statistics and Business": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "高数"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|LLB Bachelor of Laws": {
  "kind": "none"
 },
 "lse|BSc Sociology": {
  "kind": "none"
 },
 "lse|BSc Politics": {
  "kind": "none"
 },
 "lse|BSc Politics and Economics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|BSc International Relations": {
  "kind": "none"
 },
 "lse|BSc Psychological and Behavioural Science": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "数学",
     "物理",
     "化学",
     "生物",
     "心理学"
    ],
    "min": "A"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|BA Social Anthropology": {
  "kind": "none"
 },
 "lse|BA Geography": {
  "kind": "none"
 },
 "lse|BSc Economic History": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "经济",
     "历史"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|BSc Philosophy, Politics and Economics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "lse|BSc International Social and Public Policy": {
  "kind": "none"
 },
 "lse|BSc Politics and Philosophy": {
  "kind": "none"
 },
 "ucl|Biomedical Sciences": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": "A"
   },
   {
    "any": [
     "生物"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "ucl|Biochemistry": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "ucl|Chemistry": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": "A"
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "数学",
     "物理",
     "生物"
    ],
    "min": "A"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "ucl|Electronic and Electrical Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "ucl|Economics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "ucl|Management Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "ucl|Computer Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学",
     "高数"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "ucl|Data Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "ucl|Statistics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "ucl|Statistics with Economics and Finance": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "ucl|Psychology with Education BSc": {
  "kind": "none"
 },
 "ucl|Psychology BSc": {
  "kind": "partial",
  "need": [],
  "pick": [
   {
    "n": 2,
    "of": [
     "数学",
     "物理",
     "化学",
     "生物",
     "计算机",
     "心理学"
    ],
    "min": "A*"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": true,
  "unknown": 1
 },
 "ucl|Law LLB": {
  "kind": "none"
 },
 "ucl|Politics and International Relations BSc": {
  "kind": "none"
 },
 "ucl|Geography BSc": {
  "kind": "none"
 },
 "ucl|Comparative Literature BA": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "历史",
     "英语文学",
     "英语语言",
     "哲学",
     "宗教研究",
     "古典文明",
     "艺术史",
     "现代语言"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "ucl|History BA": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "历史"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "kcl|Biomedical Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "生物"
    ],
    "min": "A"
   },
   {
    "any": [
     "化学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Biochemistry": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "生物"
    ],
    "min": "A"
   },
   {
    "any": [
     "化学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Pharmacy": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": "A"
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "数学",
     "物理",
     "生物"
    ],
    "min": "A"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Physics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   },
   {
    "any": [
     "物理"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|General Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Electronic Engineering": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "kcl|Biomedical Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "高数",
     "物理",
     "化学",
     "生物",
     "计算机"
    ],
    "min": "A"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Economics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Economics and Management": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   },
   {
    "any": [
     "历史",
     "英语文学",
     "英语语言",
     "哲学",
     "宗教研究",
     "古典文明",
     "艺术史",
     "现代语言"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Business Management": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "历史",
     "英语文学",
     "英语语言",
     "哲学",
     "宗教研究",
     "古典文明",
     "艺术史",
     "现代语言"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Computer Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学",
     "高数"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Artificial Intelligence": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学",
     "高数"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Mathematics with Statistics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "高数"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Mathematics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "高数"
    ],
    "min": "A*"
   },
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Social Sciences BA": {
  "kind": "none"
 },
 "kcl|English Language and Linguistics BA": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "英语文学",
     "英语语言",
     "心理学",
     "现代语言"
    ],
    "min": "A"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|War Studies BA": {
  "kind": "none"
 },
 "kcl|International Relations BA": {
  "kind": "none"
 },
 "kcl|Psychology BSc": {
  "kind": "partial",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "数学",
     "物理",
     "化学",
     "生物",
     "计算机",
     "心理学"
    ],
    "min": "A"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "kcl|Law LLB": {
  "kind": "none"
 },
 "kcl|Political Economy BA/BSc": {
  "kind": "none"
 },
 "kcl|Geography BA": {
  "kind": "none"
 },
 "kcl|International Development BA": {
  "kind": "none"
 },
 "kcl|Global Health & Social Science BA": {
  "kind": "none"
 },
 "kcl|Philosophy BA": {
  "kind": "none"
 },
 "kcl|History BA": {
  "kind": "none"
 },
 "kcl|Ancient History BA": {
  "kind": "none"
 },
 "kcl|English BA": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "英语文学",
     "英语语言"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "kcl|Digital Media and Culture BA": {
  "kind": "none"
 },
 "manchester|Biochemistry": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "manchester|Electrical and Electronic Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "高数",
     "物理",
     "化学",
     "计算机"
    ],
    "min": "A"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|Aerospace Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   },
   {
    "any": [
     "物理"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|Chemical Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "化学",
     "物理"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|Materials Science and Engineering": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 2,
    "of": [
     "数学",
     "物理",
     "化学"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|Economics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|Management": {
  "kind": "none"
 },
 "manchester|Computer Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "高数",
     "物理",
     "化学",
     "生物",
     "计算机"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|Mathematics and Statistics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学",
     "高数"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|Mathematics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学",
     "高数"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|BSocSc Sociology": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "社会学",
     "政治",
     "经济",
     "心理学",
     "地理",
     "人类学",
     "法律",
     "生物",
     "化学",
     "物理",
     "数学",
     "历史",
     "哲学"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|BA Criminology": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "历史",
     "心理学",
     "政治",
     "社会学",
     "法律"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|BSocSc Politics and International Relations": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "经济",
     "历史",
     "地理",
     "政治",
     "社会学",
     "哲学"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|LLB Law": {
  "kind": "partial",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "数学",
     "经济",
     "历史",
     "政治",
     "哲学",
     "法律"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 2
 },
 "manchester|BSc Psychology": {
  "kind": "partial",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "高数",
     "数学",
     "物理",
     "化学",
     "生物",
     "心理学"
    ],
    "min": null
   }
  ],
  "excl": [
   "艺术与设计",
   "音乐",
   "戏剧"
  ],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "manchester|BSocSc Social Anthropology": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "历史",
     "地理",
     "政治",
     "社会学",
     "哲学",
     "人类学"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "manchester|LLB Law with Criminology": {
  "kind": "partial",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "心理学",
     "政治",
     "社会学",
     "法律"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "manchester|Film Studies and History BA": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "历史"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "edinburgh|Biological Sciences (Biochemistry)": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "生物"
    ],
    "min": "B"
   },
   {
    "any": [
     "化学"
    ],
    "min": "B"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "edinburgh|Chemistry": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": "B"
   },
   {
    "any": [
     "数学"
    ],
    "min": "B"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "edinburgh|Physics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   },
   {
    "any": [
     "物理"
    ],
    "min": "B"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "edinburgh|Electronics and Electrical Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "B"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "edinburgh|Chemical Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "B"
   },
   {
    "any": [
     "化学"
    ],
    "min": "B"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "edinburgh|Economics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学",
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "edinburgh|Accounting and Finance": {
  "kind": "none"
 },
 "edinburgh|Business Management": {
  "kind": "none"
 },
 "edinburgh|Computer Science": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "edinburgh|Mathematics and Statistics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "edinburgh|Sociology MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Politics MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Social Anthropology MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|International Relations MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Psychology BSc (Hons)": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "生物",
     "化学",
     "物理",
     "数学",
     "计算机",
     "地理",
     "心理学"
    ],
    "min": "B"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "edinburgh|Social Policy and Sociology MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Philosophy MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Physical Education MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Primary Education with Gaelic (Learners) MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|History MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Linguistics MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Geography MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Geography BSc (Hons)": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 2,
    "of": [
     "生物",
     "化学",
     "物理",
     "数学",
     "地理"
    ],
    "min": "B"
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "edinburgh|Health in Social Science MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Social Work BSc (Hons)": {
  "kind": "none"
 },
 "edinburgh|History of Art MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Music BMus (Hons)": {
  "kind": "none"
 },
 "edinburgh|Theology MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Celtic MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Classics MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Ancient History MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Archaeology MA (Hons)": {
  "kind": "none"
 },
 "edinburgh|Film and Television BA (Hons)": {
  "kind": "none"
 },
 "warwick|Biomedical Sciences": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "生物"
    ],
    "min": null
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "生物",
     "化学",
     "物理"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "warwick|Chemistry": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": null
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "高数",
     "数学",
     "物理",
     "生物"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "warwick|Economics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "warwick|Accounting and Finance": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "warwick|Business and Management": {
  "kind": "none"
 },
 "warwick|International Business and Management": {
  "kind": "none"
 },
 "warwick|Computer Science": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "warwick|Data Science": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "高数"
    ],
    "min": "A*"
   },
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 2
 },
 "warwick|MORSE": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "高数"
    ],
    "min": "A*"
   },
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "warwick|Mathematics": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   },
   {
    "any": [
     "高数"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "warwick|Sociology BA": {
  "kind": "none"
 },
 "warwick|Politics BA": {
  "kind": "none"
 },
 "warwick|Politics and International Studies BA": {
  "kind": "none"
 },
 "warwick|Law LLB": {
  "kind": "none"
 },
 "warwick|Education BA": {
  "kind": "none"
 },
 "warwick|Philosophy BA": {
  "kind": "none"
 },
 "warwick|Film Studies BA": {
  "kind": "rules",
  "need": [],
  "pick": [
   {
    "n": 1,
    "of": [
     "计算机",
     "历史",
     "英语文学",
     "英语语言",
     "政治",
     "社会学",
     "哲学",
     "宗教研究",
     "戏剧",
     "传媒",
     "古典文明"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "hku|MBBS": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "生物",
     "化学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "hku|BNurs": {
  "kind": "none"
 },
 "hku|BPharm": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "hku|BBiomedSc": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "生物",
     "化学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "hku|BSc(QFin)": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "高数"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "hku|BBA(Acc&Fin)/(ADA)": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "hku|BEng (CE/EE/EEE)": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "hku|BSc Actuarial Science": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": "A*"
   },
   {
    "any": [
     "高数"
    ],
    "min": "A*"
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "hku|Bachelor of Arts": {
  "kind": "none"
 },
 "hku|Bachelor of Social Sciences": {
  "kind": "none"
 },
 "hku|Bachelor of Psychology": {
  "kind": "none"
 },
 "hku|Bachelor of Social Work": {
  "kind": "none"
 },
 "hku|Bachelor of Laws": {
  "kind": "none"
 },
 "hku|Bachelor of Journalism, Media and Artificial Intelligence": {
  "kind": "none"
 },
 "hku|BA in Global Creative Industries": {
  "kind": "none"
 },
 "hku|Bachelor of Arts and Bachelor of Education (Language Education)": {
  "kind": "none"
 },
 "hku|Bachelor of Education in Early Childhood Education and Special Education": {
  "kind": "none"
 },
 "hku|Bachelor of Science in Speech-Language Pathology": {
  "kind": "none"
 },
 "hku|Bachelor of Arts in Humanities and Digital Technologies": {
  "kind": "none"
 },
 "hku|Bachelor of Arts and Bachelor of Laws": {
  "kind": "none"
 },
 "hku|Bachelor of Social Sciences (Government and Laws) and Bachelor of Laws": {
  "kind": "none"
 },
 "cuhk|MBChB": {
  "kind": "none"
 },
 "cuhk|Biomedical Sciences": {
  "kind": "none"
 },
 "cuhk|Science": {
  "kind": "none"
 },
 "cuhk|Enrichment Mathematics": {
  "kind": "none"
 },
 "cuhk|Global Business Studies": {
  "kind": "none"
 },
 "cuhk|Integrated BBA (IBBA)": {
  "kind": "none"
 },
 "cuhk|Quantitative Finance": {
  "kind": "none"
 },
 "cuhk|Insurance, Financial & Actuarial Analysis (IFAA)": {
  "kind": "none"
 },
 "cuhk|Economics": {
  "kind": "none"
 },
 "cuhk|Financial Technology": {
  "kind": "none"
 },
 "cuhk|Computer Science & Engineering": {
  "kind": "none"
 },
 "cuhk|AI: Systems and Technologies": {
  "kind": "none"
 },
 "cuhk|Computational Data Science": {
  "kind": "none"
 },
 "cuhk|Risk Management Science": {
  "kind": "none"
 },
 "cuhk|Chinese Language and Literature": {
  "kind": "none"
 },
 "cuhk|English": {
  "kind": "none"
 },
 "cuhk|Translation": {
  "kind": "none"
 },
 "cuhk|Psychology": {
  "kind": "none"
 },
 "cuhk|Government and Public Administration": {
  "kind": "none"
 },
 "cuhk|Journalism and Communication": {
  "kind": "none"
 },
 "cuhk|Global Communication": {
  "kind": "none"
 },
 "cuhk|Bachelor of Laws": {
  "kind": "none"
 },
 "cuhk|History": {
  "kind": "none"
 },
 "cuhk|Philosophy": {
  "kind": "none"
 },
 "cuhk|Linguistics": {
  "kind": "none"
 },
 "cuhk|Japanese Studies": {
  "kind": "none"
 },
 "cuhk|Music": {
  "kind": "none"
 },
 "cuhk|Sociology": {
  "kind": "none"
 },
 "cuhk|Social Work": {
  "kind": "none"
 },
 "cuhk|English Studies (BA) and English Language Education (BEd)": {
  "kind": "none"
 },
 "hkust|Science (Group A) — Physical Sciences": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "物理",
     "化学"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "hkust|Science (Group B) — Natural Sciences": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "化学",
     "生物"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "hkust|BSc Biomedical and Health Sciences": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [
   {
    "n": 1,
    "of": [
     "化学",
     "生物"
    ],
    "min": null
   }
  ],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "hkust|BEng Computer Engineering": {
  "kind": "rules",
  "need": [
   {
    "any": [
     "数学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false
 },
 "hkust|BBA Global Business": {
  "kind": "none"
 },
 "hkust|BSc in Global China Studies": {
  "kind": "none"
 },
 "hkust|BSc in Quantitative Social Analysis": {
  "kind": "none"
 },
 "cityu|BSc Computer Science": {
  "kind": "none"
 },
 "cityu|BSc Cybersecurity": {
  "kind": "none"
 },
 "cityu|Electrical Engineering": {
  "kind": "none"
 },
 "cityu|BBA Accountancy": {
  "kind": "none"
 },
 "cityu|BBA Finance": {
  "kind": "none"
 },
 "cityu|BBA Business Economics": {
  "kind": "none"
 },
 "cityu|Economics and Finance": {
  "kind": "none"
 },
 "cityu|BSc Computational Finance & FinTech": {
  "kind": "none"
 },
 "cityu|BBA Global Business": {
  "kind": "none"
 },
 "cityu|BBA Business Decision Analytics": {
  "kind": "none"
 },
 "cityu|BSc Chemistry": {
  "kind": "none"
 },
 "cityu|BSc Computing Mathematics": {
  "kind": "none"
 },
 "cityu|BSc Physics": {
  "kind": "none"
 },
 "cityu|Media and Communication": {
  "kind": "none"
 },
 "cityu|Creative Media": {
  "kind": "none"
 },
 "cityu|BA Chinese and History": {
  "kind": "none"
 },
 "cityu|BSocSc Psychology": {
  "kind": "none"
 },
 "cityu|BSocSc Public Affairs and Management": {
  "kind": "none"
 },
 "cityu|BSocSc Social Work": {
  "kind": "none"
 },
 "cityu|BA Linguistics and Language Applications": {
  "kind": "none"
 },
 "cityu|BSocSc International Relations and Global Affairs": {
  "kind": "none"
 },
 "cityu|BSocSc Crime Science": {
  "kind": "none"
 },
 "polyu|BSc (Hons) in Nursing": {
  "kind": "none"
 },
 "polyu|BSc (Hons) in Physiotherapy": {
  "kind": "none"
 },
 "polyu|BSc (Hons) in Radiography": {
  "kind": "none"
 },
 "polyu|BSc (Hons) in Medical Laboratory Science": {
  "kind": "none"
 },
 "polyu|Biotechnology & Chemical Technology": {
  "kind": "none"
 },
 "polyu|BSc (Hons) in Physics": {
  "kind": "none"
 },
 "polyu|Information & AI Engineering": {
  "kind": "none"
 },
 "polyu|BBA Scheme in Accounting and Finance": {
  "kind": "none"
 },
 "polyu|Computing and AI": {
  "kind": "none"
 },
 "polyu|Data Science and AI": {
  "kind": "none"
 },
 "polyu|Applied Mathematics and Finance Analytics": {
  "kind": "none"
 },
 "polyu|BA (Hons) Scheme in Design": {
  "kind": "none"
 },
 "polyu|BSc (Hons) Scheme in Hotel and Tourism Management": {
  "kind": "none"
 },
 "polyu|BA (Hons) in English and Applied Linguistics": {
  "kind": "none"
 },
 "polyu|BA (Hons) Scheme in Applied Social Sciences": {
  "kind": "none"
 },
 "polyu|BSc (Hons) in Language Science and Technology": {
  "kind": "none"
 },
 "polyu|Bachelor's Degree Scheme in Humanities": {
  "kind": "none"
 },
 "polyu|BSc (Hons) in Speech Therapy": {
  "kind": "none"
 },
 "polyu|BA (Hons) Scheme in Fashion": {
  "kind": "none"
 },
 "hkbu|BBA (Hons)": {
  "kind": "none"
 },
 "hkbu|BBA (Hons) — Accounting Concentration": {
  "kind": "none"
 },
 "hkbu|BSc (Hons) in Business Computing and Data Analytics": {
  "kind": "none"
 },
 "hkbu|BSc (Hons)": {
  "kind": "none"
 },
 "hkbu|BCM & BSc (Hons) in Biomedical Science": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "生物",
     "化学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "hkbu|BPharm (Hons) in Chinese Medicine": {
  "kind": "partial",
  "need": [
   {
    "any": [
     "化学"
    ],
    "min": null
   }
  ],
  "pick": [],
  "excl": [],
  "starIn": null,
  "approx": false,
  "unknown": 1
 },
 "hkbu|BComm (Hons) (Journalism and Digital Media / Public Relations and Advertising)": {
  "kind": "none"
 },
 "hkbu|BA (Hons) in Film and Television": {
  "kind": "none"
 },
 "hkbu|BA (Hons) in Visual Arts": {
  "kind": "none"
 },
 "hkbu|BASc (Hons) in Arts and Technology": {
  "kind": "none"
 },
 "hkbu|BA (Hons) / BSocSc (Hons) (European Studies / Geography / Global and China Studies / Government and International Studies / History / Sociology)": {
  "kind": "none"
 },
 "hkbu|Bachelor of Social Work (Hons)": {
  "kind": "none"
 },
 "hkbu|BA (Hons) in Religion, Philosophy and Ethics": {
  "kind": "none"
 },
 "hkbu|BA (Hons) in Physical Education and Recreation Management": {
  "kind": "none"
 },
 "hkbu|BASc (Hons) in Digital Futures and Humanities": {
  "kind": "none"
 },
 "hkbu|BSocSc (Hons) / BSc (Hons) in Innovation in Health and Social Well-Being": {
  "kind": "none"
 },
 "eduhk|BSc (Hons) in Artificial Intelligence and Educational Technology": {
  "kind": "none"
 },
 "eduhk|BSc (Hons) in AI and Educational Technology & BEd (Hons) (Primary Mathematics)": {
  "kind": "none"
 },
 "eduhk|BA (Hons) in Personal Finance & BEd (Hons) (Business, Accounting and Financial Studies)": {
  "kind": "none"
 },
 "eduhk|BA (Hons) in Special Education": {
  "kind": "none"
 },
 "eduhk|BSocSc (Hons) in Psychology": {
  "kind": "none"
 },
 "eduhk|BSc (Hons) in Integrated Environmental Management & BEd (Hons) (Science)": {
  "kind": "none"
 },
 "eduhk|BSocSc (Hons) in Psychology & BEd (Hons) (Early Childhood Education)": {
  "kind": "none"
 },
 "eduhk|BSc (Hons) in Sports Science and Coaching & BEd (Hons) (Physical Education)": {
  "kind": "none"
 },
 "eduhk|BA (Hons) in Creative and Digital Arts & BEd (Hons) (Visual Arts)": {
  "kind": "none"
 },
 "eduhk|BA (Hons) in Digital Chinese Culture and Communication & BEd (Hons) (Chinese Language)": {
  "kind": "none"
 },
 "eduhk|BA (Hons) in Creative and Digital Arts & BEd (Hons) (Music)": {
  "kind": "none"
 },
 "eduhk|BA (Hons) in Heritage Education and Arts Management": {
  "kind": "none"
 },
 "eduhk|BA (Hons) in Digital Chinese Culture and Communication": {
  "kind": "none"
 },
 "eduhk|BA (Hons) in English Studies and Digital Communication": {
  "kind": "none"
 },
 "eduhk|BA (Hons) in Creative and Digital Arts": {
  "kind": "none"
 },
 "lingnan|BBA (Hons) — Accounting and Corporate Governance": {
  "kind": "none"
 },
 "lingnan|BBA (Hons) — Finance": {
  "kind": "none"
 },
 "lingnan|BBA (Hons) — Risk and Insurance Management": {
  "kind": "none"
 },
 "lingnan|BBA (Hons) — Marketing and Social Media": {
  "kind": "none"
 },
 "lingnan|BSocSc (Hons) — Economics": {
  "kind": "none"
 },
 "lingnan|BSocSc (Hons) — Psychology": {
  "kind": "none"
 },
 "lingnan|BSocSc (Hons) — Government and International Affairs": {
  "kind": "none"
 },
 "lingnan|BA (Hons) in Chinese": {
  "kind": "none"
 },
 "lingnan|BA (Hons) in English Studies": {
  "kind": "none"
 },
 "lingnan|BA (Hons) in Translation": {
  "kind": "none"
 },
 "lingnan|BLA (Hons) in Global Development and Sustainability": {
  "kind": "none"
 },
 "lingnan|BSocSc (Hons) — Sociology": {
  "kind": "none"
 },
 "lingnan|BSocSc (Hons) — Social and Public Policy Studies": {
  "kind": "none"
 },
 "lingnan|BA (Hons) in Cultural Studies": {
  "kind": "none"
 },
 "lingnan|BA (Hons) in History": {
  "kind": "none"
 },
 "lingnan|BA (Hons) in Philosophy": {
  "kind": "none"
 },
 "lingnan|BA (Hons) in Film and Visual Art": {
  "kind": "none"
 }
};
