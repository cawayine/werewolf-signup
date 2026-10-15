/**
 * 基地狼人殺 - 規則與板型獨立設定檔 (rules_config.js)
 * 基準版本：全域規則大腦 + 26位角色字典 + 8套定案板型 + RULES_ENGINE 核心運算引擎
 */

// ==========================================
// 1. 全域裁決通則 (GLOBAL_RULES)
// ==========================================
const GLOBAL_RULES = {
  witchWolfTieBreaker: "WEREWOLF_WIN", // 爪擊在先原則
  whiteWolfCheckResult: "WEREWOLF",
  duelWolfNoSkill: true,               // 騎士決鬥狼人不觸發技能
  consecutiveExplodeBadgeLoss: true,   // 連續兩天警長競選自爆吞警徽
  witchSeesRawWolfKill: true,          // 女巫見原始刀口
  swapAppliesAtResolution: true
};

// ==========================================
// 2. 全域角色屬性字典 (ROLE_DEFINITIONS)
// ==========================================
const ROLE_DEFINITIONS = {
  // --- 好人陣營：神職坑 (GOD) ---
  "預言家": { seatType: "GOD", faction: "villager", canCheck: true, allowRepeatCheck: true },
  "女巫": { seatType: "GOD", faction: "villager", hasAntidote: true, hasPoison: true, canUseBothPotionsSameNight: false, canSelfHealFirstNight: false },
  "獵人": { seatType: "GOD", faction: "villager", canShoot: true, triggerCondition: ["WOLF_KILL", "EXILE"], immunePoisonShoot: false, immuneDreamShoot: false, needsNightGesture: true },
  "白痴": { seatType: "GOD", faction: "villager", canImmuneExile: true, loseVoteAfterImmune: true, remainAliveInCount: true, keepBadgeTransfer: true, firstNightConfirmOnly: true },
  "守衛": { seatType: "GOD", faction: "villager", canProtect: true, canSelfProtect: true, canProtectSameTargetConsecutively: false, protectOnlyWolfKill: true, overlapWithWitchRule: "milk_through" },
  "攝夢人": { seatType: "GOD", faction: "villager", canDream: true, mustDreamOthers: true, dreamerImmuneWolfKill: true, continuousDreamKill: true, chainedDeathOnNightKill: true, suppressVictimSkill: true },
  "魔術師": { seatType: "GOD", faction: "villager", canSwap: true, canSwapSelf: true, firstNightUnlimited: true, swapLimitPerGame: 1, priority: "FIRST", witchSeesRawKill: true },
  "騎士": { seatType: "GOD", faction: "villager", canDuel: true, duelWolfInstantNight: true, firstNightConfirmOnly: true },
  "守墓人": { seatType: "GOD", faction: "villager", canInspectGrave: true, activeNightStart: 2, firstNightConfirmOnly: true },
  "烏鴉": { seatType: "GOD", faction: "villager", canCurse: true, canCurseSelf: true, canCurseSameTargetConsecutively: false, extraVoteCount: 1 },
  "獵魔人": { seatType: "GOD", faction: "villager", canHunt: true, activeNightStart: 2, canHuntSelf: false, canHuntSameTargetConsecutively: true, immunePoison: true },
  "定序王子": { seatType: "GOD", faction: "villager", canReverseVote: true, limitPerGame: 1 },
  "熊": { seatType: "GOD", faction: "villager", hasRoar: true },
  "白晝學者": { seatType: "GOD", faction: "villager", canBuffOrDebuff: true, activeNightStart: 2 },
  "覺醒預言家": { seatType: "GOD", faction: "villager", canPeep: true, peepTwoTargets: true },
  "通靈師": { seatType: "GOD", faction: "villager", canCheckExactRole: true, canCheckSelf: false, allowRepeatCheck: false },
  "覺醒攝夢人": { seatType: "GOD", faction: "villager", canDreamWord: true, canDreamSelf: true, dreamerImmuneDamage: true, activeExileStart: 2, suppressVictimSkill: true, immunePoison: true },
  "黑市商人": { seatType: "GOD", faction: "villager", activeNight: 1, canTradeSkill: true, threeGiftsMode: true },

  // --- 好人陣營：平民坑 (VILLAGER) ---
  "平民": { seatType: "VILLAGER", faction: "villager" },
  "燈影預言家": { seatType: "VILLAGER", faction: "villager", canCheck: true, reversedCheckResult: true, allowRepeatCheck: false },
  "混血兒": { seatType: "VILLAGER", faction: null, activeNight: 1, canSelfExplode: false, seerCheckResult: "villager" },
  "覺醒孤獨少女": { seatType: "VILLAGER", faction: null, activeNight: 1, canSelfExplode: false },

  // --- 狼人陣營：狼坑 (WEREWOLF) ---
  "狼人": { seatType: "WEREWOLF", faction: "werewolf", canNightKill: true },
  "狼王": { seatType: "WEREWOLF", faction: "werewolf", canShoot: true, triggerCondition: ["WOLF_KILL", "EXILE"], immunePoisonShoot: false, immuneDreamShoot: false, immuneDuelShoot: false },
  "白狼王": { seatType: "WEREWOLF", faction: "werewolf", canSelfExplodeShoot: true, seerCheckResult: "werewolf" },
  "狼美人": { seatType: "WEREWOLF", faction: "werewolf", canCharm: true, canSelfExplode: false, canNightKillSelf: false, charmedChainedDeath: true, duelDisableCharm: true, dreamDisableCharm: true },
  "覺醒狼美人": { seatType: "WEREWOLF", faction: "werewolf", canSubstituteCharm: true, canSelfExplode: false },
  "赤月使徒": { seatType: "WEREWOLF", faction: "werewolf", canSealSkillsOnExplode: true },
  "機械狼": { seatType: "WEREWOLF", faction: "werewolf", canImitate: true, canSelfExplode: false },
  "尋香魅影": { seatType: "WEREWOLF", faction: "werewolf", canBind: true, canSelfExplode: false, limitPerGame: 1, allowConsecutiveBindUntilTriggered: true },
  "夢魘": { seatType: "WEREWOLF", faction: "werewolf", canFear: true, priority: "FIRST", canFearSameTargetConsecutively: false, canFearSelf: false },
  "覺醒石像鬼": { seatType: "WEREWOLF", faction: "werewolf", canConvertNeighbor: true, activeNight: 1 },
  "寂夜導師": { seatType: "WEREWOLF", faction: "werewolf", canBuffOrDebuff: true, activeNightStart: 2, canSelfExplode: false },
  "狼兄": { seatType: "WEREWOLF", faction: "werewolf" },
  "狼弟": { seatType: "WEREWOLF", faction: "werewolf" }
};

