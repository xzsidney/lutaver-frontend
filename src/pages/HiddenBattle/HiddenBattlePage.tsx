
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameStatus, LevelConfig, MissionBriefing, RadioMessage } from '../../game/stealth/types';
import { LEVELS, TILE_SIZE, PLAYER_RADIUS, ITEM_RADIUS, COLORS } from '../../game/stealth/constants';
import { generateMissionBriefing, generateRadioMessage } from '../../game/stealth/services/geminiService';
import { Engine, Enemy } from '../../game/stealth/engine';
import RadioHUD from '../../components/StealthGame/RadioHUD';

const HiddenBattlePage: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
    const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
    const [briefing, setBriefing] = useState<MissionBriefing | null>(null);
    const [radioMsg, setRadioMsg] = useState<RadioMessage | null>(null);
    const [score, setScore] = useState(100);
    const [hasItem, setHasItem] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameState = useRef({
        player: { x: 0, y: 0 },
        enemies: [] as Enemy[],
        itemPos: { x: 0, y: 0 },
        extractPos: { x: 0, y: 0 },
        tiles: [] as number[][],
        keys: new Set<string>(),
        camera: { x: 0, y: 0 }
    });

    const triggerRadio = async (context: string, sender: string = "HQ") => {
        const text = await generateRadioMessage(context);
        setRadioMsg({ sender, text, type: 'info' });
    };

    const initLevel = async (level: LevelConfig) => {
        setStatus(GameStatus.LOADING);
        const b = await generateMissionBriefing(level.name, level.codename);
        setBriefing(b);

        // Build Map
        const tiles = Array.from({ length: level.height }, () => Array(level.width).fill(1));
        const setRect = (r: { x: number, y: number, w: number, h: number }, val: number) => {
            for (let y = r.y; y < r.y + r.h; y++)
                for (let x = r.x; x < r.x + r.w; x++)
                    if (y >= 0 && y < level.height && x >= 0 && x < level.width) tiles[y][x] = val;
        };
        level.rooms.forEach(r => setRect(r, 0));
        level.corridors.forEach(c => setRect(c, 0));

        const startRoom = level.rooms[level.startRoomIdx];
        const itemRoom = level.rooms[level.itemRoomIdx];

        gameState.current.player = {
            x: (startRoom.x + startRoom.w / 2) * TILE_SIZE,
            y: (startRoom.y + startRoom.h / 2) * TILE_SIZE
        };
        gameState.current.itemPos = {
            x: (itemRoom.x + itemRoom.w / 2) * TILE_SIZE,
            y: (itemRoom.y + itemRoom.h / 2) * TILE_SIZE
        };
        gameState.current.extractPos = { ...gameState.current.player };
        gameState.current.tiles = tiles;
        gameState.current.enemies = Array.from({ length: level.enemyCount }, (_, i) => {
            const roomIdx = Math.floor(Math.random() * level.rooms.length);
            const room = level.rooms[roomIdx];
            return new Enemy(
                (room.x + room.w / 2) * TILE_SIZE,
                (room.y + room.h / 2) * TILE_SIZE,
                level.baseEnemySpeed + Math.random() * 40,
                room
            );
        });

        setHasItem(false);
        setScore(100);
        setCurrentLevel(level);
        setStatus(GameStatus.PLAYING);
        triggerRadio(`O agente acabou de iniciar ${level.name}.`);
    };

    const handleCaught = () => {
        setScore(prev => Math.max(0, prev - 20));
        const startRoom = currentLevel!.rooms[currentLevel!.startRoomIdx];
        gameState.current.player = {
            x: (startRoom.x + startRoom.w / 2) * TILE_SIZE,
            y: (startRoom.y + startRoom.h / 2) * TILE_SIZE
        };
        triggerRadio("Agente avistado! Recuar e re-engajar!");
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            gameState.current.keys.add(e.key.toLowerCase());
            if (e.key === 'Escape') {
                if (status === GameStatus.PLAYING) setStatus(GameStatus.MENU);
                else navigate(-1);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => gameState.current.keys.delete(e.key.toLowerCase());
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [status, navigate]);

    const gameLoop = useCallback((time: number) => {
        if (status !== GameStatus.PLAYING) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !currentLevel) return;

        const dt = 0.016;

        // Update Player
        let dx = 0, dy = 0;
        const keys = gameState.current.keys;
        if (keys.has('w') || keys.has('arrowup')) dy--;
        if (keys.has('s') || keys.has('arrowdown')) dy++;
        if (keys.has('a') || keys.has('arrowleft')) dx--;
        if (keys.has('d') || keys.has('arrowright')) dx++;

        if (dx !== 0 || dy !== 0) {
            const mag = Math.hypot(dx, dy);
            const speed = 250;
            const nx = gameState.current.player.x + (dx / mag) * speed * dt;
            const ny = gameState.current.player.y + (dy / mag) * speed * dt;

            const pos = Engine.checkCircleWallCollision(nx, ny, PLAYER_RADIUS, gameState.current.tiles);
            gameState.current.player.x = pos.x;
            gameState.current.player.y = pos.y;
        }

        // Update Enemies
        gameState.current.enemies.forEach(enemy => {
            enemy.update(dt, gameState.current.tiles);
            if (enemy.canSee(gameState.current.player, gameState.current.tiles)) {
                handleCaught();
            }
        });

        // Check Goals
        const distToItem = Math.hypot(gameState.current.player.x - gameState.current.itemPos.x, gameState.current.player.y - gameState.current.itemPos.y);
        if (!hasItem && distToItem < PLAYER_RADIUS + ITEM_RADIUS + 10) {
            setHasItem(true);
            triggerRadio("Pacote assegurado. Vá para o ponto de extração agora!");
        }

        if (hasItem) {
            const distToExtract = Math.hypot(gameState.current.player.x - gameState.current.extractPos.x, gameState.current.player.y - gameState.current.extractPos.y);
            if (distToExtract < PLAYER_RADIUS + 40) {
                setStatus(GameStatus.WON);
            }
        }

        // Update Camera
        gameState.current.camera.x = gameState.current.player.x - canvas.width / 2;
        gameState.current.camera.y = gameState.current.player.y - canvas.height / 2;

        // Draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-gameState.current.camera.x, -gameState.current.camera.y);

        const { tiles } = gameState.current;
        for (let y = 0; y < tiles.length; y++) {
            for (let x = 0; x < tiles[y].length; x++) {
                const isWall = tiles[y][x] === 1;
                ctx.fillStyle = isWall ? COLORS.WALL : COLORS.FLOOR;
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                if (isWall) {
                    ctx.fillStyle = COLORS.WALL_HIGHLIGHT;
                    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, 4);
                }
            }
        }

        // Extraction Point
        ctx.fillStyle = COLORS.EXTRACTION + '33';
        ctx.beginPath();
        ctx.arc(gameState.current.extractPos.x, gameState.current.extractPos.y, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = COLORS.EXTRACTION;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Item
        if (!hasItem) {
            ctx.fillStyle = COLORS.ITEM;
            ctx.shadowBlur = 15;
            ctx.shadowColor = COLORS.ITEM;
            ctx.beginPath();
            ctx.arc(gameState.current.itemPos.x, gameState.current.itemPos.y, ITEM_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Entities
        gameState.current.enemies.forEach(e => e.draw(ctx));

        ctx.fillStyle = COLORS.PLAYER;
        ctx.shadowBlur = 15;
        ctx.shadowColor = COLORS.PLAYER;
        ctx.beginPath();
        ctx.arc(gameState.current.player.x, gameState.current.player.y, PLAYER_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (hasItem) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        ctx.restore();

        // Scanlines
        ctx.fillStyle = COLORS.SCANLINE;
        for (let i = 0; i < canvas.height; i += 4) {
            ctx.fillRect(0, i, canvas.width, 1);
        }

        requestAnimationFrame(gameLoop);
    }, [status, currentLevel, hasItem]);

    useEffect(() => {
        let frameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(frameId);
    }, [gameLoop]);

    return (
        <div className="stealth-game-container">
            <style>{`
        .stealth-game-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background-color: #020617;
            color: #f1f5f9;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            z-index: 9999;
        }
        canvas {
            display: block;
        }
        .stealth-menu-overlay {
            position: absolute;
            inset: 0;
            background-color: rgba(2, 6, 23, 0.9);
            backdrop-filter: blur(24px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 50;
            padding: 1.5rem;
        }
        .menu-title {
            text-align: center;
            margin-bottom: 3rem;
        }
        .menu-title h1 {
            font-size: 3.75rem;
            font-weight: 800;
            letter-spacing: -0.05em;
            background: linear-gradient(to right, #38bdf8, #6366f1);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 1rem;
            font-style: italic;
            text-transform: uppercase;
            margin: 0;
        }
        .menu-title p {
            color: #94a3b8;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            font-size: 0.875rem;
            margin: 0.5rem 0 0 0;
        }
        .level-grid {
            display: grid;
            grid-template-columns: repeat(1, minmax(0, 1fr));
            gap: 1.5rem;
            width: 100%;
            max-width: 56rem;
        }
        @media (min-width: 768px) {
            .level-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
        .level-card {
            position: relative;
            background-color: rgba(15, 23, 42, 0.5);
            border: 1px solid #1e293b;
            padding: 2rem;
            border-radius: 1rem;
            transition: all 0.3s;
            cursor: pointer;
            text-align: left;
            overflow: hidden;
        }
        .level-card:hover {
            transform: translateY(-0.25rem);
            box-shadow: 0 25px 50px -12px rgba(14, 165, 233, 0.1);
            border-color: rgba(14, 165, 233, 0.5);
        }
        .level-id {
            position: absolute;
            top: 0;
            right: 0;
            padding: 1rem;
            opacity: 0.1;
            font-size: 3.75rem;
            font-weight: 700;
        }
        .level-card:hover .level-id {
            opacity: 0.3;
        }
        .level-name {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
            color: #f1f5f9;
            letter-spacing: -0.025em;
        }
        .level-code {
            color: #38bdf8;
            font-size: 0.75rem;
            margin-bottom: 1rem;
        }
        .level-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.75rem;
            color: #64748b;
        }
        .meta-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        .dot {
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 9999px;
            background-color: #334155;
        }
        
        /* HUD */
        .hud {
            position: absolute;
            top: 0;
            left: 0;
            padding: 1.5rem;
            pointer-events: none;
            width: 100%;
            display: flex;
            justify-content: space-between;
            box-sizing: border-box;
        }
        .hud-panel {
            background-color: rgba(15, 23, 42, 0.8);
            border: 1px solid #1e293b;
            backdrop-filter: blur(12px);
            padding: 1rem;
            border-radius: 0.75rem;
            margin-bottom: 1rem;
            min-width: 280px;
        }
        .hud-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            border-bottom: 1px solid #1e293b;
            padding-bottom: 0.5rem;
        }
        .hud-label {
            font-size: 0.75rem;
            font-weight: 700;
            color: #38bdf8;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .rec-dot {
            font-size: 0.75rem;
            font-weight: 700;
            color: #f43f5e;
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .hud-value {
            font-size: 0.875rem;
            color: #f1f5f9;
        }
        .score-panel {
            text-align: right;
        }
        .score-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #38bdf8;
        }
        .payload-badge {
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.1em;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background-color: #1e293b;
            color: #64748b;
        }
        .payload-badge.secured {
            background-color: rgba(16, 185, 129, 0.2);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.5);
        }
        .status-dot {
            width: 0.5rem;
            height: 0.5rem;
            border-radius: 9999px;
            background-color: #475569;
        }
        .status-dot.active {
            background-color: #34d399;
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .win-screen {
            position: absolute;
            inset: 0;
            background-color: rgba(2, 44, 34, 0.9);
            backdrop-filter: blur(24px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 50;
            text-align: center;
            padding: 1.5rem;
            color: #ecfdf5;
        }
        .win-icon {
            background-color: #34d399;
            color: #022c22;
            padding: 1rem;
            border-radius: 9999px;
            margin-bottom: 1.5rem;
            box-shadow: 0 25px 50px -12px rgba(16, 185, 129, 0.5);
            width: 4rem;
            height: 4rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .win-title {
            font-size: 3.75rem;
            font-weight: 900;
            font-style: italic;
            text-transform: uppercase;
            margin-bottom: 0.5rem;
            letter-spacing: -0.05em;
            margin-top: 0;
        }
        .win-btn {
            padding: 1rem 2rem;
            background-color: #34d399;
            color: #022c22;
            font-weight: 700;
            border-radius: 0.75rem;
            border: none;
            cursor: pointer;
            transition: transform 0.2s;
            box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04);
            font-size: 1rem;
        }
        .win-btn:hover {
            transform: scale(1.05);
        }

        .controls-help {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            font-size: 0.65rem;
            color: #475569;
            display: flex;
            gap: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            pointer-events: none;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
        @keyframes ping {
            75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
            />

            {/* MENU OVERLAY */}
            {status === GameStatus.MENU && (
                <div className="stealth-menu-overlay">
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            left: '20px',
                            background: 'transparent',
                            border: '1px solid #334155',
                            color: '#94a3b8',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontFamily: 'monospace'
                        }}
                    >
                        ← SAIR
                    </button>
                    <div className="menu-title">
                        <header>
                            <h1>Lutaver</h1>
                            <p>Unidade de Infiltração Estratégica</p>
                        </header>
                    </div>

                    <div className="level-grid">
                        {LEVELS.map(level => (
                            <button
                                key={level.id}
                                onClick={() => initLevel(level)}
                                className="level-card"
                            >
                                <div className="level-id">{level.id}</div>
                                <h3 className="level-name">{level.name}</h3>
                                <p className="level-code">{level.codename}</p>
                                <div className="level-meta">
                                    <span className="meta-item">
                                        <div className="dot"></div>
                                        {level.enemyCount} Guardas
                                    </span>
                                    <span className="meta-item">
                                        <div className="dot"></div>
                                        {level.width}x{level.height} Grade
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* HUD */}
            {status === GameStatus.PLAYING && (
                <div className="hud">
                    <div className="hud-left">
                        {/* Mission Info */}
                        <div className="hud-panel">
                            <div className="hud-header">
                                <span className="hud-label">Operação Ativa: {currentLevel?.codename}</span>
                                <span className="rec-dot">REC ●</span>
                            </div>
                            <div>
                                <div className="hud-label" style={{ color: '#64748b', marginBottom: '0.25rem' }}>Objetivo</div>
                                <div className="hud-value">{hasItem ? "Prossiga para o ponto de extração" : "Localize e recupere o pacote"}</div>
                            </div>
                        </div>

                        {/* Briefing */}
                        {briefing && (
                            <div className="hud-panel" style={{ maxWidth: '24rem' }}>
                                <div className="hud-label" style={{ color: '#64748b', marginBottom: '0.25rem' }}>Relatório de Inteligência</div>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>"{briefing.intel}"</p>
                                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="hud-label" style={{ color: '#64748b' }}>Risco:</span>
                                    <span className="hud-label" style={{ color: '#fb7185' }}>{briefing.dangerLevel}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="hud-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div className="hud-panel score-panel">
                            <div className="hud-label" style={{ color: '#64748b' }}>Nível de Segurança</div>
                            <div className="score-value">{score}%</div>
                        </div>
                        <div className={`payload-badge ${hasItem ? 'secured' : ''}`}>
                            <span className={`status-dot ${hasItem ? 'active' : ''}`}></span>
                            Carga: {hasItem ? 'ASSEGURADA' : 'PENDENTE'}
                        </div>
                    </div>
                </div>
            )}

            {/* WIN / LOSS SCREENS */}
            {status === GameStatus.WON && (
                <div className="win-screen">
                    <div className="win-icon">
                        <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="win-title">Missão Cumprida</h2>
                    <p style={{ color: 'rgba(167, 243, 208, 0.6)', marginBottom: '3rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Exfiltração completa. Taxa de Eficiência: {score}%
                    </p>
                    <button
                        onClick={() => setStatus(GameStatus.MENU)}
                        className="win-btn"
                    >
                        Retornar ao Quartel General
                    </button>
                </div>
            )}

            {/* Radio Messages */}
            <RadioHUD message={radioMsg} />

            {/* Controls Help */}
            <div className="controls-help">
                <span>[WASD] MOVER</span>
                <span>[ESPAÇO] ANALISAR</span>
                <span>[ESC] SAIR</span>
            </div>
        </div>
    );
};

export default HiddenBattlePage;
