import { createContext } from 'react';
import { EventWorkspace } from '../types';

export const EventWorkspaceContext = createContext<EventWorkspace | null>(null);
