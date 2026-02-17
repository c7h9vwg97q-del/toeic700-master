const wordData = [
  { id: "a001", word: "accommodate", meaning: "収容する", example: "This room can accommodate up to 50 people." },
  { id: "a002", word: "approximate", meaning: "おおよその", example: "What is the approximate cost of the repair?" },
  { id: "a003", word: "beneficial", meaning: "有益な", example: "Regular exercise is beneficial to health." },
  { id: "a004", word: "collaborate", meaning: "協力する", example: "We need to collaborate on this project." },
  { id: "a005", word: "comprehensive", meaning: "包括的な", example: "The report offers a comprehensive analysis." },
  { id: "a006", word: "designated", meaning: "指定された", example: "Please park in the designated area." },
  { id: "a007", word: "eliminate", meaning: "取り除く", example: "We must eliminate unnecessary costs." },
  { id: "a008", word: "fluctuate", meaning: "変動する", example: "Stock prices fluctuate daily." },
  { id: "a009", word: "implement", meaning: "実行する", example: "The new policy will be implemented next month." },
  { id: "a010", word: "mandatory", meaning: "義務的な", example: "Attendance at the meeting is mandatory." },
  { id: "a011", word: "objective", meaning: "目的・客観的な", example: "What is the main objective of this campaign?" },
  { id: "a012", word: "precaution", meaning: "予防措置", example: "We took every precaution to avoid mistakes." },
  { id: "a013", word: "reluctant", meaning: "気が進まない", example: "He was reluctant to sign the contract." },
  { id: "a014", word: "subsequent", meaning: "その後の", example: "The first meeting was a failure, but subsequent ones were better." },
  { id: "a015", word: "terminate", meaning: "終わらせる", example: "They decided to terminate the agreement." },
  { id: "a016", word: "versatile", meaning: "多才な・多目的な", example: "This tool is versatile and easy to use." },
  { id: "a017", word: "warranty", meaning: "保証", example: "The refrigerator is under warranty for two years." },
  { id: "a018", word: "accumulate", meaning: "蓄積する", example: "Snow began to accumulate on the roads." },
  { id: "a019", word: "adhere", meaning: "遵守する", example: "Staff must adhere to the safety rules." },
  { id: "a020", word: "brief", meaning: "簡潔な", example: "She gave a brief explanation of the project." }
];

const passageData = [
  {
    id: "p001",
    title: "Notice to Employees",
    text: "Please be advised that the company will (____) a new security system starting next Monday. All employees must carry their ID badges at all times.",
    targetId: "a009", // implement
    questions: [
      { type: "vocab", q: "空所に最適な語は？", options: ["implement", "fluctuate", "brief", "terminate"], ans: "implement" },
      { type: "content", q: "通知の内容は？", options: ["セキュリティ導入", "休日案内", "清掃案内", "給与改定"], ans: "セキュリティ導入" }
    ]
  },
  {
    id: "p002",
    title: "Reservation",
    text: "The grand ballroom can (____) up to 200 guests. Please confirm your guest list.",
    targetId: "a001", // accommodate
    questions: [
      { type: "vocab", q: "空所に最適な語は？", options: ["eliminate", "accommodate", "adhere", "fluctuate"], ans: "accommodate" },
      { type: "content", q: "最大人数は？", options: ["50名", "100名", "200名", "500名"], ans: "200名" }
    ]
  }
];