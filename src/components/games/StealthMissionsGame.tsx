import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYER_HOME_DATA } from '../../graphql/player.queries';
import '../../styles/stealth-missions.css';

// Constants
const CONST = {
    TILE: 40,
    COLORS: {
        bg: '#0b1220',
        wall: '#1e293b',
        floor: '#0f172a',
        player: '#38bdf8',
        npc: '#fbbf24',
        npcView: 'rgba(251, 191, 36, 0.15)',
        item: '#34d399',
        zone: 'rgba(52, 211, 153, 0.2)',
    },
};

// Utility functions
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

// Level configurations
interface RoomConfig {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface CorridorConfig {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface LevelConfig {
    name: string;
    schoolYear: string;
    width: number;
    height: number;
    rooms: RoomConfig[];
    corridors: CorridorConfig[];
    itemRoom: number;
    startRoom: number;
    npcRooms: number[];
    aiSpeed: number;
    collectionOrder: 'ascending' | 'descending';
    collectionHint: string;
}

const LEVELS: LevelConfig[] = [
    {
        name: 'Missão Furtiva: Biblioteca',
        schoolYear: 'FUNDAMENTAL_1_1', // 1º Ano
        width: 68,
        height: 30,
        rooms: [
            { x: 3, y: 8, w: 10, h: 10 },
            { x: 20, y: 8, w: 10, h: 10 },
            { x: 38, y: 8, w: 10, h: 10 },
            { x: 55, y: 8, w: 10, h: 10 },
        ],
        corridors: [{ x: 12, y: 12, w: 44, h: 2 }],
        itemRoom: 0,
        startRoom: 3,
        npcRooms: [0, 1, 2],
        aiSpeed: 90,
        collectionOrder: 'descending',
        collectionHint: 'Pegue os itens na ordem decrescente',
    },
    {
        name: 'Missão Furtiva: Complexo',
        schoolYear: 'FUNDAMENTAL_1_2', // 2º Ano
        width: 50,
        height: 50,
        rooms: [
            { x: 4, y: 4, w: 12, h: 12 },
            { x: 34, y: 4, w: 12, h: 12 },
            { x: 4, y: 34, w: 12, h: 12 },
            { x: 34, y: 34, w: 12, h: 12 },
            { x: 19, y: 19, w: 12, h: 12 },
        ],
        corridors: [
            { x: 16, y: 8, w: 18, h: 2 },
            { x: 16, y: 38, w: 18, h: 2 },
            { x: 8, y: 16, w: 2, h: 18 },
            { x: 38, y: 16, w: 2, h: 18 },
            { x: 24, y: 16, w: 2, h: 3 },
            { x: 24, y: 31, w: 2, h: 3 },
        ],
        itemRoom: 0,
        startRoom: 3,
        npcRooms: [0, 1, 2, 4, 4],
        aiSpeed: 110,
        collectionOrder: 'ascending',
        collectionHint: 'Pegue os itens na ordem crescente',
    },
];

// Map schoolYear to level index
function getLevelBySchoolYear(schoolYear: string): number {
    const levelMap: Record<string, number> = {
        'FUNDAMENTAL_1_1': 0,
        'FUNDAMENTAL_1_2': 1,
        // Add more mappings as needed
    };
    return levelMap[schoolYear] ?? 0; // Default to level 0
}

// Camera class
class Camera {
    x = 0;
    y = 0;
    w: number;
    h: number;
    target: { x: number; y: number } | null = null;
    bounds = { w: 1000, h: 1000 };

    constructor(width: number, height: number) {
        this.w = width;
        this.h = height;
    }

    follow(target: { x: number; y: number }) {
        this.target = target;
    }

    setBounds(w: number, h: number) {
        this.bounds.w = w;
        this.bounds.h = h;
    }

    update() {
        if (!this.target) return;
        this.x = this.target.x - this.w / 2;
        this.y = this.target.y - this.h / 2;
        const maxX = this.bounds.w * CONST.TILE;
        const maxY = this.bounds.h * CONST.TILE;
        this.x = clamp(this.x, 0, maxX - this.w);
        this.y = clamp(this.y, 0, maxY - this.h);
    }

