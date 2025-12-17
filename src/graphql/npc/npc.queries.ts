import { gql } from '@apollo/client';

export const ADMIN_NPCS_QUERY = gql`
    query AdminNpcs($filter: NpcFilterInput) {
        adminNpcs(filter: $filter) {
            id
            name
            type
            isActive
            schoolYear
            discipline {
                id
                name
            }
            rewardXp
            rewardCoins
        }
    }
`;

export const GET_NPC_QUERY = gql`
    query GetNpc($id: ID!) {
        npc(id: $id) {
            id
            name
            description
            type
            avatarUrl
            portraitUrl
            isActive
            schoolYear
            disciplineId
            discipline {
                id
                name
            }
            # Story
            defaultMood
            defaultDialog
            # Boss
            bossHp
            bossAttack
            bossDefense
            bossDifficulty
            # Rewards
            rewardXp
            rewardCoins
        }
    }
`;

export const ALL_DISCIPLINES_QUERY = gql`
    query AllDisciplines {
        allDisciplines {
            id
            name
            schoolYear
        }
    }
`;
