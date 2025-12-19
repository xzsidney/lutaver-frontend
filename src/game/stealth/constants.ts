

export const TILE_SIZE = 64;
export const PLAYER_RADIUS = 18;
export const ENEMY_RADIUS = 18;
export const ITEM_RADIUS = 12;

// Original colors for HiddenBattle (dark stealth theme)
export const COLORS = {
    BG: '#020617',
    WALL: '#1e293b',
    WALL_HIGHLIGHT: '#334155',
    FLOOR: '#0f172a',
    PLAYER: '#38bdf8',
    ENEMY: '#f43f5e',
    ITEM: '#fbbf24',
    EXTRACTION: '#10b981',
    FOV: 'rgba(244, 63, 94, 0.15)',
    SCANLINE: 'rgba(255, 255, 255, 0.03)'
};

// School-themed colors for Tower Exploration (matching hidden-battle dark theme)
export const TOWER_COLORS = {
    BG: '#020617',           // Same as hidden-battle
    WALL: '#1e293b',         // Same as hidden-battle
    WALL_HIGHLIGHT: '#334155', // Same as hidden-battle
    FLOOR: '#0f172a',        // Same as hidden-battle (dark floors)
    PLAYER: '#38bdf8',
    ENEMY: '#f43f5e',
    ITEM: '#fbbf24',
    EXTRACTION: '#10b981',
    FOV: 'rgba(244, 63, 94, 0.15)',
    SCANLINE: 'rgba(255, 255, 255, 0.03)',
    DOOR: '#8b5a3c',         // Brown door color
    ROOM_BG: 'rgba(255, 255, 255, 0.05)'
};

export const LEVELS: any[] = [
    {
        id: 1,
        name: "Missão: Cortina de Ferro",
        codename: "GHOST_RECON",
        width: 30,
        height: 20,
        rooms: [
            { x: 2, y: 2, w: 6, h: 6 },   // Item Room
            { x: 10, y: 5, w: 8, h: 4 },
            { x: 20, y: 2, w: 8, h: 8 },  // Entrance
            { x: 2, y: 12, w: 10, h: 6 },
            { x: 18, y: 12, w: 10, h: 6 }
        ],
        corridors: [
            { x: 8, y: 4, w: 2, h: 2 },
            { x: 18, y: 4, w: 2, h: 2 },
            { x: 6, y: 8, w: 2, h: 4 },
            { x: 22, y: 10, w: 2, h: 2 }
        ],
        itemRoomIdx: 0,
        startRoomIdx: 2,
        enemyCount: 4,
        baseEnemySpeed: 100
    },
    {
        id: 2,
        name: "Missão: Sombra Neon",
        codename: "CYBER_HEIST",
        width: 40,
        height: 30,
        rooms: [
            { x: 5, y: 5, w: 5, h: 5 },   // Top Left
            { x: 30, y: 5, w: 5, h: 5 },  // Top Right
            { x: 5, y: 20, w: 5, h: 5 },  // Bot Left
            { x: 30, y: 20, w: 5, h: 5 }, // Bot Right
            { x: 15, y: 10, w: 10, h: 10 } // Central Vault (Item)
        ],
        corridors: [
            { x: 10, y: 7, w: 5, h: 2 },
            { x: 25, y: 7, w: 5, h: 2 },
            { x: 10, y: 22, w: 5, h: 2 },
            { x: 25, y: 22, w: 5, h: 2 },
            { x: 19, y: 5, w: 2, h: 5 },
            { x: 19, y: 20, w: 2, h: 5 }
        ],
        itemRoomIdx: 4,
        startRoomIdx: 0,
        enemyCount: 8,
        baseEnemySpeed: 130
    }
];
