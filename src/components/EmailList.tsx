import React from 'react';
import { Clock, Eye, MousePointer, Calendar, Bell, BellOff, Code, ExternalLink } from 'lucide-react';
import { Email } from '../types/email';

interface EmailListProps {
  emails: Email[];
  onSnooze: (emailId: string, snoozeUntil: Date) => void;
  onUnsnooze: (emailId: string) => void;
}

export const EmailList: React.FC<EmailListProps> = ({ emails, onSnooze, onUnsnooze }) => {
  const getStatusIcon = (email: Email) => {
    switch (email.status) {
      case 'scheduled':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'snoozed':
        return <Bell className="w-4 h-4 text-orange-500" />;
      case 'sent':
        return <Eye className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (email: Email) => {
    switch (email.status) {
      case 'scheduled':
        return `Scheduled for ${email.scheduledFor?.toLocaleString()}`;
      case 'snoozed':
        return `Snoozed until ${email.snoozedUntil?.toLocaleString()}`;
      case 'sent':
        return `Sent ${email.sentAt?.toLocaleString()}`;
      default:
        return 'Draft';
    }
  };

  const handleSnooze = (emailId: string) => {
    const hours = prompt('Snooze for how many hours?', '2');
    if (hours && !isNaN(Number(hours))) {
      const snoozeUntil = new Date(Date.now() + Number(hours) * 60 * 60 * 1000);
      onSnooze(emailId, snoozeUntil);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800">Email Management</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {emails.map((email) => (
          <div key={email.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(email)}
                  <span className="text-sm text-gray-600">{getStatusText(email)}</span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">{email.subject}</h3>
                <p className="text-sm text-gray-600 mb-2">To: {email.to.join(', ')}</p>
                <div className="text-gray-700 line-clamp-2">
                  {email.isHtml ? (
                    <div className="flex items-center">
                      <Code className="w-4 h-4 mr-1 text-blue-500" />
                      <div dangerouslySetInnerHTML={{ __html: email.body.replace(/<[^>]*>/g, '').substring(0, 100) + '...' }} />
                    </div>
                  ) : (
                    <p>{email.body}</p>
                  )}
                </div>
                
                {email.tracking && email.status === 'sent' && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {email.tracking.opens} opens
                      </div>
                      <div className="flex items-center">
                        <MousePointer className="w-4 h-4 mr-1" />
                        {email.tracking.clicks} clicks
                      </div>
                      {email.tracking.lastOpened && (
                        <span>Last opened: {email.tracking.lastOpened.toLocaleString()}</span>
                      )}
                    </div>
                    
                    {email.tracking.linkClicks && email.tracking.linkClicks.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center mb-1">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Link Clicks:
                        </div>
                        <div className="space-y-1 ml-4">
                          {email.tracking.linkClicks.map((link, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="truncate max-w-xs">{link.url}</span>
                              <span className="font-medium">{link.clicks} clicks</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {email.status === 'snoozed' ? (
                  <button
                    onClick={() => onUnsnooze(email.id)}
                    className="flex items-center px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    <BellOff className="w-4 h-4 mr-1" />
                    Unsnooze
                  </button>
                ) : email.status === 'sent' && (
                  <button
                    onClick={() => handleSnooze(email.id)}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Bell className="w-4 h-4 mr-1" />
                    Snooze
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {emails.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No emails yet. Compose your first email to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};