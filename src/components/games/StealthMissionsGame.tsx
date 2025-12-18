import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PLAYER_HOME_DATA } from '../../graphql/player.queries';
import '../../styles/stealth-missions.css';
import { useNavigate } from 'react-router-dom';

// Constants matching User's Code
const CONST = {
    TILE: 40,
    COLORS: {
        bg: "#0b1220",
        wall: "#1e293b",
        floor: "#0f172a",
        player: "#38bdf8",
        npc: "#fbbf24",
        npcView: "rgba(251, 191, 36, 0.15)",
        item: "#34d399",
        zone: "rgba(52, 211, 153, 0.2)"
    }
};

// Utils
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

// Level Config Interfaces
interface RoomConfig { x: number; y: number; w: number; h: number; }
interface CorridorConfig { x: number; y: number; w: number; h: number; }

interface LevelConfig {
    name: string;
    width: number;
    height: number;
    rooms: RoomConfig[];
    corridors: CorridorConfig[];
    itemRoom: number;
    startRoom: number;
    npcRooms: number[];
    aiSpeed: number;
    description: string;
    enemyCount: number;
    difficultyLabel: string;
}

// User's Levels
const LEVELS: LevelConfig[] = [
    {
        name: "Nível 1: Operações Básicas",
        description: "Pratique suas habilidades",
        width: 68, height: 30,
        rooms: [
            { x: 3, y: 8, w: 10, h: 10 },  // Item
            { x: 20, y: 8, w: 10, h: 10 },
            { x: 38, y: 8, w: 10, h: 10 },
            { x: 55, y: 8, w: 10, h: 10 }  // Start
        ],
        corridors: [
            { x: 12, y: 12, w: 44, h: 2 }
        ],
        itemRoom: 0,
        startRoom: 3,
        npcRooms: [0, 1, 2],
        aiSpeed: 90,
        enemyCount: 3,
        difficultyLabel: "Fácil"
    },
    {
        name: "Nível 2: O Complexo",
        description: "Área de Alta Segurança",
        width: 50, height: 50,
        rooms: [
            { x: 4, y: 4, w: 12, h: 12 },   // Top Left (Item)
            { x: 34, y: 4, w: 12, h: 12 },  // Top Right
            { x: 4, y: 34, w: 12, h: 12 },  // Bot Left
            { x: 34, y: 34, w: 12, h: 12 }, // Bot Right (Start)
            { x: 19, y: 19, w: 12, h: 12 }  // Center (Danger)
        ],
        corridors: [
            { x: 16, y: 8, w: 18, h: 2 },   // Top H
            { x: 16, y: 38, w: 18, h: 2 },  // Bot H
            { x: 8, y: 16, w: 2, h: 18 },   // Left V
            { x: 38, y: 16, w: 2, h: 18 },  // Right V
            { x: 24, y: 16, w: 2, h: 3 },   // Center connections
            { x: 24, y: 31, w: 2, h: 3 }
        ],
        itemRoom: 0,
        startRoom: 3,
        npcRooms: [0, 1, 2, 4, 4], // More enemies
        aiSpeed: 110,
        enemyCount: 6,
        difficultyLabel: "Difícil"
    }
];

// Classes
class Camera {
    x = 0; y = 0; w: number; h: number;
    target: { x: number; y: number } | null = null;
    bounds = { w: 1000, h: 1000 };

    constructor(width: number, height: number) { this.w = width; this.h = height; }
    follow(target: { x: number; y: number }) { this.target = target; }
    setBounds(w: number, h: number) { this.bounds.w = w; this.bounds.h = h; }
    update() {
        if (!this.target) return;
        this.x = this.target.x - this.w / 2;
        this.y = this.target.y - this.h / 2;
        const maxX = this.bounds.w * CONST.TILE;
        const maxY = this.bounds.h * CONST.TILE;
        this.x = clamp(this.x, 0, maxX - this.w);
        this.y = clamp(this.y, 0, maxY - this.h);
    }
    resize(w: number, h: number) { this.w = w; this.h = h; }
}