    resize(w: number, h: number) {
        this.w = w;
        this.h = h;
    }
}

// Entity classes
class Entity {
    x: number;
    y: number;
    r: number;
    color: string;

    constructor(x: number, y: number, r: number, color: string) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Player extends Entity {
    speed = 240;
    hasItem = false;

    constructor(x: number, y: number) {
        super(x, y, 12, CONST.COLORS.player);
    }

    update(dt: number, input: Set<string>, map: GameMap) {
        let dx = 0,
            dy = 0;
        if (input.has('w') || input.has('arrowup')) dy--;
        if (input.has('s') || input.has('arrowdown')) dy++;
        if (input.has('a') || input.has('arrowleft')) dx--;
        if (input.has('d') || input.has('arrowright')) dx++;

        if (dx !== 0 || dy !== 0) {
            const l = Math.hypot(dx, dy);
            const moveDist = this.speed * dt;
            const nx = this.x + (dx / l) * moveDist;
            const ny = this.y + (dy / l) * moveDist;
            if (!map.isSolid(nx, this.y)) this.x = nx;
            if (!map.isSolid(this.x, ny)) this.y = ny;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        super.draw(ctx);
        ctx.shadowBlur = 0;
        if (this.hasItem) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

class NumberedItem extends Entity {
    number: number;
    collected = false;

    constructor(x: number, y: number, number: number) {
        super(x, y, 16, CONST.COLORS.item);
        this.number = number;
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.collected) return;

        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        super.draw(ctx);
        ctx.shadowBlur = 0;

        // White border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Number
        ctx.fillStyle = '#000';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.number.toString(), this.x, this.y);
    }
}

class NPC extends Entity {
    speed: number;
    fovRange = 160;
    fovAngle = Math.PI / 2.5;
    vx = 1;
    vy = 0;
    changeDirTimer = 0;
    bounds: { minX: number; maxX: number; minY: number; maxY: number } | null = null;

    constructor(x: number, y: number, speed: number) {
        super(x, y, 12, CONST.COLORS.npc);
        this.speed = speed;
        const a = Math.random() * Math.PI * 2;
        this.vx = Math.cos(a);
        this.vy = Math.sin(a);
    }

    setBounds(rect: RoomConfig) {
        this.bounds = {
            minX: (rect.x + 1) * CONST.TILE + 20,
            maxX: (rect.x + rect.w - 1) * CONST.TILE - 20,
            minY: (rect.y + 1) * CONST.TILE + 20,
            maxY: (rect.y + rect.h - 1) * CONST.TILE - 20,
        };
    }

    update(dt: number, now: number) {
        if (now > this.changeDirTimer) {
            const a = Math.random() * Math.PI * 2;
            this.vx = Math.cos(a);
            this.vy = Math.sin(a);
            this.changeDirTimer = now + 1500 + Math.random() * 2000;
        }

        let nx = this.x + this.vx * this.speed * dt;
        let ny = this.y + this.vy * this.speed * dt;

        if (this.bounds) {
            if (nx < this.bounds.minX || nx > this.bounds.maxX) {
                this.vx *= -1;
                nx = clamp(nx, this.bounds.minX, this.bounds.maxX);
            }
            if (ny < this.bounds.minY || ny > this.bounds.maxY) {
                this.vy *= -1;
                ny = clamp(ny, this.bounds.minY, this.bounds.maxY);
            }
        }

        this.x = nx;
        this.y = ny;
    }

    canSee(target: { x: number; y: number }) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const d = Math.hypot(dx, dy);
        if (d > this.fovRange) return false;

        const angleToTarget = Math.atan2(dy, dx);
        const myAngle = Math.atan2(this.vy, this.vx);
        let diff = angleToTarget - myAngle;

        while (diff <= -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        return Math.abs(diff) < this.fovAngle / 2;
    }

    draw(ctx: CanvasRenderingContext2D) {
        const angle = Math.atan2(this.vy, this.vx);
        const grd = ctx.createRadialGradient(this.x, this.y, 10, this.x, this.y, this.fovRange);
        grd.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
        grd.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.fovRange, angle - this.fovAngle / 2, angle + this.fovAngle / 2);
        ctx.fill();

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        super.draw(ctx);
        ctx.shadowBlur = 0;
    }
}

// Map class
class GameMap {
    w: number;
    h: number;
    tiles: number[][];
    rooms: RoomConfig[] = [];
    config: LevelConfig;
    itemPos = { x: 0, y: 0 };
    deliveryPos = { x: 0, y: 0, r: 30 };

