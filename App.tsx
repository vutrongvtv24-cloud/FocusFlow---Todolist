import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Auth from './components/Auth';
import TaskList from './components/TaskList';
import Pomodoro from './components/Pomodoro';
import CalendarView from './components/CalendarView';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { LogOut, Layout, Globe } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout, t, toggleLanguage, language } = useAppContext();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-white p-2 rounded-lg">
             <Layout size={24} />
          </div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">{t('app_title')}</h1>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-sm font-medium text-dark hover:bg-gray-50 transition-colors"
          >
            <Globe size={14} className="text-primary" />
            <span>{language === 'en' ? 'English' : 'Tiếng Việt'}</span>
          </button>

          <div className="hidden md:flex items-center gap-2">
             {user?.photoURL && (
                 <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-stone-300" />
             )}
             <span className="text-sm font-medium text-dark">{user?.displayName}</span>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors bg-white px-3 py-2 rounded-lg border border-stone-200 shadow-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">{t('sign_out')}</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Desktop) / Bottom (Mobile): Calendar */}
        <div className="lg:col-span-3 space-y-6 order-3 lg:order-1">
          <CalendarView />
          
          <div className="bg-sage/10 p-6 rounded-2xl border border-secondary/20 hidden lg:block">
             <h4 className="font-bold text-secondary mb-2">{t('pro_tip_title')}</h4>
             <p className="text-sm text-dark/70">
               {t('pro_tip_content')}
             </p>
          </div>
        </div>

        {/* Middle Column (Desktop) / Top (Mobile): Task List */}
        <div className="lg:col-span-5 h-full order-1 lg:order-2">
          <TaskList />
        </div>

        {/* Right Column (Desktop) / Middle (Mobile): Pomodoro */}
        <div className="lg:col-span-4 order-2 lg:order-3">
          <div className="sticky top-8">
            <Pomodoro />
          </div>
        </div>
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loadingAuth, currentView } = useAppContext();

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // View Navigation Logic
  if (currentView === 'privacy') return <PrivacyPolicy />;
  if (currentView === 'terms') return <TermsOfService />;
  
  // Default Dashboard/Auth Logic
  return user ? <Dashboard /> : <Auth />;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;