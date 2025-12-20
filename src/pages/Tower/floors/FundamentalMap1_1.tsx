import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TowerRoom, RoomAction } from '../../../game/stealth/types';
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    TOWER_ROOMS,
    TOWER_CORRIDORS,
    TOWER_DOORS,
    TOWER_WALKABLES,
    Rect,
} from '../../../game/stealth/towerMapConstants';
import { getRoomInsights } from '../../../services/geminiService';
import './FundamentalMap1_1.css';

interface FeedbackState {
    roomId: string;
    icon: string;
    startTime: number;
}

interface RoomAnimation {
    startTime: number;
    duration: number;
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

export const FundamentalMap1_1: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const [currentRoom, setCurrentRoom] = useState<TowerRoom | null>(null);
    const [aiState, setAiState] = useState({
        loading: false,
        response: 'Use WASD ou as setas para explorar o campus.',
    });
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [activeFeedback, setActiveFeedback] = useState<FeedbackState | null>(null);
    const [focusMode, setFocusMode] = useState(false);

    const roomAnimations = useRef<Map<string, RoomAnimation>>(new Map());
    const prevRoomId = useRef<string | null>(null);

    const ZOOM_LEVEL = 1.4;
    const LERP_FACTOR = 0.08;
    const LEAD_DISTANCE = 60;
    const FEEDBACK_DURATION = 1500;
    const ROTATION_DURATION = 600;

