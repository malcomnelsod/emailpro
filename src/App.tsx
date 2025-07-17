import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { EmailComposer } from './components/EmailComposer';
import { EmailList } from './components/EmailList';
import { Analytics } from './components/Analytics';
import { Templates } from './components/Templates';
import { Settings } from './components/Settings';
import { useEmails } from './hooks/useEmails';

function App() {
  const [activeTab, setActiveTab] = useState('compose');
  const {
    emails,
    templates,
    signatures,
    sendEmail,
    snoozeEmail,
    unsnoozeEmail,
    saveTemplate,
    saveSignature
  } = useEmails();

  const renderContent = () => {
    switch (activeTab) {
      case 'compose':
        return (
          <EmailComposer
            templates={templates}
            signatures={signatures}
            onSend={sendEmail}
            onSaveTemplate={saveTemplate}
          />
        );
      case 'emails':
        return (
          <EmailList
            emails={emails}
            onSnooze={snoozeEmail}
            onUnsnooze={unsnoozeEmail}
          />
        );
      case 'analytics':
        return <Analytics emails={emails} />;
      case 'templates':
        return (
          <Templates
            templates={templates}
            onSaveTemplate={saveTemplate}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;