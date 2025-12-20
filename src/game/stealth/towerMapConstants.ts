import { TowerRoom } from './types';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 720;

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export const TOWER_ROOMS: TowerRoom[] = [
    // LADO ESQUERDO
    {
        id: 'classroom',
        x: 10,
        y: 30,
        w: 170,
        h: 110,
        name: 'SALA DE AULA',
        color: '#3b82f6',
        description: 'Espaço de aprendizado teórico.',
        actions: [
            {
                label: 'Projetor',
                icon: '📽️',
                command: 'Ativar projetor holográfico e carregar aula do dia.',
            },
            {
                label: 'Presença',
                icon: '👤',
                command: 'Realizar chamada automática via biometria.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Ambiente climatizado com quadros interativos e acústica projetada para palestras.',
        },
    },
    {
        id: 'science_lab',
        x: 10,
        y: 160,
        w: 170,
        h: 120,
        name: 'LAB. CIÊNCIAS',
        color: '#10b981',
        description: 'Laboratório de biotecnologia.',
        actions: [
            {
                label: 'Exaustor',
                icon: '🌀',
                command: 'Ativar sistema de filtragem de ar Nível 4.',
            },
            {
                label: 'Segurança',
                icon: '🛡️',
                command: 'Verificar contenção de materiais perigosos.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Equipado com microscópios eletrônicos e bancadas de contenção biológica avançada.',
        },
    },
    {
        id: 'computer_lab',
        x: 10,
        y: 310,
        w: 170,
        h: 110,
        name: 'LAB. INFORMÁTICA',
        color: '#06b6d4',
        description: 'Centro de processamento de dados.',
        actions: [
            {
                label: 'Renderizar',
                icon: '⚡',
                command: 'Alocar poder da GPU para processamento distribuído.',
            },
            {
                label: 'Firewall',
                icon: '🧱',
                command: 'Reforçar defesas da rede escolar.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Nodos de computação de alta performance e conexão de fibra óptica de 10Gbps.',
        },
    },
    {
        id: 'nurse',
        x: 10,
        y: 440,
        w: 170,
        h: 90,
        name: 'ENFERMARIA',
        color: '#ec4899',
        description: 'Suporte médico avançado.',
        actions: [
            {
                label: 'Triagem',
                icon: '📋',
                command: 'Iniciar escaneamento de sinais vitais via sensores.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Posto médico 24h com equipamentos de primeiros socorros e telemedicina.',
        },
    },
    {
        id: 'courtyard',
        x: 10,
        y: 560,
        w: 170,
        h: 150,
        name: 'PÁTIO',
        color: '#84cc16',
        description: 'Área social externa.',
        actions: [
            {
                label: 'Som',
                icon: '🎵',
                command: 'Tocar música ambiente relaxante no pátio.',
            },
            {
                label: 'Luzes',
                icon: '💡',
                command: 'Ajustar iluminação externa para economia de energia.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Área verde com bancos inteligentes dotados de carregadores solares.',
        },
    },

    // CENTRO E TOPO
    {
        id: 'library',
        x: 330,
        y: 50,
        w: 270,
        h: 90,
        name: 'BIBLIOTECA',
        color: '#8b5cf6',
        description: 'Acervo digital infinito.',
        actions: [
            {
                label: 'Silêncio',
                icon: '🔇',
                command: 'Ativar cancelamento de ruído ambiente.',
            },
            {
                label: 'Busca',
                icon: '🔍',
                command: 'Localizar obras raras nos arquivos.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Milhares de volumes físicos e acesso a bases de dados acadêmicas globais.',
        },
    },
    {
        id: 'principal',
        x: 640,
        y: 50,
        w: 260,
        h: 90,
        name: 'DIRETORIA',
        color: '#ef4444',
        description: 'Comando central.',
        actions: [
            {
                label: 'Reunião',
                icon: '🤝',
                command: 'Preparar sala para videoconferência segura.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Centro administrativo onde são tomadas as decisões estratégicas do campus.',
        },
    },
    {
        id: 'teachers',
        x: 1020,
        y: 20,
        w: 170,
        h: 120,
        name: 'SALA DOS PROFESSORES',
        color: '#f59e0b',
        description: 'Espaço para educadores.',
        actions: [
            {
                label: 'Café',
                icon: '☕',
                command: 'Iniciar preparo de café expresso para os docentes.',
            },
            {
                label: 'Pautas',
                icon: '📝',
                command: 'Sincronizar pautas de reuniões pedagógicas.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Área de descanso e planejamento colaborativo para o corpo docente.',
        },
    },

    // LADO DIREITO
    {
        id: 'office',
        x: 1020,
        y: 160,
        w: 170,
        h: 120,
        name: 'SECRETARIA',
        color: '#6366f1',
        description: 'Administração escolar.',
        actions: [
            {
                label: 'Arquivos',
                icon: '📁',
                command: 'Organizar registros digitais dos alunos.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Atendimento ao público e gestão de documentos acadêmicos.',
        },
    },
    {
        id: 'canteen',
        x: 370,
        y: 350,
        w: 250,
        h: 140,
        name: 'CANTINA',
        color: '#f97316',
        description: 'Nutrição e convívio.',
        actions: [
            {
                label: 'Menu',
                icon: '🍎',
                command: 'Atualizar cardápio balanceado do dia.',
            },
            {
                label: 'Higiene',
                icon: '🧼',
                command: 'Iniciar protocolo de sanitização UV nas mesas.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1567529684892-09290a1b2d05?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Cozinha industrial certificada servindo refeições saudáveis e balanceadas.',
        },
    },
    {
        id: 'storage',
        x: 1020,
        y: 350,
        w: 170,
        h: 150,
        name: 'ALMOXARIFADO',
        color: '#64748b',
        description: 'Estoque de suprimentos.',
        actions: [
            {
                label: 'Estoque',
                icon: '📦',
                command: 'Realizar inventário automático de materiais.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Gestão automatizada de insumos escolares e equipamentos de manutenção.',
        },
    },
    {
        id: 'restrooms',
        x: 360,
        y: 600,
        w: 260,
        h: 110,
        name: 'BANHEIROS',
        color: '#94a3b8',
        description: 'Instalações de higiene.',
        actions: [
            {
                label: 'Limpeza',
                icon: '🧹',
                command: 'Solicitar equipe de manutenção para este setor.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Instalações modernas com sensores de presença e economia de água.',
        },
    },
    {
        id: 'gym',
        x: 650,
        y: 600,
        w: 230,
        h: 110,
        name: 'GINÁSIO',
        color: '#14b8a6',
        description: 'Complexo esportivo.',
        actions: [
            {
                label: 'Placar',
                icon: '🔢',
                command: 'Zerar placar eletrônico do ginásio.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Quadras poliesportivas com piso de absorção de impacto de última geração.',
        },
    },
    {
        id: 'sports_field',
        x: 910,
        y: 600,
        w: 280,
        h: 110,
        name: 'CAMPO ESPORTIVO',
        color: '#22c55e',
        description: 'Atividades ao ar livre.',
        actions: [
            {
                label: 'Irrigar',
                icon: '💧',
                command: 'Ativar irrigação inteligente do gramado.',
            },
        ],
        details: {
            image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=600&h=400',
            info: 'Gramado sintético profissional para prática de futebol e atletismo.',
        },
    },
];

export const TOWER_CORRIDORS: Rect[] = [
    { x: 180, y: 210, w: 840, h: 80 },
    { x: 180, y: 140, w: 840, h: 70 },
    { x: 180, y: 530, w: 840, h: 70 },
    { x: 180, y: 20, w: 100, h: 690 },
    { x: 920, y: 20, w: 100, h: 690 },
    { x: 620, y: 140, w: 70, h: 460 },
];

export const TOWER_DOORS: Rect[] = [
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
];

export const TOWER_WALKABLES: Rect[] = [
    ...TOWER_ROOMS,
    ...TOWER_CORRIDORS,
    ...TOWER_DOORS,
];
