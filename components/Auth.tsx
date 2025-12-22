import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogIn, Focus, User, Globe, AlertCircle, Copy } from 'lucide-react';

const Auth: React.FC = () => {
  const { signIn, signInAsGuest, t, toggleLanguage, language } = useAppContext();
  const currentDomain = window.location.hostname;

  const copyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    alert('Copied to clipboard: ' + currentDomain);
  };

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
            className="w-full flex items-center justify-center gap-3 bg-secondary text-white border border-transparent py-3 px-6 rounded-lg hover:bg-secondary/90 transition-all duration-200 shadow-md ring-2 ring-secondary/20"
          >
            <User size={20} />
            <span>{t('continue_guest')}</span>
          </button>
        </div>
        
        <div className="mt-8 text-xs text-gray-400">
          <p>{t('auth_limit_msg')}</p>
          <p>{t('auth_focus_msg')}</p>
        </div>

        {/* Detailed Guide for Error 400 */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-left">
          <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-orange-900">
              <p className="font-bold mb-2 text-sm">{t('auth_trouble_title')}</p>
              <p className="mb-2">{t('auth_trouble_desc')}</p>
              
              <ol className="list-decimal list-inside space-y-1.5 mb-3 ml-1 text-orange-800/80">
                <li>{t('auth_step_1')}</li>
                <li>{t('auth_step_2')}</li>
                <li>{t('auth_step_3')}</li>
              </ol>

              <div 
                onClick={copyDomain}
                className="flex items-center justify-between bg-white border border-orange-200 rounded p-2 mb-3 cursor-pointer hover:border-orange-400 transition-colors group"
                title="Click to copy"
              >
                <code className="font-mono text-orange-800 break-all">{currentDomain}</code>
                <Copy size={14} className="text-orange-300 group-hover:text-orange-500" />
              </div>

              <p className="text-orange-800/60 italic border-t border-orange-100 pt-2 mt-2">
                {t('auth_trouble_guest')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;