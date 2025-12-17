/**
 * Room Container Component
 * Generic wrapper for all room types
 */

import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useParams, useNavigate } from 'react-router-dom';
import { gql } from '@apollo/client';
import { ClassroomRoom } from './classroom/ClassroomRoom';
import './RoomContainer.css';

const ENTER_ROOM = gql`
  mutation EnterRoom($input: EnterRoomInput!) {
    enterRoom(input: $input) {
      room {
        id
        type
        name
        description
        mapWidth
        mapHeight
        mapLayout
      }
      characterPosition {
        x
        y
      }
      availableActivities {
        id
        type
        name
        position {
          x
          y
        }
        radius
        requiredLevel
      }
    }
  }
`;

const GET_PLAYER_DATA = gql`
  query GetPlayerData {
    meCharacter {
      id
      name
      level
    }
  }
`;

interface Activity {
    id: string;
    type: string;
    name: string;
    position: { x: number; y: number };
    radius: number;
    requiredLevel: number;
}

export const RoomContainer: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [playerPos, setPlayerPos] = useState({ x: 400, y: 300 });
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

    const { data: characterData } = useQuery(GET_PLAYER_DATA);
    const [enterRoom, { data: roomData, loading, error }] = useMutation(ENTER_ROOM);

    useEffect(() => {
        if (characterData?.meCharacter && roomId) {
            enterRoom({
                variables: {
                    input: {
                        characterId: characterData.meCharacter.id,
                        roomId,
                    },
                },
            });
        }
    }, [characterData, roomId, enterRoom]);

    const handleActivityClick = (activity: Activity) => {
        setSelectedActivity(activity);
    };

    const handleStartActivity = () => {
        if (selectedActivity) {
            navigate(`/player/activity/${selectedActivity.id}`);
        }
    };

    const handleBackToFloor = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="room-loading">
                <h2>Carregando sala...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="room-error">
                <div className="error-content">
                    <h1>🔒 Sala Bloqueada</h1>
                    <p className="error-message">{error.message}</p>
                    <button className="back-button" onClick={handleBackToFloor}>
                        ← Voltar ao Corredor
                    </button>
                </div>
            </div>
        );
    }

    if (!roomData) {
        return (
            <div className="room-loading">
                <h2>Carregando...</h2>
            </div>
        );
    }

    const room = roomData.enterRoom.room;
    const activities = roomData.enterRoom.availableActivities;

    // Use custom ClassroomRoom component for CLASSROOM type
    if (room.type === 'CLASSROOM') {
        return <ClassroomRoom room={room} activities={activities} />;
    }

    // Generic room layout for other types
    return (
        <div className="room-container">
            {/* Header */}
            <div className="room-header">
                <button className="back-button" onClick={handleBackToFloor}>
                    ← Voltar ao Andar
                </button>
                <h1>{room.name}</h1>
                {room.description && <p className="room-description">{room.description}</p>}
            </div>

            {/* Room Map */}
            <div className="room-map">
                <div className="room-map-content" style={{ width: room.mapWidth, height: room.mapHeight }}>
                    {/* Player */}
                    <div
                        className="player-marker"
                        style={{
                            left: playerPos.x,
                            top: playerPos.y,
                        }}
                    >
                        👤
                    </div>

                    {/* Activities */}
                    {activities.map((activity: Activity) => (
                        <div
                            key={activity.id}
                            className={`activity-marker ${selectedActivity?.id === activity.id ? 'selected' : ''}`}
                            style={{
                                left: activity.position.x,
                                top: activity.position.y,
                            }}
                            onClick={() => handleActivityClick(activity)}
                        >
                            {getActivityIcon(activity.type)}
                        </div>
                    ))}
                </div>
            </div>

            {/* Activity Panel */}
            {selectedActivity && (
                <div className="activity-panel">
                    <div className="activity-info">
                        <h3>{selectedActivity.name}</h3>
                        <p>Tipo: {getActivityLabel(selectedActivity.type)}</p>
                        <p>Nível necessário: {selectedActivity.requiredLevel}</p>
                    </div>
                    <button className="start-activity-button" onClick={handleStartActivity}>
                        Iniciar Atividade
                    </button>
                </div>
            )}
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
