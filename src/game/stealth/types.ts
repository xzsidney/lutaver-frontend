
export enum GameStatus {
    MENU = 'MENU',
    LOADING = 'LOADING',
    PLAYING = 'PLAYING',
    WON = 'WON',
    CAUGHT = 'CAUGHT'
}

export interface Point {
    x: number;
    y: number;
}

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface LevelConfig {
    id: number;
    name: string;
    codename: string;
    width: number;
    height: number;
    rooms: Rect[];
    corridors: Rect[];
    itemRoomIdx: number;
    startRoomIdx: number;
    enemyCount: number;
    baseEnemySpeed: number;
}

export interface MissionBriefing {
    objective: string;
    intel: string;
    dangerLevel: string;
}

export interface RadioMessage {
    sender: string;
    text: string;
    type: 'info' | 'alert' | 'success';
}
