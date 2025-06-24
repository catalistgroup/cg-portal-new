'use client';

import * as React from 'react';
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';
import { Toaster } from './ui/sonner';
import { Toaster as ToastToaster } from '@/components/Toast';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
      <Toaster />
      <ToastToaster />
    </NextThemesProvider>
  );
}