    constructor(config: LevelConfig) {
        this.w = config.width;
        this.h = config.height;
        this.tiles = Array.from({ length: this.h }, () => Array(this.w).fill(1));
        this.config = config;
    }

    generate() {
        const setRect = (x: number, y: number, w: number, h: number, v: number) => {
            for (let j = y; j < y + h; j++)
                for (let i = x; i < x + w; i++)
                    if (i >= 0 && i < this.w && j >= 0 && j < this.h) this.tiles[j][i] = v;
        };

        this.config.rooms.forEach((r) => {
            this.rooms.push(r);
            setRect(r.x, r.y, r.w, r.h, 0);
        });

        this.config.corridors.forEach((c) => {
            setRect(c.x, c.y, c.w, c.h, 0);
        });

        const rItem = this.rooms[this.config.itemRoom];
        const rStart = this.rooms[this.config.startRoom];

        this.itemPos = {
            x: (rItem.x + rItem.w / 2) * CONST.TILE,
            y: (rItem.y + rItem.h / 2) * CONST.TILE,
        };
        this.deliveryPos = {
            x: (rStart.x + rStart.w / 2) * CONST.TILE,
            y: (rStart.y + rStart.h / 2) * CONST.TILE,
            r: 30,
        };
    }

    isSolid(x: number, y: number) {
        const tx = Math.floor(x / CONST.TILE);
        const ty = Math.floor(y / CONST.TILE);
        if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) return true;
        return this.tiles[ty][tx] === 1;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const startCol = Math.floor(camera.x / CONST.TILE);
        const endCol = startCol + camera.w / CONST.TILE + 1;
        const startRow = Math.floor(camera.y / CONST.TILE);
        const endRow = startRow + camera.h / CONST.TILE + 1;

        for (let y = startRow; y <= endRow; y++) {
            for (let x = startCol; x <= endCol; x++) {
                if (x < 0 || x >= this.w || y < 0 || y >= this.h) continue;
                const isWall = this.tiles[y][x] === 1;
                ctx.fillStyle = isWall ? CONST.COLORS.wall : CONST.COLORS.floor;

                if (isWall) {
                    ctx.fillRect(x * CONST.TILE, y * CONST.TILE, CONST.TILE, CONST.TILE);
                    ctx.fillStyle = 'rgba(255,255,255,0.05)';
                    ctx.fillRect(x * CONST.TILE, y * CONST.TILE, CONST.TILE, 4);
                } else {
                    ctx.fillRect(x * CONST.TILE, y * CONST.TILE, CONST.TILE, CONST.TILE);
                    ctx.fillStyle = 'rgba(0,0,0,0.1)';
                    ctx.fillRect(x * CONST.TILE + CONST.TILE - 1, y * CONST.TILE, 1, CONST.TILE);
                    ctx.fillRect(x * CONST.TILE, y * CONST.TILE + CONST.TILE - 1, CONST.TILE, 1);
                }
            }
        }

        ctx.fillStyle = CONST.COLORS.zone;
        ctx.beginPath();
        ctx.arc(this.deliveryPos.x, this.deliveryPos.y, this.deliveryPos.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = CONST.COLORS.item;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

export const StealthMissionsGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isWinActive, setIsWinActive] = useState(false);
    const [score, setScore] = useState(10);
    const [hasItem, setHasItem] = useState(false);
    const [objective, setObjective] = useState('Encontre o pacote 📦');
    const [missionTitle, setMissionTitle] = useState('');
    const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDifficultySelect, setShowDifficultySelect] = useState(true);
    const [difficulty, setDifficulty] = useState<'easy' | 'hard'>('easy');
    const [gamePhase, setGamePhase] = useState<'collection' | 'extraction'>('collection');

    // Fetch character data
    const { data: characterData } = useQuery(GET_PLAYER_HOME_DATA);

