import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import './TowerExplorationPage.css';

const GET_FLOOR_ROOMS = gql`
  query GetFloorRooms($floorId: ID!) {
    floorRooms(floorId: $floorId) {
      id
      type
      name
      description
    }
  }
`;

interface Room {
    id: string;
    type: string;
    name: string;
    description: string;
}

const ROOM_ICONS: Record<string, string> = {
    CLASSROOM: '🎓',
    LIBRARY: '📚',
    CAFETERIA: '🍔',
    INFIRMARY: '❤️',
    COURTYARD: '⚽',
    TEACHER_ROOM: '👨‍🏫',
    OFFICE: '📋'
};

export const TowerExplorationPage: React.FC = () => {
    const { floorId } = useParams<{ floorId: string }>();
    const navigate = useNavigate();

    const [showInstructions, setShowInstructions] = useState(false);
    const [playerPos, setPlayerPos] = useState(0.22); // 0..1 position in corridor
    const [activeRoomIndex, setActiveRoomIndex] = useState(-1);
    const [keys, setKeys] = useState(new Set<string>());

    const corridorRef = useRef<HTMLDivElement>(null);
    const parallaxARef = useRef<HTMLDivElement>(null);
    const parallaxBRef = useRef<HTMLDivElement>(null);
    const animFrameRef = useRef<number>();

    const { data: roomsData } = useQuery(GET_FLOOR_ROOMS, {
        variables: { floorId },
        skip: !floorId,
    });

    const rooms = roomsData?.floorRooms || [];

    // Keyboard handling
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setKeys(prev => new Set(prev).add(e.key.toLowerCase()));

            if (e.key.toLowerCase() === 'e' && activeRoomIndex >= 0) {
                const room = rooms[activeRoomIndex];

                // Sala de Matemática vai direto para o jogo
                if (room.name.toLowerCase().includes('matemática')) {
                    navigate('/player/math-challenge');
                } else {
                    navigate(`/player/room/${room.id}`);
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            setKeys(prev => {
                const newSet = new Set(prev);
                newSet.delete(e.key.toLowerCase());
                return newSet;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [activeRoomIndex, rooms, navigate]);

    // Animation loop
    useEffect(() => {
        let last = performance.now();

        const loop = (now: number) => {
            const dt = Math.min(0.033, (now - last) / 1000);
            last = now;

            // Movement
            let dir = 0;
            if (keys.has('a') || keys.has('arrowleft')) dir -= 1;
            if (keys.has('d') || keys.has('arrowright')) dir += 1;

            const speed = 0.55;
            setPlayerPos(prev => Math.max(0, Math.min(1, prev + dir * speed * dt)));

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [keys]);

    // Update player position and parallax
    useEffect(() => {
        if (!corridorRef.current) return;

        const rect = corridorRef.current.getBoundingClientRect();
        const pad = 30;
        const x = pad + playerPos * (rect.width - pad * 2);

        // Update parallax
        if (parallaxARef.current) {
            const ax = (playerPos - 0.5) * 18;
            parallaxARef.current.style.transform = `translate3d(${ax}px, 0, 0)`;
        }
        if (parallaxBRef.current) {
            const bx = (playerPos - 0.5) * 28;
            parallaxBRef.current.style.transform = `translate3d(${bx}px, 0, 0)`;
        }

        // Update active room
        if (rooms.length > 0) {
            let nearest = -1;
            let nearestDist = 999;

            for (let i = 0; i < rooms.length; i++) {
                const center = (i + 0.5) / rooms.length;
                const d = Math.abs(playerPos - center);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearest = i;
                }
            }

            setActiveRoomIndex(nearestDist <= 0.07 ? nearest : -1);
        }
    }, [playerPos, rooms.length]);

    const handleRoomClick = (index: number) => {
        setPlayerPos((index + 0.5) / rooms.length);
    };

    const handleRoomDoubleClick = (index: number) => {
        const room = rooms[index];

        // Sala de Matemática vai direto para o jogo
        if (room.name.toLowerCase().includes('matemática')) {
            navigate('/player/math-challenge');
        } else {
            navigate(`/player/room/${room.id}`);
        }
    };

    const getPlayerLeft = () => {
        if (!corridorRef.current) return '22%';
        const rect = corridorRef.current.getBoundingClientRect();
        const pad = 30;
        const x = pad + playerPos * (rect.width - pad * 2);
        return `${x}px`;
    };

    return (
        <div className="tower-exploration-v2">
            {/* Top Bar */}
            <header className="topBar">
                <div className="topLeft">
                    <div className="titlePill">Corredor - 1º Ano</div>
                    <button className="btn" onClick={() => setShowInstructions(!showInstructions)}>
                        ? Instruções
                    </button>
                    <button className="btn" onClick={() => navigate('/player/character')}>
                        ← Voltar
                    </button>
                </div>
                <div className="hint">
                    <span>Movimento:</span>
                    <kbd>A</kbd><kbd>D</kbd> ou <kbd>←</kbd><kbd>→</kbd>
                    <span>Interagir:</span>
                    <kbd>E</kbd>
                </div>
            </header>

            {/* Main Scene */}
            <main className="mapScene">
                <div className="parallaxA" ref={parallaxARef}></div>
                <div className="parallaxB" ref={parallaxBRef}></div>

                {/* Corridor */}
                <section className="corridorWrap">
                    <div className="corridorGlow"></div>
                    <div className="corridor" ref={corridorRef}>
                        <div className="playerDot" style={{ left: getPlayerLeft() }}></div>
                    </div>
                </section>

                {/* Rooms Grid */}
                <section className="roomsGrid">
                    {rooms.map((room, index) => (
                        <article
                            key={room.id}
                            className={`roomDoor ${activeRoomIndex === index ? 'active' : ''}`}
                            onClick={() => handleRoomClick(index)}
                            onDoubleClick={() => handleRoomDoubleClick(index)}
                        >
                            <div className="doorTab"></div>
                            <div className="badge">Sala</div>
                            <div className="icon">{ROOM_ICONS[room.type] || '🚪'}</div>
                            <div className="title">{room.name}</div>
                            <div className="subtitle">{room.description}</div>
                        </article>
                    ))}
                </section>

                {/* Interact Tip */}
                {activeRoomIndex >= 0 && (
                    <div className="interactTip show">
                        <span>
                            Entrar na <span className="roomName">{rooms[activeRoomIndex].name}</span>
                        </span>
                        <kbd>E</kbd>
                    </div>
                )}
            </main>

            {/* Instructions Modal */}
            {showInstructions && (
                <div className="instructions-overlay" onClick={() => setShowInstructions(false)}>
                    <div className="instructions-panel" onClick={(e) => e.stopPropagation()}>
                        <h2>📖 Instruções do Corredor</h2>
                        <div className="instructions-content">
                            <div className="instruction-item">
                                <strong>🎮 Movimentação:</strong>
                                <p>Use <kbd>A</kbd> e <kbd>D</kbd> ou <kbd>←</kbd> <kbd>→</kbd> para andar pelo corredor.</p>
                            </div>
                            <div className="instruction-item">
                                <strong>🚪 Entrar nas Salas:</strong>
                                <p>Aproxime-se de uma sala e pressione <kbd>E</kbd> para entrar, ou clique duas vezes na sala.</p>
                            </div>
                            <div className="instruction-item">
                                <strong>💡 Dica:</strong>
                                <p>Clique uma vez em uma sala para alinhar o personagem rapidamente.</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setShowInstructions(false)}>
                            Fechar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
