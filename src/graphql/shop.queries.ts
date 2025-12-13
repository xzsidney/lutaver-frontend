import { gql } from '@apollo/client';

export const SHOP_ITEMS_QUERY = gql`
  query ShopItems($type: String, $minLevel: Int) {
    shopItems(type: $type, minLevel: $minLevel) {
      id
      name
      type
      subType
      rarity
      description
      price
      requiredLevel
      effects
    }
  }
`;

export const BUY_ITEM_MUTATION = gql`
  mutation BuyItem($itemId: ID!, $quantity: Int!) {
    buyItem(itemId: $itemId, quantity: $quantity) {
      success
      message
      newBalance
    }
  }
`;

export const INVENTORY_QUERY = gql`
  query CharacterInventory($characterId: ID!) {
    characterInventory(characterId: $characterId) {
      id
      item {
        id
        name
        type
        subType
        rarity
        description
        effects
        stackable
        equipmentSlot
      }
      quantity
      isEquipped
      equippedSlot
    }
  }
`;

export const USE_ITEM_MUTATION = gql`
  mutation UseItem($itemId: ID!) {
    useItem(itemId: $itemId) {
      success
      message
    }
  }
`;

export const EQUIP_ITEM_MUTATION = gql`
  mutation EquipItem($characterId: ID!, $itemId: ID!, $slot: EquipmentSlot!) {
    equipItem(characterId: $characterId, itemId: $itemId, slot: $slot) {
      id
      isEquipped
      equippedSlot
    }
  }
`;
