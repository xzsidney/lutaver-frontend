// Layout fixo do Andar 2 - FUNDAMENTAL_1_2
// Mesmas posições do Andar 1, mas IDs diferentes
// Última atualização: 2025-12-20 19:14 - Porta solta removida

export const ANDAR02_LAYOUT = {
    canvasWidth: 1200,
    canvasHeight: 720,

    // Layout das salas (posições fixas)
    roomLayouts: [
        // LADO ESQUERDO
        {
            roomId: 'classroom-a2',
            x: 10, y: 30, w: 170, h: 110,
            color: '#3b82f6'
        },
        {
            roomId: 'science-lab-a2',
            x: 10, y: 160, w: 170, h: 120,
            color: '#10b981'
        },
        {
            roomId: 'computer-lab-a2',
            x: 10, y: 310, w: 170, h: 110,
            color: '#06b6d4'
        },
        {
            roomId: 'nurse-a2',
            x: 10, y: 440, w: 170, h: 90,
            color: '#ec4899'
        },
        {
            roomId: 'courtyard-a2',
            x: 10, y: 560, w: 170, h: 150,
            color: '#84cc16'
        },

        // CENTRO E TOPO
        {
            roomId: 'library-a2',
            x: 330, y: 50, w: 270, h: 90,
            color: '#8b5cf6'
        },
        {
            roomId: 'principal-a2',
            x: 640, y: 50, w: 260, h: 90,
            color: '#ef4444'
        },
        {
            roomId: 'teachers-a2',
            x: 1020, y: 20, w: 170, h: 120,
            color: '#f59e0b'
        },

        // LADO DIREITO
        {
            roomId: 'office-a2',
            x: 1020, y: 160, w: 170, h: 120,
            color: '#6366f1'
        },
        {
            roomId: 'canteen-a2',
            x: 370, y: 350, w: 250, h: 140,
            color: '#f97316'
        },
        {
            roomId: 'storage-a2',
            x: 1020, y: 350, w: 170, h: 150,
            color: '#64748b'
        },
        {
            roomId: 'restrooms-a2',
            x: 360, y: 600, w: 260, h: 110,
            color: '#94a3b8'
        },
        {
            roomId: 'gym-a2',
            x: 650, y: 600, w: 230, h: 110,
            color: '#14b8a6'
        },
        {
            roomId: 'sports-field-a2',
            x: 910, y: 600, w: 280, h: 110,
            color: '#10b981'
        },
    ],

    // Corredores (mesmos do Andar 1)
    corridors: [
        { x: 180, y: 210, w: 840, h: 80 },
        { x: 180, y: 140, w: 840, h: 70 },
        { x: 180, y: 530, w: 840, h: 70 },
        { x: 180, y: 20, w: 100, h: 690 },
        { x: 920, y: 20, w: 100, h: 690 },
        { x: 620, y: 140, w: 70, h: 460 },
    ],

    // Portas (mesmas do Andar 1)
    doors: [
        { x: 170, y: 65, w: 20, h: 40 },
        { x: 170, y: 200, w: 20, h: 40 },
        { x: 170, y: 345, w: 20, h: 40 },
        { x: 170, y: 465, w: 20, h: 40 },
        { x: 170, y: 615, w: 20, h: 40 },
        { x: 460, y: 130, w: 60, h: 20 },
        { x: 770, y: 130, w: 60, h: 20 },
        { x: 1010, y: 60, w: 20, h: 40 },
        { x: 1010, y: 200, w: 20, h: 40 },
        { x: 1010, y: 400, w: 20, h: 40 },
        { x: 460, y: 590, w: 60, h: 20 },
        { x: 730, y: 590, w: 60, h: 20 },
        { x: 940, y: 590, w: 60, h: 20 },
        // Removida porta solta: { x: 610, y: 400, w: 20, h: 40 }
    ],
};

// Áreas walkable (salas + corredores + portas)
export const ANDAR02_WALKABLES = [
    ...ANDAR02_LAYOUT.roomLayouts,
    ...ANDAR02_LAYOUT.corridors,
    ...ANDAR02_LAYOUT.doors,
];
