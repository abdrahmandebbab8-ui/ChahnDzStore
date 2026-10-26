/**
 * In-Game Player Name Verification Service for اشحنلي عبود (ChahnDz)
 * Simulates real-time API lookup (Midasbuy, Garena Partner, TikTok API)
 * to automatically retrieve and verify customer in-game usernames from their Player ID (UID).
 */

export interface PlayerVerificationResult {
  playerId: string;
  playerName: string;
  level?: string;
  serverRegion?: string;
  gameCategory: string;
  gameTitle: string;
  isVerified: boolean;
  avatarBadge?: string;
  verifiedAt: number;
}

// Known deterministic player database for realistic testing
const KNOWN_PLAYERS: Record<string, Partial<PlayerVerificationResult>> = {
  // PUBG Mobile IDs
  '5192837482': {
    playerName: 'Dz_Sniper99',
    level: 'Lv. 72 (Ace Master)',
    serverRegion: 'الشرق الأوسط (Middle East)',
  },
  '5281940291': {
    playerName: 'EL_CAPITANO_DZ',
    level: 'Lv. 68 (Conqueror)',
    serverRegion: 'أوروبا (Europe)',
  },
  '5819284729': {
    playerName: 'AlgerianGhost',
    level: 'Lv. 64 (Crown I)',
    serverRegion: 'الشرق الأوسط (Middle East)',
  },
  '5918274619': {
    playerName: 'Aboud_UC_Pro',
    level: 'Lv. 75 (Top Tier)',
    serverRegion: 'الشرق الأوسط (Middle East)',
  },

  // Free Fire IDs
  '184029481': {
    playerName: 'Algeria_King',
    level: 'Lv. 65 (Heroic)',
    serverRegion: 'شمال إفريقيا (MENA)',
  },
  '294810294': {
    playerName: 'BOOYAH_DZ_99',
    level: 'Lv. 59 (Master)',
    serverRegion: 'شمال إفريقيا (MENA)',
  },
  '194829104': {
    playerName: 'FF_Legend_Raouf',
    level: 'Lv. 71 (Grandmaster)',
    serverRegion: 'شمال إفريقيا (MENA)',
  },

  // TikTok Accounts
  'aboud_dz': {
    playerName: '@aboud_official_dz',
    level: 'الحساب موثق 100k+',
    serverRegion: 'الجزائر (Algeria)',
  },
  'chahndz': {
    playerName: '@chahndz_store',
    level: 'حساب معتمد',
    serverRegion: 'الجزائر (Algeria)',
  },
};

// In-memory cache for fast lookup
const verificationCache = new Map<string, PlayerVerificationResult>();

/**
 * Generate a deterministic authentic in-game name for any valid entered numeric Player ID
 */
function generateDeterministicName(productId: string, id: string): { name: string; level: string; server: string } {
  const pLower = productId.toLowerCase();
  const digits = id.replace(/[^0-9]/g, '');
  const seed = digits.length > 0 ? parseInt(digits.slice(-4), 10) || 1234 : 1234;

  if (pLower.includes('pubg')) {
    const prefixes = ['DZ_Sniper', 'Midas_Warrior', 'Algerian_Pro', 'Ghost_DZ', 'Viper_DZ', 'Eagle_Dz', 'Warrior_UC'];
    const prefix = prefixes[seed % prefixes.length];
    const num = (seed % 90) + 10;
    const lvl = 50 + (seed % 28);
    return {
      name: `${prefix}_${num}`,
      level: `Lv. ${lvl} (Crown)`,
      server: seed % 2 === 0 ? 'الشرق الأوسط (Middle East)' : 'أوروبا (Europe)',
    };
  }

  if (pLower.includes('free') || pLower.includes('fire')) {
    const prefixes = ['DZ_BOOYAH', 'Garena_Hero', 'Fire_King', 'Algiers_Pro', 'Dz_Legend', 'Cobra_Dz'];
    const prefix = prefixes[seed % prefixes.length];
    const num = (seed % 90) + 10;
    const lvl = 45 + (seed % 32);
    return {
      name: `${prefix}_${num}`,
      level: `Lv. ${lvl} (Heroic)`,
      server: 'شمال إفريقيا (MENA)',
    };
  }

  if (pLower.includes('tiktok')) {
    const cleanHandle = id.trim().toLowerCase().replace(/^@/, '');
    return {
      name: `@${cleanHandle || `user_${seed}`}`,
      level: 'حساب تيك توك نشط',
      server: 'الجزائر (Algeria)',
    };
  }

  // Generic / Gift Card / Game Top-Up
  const prefixes = ['Gamer_DZ', 'Player_Algeria', 'Pro_Account', 'Alpha_DZ'];
  const prefix = prefixes[seed % prefixes.length];
  return {
    name: `${prefix}_${seed % 999}`,
    level: `Lv. ${40 + (seed % 30)}`,
    server: 'Global Server',
  };
}

/**
 * In-game player name auto-verification API hook
 */
export async function verifyInGamePlayer(
  productId: string,
  playerId: string
): Promise<PlayerVerificationResult> {
  const cleanId = playerId.trim();
  if (!cleanId) {
    throw new Error('معرف اللاعب مطلوب للتحقق');
  }

  const cacheKey = `${productId}:${cleanId}`;
  if (verificationCache.has(cacheKey)) {
    return verificationCache.get(cacheKey)!;
  }

  // Simulate official inquiry API latency (350ms - 500ms)
  await new Promise((resolve) => setTimeout(resolve, 380));

  // Check known accounts first
  const known = KNOWN_PLAYERS[cleanId] || KNOWN_PLAYERS[cleanId.toLowerCase()];
  let resultName = known?.playerName;
  let resultLevel = known?.level;
  let resultServer = known?.serverRegion;

  if (!resultName) {
    const generated = generateDeterministicName(productId, cleanId);
    resultName = generated.name;
    resultLevel = generated.level;
    resultServer = generated.server;
  }

  const gameTitle = productId.toLowerCase().includes('pubg')
    ? 'PUBG Mobile'
    : productId.toLowerCase().includes('free')
    ? 'Free Fire'
    : productId.toLowerCase().includes('tiktok')
    ? 'TikTok'
    : 'Online Game';

  const verification: PlayerVerificationResult = {
    playerId: cleanId,
    playerName: resultName,
    level: resultLevel,
    serverRegion: resultServer,
    gameCategory: productId,
    gameTitle,
    isVerified: true,
    avatarBadge: '🎮',
    verifiedAt: Date.now(),
  };

  verificationCache.set(cacheKey, verification);
  return verification;
}
