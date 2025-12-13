import React from 'react';
import { useQuery } from '@apollo/client';
import { SYSTEM_STATS_QUERY } from '../graphql/admin.queries';
import { AdminLayout } from '../components/layout/AdminLayout';

export function AdminPage() {
    const { data, loading, error } = useQuery(SYSTEM_STATS_QUERY);

    if (error) {
        return (
            <AdminLayout>
                <div className="alert alert-danger p-4">
                    <h3 className="h6 mb-2">❌ Erro ao carregar dados</h3>
                    <p className="mb-0">{error.message}</p>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <section className="panel">
                <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                        <h1 className="h5 section-title mb-1">Dashboard</h1>
                        <p className="section-sub mb-0">Visão geral do sistema</p>
                    </div>
                </div>

                {/* KPIs */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="kpi">
                            <div className="label">Total Usuários</div>
                            <div className="value" style={{ color: 'var(--br-blue)' }}>
                                {loading ? '...' : data?.systemStats.totalUsers}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="kpi">
                            <div className="label">Jogadores</div>
                            <div className="value" style={{ color: 'var(--br-yellow)' }}>
                                {loading ? '...' : data?.systemStats.playerCount}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="kpi">
                            <div className="label">Professores</div>
                            <div className="value" style={{ color: '#E65100' }}>
                                {loading ? '...' : data?.systemStats.teacherCount}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="kpi">
                            <div className="label">Admins</div>
                            <div className="value" style={{ color: 'var(--br-green)' }}>
                                {loading ? '...' : data?.systemStats.adminCount}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="panel bg-light border-0">
                    <div className="d-flex justify-content-between mb-3 align-items-center">
                        <strong className="text-muted">Últimos registros</strong>
                        <input className="form-control form-control-sm w-25" placeholder="Buscar..." />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Nome</th>
                                    <th>Status</th>
                                    <th>Atualizado</th>
                                    <th className="text-end">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span className="badge-br badge-blue">Usuário</span></td>
                                    <td>sidney.lira</td>
                                    <td><span className="badge-br badge-green">Ativo</span></td>
                                    <td>12/12/2025</td>
                                    <td className="text-end"><button className="btn btn-sm btn-ghost">Editar</button></td>
                                </tr>
                                <tr>
                                    <td><span className="badge-br badge-yellow">Disciplina</span></td>
                                    <td>Matemática (1º ano)</td>
                                    <td><span className="badge-br badge-green">Publicada</span></td>
                                    <td>12/12/2025</td>
                                    <td className="text-end"><button className="btn btn-sm btn-ghost">Editar</button></td>
                                </tr>
                                {/* Mock Data for visual consistency until real API data exists */}
                                <tr>
                                    <td><span className="badge-br badge-blue">Usuário</span></td>
                                    <td>novo.aluno</td>
                                    <td><span className="badge-br badge-green">Ativo</span></td>
                                    <td>12/12/2025</td>
                                    <td className="text-end"><button className="btn btn-sm btn-ghost">Editar</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </section>
        </AdminLayout>
    );
}
