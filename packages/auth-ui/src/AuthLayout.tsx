import React from 'react';
import type { AuthLayoutProps } from './types';

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
        </div>
        <div className="bg-white py-8 px-6 rounded-lg shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
