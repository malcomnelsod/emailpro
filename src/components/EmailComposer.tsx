import React, { useState } from 'react';
import { Send, Clock, Save, FileText, FileSignature as Signature, Code, Type } from 'lucide-react';
import { Email, EmailTemplate, EmailSignature } from '../types/email';
import { RichTextEditor } from './RichTextEditor';

interface EmailComposerProps {
  templates: EmailTemplate[];
  signatures: EmailSignature[];
  onSend: (email: Omit<Email, 'id' | 'createdAt' | 'status'>) => void;
  onSaveTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  templates,
  signatures,
  onSend,
  onSaveTemplate
}) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isRichText, setIsRichText] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSignatures, setShowSignatures] = useState(false);

  const handleSend = () => {
    if (!to || !subject || !body) return;

    const emailData = {
      to: to.split(',').map(email => email.trim()),
      cc: cc ? cc.split(',').map(email => email.trim()) : undefined,
      bcc: bcc ? bcc.split(',').map(email => email.trim()) : undefined,
      subject,
      body,
      isHtml: isRichText,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined
    };

    onSend(emailData);
    
    // Reset form
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    setScheduledFor('');
    setShowSchedule(false);
  };

  const handleSaveAsTemplate = () => {
    if (!subject || !body) return;

    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    onSaveTemplate({
      name: templateName,
      subject,
      body,
      isHtml: isRichText,
      category: 'Custom'
    });
  };

  const applyTemplate = (template: EmailTemplate) => {
    setSubject(template.subject);
    setBody(template.body);
    setIsRichText(template.isHtml);
    setShowTemplates(false);
  };

  const applySignature = (signature: EmailSignature) => {
    const signatureContent = isRichText && signature.isHtml 
      ? signature.content 
      : signature.isHtml 
        ? signature.content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')
        : signature.content;
    
    if (isRichText) {
      setBody(prev => prev + '<br><br>' + signatureContent);
    } else {
      setBody(prev => prev + '\n\n' + signatureContent);
    }
    setShowSignatures(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Compose Email</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsRichText(!isRichText)}
            className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
              isRichText 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {isRichText ? <Code className="w-4 h-4 mr-2" /> : <Type className="w-4 h-4 mr-2" />}
            {isRichText ? 'Rich Text' : 'Plain Text'}
          </button>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates
          </button>
          <button
            onClick={() => setShowSignatures(!showSignatures)}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Signature className="w-4 h-4 mr-2" />
            Signatures
          </button>
          <button
            onClick={handleSaveAsTemplate}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </button>
        </div>
      </div>

      {showTemplates && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Email Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {templates.map(template => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="text-left p-3 bg-white rounded border hover:border-blue-500 transition-colors"
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-gray-600">{template.category}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showSignatures && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Email Signatures</h3>
          <div className="space-y-2">
            {signatures.map(signature => (
              <button
                key={signature.id}
                onClick={() => applySignature(signature)}
                className="text-left p-3 bg-white rounded border hover:border-blue-500 transition-colors w-full"
              >
                <div className="font-medium">{signature.name}</div>
                <div className="text-sm text-gray-600 whitespace-pre-line">{signature.content}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            multiple
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CC</label>
            <input
              type="email"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BCC</label>
            <input
              type="email"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message {isRichText && <span className="text-xs text-blue-600">(Rich Text)</span>}
          </label>
          {isRichText ? (
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Write your message here..."
              height="200px"
            />
          ) : (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          )}
        </div>

        {showSchedule && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule for</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Clock className="w-4 h-4 mr-2" />
            {showSchedule ? 'Cancel Schedule' : 'Schedule Send'}
          </button>

          <button
            onClick={handleSend}
            disabled={!to || !subject || !body}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4 mr-2" />
            {scheduledFor ? 'Schedule Email' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
};