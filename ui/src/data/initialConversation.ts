import { ChatMessageItem } from '../types';

// Start every session with an empty transcript. Suggested questions remain available in the empty state.
export const INITIAL_CONVERSATION_DATA: ChatMessageItem[] = [];

export const SUGGESTED_QUESTIONS_LIST = [
  { icon: 'key', title: 'How do I access Self-Service Banner?', category: 'IT & Banner Services' },
  { icon: 'book', title: 'Where can I find course information?', category: 'Courses & Registration' },
  { icon: 'dollar', title: 'What scholarships are available?', category: 'Scholarships & Financial Aid' },
  { icon: 'pin', title: 'Where is the Patrick Power Library?', category: 'Campus Life & Library' },
  { icon: 'calendar', title: 'How can I view my student schedule?', category: 'Courses & Registration' },
];
