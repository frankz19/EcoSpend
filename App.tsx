import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initDatabase } from './src/data/database/database';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import HistoryScreen from './src/screens/transactions/HistoryScreen';
import TransactionFormScreen from './src/screens/transactions/TransactionFormScreen';
import CategoriesScreen from './src/screens/categories/CategoriesScreen';
import AddCategoryScreen from './src/screens/categories/AddCategoryScreen';
import AccountsScreen from './src/screens/accounts/AccountsScreen';
import AddAccountScreen from './src/screens/accounts/AddAccountScreen';
import ReportsScreen from './src/screens/reports/ReportsScreen';

type ScreenName = 
  | 'welcome' | 'login' | 'register' 
  | 'dashboard' | 'history' | 'transaction_form'
  | 'categories' | 'add_category'
  | 'accounts' | 'add_account'
  | 'reports';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('welcome');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    initDatabase();
  }, []);

  const handleLoginSuccess = (id: number) => {
    setUserId(id);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUserId(null);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    if (!userId && !['welcome', 'login', 'register'].includes(currentScreen)) {
      return (
        <LoginScreen 
          onNavigateToRegister={() => setCurrentScreen('register')} 
          onBack={() => setCurrentScreen('welcome')}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStart={() => setCurrentScreen('login')} />;
      case 'login':
        return (
          <LoginScreen 
            onNavigateToRegister={() => setCurrentScreen('register')} 
            onBack={() => setCurrentScreen('welcome')}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'register':
        return <RegisterScreen onBack={() => setCurrentScreen('login')} />;
      case 'dashboard':
        return (
          <DashboardScreen 
            userId={userId!}
            onAddTransaction={() => setCurrentScreen('transaction_form')}
            onViewHistory={() => setCurrentScreen('history')}
            onViewAccounts={() => setCurrentScreen('accounts')}
            onViewCategories={() => setCurrentScreen('categories')}
            onLogout={handleLogout}
          />
        );
      case 'transaction_form':
        return <TransactionFormScreen userId={userId!} onBack={() => setCurrentScreen('dashboard')} />;
      case 'history':
        return <HistoryScreen userId={userId!} onBack={() => setCurrentScreen('dashboard')} />;
      case 'accounts':
        return (
          <AccountsScreen 
            userId={userId!} 
            onAdd={() => setCurrentScreen('add_account')} 
            onBack={() => setCurrentScreen('dashboard')} 
          />
        );
      case 'add_account':
        return <AddAccountScreen userId={userId!} onBack={() => setCurrentScreen('accounts')} />;
      case 'categories':
        return (
          <CategoriesScreen 
            userId={userId!} 
            onAdd={() => setCurrentScreen('add_category')} 
            onBack={() => setCurrentScreen('dashboard')} 
          />
        );
      case 'add_category':
        return <AddCategoryScreen userId={userId!} onBack={() => setCurrentScreen('categories')} />;
      case 'reports':
        return <ReportsScreen userId={userId!} onBack={() => setCurrentScreen('dashboard')} />;
      default:
        return <WelcomeScreen onStart={() => setCurrentScreen('login')} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {renderScreen()}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
});