    const isPointWalkable = useCallback((x: number, y: number) => {
        return TOWER_WALKABLES.some(
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
        (px: number, py: number, w: number, h: number): TowerRoom | null => {
            return (
                TOWER_ROOMS.find(
                    (room) =>
                        px >= room.x &&
                        py >= room.y &&
                        px + w <= room.x + room.w &&
                        py + h <= room.y + room.h
                ) || null
            );
        },
        []
    );

    const handleRoomAction = async (action: RoomAction) => {
        if (!currentRoom) return;

        setActiveFeedback({
            roomId: currentRoom.id,
            icon: action.icon,
            startTime: Date.now(),
        });

        setAiState((prev) => ({ ...prev, loading: true }));
        setLastAction(action.label);

        const feedback = await getRoomInsights(
            `Ação: ${action.command} no local: ${currentRoom.name}`
        );
        setAiState({ loading: false, response: feedback });

        setTimeout(() => setLastAction(null), 2000);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keys.current[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === 'f') {
                setFocusMode((prev) => !prev);
            }
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

    useEffect(() => {
        const now = Date.now();
        if (currentRoom && currentRoom.id !== prevRoomId.current) {
            roomAnimations.current.set(currentRoom.id, {
                startTime: now,
                duration: ROTATION_DURATION,
            });
        }
        if (
            prevRoomId.current &&
            (!currentRoom || currentRoom.id !== prevRoomId.current)
        ) {
            roomAnimations.current.set(prevRoomId.current, {
                startTime: now,
                duration: ROTATION_DURATION,
            });
        }
        prevRoomId.current = currentRoom?.id || null;
    }, [currentRoom?.id]);

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

    useEffect(() => {
        let animationFrameId: number;

        const gameLoop = (time: number) => {
            const p = playerRef.current;
            const cam = cameraRef.current;
            const now = Date.now();
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

            const viewW = CANVAS_WIDTH / ZOOM_LEVEL;
            const viewH = CANVAS_HEIGHT / ZOOM_LEVEL;
            const targetCamX = p.x + p.w / 2 - viewW / 2 + p.dirX * LEAD_DISTANCE;
            const targetCamY = p.y + p.h / 2 - viewH / 2 + p.dirY * LEAD_DISTANCE;

            cam.x += (targetCamX - cam.x) * LERP_FACTOR;
            cam.y += (targetCamY - cam.y) * LERP_FACTOR;
            cam.x = Math.max(0, Math.min(cam.x, CANVAS_WIDTH - viewW));
            cam.y = Math.max(0, Math.min(cam.y, CANVAS_HEIGHT - viewH));

            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const pulse = (Math.sin(time / 450) + 1) / 2;

                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.fillStyle = '#020617';
                    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                    ctx.scale(ZOOM_LEVEL, ZOOM_LEVEL);
                    ctx.translate(-cam.x, -cam.y);

                    const drawMapElement = (
                        el: Rect,
                        type: 'corridor' | 'room' | 'door',
                        r?: TowerRoom
                    ) => {
                        if (type === 'corridor') {
                            ctx.fillStyle = '#0f172a';
                            ctx.fillRect(el.x, el.y, el.w, el.h);
                            ctx.strokeStyle = '#1e293b';
                            ctx.lineWidth = 2;
                            ctx.strokeRect(el.x, el.y, el.w, el.h);
                        } else if (type === 'door') {
                            ctx.fillStyle = '#0f172a';
                            ctx.fillRect(el.x, el.y, el.w, el.h);
                            const grad = ctx.createLinearGradient(
                                el.x,
                                el.y,
                                el.x + el.w,
                                el.y + el.h
                            );
                            grad.addColorStop(0, `rgba(34, 211, 238, ${0.05 + pulse * 0.05})`);
                            grad.addColorStop(0.5, `rgba(34, 211, 238, ${0.15 + pulse * 0.1})`);
                            grad.addColorStop(1, `rgba(34, 211, 238, ${0.05 + pulse * 0.05})`);
                            ctx.fillStyle = grad;
                            ctx.fillRect(el.x, el.y, el.w, el.h);
                            ctx.strokeStyle = `rgba(34, 211, 238, ${0.3 + pulse * 0.2})`;
                            ctx.lineWidth = 1;
                            ctx.strokeRect(el.x, el.y, el.w, el.h);
                        } else if (type === 'room' && r) {
                            const isActive = currentRoom?.id === r.id;
                            const hasFeedback = activeFeedback?.roomId === r.id;
                            const anim = roomAnimations.current.get(r.id);

                            let rotationAngle = 0;
                            let scaleEffect = 1.0;

                            if (anim) {
                                const elapsed = now - anim.startTime;
                                if (elapsed < anim.duration) {
                                    const progress = elapsed / anim.duration;
                                    rotationAngle = Math.sin(progress * Math.PI) * 0.04;
                                    scaleEffect = 1.0 + Math.sin(progress * Math.PI) * 0.02;
                                } else {
                                    roomAnimations.current.delete(r.id);
                                }
                            }

                            const elapsedFeedback = now - (activeFeedback?.startTime || 0);
                            const feedbackActive = hasFeedback && elapsedFeedback < FEEDBACK_DURATION;
                            const feedbackProgress = feedbackActive
                                ? 1 - elapsedFeedback / FEEDBACK_DURATION
                                : 0;

                            ctx.save();

                            const centerX = r.x + r.w / 2;
                            const centerY = r.y + r.h / 2;
                            ctx.translate(centerX, centerY);
                            ctx.rotate(rotationAngle);
                            ctx.scale(scaleEffect, scaleEffect);
                            ctx.translate(-centerX, -centerY);

                            ctx.fillStyle = '#0b1222';
                            ctx.fillRect(r.x, r.y, r.w, r.h);
                            ctx.strokeStyle = '#020617';
                            ctx.lineWidth = 6;
                            ctx.strokeRect(r.x, r.y, r.w, r.h);

                            if (isActive || feedbackActive) {
                                ctx.fillStyle = isActive
                                    ? 'rgba(23, 37, 84, 0.6)'
                                    : 'transparent';

                                if (feedbackActive) {
                                    ctx.fillStyle = `rgba(${parseInt(r.color.slice(1, 3), 16)}, ${parseInt(r.color.slice(3, 5), 16)}, ${parseInt(r.color.slice(5, 7), 16)}, ${feedbackProgress * 0.3})`;
                                }
                                ctx.fillRect(r.x, r.y, r.w, r.h);
                            }

                            const isAnimating = !!anim;
                            ctx.shadowBlur = feedbackActive
                                ? 20 + feedbackProgress * 30
                                : isActive
                                    ? 15
                                    : isAnimating
                                        ? 10
                                        : 0;
                            ctx.shadowColor = isActive ? '#3b82f6' : r.color;

                            ctx.strokeStyle =
                                isActive || feedbackActive || isAnimating
                                    ? isActive
                                        ? '#3b82f6'
                                        : r.color
                                    : r.color + '33';
                            ctx.lineWidth = isActive || feedbackActive ? 3 : isAnimating ? 2 : 1;
                            ctx.strokeRect(r.x, r.y, r.w, r.h);
                            ctx.shadowBlur = 0;

                            ctx.fillStyle = isActive ? '#fff' : r.color + 'aa';
                            ctx.font = isActive
                                ? 'bold 10px "Inter", sans-serif'
                                : '600 8px "Inter", sans-serif';
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(r.name, r.x + r.w / 2, r.y + r.h / 2);

                            if (feedbackActive && activeFeedback) {
                                const floatOffset = (1 - feedbackProgress) * 50;
                                ctx.globalAlpha = feedbackProgress;
                                ctx.font = '24px serif';
                                ctx.fillText(
                                    activeFeedback.icon,
                                    r.x + r.w / 2,
                                    r.y + r.h / 2 - floatOffset
                                );
                                ctx.globalAlpha = 1.0;
                            }

                            ctx.restore();
                        }
                    };

                    if (focusMode && currentRoom) {
                        ctx.save();
                        ctx.filter = 'blur(6px) brightness(0.2)';
                        TOWER_CORRIDORS.forEach((c) => drawMapElement(c, 'corridor'));
                        TOWER_DOORS.forEach((d) => drawMapElement(d, 'door'));
                        TOWER_ROOMS.forEach((r) => {
                            if (r.id !== currentRoom.id) drawMapElement(r, 'room', r);
                        });
                        ctx.restore();
                        drawMapElement(currentRoom, 'room', currentRoom);
                    } else {
                        TOWER_CORRIDORS.forEach((c) => drawMapElement(c, 'corridor'));
                        TOWER_DOORS.forEach((d) => drawMapElement(d, 'door'));
                        TOWER_ROOMS.forEach((r) => drawMapElement(r, 'room', r));
                    }

                    const pPos = { x: p.x + p.w / 2, y: p.y + p.h / 2 };
                    const playerGlow = ctx.createRadialGradient(pPos.x, pPos.y, 0, pPos.x, pPos.y, 80);
                    playerGlow.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
                    playerGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
                    ctx.fillStyle = playerGlow;
                    ctx.fillRect(p.x - 80, p.y - 80, 160, 160);
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
    }, [canMoveTo, getRoomAt, currentRoom, activeFeedback, focusMode]);

    return (
        <div className="fundamental-map-container">
            <div className="fundamental-map-sidebar">
                <header>
                    <h1 className="fundamental-map-title">SISTEMA SMART</h1>
                    <p className="fundamental-map-subtitle">Teste de Layout</p>
                </header>

                <div className="fundamental-map-card">
                    <h2 className="fundamental-map-card-title">Mapeamento Local</h2>
                    <div className="fundamental-map-status">
                        <div className={`fundamental-map-dot ${currentRoom ? 'active' : 'inactive'}`} />
                        <span className={`fundamental-map-room-name ${currentRoom ? 'active' : 'inactive'}`}>
                            {currentRoom ? currentRoom.name : 'CORREDORES'}
                        </span>
                    </div>
                </div>

                <div className="fundamental-map-card">
                    <h2 className="fundamental-map-card-title">Relatório de IA</h2>
                    <p className="fundamental-map-text">"{aiState.response}"</p>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button
                        onClick={() => navigate('/player/character')}
                        className="fundamental-map-btn"
                    >
                        ← Voltar
                    </button>
                </div>
            </div>

            <div className="fundamental-map-canvas-container">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="fundamental-map-canvas"
                />
            </div>
        </div>
    );
};
