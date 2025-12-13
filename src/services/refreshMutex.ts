/**
 * Mutex para controlar concorrência de refresh token
 * Garante que apenas uma requisição de refresh seja executada por vez
 * Outras requisições aguardam na fila
 */
class RefreshMutex {
    private refreshing = false;
    private queue: Array<() => void> = [];

    async runExclusive<T>(callback: () => Promise<T>): Promise<T> {
        if (this.refreshing) {
            // Já está refreshing, aguardar na fila
            await new Promise<void>((resolve) => {
                this.queue.push(resolve);
            });

            // Após liberar, repetir a requisição
            return callback();
        }

        this.refreshing = true;

        try {
            return await callback();
        } finally {
            this.refreshing = false;
            // Liberar todas as requisições na fila
            this.queue.forEach((resolve) => resolve());
            this.queue = [];
        }
    }
}

export const refreshMutex = new RefreshMutex();
