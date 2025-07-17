import { useState, useEffect } from 'react';
import { Email, EmailTemplate, EmailSignature } from '../types/email';

// Mock data for demonstration
const mockEmails: Email[] = [
  {
    id: '1',
    to: ['john@example.com'],
    subject: 'Project Update',
    body: 'Here is the latest update on our project...',
    isHtml: false,
    status: 'sent',
    createdAt: new Date('2024-01-15T10:00:00'),
    sentAt: new Date('2024-01-15T10:05:00'),
    tracking: {
      opens: 3,
      clicks: 1,
      linkClicks: [
        {
          url: 'https://example.com/project',
          clicks: 1,
          lastClicked: new Date('2024-01-15T14:32:00'),
          recipients: ['john@example.com']
        }
      ],
      lastOpened: new Date('2024-01-15T14:30:00'),
      lastClicked: new Date('2024-01-15T14:32:00'),
      recipients: [{
        email: 'john@example.com',
        opened: true,
        clicked: true,
        openCount: 3,
        clickCount: 1,
        linkClicks: [{ url: 'https://example.com/project', count: 1 }],
        lastOpened: new Date('2024-01-15T14:30:00'),
        lastClicked: new Date('2024-01-15T14:32:00')
      }]
    }
  },
  {
    id: '2',
    to: ['sarah@example.com'],
    subject: 'Meeting Tomorrow',
    body: 'Don\'t forget about our meeting tomorrow at 2 PM.',
    isHtml: false,
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-01-16T09:00:00'),
  },
  {
    id: '3',
    to: ['team@example.com'],
    subject: 'Weekly Report',
    body: 'Please find the weekly report attached.',
    isHtml: false,
    status: 'snoozed',
    snoozedUntil: new Date(Date.now() + 2 * 60 * 60 * 1000),
    createdAt: new Date('2024-01-16T08:00:00'),
  }
];

const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to our service!',
    body: 'Thank you for joining us. We\'re excited to have you on board!',
    isHtml: false,
    category: 'Onboarding',
    createdAt: new Date('2024-01-10T10:00:00'),
    updatedAt: new Date('2024-01-10T10:00:00')
  },
  {
    id: '2',
    name: 'Follow Up',
    subject: 'Following up on our conversation',
    body: 'Hi there,\n\nI wanted to follow up on our recent conversation...',
    isHtml: false,
    category: 'Sales',
    createdAt: new Date('2024-01-12T14:00:00'),
    updatedAt: new Date('2024-01-12T14:00:00')
  }
];

const mockSignatures: EmailSignature[] = [
  {
    id: '1',
    name: 'Professional',
    content: 'Best regards,\nJohn Doe\nSenior Developer\ncompany@example.com\n+1 (555) 123-4567',
    isDefault: true,
    isHtml: false,
    createdAt: new Date('2024-01-01T10:00:00'),
    updatedAt: new Date('2024-01-01T10:00:00')
  }
];

export const useEmails = () => {
  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockTemplates);
  const [signatures, setSignatures] = useState<EmailSignature[]>(mockSignatures);

  const sendEmail = (email: Omit<Email, 'id' | 'createdAt' | 'status'>) => {
    const newEmail: Email = {
      ...email,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: email.scheduledFor ? 'scheduled' : 'sent',
      sentAt: email.scheduledFor ? undefined : new Date()
    };
    setEmails(prev => [newEmail, ...prev]);
    return newEmail;
  };

  const snoozeEmail = (emailId: string, snoozeUntil: Date) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId 
        ? { ...email, status: 'snoozed', snoozedUntil }
        : email
    ));
  };

  const unsnoozeEmail = (emailId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId 
        ? { ...email, status: 'draft', snoozedUntil: undefined }
        : email
    ));
  };

  const saveTemplate = (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  };

  const saveSignature = (signature: Omit<EmailSignature, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSignature: EmailSignature = {
      ...signature,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSignatures(prev => [newSignature, ...prev]);
    return newSignature;
  };

  return {
    emails,
    templates,
    signatures,
    sendEmail,
    snoozeEmail,
    unsnoozeEmail,
    saveTemplate,
    saveSignature
  };
};