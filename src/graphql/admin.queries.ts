import { gql } from '@apollo/client';

// ... mutations existentes ...

export const SYSTEM_STATS_QUERY = gql`
  query SystemStats {
    systemStats {
      totalUsers
      playerCount
      teacherCount
      adminCount
    }
  }
`;

export const ALL_USERS_QUERY = gql`
  query AllUsers {
    allUsers {
      id
      name
      email
      role
      createdAt
      isActive
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      role
      isActive
    }
  }
`;

export const ALL_CHARACTERS_QUERY = gql`
  query AllCharacters {
    allCharacters {
      id
      name
      level
      schoolYear
      isActive
      user {
        name
      }
    }
  }
`;

export const ADMIN_UPDATE_CHARACTER_MUTATION = gql`
  mutation AdminUpdateCharacter($id: ID!, $input: AdminUpdateCharacterInput!) {
    adminUpdateCharacter(id: $id, input: $input) {
      id
      name
      schoolYear
      isActive
    }
  }
`;

export const ALL_DISCIPLINES_QUERY = gql`
  query AllDisciplines {
    allDisciplines {
      id
      code
      name
      schoolYear
      description
    }
  }
`;

export const CREATE_DISCIPLINE_MUTATION = gql`
  mutation CreateDiscipline($input: CreateDisciplineInput!) {
    createDiscipline(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_DISCIPLINE_MUTATION = gql`
  mutation UpdateDiscipline($id: ID!, $input: UpdateDisciplineInput!) {
    updateDiscipline(id: $id, input: $input) {
      id
      name
      code
      schoolYear
      description
    }
  }
`;

export const DELETE_DISCIPLINE_MUTATION = gql`
  mutation DeleteDiscipline($id: ID!) {
    deleteDiscipline(id: $id)
  }
`;

export const ALL_ITEMS_QUERY = gql`
  query AllItems {
    allItems {
      id
      name
      type
      subType
      rarity
      price
      description
      isBuyable
    }
  }
`;

export const CREATE_ITEM_MUTATION = gql`
  mutation CreateItem($input: CreateItemInput!) {
    createItem(input: $input) {
      id
      name
    }
  }
`;

export const UPDATE_ITEM_MUTATION = gql`
  mutation UpdateItem($id: ID!, $input: UpdateItemInput!) {
    updateItem(id: $id, input: $input) {
      id
      name
    }
  }
`;

export const DELETE_ITEM_MUTATION = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id)
  }
`;
