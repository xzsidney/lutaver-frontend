import React, { useEffect, useRef, useState } from 'react';
import './BattleGame.css';

// Constants
const GRID_WIDTH = 8;
const GRID_HEIGHT = 6;
const TILE_SIZE = 64;

// Types
type Team = 'player' | 'enemy';
type Discipline = 'MATH' | 'SCIENCE' | 'PORTUGUESE' | 'HISTORY';

interface Position {
    x: number;
    y: number;
}

interface BattleCharacter {
    id: string;
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    moveRange: number;
    attackRange: number;
    discipline: Discipline;
    position: Position;
    team: Team;
    hasMoved: boolean;
    hasAttacked: boolean;
}

export const BattleGame: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [turn, setTurn] = useState(1);
    const [phase, setPhase] = useState<'player' | 'enemy'>('player');
    const [selectedChar, setSelectedChar] = useState<BattleCharacter | null>(null);
    const [characters, setCharacters] = useState<BattleCharacter[]>([]);
    const [hoveredTile, setHoveredTile] = useState<Position | null>(null);

    // Initialize battle
    useEffect(() => {
        const playerChar: BattleCharacter = {
            id: 'player-1',
            name: 'Estudante',
            level: 5,
            hp: 100,
            maxHp: 100,
            attack: 20,
            defense: 10,
            speed: 12,
            moveRange: 3,
            attackRange: 1,
            discipline: 'MATH',
            position: { x: 1, y: 3 },
            team: 'player',
            hasMoved: false,
            hasAttacked: false,
        };

        const enemy1: BattleCharacter = {
            id: 'enemy-1',
            name: 'Bully',
            level: 4,
            hp: 80,
            maxHp: 80,
            attack: 15,
            defense: 8,
            speed: 10,
            moveRange: 2,
            attackRange: 1,
            discipline: 'SCIENCE',
            position: { x: 6, y: 2 },
            team: 'enemy',
            hasMoved: false,
            hasAttacked: false,
        };

        const enemy2: BattleCharacter = {
            id: 'enemy-2',
            name: 'Bully',
            level: 4,
            hp: 80,
            maxHp: 80,
            attack: 15,
            defense: 8,
            speed: 10,
            moveRange: 2,
            attackRange: 1,
            discipline: 'PORTUGUESE',
            position: { x: 6, y: 4 },
            team: 'enemy',
            hasMoved: false,
            hasAttacked: false,
        };

        setCharacters([playerChar, enemy1, enemy2]);
    }, []);

    // Render grid and characters
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const tileX = x * TILE_SIZE;
                const tileY = y * TILE_SIZE;

                // Checkerboard pattern
                const isLight = (x + y) % 2 === 0;
                ctx.fillStyle = isLight ? '#2a3f5f' : '#1e2d42';
                ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

                // Grid lines
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(tileX, tileY, TILE_SIZE, TILE_SIZE);

                // Highlight hovered tile
                if (hoveredTile && hoveredTile.x === x && hoveredTile.y === y) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                }
            }
        }

        // Draw movement range if character selected
        if (selectedChar) {
            const range = selectedChar.moveRange;
            for (let dy = -range; dy <= range; dy++) {
                for (let dx = -range; dx <= range; dx++) {
                    const dist = Math.abs(dx) + Math.abs(dy);
                    if (dist <= range && dist > 0) {
                        const tx = selectedChar.position.x + dx;
                        const ty = selectedChar.position.y + dy;
                        if (tx >= 0 && tx < GRID_WIDTH && ty >= 0 && ty < GRID_HEIGHT) {
                            // Check if tile is occupied
                            const occupied = characters.some(c => c.position.x === tx && c.position.y === ty && c.id !== selectedChar.id);
                            if (!occupied) {
                                ctx.fillStyle = 'rgba(52, 211, 153, 0.3)';
                                ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                            }
                        }
                    }
                }
            }
        }

        // Draw characters
        characters.forEach((char) => {
            const x = char.position.x * TILE_SIZE + TILE_SIZE / 2;
            const y = char.position.y * TILE_SIZE + TILE_SIZE / 2;

            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x, y + 25, 18, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Character circle
            const color = char.team === 'player' ? '#34d399' : '#ef4444';
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.fill();

            // Selected outline
            if (selectedChar?.id === char.id) {
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 4;
                ctx.stroke();
            } else {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // HP bar
            const hpPercent = char.hp / char.maxHp;
            const barWidth = 40;
            const barHeight = 6;
            const barX = x - barWidth / 2;
            const barY = y - 35;

            ctx.fillStyle = '#1e293b';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const hpColor = hpPercent > 0.5 ? '#34d399' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
            ctx.fillStyle = hpColor;
            ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);

            // Name
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(char.name, x, y + 28);
        });
    }, [characters, selectedChar, hoveredTile]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
        const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

        // Check if clicked on character
        const clickedChar = characters.find(c => c.position.x === x && c.position.y === y);

        if (clickedChar) {
            if (clickedChar.team === 'player' && phase === 'player') {
                setSelectedChar(clickedChar);
            }
        } else if (selectedChar && phase === 'player' && !selectedChar.hasMoved) {
            // Try to move
            const dx = Math.abs(selectedChar.position.x - x);
            const dy = Math.abs(selectedChar.position.y - y);
            const dist = dx + dy;

            if (dist <= selectedChar.moveRange) {
                // Check if tile is free
                const occupied = characters.some(c => c.position.x === x && c.position.y === y);
                if (!occupied) {
                    setCharacters(prev => prev.map(c =>
                        c.id === selectedChar.id
                            ? { ...c, position: { x, y }, hasMoved: true }
                            : c
                    ));
                    setSelectedChar(prev => prev ? { ...prev, position: { x, y }, hasMoved: true } : null);
                }
            }
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
        const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            setHoveredTile({ x, y });
        } else {
            setHoveredTile(null);
        }
    };

    const handleEndTurn = () => {
        if (phase === 'player') {
            // Reset player actions
            setCharacters(prev => prev.map(c =>
                c.team === 'player' ? { ...c, hasMoved: false, hasAttacked: false } : c
            ));
            setSelectedChar(null);
            setPhase('enemy');

            // Simple enemy AI - will be enhanced later
            setTimeout(() => {
                setPhase('player');
                setTurn(prev => prev + 1);
            }, 1000);
        }
    };

    const playerChars = characters.filter(c => c.team === 'player');
    const enemyChars = characters.filter(c => c.team === 'enemy');

    return (
        <div className="battle-game">
            {/* Header */}
            <div className="battle-header">
                <div className="battle-info">
                    <h2>⚔️ Batalha Tática</h2>
                    <div className="turn-info">
                        <span>Turno: {turn}</span>
                        <span className={`phase-indicator ${phase}`}>
                            {phase === 'player' ? '🟢 Seu Turno' : '🔴 Turno Inimigo'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Battle Grid */}
            <div className="battle-canvas-container">
                <canvas
                    ref={canvasRef}
                    width={GRID_WIDTH * TILE_SIZE}
                    height={GRID_HEIGHT * TILE_SIZE}
                    className="battle-canvas"
                    onClick={handleCanvasClick}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={() => setHoveredTile(null)}
                />
            </div>

            {/* Action Bar */}
            {phase === 'player' && (
                <div className="battle-actions">
                    {selectedChar && (
                        <div className="character-stats">
                            <h3>{selectedChar.name}</h3>
                            <div className="stat-line">
                                <span>HP: {selectedChar.hp}/{selectedChar.maxHp}</span>
                                <span>ATK: {selectedChar.attack}</span>
                                <span>DEF: {selectedChar.defense}</span>
                            </div>
                        </div>
                    )}
                    <button className="action-btn" onClick={handleEndTurn}>
                        ⏭️ Fim do Turno
                    </button>
                </div>
            )}

            {/* Character List */}
            <div className="battle-sidebar">
                <div className="team-section">
                    <h4>Aliados</h4>
                    {playerChars.map(char => (
                        <div key={char.id} className={`char-card ${selectedChar?.id === char.id ? 'selected' : ''}`}>
                            <span>{char.name}</span>
                            <span className="hp-text">{char.hp}/{char.maxHp}</span>
                        </div>
                    ))}
                </div>
                <div className="team-section">
                    <h4>Inimigos</h4>
                    {enemyChars.map(char => (
                        <div key={char.id} className="char-card enemy">
                            <span>{char.name}</span>
                            <span className="hp-text">{char.hp}/{char.maxHp}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
