import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const { navigateTo, t } = useAppContext();

  return (
    <div className="min-h-screen bg-background p-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-secondary/20">
        <button 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 text-dark/60 hover:text-primary transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-dark">Privacy Policy</h1>
        </div>
        
        <p className="text-gray-500 mb-8 text-sm">Last updated: October 26, 2023</p>

        <div className="space-y-6 text-dark/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-dark mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>FocusFlow</strong>. We value your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our productivity application 
              featuring the Ivy Lee Method and Pomodoro Timer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Authentication Data:</strong> When you sign in with Google, we collect your email address, display name, and profile picture to create your account and personalize your experience.</li>
              <li><strong>User Content:</strong> We store the tasks you create, their completion status, and the dates associated with them.</li>
              <li><strong>Usage Data:</strong> We may collect anonymous usage statistics (such as Pomodoro timer usage) to improve the app.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">3. How We Use Your Data</h2>
            <p>
              We use your data solely to provide the core functionality of the application:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>To manage your daily task lists and history.</li>
              <li>To sync your data across devices using Firebase.</li>
              <li>To integrate with Google Calendar (only upon your specific request).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">4. Google Calendar Integration</h2>
            <p>
              FocusFlow offers an optional feature to sync tasks to your Google Calendar. 
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Permissions:</strong> We request the minimum scope required (`calendar.events`) to create events.</li>
              <li><strong>Usage:</strong> We only <em>write</em> events to your calendar based on your tasks. We do not read, delete, or analyze your existing calendar events.</li>
              <li><strong>Storage:</strong> We do not store your Google Calendar data on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">5. Data Storage & Security</h2>
            <p>
              Your data is stored securely using <strong>Google Firebase</strong>. We implement security measures designed to protect your data from unauthorized access. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">6. Cookies & Local Storage</h2>
            <p>
              We use local storage and cookies to maintain your login session and store preferences (such as your guest mode tasks).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@focusflow.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;