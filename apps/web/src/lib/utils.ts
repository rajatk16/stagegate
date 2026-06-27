import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const lazyImport = <
  T extends Record<string, ComponentType<unknown>>,
  K extends keyof T,
>(
  factory: () => Promise<T>,
  name: K,
): LazyExoticComponent<T[K]> =>
  lazy(() => factory().then((module) => ({ default: module[name] })));
