import { gql } from '@apollo/client';


export const GET_PLAYER_HOME_DATA = gql`
  query GetPlayerHomeData {
    me {
      id
      name
      email
    }
    meCharacter {
      id
      name
      level
      xp
      coins
      currentHp
      maxHp
      schoolYear
      attributes {
        attribute {
          name
          code
        }
        totalValue
      }
      affinities {
        discipline {
          name
          code
        }
        percentage
      }
    }
  }
`;

// Keeping the old one for now if used elsewhere, but marked as deprecated equivalent
export const MY_PLAYER_PROFILE_QUERY = gql`
  query MyPlayerProfile {
    myPlayerProfile {
      userId
      name
      level
      xp
      coins
      characterName
    }
  }
`;
