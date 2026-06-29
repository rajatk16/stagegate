export interface KeyboardShortcut {
  key: string;
  alt?: boolean;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  preventDefault?: boolean;
}

export interface CommandDefinition {
  id: string;
  enabled?: boolean;
  handler: () => void;
  shortcut: KeyboardShortcut;
}
