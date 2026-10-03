export interface SourceReference {
  title: string;
  url: string;
  type: string;
  thumbnail?: string;
  description?: string;
  lastUpdated?: string;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  confidence?: number;
  sources?: SourceReference[];
  suggestedFollowUps?: string[];
  category?: string;
  model?: string;
}

export type AppStateView = 'portal' | 'empty' | 'conversation';

export type CategoryOption = 
  | 'All categories'
  | 'Admissions & Tuition'
  | 'Courses & Registration'
  | 'Scholarships & Financial Aid'
  | 'Campus Life & Library'
  | 'IT & Banner Services';
