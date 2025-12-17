import { gql } from '@apollo/client';

export const CREATE_NPC_MUTATION = gql`
    mutation CreateNpc($input: CreateNpcInput!) {
        createNpc(input: $input) {
            id
            name
            type
            isActive
            schoolYear
            disciplineId
        }
    }
`;

export const UPDATE_NPC_MUTATION = gql`
    mutation UpdateNpc($id: ID!, $input: UpdateNpcInput!) {
        updateNpc(id: $id, input: $input) {
            id
            name
            type
            isActive
            description
            avatarUrl
            portraitUrl
            schoolYear
            disciplineId
            defaultMood
            defaultDialog
            bossHp
            bossAttack
            bossDefense
            bossDifficulty
            rewardXp
            rewardCoins
        }
    }
`;

export const DELETE_NPC_MUTATION = gql`
    mutation DeleteNpc($id: ID!) {
        deleteNpc(id: $id)
    }
`;
