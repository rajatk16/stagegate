import { useEffect } from 'react';
import type { CommandDefinition } from './types';
import { useKeyboardShortcut } from './useKeyboardShortcut';
import { registerCommand } from './registry';

export const useCommand = (command: CommandDefinition) => {
  useKeyboardShortcut(command.shortcut, command.handler);

  useEffect(() => {
    return registerCommand(command);
  }, [command]);
};
