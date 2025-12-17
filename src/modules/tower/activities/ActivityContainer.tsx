/**
 * Activity Container Component
 * Generic wrapper for all activity types
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { StealthMissionsGame } from '../../../components/games/StealthMissionsGame';
import './ActivityContainer.css';

const GET_ACTIVITY = gql`
  query GetActivity($activityId: ID!) {
    activity(activityId: $activityId) {
      id
      type
      name
      description
      config
      rewardXp
      rewardCoins
    }
  }
`;

export const ActivityContainer: React.FC = () => {
    const { activityId } = useParams<{ activityId: string }>();
    const navigate = useNavigate();

    const { data, loading } = useQuery(GET_ACTIVITY, {
        variables: { activityId },
        skip: !activityId,
    });

    const handleBack = () => {
        navigate(-1);
    };

    if (loading || !data) {
        return (
            <div className="activity-loading">
                <h2>Carregando atividade...</h2>
            </div>
        );
    }

    const activity = data.activity;

    return (
        <div className="activity-container">
            <div className="activity-header">
                <button className="back-btn" onClick={handleBack}>
                    ← Voltar
                </button>
                <h1>{activity.name}</h1>
            </div>

            <div className="activity-content">
                {renderActivityByType(activity)}
            </div>

            <div className="activity-footer">
                <div className="reward-info">
                    <span className="reward-item">🌟 {activity.rewardXp} XP</span>
                    <span className="reward-item">💰 {activity.rewardCoins} Moedas</span>
                </div>
            </div>
        </div>
    );
};

function renderActivityByType(activity: any) {
    switch (activity.type) {
        case 'MISSION':
            return <StealthMissionsGame />;
        case 'QUIZ':
            return <QuizPlaceholder activity={activity} />;
        case 'BATTLE':
            return <BattlePlaceholder activity={activity} />;
        case 'STUDY':
            return <StudyPlaceholder activity={activity} />;
        case 'SHOP':
            return <ShopPlaceholder activity={activity} />;
        case 'HEAL':
            return <HealPlaceholder activity={activity} />;
        case 'EVENT':
            return <EventPlaceholder activity={activity} />;
        case 'BOSS_FIGHT':
            return <BossFightPlaceholder activity={activity} />;
        default:
            return <div>Tipo de atividade não implementado: {activity.type}</div>;
    }
}

// Placeholder components for each activity type

const QuizPlaceholder: React.FC<{ activity: any }> = ({ activity }) => (
    <div className="activity-placeholder">
        <h2>📝 Quiz</h2>
        <p>{activity.description || 'Quiz educativo'}</p>
        <div className="placeholder-note">Integrando com sistema de quiz existente...</div>
    </div>
);

const BattlePlaceholder: React.FC<{ activity: any }> = ({ activity }) => (
    <div className="activity-placeholder">
        <h2>⚔️ Batalha</h2>
        <p>{activity.description || 'Batalha 2D'}</p>
        <div className="placeholder-note">Em breve: Sistema de batalha por turnos</div>
    </div>
);

const StudyPlaceholder: React.FC<{ activity: any }> = ({ activity }) => (
    <div className="activity-placeholder">
        <h2>📚 Estudo</h2>
        <p>{activity.description || 'Aprender habilidades'}</p>
        <div className="placeholder-note">Em breve: Sistema de aprendizado de skills</div>
    </div>
);

const ShopPlaceholder: React.FC<{ activity: any }> = ({ activity }) => (
    <div className="activity-placeholder">
        <h2>🛒 Loja</h2>
        <p>{activity.description || 'Comprar itens'}</p>
        <div className="placeholder-note">Integrando com sistema de shop existente...</div>
    </div>
);

const HealPlaceholder: React.FC<{ activity: any }> = ({ activity }) => (
    <div className="activity-placeholder">
        <h2>💊 Cura</h2>
        <p>HP restaurado para o máximo!</p>
        <div className="success-message">✅ Saúde restaurada com sucesso!</div>
    </div>
);

const EventPlaceholder: React.FC<{ activity: any }> = ({ activity }) => (
    <div className="activity-placeholder">
        <h2>📋 Evento</h2>
        <p>{activity.description || 'Evento especial'}</p>
        <div className="placeholder-note">Em breve: Eventos da secretaria</div>
    </div>
);

const BossFightPlaceholder: React.FC<{ activity: any }> = ({ activity }) => (
    <div className="activity-placeholder boss">
        <h2>👨‍🏫 Exame Final</h2>
        <p>{activity.description || 'Prova final para passar de ano'}</p>
        <div className="placeholder-note warning">
            ⚠️ Em breve: Exame multifase (Quiz + Batalha)
        </div>
    </div>
);
