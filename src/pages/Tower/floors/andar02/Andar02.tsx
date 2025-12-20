import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_FLOOR_ROOMS } from '../../../../graphql/tower.queries';
import { ANDAR02_LAYOUT, ANDAR02_WALKABLES } from './andar02Layout';
import { getRoomInsights } from '../../../../services/geminiService';
import './Andar02.css';

interface RoomData {
    id: string;
    name: string;
    description: string;
    mapLayout: string;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
}

interface Player {
    x: number;
    y: number;
    w: number;
    h: number;
    speed: number;
    dirX: number;
    dirY: number;
}

export const Andar02: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const { floorId } = useParams<{ floorId: string }>();

    // Buscar dados das salas do banco
    const { data: roomsData, loading: roomsLoading, error: roomsError } = useQuery(GET_FLOOR_ROOMS, {
        variables: { floorId },
        skip: !floorId,
    });

    if (roomsError) {
        console.error('❌ Erro ao carregar salas:', roomsError);
    }

    // Combinar layout fixo com dados dinâmicos
    const [rooms, setRooms] = useState<RoomData[]>([]);

    // Salvar floorId no localStorage para uso na página de sala
    useEffect(() => {
        if (floorId) {
            localStorage.setItem('currentFloorId', floorId);
        }
    }, [floorId]);

    useEffect(() => {
        if (roomsData?.floorRooms) {
            const combinedRooms = ANDAR02_LAYOUT.roomLayouts.map((layout) => {
                const roomData = roomsData.floorRooms.find((r: any) => r.id === layout.roomId);
                const mapLayout = roomData?.mapLayout ? JSON.parse(roomData.mapLayout) : {};

                return {
                    id: layout.roomId,
                    name: roomData?.name || 'SALA',
                    description: roomData?.description || '',
                    mapLayout: roomData?.mapLayout || '{}',
                    x: layout.x,
                    y: layout.y,
                    w: layout.w,
                    h: layout.h,
                    color: mapLayout.color || layout.color,
                };
            });
            setRooms(combinedRooms);
        }
    }, [roomsData]);

    // Game State
    const playerRef = useRef<Player>({
        x: 590,
        y: 250,
        w: 20,
        h: 20,
        speed: 4.5,
        dirX: 0,
        dirY: 0,
    });
    const cameraRef = useRef({ x: 590, y: 250 });
    const keys = useRef<{ [key: string]: boolean }>({});

    const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
    const [aiState, setAiState] = useState({
        loading: false,
        response: 'Use WASD ou as setas para explorar o campus.',
    });

    const ZOOM_LEVEL = 1.4;
    const LERP_FACTOR = 0.08;
    const LEAD_DISTANCE = 60;

    const isPointWalkable = useCallback((x: number, y: number) => {
        return ANDAR02_WALKABLES.some(
            (area) =>
                x >= area.x &&
                x <= area.x + area.w &&
                y >= area.y &&
                y <= area.y + area.h
        );
    }, []);

    const canMoveTo = useCallback(
        (px: number, py: number, w: number, h: number) => {
            const m = 1;
            const points = [
                { x: px + m, y: py + m },
                { x: px + w - m, y: py + m },
                { x: px + m, y: py + h - m },
                { x: px + w - m, y: py + h - m },
                { x: px + w / 2, y: py + m },
                { x: px + w / 2, y: py + h - m },
                { x: px + m, y: py + h / 2 },
                { x: px + w - m, y: py + h / 2 },
                { x: px + w / 2, y: py + h / 2 },
            ];
            return points.every((p) => isPointWalkable(p.x, p.y));
        },
        [isPointWalkable]
    );

    const getRoomAt = useCallback(
        (px: number, py: number, w: number, h: number): RoomData | null => {
            return (
                rooms.find(
                    (room) =>
                        px >= room.x &&
                        py >= room.y &&
                        px + w <= room.x + room.w &&
                        py + h <= room.y + room.h
                ) || null
            );
        },
        [rooms]
    );

    // Keyboard handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key.toLowerCase()] = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keys.current[e.key.toLowerCase()] = false;
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // AI insights when entering room
    useEffect(() => {
        if (!currentRoom) {
            setAiState((prev) => ({
                ...prev,
                response: 'Explorando os corredores inteligentes...',
            }));
            return;
        }
        let isMounted = true;
        const debounceTimeout = setTimeout(async () => {
            setAiState((prev) => ({ ...prev, loading: true }));
            const info = await getRoomInsights(currentRoom.name);
            if (isMounted) setAiState({ loading: false, response: info });
        }, 800);
        return () => {
            isMounted = false;
            clearTimeout(debounceTimeout);
        };
    }, [currentRoom?.id]);

    // Game loop
    useEffect(() => {
        if (rooms.length === 0) return;

        let animationFrameId: number;

        const gameLoop = () => {
            const p = playerRef.current;
            const cam = cameraRef.current;
            let nx = p.x;
            let ny = p.y;
            let dx = 0;
            let dy = 0;

            if (keys.current['w'] || keys.current['arrowup']) {
                ny -= p.speed;
                dy = -1;
            }
            if (keys.current['s'] || keys.current['arrowdown']) {
                ny += p.speed;
                dy = 1;
            }
            if (keys.current['a'] || keys.current['arrowleft']) {
                nx -= p.speed;
                dx = -1;
            }
            if (keys.current['d'] || keys.current['arrowright']) {
                nx += p.speed;
                dx = 1;
            }

            p.dirX = dx;
            p.dirY = dy;
            if (canMoveTo(nx, p.y, p.w, p.h)) p.x = nx;
            if (canMoveTo(p.x, ny, p.w, p.h)) p.y = ny;

            const room = getRoomAt(p.x, p.y, p.w, p.h);
            setCurrentRoom((prev) => (prev?.id === room?.id ? prev : room));

            const viewW = ANDAR02_LAYOUT.canvasWidth / ZOOM_LEVEL;
            const viewH = ANDAR02_LAYOUT.canvasHeight / ZOOM_LEVEL;
            const targetCamX = p.x + p.w / 2 - viewW / 2 + p.dirX * LEAD_DISTANCE;
            const targetCamY = p.y + p.h / 2 - viewH / 2 + p.dirY * LEAD_DISTANCE;

            cam.x += (targetCamX - cam.x) * LERP_FACTOR;
            cam.y += (targetCamY - cam.y) * LERP_FACTOR;
            cam.x = Math.max(0, Math.min(cam.x, ANDAR02_LAYOUT.canvasWidth - viewW));
            cam.y = Math.max(0, Math.min(cam.y, ANDAR02_LAYOUT.canvasHeight - viewH));

            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.fillStyle = '#020617';
                    ctx.fillRect(0, 0, ANDAR02_LAYOUT.canvasWidth, ANDAR02_LAYOUT.canvasHeight);

                    ctx.scale(ZOOM_LEVEL, ZOOM_LEVEL);
                    ctx.translate(-cam.x, -cam.y);

                    // Draw corridors
                    ANDAR02_LAYOUT.corridors.forEach((c) => {
                        ctx.fillStyle = '#0f172a';
                        ctx.fillRect(c.x, c.y, c.w, c.h);
                        ctx.strokeStyle = '#1e293b';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(c.x, c.y, c.w, c.h);
                    });

                    // Draw doors
                    ANDAR02_LAYOUT.doors.forEach((d) => {
                        ctx.fillStyle = '#0f172a';
                        ctx.fillRect(d.x, d.y, d.w, d.h);
                        ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(d.x, d.y, d.w, d.h);
                    });

                    // Draw rooms
                    rooms.forEach((r) => {
                        const isActive = currentRoom?.id === r.id;

                        ctx.fillStyle = '#0b1222';
                        ctx.fillRect(r.x, r.y, r.w, r.h);
                        ctx.strokeStyle = '#020617';
                        ctx.lineWidth = 6;
                        ctx.strokeRect(r.x, r.y, r.w, r.h);

                        if (isActive) {
                            ctx.fillStyle = 'rgba(23, 37, 84, 0.6)';
                            ctx.fillRect(r.x, r.y, r.w, r.h);
                        }

                        ctx.shadowBlur = isActive ? 15 : 0;
                        ctx.shadowColor = isActive ? '#3b82f6' : r.color;
                        ctx.strokeStyle = isActive ? '#3b82f6' : r.color + '33';
                        ctx.lineWidth = isActive ? 3 : 1;
                        ctx.strokeRect(r.x, r.y, r.w, r.h);
                        ctx.shadowBlur = 0;

                        ctx.fillStyle = isActive ? '#fff' : r.color + 'aa';
                        ctx.font = isActive
                            ? 'bold 10px "Inter", sans-serif'
                            : '600 8px "Inter", sans-serif';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(r.name, r.x + r.w / 2, r.y + r.h / 2);
                    });

                    // Draw player
                    const pPos = { x: p.x + p.w / 2, y: p.y + p.h / 2 };
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#22c55e';
                    ctx.fillStyle = '#22c55e';
                    ctx.beginPath();
                    ctx.roundRect(p.x, p.y, p.w, p.h, 4);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#052e16';
                    ctx.fillRect(pPos.x + p.dirX * 6 - 2, pPos.y + p.dirY * 6 - 2, 4, 4);
                }
            }
            animationFrameId = requestAnimationFrame(gameLoop);
        };

        animationFrameId = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [canMoveTo, getRoomAt, currentRoom, rooms]);

    if (roomsLoading) {
        return <div className="andar02-container">Carregando andar...</div>;
    }

    const currentRoomData = currentRoom ? JSON.parse(currentRoom.mapLayout || '{}') : null;

    return (
        <div className="andar02-container">
            <div className="andar02-sidebar">
                <header>
                    <h1 className="andar02-title">ANDAR 2</h1>
                    <p className="andar02-subtitle">Fundamental I - 2º Ano</p>
                </header>

                <div className="andar02-card">
                    <h2 className="andar02-card-title">Mapeamento Local</h2>
                    <div className="andar02-status">
                        <div className={`andar02-dot ${currentRoom ? 'active' : 'inactive'}`} />
                        <span className={`andar02-room-name ${currentRoom ? 'active' : 'inactive'}`}>
                            {currentRoom ? currentRoom.name : 'CORREDORES'}
                        </span>
                    </div>
                </div>

                {currentRoom && currentRoomData && (
                    <div className="andar02-card">
                        <img
                            src={currentRoomData.image}
                            alt={currentRoom.name}
                            className="andar02-room-image"
                        />
                        <p className="andar02-room-info">{currentRoomData.info}</p>
                    </div>
                )}

                {currentRoom && currentRoomData && currentRoomData.actions && (
                    <div className="andar02-card">
                        <h2 className="andar02-card-title">Ações Inteligentes</h2>
                        <div className="andar02-actions-grid">
                            {/* Primeira ação: Acessar Sala */}
                            <button
                                className="andar02-action-btn"
                                onClick={() => {
                                    navigate(`/room/${currentRoom.id}`);
                                }}
                            >
                                <span className="andar02-action-icon">🚪</span>
                                <div className="andar02-action-content">
                                    <span className="andar02-action-label">Acessar Sala</span>
                                    <span className="andar02-action-command">Entrar no ambiente</span>
                                </div>
                            </button>

                            {/* Ações dinâmicas do banco de dados */}
                            {currentRoomData.actions.map((action: any, index: number) => (
                                <button
                                    key={index}
                                    className="andar02-action-btn"
                                    onClick={() => {
                                        console.log('Ação:', action.label, action.command);
                                        // TODO: Implementar ações específicas
                                    }}
                                >
                                    <span className="andar02-action-icon">{action.icon}</span>
                                    <div className="andar02-action-content">
                                        <span className="andar02-action-label">{action.label}</span>
                                        <span className="andar02-action-command">{action.command}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="andar02-card">
                    <h2 className="andar02-card-title">Relatório de IA</h2>
                    <p className="andar02-text">"{aiState.response}"</p>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={() => navigate('/player/character')} className="andar02-btn">
                        ← Voltar
                    </button>
                </div>
            </div>

            <div className="andar02-canvas-container">
                <canvas
                    ref={canvasRef}
                    width={ANDAR02_LAYOUT.canvasWidth}
                    height={ANDAR02_LAYOUT.canvasHeight}
                    className="andar02-canvas"
                />
            </div>
        </div>
    );
};
