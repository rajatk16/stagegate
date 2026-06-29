import type { CommandDefinition } from './types';

const commands = new Map<string, CommandDefinition>();

export const registerCommand = (command: CommandDefinition) => {
  commands.set(command.id, command);
  return () => {
    commands.delete(command.id);
  };
};

export const getCommands = () => [...commands.values()];
