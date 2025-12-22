import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogIn, Focus, User, Globe, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';

const Auth: React.FC = () => {
  const { signIn, signInAsGuest, t, toggleLanguage, language } = useAppContext();
  const currentDomain = window.location.hostname;
  
  // Calculate the required Redirect URI
  // Safely access env to avoid crashes if import.meta.env is undefined
  const env = import.meta.env || ({} as any);
  const projectId = env.VITE_FIREBASE_PROJECT_ID || 'todolist-pomo';
  const redirectUri = `https://${projectId}.firebaseapp.com/__/auth/handler`;

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied: ' + text);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8 relative">
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
      </div>

      {/* Troubleshooting Section */}
      <div className="max-w-md w-full mt-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm text-left">
           <div className="flex items-center gap-2 mb-3">
             <AlertCircle className="text-orange-600" size={18} />
             <h3 className="font-bold text-orange-900 text-sm">{t('auth_trouble_title')}</h3>
           </div>
           
           <p className="text-xs text-orange-800 mb-4">{t('auth_trouble_intro')}</p>

           <div className="space-y-4">
             {/* Step 1 */}
             <div>
               <p className="text-xs font-bold text-orange-900 mb-1 flex items-center gap-1">
                 <span className="w-4 h-4 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-[10px]">1</span>
                 {t('auth_step_1_label')}
               </p>
               <p className="text-[10px] text-orange-800/80 mb-1">{t('auth_step_1_desc')}</p>
               <div 
                  onClick={() => copyText(currentDomain)}
                  className="flex items-center justify-between bg-white border border-orange-200 rounded px-2 py-1.5 cursor-pointer hover:border-orange-400 transition-colors group"
                >
                  <code className="font-mono text-[10px] text-orange-800 break-all">{currentDomain}</code>
                  <Copy size={12} className="text-orange-300 group-hover:text-orange-500 flex-shrink-0 ml-2" />
                </div>
             </div>

             {/* Step 2 */}
             <div>
               <p className="text-xs font-bold text-orange-900 mb-1 flex items-center gap-1">
                 <span className="w-4 h-4 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-[10px]">2</span>
                 {t('auth_step_2_label')}
               </p>
               <p className="text-[10px] text-orange-800/80 mb-1">{t('auth_step_2_desc')}</p>
               <div 
                  onClick={() => copyText(redirectUri)}
                  className="flex items-center justify-between bg-white border border-orange-200 rounded px-2 py-1.5 cursor-pointer hover:border-orange-400 transition-colors group"
                >
                  <code className="font-mono text-[10px] text-orange-800 break-all leading-tight">{redirectUri}</code>
                  <Copy size={12} className="text-orange-300 group-hover:text-orange-500 flex-shrink-0 ml-2" />
                </div>
             </div>
           </div>
           
           <div className="mt-4 pt-3 border-t border-orange-200/60 text-center">
             <p className="text-[10px] text-orange-700 italic">
               {t('auth_trouble_guest')}
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;