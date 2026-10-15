/**
 * 基地狼人殺 - 規則與板型獨立設定檔 (rules_config.js)
 * 基準版本：完整定稿角色庫 (26位) + 8 套板型 + 技能規則參數化整合 + 動態睜眼主持腳本
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
  consecutiveExplodeBadgeLoss: true,

  // 魔術師與女巫邊界通則：女巫看到的刀口為狼人落刀的原始座位（不經魔術師換位換算）
  witchSeesRawWolfKill: true,

  // 魔術師交換效果在天亮結算死訊時才正式生效映射
  swapAppliesAtResolution: true
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
    allowRepeatCheck: true
  },

  "女巫": {
    seatType: "GOD",
    faction: "villager",
    hasAntidote: true,
    hasPoison: true,
    canUseBothPotionsSameNight: false,
    canSelfHealFirstNight: false,       // 全板型一律禁止首夜自救
    hideKillInfoAfterAntidote: true
  },

  "獵人": {
    seatType: "GOD",
    faction: "villager",
    canShoot: true,
    triggerCondition: ["WOLF_KILL", "EXILE"],
    immunePoisonShoot: false,
    immuneDreamShoot: false,
    needsNightGesture: true             // 夜間需上帝給予開槍手勢
  },

  "白痴": {
    seatType: "GOD",
    faction: "villager",
    canImmuneExile: true,
    loseVoteAfterImmune: true,
    remainAliveInCount: true,
    keepBadgeTransfer: true,
    firstNightConfirmOnly: true         // 首夜僅睜眼確認身分
  },

  "守衛": {
    seatType: "GOD",
    faction: "villager",
    canProtect: true,
    canSelfProtect: true,
    canProtectSameTargetConsecutively: false,
    protectOnlyWolfKill: true,
    overlapWithWitchRule: "milk_through" // 同守同救奶穿出局
  },

  "攝夢人": {
    seatType: "GOD",
    faction: "villager",
    canDream: true,
    mustDreamOthers: true,
    dreamerImmuneWolfKill: true,
    continuousDreamKill: true,
    chainedDeathOnNightKill: true,
    suppressVictimSkill: true
  },

  "魔術師": {
    seatType: "GOD",
    faction: "villager",
    canSwap: true,
    canSwapSelf: true,
    firstNightUnlimited: true,
    swapLimitPerGame: 1,
    priority: "FIRST",
    witchSeesRawKill: true              // 女巫見原始刀口
  },

  "騎士": {
    seatType: "GOD",
    faction: "villager",
    canDuel: true,
    duelWolfInstantNight: true,
    firstNightConfirmOnly: true         // 首夜僅睜眼確認身分
  },

  "守墓人": {
    seatType: "GOD",
    faction: "villager",
    canInspectGrave: true,
    activeNightStart: 2,
    firstNightConfirmOnly: true         // 首夜睜眼確認身分，第 2 夜起看放逐者
  },

  "烏鴉": {
    seatType: "GOD",
    faction: "villager",
    canCurse: true,
    canCurseSelf: true,
    canCurseSameTargetConsecutively: false,
    extraVoteCount: 1
  },

  "獵魔人": {
    seatType: "GOD",
    faction: "villager",
    canHunt: true,
    activeNightStart: 2,
    canHuntSelf: false,
    canHuntSameTargetConsecutively: true,
    immunePoison: true
  },

  "定序王子": {
    seatType: "GOD",
    faction: "villager",
    canReverseVote: true,
    limitPerGame: 1
  },

  "熊": {
    seatType: "GOD",
    faction: "villager",
    hasRoar: true
  },

  "白晝學者": {
    seatType: "GOD",
    faction: "villager",
    canBuffOrDebuff: true,
    activeNightStart: 2
  },

  "覺醒預言家": {
    seatType: "GOD",
    faction: "villager",
    canPeep: true,
    peepTwoTargets: true
  },

  "通靈師": {
    seatType: "GOD",
    faction: "villager",
    canCheckExactRole: true,
    canCheckSelf: false,
    allowRepeatCheck: false
  },

  "覺醒攝夢人": {
    seatType: "GOD",
    faction: "villager",
    canDreamWord: true,
    canDreamSelf: true,
    dreamerImmuneDamage: true,
    activeExileStart: 2,
    suppressVictimSkill: true,
    immunePoison: true
  },

  "黑市商人": {
    seatType: "GOD",
    faction: "villager",
    activeNight: 1,
    canTradeSkill: true,
    threeGiftsMode: true                // 查驗/毒藥/獵槍三份禮物模式
  },

  // --- 好人陣營：平民坑 (VILLAGER) ---
  "平民": {
    seatType: "VILLAGER",
    faction: "villager"
  },

  "燈影預言家": {
    seatType: "VILLAGER",
    faction: "villager",
    canCheck: true,
    reversedCheckResult: true,
    allowRepeatCheck: false
  },

  "混血兒": {
    seatType: "VILLAGER",
    faction: null,
    activeNight: 1,
    canSelfExplode: false,
    seerCheckResult: "villager"
  },

  "覺醒孤獨少女": {
    seatType: "VILLAGER",
    faction: null,
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
    triggerCondition: ["WOLF_KILL", "EXILE"],
    immunePoisonShoot: false,
    immuneDreamShoot: false,
    immuneDuelShoot: false
  },

  "白狼王": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canSelfExplodeShoot: true,
    seerCheckResult: "werewolf"
  },

  "狼美人": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canCharm: true,
    canSelfExplode: false,
    canNightKillSelf: false,
    charmedChainedDeath: true,
    duelDisableCharm: true,
    dreamDisableCharm: true
  },

  "覺醒狼美人": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canSubstituteCharm: true,
    canSelfExplode: false
  },

  "赤月使徒": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canSealSkillsOnExplode: true
  },

  "機械狼": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canImitate: true,
    canSelfExplode: false
  },

  "尋香魅影": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canBind: true,
    canSelfExplode: false,
    limitPerGame: 1,
    allowConsecutiveBindUntilTriggered: true // 觸發前每夜皆可重新綁定
  },

  "夢魘": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canFear: true,
    priority: "FIRST",                  // 全場絕對最先行動
    canFearSameTargetConsecutively: false,
    canFearSelf: false
  },

  "覺醒石像鬼": {
    seatType: "WEREWOLF",
    faction: "werewolf",
    canConvertNeighbor: true,
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
// 3. 第一波 8 套定案板型資料庫 (BOARD_DATABASE)
// 包含法官逐夜主持腳本：首夜 (firstNightOrder) 與 次夜起 (repeatingNightOrder)
// ==========================================
const BOARD_DATABASE = {
  // 1. 標準：預女獵白混
  "預女獵白混": {
    name: "預女獵白混 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "白痴", "混血兒", "平民", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "白痴", "混血兒", "平民", "平民", "平民", "狼人", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "hybrid", role: "混血兒", type: "SKILL", title: "混血兒請睜眼", prompt: "首夜選擇榜樣" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "團隊確認身分並落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" },
      { id: "idiot_confirm", role: "白痴", type: "CONFIRM", title: "白痴請睜眼", prompt: "確認身分後請閉眼" }
    ],
    repeatingNightOrder: [
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" }
    ],
    rules: { witchSelfHeal: "never", guardWitchOverlap: "milk_through", badgeLossOnDoubleExplode: true }
  },

  // 2. 覺醒石像鬼
  "覺醒石像鬼": {
    name: "覺醒石像鬼 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "守衛", "守墓人", "平民", "覺醒石像鬼", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "守衛", "守墓人", "平民", "平民", "平民", "平民", "覺醒石像鬼", "狼人", "狼人"],
    firstNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "團隊落刀" },
      { id: "gargoyle", role: "覺醒石像鬼", type: "SKILL", title: "覺醒石像鬼請睜眼", prompt: "選擇相鄰玩家進行轉化" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "gravekeeper_confirm", role: "守墓人", type: "CONFIRM", title: "守墓人請睜眼", prompt: "首夜確認身分後請閉眼" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" }
    ],
    repeatingNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼隊落刀 (若3狼全滅則由轉化者落刀)" },
      { id: "converter_gesture", role: "轉化者", type: "GESTURE", title: "轉化者請睜眼", prompt: "其餘3狼全滅時給可帶刀手勢，否則給不可帶刀手勢" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "gravekeeper_info", role: "守墓人", type: "INFO", title: "守墓人請睜眼", prompt: "查看昨日放逐者陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" }
    ],
    rules: { witchSelfHeal: "never", guardWitchOverlap: "milk_through", badgeLossOnDoubleExplode: true }
  },

  // 3. 夢魘攝夢人
  "夢魘攝夢人": {
    name: "夢魘攝夢人 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "攝夢人", "平民", "夢魘", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "攝夢人", "平民", "平民", "平民", "平民", "夢魘", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "nightmare", role: "夢魘", type: "SKILL", title: "夢魘請睜眼", prompt: "全場絕對第一順位，恐懼一人" },
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇一名玩家夢遊 (不可選自己)" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢 (若被夢亡則為不可開槍)" }
    ],
    repeatingNightOrder: [
      { id: "nightmare", role: "夢魘", type: "SKILL", title: "夢魘請睜眼", prompt: "恐懼一人 (防連恐、防恐自己)" },
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇夢遊目標 (連夢同一人死亡)" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" }
    ],
    rules: { witchSelfHeal: "never", badgeLossOnDoubleExplode: true }
  },

  // 4. 狼王魔術師
  "狼王魔術師": {
    name: "狼王魔術師 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "魔術師", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "魔術師", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "magician", role: "魔術師", type: "SKILL", title: "魔術師請睜眼", prompt: "交換兩名玩家號碼牌" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼王與小狼睜眼互認並落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "查看原始刀口與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" },
      { id: "wolf_king_gesture", role: "狼王", type: "GESTURE", title: "狼王請睜眼", prompt: "獵人之後給狼王開槍手勢 (吃毒則不可開槍)" }
    ],
    repeatingNightOrder: [
      { id: "magician", role: "魔術師", type: "SKILL", title: "魔術師請睜眼", prompt: "交換兩名玩家號碼牌 (每人限換一次)" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "查看原始刀口與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" },
      { id: "wolf_king_gesture", role: "狼王", type: "GESTURE", title: "狼王請睜眼", prompt: "給予開槍手勢" }
    ],
    rules: { witchSelfHeal: "never", badgeLossOnDoubleExplode: true }
  },

  // 5. 狼王攝夢人
  "狼王攝夢人": {
    name: "狼王攝夢人 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "攝夢人", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "攝夢人", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇夢遊目標 (不可選自己)" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼王與小狼睜眼互認並落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" }
    ],
    repeatingNightOrder: [
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇夢遊目標" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" }
    ],
    rules: { witchSelfHeal: "never", badgeLossOnDoubleExplode: true }
  },

  // 6. 超級黑商
  "超級黑商": {
    name: "超級黑商 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "守衛", "黑市商人", "平民", "狼兄", "狼弟", "狼人"],
    defaultSlots: ["預言家", "女巫", "守衛", "黑市商人", "平民", "平民", "平民", "平民", "狼兄", "狼弟", "狼人", "狼人"],
    firstNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf_brothers_confirm", role: "狼兄狼弟", type: "CONFIRM", title: "狼兄狼弟請睜眼", prompt: "狼兄狼弟相認" },
      { id: "wolf_team_confirm", role: "狼人", type: "SKILL", title: "狼弟閉眼，狼兄與兩小狼請睜眼", prompt: "確認彼此身分並團隊落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "black_market", role: "黑市商人", type: "SKILL", title: "黑市商人請睜眼", prompt: "贈送三份禮物 (查驗、毒藥、獵槍)" },
      { id: "seer_lucky_confirm", role: "幸運兒", type: "CONFIRM", title: "查驗幸運兒請睜眼", prompt: "確認獲得查驗技能" },
      { id: "poison_lucky_confirm", role: "幸運兒", type: "CONFIRM", title: "毒藥幸運兒請睜眼", prompt: "確認獲得毒藥技能" },
      { id: "gun_lucky_gesture", role: "幸運兒", type: "GESTURE", title: "獵槍幸運兒請睜眼", prompt: "確認獲得獵槍，並給予開槍手勢" }
    ],
    repeatingNightOrder: [
      { id: "black_market_faction_gesture", role: "黑市商人", type: "GESTURE", title: "黑市商人請睜眼", prompt: "給予陣營手勢 (若3禮物皆給好人則變身為狼)" },
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf_younger_solo", role: "狼弟", type: "SKILL", title: "狼弟請睜眼", prompt: "狼弟開刀手勢並單獨開刀 (狼兄出局時觸發)" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼隊請睜眼", prompt: "狼人團隊常規落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "lucky_skill_action", role: "幸運兒", type: "SKILL", title: "幸運兒依序喚醒", prompt: "依序詢問查驗/毒藥/獵槍幸運兒是否發動技能" }
    ],
    rules: { witchSelfHeal: "never", guardWitchOverlap: "milk_through", badgeLossOnDoubleExplode: true }
  },

  // 7. 狼美騎士
  "狼美騎士": {
    name: "狼美騎士 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "守衛", "騎士", "平民", "狼美人", "狼人"],
    defaultSlots: ["預言家", "女巫", "守衛", "騎士", "平民", "平民", "平民", "平民", "狼美人", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼美人與小狼睜眼互認並落刀" },
      { id: "wolf_beauty", role: "狼美人", type: "SKILL", title: "狼美人請睜眼", prompt: "單獨睜眼魅惑一名存活目標" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "knight_confirm", role: "騎士", type: "CONFIRM", title: "騎士請睜眼", prompt: "確認身分後請閉眼" }
    ],
    repeatingNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀" },
      { id: "wolf_beauty", role: "狼美人", type: "SKILL", title: "狼美人請睜眼", prompt: "魅惑一名存活目標" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" }
    ],
    rules: { witchSelfHeal: "never", guardWitchOverlap: "milk_through", badgeLossOnDoubleExplode: true }
  },

  // 8. 狼王守衛
  "狼王守衛": {
    name: "狼王守衛 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "守衛", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "守衛", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼王與小狼睜眼互認並落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" }
    ],
    repeatingNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" }
    ],
    rules: { witchSelfHeal: "never", guardWitchOverlap: "milk_through", badgeLossOnDoubleExplode: true }
  }
};
