import { initializeDatabase } from './init';
import * as notes from './notes';
import * as topics from './topics';
import * as tags from './tags';
import * as note_links from './note_links';
import * as types from './types';

export type CoreStatus = {
  message: string;
  timestamp: string;
};

export function getWelcomeMessage(): CoreStatus {
  return {
    message: 'Welcome to Mnemo Core',
    timestamp: new Date().toISOString()
  };
}

export function setupCore() {
  return initializeDatabase();
}

export { notes, topics, tags, note_links, types };
