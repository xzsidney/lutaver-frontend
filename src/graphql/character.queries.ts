import { gql } from '@apollo/client';

// Query para buscar MEU personagem (único)
export const ME_CHARACTER_QUERY = gql`
  query MeCharacter {
    meCharacter {
      id
      name
      level
      xp
      coins
      currentHp
      maxHp
      schoolYear
      createdAt
      updatedAt
      attributes {
        id
        attribute {
          code
          name
          description
        }
        baseValue
        bonusValue
        totalValue
      }
      powers {
        id
        power {
          id
          name
          discipline
          type
          rarity
          description
        }
        level
        isEquipped
      }
      inventory {
        id
        item {
          id
          name
          type
          rarity
          description
        }
        quantity
        isEquipped
      }
    }
  }
`;

// Query para buscar atributos do meu personagem
export const ME_CHARACTER_ATTRIBUTES_QUERY = gql`
  query MeCharacterAttributes {
    meCharacterAttributes {
      id
      attribute {
        code
        name
        description
        minValue
        maxValue
      }
      baseValue
      bonusValue
      totalValue
    }
  }
`;

// Query para buscar definições de atributos
export const ALL_ATTRIBUTES_QUERY = gql`
  query AllAttributeDefinitions {
    allAttributeDefinitions {
      id
      code
      name
      description
      minValue
      maxValue
    }
  }
`;

// Legacy queries (mantidas para compatibilidade)
export const MY_CHARACTERS_QUERY = gql`
  query MyCharacters {
    myCharacters {
      id
      name
      level
      xp
      coins
      currentHp
      maxHp
      schoolYear
      createdAt
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

export const CHARACTER_QUERY = gql`
  query Character($id: ID!) {
    character(id: $id) {
      id
      name
      level
      xp
      coins
      currentHp
      maxHp
      schoolYear
      createdAt
      updatedAt
      attributes {
        id
        attribute {
          code
          name
          description
        }
        baseValue
        bonusValue
        totalValue
      }
      powers {
        id
        power {
          id
          name
          discipline
          type
          rarity
          description
          manaCost
          cooldown
        }
        level
        isEquipped
        slot
      }
      inventory {
        id
        item {
          id
          name
          type
          rarity
          description
          stackable
          maxStack
          equipmentSlot
        }
        quantity
        isEquipped
        equippedSlot
      }
    }
  }
`;

export const ALL_POWERS_QUERY = gql`
  query AllPowers {
    allPowers {
      id
      name
      discipline
      type
      rarity
      description
      manaCost
      cooldown
    }
  }
`;
