/**
 * 基地狼人殺 - 規則與板型獨立設定檔 (rules_config.js)
 * 基準版本：全域規則大腦 + 27位角色字典 + 8套定案板型 + RULES_ENGINE 核心運算引擎 (完整精簡重構版)
 */

// ==========================================
// 1. 全域裁決通則 (GLOBAL_RULES)
// ==========================================
const GLOBAL_RULES = {
  witchWolfTieBreaker: "WEREWOLF_WIN",
  whiteWolfCheckResult: "WEREWOLF",
  duelWolfNoSkill: true,
  consecutiveExplodeBadgeLoss: true,
  witchSeesRawWolfKill: true,
  swapAppliesAtResolution: true
};

// ==========================================
// 2. 全域角色屬性字典 (ROLE_DEFINITIONS)
// ==========================================
const ROLE_DEFINITIONS = {
  // 好人神職
  "預言家": { seatType: "GOD", faction: "villager", canCheck: true, allowRepeatCheck: true },
  "女巫": { seatType: "GOD", faction: "villager", hasAntidote: true, hasPoison: true, canUseBothPotionsSameNight: false, canSelfHeal: false },
  "獵人": { seatType: "GOD", faction: "villager", canShoot: true, triggerCondition: ["WOLF_KILL", "EXILE"], needsNightGesture: true },
  "白痴": { seatType: "GOD", faction: "villager", canImmuneExile: true, loseVoteAfterImmune: true, firstNightConfirmOnly: true },
  "守衛": { seatType: "GOD", faction: "villager", canProtect: true, canSelfProtect: true, canProtectSameTargetConsecutively: false },
  "攝夢人": { seatType: "GOD", faction: "villager", canDream: true, mustDreamOthers: true, dreamerImmuneWolfKill: true, continuousDreamKill: true },
  "魔術師": { seatType: "GOD", faction: "villager", canSwap: true, swapLimitPerGame: 1, priority: "FIRST" },
  "騎士": { seatType: "GOD", faction: "villager", canDuel: true, duelWolfInstantNight: true, firstNightConfirmOnly: true },
  "守墓人": { seatType: "GOD", faction: "villager", canInspectGrave: true, activeNightStart: 2, firstNightConfirmOnly: true },
  "烏鴉": { seatType: "GOD", faction: "villager", canCurse: true, extraVoteCount: 1 },
  "獵魔人": { seatType: "GOD", faction: "villager", canHunt: true, activeNightStart: 2 },
  "定序王子": { seatType: "GOD", faction: "villager", canReverseVote: true, limitPerGame: 1 },
  "熊": { seatType: "GOD", faction: "villager", hasRoar: true },
  "白晝學者": { seatType: "GOD", faction: "villager", canBuffOrDebuff: true, activeNightStart: 2 },
  "覺醒預言家": { seatType: "GOD", faction: "villager", canPeep: true },
  "通靈師": { seatType: "GOD", faction: "villager", canCheckExactRole: true },
  "覺醒攝夢人": { seatType: "GOD", faction: "villager", canDreamWord: true },
  "黑市商人": { seatType: "GOD", faction: "villager", activeNight: 1, canTradeSkill: true, transformsOnAllVillagerGifts: true },

  // 好人平民
  "平民": { seatType: "VILLAGER", faction: "villager" },
  "燈影預言家": { seatType: "VILLAGER", faction: "villager", canCheck: true, reversedCheckResult: true },
  "混血兒": { seatType: "VILLAGER", faction: null, activeNight: 1, seerCheckResult: "villager" },
  "覺醒孤獨少女": { seatType: "VILLAGER", faction: null, activeNight: 1 },

  // 狼人陣營
  "狼人": { seatType: "WEREWOLF", faction: "werewolf", canNightKill: true },
  "狼王": { seatType: "WEREWOLF", faction: "werewolf", canShoot: true, triggerCondition: ["WOLF_KILL", "EXILE"] },
  "白狼王": { seatType: "WEREWOLF", faction: "werewolf", canSelfExplodeShoot: true },
  "狼美人": { seatType: "WEREWOLF", faction: "werewolf", canCharm: true, charmedChainedDeath: true },
  "覺醒狼美人": { seatType: "WEREWOLF", faction: "werewolf", canSubstituteCharm: true },
  "赤月使徒": { seatType: "WEREWOLF", faction: "werewolf", canSealSkillsOnExplode: true },
  "機械狼": { seatType: "WEREWOLF", faction: "werewolf", canImitate: true },
  "尋香魅影": { seatType: "WEREWOLF", faction: "werewolf", canBind: true },
  "夢魘": { seatType: "WEREWOLF", faction: "werewolf", canFear: true, priority: "FIRST" },
  "覺醒石像鬼": { seatType: "WEREWOLF", faction: "werewolf", canConvertNeighbor: true, activeNight: 1 },
  "轉化者": { seatType: "WEREWOLF", faction: "werewolf", isConverted: true, canNightKill: true },
  "寂夜導師": { seatType: "WEREWOLF", faction: "werewolf", canBuffOrDebuff: true },
  "狼兄": { seatType: "WEREWOLF", faction: "werewolf", canNightKill: true },
  "狼弟": { seatType: "WEREWOLF", faction: "werewolf", canNightKill: false }
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
      { id: "black_market", role: "黑市商人", type: "SKILL", title: "黑市商人請睜眼", prompt: "贈送三份禮物" },
      { id: "seer_lucky_confirm", role: "幸運兒", type: "CONFIRM", title: "查驗幸運兒請睜眼", prompt: "確認獲得查驗技能" },
      { id: "poison_lucky_confirm", role: "幸運兒", type: "CONFIRM", title: "毒藥幸運兒請睜眼", prompt: "確認獲得毒藥技能" },
      { id: "gun_lucky_gesture", role: "幸運兒", type: "GESTURE", title: "獵槍幸運兒請睜眼", prompt: "給予開槍手勢" }
    ],
    repeatingNightOrder: [
      { id: "black_market_faction_gesture", role: "黑市商人", type: "GESTURE", title: "黑市商人請睜眼", prompt: "給予陣營手勢 (若3禮物皆給好人則變身為狼)" },
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守" },
      { id: "wolf_younger_solo", role: "狼弟", type: "SKILL", title: "狼弟請睜眼", prompt: "單獨開刀 (狼兄出局時觸發)" },
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
// 4. RULES_ENGINE 核心運算引擎 (全域單一大腦)
// ==========================================
const RULES_ENGINE = {
  createInitialGameState() {
    return {
      day: 1,
      round: 1,
      phase: "SETUP",
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
        originalSeatType: "VILLAGER",
        victoryFaction: "villager",
        isAlive: true,
        deathReason: null,
        isCandidate: false,
        hasDropped: false
      })),
      history: [],
      tempVotes: {},
      selectedTarget: null,
      nightMemory: {
        guardLastTarget: null,
        witchAntidoteUsed: false,
        witchPoisonUsed: false,
        gargoyleConvertedTarget: null,
        blackMarketGifts: { seer: null, poison: null, gun: null },
        blackMarketTransformedWolf: false
      }
    };
  },

  // 席位屬性自動同步（徹底防止 F5 資料庫身分丟失變 12 平民）
  syncPlayerRoles(players = [], boardKey = "") {
    if (!players || players.length === 0) return;
    const config = BOARD_DATABASE[boardKey];
    const isAllVillagers = players.every(p => p.role === "平民");

    players.forEach((p, idx) => {
      p.seat = Number(p.seat);
      if (isAllVillagers && config?.defaultSlots && config.defaultSlots[idx]) {
        p.role = config.defaultSlots[idx];
      }
      const baseRole = (p.role || "平民").replace(/\(轉化\)|\(狼\)/g, "");
      const def = ROLE_DEFINITIONS[baseRole] || ROLE_DEFINITIONS[p.role];

      if (def) {
        if (!p.role.includes("轉化") && !p.role.includes("(狼)")) {
          p.seatType = def.seatType;
        } else {
          p.seatType = "WEREWOLF";
        }
        if (!p.originalSeatType) p.originalSeatType = def.seatType;
        if (!p.victoryFaction) p.victoryFaction = def.faction || "villager";
      } else {
        p.seatType = p.seatType || "VILLAGER";
        p.originalSeatType = p.originalSeatType || "VILLAGER";
      }
    });
  },

  // 覺醒石像鬼：計算合法相鄰轉化席位
  getGargoyleTargets(players = []) {
    const wolfSeats = players.filter(p => p.seatType === "WEREWOLF").map(p => Number(p.seat));
    const neighbors = new Set();
    const total = players.length || 12;

    wolfSeats.forEach(s => {
      neighbors.add(s === 1 ? total : s - 1);
      neighbors.add(s === total ? 1 : s + 1);
    });
    wolfSeats.forEach(s => neighbors.delete(s));
    return Array.from(neighbors).sort((a, b) => a - b);
  },

  // 黑市商人：取得合法受贈對象（排除自己）
  getBlackMarketTargets(players = []) {
    const bm = players.find(p => p.role.includes("黑市商人"));
    const bmSeat = bm ? Number(bm.seat) : 0;
    return players.filter(p => Number(p.seat) !== bmSeat);
  },

  // 動態身分轉化邏輯
  applyRoleTransformations(inputs = {}, players = [], nightMemory = {}) {
    const logs = [];

    // 石像鬼轉化
    const gargoyleTarget = Number(inputs.gargoyleTarget) || 0;
    if (gargoyleTarget > 0 && !nightMemory.gargoyleConvertedTarget) {
      const target = players.find(p => Number(p.seat) === gargoyleTarget);
      if (target) {
        if (!target.originalSeatType) target.originalSeatType = target.seatType;
        target.seatType = "WEREWOLF";
        target.victoryFaction = "werewolf";
        target.role = `${target.role}(轉化)`;
        nightMemory.gargoyleConvertedTarget = gargoyleTarget;
        logs.push(`【覺醒石像鬼】成功轉化 ${gargoyleTarget} 號！身分已變更為狼坑！`);
      }
    }

    // 黑市商人變狼
    const gifts = inputs.blackMarketGifts;
    if (gifts && !nightMemory.blackMarketTransformedWolf) {
      const gSeer = Number(gifts.seer) || 0;
      const gPoison = Number(gifts.poison) || 0;
      const gGun = Number(gifts.gun) || 0;

      if (gSeer > 0 && gPoison > 0 && gGun > 0) {
        nightMemory.blackMarketGifts = { seer: gSeer, poison: gPoison, gun: gGun };
        const t1 = players.find(p => Number(p.seat) === gSeer);
        const t2 = players.find(p => Number(p.seat) === gPoison);
        const t3 = players.find(p => Number(p.seat) === gGun);

        const allGood = [t1, t2, t3].every(p => p && p.seatType !== "WEREWOLF");
        if (allGood) {
          const bm = players.find(p => p.role.includes("黑市商人"));
          if (bm) {
            if (!bm.originalSeatType) bm.originalSeatType = bm.seatType;
            bm.seatType = "WEREWOLF";
            bm.victoryFaction = "werewolf";
            bm.role = "黑市商人(狼)";
            nightMemory.blackMarketTransformedWolf = true;
            logs.push(`【黑市商人】三份禮物皆贈與好人，墮落變身為狼人！`);
          }
        }
      }
    }
    return logs;
  },

  // 預言家查驗
  resolveCheck(targetSeat, swapPair = [0, 0], players = []) {
    const tSeat = Number(targetSeat) || 0;
    if (!tSeat) return { isReady: false, isWolf: false, text: "待查驗" };
    
    let effectiveSeat = tSeat;
    if (Number(swapPair[0]) === tSeat) effectiveSeat = Number(swapPair[1]);
    else if (Number(swapPair[1]) === tSeat) effectiveSeat = Number(swapPair[0]);

    const target = players.find(p => Number(p.seat) === effectiveSeat);
    if (!target) return { isReady: false, isWolf: false, text: "查無此人" };

    let isWolf = (target.seatType === "WEREWOLF");
    if (target.role === "狼弟") {
      const brother = players.find(p => p.role === "狼兄");
      isWolf = brother ? !brother.isAlive : true;
    }

    return {
      isReady: true,
      isWolf: isWolf,
      text: isWolf ? "查驗結果：【狼人 (查殺)】" : "查驗結果：【好人 (金水)】"
    };
  },

  // 手勢狀態判定
  evaluateGesture(gestureId, context = {}) {
    const rawPoison = Number(context.rawPoisonTarget) || 0;
    const swapPair = context.swapPair || [0, 0];
    let effPoison = rawPoison;
    if (Number(swapPair[0]) === rawPoison) effPoison = Number(swapPair[1]);
    else if (Number(swapPair[1]) === rawPoison) effPoison = Number(swapPair[0]);

    const players = context.players || [];
    if (gestureId === "hunter_gesture" || gestureId === "wolf_king_gesture") {
      const roleName = gestureId === "hunter_gesture" ? "獵人" : "狼王";
      const target = players.find(p => p.role.includes(roleName));
      const isPoisoned = !!target && effPoison > 0 && Number(target.seat) === effPoison;
      return { isPositive: !isPoisoned, text: isPoisoned ? "👎 狀態異常 (吃毒禁槍)" : "👍 狀態良好 (可開槍)" };
    }
    if (gestureId === "converter_gesture") return { isPositive: true, text: "🔪 轉化確認 (可參與落刀)" };
    if (gestureId === "black_market_faction_gesture") {
      const isWolf = !!context.blackMarketTransformedWolf;
      return { isPositive: !isWolf, text: isWolf ? "🐺 陣營轉變 (已變為狼人)" : "🧑 陣營正常 (仍為好人)" };
    }
    return { isPositive: true, text: "👍 狀態良好" };
  },

  // 票型統計
  calculateLottoTallies(votesMap = {}, effectiveBadgeHolder = null, isElectionStage = false) {
    const allKeys = Object.keys(votesMap).map(k => Number(k));
    if (allKeys.length === 0) return [];
    const sortedTargets = allKeys.sort((a, b) => (a === 0 ? 1 : b === 0 ? -1 : a - b));
    const activePolice = effectiveBadgeHolder !== null ? Number(effectiveBadgeHolder) : null;

    return sortedTargets.map(tSeat => {
      const rawVoters = votesMap[tSeat] || [];
      const isAbstain = (tSeat === 0);
      let totalPoints = 0;
      const sortedVoters = rawVoters.slice().sort((a, b) => Number(a) - Number(b)).map(vSeat => {
        const vNum = Number(vSeat);
        const isPolice = (activePolice !== null && vNum === activePolice);
        const pts = (!isElectionStage && isPolice) ? 1.5 : 1.0;
        totalPoints += pts;
        return { seat: vNum, label: vNum < 10 ? "0" + vNum : String(vNum), isPolice: isPolice && !isElectionStage };
      });
      return {
        targetSeat: tSeat,
        isAbstain: isAbstain,
        label: isAbstain ? "棄" : (tSeat < 10 ? "0" + tSeat : String(tSeat)),
        title: isAbstain ? "棄票" : `${tSeat} 號候選人`,
        totalPoints: totalPoints,
        voters: sortedVoters
      };
    }).filter(g => g.voters.length > 0);
  },

  // 警選開票
  resolvePoliceElection(tempVotes = {}, isPkMode = false) {
    let counts = {};
    Object.entries(tempVotes).forEach(([cand, voters]) => {
      const cNum = Number(cand);
      if (cNum !== 0 && Array.isArray(voters) && voters.length > 0) counts[cNum] = voters.length;
    });

    let maxVotes = 0;
    let top = [];
    Object.entries(counts).forEach(([cand, count]) => {
      const cNum = Number(cand);
      if (count > maxVotes) { maxVotes = count; top = [cNum]; }
      else if (count === maxVotes) { top.push(cNum); }
    });

    if (top.length === 0 || maxVotes === 0) return { status: "ALL_ABSTAIN", maxVotes: 0, topCandidates: [] };
    if (!isPkMode) {
      return top.length > 1 ? { status: "TIE_ENTER_PK", maxVotes, topCandidates: top } : { status: "WINNER", winner: top[0], maxVotes };
    }
    return top.length > 1 ? { status: "PK_TIE_BADGE_LOSS", maxVotes, topCandidates: top } : { status: "WINNER", winner: top[0], maxVotes };
  },

  // 放逐開票
  resolveExileVote(tempVotes = {}, policeSeat = null, isBadgeTorn = false, modules = {}, tricksterSwap = null, players = []) {
    let maxPoints = 0;
    let top = [];
    const activePolice = (!isBadgeTorn && policeSeat !== null) ? Number(policeSeat) : null;

    Object.entries(tempVotes).forEach(([target, voters]) => {
      const tNum = Number(target);
      if (tNum !== 0 && Array.isArray(voters)) {
        let pts = 0;
        voters.forEach(v => { pts += (activePolice !== null && Number(v) === activePolice) ? 1.5 : 1.0; });
        if (pts > maxPoints) { maxPoints = pts; top = [tNum]; }
        else if (pts === maxPoints && maxPoints > 0) { top.push(tNum); }
      }
    });

    if (top.length === 0 || maxPoints === 0) return { status: "ALL_ABSTAIN", maxPoints: 0, exiledSeat: null };
    if (top.length > 1) return { status: "TIE_NO_EXILE", maxPoints, topSeats: top, exiledSeat: null };

    let finalSeat = top[0];
    let isSub = false;
    if (modules?.enableTrickster && tricksterSwap) {
      const sA = Number(tricksterSwap.seatA);
      const sB = Number(tricksterSwap.seatB);
      if (sA === finalSeat || sB === finalSeat) {
        const sub = (sA === finalSeat) ? sB : sA;
        const subP = players.find(p => Number(p.seat) === sub);
        if (subP && subP.isAlive) { finalSeat = sub; isSub = true; }
      }
    }
    return { status: "EXILED", maxPoints, exiledSeat: finalSeat, originalVotedSeat: top[0], isTricksterSubstituted: isSub };
  },

  // 警選自爆
  resolvePoliceExplode(currentCount = 0) {
    if (currentCount >= 1) {
      return { nextCount: 2, isBadgeLoss: true, nextPhase: "DAY_EXILE", alertText: "連續兩天警選自爆！觸發【警徽流失】，本局不再有警長！" };
    }
    return { nextCount: 1, isBadgeLoss: false, nextPhase: "POLICE_ELECTION", alertText: "狼人競選自爆！保留警徽，延續名單於次日補選。" };
  },

  // 夜間死訊結算
  resolveNight(inputs = {}, nightMemory = {}, players = []) {
    const transformationLogs = this.applyRoleTransformations(inputs, players, nightMemory);
    const rawWolf = Number(inputs.rawWolfTarget) || 0;
    const rawSolo = Number(inputs.youngWolfSoloTarget) || 0;
    const rawPoison = Number(inputs.rawPoisonTarget) || 0;
    const guard = Number(inputs.guardTarget) || 0;
    const antidote = !!inputs.antidoteUsed;

    const s0 = Number(inputs.swapPair?.[0]) || 0;
    const s1 = Number(inputs.swapPair?.[1]) || 0;
    const swap = (s) => (s === s0 ? s1 : (s === s1 ? s0 : s));

    const effWolf = swap(rawWolf);
    const effSolo = swap(rawSolo);
    const effPoison = swap(rawPoison);
    const effGuard = swap(guard);

    let deaths = [];
    if (effWolf > 0 && effWolf === effSolo) {
      deaths.push(effWolf);
    } else {
      if (effWolf) {
        if (antidote && effGuard === effWolf) deaths.push(effWolf);
        else if (!antidote && effGuard !== effWolf) deaths.push(effWolf);
      }
      if (effSolo && !deaths.includes(effSolo) && effGuard !== effSolo) {
        deaths.push(effSolo);
      }
    }
    if (effPoison && !deaths.includes(effPoison)) deaths.push(effPoison);

    const summaryText = deaths.length === 0 ? "昨夜是平安夜" : `昨夜倒牌：${deaths.sort((a,b)=>a-b).map(s => s + '號').join('、')}`;
    return {
      deaths,
      hunterCanShoot: !deaths.includes(effPoison),
      wolfKingCanShoot: !deaths.includes(effPoison),
      summaryText,
      transformationLogs
    };
  },

  // 勝負判定
  checkGameOver(players = []) {
    const alive = players.filter(p => p.isAlive);
    const gods = alive.filter(p => p.seatType === "GOD").length;
    const villagers = alive.filter(p => p.seatType === "VILLAGER").length;
    const wolves = alive.filter(p => p.seatType === "WEREWOLF").length;

    if (wolves === 0) return { isOver: true, winner: "villager", reason: "好人陣營獲勝！(狼人全滅)" };
    if (gods === 0) return { isOver: true, winner: "werewolf", reason: "狼人陣營屠神獲勝！" };
    if (villagers === 0) return { isOver: true, winner: "werewolf", reason: "狼人陣營屠民獲勝！" };
    return { isOver: false, winner: null, reason: "進行中" };
  }
};
