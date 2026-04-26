import React, { useState, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase } from './src/data/database/database';
import { NotificationService } from './src/services/notificationService';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import DashboardScreen from './src/screens/dashboard/DashboardScreen';
import HistoryScreen from './src/screens/transactions/HistoryScreen';
import TransactionFormScreen from './src/screens/transactions/TransactionFormScreen';
import AccountsScreen from './src/screens/accounts/AccountsScreen';
import AddAccountScreen from './src/screens/accounts/AddAccountScreen';
import CategoriesScreen from './src/screens/categories/CategoriesScreen';
import AddCategoryScreen from './src/screens/categories/AddCategoryScreen';
import ReportsScreen from './src/screens/reports/ReportsScreen';
import RemindersScreen from './src/screens/reminders/RemindersScreen';
import AddReminderScreen from './src/screens/reminders/AddReminderScreen';
import { Category } from './src/services/categoryService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [userId, setUserId] = useState<number | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setDbReady(true));
    NotificationService.requestPermissions(); 
  }, []);

  if (!dbReady) return null;

  const handleLogin = (id: number) => {
    setUserId(id);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUserId(null);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onStart={() => setCurrentScreen('login')} />;
      case 'login':
        return <LoginScreen onLogin={handleLogin} onGoToRegister={() => setCurrentScreen('register')} onBack={() => setCurrentScreen('welcome')} />;
      case 'register':
        return <RegisterScreen onRegisterSuccess={() => setCurrentScreen('login')} onBack={() => setCurrentScreen('login')} />;
      case 'dashboard':
        return (
          <DashboardScreen 
            userId={userId!}
            onAddTransaction={() => setCurrentScreen('transaction_form')}
            onViewHistory={() => setCurrentScreen('history')}
            onViewAccounts={() => setCurrentScreen('accounts')}
            onViewCategories={() => setCurrentScreen('categories')}
            onViewReports={() => setCurrentScreen('reports')}
            onViewReminders={() => setCurrentScreen('reminders')}
            onLogout={handleLogout}
          />
        );
      case 'transaction_form':
        return <TransactionFormScreen userId={userId!} onBack={() => setCurrentScreen('dashboard')} />;
      case 'history':
        return <HistoryScreen userId={userId!} onBack={() => setCurrentScreen('dashboard')} onEdit={() => {}} />;
      case 'accounts':
        return <AccountsScreen userId={userId!} onAdd={() => setCurrentScreen('add_account')} onBack={() => setCurrentScreen('dashboard')} />;
      case 'add_account':
        return <AddAccountScreen userId={userId!} onBack={() => setCurrentScreen('accounts')} />;
      case 'categories':
        return (
          <CategoriesScreen 
            userId={userId!} 
            onAdd={() => { setCategoryToEdit(null); setCurrentScreen('add_category'); }} 
            onEdit={(cat) => { setCategoryToEdit(cat); setCurrentScreen('add_category'); }}
            onBack={() => setCurrentScreen('dashboard')} 
          />
        );
      case 'add_category':
        return (
          <AddCategoryScreen 
            userId={userId!} 
            category={categoryToEdit || undefined}
            onBack={() => { setCategoryToEdit(null); setCurrentScreen('categories'); }} 
          />
        );
      case 'reports':
        return <ReportsScreen userId={userId!} onBack={() => setCurrentScreen('dashboard')} />;
      case 'reminders':
        return <RemindersScreen userId={userId!} onBack={() => setCurrentScreen('dashboard')} onAdd={() => setCurrentScreen('add_reminder')} />;
      case 'add_reminder':
        return <AddReminderScreen userId={userId!} onBack={() => setCurrentScreen('reminders')} />;
      default:
        return <WelcomeScreen onStart={() => setCurrentScreen('login')} />;
    }
  };

  return <SafeAreaProvider>{renderScreen()}</SafeAreaProvider>;
}