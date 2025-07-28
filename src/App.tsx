// import React from 'react';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <AppRoutes />
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