class Entity {
    constructor(public x: number, public y: number, public r: number, public color: string) { }
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
    constructor(x: number, y: number) { super(x, y, 12, CONST.COLORS.player); }
    update(dt: number, input: Set<string>, map: GameMap) {
        let dx = 0, dy = 0;
        if (input.has('w') || input.has('arrowup')) dy--;
        if (input.has('s') || input.has('arrowdown')) dy++;
        if (input.has('a') || input.has('arrowleft')) dx--;
        if (input.has('d') || input.has('arrowright')) dx++;
        if (dx !== 0 || dy !== 0) {
            const l = Math.hypot(dx, dy);
            const moveDist = (this.speed * dt);
            const nx = this.x + (dx / l) * moveDist;
            const ny = this.y + (dy / l) * moveDist;
            if (!map.isSolid(nx, this.y)) this.x = nx;
            if (!map.isSolid(this.x, ny)) this.y = ny;
        }
    }
    draw(ctx: CanvasRenderingContext2D) {
        ctx.shadowBlur = 15; ctx.shadowColor = this.color;
        super.draw(ctx);
        ctx.shadowBlur = 0;
        if (this.hasItem) {
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
        }
    }
}

class NumberedItem extends Entity {
    collected = false;
    constructor(x: number, y: number, public number: number) { super(x, y, 16, CONST.COLORS.item); }
    draw(ctx: CanvasRenderingContext2D) {
        if (this.collected) return;
        ctx.shadowBlur = 20; ctx.shadowColor = this.color;
        super.draw(ctx);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#000'; ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(this.number.toString(), this.x, this.y);
    }
}

class NPC extends Entity {
    fovRange = 160; fovAngle = Math.PI / 2.5;
    vx = 1; vy = 0; changeDirTimer = 0;
    bounds: any = null;
    constructor(x: number, y: number, public speed: number) {
        super(x, y, 12, CONST.COLORS.npc);
        const a = Math.random() * Math.PI * 2;
        this.vx = Math.cos(a); this.vy = Math.sin(a);
    }
    setBounds(rect: RoomConfig) {
        this.bounds = {
            minX: (rect.x + 1) * CONST.TILE + 20,
            maxX: (rect.x + rect.w - 1) * CONST.TILE - 20,
            minY: (rect.y + 1) * CONST.TILE + 20,
            maxY: (rect.y + rect.h - 1) * CONST.TILE - 20
        };
    }
    update(dt: number, now: number) {
        if (now > this.changeDirTimer) {
            const a = Math.random() * Math.PI * 2;
            this.vx = Math.cos(a); this.vy = Math.sin(a);
            this.changeDirTimer = now + 1500 + Math.random() * 2000;
        }
        let nx = this.x + this.vx * this.speed * dt;
        let ny = this.y + this.vy * this.speed * dt;
        if (this.bounds) {
            if (nx < this.bounds.minX || nx > this.bounds.maxX) { this.vx *= -1; nx = clamp(nx, this.bounds.minX, this.bounds.maxX); }
            if (ny < this.bounds.minY || ny > this.bounds.maxY) { this.vy *= -1; ny = clamp(ny, this.bounds.minY, this.bounds.maxY); }
        }
        this.x = nx; this.y = ny;
    }
    canSee(target: { x: number; y: number }) {
        const dx = target.x - this.x; const dy = target.y - this.y;
        if (Math.hypot(dx, dy) > this.fovRange) return false;
        const angle = Math.atan2(dy, dx);
        const myAngle = Math.atan2(this.vy, this.vx);
        let diff = angle - myAngle;
        while (diff <= -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        return Math.abs(diff) < this.fovAngle / 2;
    }
    draw(ctx: CanvasRenderingContext2D) {
        const angle = Math.atan2(this.vy, this.vx);
        const grd = ctx.createRadialGradient(this.x, this.y, 10, this.x, this.y, this.fovRange);
        grd.addColorStop(0, "rgba(251, 191, 36, 0.4)"); grd.addColorStop(1, "rgba(251, 191, 36, 0)");
        ctx.fillStyle = grd; ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.fovRange, angle - this.fovAngle / 2, angle + this.fovAngle / 2);
        ctx.fill();
        super.draw(ctx);
    }
}

