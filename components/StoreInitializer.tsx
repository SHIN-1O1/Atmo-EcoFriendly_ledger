"use client";

import { useEffect } from 'react';
import { useEcoStore } from '@/store/ecoStore';

export default function StoreInitializer() {
  const initializeStore = useEcoStore((state) => state.initializeStore);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  return null;
}
