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

const GET_PLAYER_DATA = gql`
  query GetPlayerData {
    meCharacter {
      id
      name
    }
  }
`;

interface Door {
    id: string;
    position: 'north' | 'south' | 'east' | 'west';
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Room {
    id: string;
    type: string;
    name: string;
    description: string;
}

export const TowerExplorationPage: React.FC = () => {
    const { floorId } = useParams<{ floorId: string }>();
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [playerPos, setPlayerPos] = useState({ x: 400, y: 300 });
    const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false });
    const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
    const [doorRooms, setDoorRooms] = useState<Record<string, Room[]>>({
        north: [],
        south: [],
        east: [],
        west: [],
    });

    const { data: characterData } = useQuery(GET_PLAYER_DATA);
    const { data: roomsData } = useQuery(GET_FLOOR_ROOMS, {
        variables: { floorId },
        skip: !floorId,
    });

    // Distribute rooms across 4 doors
    useEffect(() => {
        if (roomsData?.floorRooms) {
            const rooms = roomsData.floorRooms;
            const distributed: Record<string, Room[]> = {
                north: [],
                south: [],
                east: [],
                west: [],
            };

            rooms.forEach((room: Room, index: number) => {
                const doorIndex = index % 4;
                const doors = ['north', 'east', 'south', 'west'];
                distributed[doors[doorIndex]].push(room);
            });

            setDoorRooms(distributed);
        }
    }, [roomsData]);

    // Doors at each wall
    const doors: Door[] = [
        { id: 'north', position: 'north', x: 350, y: 50, width: 100, height: 20 },
        { id: 'south', position: 'south', x: 350, y: 550, width: 100, height: 20 },
        { id: 'east', position: 'east', x: 730, y: 260, width: 20, height: 80 },
        { id: 'west', position: 'west', x: 50, y: 260, width: 20, height: 80 },
    ];

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                setKeys((prev) => ({ ...prev, [key]: true }));
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                setKeys((prev) => ({ ...prev, [key]: false }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Movement loop
    useEffect(() => {
        const speed = 3;
        const interval = setInterval(() => {
            setPlayerPos((prev) => {
                let newX = prev.x;
                let newY = prev.y;

                if (keys.w) newY -= speed;
                if (keys.s) newY += speed;
                if (keys.a) newX -= speed;
                if (keys.d) newX += speed;

                // Keep player in bounds
                newX = Math.max(80, Math.min(720, newX));
                newY = Math.max(80, Math.min(520, newY));

                return { x: newX, y: newY };
            });
        }, 16);

        return () => clearInterval(interval);
    }, [keys]);

    // Check door proximity
    useEffect(() => {
        let nearDoor: Door | null = null;

        for (const door of doors) {
            const dx = playerPos.x - (door.x + door.width / 2);
            const dy = playerPos.y - (door.y + door.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 80) {
                nearDoor = door;
                break;
            }
        }

        setSelectedDoor(nearDoor);
    }, [playerPos]);

    // Draw canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, 800, 600);

        // Draw hallway floor
        ctx.fillStyle = '#2a2a4e';
        ctx.fillRect(100, 100, 600, 400);

        // Draw doors
        doors.forEach((door) => {
            const isSelected = selectedDoor?.id === door.id;
            ctx.fillStyle = isSelected ? '#ffd700' : '#4a4a6e';
            ctx.fillRect(door.x, door.y, door.width, door.height);

            // Door label
            ctx.fillStyle = 'white';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            let labelY = door.y;
            if (door.position === 'north') labelY -= 10;
            if (door.position === 'south') labelY += door.height + 20;
            if (door.position === 'east') labelY += door.height / 2 + 30;
            if (door.position === 'west') labelY += door.height / 2 + 30;

            const label = door.position.toUpperCase();
            ctx.fillText(label, door.x + door.width / 2, labelY);
        });

        // Draw player
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(playerPos.x, playerPos.y, 12, 0, Math.PI * 2);
        ctx.fill();
    }, [playerPos, selectedDoor]);

    const handleRoomSelect = (roomId: string) => {
        navigate(`/player/room/${roomId}`);
    };

    return (
        <div className="tower-exploration">
            <div className="exploration-header">
                <h1>Corredor - 1º Ano</h1>
                <p>Mova-se até uma porta para ver as salas disponíveis</p>
            </div>

            <canvas ref={canvasRef} width={800} height={600} className="hallway-canvas" />

            {selectedDoor && doorRooms[selectedDoor.position].length > 0 && (
                <div className="door-menu">
                    <h3>Salas - Porta {selectedDoor.position.toUpperCase()}</h3>
                    <div className="room-list">
                        {doorRooms[selectedDoor.position].map((room) => (
                            <button
                                key={room.id}
                                className="room-button"
                                onClick={() => handleRoomSelect(room.id)}
                            >
                                <div className="room-icon">{getRoomIcon(room.type)}</div>
                                <div className="room-info">
                                    <strong>{room.name}</strong>
                                    <small>{room.description}</small>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="controls-hint">
                Use W, A, S, D para mover
            </div>
        </div>
    );
};

function getRoomIcon(type: string): string {
    const icons: Record<string, string> = {
        CLASSROOM: '🎓',
        LIBRARY: '📚',
        CAFETERIA: '🍔',
        INFIRMARY: '💊',
        COURTYARD: '🌳',
        TEACHER_ROOM: '👨‍🏫',
        OFFICE: '📋',
    };
    return icons[type] || '🚪';
}
