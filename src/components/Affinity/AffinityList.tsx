import React from 'react';
import { Card } from '../ui/Card';
import { AffinityProgressBar } from './AffinityProgressBar';

interface Affinity {
    id: string;
    discipline: {
        id: string;
        code: string;
        name: string;
        schoolYear: string;
    };
    percentage: number;
}

interface AffinityListProps {
    affinities: Affinity[];
}

export const AffinityList: React.FC<AffinityListProps> = ({ affinities }) => {
    // Sort disciplines: highest percentage first? or alphabetical?
    // Let's sort alphabetically by name
    const sortedAffinities = [...affinities].sort((a, b) =>
        a.discipline.name.localeCompare(b.discipline.name)
    );

    return (
        <Card variant="flat" padding="lg" className="affinity-list-card">
            <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                🎓 Afinidades Acadêmicas
            </h3>

            {sortedAffinities.length === 0 ? (
                <p>Nenhuma disciplina disponível para o seu nível escolar.</p>
            ) : (
                <div className="affinity-list__grid">
                    {sortedAffinities.map(affinity => (
                        <AffinityProgressBar
                            key={affinity.id}
                            label={affinity.discipline.name}
                            percentage={affinity.percentage}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
};
