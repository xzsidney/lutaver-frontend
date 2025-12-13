import {
    ApolloClient,
    InMemoryCache,
    createHttpLink,
    from,
    Observable,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { refreshMutex } from './refreshMutex';
import { REFRESH_TOKEN_MUTATION } from '../graphql/mutations';

const httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
    credentials: 'include', // CRÍTICO: Envia cookies httpOnly
});

// Link para anexar access token
const authLink = setContext((_, { headers }) => {
    const accessToken = localStorage.getItem('accessToken');

    return {
        headers: {
            ...headers,
            authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
    };
});

// Link de erro para refresh automático
// IMPORTANTE: Só intercepta erros UNAUTHENTICATED em queries protegidas, não em login/register
const errorLink = onError(({ graphQLErrors, operation, forward }) => {
    if (graphQLErrors) {
        for (const err of graphQLErrors) {
            // Verificar se é erro UNAUTHENTICATED
            if (err.extensions?.code === 'UNAUTHENTICATED') {
                // NÃO interceptar erros de login/register - deixar passar para o componente
                const operationName = operation.operationName;
                const isAuthOperation =
                    operationName === 'Login' ||
                    operationName === 'Register' ||
                    operationName === 'RefreshToken';

                if (isAuthOperation) {
                    // Deixar erro passar para o componente mostrar
                    return;
                }

                // Token expirado em operação protegida, tentar refresh
                return new Observable((observer) => {
                    refreshMutex
                        .runExclusive(async () => {
                            try {
                                const { data } = await apolloClient.mutate({
                                    mutation: REFRESH_TOKEN_MUTATION,
                                });

                                if (data?.refreshToken?.accessToken) {
                                    // Salvar novo access token
                                    localStorage.setItem(
                                        'accessToken',
                                        data.refreshToken.accessToken
                                    );

                                    // Atualizar header da requisição original
                                    const oldHeaders = operation.getContext().headers;
                                    operation.setContext({
                                        headers: {
                                            ...oldHeaders,
                                            authorization: `Bearer ${data.refreshToken.accessToken}`,
                                        },
                                    });

                                    // Repetir requisição original
                                    const subscriber = {
                                        next: observer.next.bind(observer),
                                        error: observer.error.bind(observer),
                                        complete: observer.complete.bind(observer),
                                    };

                                    forward(operation).subscribe(subscriber);
                                } else {
                                    throw new Error('Refresh token falhou');
                                }
                            } catch (refreshError) {
                                // Refresh falhou, fazer logout
                                localStorage.removeItem('accessToken');
                                window.location.href = '/login';
                                observer.error(refreshError);
                            }
                        })
                        .catch((error) => observer.error(error));
                });
            }
        }
    }
    // Retornar undefined para deixar outros erros passarem normalmente
    return;
});

export const apolloClient = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
});
