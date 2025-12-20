// Cache em memória para evitar chamadas redundantes
const roomCache: Record<string, string> = {};

// Estado global para lidar com limite de cota (Quota Management)
let quotaCooldownUntil = 0;

/**
 * Utilitário para retentativas com backoff exponencial.
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 1,
    initialDelay: number = 3000
): Promise<T> {
    let delay = initialDelay;
    for (let i = 0; i <= maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const errorMsg = error?.message || '';
            const isRateLimit =
                error?.status === 429 ||
                errorMsg.includes('429') ||
                errorMsg.includes('RESOURCE_EXHAUSTED');

            if (isRateLimit) {
                // Ativa cooldown global de 60 segundos
                quotaCooldownUntil = Date.now() + 60000;
                console.warn(
                    'Cota do Gemini excedida. Entrando em modo de espera por 60s.'
                );
                throw error;
            }

            if (i < maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            throw error;
        }
    }
    return fn();
}

export const getRoomInsights = async (
    roomName: string
): Promise<string> => {
    // 1. Verificar Cache
    if (roomCache[roomName]) {
        return roomCache[roomName];
    }

    // 2. Verificar Cooldown de Cota
    if (Date.now() < quotaCooldownUntil) {
        return `O sistema de IA está em manutenção para este setor (${roomName}). Aproveite a exploração!`;
    }

    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('VITE_GEMINI_API_KEY not configured');
            return `Você entrou em: ${roomName}. Explore e aprenda o máximo possível!`;
        }

        const result = await retryWithBackoff(async () => {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `Você é um guia de IA de uma escola de alta tecnologia. Dê uma descrição criativa e curta (máximo 2 frases) para o local: "${roomName}". Seja inspirador e use Português do Brasil.`,
                                    },
                                ],
                            },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return (
                data.candidates?.[0]?.content?.parts?.[0]?.text ||
                'Um espaço vibrante dedicado ao crescimento e à descoberta.'
            );
        });

        const text = result.trim();
        roomCache[roomName] = text;
        return text;
    } catch (error: any) {
        const errorMsg = error?.message || '';
        const isQuotaError =
            error?.status === 429 ||
            errorMsg.includes('429') ||
            errorMsg.includes('RESOURCE_EXHAUSTED');

        if (isQuotaError) {
            const fallback = `A sala "${roomName}" é um excelente ambiente para o seu desenvolvimento acadêmico. O guia está offline temporariamente.`;
            roomCache[roomName] = fallback;
            return fallback;
        }

        return `Você entrou em: ${roomName}. Explore e aprenda o máximo possível!`;
    }
};
