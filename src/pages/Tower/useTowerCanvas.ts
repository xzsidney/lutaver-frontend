import { useEffect } from 'react';

interface FloorPoint {
    id: string;
    type: string;
    x: number;
    y: number;
    radius: number;
    enemyShape?: string;
    consumed: boolean;
}

interface FloorState {
    floor: {
        id: string;
        mapWidth: number;
        mapHeight: number;
    };
    points: FloorPoint[];
}

// Define walkable areas (rooms and corridors)
interface WalkableArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

// SIMPLIFIED WALKABLE AREAS - Grid Layout
const walkableAreas: WalkableArea[] = [
    // MAIN HORIZONTAL CORRIDOR
    { x: 100, y: 450, width: 1700, height: 120 },

    // TOP ROW ROOMS
    { x: 150, y: 100, width: 300, height: 250 }, // MATEMÁTICA
    { x: 600, y: 100, width: 280, height: 250 }, // HISTÓRIA  
    { x: 1050, y: 100, width: 300, height: 250 }, // LÍNGUAS
    { x: 1500, y: 100, width: 280, height: 250 }, // CIÊNCIAS

    // TOP ROW CONNECTORS
    { x: 280, y: 350, width: 120, height: 100 },
    { x: 700, y: 350, width: 120, height: 100 },
    { x: 1150, y: 350, width: 120, height: 100 },
    { x: 1600, y: 350, width: 120, height: 100 },

    // BOTTOM ROW ROOMS
    { x: 150, y: 700, width: 280, height: 250 }, // ARTES
    { x: 600, y: 700, width: 300, height: 250 }, // GEOGRAFIA
    { x: 1050, y: 700, width: 320, height: 250 }, // ED. FÍSICA
    { x: 1500, y: 700, width: 280, height: 250 }, // ENTRADA

    // BOTTOM ROW CONNECTORS
    { x: 260, y: 570, width: 120, height: 130 },
    { x: 700, y: 570, width: 120, height: 130 },
    { x: 1160, y: 570, width: 120, height: 130 },
    { x: 1600, y: 570, width: 120, height: 130 },
];

// Check if a position is in a walkable area
export function isWalkable(x: number, y: number): boolean {
    const playerRadius = 18;

    for (const area of walkableAreas) {
        if (
            x - playerRadius >= area.x &&
            x + playerRadius <= area.x + area.width &&
            y - playerRadius >= area.y &&
            y + playerRadius <= area.y + area.height
        ) {
            return true;
        }
    }
    return false;
}

export const useTowerCanvas = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    playerPos: { x: number; y: number },
    floorState: FloorState | undefined
) => {
    useEffect(() => {
        if (!canvasRef.current || !floorState) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        // Calculate camera offset to follow player
        const cameraX = playerPos.x - canvasWidth / 2;
        const cameraY = playerPos.y - canvasHeight / 2;

        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Save context state
        ctx.save();

        // Apply camera transform
        ctx.translate(-cameraX, -cameraY);

        // Draw map background
        renderMap(ctx, floorState.floor.mapWidth, floorState.floor.mapHeight);

        // Draw all points
        for (const point of floorState.points) {
            if (!point.consumed) {
                renderPoint(ctx, point);
            }
        }

        // Draw player token
        renderPlayer(ctx, playerPos.x, playerPos.y);

        // Restore context
        ctx.restore();

    }, [canvasRef, playerPos, floorState]);
};

function renderMap(ctx: CanvasRenderingContext2D, mapWidth: number, mapHeight: number) {
    // Fill with wall color
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(0, 0, mapWidth, mapHeight);

    const corridorWidth = 120;
    const roomColor = '#e2e8f0';
    const corridorColor = '#cbd5e0';

    // Helper to draw room
    const drawRoom = (x: number, y: number, width: number, height: number, name?: string) => {
        ctx.fillStyle = roomColor;
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);

        if (name) {
            ctx.fillStyle = '#1a202c';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(name, x + width / 2, y + height / 2);
        }
    };

    // Helper to draw corridor
    const drawCorridor = (x: number, y: number, width: number, height: number) => {
        ctx.fillStyle = corridorColor;
        ctx.fillRect(x, y, width, height);
    };

    // MAIN HORIZONTAL CORRIDOR
    drawCorridor(100, 450, 1700, corridorWidth);

    // TOP ROW ROOMS
    drawRoom(150, 100, 300, 250, 'MATEMÁTICA');
    drawCorridor(280, 350, corridorWidth, 100);

    drawRoom(600, 100, 280, 250, 'HISTÓRIA');
    drawCorridor(700, 350, corridorWidth, 100);

    drawRoom(1050, 100, 300, 250, 'LÍNGUAS');
    drawCorridor(1150, 350, corridorWidth, 100);

    drawRoom(1500, 100, 280, 250, 'CIÊNCIAS');
    drawCorridor(1600, 350, corridorWidth, 100);

    // BOTTOM ROW ROOMS
    drawRoom(150, 700, 280, 250, 'ARTES');
    drawCorridor(260, 570, corridorWidth, 130);

    drawRoom(600, 700, 300, 250, 'GEOGRAFIA');
    drawCorridor(700, 570, corridorWidth, 130);

    drawRoom(1050, 700, 320, 250, 'ED. FÍSICA');
    drawCorridor(1160, 570, corridorWidth, 130);

    drawRoom(1500, 700, 280, 250, 'ENTRADA');
    drawCorridor(1600, 570, corridorWidth, 130);

    // Map border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.strokeRect(0, 0, mapWidth, mapHeight);
}

function renderPoint(ctx: CanvasRenderingContext2D, point: FloorPoint) {
    // Draw detection radius
    ctx.strokeStyle = 'rgba(255, 255, 100, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw enemy shape
    switch (point.enemyShape) {
        case 'TRIANGLE_RED':
            drawTriangle(ctx, point.x, point.y, 25, '#ff4444');
            break;
        case 'SQUARE_BLUE':
            drawSquare(ctx, point.x, point.y, 25, '#4444ff');
            break;
        case 'RECTANGLE_WHITE':
            drawRectangle(ctx, point.x, point.y, 40, 20, '#ffffff');
            break;
        case 'STAR_YELLOW':
            drawStar(ctx, point.x, point.y, 5, 25, 12, '#ffff44');
            break;
        default:
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
            ctx.fill();
    }
}

function renderPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Draw glow effect
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
    glowGradient.addColorStop(0, 'rgba(68, 255, 68, 0.8)');
    glowGradient.addColorStop(0.5, 'rgba(68, 255, 68, 0.4)');
    glowGradient.addColorStop(1, 'rgba(68, 255, 68, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Draw player
    ctx.fillStyle = '#44ff44';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner highlight
    ctx.fillStyle = '#88ff88';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // Direction indicator
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y - 10, 4, 0, Math.PI * 2);
    ctx.fill();
}

// Helper drawing functions
function drawTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function drawSquare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillRect(x - size, y - size, size * 2, size * 2);
    ctx.strokeRect(x - size, y - size, size * 2, size * 2);
}

function drawRectangle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillRect(x - width / 2, y - height / 2, width, height);
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);
}

function drawStar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    points: number,
    outerRadius: number,
    innerRadius: number,
    color: string
) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / points) * i - Math.PI / 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;

        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}
