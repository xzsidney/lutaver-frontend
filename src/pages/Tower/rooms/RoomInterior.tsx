import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_FLOOR_ROOMS } from '../../../graphql/tower.queries';
import './RoomInterior.css';

export const RoomInterior: React.FC = () => {
    const navigate = useNavigate();
    const { roomId } = useParams<{ roomId: string }>();

    // Buscar dados da sala
    const { data: roomsData, loading } = useQuery(GET_FLOOR_ROOMS, {
        variables: { floorId: localStorage.getItem('currentFloorId') || '' },
    });

    const [room, setRoom] = useState<any>(null);

    useEffect(() => {
        if (roomsData?.floorRooms) {
            const foundRoom = roomsData.floorRooms.find((r: any) => r.id === roomId);
            if (foundRoom) {
                setRoom(foundRoom);
            }
        }
    }, [roomsData, roomId]);

    if (loading) {
        return <div className="room-interior-container">Carregando sala...</div>;
    }

    if (!room) {
        return (
            <div className="room-interior-container">
                <div className="room-interior-error">
                    <h2>Sala não encontrada</h2>
                    <button onClick={() => navigate(-1)} className="room-interior-btn">
                        ← Voltar
                    </button>
                </div>
            </div>
        );
    }

    const mapLayout = room.mapLayout ? JSON.parse(room.mapLayout) : {};

    return (
        <div className="room-interior-container">
            {/* Sidebar */}
            <div className="room-interior-sidebar">
                <header>
                    <h1 className="room-interior-title">{room.name}</h1>
                    <p className="room-interior-subtitle">Interior da Sala</p>
                </header>

                <div className="room-interior-card">
                    <h2 className="room-interior-card-title">Informações</h2>
                    <p className="room-interior-text">{room.description}</p>
                </div>

                {mapLayout.image && (
                    <div className="room-interior-card">
                        <img
                            src={mapLayout.image}
                            alt={room.name}
                            className="room-interior-image"
                        />
                        {mapLayout.info && (
                            <p className="room-interior-info">{mapLayout.info}</p>
                        )}
                    </div>
                )}

                {mapLayout.actions && mapLayout.actions.length > 0 && (
                    <div className="room-interior-card">
                        <h2 className="room-interior-card-title">Ações Disponíveis</h2>
                        <div className="room-interior-actions">
                            {mapLayout.actions.map((action: any, index: number) => (
                                <button
                                    key={index}
                                    className="room-interior-action-btn"
                                    onClick={() => {
                                        console.log('Ação executada:', action.label);
                                        // TODO: Implementar ações específicas
                                    }}
                                >
                                    <span className="room-interior-action-icon">{action.icon}</span>
                                    <div className="room-interior-action-content">
                                        <span className="room-interior-action-label">{action.label}</span>
                                        <span className="room-interior-action-command">{action.command}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={() => navigate(-1)} className="room-interior-btn">
                        ← Voltar ao Andar
                    </button>
                </div>
            </div>

            {/* Canvas - Mapa interno da sala */}
            <div className="room-interior-canvas-container">
                <div className="room-interior-placeholder">
                    <div className="room-interior-placeholder-content">
                        <h2>🏗️ Mapa Interno em Desenvolvimento</h2>
                        <p>O mapa 2D interno desta sala será implementado aqui.</p>
                        <p className="room-interior-placeholder-hint">
                            Por enquanto, você pode usar as ações disponíveis na sidebar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
