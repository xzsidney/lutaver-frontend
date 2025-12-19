import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Engine } from '../../game/stealth/engine';
import { TOWER_COLORS, TILE_SIZE, PLAYER_RADIUS } from '../../game/stealth/constants';
import { ME_CHARACTER_QUERY } from '../../graphql/character.queries';

// --- GraphQL ---

const START_TOWER_FLOOR_RUN = gql`
  mutation StartTowerFloorRun($floorId: ID!, $characterId: ID!) {
    startTowerFloorRun(floorId: $floorId, characterId: $characterId) {
      runId
      seed
      floor {
        mapWidth
        mapHeight
      }
      rooms {
        id
        type
        name
        description
      }
    }
  }
`;

const ENTER_ROOM_MUTATION = gql`
  mutation EnterRoom($runId: ID!, $roomId: ID!) {
    enterRoom(runId: $runId, roomId: $roomId) {
      ok
      room {
        id
        name
      }
    }
  }
`;

// --- RNG Utilities ---

class SeededRNG {
    private seed: number;

    constructor(seedStr: string) {
        // Cyrb128 to seeding mulberry32
        let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < seedStr.length; i++) {
            k = seedStr.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        this.seed = (h1 ^ h2 ^ h3 ^ h4) >>> 0;
    }

    next(): number {
        var t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    range(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

interface Room {
    id: string;
    type: string;
    name: string;
    description: string;
    // Visuals
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    color?: string;
    icon?: string;
}

const ROOM_STYLES: Record<string, { icon: string, color: string }> = {
    'MATH': { icon: '🔢', color: '#3b82f6' },
    'PORTUGUESE': { icon: '📖', color: '#ef4444' },
    'SCIENCE': { icon: '🧪', color: '#10b981' },
    'HISTORY': { icon: '🏺', color: '#f59e0b' },
    'GEOGRAPHY': { icon: '🌍', color: '#8b5cf6' },
    'ARTS': { icon: '🎨', color: '#ec4899' },
    'BOSS_ROOM': { icon: '👹', color: '#dc2626' },
    'DEFAULT': { icon: '🚪', color: '#64748b' }
};

const getRoomStyle = (name: string, type: string) => {
    if (type === 'BOSS_ROOM') return ROOM_STYLES.BOSS_ROOM;
    const n = name.toUpperCase();
    if (n.includes('MATEMÁTICA') || n.includes('MATH')) return ROOM_STYLES.MATH;
    if (n.includes('PORTUGUÊS') || n.includes('PORTUGUESE')) return ROOM_STYLES.PORTUGUESE;
    if (n.includes('CIÊNCIA') || n.includes('SCIENCE')) return ROOM_STYLES.SCIENCE;
    if (n.includes('HISTÓRIA') || n.includes('HISTORY')) return ROOM_STYLES.HISTORY;
    if (n.includes('GEOGRAFIA') || n.includes('GEOGRAPHY')) return ROOM_STYLES.GEOGRAPHY;
    if (n.includes('ARTE') || n.includes('ARTS')) return ROOM_STYLES.ARTS;
    return ROOM_STYLES.DEFAULT;
};

export const TowerExplorationPage: React.FC = () => {
    const { floorId } = useParams<{ floorId: string }>();
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Auth & Game Context
    const { data: charData } = useQuery(ME_CHARACTER_QUERY);
    const characterId = charData?.meCharacter?.id;

    // Mutations
    const [startRun, { loading: loadingRun }] = useMutation(START_TOWER_FLOOR_RUN);
    const [enterRoomMutation] = useMutation(ENTER_ROOM_MUTATION);

    // Game State
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [showInstructions, setShowInstructions] = useState(true);
    const [runData, setRunData] = useState<{ runId: string, seed: string } | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    // Engine Refs
    const gameState = useRef({
        player: { x: 0, y: 0 },
        camera: { x: 0, y: 0 },
        keys: new Set<string>(),
        tiles: [] as number[][],
        rooms: [] as Room[],
        width: 0,
        height: 0
    });

    const initialized = useRef(false);

    // 1. Initialize Run (Deterministic)
    useEffect(() => {
        if (!floorId || !characterId || initialized.current) return;

        const init = async () => {
            try {
                const { data } = await startRun({
                    variables: { floorId, characterId }
                });
                if (data?.startTowerFloorRun) {
                    setRunData({
                        runId: data.startTowerFloorRun.runId,
                        seed: data.startTowerFloorRun.seed
                    });
                    initMap(data.startTowerFloorRun);
                    initialized.current = true;
                    setIsInitializing(false); // Mark initialization complete
                }
            } catch (err) {
                console.error("Failed to start run:", err);
                setIsInitializing(false); // Stop loading even on error
            }
        };
        init();
    }, [floorId, characterId, startRun]);

    // 2. Configure Canvas Size
    useEffect(() => {
        if (!canvasRef.current || isInitializing) return;

        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        console.log("✅ Canvas configured:", canvas.width, "x", canvas.height);
    }, [isInitializing]);


    const initMap = (payload: any) => {
        const { seed, rooms: apiRooms, floor } = payload;

        // Use hidden-battle style layout (30x20 grid with predefined rooms/corridors)
        const mapWidth = 30;
        const mapHeight = 20;
        const tiles = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(1)); // 1 = Wall

        // Helper to carve out floors
        const setRect = (r: { x: number, y: number, w: number, h: number }, val: number) => {
            for (let y = r.y; y < r.y + r.h; y++)
                for (let x = r.x; x < r.x + r.w; x++)
                    if (y >= 0 && y < mapHeight && x >= 0 && x < mapWidth) tiles[y][x] = val;
        };

        // Define tower floor layout (similar to hidden-battle structure)
        const rooms = [
            { x: 2, y: 2, w: 6, h: 6 },   // Top-left room
            { x: 10, y: 5, w: 8, h: 4 },  // Center room
            { x: 20, y: 2, w: 8, h: 8 },  // Top-right room (spawn)
            { x: 2, y: 12, w: 10, h: 6 }, // Bottom-left room
            { x: 18, y: 12, w: 10, h: 6 } // Bottom-right room (boss)
        ];

        const corridors = [
            { x: 8, y: 4, w: 2, h: 2 },
            { x: 18, y: 4, w: 2, h: 2 },
            { x: 6, y: 8, w: 2, h: 4 },
            { x: 22, y: 10, w: 2, h: 2 }
        ];

        // Carve out rooms and corridors
        rooms.forEach(r => setRect(r, 0));
        corridors.forEach(c => setRect(c, 0));

        // Assign API rooms to physical rooms
        const spawnRoom = rooms[2]; // Top-right
        const bossRoomIdx = rooms.length - 1; // Bottom-right

        const processedRooms: Room[] = [];

        // Assign rooms to physical locations
        apiRooms.forEach((apiRoom: any, idx: number) => {
            if (idx >= rooms.length) return; // Skip if more API rooms than physical rooms

            const physRoom = rooms[idx];
            const style = getRoomStyle(apiRoom.name, apiRoom.type);

            processedRooms.push({
                ...apiRoom,
                x: (physRoom.x + physRoom.w / 2) * TILE_SIZE,
                y: (physRoom.y + physRoom.h / 2) * TILE_SIZE,
                w: TILE_SIZE,
                h: TILE_SIZE,
                ...style
            });
        });

        // Store in game state
        gameState.current.tiles = tiles;
        gameState.current.width = mapWidth;
        gameState.current.height = mapHeight;
        gameState.current.rooms = processedRooms;

        // Player Start (spawn room)
        gameState.current.player = {
            x: (spawnRoom.x + spawnRoom.w / 2) * TILE_SIZE,
            y: (spawnRoom.y + spawnRoom.h / 2) * TILE_SIZE
        };

        console.log("Tower Floor Generated (Hidden-Battle Style)", { seed, rooms: processedRooms.length });
    };

    const bindRoom = (apiRoom: any, physRoom: any): Room => {
        const style = getRoomStyle(apiRoom.name, apiRoom.type);
        return {
            ...apiRoom,
            x: (physRoom.x + physRoom.w / 2) * TILE_SIZE,
            y: (physRoom.y + physRoom.h / 2) * TILE_SIZE,
            w: TILE_SIZE,
            h: TILE_SIZE,
            ...style
        };
    };

    // Input Handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Handle interaction keys separately (don't add to movement keys)
            if (e.key === ' ' || e.key.toLowerCase() === 'e') {
                e.preventDefault(); // Prevent page scroll on space
                checkInteraction();
                return; // Don't add to keys set
            }
            gameState.current.keys.add(e.key.toLowerCase());
        };
        const handleKeyUp = (e: KeyboardEvent) => gameState.current.keys.delete(e.key.toLowerCase());
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const checkInteraction = () => {
        const { player, rooms } = gameState.current;
        const interactionDist = TILE_SIZE * 1.5;
        const target = rooms.find(r => {
            if (r.x === undefined || r.y === undefined) return false;
            const dist = Math.hypot(player.x - r.x, player.y - r.y);
            return dist < interactionDist;
        });

        if (target) {
            handleEnterRoom(target);
        }
    };

    const handleEnterRoom = async (room: Room) => {
        if (!runData) return;

        try {
            // Backend validation
            const { data } = await enterRoomMutation({
                variables: { runId: runData.runId, roomId: room.id }
            });

            if (data?.enterRoom?.ok) {
                if (room.name.toLowerCase().includes('matemática') || room.name.toLowerCase().includes('math')) {
                    navigate('/player/math-challenge');
                } else {
                    navigate(`/player/room/${room.id}`);
                }
            }
        } catch (err) {
            console.error("Failed to enter room:", err);
            // Optional: Show error "Locked" or "Invalid"
        }
    };

    // Game Loop
    const gameLoop = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.log("⚠️ GameLoop: Canvas not found");
            return;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        const dt = 0.016;
        const { player, camera, keys, tiles, rooms, width, height } = gameState.current;

        // --- UPDATE ---
        let dx = 0, dy = 0;
        if (keys.has('w') || keys.has('arrowup')) dy--;
        if (keys.has('s') || keys.has('arrowdown')) dy++;
        if (keys.has('a') || keys.has('arrowleft')) dx--;
        if (keys.has('d') || keys.has('arrowright')) dx++;

        if (dx !== 0 || dy !== 0) {
            const mag = Math.hypot(dx, dy);
            const speed = 150; // Reduced from 300 for better control
            const nx = player.x + (dx / mag) * speed * dt;
            const ny = player.y + (dy / mag) * speed * dt;
            const pos = Engine.checkCircleWallCollision(nx, ny, PLAYER_RADIUS, tiles);
            player.x = pos.x;
            player.y = pos.y;
        }

        camera.x = player.x - canvas.width / 2;
        camera.y = player.y - canvas.height / 2;

        const interactionDist = TILE_SIZE * 1.5;
        const nearbyRoom = rooms.find(r => {
            if (r.x === undefined || r.y === undefined) return false;
            const dist = Math.hypot(player.x - r.x, player.y - r.y);
            return dist < interactionDist;
        });
        setActiveRoom(nearbyRoom || null);

        // --- DRAW ---
        ctx.fillStyle = TOWER_COLORS.BG;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        const startX = Math.floor(camera.x / TILE_SIZE);
        const startY = Math.floor(camera.y / TILE_SIZE);
        const endX = startX + Math.ceil(canvas.width / TILE_SIZE) + 1;
        const endY = startY + Math.ceil(canvas.height / TILE_SIZE) + 1;

        for (let y = Math.max(0, startY); y < Math.min(height, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(width, endX); x++) {
                const tile = tiles[y][x];
                if (tile === 1) {
                    // Wall with depth
                    ctx.fillStyle = TOWER_COLORS.WALL;
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = TOWER_COLORS.WALL_HIGHLIGHT;
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 4);
                } else {
                    // Floor (light school tiles)
                    ctx.fillStyle = TOWER_COLORS.FLOOR;
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

                    // Floor tile lines (for that school hallway look)
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw Rooms with School Theme
        rooms.forEach(room => {
            if (room.x === undefined || room.y === undefined) return;
            const isNearby = nearbyRoom?.id === room.id;

            // Pulsing glow effect for nearby rooms
            const pulseTime = Date.now() / 500;
            const glowIntensity = isNearby ? (Math.sin(pulseTime) * 0.3 + 0.7) : 0.3;

            // Door frame (school door)
            ctx.fillStyle = TOWER_COLORS.DOOR;
            ctx.fillRect(room.x - TILE_SIZE * 0.6, room.y - TILE_SIZE * 0.7, TILE_SIZE * 1.2, TILE_SIZE * 1.4);

            // Room background circle
            if (isNearby) {
                ctx.shadowBlur = 30 * glowIntensity;
                ctx.shadowColor = room.color || '#fff';
            }
            ctx.fillStyle = (room.color || '#fff') + Math.floor(glowIntensity * 100).toString(16);
            ctx.beginPath();
            ctx.arc(room.x, room.y, TILE_SIZE * 0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Room Icon (bigger)
            ctx.font = '48px sans-serif';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(room.icon || '🚪', room.x, room.y);

            // Room name below
            ctx.font = isNearby ? 'bold 16px sans-serif' : '14px sans-serif';
            ctx.fillStyle = isNearby ? '#fff' : '#cbd5e1';
            ctx.fillText(room.name, room.x, room.y + TILE_SIZE * 0.8);

            // Info card for nearby room
            if (isNearby && room.description) {
                const cardX = room.x + TILE_SIZE * 1.5;
                const cardY = room.y - TILE_SIZE;
                const cardW = 250;
                const cardH = 100;

                // Card background
                ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
                ctx.strokeStyle = room.color || '#38bdf8';
                ctx.lineWidth = 2;
                ctx.fillRect(cardX, cardY, cardW, cardH);
                ctx.strokeRect(cardX, cardY, cardW, cardH);

                // Card content
                ctx.textAlign = 'left';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillStyle = room.color || '#38bdf8';
                ctx.fillText(room.name, cardX + 15, cardY + 25);

                ctx.font = '12px sans-serif';
                ctx.fillStyle = '#94a3b8';
                const desc = room.description.length > 40
                    ? room.description.substring(0, 40) + '...'
                    : room.description;
                ctx.fillText(desc, cardX + 15, cardY + 50);

                ctx.font = 'bold 14px monospace';
                ctx.fillStyle = '#10b981';
                ctx.fillText('[E] ENTRAR', cardX + 15, cardY + 75);
            }
        });

        ctx.shadowBlur = 15;
        ctx.shadowColor = TOWER_COLORS.PLAYER;
        ctx.fillStyle = TOWER_COLORS.PLAYER;
        ctx.beginPath();
        ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (activeRoom) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText("[E] ENTRAR", player.x, player.y - 40);
        }

        ctx.restore();

        // Draw Minimap
        const minimapSize = 200;
        const minimapX = canvas.width - minimapSize - 20;
        const minimapY = canvas.height - minimapSize - 20;
        const minimapScale = minimapSize / Math.max(width * TILE_SIZE, height * TILE_SIZE);

        // Minimap background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);

        // Minimap tiles (simplified)
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const isFloor = tiles[y] && tiles[y][x] === 0;
                if (isFloor) {
                    ctx.fillStyle = '#475569';
                    ctx.fillRect(
                        minimapX + x * TILE_SIZE * minimapScale,
                        minimapY + y * TILE_SIZE * minimapScale,
                        TILE_SIZE * minimapScale,
                        TILE_SIZE * minimapScale
                    );
                }
            }
        }

        // Minimap rooms
        rooms.forEach(room => {
            if (room.x === undefined || room.y === undefined) return;
            ctx.fillStyle = room.color || '#38bdf8';
            ctx.beginPath();
            ctx.arc(
                minimapX + room.x * minimapScale,
                minimapY + room.y * minimapScale,
                3,
                0, Math.PI * 2
            );
            ctx.fill();
        });

        // Minimap player
        ctx.fillStyle = '#38bdf8';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#38bdf8';
        ctx.beginPath();
        ctx.arc(
            minimapX + player.x * minimapScale,
            minimapY + player.y * minimapScale,
            4,
            0, Math.PI * 2
        );
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = TOWER_COLORS.SCANLINE;
        for (let i = 0; i < canvas.height; i += 4) {
            ctx.fillRect(0, i, canvas.width, 1);
        }

        requestAnimationFrame(gameLoop);
    }, [activeRoom]);

    useEffect(() => {
        // Only start game loop after initialization is complete
        if (isInitializing) return;

        console.log("🎮 Starting game loop...");
        const frameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(frameId);
    }, [gameLoop, isInitializing]);

    if (isInitializing) return <div className="loading-screen">Iniciando exploração...</div>;
    if (!floorId) return <div>Erro: Floor ID missing</div>;

    return (
        <div className="tower-exploration-container">
            <style>{`
                .tower-exploration-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; background-color: #020617; color: #f1f5f9; font-family: monospace; z-index: 100; }
                .loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #020617; color: #38bdf8; font-size: 1.5rem; }
                .ui-layer { position: absolute; top: 20px; left: 20px; pointer-events: none; }
                .back-btn { pointer-events: auto; background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; color: #94a3b8; padding: 8px 16px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
                .back-btn:hover { color: #fff; background: rgba(30, 41, 59, 0.8); }
                .instructions-card { background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; padding: 20px; border-radius: 12px; backdrop-filter: blur(8px); max-width: 300px; pointer-events: auto; }
                .instructions-card h3 { color: #38bdf8; margin: 0 0 10px 0; }
                .key-hint { display: flex; gap: 10px; margin-bottom: 5px; font-size: 14px; color: #cbd5e1; }
                .key { background: #334155; padding: 2px 8px; border-radius: 4px; font-weight: bold; color: #fff; font-size: 12px; }
                canvas { display: block; width: 100%; height: 100%; }
             `}</style>
            <canvas ref={canvasRef} />
            <div className="ui-layer">
                <button className="back-btn" onClick={() => navigate('/player/character')}>← Voltar</button>
                {showInstructions && (
                    <div className="instructions-card">
                        <h3>Exploração da Torre</h3>
                        <div className="key-hint"><span className="key">WASD</span> Mover</div>
                        <div className="key-hint"><span className="key">E</span> Entrar na Sala</div>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '10px' }}>Explore o andar e encontre as salas de aula. Cada ícone representa uma disciplina diferente.</p>
                        <button className="back-btn" style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }} onClick={() => setShowInstructions(false)}>Entendi</button>
                    </div>
                )}
            </div>
        </div>
    );
};
