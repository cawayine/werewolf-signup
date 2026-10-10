/**
 * 基地狼人殺 - 規則與板型獨立設定檔 (rules_config.js)
 * 基準版本：完整定稿角色庫 (26位) + 8 套板型 + 技能規則參數化整合
 */

// ==========================================
// 1. 全域裁決通則 (GLOBAL_RULES)
// ==========================================
const GLOBAL_RULES = {
  // 爪擊在先原則：同夜毒殺與狼刀同時滿足雙方屠邊/獲勝條件時，狼人陣營獲勝
  witchWolfTieBreaker: "WEREWOLF_WIN",

  // 白狼王查驗結果歸類為狼人
  whiteWolfCheckResult: "WEREWOLF",

  // 騎士決鬥狼人出局通則：狼人出局不翻牌且不觸發任何技能（如狼王開槍、狼美人魅惑連帶失效）
  duelWolfNoSkill: true,

  // 連續兩天警長競選自爆：警徽正式流失（吞警徽）
  consecutiveExplodeBadgeLoss: true
};

// ==========================================
// 2. 全域角色屬性字典 (ROLE_DEFINITIONS)
// seatType: GOD(神職) / VILLAGER(平民坑) / WEREWOLF(狼坑) -> 屠邊計算與即時坑位監控
// faction: villager(好人) / werewolf(狼人) / null(動態結算) -> 勝負與積分計算
// ==========================================
const ROLE_DEFINITIONS = {
  // --- 好人陣營：神職坑 (GOD) ---
  "預言家": {
    seatType: "GOD",
    faction: "villager",
    canCheck: true,
    allowRepeatCheck: true // 允許重複查驗同一目標
  },

  "女巫": {
    seatType: "GOD",
    faction: "villager",
    hasAntidote: true,
    hasPoison: true,
    canUseBothPotionsSameNight: false, // 不可同夜並用兩瓶藥
    canSelfHealFirstNight: false,       // 定稿通則：所有板型一律禁止首夜自救
    hideKillInfoAfterAntidote: true     // 解藥用後，該晚不再顯示狼刀資訊
  },

  "獵人": {
    seatType: "GOD",
    faction: "villager",
    canShoot: true,
    triggerCondition: ["WOLF_KILL", "EXILE"], // 狼刀或放逐出局可開槍
    immunePoisonShoot: false,                 // 被毒殺不可開槍
    immuneDreamShoot: false                   // 被攝夢人夢亡不可開槍
  },

  "白痴": {
    seatType: "GOD",
    faction: "villager",
    canImmuneExile: true,        // 放逐強制翻牌免死
    loseVoteAfterImmune: true,   // 翻牌後喪失投票權、被投票權及警徽移交資格
    remainAliveInCount: true,    // 翻牌後仍視為存活且在屠邊神職計算範圍內（需夜間追刀）
    keepBadgeTransfer: true      // 放逐時若身為警長，仍可移交或放棄警徽
  },

  "守衛": {
    seatType: "GOD",
    faction: "villager",
    canProtect: true,
    canSelfProtect: true,
    canProtectSameTargetConsecutively: false, // 不可連續兩晚守同一目標
    protectOnlyWolfKill: true,                // 僅防狼刀，無法抵擋毒藥
    overlapWithWitchRule: "milk_through"      // 同守同救奶穿（次日白天夜亡出局，獵人可開槍，白痴不翻牌）
  },

  "攝夢人": {
    seatType: "GOD",
    faction: "villager",
    canDream: true,
    mustDreamOthers: true,               // 強制選他人夢遊（不可選自己）
    dreamerImmuneWolfKill: true,         // 夢遊者免疫當晚狼刀
    continuousDreamKill: true,           // 連續兩晚夢同一人死亡
    chainedDeathOnNightKill: true,       // 攝夢人夜間出局，夢遊者一同出局
    suppressVictimSkill: true            // 因夢遊出局之獵人或狼王不可開槍
  },

  "魔術師": {
    seatType: "GOD",
    faction: "villager",
    canSwap: true,
    canSwapSelf: true,                   // 可對自己使用
    firstNightUnlimited: true,           // 首夜交換不計入限制
    swapLimitPerGame: 1,                 // 第二次起，每人整局只能被換一次
    priority: "FIRST"                    // 每晚最先行動，所有技能與刀口目標依交換後為準
  },

  "騎士": {
    seatType: "GOD",
    faction: "villager",
    canDuel: true,                       // 白天發言階段翻牌決鬥
    duelWolfInstantNight: true           // 決鬥狼人成功直接進入黑夜，對方不觸發任何技能且不翻牌
  },

  "守墓人": {
    seatType: "GOD",
    faction: "villager",
    canInspectGrave: true,
    activeNightStart: 2                  // 第一晚無資訊，第二晚起得知前一日放逐者陣營
  },

  "烏鴉": {
    seatType: "GOD",
    faction: "villager",
    canCurse: true,
    canCurseSelf: true,
    canCurseSameTargetConsecutively: false, // 不可連續兩晚詛咒同一人
    extraVoteCount: 1                       // 放逐投票額外加 1 票
  },

  "獵魔人": {
    seatType: "GOD",
    faction: "villager",
    canHunt: true,
    activeNightStart: 2,                 // 第二晚起可狩獵
    canHuntSelf: false,
    canHuntSameTargetConsecutively: true,// 可連獵同一目標
    immunePoison: true                   // 女巫毒藥對其無效
  },

  "定序王子": {
    seatType: "GOD",
    faction: "villager",
    canReverseVote: true,                // 第一輪放逐投票後翻牌逆轉
    limitPerGame: 1                      // 全場限一次
  },

  "熊": {
    seatType: "GOD",
    faction: "villager",
    hasRoar: true                        // 天亮判定相鄰存活者是否有狼
  },

  "白晝學者": {
    seatType: "GOD",
    faction: "villager",
    canBuffOrDebuff: true,
    activeNightStart: 2                  // 第二晚起選擇增幅或削弱（二選一）
  },

  "覺醒預言家": {
    seatType: "GOD",
    faction: "villager",
    canPeep: true,                       // 每晚窺視兩名目標
    peepTwoTargets: true
  },

  "通靈師": {
    seatType: "GOD",
    faction: "villager",
    canCheckExactRole: true,             // 查驗具體角色名稱
    canCheckSelf: false,
    allowRepeatCheck: false              // 不可重複查驗同一人
  },

  "覺醒攝夢人": {
    seatType: "GOD",
    faction: "villager",
    canDreamWord: true,
    canDreamSelf: true,                  // 可選自己
    dreamerImmuneDamage: true,
    activeExileStart: 2,                 // 第二夜起可主動選擇將夢語者夢語出局
    suppressVictimSkill: true,           // 出局之獵人或狼王不可開槍
    immunePoison: true                   // 免疫毒藥
  },

  "黑市商人": {
    seatType: "GOD",
    faction: "villager",
    activeNight: 1,                      // 僅首夜交易
    canTradeSkill: true
  },

  // --- 好人陣營：平民坑 (VILLAGER) ---
  "平民": {
    seatType: "VILLAGER",
    faction: "villager"
  },

  "燈影預言家": {
    seatType: "VILLAGER",                // 物理算民坑，屠民對象
    faction: "villager",
    canCheck: true,
    reversedCheckResult: true,           // 查驗結果與真實陣營完全相反
    allowRepeatCheck: false
  },

  "混血兒": {
    seatType: "VILLAGER",                // 物理佔民坑，屠民對象
    faction: null,                       // 陣營動態跟隨榜樣
    activeNight: 1,                      // 僅首夜選擇榜樣
    canSelfExplode: false,
    seerCheckResult: "villager"          // 預言家查驗一律顯示好人
  },

  "覺醒孤獨少女": {
    seatType: "VILLAGER",                // 初始物理佔民坑
    faction: null,                       // 首夜追崇偶像，狀態動態轉變
    activeNight: 1,
    canSelfExplode: false
  },

  // --- 狼人陣營：狼坑 (WEREWOLF) ---
  "狼人": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canNightKill: true
  },

  "狼王": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canShoot: true,
    triggerCondition: ["WOLF_KILL", "EXILE"], // 狼刀或放逐出局可開槍
    immunePoisonShoot: false,                 // 被毒殺不可開槍
    immuneDreamShoot: false,                  // 被夢亡不可開槍
    immuneDuelShoot: false                    // 被決鬥不可開槍
  },

  "白狼王": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canSelfExplodeShoot: true,                // 白天發言階段自爆帶走一人
    seerCheckResult: "werewolf"               // 查驗結果顯示狼人
  },

  "狼美人": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canCharm: true,
    canSelfExplode: false,                    // 不可自爆
    canNightKillSelf: false,                  // 不可自刀
    charmedChainedDeath: true,                // 出局時魅惑目標連帶出局
    duelDisableCharm: true,                   // 被決鬥出局技能失效
    dreamDisableCharm: true                   // 被夢亡技能失效
  },

  "覺醒狼美人": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canSubstituteCharm: true,                 // 魅惑目標替代出局
    canSelfExplode: false
  },

  "赤月使徒": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canSealSkillsOnExplode: true              // 白天自爆直接入夜，封印當晚所有好人技能
  },

  "機械狼": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canImitate: true,                         // 模仿獲得技能
    canSelfExplode: false
  },

  "尋香魅影": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canBind: true,                            // 綁定兩名玩家連帶
    canSelfExplode: false,
    limitPerGame: 1
  },

  "夢魘": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canFear: true,
    priority: "FIRST",                        // 最先行動，被恐懼者當晚技能失效且次日禁言
    canFearSameTargetConsecutively: false,    // 不可連恐同一人
    canFearSelf: false
  },

  "覺醒石像鬼": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canConvertNeighbor: true,                 // 首夜轉化相鄰玩家
    activeNight: 1
  },

  "寂夜導師": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canBuffOrDebuff: true,
    activeNightStart: 2,
    canSelfExplode: false
  },

  "狼兄": {
    seatType: "WEREWOLF",
    faction: "werewolf"
  },

  "狼弟": {
    seatType: "WEREWOLF",
    faction: "werewolf"
  }
};

