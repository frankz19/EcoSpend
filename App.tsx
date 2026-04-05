import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { initDatabase } from './src/data/database/database';

// Importaciones
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import TransactionFormScreen from './src/screens/transactions/TransactionFormScreen';


export default function App() {
  // CAMBIA ESTO A 'dashboard' PARA FORZAR LA VISTA
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'register' | 'dashboard' | 'transaction_form'>('transaction_form');

  useEffect(() => {
    initDatabase();
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStart={() => setCurrentScreen('login')} />;
      case 'login':
        return (
          <LoginScreen 
            onNavigateToRegister={() => setCurrentScreen('register')} 
            onBack={() => setCurrentScreen('welcome')}
          />
        );
      case 'register':
        return <RegisterScreen onBack={() => setCurrentScreen('login')} />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'transaction_form':
        return <TransactionFormScreen  onBack={() => setCurrentScreen('dashboard')}/>;
      default:
        return <WelcomeScreen onStart={() => setCurrentScreen('login')} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {renderScreen()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
});