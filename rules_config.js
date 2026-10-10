/**
 * 基地狼人殺 - 規則與板型獨立設定檔 (rules_config.js)
 * 基準版本：完整定稿角色庫 (26位) + 第一波 8 套板型
 */

// ==========================================
// 1. 全域角色屬性字典 (雙屬性架構)
// seatType: GOD(神職) / VILLAGER(平民坑) / WEREWOLF(狼坑) -> 用於屠邊結算與存活面板
// faction: villager(好人) / werewolf(狼人) / null(動態結算) -> 用於天梯分與勝負結算
// ==========================================
const ROLE_DEFINITIONS = {
  // --- 好人陣營：神職坑 (GOD) ---
  "預言家": { seatType: "GOD", faction: "villager", canCheck: true },
  "女巫": { seatType: "GOD", faction: "villager", hasAntidote: true, hasPoison: true },
  "獵人": { seatType: "GOD", faction: "villager", canShoot: true },
  "白痴": { seatType: "GOD", faction: "villager", canImmuneExile: true },
  "守衛": { seatType: "GOD", faction: "villager" },
  "攝夢人": { seatType: "GOD", faction: "villager" },
  "魔術師": { seatType: "GOD", faction: "villager" },
  "騎士": { seatType: "GOD", faction: "villager", canDuel: true },
  "守墓人": { seatType: "GOD", faction: "villager" },
  "烏鴉": { seatType: "GOD", faction: "villager" },
  "獵魔人": { seatType: "GOD", faction: "villager" },
  "定序王子": { seatType: "GOD", faction: "villager" },
  "熊": { seatType: "GOD", faction: "villager" },
  "白晝學者": { seatType: "GOD", faction: "villager" },
  "覺醒預言家": { seatType: "GOD", faction: "villager" },
  "通靈師": { seatType: "GOD", faction: "villager" },
  "覺醒攝夢人": { seatType: "GOD", faction: "villager" },
  "黑市商人": { seatType: "GOD", faction: "villager" }, // 超級黑商板型中列入神職

  // --- 好人陣營：平民坑 (VILLAGER) ---
  "平民": { seatType: "VILLAGER", faction: "villager" },
  "燈影預言家": { seatType: "VILLAGER", faction: "villager" }, // 定稿：物理算民，對外查驗反轉
  "混血兒": { seatType: "VILLAGER", faction: null }, // 首夜選榜樣，物理佔民坑，陣營隨榜樣
  "覺醒孤獨少女": { seatType: "VILLAGER", faction: null }, // 首夜追崇，物理佔民坑，陣營隨偶像

  // --- 狼人陣營：狼坑 (WEREWOLF) ---
  "狼人": { seatType: "WEREWOLF", faction: "werewolf" },
  "狼王": { seatType: "WEREWOLF", faction: "werewolf", canShoot: true },
  "白狼王": { seatType: "WEREWOLF", faction: "werewolf", canSelfExplodeShoot: true },
  "狼美人": { seatType: "WEREWOLF", faction: "werewolf", canCharm: true },
  "覺醒狼美人": { seatType: "WEREWOLF", faction: "werewolf" },
  "赤月使徒": { seatType: "WEREWOLF", faction: "werewolf" },
  "機械狼": { seatType: "WEREWOLF", faction: "werewolf" },
  "尋香魅影": { seatType: "WEREWOLF", faction: "werewolf" },
  "夢魘": { seatType: "WEREWOLF", faction: "werewolf" },
  "覺醒石像鬼": { seatType: "WEREWOLF", faction: "werewolf" },
  "寂夜導師": { seatType: "WEREWOLF", faction: "werewolf" },
  "狼兄": { seatType: "WEREWOLF", faction: "werewolf" },
  "狼弟": { seatType: "WEREWOLF", faction: "werewolf" }
};

// ==========================================
// 2. 第一波 8 套確認板型資料庫
// ==========================================
const BOARD_DATABASE = {
  // 1. 標準：預女獵白混
  "預女獵白混": {
    name: "預女獵白混 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "白痴", "混血兒", "平民", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "白痴", "混血兒", "平民", "平民", "平民", "狼人", "狼人", "狼人", "狼人"],
    nightOrder: ["混血兒", "狼人", "女巫", "預言家"]
  },

  // 2. 覺醒石像鬼
  "覺醒石像鬼": {
    name: "覺醒石像鬼 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "守衛", "守墓人", "平民", "覺醒石像鬼", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "守衛", "守墓人", "平民", "平民", "平民", "平民", "覺醒石像鬼", "狼人", "狼人"],
    nightOrder: ["守衛", "狼人", "覺醒石像鬼", "女巫", "預言家", "守墓人"]
  },

  // 3. 夢魘攝夢人
  "夢魘攝夢人": {
    name: "夢魘攝夢人 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "攝夢人", "平民", "夢魘", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "攝夢人", "平民", "平民", "平民", "平民", "夢魘", "狼人", "狼人", "狼人"],
    nightOrder: ["夢魘", "攝夢人", "狼人", "女巫", "預言家"]
  },

  // 4. 狼王魔術師
  "狼王魔術師": {
    name: "狼王魔術師 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "魔術師", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "魔術師", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    nightOrder: ["魔術師", "狼人", "女巫", "預言家"]
  },

  // 5. 狼王攝夢人
  "狼王攝夢人": {
    name: "狼王攝夢人 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "攝夢人", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "攝夢人", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    nightOrder: ["攝夢人", "狼人", "女巫", "預言家"]
  },

  // 6. 超級黑商
  "超級黑商": {
    name: "超級黑商 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "守衛", "黑市商人", "平民", "狼兄", "狼弟", "狼人"],
    defaultSlots: ["預言家", "女巫", "守衛", "黑市商人", "平民", "平民", "平民", "平民", "狼兄", "狼弟", "狼人", "狼人"],
    nightOrder: ["黑市商人", "守衛", "狼人", "女巫", "預言家"]
  },

  // 7. 狼美騎士
  "狼美騎士": {
    name: "狼美騎士 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "守衛", "騎士", "平民", "狼美人", "狼人"],
    defaultSlots: ["預言家", "女巫", "守衛", "騎士", "平民", "平民", "平民", "平民", "狼美人", "狼人", "狼人", "狼人"],
    nightOrder: ["守衛", "狼人", "狼美人", "女巫", "預言家"]
  },

  // 8. 狼王守衛
  "狼王守衛": {
    name: "狼王守衛 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "守衛", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "守衛", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    nightOrder: ["守衛", "狼人", "女巫", "預言家"]
  }
};
