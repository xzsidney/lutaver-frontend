import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Fighter {
    name: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
}

export const BattlePage: React.FC = () => {
    const navigate = useNavigate();

    // Mock Data
    const [player, setPlayer] = useState<Fighter>({
        name: 'Herói',
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 15,
        defense: 5
    });

    const [enemy, setEnemy] = useState<Fighter>({
        name: 'Goblin',
        hp: 80,
        maxHp: 80,
        mp: 0,
        maxMp: 0,
        attack: 12,
        defense: 2
    });

    const [battleLog, setBattleLog] = useState<string[]>(['Batalha iniciada!']);
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const addToLog = (msg: string) => {
        setBattleLog(prev => [...prev, msg]);
    };

    const handlePlayerAction = (action: 'attack' | 'skill' | 'heal') => {
        if (gameOver || !isPlayerTurn) return;

        let dmg = 0;
        let logMsg = '';

        if (action === 'attack') {
            dmg = Math.max(0, player.attack - enemy.defense + Math.floor(Math.random() * 5));
            logMsg = `${player.name} atacou ${enemy.name} causando ${dmg} de dano!`;
        } else if (action === 'skill') {
            if (player.mp < 10) {
                alert('Mana insuficiente!');
                return;
            }
            dmg = Math.max(0, player.attack * 1.5 - enemy.defense);
            setPlayer(prev => ({ ...prev, mp: prev.mp - 10 }));
            logMsg = `${player.name} usou Habilidade Especial em ${enemy.name} causando ${dmg} de dano!`;
        } else if (action === 'heal') {
            if (player.mp < 20) {
                alert('Mana insuficiente!');
                return;
            }
            const healAmount = 30;
            setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + healAmount), mp: prev.mp - 20 }));
            addToLog(`${player.name} se curou em ${healAmount} HP!`);
            setIsPlayerTurn(false);
            return;
        }

        if (dmg > 0) {
            setEnemy(prev => {
                const newHp = Math.max(0, prev.hp - dmg);
                if (newHp === 0) {
                    setGameOver(true);
                    addToLog(`${enemy.name} foi derrotado! Você venceu!`);
                }
                return { ...prev, hp: newHp };
            });
            addToLog(logMsg);
        }

        if (!gameOver) {
            setIsPlayerTurn(false);
        }
    };

    useEffect(() => {
        if (!isPlayerTurn && !gameOver) {
            const timer = setTimeout(() => {
                // Enemy turn
                const dmg = Math.max(0, enemy.attack - player.defense + Math.floor(Math.random() * 3));
                setPlayer(prev => {
                    const newHp = Math.max(0, prev.hp - dmg);
                    if (newHp === 0) {
                        setGameOver(true);
                        addToLog(`${player.name} foi derrotado! Você perdeu!`);
                    }
                    return { ...prev, hp: newHp };
                });
                addToLog(`${enemy.name} atacou ${player.name} causando ${dmg} de dano!`);
                setIsPlayerTurn(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isPlayerTurn, gameOver]);

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ marginBottom: '30px', color: '#1f1f1f' }}>Sistema de Batalha</h1>

            <div style={{ display: 'flex', gap: '40px', width: '100%', maxWidth: '800px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {/* Player Card */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flex: 1, minWidth: '250px' }}>
                    <h2 style={{ textAlign: 'center', color: '#1890ff' }}>{player.name}</h2>
                    <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '10px' }}>😊</div>

                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <strong>HP</strong>
                            <span>{player.hp}/{player.maxHp}</span>
                        </div>
                        <div style={{ background: '#f5f5f5', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ background: '#52c41a', width: `${(player.hp / player.maxHp) * 100}%`, height: '100%', transition: 'width 0.3s' }} />
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <strong>MP</strong>
                            <span>{player.mp}/{player.maxMp}</span>
                        </div>
                        <div style={{ background: '#f5f5f5', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ background: '#1890ff', width: `${(player.mp / player.maxMp) * 100}%`, height: '100%', transition: 'width 0.3s' }} />
                        </div>
                    </div>
                </div>

                {/* VS */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h2 style={{ color: '#cf1322', fontSize: '32px', margin: 0 }}>VS</h2>
                </div>

                {/* Enemy Card */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flex: 1, minWidth: '250px' }}>
                    <h2 style={{ textAlign: 'center', color: '#cf1322' }}>{enemy.name}</h2>
                    <div style={{ textAlign: 'center', fontSize: '48px', marginBottom: '10px' }}>👹</div>

                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <strong>HP</strong>
                            <span>{enemy.hp}/{enemy.maxHp}</span>
                        </div>
                        <div style={{ background: '#f5f5f5', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ background: '#ff4d4f', width: `${(enemy.hp / enemy.maxHp) * 100}%`, height: '100%', transition: 'width 0.3s' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '30px', width: '100%', maxWidth: '800px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Ações</h3>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => handlePlayerAction('attack')}
                        disabled={!isPlayerTurn || gameOver}
                        style={{ padding: '10px 20px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: (!isPlayerTurn || gameOver) ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                    >
                        🔥 Atacar
                    </button>
                    <button
                        onClick={() => handlePlayerAction('skill')}
                        disabled={!isPlayerTurn || gameOver}
                        style={{ padding: '10px 20px', background: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: (!isPlayerTurn || gameOver) ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                    >
                        ⚡ Habilidade (10 MP)
                    </button>
                    <button
                        onClick={() => handlePlayerAction('heal')}
                        disabled={!isPlayerTurn || gameOver}
                        style={{ padding: '10px 20px', background: '#52c41a', color: 'white', border: 'none', borderRadius: '4px', cursor: (!isPlayerTurn || gameOver) ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                    >
                        💊 Curar (20 MP)
                    </button>
                    {gameOver && (
                        <button
                            onClick={() => navigate(-1)}
                            style={{ padding: '10px 20px', background: '#595959', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                        >
                            🔙 Voltar
                        </button>
                    )}
                </div>
            </div>

            {/* Log */}
            <div style={{ marginTop: '20px', width: '100%', maxWidth: '800px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginTop: 0 }}>Registro de Batalha</h3>
                <div style={{ height: '200px', overflowY: 'auto', background: '#fafafa', padding: '10px', border: '1px solid #f0f0f0', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {battleLog.map((log, index) => (
                        <div key={index} style={{ marginBottom: '5px', color: log.includes('derrotado') || log.includes('perdeu') ? '#cf1322' : log.includes('venceu') || log.includes('Derrota') ? '#52c41a' : '#595959' }}>
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
