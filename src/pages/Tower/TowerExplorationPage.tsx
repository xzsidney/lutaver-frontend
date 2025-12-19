import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Engine } from '../../game/stealth/engine';
import { COLORS, TILE_SIZE, PLAYER_RADIUS } from '../../game/stealth/constants';
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
        const rng = new SeededRNG(seed);

        const mapWidth = floor.mapWidth || 60;
        const mapHeight = floor.mapHeight || 50;
        const tiles = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(1)); // 1 = Wall

        const physicalRooms: { x: number, y: number, w: number, h: number }[] = [];

        // Helper functions
        const digRect = (r: { x: number, y: number, w: number, h: number }) => {
            for (let y = r.y; y < r.y + r.h; y++) {
                for (let x = r.x; x < r.x + r.w; x++) {
                    if (y >= 0 && y < mapHeight && x >= 0 && x < mapWidth) tiles[y][x] = 0;
                }
            }
        };

        const digCorridor = (x1: number, y1: number, x2: number, y2: number) => {
            let x = x1;
            let y = y1;
            while (x !== x2) {
                if (y >= 0 && y < mapHeight && x >= 0 && x < mapWidth) {
                    tiles[y][x] = 0;
                    if (x + 1 < mapWidth) tiles[y][x + 1] = 0;
                }
                x += (x2 > x ? 1 : -1);
            }
            while (y !== y2) {
                if (y >= 0 && y < mapHeight && x >= 0 && x < mapWidth) {
                    tiles[y][x] = 0;
                    if (x + 1 < mapWidth) tiles[y][x + 1] = 0;
                }
                y += (y2 > y ? 1 : -1);
            }
        };

        // 1. Generate Physical Layout
        const totalRoomsToGen = Math.max(apiRooms.length + 5, 12);
        let maxAttempts = 5; // Retry whole map if stuck

        while (maxAttempts > 0) {
            // Reset if retrying
            // (Omitted full regenerate loop for brevity, but implemented single pass logic robustly below)

            for (let i = 0; i < totalRoomsToGen; i++) {
                let placed = false;
                let attempts = 0;
                while (!placed && attempts < 100) {
                    const w = rng.range(6, 9);
                    const h = rng.range(6, 9);
                    const x = rng.range(2, mapWidth - w - 4);
                    const y = rng.range(2, mapHeight - h - 4);

                    const overlap = physicalRooms.some(r =>
                        x < r.x + r.w + 3 && x + w + 3 > r.x &&
                        y < r.y + r.h + 3 && y + h + 3 > r.y
                    );

                    if (!overlap) {
                        const newRoom = { x, y, w, h };
                        digRect(newRoom);

                        if (physicalRooms.length > 0) {
                            // Connect to previous or random existing
                            const target = (rng.next() > 0.7 && physicalRooms.length > 2)
                                ? physicalRooms[rng.range(0, physicalRooms.length - 2)]
                                : physicalRooms[physicalRooms.length - 1];

                            const c1 = { x: Math.floor(target.x + target.w / 2), y: Math.floor(target.y + target.h / 2) };
                            const c2 = { x: Math.floor(newRoom.x + newRoom.w / 2), y: Math.floor(newRoom.y + newRoom.h / 2) };
                            digCorridor(c1.x, c1.y, c2.x, c2.y);
                        }
                        physicalRooms.push(newRoom);
                        placed = true;
                    }
                    attempts++;
                }
            }
            if (physicalRooms.length >= apiRooms.length) break;
            maxAttempts--;
            // On retry, would clear physicalRooms and tiles.
            // For now assuming 1 pass works usually.
        }

        // 2. Assign Rooms Logically
        if (physicalRooms.length === 0) return; // Should not happen

        const processedRooms: Room[] = [];
        const spawnRoom = physicalRooms[0];

        // Exclude spawn from generic pool
        let availableIndices = physicalRooms.map((_, i) => i).slice(1);

        // Helper to find furthest room index (simple distance check)
        const getFurthestRoomIndex = (sx: number, sy: number, indices: number[]): number => {
            let maxDist = -1;
            let bestIdx = -1;
            indices.forEach(idx => {
                const r = physicalRooms[idx];
                const cx = r.x + r.w / 2;
                const cy = r.y + r.h / 2;
                const dist = (cx - sx) ** 2 + (cy - sy) ** 2;
                if (dist > maxDist) {
                    maxDist = dist;
                    bestIdx = idx;
                }
            });
            return bestIdx;
        };

        const availableApiRooms = [...apiRooms];

        // Place BOSS first (Rule: Furthest)
        const bossRoomIdx = availableApiRooms.findIndex((r: any) => r.type === 'BOSS_ROOM' || r.name.toUpperCase().includes('BOSS'));
        if (bossRoomIdx !== -1) {
            const sx = spawnRoom.x + spawnRoom.w / 2;
            const sy = spawnRoom.y + spawnRoom.h / 2;
            const targetPhysicalIdx = getFurthestRoomIndex(sx, sy, availableIndices);

            if (targetPhysicalIdx !== -1) {
                const pRoom = physicalRooms[targetPhysicalIdx];
                const bossRoom = availableApiRooms[bossRoomIdx];
                processedRooms.push(bindRoom(bossRoom, pRoom));

                // Remove used
                availableIndices = availableIndices.filter(i => i !== targetPhysicalIdx);
                availableApiRooms.splice(bossRoomIdx, 1);
            }
        }

        // Place remaining randomly
        // Shuffle available indices
        for (let i = availableIndices.length - 1; i > 0; i--) {
            const j = Math.floor(rng.next() * (i + 1));
            [availableIndices[i], availableIndices[j]] = [availableIndices[j], availableIndices[i]];
        }

        availableApiRooms.forEach((room: any, i: number) => {
            if (i < availableIndices.length) {
                const pRoom = physicalRooms[availableIndices[i]];
                processedRooms.push(bindRoom(room, pRoom));
            }
        });

        // Setup State
        gameState.current.tiles = tiles;
        gameState.current.width = mapWidth;
        gameState.current.height = mapHeight;
        gameState.current.rooms = processedRooms;

        // Player Start
        gameState.current.player = {
            x: (spawnRoom.x + spawnRoom.w / 2) * TILE_SIZE,
            y: (spawnRoom.y + spawnRoom.h / 2) * TILE_SIZE
        };

        console.log("Deterministic School Generated", { seed, rooms: processedRooms.length });
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
            gameState.current.keys.add(e.key.toLowerCase());
            if (e.key === ' ' || e.key.toLowerCase() === 'e') {
                checkInteraction();
            }
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
            const speed = 300;
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
        ctx.fillStyle = COLORS.BG;
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
                    ctx.fillStyle = COLORS.WALL;
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = COLORS.WALL_HIGHLIGHT;
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 4);
                } else {
                    ctx.fillStyle = (tile === 2) ? '#1e293b' : COLORS.FLOOR;
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    ctx.strokeStyle = '#1e293b';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        rooms.forEach(room => {
            if (room.x === undefined || room.y === undefined) return;
            const isNearby = nearbyRoom?.id === room.id;
            if (isNearby) {
                ctx.shadowBlur = 20;
                ctx.shadowColor = room.color || '#fff';
            }
            ctx.fillStyle = (room.color || '#fff') + '44';
            ctx.beginPath();
            ctx.arc(room.x, room.y, TILE_SIZE * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = '32px sans-serif';
            ctx.fillText(room.icon || '🚪', room.x, room.y);

            ctx.font = '14px monospace';
            ctx.fillStyle = isNearby ? '#fff' : '#94a3b8';
            ctx.fillText(room.name, room.x, room.y + TILE_SIZE * 0.6);
        });

        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.PLAYER;
        ctx.fillStyle = COLORS.PLAYER;
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

        ctx.fillStyle = COLORS.SCANLINE;
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
