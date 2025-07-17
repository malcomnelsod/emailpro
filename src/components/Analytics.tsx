import React from 'react';
import { BarChart3, TrendingUp, Eye, MousePointer, Mail, Clock, ExternalLink, Code } from 'lucide-react';
import { Email } from '../types/email';

interface AnalyticsProps {
  emails: Email[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ emails }) => {
  const sentEmails = emails.filter(email => email.status === 'sent');
  const scheduledEmails = emails.filter(email => email.status === 'scheduled');
  const snoozedEmails = emails.filter(email => email.status === 'snoozed');
  
  const totalOpens = sentEmails.reduce((sum, email) => sum + (email.tracking?.opens || 0), 0);
  const totalClicks = sentEmails.reduce((sum, email) => sum + (email.tracking?.clicks || 0), 0);
  const totalLinkClicks = sentEmails.reduce((sum, email) => 
    sum + (email.tracking?.linkClicks?.reduce((linkSum, link) => linkSum + link.clicks, 0) || 0), 0
  );
  const richTextEmails = sentEmails.filter(email => email.isHtml).length;
  
  const openRate = sentEmails.length > 0 ? (totalOpens / sentEmails.length).toFixed(1) : '0';
  const clickRate = sentEmails.length > 0 ? (totalClicks / sentEmails.length).toFixed(1) : '0';
  const richTextRate = sentEmails.length > 0 ? ((richTextEmails / sentEmails.length) * 100).toFixed(1) : '0';

  const stats = [
    {
      label: 'Total Sent',
      value: sentEmails.length,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Scheduled',
      value: scheduledEmails.length,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Total Opens',
      value: totalOpens,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Total Clicks',
      value: totalClicks,
      icon: MousePointer,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Link Clicks',
      value: totalLinkClicks,
      icon: ExternalLink,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Rich Text',
      value: `${richTextRate}%`,
      icon: Code,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="w-6 h-6 text-gray-700 mr-2" />
        <h2 className="text-2xl font-bold text-gray-800">Email Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Performance Metrics</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Open Rate</span>
                <span className="text-sm font-bold text-gray-900">{openRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(Number(openRate), 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Click Rate</span>
                <span className="text-sm font-bold text-gray-900">{clickRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(Number(clickRate), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {sentEmails.slice(0, 5).map((email) => (
              <div key={email.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900 truncate">{email.subject}</p>
                    {email.isHtml && <Code className="w-3 h-3 ml-2 text-blue-500" />}
                  </div>
                  <p className="text-xs text-gray-600">{email.sentAt?.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {email.tracking?.opens || 0}
                  </span>
                  <span className="flex items-center">
                    <MousePointer className="w-3 h-3 mr-1" />
                    {email.tracking?.clicks || 0}
                  </span>
                  {email.tracking?.linkClicks && email.tracking.linkClicks.length > 0 && (
                    <span className="flex items-center">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {email.tracking.linkClicks.reduce((sum, link) => sum + link.clicks, 0)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {sentEmails.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No sent emails yet</p>
            )}
          </div>
        </div>

        {/* Top Clicked Links */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <ExternalLink className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Top Clicked Links</h3>
          </div>
          <div className="space-y-3">
            {sentEmails
              .flatMap(email => email.tracking?.linkClicks || [])
              .sort((a, b) => b.clicks - a.clicks)
              .slice(0, 5)
              .map((link, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{link.url}</p>
                  <p className="text-xs text-gray-600">Last clicked: {link.lastClicked.toLocaleString()}</p>
                </div>
                <div className="text-sm font-bold text-purple-600">
                  {link.clicks} clicks
                </div>
              </div>
            ))}
            {sentEmails.flatMap(email => email.tracking?.linkClicks || []).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No link clicks yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};