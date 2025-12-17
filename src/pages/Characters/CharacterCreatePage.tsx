import { useNavigate } from 'react-router-dom';
import { CharacterCreateForm } from '../../components/Character/CharacterCreateForm';

export function CharacterCreatePage() {
    const navigate = useNavigate();

    return (
        <CharacterCreateForm onSuccess={() => navigate('/player/character')} />
    );
}
