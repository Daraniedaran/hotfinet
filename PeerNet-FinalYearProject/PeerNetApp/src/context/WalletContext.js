import React, { createContext, useState } from 'react';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [coins, setCoins] = useState(50);

  const addCoins = (amount) => {
    setCoins(prev => prev + amount);
  };

  const deductCoins = (amount) => {
    if (coins >= amount) {
      setCoins(prev => prev - amount);
      return true;
    }
    return false;
  };

  return (
    <WalletContext.Provider
      value={{ coins, addCoins, deductCoins }}
    >
      {children}
    </WalletContext.Provider>
  );
};
