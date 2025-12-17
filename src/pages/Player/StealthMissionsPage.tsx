import { StealthMissionsGame } from '../../components/games/StealthMissionsGame';
import { useNavigate } from 'react-router-dom';

export function StealthMissionsPage() {
    const navigate = useNavigate();

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <button
                onClick={() => navigate('/player/character')}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 1000,
                    padding: '10px 20px',
                    background: 'rgba(6, 11, 25, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16, 185, 129, 0.9)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(6, 11, 25, 0.9)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                ← Voltar ao Dashboard
            </button>
            <StealthMissionsGame />
        </div>
    );
}
