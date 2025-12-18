/**
 * Activity Container Component
 * Generic wrapper for all activity types
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { StealthMissionsGame } from '../../../components/games/StealthMissionsGame';
import { BattleGame } from '../../../components/games/BattleGame';
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

    // Render appropriate component based on activity type
    function renderActivityByType(activity: any) {
        switch (activity.type) {
            case 'MISSION':
                return <StealthMissionsGame />;

            case 'BATTLE':
                return <BattleGame />;

            case 'QUIZ':
                return (
                    <div className="activity-placeholder">
                        <div className="placeholder-icon">📝</div>
                        <h2>Quiz</h2>
                        <p>Sistema de Quiz em desenvolvimento...</p>
                        <button onClick={handleBack} className="back-button">
                            Voltar
                        </button>
                    </div>
                );

            case 'STUDY':
                return (
                    <div className="activity-placeholder">
                        <div className="placeholder-icon">📚</div>
                        <h2>Estudo</h2>
                        <p>Sistema de Estudo em desenvolvimento...</p>
                        <button onClick={handleBack} className="back-button">
                            Voltar
                        </button>
                    </div>
                );

            case 'SHOP':
                return (
                    <div className="activity-placeholder">
                        <div className="placeholder-icon">🛒</div>
                        <h2>Loja</h2>
                        <p>Sistema de Loja em desenvolvimento...</p>
                        <button onClick={handleBack} className="back-button">
                            Voltar
                        </button>
                    </div>
                );

            case 'HEAL':
                return (
                    <div className="activity-placeholder">
                        <div className="placeholder-icon">💊</div>
                        <h2>Cura</h2>
                        <p>Sistema de Cura em desenvolvimento...</p>
                        <button onClick={handleBack} className="back-button">
                            Voltar
                        </button>
                    </div>
                );

            case 'EVENT':
                return (
                    <div className="activity-placeholder">
                        <div className="placeholder-icon">📋</div>
                        <h2>Evento</h2>
                        <p>Sistema de Eventos em desenvolvimento...</p>
                        <button onClick={handleBack} className="back-button">
                            Voltar
                        </button>
                    </div>
                );

            case 'BOSS_FIGHT':
                return (
                    <div className="activity-placeholder">
                        <div className="placeholder-icon">👨‍🏫</div>
                        <h2>Boss Fight</h2>
                        <p>Sistema de Boss Fight em desenvolvimento...</p>
                        <button onClick={handleBack} className="back-button">
                            Voltar
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="activity-placeholder">
                        <div className="placeholder-icon">❓</div>
                        <h2>Atividade Desconhecida</h2>
                        <p>Tipo de atividade não reconhecido.</p>
                        <button onClick={handleBack} className="back-button">
                            Voltar
                        </button>
                    </div>
                );
        }
    }

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
