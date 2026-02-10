import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { WalletProvider } from './src/context/WalletContext';

const App = () => {
  return (
    <WalletProvider>
      <AppNavigator />
    </WalletProvider>
  );
};

export default App;