    const gameStateRef = useRef<{
        camera: Camera;
        player: Player | null;
        npcs: NPC[];
        items: NumberedItem[];
        collectedNumbers: number[];
        expectedNumbers: number[];
        map: GameMap | null;
        isActive: boolean;
        input: Set<string>;
        animationId: number | null;
    }>({
        camera: new Camera(window.innerWidth, window.innerHeight),
        player: null,
        npcs: [],
        items: [],
        collectedNumbers: [],
        expectedNumbers: [],
        map: null,
        isActive: false,
        input: new Set(),
        animationId: null,
    });

    const showToast = (msg: string, type = 'good') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, msg, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 2300);
    };

    const loadLevel = (idx: number) => {
        const data = LEVELS[idx];
        const map = new GameMap(data);
        map.generate();

        const state = gameStateRef.current;
        state.camera.setBounds(data.width, data.height);
        state.player = new Player(map.deliveryPos.x - 40, map.deliveryPos.y);
        state.camera.follow(state.player);

        state.npcs = data.npcRooms.map((roomIdx) => {
            const r = map.rooms[roomIdx];
            const npc = new NPC((r.x + r.w / 2) * CONST.TILE, (r.y + r.h / 2) * CONST.TILE, data.aiSpeed);
            npc.setBounds(r);
            return npc;
        });

        if (difficulty === 'hard') {
            // HARD MODE: Random item positions anywhere on map
            const itemCount = 5; // Fixed 5 items for hard mode
            const itemNumbers = Array.from({ length: itemCount }, (_, i) => i + 1);

            state.items = itemNumbers.map((num) => {
                let x, y;
                let attempts = 0;
                do {
                    x = (Math.random() * (data.width - 10) + 5) * CONST.TILE;
                    y = (Math.random() * (data.height - 10) + 5) * CONST.TILE;
                    attempts++;
                } while (map.isSolid(x, y) && attempts < 100);

                return new NumberedItem(x, y, num);
            });

            state.expectedNumbers = []; // No order required in hard mode
            state.collectedNumbers = [];
            setObjective(`Colete todos os itens (0/${itemCount}) 🔢`);
            setGamePhase('collection');
        } else {
            // EASY MODE: Items in NPC rooms with order
            const uniqueRooms = [...new Set(data.npcRooms)];
            const itemNumbers = Array.from({ length: uniqueRooms.length }, (_, i) => i + 1)
                .sort(() => Math.random() - 0.5);

            state.items = uniqueRooms.map((roomIdx, i) => {
                const r = map.rooms[roomIdx];
                const item = new NumberedItem(
                    (r.x + r.w / 2) * CONST.TILE,
                    (r.y + r.h / 2) * CONST.TILE,
                    itemNumbers[i]
                );
                return item;
            });

            const sortedNumbers = [...itemNumbers].sort((a, b) =>
                data.collectionOrder === 'ascending' ? a - b : b - a
            );
            state.expectedNumbers = sortedNumbers;
            state.collectedNumbers = [];
            setObjective(data.collectionHint + ' 🔢');
        }

        state.map = map;
        state.isActive = true;

        setScore(10);
        setHasItem(false);
        setIsWinActive(false);
        setMissionTitle(data.name);
        setIsLoading(false);
        showToast('Missão Iniciada');
    };

    // Set mission title on component mount
    useEffect(() => {
        if (characterData?.meCharacter?.schoolYear) {
            const schoolYear = characterData.meCharacter.schoolYear;
            const levelIndex = getLevelBySchoolYear(schoolYear);
            const level = LEVELS[levelIndex];
            setMissionTitle(level.name);
            setIsLoading(false);
        }
    }, [characterData]);

    const showMenu = () => {
        // Return to dashboard instead of showing menu
        window.history.back();
    };

