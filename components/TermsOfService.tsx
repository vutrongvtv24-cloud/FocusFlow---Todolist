import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsOfService: React.FC = () => {
  const { navigateTo } = useAppContext();

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
          <div className="p-3 bg-secondary/10 rounded-full">
            <FileText className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold text-dark">Terms of Service</h1>
        </div>

        <p className="text-gray-500 mb-8 text-sm">Last updated: October 26, 2023</p>

        <div className="space-y-6 text-dark/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-dark mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using <strong>FocusFlow</strong> ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">2. Description of Service</h2>
            <p>
              FocusFlow is a productivity tool designed to help users manage tasks using the Ivy Lee Method and Pomodoro Technique. We provide features such as task creation, timer functionality, and calendar synchronization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">3. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for maintaining the confidentiality of your account and password (Google Account credentials).</li>
              <li>You agree not to use the Service for any illegal or unauthorized purpose.</li>
              <li>You agree not to attempt to hack, destabilize, or adapt the Service's infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">4. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are and will remain the exclusive property of FocusFlow and its licensors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">5. Termination</h2>
            <p>
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">6. Limitation of Liability</h2>
            <p>
              In no event shall FocusFlow, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">7. Disclaimer</h2>
            <p>
              Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-dark mb-3">8. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;