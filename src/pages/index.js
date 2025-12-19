import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Импортируем ABI и адрес контракта
import CreatorTokenABI from '../contracts/CreatorTokenABI.json';
import contractAddress from '../contracts/contract-address.json';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Адрес нашего задеплоенного контракта
  const contractAddr = contractAddress.CreatorToken;

  // Функция подключения кошелька
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setWalletAddress(accounts[0]);
        console.log('Connected:', accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Функция чтения данных из контракта
  const readContractData = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    try {
      // 1. Подключаемся к провайдеру MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // 2. Создаем объект контракта
      const contract = new ethers.Contract(
        contractAddr, 
        CreatorTokenABI, 
        provider
      );
      
      // 3. Читаем данные из контракта
      const name = await contract.name();
      const symbol = await contract.symbol();
      const supply = await contract.totalSupply();
      
      // 4. Преобразуем big number в читаемый формат
      const formattedSupply = ethers.utils.formatUnits(supply, 18);
      
      // 5. Сохраняем данные в state
      setTokenName(name);
      setTokenSymbol(symbol);
      setTotalSupply(formattedSupply);
      
    } catch (error) {
      console.error('Error reading contract:', error);
      alert('Error reading contract. Make sure you have the right network!');
    } finally {
      setIsLoading(false);
    }
  };

  // Когда кошелек подключается, читаем данные
  useEffect(() => {
    if (walletAddress) {
      readContractData();
    }
  }, [walletAddress]);

  return (
    <div style={{ 
      padding: 40, 
      fontFamily: 'Arial, sans-serif',
      maxWidth: 800,
      margin: '0 auto'
    }}>
      <h1>⏳ CreatorTime dApp</h1>
      <p><strong>Contract Address:</strong> {contractAddr}</p>
      
      {/* Кнопка подключения кошелька */}
      <button 
        onClick={connectWallet}
        style={{ 
          background: '#3b82f6', 
          color: 'white', 
          padding: '12px 24px', 
          border: 'none', 
          borderRadius: '8px',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        {walletAddress ? `Connected: ${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
      </button>
      
      {/* Данные контракта */}
      {walletAddress && (
        <div style={{ 
          marginTop: 40, 
          padding: 25, 
          background: '#f8fafc', 
          borderRadius: 12,
          border: '1px solid #e2e8f0'
        }}>
          <h2 style={{ color: '#1e293b' }}>📊 Token Information</h2>
          
          {isLoading ? (
            <p>Loading token data...</p>
          ) : (
            <div style={{ marginTop: 20 }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <span style={{ fontWeight: 'bold' }}>Token Name:</span>
                <span style={{ color: '#3b82f6' }}>{tokenName || 'Not loaded'}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <span style={{ fontWeight: 'bold' }}>Token Symbol:</span>
                <span style={{ color: '#10b981' }}>{tokenSymbol || 'Not loaded'}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '10px 0'
              }}>
                <span style={{ fontWeight: 'bold' }}>Total Supply:</span>
                <span>{totalSupply || '0'} {tokenSymbol}</span>
              </div>
            </div>
          )}
          
          <button 
            onClick={readContractData}
            disabled={isLoading}
            style={{ 
              background: '#8b5cf6', 
              color: 'white', 
              padding: '10px 20px', 
              border: 'none', 
              borderRadius: '6px',
              marginTop: '20px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>
      )}
      
      {/* Инструкция */}
      <div style={{ 
        marginTop: 40, 
        padding: 20, 
        background: '#f0f9ff', 
        borderRadius: 8,
        border: '1px solid #bae6fd'
      }}>
        <h3>📋 How to Test:</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Install <a href="https://metamask.io/" target="_blank">MetaMask</a> browser extension</li>
          <li>Click "Connect Wallet" button above</li>
          <li>Add Hardhat network to MetaMask:
            <ul style={{ marginLeft: 20, marginTop: 5 }}>
              <li><strong>Network Name:</strong> Hardhat Local</li>
              <li><strong>RPC URL:</strong> http://127.0.0.1:8545</li>
              <li><strong>Chain ID:</strong> 31337</li>
              <li><strong>Currency Symbol:</strong> ETH</li>
            </ul>
          </li>
          <li>Import test account from Hardhat terminal (private key)</li>
          <li>See token data loaded from blockchain!</li>
        </ol>
      </div>
    </div>
  );
}
