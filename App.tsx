import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// Servicios y Datos
import { initDatabase } from './src/data/database/database';
import { NotificationService } from './src/services/notificationService';

// Pantallas
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
import { TransactionWithDetails } from './src/services/transactionService';
import { Account } from './src/services/accountService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'loading' | string>('loading');
  const [userId, setUserId] = useState<number | null>(null);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionWithDetails | null>(null);
  const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        
        // Aislamos las notificaciones. Si fallan en el simulador, no romperán el inicio de sesión.
        try {
          await NotificationService.requestPermissions();
        } catch (notifError) {
          console.warn("Permisos de notificación omitidos", notifError);
        }
        
        const savedSession = await SecureStore.getItemAsync('user_session');
        
        if (savedSession) {
          const { id } = JSON.parse(savedSession);
          
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();

          if (hasHardware && isEnrolled) {
            const auth = await LocalAuthentication.authenticateAsync({
              promptMessage: 'Confirma tu identidad',
              disableDeviceFallback: false,
            });

            if (auth.success) {
              setUserId(id);
              setCurrentScreen('dashboard');
            } else {
              // Si el usuario cancela la huella, va a login, pero NO borramos la sesión
              setCurrentScreen('login');
            }
          } else {
            setUserId(id);
            setCurrentScreen('dashboard');
          }
        } else {
          setCurrentScreen('welcome');
        }
      } catch (error) {
        // Si hay un error real de deserialización, lo capturamos
        console.error("Error crítico leyendo sesión:", error);
        await SecureStore.deleteItemAsync('user_session'); // Limpiamos basura
        setCurrentScreen('login');
      } finally {
        setDbReady(true);
      }
    };
    setup();
  }, []);

  // Mientras la DB se inicializa y verificamos seguridad, mostramos un loader
  if (!dbReady || currentScreen === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  const handleLogin = (id: number) => {
    setUserId(id);
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    // Seguridad: Limpiar token al cerrar sesión
    await SecureStore.deleteItemAsync('user_session');
    setUserId(null);
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    // Protección de rutas: Si la pantalla requiere auth y no hay userId, mandar a login
    const screensRequiringAuth = [
      'dashboard', 'transaction_form', 'history', 'accounts', 
      'add_account', 'categories', 'add_category', 'reports', 
      'reminders', 'add_reminder'
    ];

    if (screensRequiringAuth.includes(currentScreen) && !userId) {
      return <LoginScreen onLogin={handleLogin} onGoToRegister={() => setCurrentScreen('register')} onBack={() => setCurrentScreen('welcome')} />;
    }

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
          return (
            <HistoryScreen 
              userId={userId!} 
              onBack={() => setCurrentScreen('dashboard')} 
              onEdit={(tx) => { 
                setTransactionToEdit(tx); 
                setCurrentScreen('add_transaction'); 
              }} 
            />
          );
        
        case 'add_transaction':
          return (
            <TransactionFormScreen 
              userId={userId!} 
              transaction={transactionToEdit || undefined} 
              onBack={() => {
                setTransactionToEdit(null); 
                setCurrentScreen('history');
              }} 
            />
          );
        case 'accounts':
          return (
            <AccountsScreen 
                userId={userId!} 
                onAdd={() => { setAccountToEdit(null); setCurrentScreen('add_account'); }} 
                onEdit={(acc) => { setAccountToEdit(acc); setCurrentScreen('add_account'); }}
                onBack={() => setCurrentScreen('dashboard')} 
            />
          );
      
        case 'add_account':
          return (
            <AddAccountScreen 
                userId={userId!} 
                account={accountToEdit || undefined} 
                onBack={() => { setAccountToEdit(null); setCurrentScreen('accounts'); }} 
            />
        );
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