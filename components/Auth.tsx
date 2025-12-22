import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogIn, Focus, User, Globe } from 'lucide-react';

const Auth: React.FC = () => {
  const { signIn, signInAsGuest, t, toggleLanguage, language } = useAppContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
      {/* Language Toggle in top right */}
      <button 
        onClick={toggleLanguage}
        className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-sm font-medium text-dark hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Globe size={14} className="text-primary" />
        <span>{language === 'en' ? 'English' : 'Tiếng Việt'}</span>
      </button>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-secondary/20">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full">
            <Focus className="w-12 h-12 text-primary" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-dark mb-2">{t('app_title')}</h1>
        <p className="text-gray-500 mb-8 font-light">
          {t('auth_subtitle')}
        </p>

        <div className="space-y-4">
          <button
            onClick={signIn}
            className="w-full flex items-center justify-center gap-3 bg-dark text-white py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <LogIn size={20} />
            <span>{t('signin_google')}</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">{t('or')}</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <button
            onClick={signInAsGuest}
            className="w-full flex items-center justify-center gap-3 bg-white text-dark border border-stone-200 py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            <User size={20} />
            <span>{t('continue_guest')}</span>
          </button>
        </div>
        
        <div className="mt-8 text-xs text-gray-400">
          <p>{t('auth_limit_msg')}</p>
          <p>{t('auth_focus_msg')}</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;