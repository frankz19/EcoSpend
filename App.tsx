import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { initDatabase } from './src/data/database/database';

// --- IMPORTACIONES DE TODAS LAS VISTAS ---
import WelcomeScreen from './src/screens/WelcomeScreen';
// Autenticación
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
// Dashboard e Historial
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import HistoryScreen from './src/screens/transactions/HistoryScreen';
import TransactionFormScreen from './src/screens/transactions/TransactionFormScreen';
// Categorías
import CategoriesScreen from './src/screens/categories/CategoriesScreen';
import AddCategoryScreen from './src/screens/categories/AddCategoryScreen';
// Cuentas
import AccountsScreen from './src/screens/accounts/AccountsScreen';
import AddAccountScreen from './src/screens/accounts/AddAccountScreen';
// Reportes
import ReportsScreen from './src/screens/reports/ReportsScreen';


type ScreenName = 
  | 'welcome' | 'login' | 'register' 
  | 'dashboard' | 'history' | 'transaction_form'
  | 'categories' | 'add_category'
  | 'accounts' | 'add_account'
  | 'reports';

export default function App() {

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('welcome');

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
        return (
          <DashboardScreen 
            onAddTransaction={() => setCurrentScreen('transaction_form')}
            onViewHistory={() => setCurrentScreen('history')}
          />
        );

      case 'transaction_form':
        return <TransactionFormScreen onBack={() => setCurrentScreen('dashboard')} />;

      case 'history':
        return <HistoryScreen onBack={() => setCurrentScreen('dashboard')} />;

      case 'categories':
        return <CategoriesScreen onAdd={() => setCurrentScreen('add_category')} onBack={() => setCurrentScreen('dashboard')} />;

      case 'add_category':
        return <AddCategoryScreen onBack={() => setCurrentScreen('categories')} />;

      case 'accounts':
        return <AccountsScreen onAdd={() => setCurrentScreen('add_account')} onBack={() => setCurrentScreen('dashboard')} />;

      case 'add_account':
        return <AddAccountScreen onBack={() => setCurrentScreen('accounts')} />;

      case 'reports':
        return <ReportsScreen onBack={() => setCurrentScreen('dashboard')} />;

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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});