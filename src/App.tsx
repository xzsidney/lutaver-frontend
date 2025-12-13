import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './services/apolloClient';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import './styles/global.css';

function App() {
    return (
        <ApolloProvider client={apolloClient}>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </ApolloProvider>
    );
}

export default App;