class GameMap {
    tiles: number[][]; rooms: RoomConfig[] = [];
    itemPos = { x: 0, y: 0 }; deliveryPos = { x: 0, y: 0, r: 30 };
    constructor(public config: LevelConfig) {
        this.tiles = Array.from({ length: config.height }, () => Array(config.width).fill(1));
    }
    generate() {
        const setRect = (x: number, y: number, w: number, h: number, v: number) => {
            for (let j = y; j < y + h; j++)
                for (let i = x; i < x + w; i++)
                    if (i >= 0 && i < this.config.width && j >= 0 && j < this.config.height) this.tiles[j][i] = v;
        };
        this.config.rooms.forEach(r => { this.rooms.push(r); setRect(r.x, r.y, r.w, r.h, 0); });
        this.config.corridors.forEach(c => setRect(c.x, c.y, c.w, c.h, 0));

        const rItem = this.rooms[this.config.itemRoom];
        const rStart = this.rooms[this.config.startRoom];
        this.itemPos = { x: (rItem.x + rItem.w / 2) * CONST.TILE, y: (rItem.y + rItem.h / 2) * CONST.TILE };
        this.deliveryPos = { x: (rStart.x + rStart.w / 2) * CONST.TILE, y: (rStart.y + rStart.h / 2) * CONST.TILE, r: 30 };
    }
    isSolid(x: number, y: number) {
        const tx = Math.floor(x / CONST.TILE), ty = Math.floor(y / CONST.TILE);
        if (tx < 0 || tx >= this.config.width || ty < 0 || ty >= this.config.height) return true;
        return this.tiles[ty][tx] === 1;
    }
    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        const startCol = Math.floor(camera.x / CONST.TILE), endCol = startCol + camera.w / CONST.TILE + 1;
        const startRow = Math.floor(camera.y / CONST.TILE), endRow = startRow + camera.h / CONST.TILE + 1;
        for (let y = startRow; y <= endRow; y++) {
            for (let x = startCol; x <= endCol; x++) {
                if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) continue;
                const isWall = this.tiles[y][x] === 1;
                ctx.fillStyle = isWall ? CONST.COLORS.wall : CONST.COLORS.floor;
                if (isWall) {
                    ctx.fillRect(x * CONST.TILE, y * CONST.TILE, CONST.TILE, CONST.TILE);
                    ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(x * CONST.TILE, y * CONST.TILE, CONST.TILE, 4);
                } else {
                    ctx.fillRect(x * CONST.TILE, y * CONST.TILE, CONST.TILE, CONST.TILE);
                    ctx.fillStyle = "rgba(0,0,0,0.1)";
                    ctx.fillRect(x * CONST.TILE + CONST.TILE - 1, y * CONST.TILE, 1, CONST.TILE);
                    ctx.fillRect(x * CONST.TILE, y * CONST.TILE + CONST.TILE - 1, CONST.TILE, 1);
                }
            }
        }
        ctx.fillStyle = CONST.COLORS.zone; ctx.beginPath();
        ctx.arc(this.deliveryPos.x, this.deliveryPos.y, this.deliveryPos.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = CONST.COLORS.item; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
    }
}

