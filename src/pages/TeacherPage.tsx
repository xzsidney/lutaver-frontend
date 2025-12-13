import React from 'react';
import { useQuery } from '@apollo/client';
import { MY_QUIZZES_QUERY, MY_STUDENTS_STATS_QUERY } from '../graphql/teacher.queries';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function TeacherPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { data: quizzesData, loading: quizzesLoading } = useQuery(MY_QUIZZES_QUERY);
    const { data: statsData, loading: statsLoading } = useQuery(MY_STUDENTS_STATS_QUERY);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: '2px solid #e65100'
            }}>
                <div>
                    <h1>📚 Painel do Professor</h1>
                    <p>Olá, Professor(a) {user?.name}!</p>
                </div>
                <button onClick={handleLogout} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                    Sair
                </button>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Total Alunos</h3>
                    <p style={{ fontSize: '42px', fontWeight: 'bold', color: '#1976d2', margin: 0 }}>
                        {statsLoading ? '...' : statsData?.myStudentsStats.totalStudents}
                    </p>
                </div>

                <div style={{ backgroundColor: '#e8f5e9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Alunos Ativos</h3>
                    <p style={{ fontSize: '42px', fontWeight: 'bold', color: '#2e7d32', margin: 0 }}>
                        {statsLoading ? '...' : statsData?.myStudentsStats.activeStudents}
                    </p>
                </div>

                <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Média Geral</h3>
                    <p style={{ fontSize: '42px', fontWeight: 'bold', color: '#e65100', margin: 0 }}>
                        {statsLoading ? '...' : `${statsData?.myStudentsStats.averageScore}%`}
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h2>Meus Quizzes</h2>
                {quizzesLoading ? (
                    <div>Carregando...</div>
                ) : (
                    <div>
                        {quizzesData?.myQuizzes.length === 0 ? (
                            <p style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                Nenhum quiz criado ainda.
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {quizzesData?.myQuizzes.map((quiz: any) => (
                                    <div key={quiz.id} style={{
                                        padding: '15px',
                                        backgroundColor: '#fff3e0',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <strong>📝 {quiz.title}</strong>
                                            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                                                {quiz.questionCount} questões
                                            </p>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#666' }}>
                                            {new Date(quiz.createdAt).toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
                <h2>Funcionalidades do Professor</h2>
                <ul style={{ lineHeight: '1.8' }}>
                    <li>✏️ Criar e editar quizzes educacionais</li>
                    <li>📊 Acompanhar desempenho dos alunos</li>
                    <li>📚 Gerenciar conteúdo educacional</li>
                    <li>🎓 Avaliar progresso da turma</li>
                </ul>
            </div>
        </div>
    );
}
