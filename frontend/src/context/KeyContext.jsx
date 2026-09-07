import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getStoredGroqKey, 
  setStoredGroqKey, 
  setActiveUserId, 
  isBYOKPromptDismissed, 
  setBYOKPromptDismissed 
} from '../lib/api';
import { useAuth } from './AuthContext';

const KeyContext = createContext(null);

export function KeyProvider({ children }) {
  const { user } = useAuth();
  const [groqKey, setGroqKey] = useState(getStoredGroqKey(user?.id));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setActiveUserId(user.id);
    }
    const currentKey = getStoredGroqKey(user?.id);
    setGroqKey(currentKey);

    if (user?.id) {
      const dismissed = isBYOKPromptDismissed(user.id);
      if (!currentKey && !dismissed) {
        const timer = setTimeout(() => {
          setIsModalOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.id]);

  const saveKey = (newKey) => {
    const trimmed = newKey ? newKey.trim() : '';
    setStoredGroqKey(user?.id, trimmed);
    setGroqKey(trimmed);
    if (user?.id) {
      setBYOKPromptDismissed(user.id);
    }
    setIsModalOpen(false);
  };

  const clearKey = () => {
    setStoredGroqKey(user?.id, '');
    setGroqKey('');
  };

  const dismissModal = () => {
    if (user?.id) {
      setBYOKPromptDismissed(user.id);
    }
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return (
    <KeyContext.Provider
      value={{
        groqKey,
        saveKey,
        clearKey,
        hasKey: Boolean(groqKey && groqKey.trim()),
        isModalOpen,
        openModal,
        closeModal: () => setIsModalOpen(false),
        dismissModal
      }}
    >
      {children}
    </KeyContext.Provider>
  );
}

export function useBYOK() {
  return useContext(KeyContext);
}