export const StealthMissionsGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'WIN'>('MENU');
    const [score, setScore] = useState(10);
    const [hasItem, setHasItem] = useState(false);
    const [objective, setObjective] = useState('');
    const [missionTitle, setMissionTitle] = useState('Desafio Matemática');
    const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

    // Core Game Ref to avoid re-renders
    const gameRef = useRef<{
        camera: Camera;
        player: Player | null;
        npcs: NPC[];
        items: NumberedItem[];
        collectedNumbers: number[];
        map: GameMap | null;
        input: Set<string>;
        animId: number | null;
    }>({
        camera: new Camera(window.innerWidth, window.innerHeight),
        player: null,
        npcs: [],
        items: [],
        collectedNumbers: [],
        map: null,
        input: new Set(),
        animId: null
    });

    const showToast = (msg: string, type = 'good') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2300);
    };

    const loadLevel = (levelIdx: number) => {
        const config = LEVELS[levelIdx];
        const map = new GameMap(config);
        map.generate();

        const state = gameRef.current;
        state.map = map;
        state.camera.setBounds(config.width, config.height);
        state.player = new Player(map.deliveryPos.x - 40, map.deliveryPos.y);
        state.camera.follow(state.player);

        // NPCs
        state.npcs = config.npcRooms.map(idx => {
            const r = map.rooms[idx];
            const npc = new NPC((r.x + r.w / 2) * CONST.TILE, (r.y + r.h / 2) * CONST.TILE, config.aiSpeed);
            npc.setBounds(r);
            return npc;
        });

        // Items (Math Challenge: Numbers in Rooms)
        const uniqueRooms = [...new Set(config.npcRooms)];
        const itemNumbers = Array.from({ length: uniqueRooms.length }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
        state.items = uniqueRooms.map((roomIdx, i) => {
            const r = map.rooms[roomIdx];
            return new NumberedItem((r.x + r.w / 2) * CONST.TILE, (r.y + r.h / 2) * CONST.TILE, itemNumbers[i]);
        });

        state.collectedNumbers = [];
        state.input.clear();

        setScore(10);
        setHasItem(false);
        setMissionTitle(config.name);
        setObjective('Colete os números: ' + itemNumbers.sort((a, b) => a - b).join(' -> ') + ' 🔢');
        setGameState('PLAYING');
        showToast("Missão Iniciada: Coleta Numérica");
    };

    // Game Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = gameRef.current;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            state.camera.resize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('keydown', e => state.input.add(e.key.toLowerCase()));
        window.addEventListener('keyup', e => state.input.delete(e.key.toLowerCase()));
        handleResize();

        const loop = (now: number) => {
            if (gameState === 'PLAYING' && state.map && state.player) {
                const dt = 0.016;
                state.player.update(dt, state.input, state.map);
                state.camera.update();

                // Items Logic (Math)
                state.items.forEach(item => {
                    if (!item.collected && dist(state.player!, item) < state.player!.r + item.r) {
                        // Check Math Order (Ascending)
                        const expected = state.items.length === state.collectedNumbers.length ? -1 :
                            [...state.items].map(i => i.number).sort((a, b) => a - b)[state.collectedNumbers.length];

                        if (item.number === expected) {
                            item.collected = true;
                            state.collectedNumbers.push(item.number);
                            setScore(s => s + 5);
                            showToast(`Coletou #${item.number}! ✓`);

                            // Check Win Condition (All collected? Return to Base)
                            if (state.collectedNumbers.length === state.items.length) {
                                setObjective("Retorne à base de extração! 🚁");
                                setHasItem(true);
                                state.player!.hasItem = true;
                            } else {
                                const next = [...state.items].map(i => i.number).sort((a, b) => a - b)[state.collectedNumbers.length];
                                setObjective(`Próximo: #${next} 🔢`);
                            }
                        } else {
                            showToast(`Ordem Errada! Busque #${expected}`, 'bad');
                            setScore(s => Math.max(0, s - 2));
                        }
                    }
                });

                // Extraction
                if (state.player.hasItem && dist(state.player, state.map.deliveryPos) < state.player.r + 30) {
                    setGameState('WIN');
                    showToast("Missão Completa! 🎉");
                }

                // NPCs
                state.npcs.forEach(npc => {
                    npc.update(dt, now);
                    if (npc.canSee(state.player!)) {
                        setScore(s => Math.max(0, s - 5));
                        showToast("Visto! Resetando...", 'bad');
                        state.player!.x = state.map!.deliveryPos.x;
                        state.player!.y = state.map!.deliveryPos.y;
                        state.player!.hasItem = false;
                        setHasItem(false);
                        state.collectedNumbers = [];
                        state.items.forEach(i => i.collected = false);
                        const allNums = [...state.items].map(i => i.number).sort((a, b) => a - b);
                        setObjective('Colete os números: ' + allNums.join(' -> ') + ' 🔢');
                    }
                });

                // Draw
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.translate(-state.camera.x, -state.camera.y);
                state.map.draw(ctx, state.camera);
                state.items.forEach(i => i.draw(ctx));
                state.npcs.forEach(n => n.draw(ctx));
                state.player.draw(ctx);
                ctx.restore();
            }
            state.animId = requestAnimationFrame(loop);
        };
        state.animId = requestAnimationFrame(loop);

        return () => {
            if (state.animId) cancelAnimationFrame(state.animId);
            window.removeEventListener('resize', handleResize);
        };
    }, [gameState]);

    return (
        <div className="stealth-game-container">
            <canvas ref={canvasRef} />

            {/* Menu Overlay */}
            {gameState === 'MENU' && (
                <div className="overlay active">
                    <h1>Lutaver</h1>
                    <p style={{ color: '#94a3b8' }}>Selecione o desafio de matemática</p>
                    <div className="level-grid">
                        {LEVELS.map((lvl, idx) => (
                            <div key={idx} className="level-card" onClick={() => loadLevel(idx)}>
                                <h3>{lvl.name}</h3>
                                <p>{lvl.description}</p>
                                <p style={{ fontSize: '11px', marginTop: '4px', opacity: 0.6 }}>
                                    {lvl.difficultyLabel} • {lvl.enemyCount} Inimigos
                                </p>
                            </div>
                        ))}
                    </div>
                    <button className="btn" style={{ marginTop: '40px', background: '#ef4444' }} onClick={() => navigate(-1)}>
                        Sair
                    </button>
                </div>
            )}

            {/* Win Overlay */}
            {gameState === 'WIN' && (
                <div className="overlay active">
                    <h1>Missão Completa!</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Excelente trabalho, agente matemático.</p>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: CONST.COLORS.item }}>Pontuação: {score}</p>
                    <button className="btn" onClick={() => setGameState('MENU')}>Voltar ao Menu</button>
                </div>
            )}

            {/* HUD */}
            <div className={`hud ${gameState === 'PLAYING' ? 'active' : ''}`}>
                <div className="hud-header">
                    <span style={{ fontSize: '20px' }}>🕵️</span>
                    <div className="title">{missionTitle}</div>
                </div>
                <div className="stat-row">
                    <span className="label">Pontos</span>
                    <span className="value">{score}</span>
                </div>
                <div className="stat-row">
                    <span className="label">Status</span>
                    <span className={`status-badge ${hasItem ? 'ok' : 'bad'}`}>
                        {hasItem ? '📦 Seguro' : '❌ Buscando'}
                    </span>
                </div>
                <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                    <span className="label">Objetivo</span><br />
                    <span style={{ color: '#fff', fontSize: '13px' }}>{objective}</span>
                </div>
            </div>

            {/* Toasts */}
            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast show ${t.type === 'bad' ? 'bad' : ''}`}>
                        {t.msg}
                    </div>
                ))}
            </div>

            <div className="controls-hint">
                Mover: <kbd>WASD</kbd> ou <kbd>Setas</kbd>
            </div>
        </div>
    );
};
