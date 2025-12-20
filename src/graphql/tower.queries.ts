import { gql } from '@apollo/client';

export const GET_TOWER_FLOORS = gql`
    query GetTowerFloors {
        towerFloors {
            id
            floorNumber
            name
            schoolYear
            mapWidth
            mapHeight
        }
    }
`;

export const GET_FLOOR_BY_SCHOOL_YEAR = gql`
    query GetFloorBySchoolYear($schoolYear: String!) {
        floorBySchoolYear(schoolYear: $schoolYear) {
            id
            floorNumber
            name
            schoolYear
            mapWidth
            mapHeight
        }
    }
`;

export const GET_FLOOR_ROOMS = gql`
    query GetFloorRooms($floorId: ID!) {
        floorRooms(floorId: $floorId) {
            id
            name
            description
            mapLayout
        }
    }
`;

export const GET_FLOOR_STATE = gql`
    query GetFloorState($characterId: ID!, $floorId: ID!) {
        floorState(characterId: $characterId, floorId: $floorId) {
            floor {
                id
                floorNumber
                name
                mapWidth
                mapHeight
            }
            characterPosition {
                x
                y
            }
            points {
                id
                type
                x
                y
                radius
                enemyShape
                consumed
            }
        }
    }
`;

export const UPDATE_TOWER_POSITION = gql`
    mutation UpdateTowerPosition($input: UpdatePositionInput!) {
        updateTowerPosition(input: $input) {
            x
            y
        }
    }
`;

export const TRIGGER_TOWER_POINT = gql`
    mutation TriggerTowerPoint($input: TriggerPointInput!) {
        triggerTowerPoint(input: $input) {
            success
            eventType
            data
            shouldConsume
        }
    }
`;
