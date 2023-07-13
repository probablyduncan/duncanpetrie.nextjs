import { ViewportProvider } from '@/components/Viewport';
import '@/styles/globals.css'
import React, { createContext } from 'react';

export const ViewportContext = createContext();

export default function App({ Component, pageProps }) {
  
  // suppress useLayoutEffect (and its warnings) when not running in a browser
  if (typeof window === "undefined") React.useLayoutEffect = () => {};
  
  return <ViewportProvider><Component {...pageProps} /></ViewportProvider>
}