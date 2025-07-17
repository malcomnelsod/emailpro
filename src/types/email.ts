export interface Email {
  id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml: boolean;
  scheduledFor?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'snoozed';
  createdAt: Date;
  sentAt?: Date;
  snoozedUntil?: Date;
  templateId?: string;
  tracking?: EmailTracking;
}

export interface EmailTracking {
  opens: number;
  clicks: number;
  linkClicks: LinkClick[];
  lastOpened?: Date;
  lastClicked?: Date;
  recipients: TrackingRecipient[];
}

export interface LinkClick {
  url: string;
  clicks: number;
  lastClicked: Date;
  recipients: string[];
}

export interface TrackingRecipient {
  email: string;
  opened: boolean;
  clicked: boolean;
  openCount: number;
  clickCount: number;
  linkClicks: { url: string; count: number }[];
  lastOpened?: Date;
  lastClicked?: Date;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isHtml: boolean;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailSignature {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  isHtml: boolean;
  createdAt: Date;
  updatedAt: Date;
}