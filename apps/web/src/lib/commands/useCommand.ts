import { useEffect } from 'react';

import { registerCommand } from './registry';
import type { CommandDefinition } from './types';
import { useKeyboardShortcut } from './useKeyboardShortcut';

export const useCommand = (command: CommandDefinition) => {
  useKeyboardShortcut(command.shortcut, command.handler);

  useEffect(() => {
    return registerCommand(command);
  }, [command]);
};
