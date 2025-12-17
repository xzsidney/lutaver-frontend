import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import { AdminLayout } from '../../../components/layout/AdminLayout';
import { NpcForm } from './components/NpcForm';
import { GET_NPC_QUERY } from '../../../graphql/npc/npc.queries';
import { UPDATE_NPC_MUTATION } from '../../../graphql/npc/npc.mutations';

export default function EditNpcPage() {
    const router = useRouter();
    const { id } = router.query;

    const { data, loading: queryLoading, error } = useQuery(GET_NPC_QUERY, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'network-only' // Ensure fresh data on edit
    });

    const [updateNpc, { loading: mutationLoading }] = useMutation(UPDATE_NPC_MUTATION);

    const handleSubmit = async (formData: any) => {
        try {
            // Remove unmodifiable fields or clean data if necessary
            // For now, passing exactly what form gives mostly works as input matches, 
            // but strict typing might require omitted fields.
            // Our input types in graphql are quite flexible (all optional).

            await updateNpc({
                variables: {
                    id,
                    input: formData
                }
            });
            alert('NPC atualizado com sucesso!');
            router.push('/admin/npcs');
        } catch (error: any) {
            alert('Erro ao atualizar NPC: ' + error.message);
        }
    };

    if (error) return <AdminLayout><div className="alert alert-danger m-3">Erro: {error.message}</div></AdminLayout>;
    if (queryLoading || !data) return <AdminLayout><div className="p-5 text-center">Carregando NPC...</div></AdminLayout>;

    return (
        <AdminLayout>
            <section className="panel">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-4">
                    <div>
                        <h1 className="h5 section-title mb-1">Editar NPC</h1>
                        <p className="section-sub mb-0">{data.npc.name}</p>
                    </div>
                    <button className="btn btn-ghost" onClick={() => router.push('/admin/npcs')}>
                        Voltar
                    </button>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <NpcForm
                            initialData={data.npc}
                            onSubmit={handleSubmit}
                            loading={mutationLoading}
                            submitLabel="Salvar Alterações"
                        />
                    </div>
                </div>
            </section>
        </AdminLayout>
    );
}
