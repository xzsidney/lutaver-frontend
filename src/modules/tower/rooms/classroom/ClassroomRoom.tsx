/**
 * ClassroomRoom Component
 * Custom horizontal layout for classroom with desks
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClassroomRoom.css';
import './ClassroomRoom-debug.css';

interface Position {
    x: number;
    y: number;
}

interface Desk {
    type: string;
    x: number;
    y: number;
    label: string;
}

interface Activity {
    id: string;
    type: string;
    name: string;
    description?: string;
    position: Position;
    requiredLevel: number;
}

interface Room {
    id: string;
    name: string;
    description?: string;
    mapWidth: number;
    mapHeight: number;
    mapLayout?: {
        objects?: Desk[];
        spawnPoint?: Position;
    };
}

interface Props {
    room: Room;
    activities: Activity[];
}

export const ClassroomRoom: React.FC<Props> = ({ room, activities }) => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const spawnPoint = room.mapLayout?.spawnPoint || { x: 1150, y: 200 };
    const [playerPos, setPlayerPos] = useState<Position>(spawnPoint);
    const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });
    const [selectedDesk, setSelectedDesk] = useState<number | null>(null);

    const desks: Desk[] = room.mapLayout?.objects?.filter(obj => obj.type === 'desk') || [];
    const door = room.mapLayout?.objects?.find(obj => obj.type === 'door');

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                setKeys(prev => ({ ...prev, [key]: true }));
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                setKeys(prev => ({ ...prev, [key]: false }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Movement
    useEffect(() => {
        const speed = 4;
        const interval = setInterval(() => {
            setPlayerPos(prev => {
                let newX = prev.x;
                let newY = prev.y;

                if (keys.w) newY -= speed;
                if (keys.s) newY += speed;
                if (keys.a) newX -= speed;
                if (keys.d) newX += speed;

                // Boundaries
                newX = Math.max(30, Math.min(room.mapWidth - 30, newX));
                newY = Math.max(30, Math.min(room.mapHeight - 30, newY));

                return { x: newX, y: newY };
            });
        }, 16);

        return () => clearInterval(interval);
    }, [keys, room.mapWidth, room.mapHeight]);

    // Check proximity to desks and door
    useEffect(() => {
        let nearDesk: number | null = null;

        desks.forEach((desk, index) => {
            const dx = playerPos.x - desk.x;
            const dy = playerPos.y - desk.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 80) {
                nearDesk = index;
            }
        });

        setSelectedDesk(nearDesk);

        // Check door proximity
        if (door) {
            const dx = playerPos.x - door.x;
            const dy = playerPos.y - door.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 60) {
                // Near door - could show prompt
            }
        }
    }, [playerPos, desks, door]);

    // Render canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear & background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, room.mapWidth, room.mapHeight);

        // Floor with tiles
        ctx.fillStyle = '#2a2a4e';
        ctx.fillRect(20, 20, room.mapWidth - 40, room.mapHeight - 40);

        // Floor tile lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 20; x < room.mapWidth - 20; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 20);
            ctx.lineTo(x, room.mapHeight - 20);
            ctx.stroke();
        }

        // Door
        if (door) {
            // Door frame
            ctx.fillStyle = '#1a5a2e';
            ctx.fillRect(door.x - 15, door.y - 25, 30, 50);

            // Door
            ctx.fillStyle = '#2a8a4e';
            ctx.fillRect(door.x - 12, door.y - 22, 24, 44);

            // Door handle
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(door.x + 8, door.y, 3, 0, Math.PI * 2);
            ctx.fill();

            // Door icon
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.fillText('🚪', door.x, door.y + 8);
        }

        // Desks with shadows and highlights
        desks.forEach((desk, i) => {
            const isSelected = selectedDesk === i;

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(desk.x - 36, desk.y - 21, 80, 60);

            // Desk body
            const gradient = ctx.createLinearGradient(desk.x - 40, desk.y - 25, desk.x - 40, desk.y + 35);
            gradient.addColorStop(0, isSelected ? '#b89968' : '#6a5a3a');
            gradient.addColorStop(1, isSelected ? '#8a6948' : '#4a3a2a');
            ctx.fillStyle = gradient;
            ctx.fillRect(desk.x - 40, desk.y - 25, 80, 60);

            // Desk edge highlight
            ctx.strokeStyle = isSelected ? '#ffd700' : 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.strokeRect(desk.x - 40, desk.y - 25, 80, 60);

            // Desk top
            ctx.fillStyle = isSelected ? '#d4a574' : '#8a6a4a';
            ctx.fillRect(desk.x - 40, desk.y - 25, 80, 10);

            // Book on desk
            ctx.fillStyle = '#4a8a6a';
            ctx.fillRect(desk.x - 25, desk.y - 10, 30, 20);

            // Desk icon
            ctx.font = '36px serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText('📚', desk.x, desk.y + 10);

            // Activity indicator glow
            const activity = activities.find(a =>
                Math.abs(a.position.x - desk.x) < 10 &&
                Math.abs(a.position.y - desk.y) < 10
            );

            if (activity) {
                const icon = getActivityIcon(activity.type);

                // Glow effect
                if (isSelected) {
                    ctx.shadowColor = '#ffd700';
                    ctx.shadowBlur = 20;
                }

                ctx.font = '28px serif';
                ctx.fillText(icon, desk.x, desk.y - 45);

                ctx.shadowBlur = 0;

                // Activity name above
                ctx.font = '12px Arial';
                ctx.fillStyle = isSelected ? '#ffd700' : 'white';
                ctx.fillText(activity.name.split(':')[0], desk.x, desk.y - 65);
            }
        });

        // Player with glow
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#00ff00';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(playerPos.x, playerPos.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Player direction indicator
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(playerPos.x, playerPos.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();

        // Selected desk highlight ring
        if (selectedDesk !== null) {
            const desk = desks[selectedDesk];
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(desk.x - 50, desk.y - 35, 100, 80);
            ctx.setLineDash([]);
        }

    }, [room, playerPos, desks, door, selectedDesk, activities]);

    const handleExitRoom = () => {
        navigate(-1);
    };

    const handleStartActivity = (activityId: string) => {
        navigate(`/player/activity/${activityId}`);
    };

    // Get activity at selected desk
    const selectedActivity = selectedDesk !== null
        ? activities.find(a => {
            const desk = desks[selectedDesk];
            return Math.abs(a.position.x - desk.x) < 10 && Math.abs(a.position.y - desk.y) < 10;
        })
        : null;

    return (
        <div className="classroom-room">
            {/* Header */}
            <div className="classroom-header">
                <button className="exit-button" onClick={handleExitRoom}>
                    ← Sair da Sala
                </button>
                <h1>{room.name}</h1>
                <div className="room-info">
                    {room.description && <p>{room.description}</p>}
                </div>
            </div>

            {/* Canvas */}
            <div className="classroom-canvas-container">
                <canvas
                    ref={canvasRef}
                    width={room.mapWidth}
                    height={room.mapHeight}
                    className="classroom-canvas"
                />

                {/* Activity Panel - Fully inline styled */}
                {selectedActivity && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.98) 0%, rgba(20, 20, 40, 0.98) 100%)',
                        border: '2px solid #ffd700',
                        borderRadius: '10px',
                        padding: '8px 15px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backdropFilter: 'blur(15px)',
                        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                        maxWidth: '320px',
                        zIndex: 9999,
                    }}>
                        <div style={{ fontSize: '22px', flexShrink: 0 }}>
                            {getActivityIcon(selectedActivity.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{
                                margin: 0,
                                color: '#ffd700',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}>
                                {selectedActivity.name}
                            </h3>
                            <span style={{
                                display: 'inline-block',
                                marginTop: '3px',
                                padding: '1px 6px',
                                background: 'rgba(102, 126, 234, 0.3)',
                                border: '1px solid rgba(102, 126, 234, 0.5)',
                                borderRadius: '6px',
                                fontSize: '9px',
                                color: '#667eea',
                            }}>
                                {getActivityLabel(selectedActivity.type)}
                            </span>
                        </div>
                        <button
                            onClick={() => handleStartActivity(selectedActivity.id)}
                            style={{
                                padding: '6px 10px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            Iniciar →
                        </button>
                    </div>
                )}
            </div>

            {/* Controls hint */}
            <div className="controls-hint">
                W, A, S, D para mover • E para interagir
            </div>
        </div>
    );
};

function getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
        MISSION: '🎯',
        QUIZ: '📝',
        BATTLE: '⚔️',
        STUDY: '📚',
        SHOP: '🛒',
        HEAL: '💊',
        EVENT: '📋',
        BOSS_FIGHT: '👨‍🏫',
    };
    return icons[type] || '❓';
}

function getActivityLabel(type: string): string {
    const labels: Record<string, string> = {
        MISSION: 'Missão',
        QUIZ: 'Quiz',
        BATTLE: 'Batalha',
        STUDY: 'Estudo',
        SHOP: 'Loja',
        HEAL: 'Cura',
        EVENT: 'Evento',
        BOSS_FIGHT: 'Exame Final',
    };
    return labels[type] || type;
}
