import { initializeDatabase } from './init';

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