// ==========================================
// 3. 第一波 8 套確認板型資料庫 (BOARD_DATABASE)
// ==========================================
const BOARD_DATABASE = {
  // 1. 標準：預女獵白混
  "預女獵白混": {
    name: "預女獵白混 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "白痴", "混血兒", "平民", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "白痴", "混血兒", "平民", "平民", "平民", "狼人", "狼人", "狼人", "狼人"],
    nightOrder: ["混血兒", "狼人", "女巫", "預言家"],
    rules: {
      witchSelfHeal: "never",           // 女巫全場禁止自救
      guardWitchOverlap: "milk_through", // 同守同救奶穿
      badgeLossOnDoubleExplode: true    // 連續兩天自爆吞警徽
    }
  },

  // 2. 覺醒石像鬼
  "覺醒石像鬼": {
    name: "覺醒石像鬼 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "守衛", "守墓人", "平民", "覺醒石像鬼", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "守衛", "守墓人", "平民", "平民", "平民", "平民", "覺醒石像鬼", "狼人", "狼人"],
    nightOrder: ["守衛", "狼人", "覺醒石像鬼", "女巫", "預言家", "守墓人"],
    rules: {
      witchSelfHeal: "never",
      guardWitchOverlap: "milk_through",
      badgeLossOnDoubleExplode: true
    }
  },

  // 3. 夢魘攝夢人
  "夢魘攝夢人": {
    name: "夢魘攝夢人 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "攝夢人", "平民", "夢魘", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "攝夢人", "平民", "平民", "平民", "平民", "夢魘", "狼人", "狼人", "狼人"],
    nightOrder: ["夢魘", "攝夢人", "狼人", "女巫", "預言家"],
    rules: {
      witchSelfHeal: "never",
      badgeLossOnDoubleExplode: true
    }
  },

  // 4. 狼王魔術師
  "狼王魔術師": {
    name: "狼王魔術師 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "魔術師", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "魔術師", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    nightOrder: ["魔術師", "狼人", "女巫", "預言家"],
    rules: {
      witchSelfHeal: "never",
      badgeLossOnDoubleExplode: true
    }
  },

  // 5. 狼王攝夢人
  "狼王攝夢人": {
    name: "狼王攝夢人 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "攝夢人", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "攝夢人", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    nightOrder: ["攝夢人", "狼人", "女巫", "預言家"],
    rules: {
      witchSelfHeal: "never",
      badgeLossOnDoubleExplode: true
    }
  },

  // 6. 超級黑商
  "超級黑商": {
    name: "超級黑商 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "守衛", "黑市商人", "平民", "狼兄", "狼弟", "狼人"],
    defaultSlots: ["預言家", "女巫", "守衛", "黑市商人", "平民", "平民", "平民", "平民", "狼兄", "狼弟", "狼人", "狼人"],
    nightOrder: ["黑市商人", "守衛", "狼人", "女巫", "預言家"],
    rules: {
      witchSelfHeal: "never",
      guardWitchOverlap: "milk_through",
      badgeLossOnDoubleExplode: true
    }
  },

  // 7. 狼美騎士 (夜間順序已修正：先狼人刀殺，再狼美人魅惑)
  "狼美騎士": {
    name: "狼美騎士 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "守衛", "騎士", "平民", "狼美人", "狼人"],
    defaultSlots: ["預言家", "女巫", "守衛", "騎士", "平民", "平民", "平民", "平民", "狼美人", "狼人", "狼人", "狼人"],
    nightOrder: ["守衛", "狼人", "狼美人", "女巫", "預言家"],
    rules: {
      witchSelfHeal: "never",
      guardWitchOverlap: "milk_through",
      badgeLossOnDoubleExplode: true
    }
  },

  // 8. 狼王守衛
  "狼王守衛": {
    name: "狼王守衛 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "守衛", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "守衛", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    nightOrder: ["守衛", "狼人", "女巫", "預言家"],
    rules: {
      witchSelfHeal: "never",
      guardWitchOverlap: "milk_through",
      badgeLossOnDoubleExplode: true
    }
  }
};
