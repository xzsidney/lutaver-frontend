import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function HomePage() {
    const { isAuthenticated } = useAuth();

    return (
        <MainLayout>
            {/* Hero Section */}
            <div style={{
                padding: '100px 20px',
                textAlign: 'center',
                background: 'linear-gradient(180deg, rgba(98, 0, 234, 0.05) 0%, rgba(0,0,0,0) 100%)'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{
                        fontSize: '3.5rem',
                        marginBottom: '20px',
                        background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800'
                    }}>
                        Aprenda Jogando com LUTAVER
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '40px',
                        lineHeight: '1.6'
                    }}>
                        A plataforma educacional gamificada que transforma o aprendizado em uma aventura épica.
                        Conquiste níveis, complete missões e domine novos conhecimentos.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        {isAuthenticated ? (
                            <Link to="/player/dashboard">
                                <Button size="lg" rightIcon="🚀">
                                    Continuar Jornada
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/register">
                                    <Button size="lg" rightIcon="✨">
                                        Criar Conta Grátis
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline" size="lg">
                                        Fazer Login
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px'
                }}>
                    <Card variant="glass" padding="lg">
                        <div style={{ fontSize: '40px', marginBottom: '20px' }}>🎯</div>
                        <h3>Sistema de Progressão</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '10px', lineHeight: '1.5' }}>
                            Acompanhe seu desenvolvimento e evolua através de um sistema de níveis e conquistas detalhado.
                        </p>
                    </Card>

                    <Card variant="glass" padding="lg">
                        <div style={{ fontSize: '40px', marginBottom: '20px' }}>⚔️</div>
                        <h3>Desafios e Batalhas</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '10px', lineHeight: '1.5' }}>
                            Enfrente desafios educacionais e quizzes para ganhar experiência e itens exclusivos.
                        </p>
                    </Card>

                    <Card variant="glass" padding="lg">
                        <div style={{ fontSize: '40px', marginBottom: '20px' }}>🏆</div>
                        <h3>Recompensas Épicas</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '10px', lineHeight: '1.5' }}>
                            Personalize seu avatar com itens que você ganha ao demonstrar seu conhecimento.
                        </p>
                    </Card>
                </div>
            </div>

            {/* Security Section (Simplified for aesthetics) */}
            <div style={{
                backgroundColor: 'var(--bg-paper)',
                padding: '60px 20px',
                textAlign: 'center',
                borderTop: '1px solid var(--border-color)'
            }}>
                <h2 style={{ marginBottom: '40px' }}>Ambiente Seguro e Focado</h2>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '40px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary-color)' }}>🔒</span> Proteção de Dados
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary-color)' }}>🎓</span> Foco Educacional
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary-color)' }}>✅</span> Conteúdo Verificado
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