// ==========================================
// 3. 定案板型資料庫 (BOARD_DATABASE)
// ==========================================
const BOARD_DATABASE = {
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
    ]
  },
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
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼隊落刀" },
      { id: "converter_gesture", role: "轉化者", type: "GESTURE", title: "轉化者請睜眼", prompt: "確認帶刀資格" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "gravekeeper_info", role: "守墓人", type: "INFO", title: "守墓人請睜眼", prompt: "查看昨日放逐者陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢" }
    ]
  },
  "夢魘攝夢人": {
    name: "夢魘攝夢人 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "攝夢人", "平民", "夢魘", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "攝夢人", "平民", "平民", "平民", "平民", "夢魘", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "nightmare", role: "夢魘", type: "SKILL", title: "夢魘請睜眼", prompt: "恐懼一人" },
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇一名玩家夢遊" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "給予開槍手勢" }
    ],
    repeatingNightOrder: [
      { id: "nightmare", role: "夢魘", type: "SKILL", title: "夢魘請睜眼", prompt: "恐懼一人" },
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇夢遊目標" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "給予開槍手勢" }
    ]
  },
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
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "給予開槍手勢" },
      { id: "wolf_king_gesture", role: "狼王", type: "GESTURE", title: "狼王請睜眼", prompt: "給予開槍手勢" }
    ],
    repeatingNightOrder: [
      { id: "magician", role: "魔術師", type: "SKILL", title: "魔術師請睜眼", prompt: "交換號碼牌" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "查看原始刀口與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "給予開槍手勢" },
      { id: "wolf_king_gesture", role: "狼王", type: "GESTURE", title: "狼王請睜眼", prompt: "給予開槍手勢" }
    ]
  },
  "狼王攝夢人": {
    name: "狼王攝夢人 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "攝夢人", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "攝夢人", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇夢遊目標" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "給予開槍手勢" }
    ],
    repeatingNightOrder: [
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇夢遊目標" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "給予開槍手勢" }
    ]
  },
  "超級黑商": {
    name: "超級黑商 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "守衛", "黑市商人", "平民", "狼兄", "狼弟", "狼人"],
    defaultSlots: ["預言家", "女巫", "守衛", "黑市商人", "平民", "平民", "平民", "平民", "狼兄", "狼弟", "狼人", "狼人"],
    firstNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf_brothers_confirm", role: "狼兄狼弟", type: "CONFIRM", title: "狼兄狼弟請睜眼", prompt: "狼兄狼弟相認" },
      { id: "wolf_team_confirm", role: "狼人", type: "SKILL", title: "狼兄與兩小狼睜眼", prompt: "落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "black_market", role: "黑市商人", type: "SKILL", title: "黑市商人請睜眼", prompt: "贈送三份禮物" }
    ],
    repeatingNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼隊請睜眼", prompt: "狼隊落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" }
    ]
  },
  "狼美騎士": {
    name: "狼美騎士 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "守衛", "騎士", "平民", "狼美人", "狼人"],
    defaultSlots: ["預言家", "女巫", "守衛", "騎士", "平民", "平民", "平民", "平民", "狼美人", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "互認並落刀" },
      { id: "wolf_beauty", role: "狼美人", type: "SKILL", title: "狼美人請睜眼", prompt: "魅惑一人" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "knight_confirm", role: "騎士", type: "CONFIRM", title: "騎士請睜眼", prompt: "確認身分" }
    ],
    repeatingNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "落刀" },
      { id: "wolf_beauty", role: "狼美人", type: "SKILL", title: "狼美人請睜眼", prompt: "魅惑一人" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" }
    ]
  },
  "狼王守衛": {
    name: "狼王守衛 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "守衛", "平民", "狼王", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "守衛", "平民", "平民", "平民", "平民", "狼王", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "互認並落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "給予開槍手勢" }
    ],
    repeatingNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "落刀" },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥" },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營" },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "給予開槍手勢" }
    ]
  }
};

