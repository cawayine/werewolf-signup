/**
 * 基地狼人殺 - 規則與板型獨立設定檔 (rules_config.js)
 * 職責：角色屬性、板型腳本、UI InputSchema、規則裁決引擎 (RULES_ENGINE)
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
  "預言家": { seatType: "GOD", faction: "villager", canCheck: true, allowRepeatCheck: true },
  "女巫": { seatType: "GOD", faction: "villager", hasAntidote: true, hasPoison: true, canUseBothPotionsSameNight: false, canSelfHealFirstNight: false, hideKillInfoAfterAntidote: true },
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
  "平民": { seatType: "VILLAGER", faction: "villager" },
  "燈影預言家": { seatType: "VILLAGER", faction: "villager", canCheck: true, reversedCheckResult: true, allowRepeatCheck: false },
  "混血兒": { seatType: "VILLAGER", faction: null, activeNight: 1, canSelfExplode: false, seerCheckResult: "villager" },
  "覺醒孤獨少女": { seatType: "VILLAGER", faction: null, activeNight: 1, canSelfExplode: false },
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
// 3. 全域規則裁決運算引擎 (RULES_ENGINE)
// ==========================================
const RULES_ENGINE = {
  // 魔術師換位映射
  getSwappedTarget(seat, swapPair) {
    if (!seat || !swapPair || !swapPair[0] || !swapPair[1]) return seat;
    const [magA, magB] = swapPair;
    if (seat === magA) return magB;
    if (seat === magB) return magA;
    return seat;
  },

  // 查驗陣營判定
  resolveCheck(rawTargetSeat, swapPair, players) {
    if (!rawTargetSeat) return { isReady: false, text: "待查驗", isWolf: false, actualSeat: 0 };
    const actualSeat = this.getSwappedTarget(rawTargetSeat, swapPair);
    const targetPlayer = players.find(p => p.seat === actualSeat);
    if (!targetPlayer) return { isReady: false, text: "目標不存在", isWolf: false, actualSeat: 0 };

    const roleName = targetPlayer.role;
    const isWolf = ["狼人", "狼王", "白狼王", "狼兄", "狼弟", "夢魘", "狼美人", "覺醒石像鬼"].includes(roleName);
    const swapText = (actualSeat !== rawTargetSeat) ? ` (換至${actualSeat}號)` : "";

    return {
      isReady: true,
      text: (isWolf ? "查殺 (狼人)" : "金水 (好人)") + swapText,
      isWolf: isWolf,
      actualSeat: actualSeat
    };
  },

  // 手勢即時動態求值
  evaluateGesture(gestureId, context) {
    const { rawPoisonTarget, swapPair, dreamerTarget, lastDreamerTarget, players, blackMarketTransformedWolf } = context;
    const actualPoisonTarget = this.getSwappedTarget(rawPoisonTarget, swapPair);
    const actualDreamerTarget = this.getSwappedTarget(dreamerTarget, swapPair);

    // 獵人手勢
    if (gestureId === "hunter_gesture") {
      const hunter = players.find(p => p.role === "獵人");
      if (!hunter) return { text: "無此角色", isPositive: false };
      const isPoisoned = (actualPoisonTarget === hunter.seat);
      const isDreamKilled = (actualDreamerTarget === hunter.seat && lastDreamerTarget === hunter.seat);
      if (isPoisoned || isDreamKilled) {
        return { text: "👎 技能受阻 (不可開槍)", isPositive: false };
      }
      return { text: "👍 狀態良好 (可開槍)", isPositive: true };
    }

    // 狼王手勢
    if (gestureId === "wolf_king_gesture") {
      const wolfKing = players.find(p => p.role === "狼王");
      if (!wolfKing) return { text: "無此角色", isPositive: false };
      if (actualPoisonTarget === wolfKing.seat) {
        return { text: "👎 已吃毒 (不可開槍)", isPositive: false };
      }
      return { text: "👍 狀態良好 (可開槍)", isPositive: true };
    }

    // 轉化者帶刀手勢
    if (gestureId === "converter_gesture") {
      const normalWolvesAlive = players.filter(p => p.isAlive && p.seatType === "WEREWOLF" && p.role !== "覺醒石像鬼").length;
      const canTakeBlade = (normalWolvesAlive === 0);
      return {
        text: canTakeBlade ? "👍 3狼全滅 (可帶刀)" : "👎 仍有狼在場 (不可帶刀)",
        isPositive: canTakeBlade
      };
    }

    // 黑商陣營手勢
    if (gestureId === "black_market_faction_gesture") {
      const isWolf = !!blackMarketTransformedWolf;
      return {
        text: isWolf ? "🐺 變身為狼人 (比狼手勢)" : "🧑 維持好人陣營 (比好人)",
        isPositive: !isWolf
      };
    }

    return { text: "👍 狀態良好", isPositive: true };
  },

  // 夜間天亮死訊與開槍判定結算
  resolveNight(inputs, state) {
    const { rawWolfTarget, rawPoisonTarget, guardTarget, dreamerTarget, youngWolfSolo, hybridTarget, gargoyleTarget, blackMarketGifts, antidoteUsed } = inputs;
    const { players, nightMemory, round } = state;

    // 1. 首夜身分處理
    if (round === 1) {
      if (hybridTarget) {
        const hybrid = players.find(p => p.role === "混血兒");
        if (hybrid) {
          hybrid.hybridTarget = hybridTarget;
          const target = players.find(p => p.seat === hybridTarget);
          hybrid.victoryFaction = (target && target.seatType === "WEREWOLF") ? "werewolf" : "villager";
        }
      }
      if (gargoyleTarget) {
        nightMemory.gargoyleConvertedTarget = gargoyleTarget;
      }
      if (blackMarketGifts && blackMarketGifts.seer && blackMarketGifts.poison && blackMarketGifts.gun) {
        nightMemory.blackMarketGifts = blackMarketGifts;
        const s1 = players.find(p => p.seat === blackMarketGifts.seer);
        const s2 = players.find(p => p.seat === blackMarketGifts.poison);
        const s3 = players.find(p => p.seat === blackMarketGifts.gun);
        if (s1 && s2 && s3 && s1.seatType !== "WEREWOLF" && s2.seatType !== "WEREWOLF" && s3.seatType !== "WEREWOLF") {
          nightMemory.blackMarketTransformedWolf = true;
        }
      }
    }

    // 2. 魔術師交換映射
    const swapPair = inputs.swapPair || [0, 0];
    const finalWolfTarget = this.getSwappedTarget(rawWolfTarget, swapPair);
    const finalPoisonTarget = this.getSwappedTarget(rawPoisonTarget, swapPair);
    const finalGuardTarget = this.getSwappedTarget(guardTarget, swapPair);
    const finalDreamerTarget = this.getSwappedTarget(dreamerTarget, swapPair);
    const finalYoungWolfTarget = this.getSwappedTarget(youngWolfSolo, swapPair);

    let deaths = [];
    let hunterCanShoot = true;
    let wolfKingCanShoot = true;

    // 3. 狼刀與守衛/解藥判定
    if (finalWolfTarget) {
      const isGuarded = (finalGuardTarget === finalWolfTarget);
      const isSaved = !!antidoteUsed;

      if (isGuarded && isSaved) {
        deaths.push(finalWolfTarget); // 同守同救奶穿
      } else if (isGuarded && !isSaved) {
        // 守中平安夜
      } else if (!isGuarded && isSaved) {
        // 解藥救活平安夜
      } else {
        deaths.push(finalWolfTarget);
      }
    }

    // 4. 狼弟獨立單刀
    if (finalYoungWolfTarget && !deaths.includes(finalYoungWolfTarget)) {
      deaths.push(finalYoungWolfTarget);
    }

    // 5. 毒藥判定
    if (finalPoisonTarget) {
      if (!deaths.includes(finalPoisonTarget)) deaths.push(finalPoisonTarget);
      const poisonedPlayer = players.find(p => p.seat === finalPoisonTarget);
      if (poisonedPlayer) {
        if (poisonedPlayer.role === "獵人") hunterCanShoot = false;
        if (poisonedPlayer.role === "狼王") wolfKingCanShoot = false;
      }
    }

    // 6. 攝夢人連夢判定
    if (finalDreamerTarget) {
      if (nightMemory.dreamerLastTarget === finalDreamerTarget) {
        if (!deaths.includes(finalDreamerTarget)) deaths.push(finalDreamerTarget);
        const dreamtPlayer = players.find(p => p.seat === finalDreamerTarget);
        if (dreamtPlayer && dreamtPlayer.role === "獵人") hunterCanShoot = false;
      }
    }

    // 7. 更新記憶庫狀態
    nightMemory.guardLastTarget = guardTarget || null;
    nightMemory.dreamerLastTarget = dreamerTarget || null;
    if (antidoteUsed) nightMemory.witchAntidoteUsed = true;
    if (rawPoisonTarget) nightMemory.witchPoisonUsed = true;

    // 8. 死訊摘要
    const summaryText = deaths.length === 0 ? "昨夜平安夜" : `昨夜死訊：${deaths.map(s => s + '號').join(', ')} 出局`;

    return {
      deaths: deaths,
      hunterCanShoot: hunterCanShoot,
      wolfKingCanShoot: wolfKingCanShoot,
      summaryText: summaryText
    };
  }
};

// ==========================================
// 4. 第一波 8 套定案板型資料庫 (BOARD_DATABASE)
// 包含 UI 規格 (inputSchema) 驅動記分台渲染
// ==========================================
const BOARD_DATABASE = {
  // 1. 標準：預女獵白混
  "預女獵白混": {
    name: "預女獵白混 (12人)",
    playerCount: 12,
    availableRoles: ["預言家", "女巫", "獵人", "白痴", "混血兒", "平民", "狼人"],
    defaultSlots: ["預言家", "女巫", "獵人", "白痴", "混血兒", "平民", "平民", "平民", "狼人", "狼人", "狼人", "狼人"],
    firstNightOrder: [
      { id: "hybrid", role: "混血兒", type: "SKILL", title: "混血兒請睜眼", prompt: "首夜選擇榜樣", schema: { type: "SINGLE_TARGET", targetScope: "ALL", placeholder: "選擇榜樣號碼" } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "團隊確認身分並落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } },
      { id: "idiot_confirm", role: "白痴", type: "CONFIRM", title: "白痴請睜眼", prompt: "確認身分後請閉眼", schema: { type: "CONFIRM_CARD" } }
    ],
    repeatingNightOrder: [
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
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
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空守 (不守護任何人)", preventConsecutive: true } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "團隊落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "gargoyle", role: "覺醒石像鬼", type: "SKILL", title: "覺醒石像鬼請睜眼", prompt: "選擇相鄰玩家進行轉化", schema: { type: "SINGLE_TARGET", targetScope: "ALL", placeholder: "選擇轉化相鄰玩家" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "gravekeeper_confirm", role: "守墓人", type: "CONFIRM", title: "守墓人請睜眼", prompt: "首夜確認身分後請閉眼", schema: { type: "CONFIRM_CARD" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
    ],
    repeatingNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空守 (不守護任何人)", preventConsecutive: true } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼隊落刀 (若3狼全滅由轉化者落刀)", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "converter_gesture", role: "轉化者", type: "GESTURE", title: "轉化者請睜眼", prompt: "其餘3狼全滅時給可帶刀手勢", schema: { type: "GESTURE_BADGE" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "gravekeeper_info", role: "守墓人", type: "INFO", title: "守墓人請睜眼", prompt: "查看昨日放逐者陣營", schema: { type: "INFO_CARD" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
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
      { id: "nightmare", role: "夢魘", type: "SKILL", title: "夢魘請睜眼", prompt: "全場絕對第一順位，恐懼一人", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", excludeSelf: true, placeholder: "不恐懼", preventConsecutive: true } },
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇一名玩家夢遊 (不可選自己)", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", excludeSelf: true, placeholder: "選擇夢遊玩家" } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
    ],
    repeatingNightOrder: [
      { id: "nightmare", role: "夢魘", type: "SKILL", title: "夢魘請睜眼", prompt: "恐懼一人 (防連恐、防恐自己)", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", excludeSelf: true, placeholder: "不恐懼", preventConsecutive: true } },
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇夢遊目標 (連夢同一人死亡)", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", excludeSelf: true, placeholder: "選擇夢遊目標" } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
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
      { id: "magician", role: "魔術師", type: "SKILL", title: "魔術師請睜眼", prompt: "交換兩名玩家號碼牌", schema: { type: "SWAP_TARGETS" } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼王與小狼睜眼互認並落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "查看原始刀口與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } },
      { id: "wolf_king_gesture", role: "狼王", type: "GESTURE", title: "狼王請睜眼", prompt: "給予開槍手勢 (吃毒則不可開槍)", schema: { type: "GESTURE_BADGE" } }
    ],
    repeatingNightOrder: [
      { id: "magician", role: "魔術師", type: "SKILL", title: "魔術師請睜眼", prompt: "交換兩名玩家號碼牌", schema: { type: "SWAP_TARGETS" } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "查看原始刀口與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } },
      { id: "wolf_king_gesture", role: "狼王", type: "GESTURE", title: "狼王請睜眼", prompt: "給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
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
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇夢遊目標 (不可選自己)", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", excludeSelf: true, placeholder: "選擇夢遊目標" } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼王與小狼睜眼互認並落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
    ],
    repeatingNightOrder: [
      { id: "dreamer", role: "攝夢人", type: "SKILL", title: "攝夢人請睜眼", prompt: "選擇夢遊目標", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", excludeSelf: true, placeholder: "選擇夢遊目標" } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
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
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空守 (不守護任何人)", preventConsecutive: true } },
      { id: "wolf_brothers_confirm", role: "狼兄狼弟", type: "CONFIRM", title: "狼兄狼弟請睜眼", prompt: "狼兄狼弟相認", schema: { type: "CONFIRM_CARD" } },
      { id: "wolf_team_confirm", role: "狼人", type: "SKILL", title: "狼弟閉眼，狼兄與兩小狼請睜眼", prompt: "確認彼此身分並團隊落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "black_market", role: "黑市商人", type: "SKILL", title: "黑市商人請睜眼", prompt: "贈送三份禮物 (查驗、毒藥、獵槍)", schema: { type: "THREE_GIFTS" } },
      { id: "seer_lucky_confirm", role: "幸運兒", type: "CONFIRM", title: "查驗幸運兒請睜眼", prompt: "確認獲得查驗技能", schema: { type: "CONFIRM_CARD" } },
      { id: "poison_lucky_confirm", role: "幸運兒", type: "CONFIRM", title: "毒藥幸運兒請睜眼", prompt: "確認獲得毒藥技能", schema: { type: "CONFIRM_CARD" } },
      { id: "gun_lucky_gesture", role: "幸運兒", type: "GESTURE", title: "獵槍幸運兒請睜眼", prompt: "確認獲得獵槍，並給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
    ],
    repeatingNightOrder: [
      { id: "black_market_faction_gesture", role: "黑市商人", type: "GESTURE", title: "黑市商人請睜眼", prompt: "給予陣營手勢 (若3禮物皆給好人則變身為狼)", schema: { type: "GESTURE_BADGE" } },
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空守 (不守護任何人)", preventConsecutive: true } },
      { id: "wolf_younger_solo", role: "狼弟", type: "SKILL", title: "狼弟請睜眼", prompt: "狼弟開刀手勢並單獨開刀 (狼兄出局時觸發)", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "選擇單獨擊殺目標", conditionalRoleDead: "狼兄" } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼隊請睜眼", prompt: "狼人團隊常規落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } }
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
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空守 (不守護任何人)", preventConsecutive: true } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼美人與小狼睜眼互認並落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "wolf_beauty", role: "狼美人", type: "SKILL", title: "狼美人請睜眼", prompt: "單獨睜眼魅惑一名存活目標", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "選擇魅惑玩家" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "knight_confirm", role: "騎士", type: "CONFIRM", title: "騎士請睜眼", prompt: "確認身分後請閉眼", schema: { type: "CONFIRM_CARD" } }
    ],
    repeatingNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空守 (不守護任何人)", preventConsecutive: true } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "wolf_beauty", role: "狼美人", type: "SKILL", title: "狼美人請睜眼", prompt: "魅惑一名存活目標", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "選擇魅惑玩家" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } }
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
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空守 (不守護任何人)", preventConsecutive: true } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "狼王與小狼睜眼互認並落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
    ],
    repeatingNightOrder: [
      { id: "guard", role: "守衛", type: "SKILL", title: "守衛請睜眼", prompt: "守護一人或空守", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空守 (不守護任何人)", preventConsecutive: true } },
      { id: "wolf", role: "狼人", type: "SKILL", title: "狼人請睜眼", prompt: "夜間落刀", schema: { type: "SINGLE_TARGET", targetScope: "ALIVE", placeholder: "空刀 (不擊殺)" } },
      { id: "witch", role: "女巫", type: "SKILL", title: "女巫請睜眼", prompt: "昨夜倒牌與用藥", schema: { type: "WITCH_POTIONS" } },
      { id: "seer", role: "預言家", type: "SKILL", title: "預言家請睜眼", prompt: "查驗陣營", schema: { type: "SEER_CHECK" } },
      { id: "hunter_gesture", role: "獵人", type: "GESTURE", title: "獵人請睜眼", prompt: "上帝給予開槍手勢", schema: { type: "GESTURE_BADGE" } }
    ],
    rules: { witchSelfHeal: "never", guardWitchOverlap: "milk_through", badgeLossOnDoubleExplode: true }
  }
};
