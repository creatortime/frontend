import { useEffect, useState } from 'react';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
    } else {
      alert('Install MetaMask!');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>⏳ CreatorTime dApp</h1>
      <p>Контракт задеплоен по адресу: 0x5FbDB2315678afecb367f032d93F642f64180aa3</p>
      
      <button 
        onClick={connectWallet}
        style={{ 
          background: 'blue', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          marginTop: '20px'
        }}
      >
        {walletAddress ? `Connected: ${walletAddress.slice(0,6)}...` : 'Connect Wallet'}
      </button>
      
      {walletAddress && (
        <div style={{ marginTop: 20, padding: 15, background: '#f0f0f0', borderRadius: 8 }}>
          <h3>🎉 Успех!</h3>
          <p>Ты подключил кошелек к нашему локальному блокчейну!</p>
          <p>Следующий шаг: читать данные из контракта...</p>
        </div>
      )}
    </div>
  );
}