// ==========================================
// 4. RULES_ENGINE 核心運算引擎 (雙端共用大腦)
// ==========================================
const RULES_ENGINE = {
  // 工廠方法：產生標準初始對局狀態
  createInitialGameState() {
    return {
      day: 1,
      round: 1,
      phase: "SETUP", // SETUP | NIGHT | POLICE_ELECTION | POLICE_PK | DAY_EXILE | GAME_OVER
      winner: null,
      policeSeat: null,
      isBadgeTorn: false,
      consecutiveExplodeCount: 0,
      pkCandidates: [],
      lastExiledPlayer: null,
      modules: { enableTrickster: false, enablePrince: false },
      tricksterSwap: null,
      princeUsed: false,
      isPrinceRevolving: false,
      players: Array.from({ length: 12 }, (_, i) => ({
        seat: i + 1,
        name: "",
        role: "平民",
        seatType: "VILLAGER",
        victoryFaction: "villager",
        isAlive: true,
        deathReason: null,
        isCandidate: false,
        hasDropped: false
      })),
      history: [],
      tempVotes: {},
      selectedTarget: null,
      lastActionBy: null,
      actionId: null,
      lastActionSummary: null,
      nightMemory: {
        guardLastTarget: null,
        dreamerLastTarget: null,
        nightmareLastTarget: null,
        magicianSwappedSeats: [],
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        gargoyleConvertedTarget: null,
        blackMarketGifts: { seer: null, poison: null, gun: null },
        blackMarketTransformedWolf: false,
        youngWolfSoloKillUsed: false
      }
    };
  },

  // 1. 彩球票型權重統計與排序 (公播端與上帝端通用)
  calculateLottoTallies(votesMap = {}, effectiveBadgeHolder = null, isElectionStage = false) {
    const allKeys = Object.keys(votesMap).map(k => parseInt(k));
    if (allKeys.length === 0) return [];

    // 受票目標排序：由小到大，0 號棄票固定置底
    const sortedTargets = allKeys.sort((a, b) => {
      if (a === 0) return 1;
      if (b === 0) return -1;
      return a - b;
    });

    return sortedTargets.map(targetSeat => {
      const rawVoters = votesMap[targetSeat] || [];
      const isAbstain = (targetSeat === 0);
      let totalPoints = 0;

      // 投票人號碼一律由小到大排序
      const sortedVoters = rawVoters.slice().sort((a, b) => a - b).map(vSeat => {
        const isPolice = (effectiveBadgeHolder !== null && vSeat === effectiveBadgeHolder);
        const points = (!isElectionStage && isPolice) ? 1.5 : 1.0;
        totalPoints += points;
        return {
          seat: vSeat,
          label: (vSeat < 10) ? ("0" + vSeat) : String(vSeat),
          isPolice: isPolice && !isElectionStage
        };
      });

      return {
        targetSeat: targetSeat,
        isAbstain: isAbstain,
        label: isAbstain ? "棄" : ((targetSeat < 10) ? ("0" + targetSeat) : String(targetSeat)),
        title: isAbstain ? "棄票" : `${targetSeat} 號候選人`,
        totalPoints: totalPoints,
        voters: sortedVoters
      };
    }).filter(group => group.voters.length > 0);
  },

  // 2. 警長競選 / PK 開票裁決
  resolvePoliceElection(tempVotes = {}, isPkMode = false, pkCandidates = []) {
    let counts = {};
    Object.entries(tempVotes).forEach(([cand, voters]) => {
      if (cand != 0 && voters.length > 0) {
        counts[cand] = voters.length;
      }
    });

    let maxVotes = 0;
    let topCandidates = [];

    Object.entries(counts).forEach(([cand, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        topCandidates = [parseInt(cand)];
      } else if (count === maxVotes) {
        topCandidates.push(parseInt(cand));
      }
    });

    if (topCandidates.length === 0 || maxVotes === 0) {
      return { status: "ALL_ABSTAIN", maxVotes: 0, topCandidates: [] };
    }

    if (!isPkMode) {
      if (topCandidates.length > 1) {
        return { status: "TIE_ENTER_PK", maxVotes: maxVotes, topCandidates: topCandidates };
      }
      return { status: "WINNER", winner: topCandidates[0], maxVotes: maxVotes };
    } else {
      if (topCandidates.length > 1) {
        return { status: "PK_TIE_BADGE_LOSS", maxVotes: maxVotes, topCandidates: topCandidates };
      }
      return { status: "WINNER", winner: topCandidates[0], maxVotes: maxVotes };
    }
  },

  // 3. 放逐公投票型裁決 (含詭術師替罪演算法)
  resolveExileVote(tempVotes = {}, policeSeat = null, isBadgeTorn = false, modules = {}, tricksterSwap = null, players = []) {
    let maxPoints = 0;
    let topSeats = [];
    const activePolice = (!isBadgeTorn) ? policeSeat : null;

    Object.entries(tempVotes).forEach(([target, voters]) => {
      if (target != 0) {
        let pts = 0;
        voters.forEach(v => {
          pts += (activePolice !== null && v === activePolice) ? 1.5 : 1.0;
        });
        if (pts > maxPoints) {
          maxPoints = pts;
          topSeats = [parseInt(target)];
        } else if (pts === maxPoints && maxPoints > 0) {
          topSeats.push(parseInt(target));
        }
      }
    });

    if (topSeats.length === 0 || maxPoints === 0) {
      return { status: "ALL_ABSTAIN", maxPoints: 0, exiledSeat: null };
    }

    if (topSeats.length > 1) {
      return { status: "TIE_NO_EXILE", maxPoints: maxPoints, topSeats: topSeats, exiledSeat: null };
    }

    const origSeat = topSeats[0];
    let finalSeat = origSeat;
    let isSubstituted = false;

    // 檢查詭術師號碼牌置換
    if (modules?.enableTrickster && tricksterSwap) {
      if (tricksterSwap.seatA === origSeat || tricksterSwap.seatB === origSeat) {
        const substituteSeat = (tricksterSwap.seatA === origSeat) ? tricksterSwap.seatB : tricksterSwap.seatA;
        const subPlayer = players.find(p => p.seat === substituteSeat);
        if (subPlayer && subPlayer.isAlive) {
          finalSeat = substituteSeat;
          isSubstituted = true;
        }
      }
    }

    return {
      status: "EXILED",
      maxPoints: maxPoints,
      exiledSeat: finalSeat,
      originalVotedSeat: origSeat,
      isTricksterSubstituted: isSubstituted
    };
  },

  // 4. 警長競選自爆累計規則
  resolvePoliceExplode(currentCount = 0) {
    if (currentCount >= 1) {
      return {
        nextCount: 2,
        isBadgeLoss: true,
        nextPhase: "DAY_EXILE",
        alertText: "連續兩天在警選階段自爆！觸發規則【警徽流失（吞警徽）】，本局不再有警長，進入白天放逐！"
      };
    } else {
      return {
        nextCount: 1,
        isBadgeLoss: false,
        nextPhase: "POLICE_ELECTION",
        alertText: "狼人競選自爆！保留警徽，延續今日警上名單於次日補選。"
      };
    }
  },

  // 5. 夜間死訊綜合結算演算法
  resolveNight(inputs = {}, nightMemory = {}) {
    const rawWolf = inputs.rawWolfTarget || 0;
    const rawPoison = inputs.rawPoisonTarget || 0;
    const guard = inputs.guardTarget || 0;
    const antidoteUsed = !!inputs.antidoteUsed;

    let deaths = [];
    let hunterCanShoot = true;
    let wolfKingCanShoot = true;

    // 狼刀 + 守衛 + 女巫解藥 (同守同救奶穿)
    if (rawWolf) {
      if (antidoteUsed && guard === rawWolf) {
        deaths.push(rawWolf); // 同守同救奶穿
      } else if (antidoteUsed || guard === rawWolf) {
        // 平安
      } else {
        deaths.push(rawWolf);
      }
    }

    // 女巫毒藥
    if (rawPoison && !deaths.includes(rawPoison)) {
      deaths.push(rawPoison);
    }

    // 獵人 / 狼王 吃毒禁槍判定
    if (deaths.includes(rawPoison)) {
      hunterCanShoot = false;
      wolfKingCanShoot = false;
    }

    const summaryText = deaths.length === 0 
      ? "昨夜是平安夜" 
      : `昨夜倒牌：${deaths.map(s => s + '號').join('、')}`;

    return {
      deaths: deaths,
      hunterCanShoot: hunterCanShoot,
      wolfKingCanShoot: wolfKingCanShoot,
      summaryText: summaryText
    };
  },

  // 6. 勝負判定 (好人滅狼勝 / 狼人屠邊勝)
  checkGameOver(players = []) {
    const alive = players.filter(p => p.isAlive);
    const gods = alive.filter(p => p.seatType === "GOD").length;
    const villagers = alive.filter(p => p.seatType === "VILLAGER").length;
    const wolves = alive.filter(p => p.seatType === "WEREWOLF").length;

    if (wolves === 0) {
      return { isOver: true, winner: "villager", reason: "好人陣營獲勝！(狼人全滅)" };
    } else if (gods === 0) {
      return { isOver: true, winner: "werewolf", reason: "狼人陣營屠神獲勝！" };
    } else if (villagers === 0) {
      return { isOver: true, winner: "werewolf", reason: "狼人陣營屠民獲勝！" };
    }

    return { isOver: false, winner: null, reason: "進行中" };
  }
};
