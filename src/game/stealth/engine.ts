
import { TILE_SIZE, PLAYER_RADIUS, ENEMY_RADIUS, COLORS } from './constants';
import { Point, Rect } from './types';

export class Engine {
    static isSolid(x: number, y: number, tiles: number[][]): boolean {
        const tx = Math.floor(x / TILE_SIZE);
        const ty = Math.floor(y / TILE_SIZE);
        if (ty < 0 || ty >= tiles.length || tx < 0 || tx >= tiles[0].length) return true;
        return tiles[ty][tx] === 1;
    }

    static checkCircleWallCollision(x: number, y: number, r: number, tiles: number[][]): Point {
        let nx = x;
        let ny = y;

        // Check grid cells surrounding the circle
        const startX = Math.floor((x - r) / TILE_SIZE);
        const endX = Math.floor((x + r) / TILE_SIZE);
        const startY = Math.floor((y - r) / TILE_SIZE);
        const endY = Math.floor((y + r) / TILE_SIZE);

        for (let ty = startY; ty <= endY; ty++) {
            for (let tx = startX; tx <= endX; tx++) {
                // Bounds check
                if (ty >= 0 && ty < tiles.length && tx >= 0 && tx < tiles[0].length) {
                    if (tiles[ty][tx] === 1) { // 1 is Solid
                        // Wall AABB
                        const tileL = tx * TILE_SIZE;
                        const tileR = (tx + 1) * TILE_SIZE;
                        const tileT = ty * TILE_SIZE;
                        const tileB = (ty + 1) * TILE_SIZE;

                        // Find closest point on Wall Rect to Circle Center
                        // Clamp center to rect
                        const closestX = Math.max(tileL, Math.min(nx, tileR));
                        const closestY = Math.max(tileT, Math.min(ny, tileB));

                        // Vector from closest point to center
                        const dx = nx - closestX;
                        const dy = ny - closestY;
                        const distSq = dx * dx + dy * dy;

                        // If distance < radius, we have a collision
                        if (distSq < r * r && distSq > 0) {
                            const dist = Math.sqrt(distSq);
                            const pen = r - dist;

                            // Normalize and apply pushout
                            if (dist > 0) {
                                nx += (dx / dist) * pen;
                                ny += (dy / dist) * pen;
                            }
                        } else if (distSq === 0) {
                            // Center is exactly inside the wall AABB (unlikely with this logic unless teleported deep inside)
                            // Push back along velocity or arbitrary? 
                            // Since we don't have velocity here, let's just ignore or push slightly?
                            // This case usually implies the clamped point is the center itself.
                            // Which means center is INSIDE the tile.
                            // To solve this properly, we should push out to nearest edge.

                            // Simplification: check offsets from center of tile
                            const cx = tileL + TILE_SIZE / 2;
                            const cy = tileT + TILE_SIZE / 2;
                            const odx = nx - cx;
                            const ody = ny - cy;
                            // Push along largest axis out
                            if (Math.abs(odx) > Math.abs(ody)) {
                                nx = odx > 0 ? tileR + r : tileL - r;
                            } else {
                                ny = ody > 0 ? tileB + r : tileT - r;
                            }
                        }
                    }
                }
            }
        }

        return { x: nx, y: ny };
    }

    // Raycasting for visibility (more accurate than simple distance/angle check)
    static hasLineOfSight(p1: Point, p2: Point, tiles: number[][]): boolean {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.hypot(dx, dy);
        const steps = Math.ceil(distance / (TILE_SIZE / 4));

        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const px = p1.x + dx * t;
            const py = p1.y + dy * t;
            if (this.isSolid(px, py, tiles)) return false;
        }
        return true;
    }
}

export class Enemy {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    angle: number;
    fovAngle: number = Math.PI / 3;
    fovRange: number = 300;
    bounds: Rect;

    constructor(x: number, y: number, speed: number, bounds: Rect) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.bounds = bounds;
        this.angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(this.angle);
        this.vy = Math.sin(this.angle);
    }

    update(dt: number, tiles: number[][]) {
        let nx = this.x + this.vx * this.speed * dt;
        let ny = this.y + this.vy * this.speed * dt;

        const margin = ENEMY_RADIUS + 10;
        const minX = this.bounds.x * TILE_SIZE + margin;
        const maxX = (this.bounds.x + this.bounds.w) * TILE_SIZE - margin;
        const minY = this.bounds.y * TILE_SIZE + margin;
        const maxY = (this.bounds.y + this.bounds.h) * TILE_SIZE - margin;

        if (nx < minX || nx > maxX) {
            this.vx *= -1;
            nx = Math.max(minX, Math.min(maxX, nx));
        }
        if (ny < minY || ny > maxY) {
            this.vy *= -1;
            ny = Math.max(minY, Math.min(maxY, ny));
        }

        this.x = nx;
        this.y = ny;
        this.angle = Math.atan2(this.vy, this.vx);
    }

    canSee(target: Point, tiles: number[][]): boolean {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > this.fovRange) return false;

        const angleToTarget = Math.atan2(dy, dx);
        let diff = angleToTarget - this.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;

        if (Math.abs(diff) > this.fovAngle / 2) return false;

        return Engine.hasLineOfSight(this, target, tiles);
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Draw FOV
        const grd = ctx.createRadialGradient(this.x, this.y, 10, this.x, this.y, this.fovRange);
        grd.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
        grd.addColorStop(1, 'rgba(244, 63, 94, 0)');

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.fovRange, this.angle - this.fovAngle / 2, this.angle + this.fovAngle / 2);
        ctx.fill();

        // Draw Enemy
        ctx.fillStyle = COLORS.ENEMY;
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLORS.ENEMY;
        ctx.beginPath();
        ctx.arc(this.x, this.y, ENEMY_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Direction indicator
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + Math.cos(this.angle) * 20, this.y + Math.sin(this.angle) * 20);
        ctx.stroke();
    }
}
