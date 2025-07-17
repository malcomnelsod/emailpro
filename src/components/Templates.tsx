import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Code, Type } from 'lucide-react';
import { EmailTemplate } from '../types/email';
import { RichTextEditor } from './RichTextEditor';

interface TemplatesProps {
  templates: EmailTemplate[];
  onSaveTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const Templates: React.FC<TemplatesProps> = ({ templates, onSaveTemplate }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'General',
    isHtml: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.body) return;

    onSaveTemplate({
      ...formData,
      isHtml: formData.isHtml
    });

    setFormData({ name: '', subject: '', body: '', category: 'General', isHtml: true });
    setShowForm(false);
  };

  const categories = ['General', 'Sales', 'Support', 'Marketing', 'Onboarding', 'Follow-up'];

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-gray-700 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Email Templates</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </button>
        </div>
      </div>

      {showForm && (
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter template name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Email subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isHtml: !formData.isHtml })}
                  className={`flex items-center px-3 py-1 text-sm rounded-lg transition-colors ${
                    formData.isHtml 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {formData.isHtml ? <Code className="w-4 h-4 mr-2" /> : <Type className="w-4 h-4 mr-2" />}
                  {formData.isHtml ? 'Rich Text' : 'Plain Text'}
                </button>
              </div>
              {formData.isHtml ? (
                <RichTextEditor
                  value={formData.body}
                  onChange={(value) => setFormData({ ...formData, body: value })}
                  placeholder="Template content"
                  height="150px"
                />
              ) : (
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Template content"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No templates yet. Create your first template to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {template.category}
                      </span>
                      {template.isHtml && (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                          <Code className="w-3 h-3 mr-1" />
                          Rich Text
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Preview:</p>
                  <div className="text-sm text-gray-600 line-clamp-3">
                    {template.isHtml ? (
                      <div dangerouslySetInnerHTML={{ 
                        __html: template.body.replace(/<[^>]*>/g, '').substring(0, 150) + '...' 
                      }} />
                    ) : (
                      <p>{template.body}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Created {template.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};