    const handleCaught = () => {
        const state = gameStateRef.current;
        if (!state.player || !state.map) return;

        setScore((prev) => Math.max(0, prev - 1));
        showToast('Spotted! Resetting...', 'bad');

        state.player.x = state.map.deliveryPos.x;
        state.player.y = state.map.deliveryPos.y;
        state.player.hasItem = false;

        // Reset collected items
        state.collectedNumbers = [];
        state.items.forEach(item => item.collected = false);

        setHasItem(false);

        // Reset objective based on difficulty
        if (difficulty === 'hard') {
            setGamePhase('collection');
            setObjective(`Colete todos os itens (0/${state.items.length}) 🔢`);
        } else {
            const level = LEVELS[getLevelBySchoolYear(characterData?.meCharacter?.schoolYear || '')];
            setObjective(level?.collectionHint + ' 🔢' || 'Encontre o pacote 📦');
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = gameStateRef.current;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            state.camera.resize(window.innerWidth, window.innerHeight);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            state.input.add(e.key.toLowerCase());
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            state.input.delete(e.key.toLowerCase());
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        let lastTime = performance.now();

        const gameLoop = (now: number) => {
            const dt = 0.016;

            if (state.isActive && state.player && state.map) {
                state.player.update(dt, state.input, state.map);
                state.camera.update();

                // Check for item collection
                state.items.forEach((item) => {
                    if (!item.collected && dist(state.player!, item) < state.player!.r + item.r) {
                        if (difficulty === 'hard') {
                            // HARD MODE: Any order, then extraction
                            if (gamePhase === 'collection') {
                                item.collected = true;
                                state.collectedNumbers.push(item.number);
                                showToast(`Coletou #${item.number}! ✓`, 'good');
                                setScore((prev) => prev + 3);

                                const remaining = state.items.length - state.collectedNumbers.length;
                                if (remaining === 0) {
                                    // All collected, start extraction phase
                                    setGamePhase('extraction');
                                    setObjective('Retorne ao ponto de extração! 🚁');
                                    showToast('Todos itens coletados! Volte ao início!', 'good');
                                } else {
                                    setObjective(`Colete todos os itens (${state.collectedNumbers.length}/${state.items.length}) 🔢`);
                                }
                            }
                        } else {
                            // EASY MODE: Must collect in order
                            const expectedNumber = state.expectedNumbers[state.collectedNumbers.length];

                            if (item.number === expectedNumber) {
                                item.collected = true;
                                state.collectedNumbers.push(item.number);
                                showToast(`Coletou #${item.number}! ✓`, 'good');
                                setScore((prev) => prev + 2);

                                if (state.collectedNumbers.length === state.items.length) {
                                    state.isActive = false;
                                    setIsWinActive(true);
                                    showToast('Missão Completa! 🎉', 'good');
                                } else {
                                    const nextNumber = state.expectedNumbers[state.collectedNumbers.length];
                                    setObjective(`Próximo: #${nextNumber} 🔢`);
                                }
                            } else {
                                showToast(`Ordem errada! Esperava #${expectedNumber}`, 'bad');
                                state.collectedNumbers = [];
                                state.items.forEach(i => i.collected = false);
                                const level = LEVELS[getLevelBySchoolYear(characterData?.meCharacter?.schoolYear || '')];
                                setObjective(level?.collectionHint + ' 🔢' || 'Encontre os itens');
                                setScore((prev) => Math.max(0, prev - 1));
                            }
                        }
                    }
                });

                // Check extraction (hard mode only)
                if (difficulty === 'hard' && gamePhase === 'extraction' && state.map) {
                    if (dist(state.player, state.map.deliveryPos) < state.player.r + 30) {
                        state.isActive = false;
                        setIsWinActive(true);
                        setScore((prev) => prev + 10); // Bonus for completing extraction
                        showToast('Missão Completa! 🎉', 'good');
                    }
                }

                state.npcs.forEach((npc) => {
                    npc.update(dt, now);
                    if (npc.canSee(state.player!)) handleCaught();
                });
            }

            // Draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (state.isActive && state.map && state.player) {
                ctx.save();
                ctx.translate(-state.camera.x, -state.camera.y);
                state.map.draw(ctx, state.camera);

                // Draw numbered items
                state.items.forEach((item) => item.draw(ctx));

                state.npcs.forEach((n) => n.draw(ctx));
                state.player.draw(ctx);
                ctx.restore();
            }

            state.animationId = requestAnimationFrame(gameLoop);
        };

        state.animationId = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (state.animationId) cancelAnimationFrame(state.animationId);
        };
    }, []);

    return (
        <div className="stealth-game-container">
            <canvas ref={canvasRef} />

            {/* Loading State */}
            {isLoading && (
                <div className="overlay active">
                    <h1>Missão Furtiva</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
                </div>
            )}

            {/* HUD */}
            <div className={`hud ${!isLoading && !isWinActive ? 'active' : ''}`}>
                <div className="hud-header">
                    <span style={{ fontSize: '20px' }}>🕵️</span>
                    <div className="title">{missionTitle}</div>
                </div>

                <div className="stat-row">
                    <span className="label">Score</span>
                    <span className="value">{score}</span>
                </div>

                <div className="stat-row">
                    <span className="label">Status</span>
                    <span className={`status-badge ${hasItem ? 'ok' : 'bad'}`}>
                        {hasItem ? '📦 Secure' : '❌ Missing'}
                    </span>
                </div>

                <div style={{ marginTop: '12px', borderTop: '1px solid var(--hud-border)', paddingTop: '12px' }}>
                    <span className="label">Objective</span>
                    <br />
                    <span style={{ color: '#fff', fontSize: '13px' }}>{objective}</span>
                </div>
            </div>

            {/* WIN */}
            {isWinActive && (
                <div className="win-overlay">
                    <div className="win-panel">
                        <h2>{missionTitle}</h2>
                        <p className="win-msg">Mission Complete!</p>
                        <div className="win-stats">
                            <div>Final Score: {score}</div>
                        </div>
                        <button className="menu-button" onClick={showMenu}>
                            📋 Retornar
                        </button>
                    </div>
                </div>
            )}

            {/* DIFFICULTY SELECTION */}
            {showDifficultySelect && (
                <div className="win-overlay">
                    <div className="win-panel" style={{ maxWidth: '500px' }}>
                        <h2 style={{ marginBottom: '10px' }}>🎯 {missionTitle || 'Missão Furtiva'}</h2>
                        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '30px' }}>
                            Selecione a dificuldade
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {/* Easy Mode */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)',
                                border: '2px solid rgba(52, 211, 153, 0.5)',
                                borderRadius: '12px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                                onClick={() => {
                                    setDifficulty('easy');
                                    setShowDifficultySelect(false);
                                    if (characterData?.meCharacter?.schoolYear) {
                                        const levelIndex = getLevelBySchoolYear(characterData.meCharacter.schoolYear);
                                        loadLevel(levelIndex);
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.8)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.5)';
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ fontSize: '36px' }}>🟢</span>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <h3 style={{ margin: 0, color: '#34d399', fontSize: '18px' }}>FÁCIL</h3>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
                                            Colete os itens na ordem correta
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Hard Mode */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
                                border: '2px solid rgba(239, 68, 68, 0.5)',
                                borderRadius: '12px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                                onClick={() => {
                                    setDifficulty('hard');
                                    setShowDifficultySelect(false);
                                    if (characterData?.meCharacter?.schoolYear) {
                                        const levelIndex = getLevelBySchoolYear(characterData.meCharacter.schoolYear);
                                        loadLevel(levelIndex);
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.8)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                                }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <span style={{ fontSize: '36px' }}>🔴</span>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <h3 style={{ margin: 0, color: '#ef4444', fontSize: '18px' }}>DIFÍCIL</h3>
                                        <p style={{ margin: '5px 0 0 0', fontSize: '13px', opacity: 0.9 }}>
                                            Colete todos os itens e retorne ao ponto de extração
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            className="menu-button"
                            onClick={showMenu}
                            style={{ marginTop: '20px', opacity: 0.7, fontSize: '12px' }}
                        >
                            ← Voltar
                        </button>
                    </div>
                </div>
            )}

            <div className="controls-hint">
                Move: <kbd>WASD</kbd> or <kbd>Arrows</kbd>
            </div>

            <div className="toast-container">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast ${toast.type === 'bad' ? 'bad' : ''} show`}>
                        {toast.msg}
                    </div>
                ))}
            </div>

            {/* WIN */}
            <div className={`overlay ${isWinActive ? 'active' : ''}`}>
                <h1>Mission Complete!</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Excellent work, agent.</p>
                <button className="btn" onClick={showMenu}>
                    Map Select
                </button>
            </div>
        </div>
    );
};
