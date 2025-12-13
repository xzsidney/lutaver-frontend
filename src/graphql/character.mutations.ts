import { gql } from '@apollo/client';

// Mutation para criar personagem com distribuição de pontos
export const CREATE_CHARACTER_MUTATION = gql`
  mutation CreateCharacter($input: CreateCharacterInput!) {
    createCharacter(input: $input) {
      id
      name
      level
      xp
      coins
      currentHp
      maxHp
      schoolYear
      attributes {
        id
        attribute {
          code
          name
        }
        baseValue
        bonusValue
        totalValue
      }
    }
  }
`;

// Mutation para atualizar personagem (sem ID, usa o personagem do usuário)
export const UPDATE_CHARACTER_MUTATION = gql`
  mutation UpdateCharacter($input: UpdateCharacterInput!) {
    updateCharacter(input: $input) {
      id
      name
      schoolYear
      updatedAt
    }
  }
`;

// Mutation para deletar personagem (sem ID, usa o personagem do usuário)
export const DELETE_CHARACTER_MUTATION = gql`
  mutation DeleteCharacter {
    deleteCharacter
  }
`;

// Mutation para definir HP atual
export const SET_CURRENT_HP_MUTATION = gql`
  mutation SetCurrentHp($characterId: ID!, $value: Int!) {
    setCurrentHp(characterId: $characterId, value: $value) {
      id
      currentHp
      maxHp
    }
  }
`;

// Mutation para restaurar HP
export const RESTORE_HP_MUTATION = gql`
  mutation RestoreHp($characterId: ID!, $amount: Int!) {
    restoreHp(characterId: $characterId, amount: $amount) {
      id
      currentHp
      maxHp
    }
  }
`;
