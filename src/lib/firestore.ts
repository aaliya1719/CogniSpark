import { Firestore } from '@google-cloud/firestore';

// Initialize Firestore
// It will automatically use the project ID from the environment or Application Default Credentials
export const db = new Firestore();

export const COLLECTIONS = {
  USERS: 'users',
  TODOS: 'todos',
  FLASHCARDS: 'flashcards',
  RECAPS: 'dailyRecaps',
};
