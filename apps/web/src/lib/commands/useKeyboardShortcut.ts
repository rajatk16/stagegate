import { useEffect } from 'react';

import type { KeyboardShortcut } from './types';

const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut) => {
  const modifierMatch =
    (shortcut.meta === undefined ||
      event.metaKey === shortcut.meta ||
      event.ctrlKey === shortcut.ctrl) &&
    (shortcut.shift === undefined || event.shiftKey === shortcut.shift) &&
    (shortcut.alt === undefined || event.altKey === shortcut.alt);

  return (
    modifierMatch && event.key.toLowerCase() === shortcut.key.toLowerCase()
  );
};

export const useKeyboardShortcut = (
  shortcut: KeyboardShortcut,
  handler: () => void,
) => {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (!matchesShortcut(event, shortcut)) return;

      if (shortcut.preventDefault) {
        event.preventDefault();
      }

      handler();
    };

    window.addEventListener('keydown', listener);

    return () => window.removeEventListener('keydown', listener);
  }, [shortcut, handler]);
};
