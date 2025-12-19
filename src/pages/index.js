import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import CreatorTokenABI from '../contracts/CreatorTokenABI.json';
import contractAddress from '../contracts/contract-address.json';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Форма регистрации
  const [category, setCategory] = useState('youtube');
  const [profileId, setProfileId] = useState('');
  
  // Информация о создателе
  const [creatorInfo, setCreatorInfo] = useState(null);
  
  const contractAddr = contractAddress.CreatorToken;
  const categories = ['youtube', 'github', 'twitter', 'twitch', 'instagram', 'tiktok', 'medium', 'art', 'music', 'writing'];

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setWalletAddress(accounts[0]);
        console.log('Connected:', accounts[0]);
        // После подключения читаем данные и проверяем регистрацию
        readContractData();
        checkIfRegistered(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const readContractData = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddr, CreatorTokenABI, provider);
      
      const name = await contract.name();
      const symbol = await contract.symbol();
      const supply = await contract.totalSupply();
      
      setTokenName(name);
      setTokenSymbol(symbol);
      setTotalSupply(ethers.utils.formatUnits(supply, 18));
    } catch (error) {
      console.error('Error reading contract:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Проверяем, зарегистрирован ли пользователь
  const checkIfRegistered = async (address) => {
    if (!address) return;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddr, CreatorTokenABI, provider);
      
      const info = await contract.creators(address);
      
      if (info.isActive) {
        setCreatorInfo({
          category: info.category,
          profileId: info.profileId,
          reputation: info.reputation.toString(),
          totalEarned: ethers.utils.formatUnits(info.totalEarned, 18)
        });
      } else {
        setCreatorInfo(null);
      }
    } catch (error) {
      console.error('Error checking registration:', error);
    }
  };

  // Регистрация создателя
  const registerCreator = async () => {
    if (!walletAddress) {
      alert('Please connect wallet first!');
      return;
    }
    
    if (!category || !profileId) {
      alert('Please fill all fields');
      return;
    }
    
    setIsRegistering(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddr, CreatorTokenABI, signer);
      
      // Отправляем транзакцию
      const tx = await contract.registerCreator(category, profileId);
      console.log('Transaction sent:', tx.hash);
      
      // Ждем подтверждения
      await tx.wait();
      console.log('Transaction confirmed!');
      
      alert('🎉 Successfully registered as creator!');
      
      // Обновляем информацию
      checkIfRegistered(walletAddress);
      
    } catch (error) {
      console.error('Error registering:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      readContractData();
      checkIfRegistered(walletAddress);
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
        </div>
      )}
      
      {/* Форма регистрации */}
      {walletAddress && !creatorInfo && (
        <div style={{ 
          marginTop: 40, 
          padding: 25, 
          background: '#fef3c7', 
          borderRadius: 12,
          border: '1px solid #f59e0b'
        }}>
          <h2 style={{ color: '#92400e' }}>🚀 Register as Creator</h2>
          
          <div style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: 15 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
                Profile ID / Username:
              </label>
              <input
                type="text"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                placeholder="your_username"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db'
                }}
              />
            </div>
            
            <button
              onClick={registerCreator}
              disabled={isRegistering || !profileId}
              style={{
                background: '#f59e0b',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                width: '100%',
                fontSize: '16px',
                cursor: isRegistering ? 'not-allowed' : 'pointer',
                opacity: (!profileId || isRegistering) ? 0.7 : 1
              }}
            >
              {isRegistering ? 'Registering...' : 'Register as Creator'}
            </button>
            
            <p style={{ marginTop: 10, fontSize: '14px', color: '#92400e' }}>
              ⚡ Registration is free! After registration you can claim daily CTK tokens.
            </p>
          </div>
        </div>
      )}
      
      {/* Информация о создателе (если зарегистрирован) */}
      {walletAddress && creatorInfo && (
        <div style={{ 
          marginTop: 40, 
          padding: 25, 
          background: '#d1fae5', 
          borderRadius: 12,
          border: '1px solid #10b981'
        }}>
          <h2 style={{ color: '#065f46' }}>✅ Registered Creator</h2>
          
          <div style={{ marginTop: 20 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #10b981'
            }}>
              <span style={{ fontWeight: 'bold' }}>Category:</span>
              <span style={{ textTransform: 'capitalize' }}>{creatorInfo.category}</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #10b981'
            }}>
              <span style={{ fontWeight: 'bold' }}>Profile ID:</span>
              <span>@{creatorInfo.profileId}</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #10b981'
            }}>
              <span style={{ fontWeight: 'bold' }}>Reputation:</span>
              <span>{creatorInfo.reputation} points</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: '10px 0'
            }}>
              <span style={{ fontWeight: 'bold' }}>Total Earned:</span>
              <span>{creatorInfo.totalEarned} CTK</span>
            </div>
          </div>
          
          <button
            onClick={() => alert('Claim function coming soon!')}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              width: '100%',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            🎁 Claim Daily CTK (Coming Soon)
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
        <h3>📋 How to Test Registration:</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Connect wallet with MetaMask</li>
          <li>Select your category (YouTube, GitHub, etc.)</li>
          <li>Enter your profile username</li>
          <li>Click "Register as Creator"</li>
          <li>Confirm transaction in MetaMask</li>
          <li>Wait for confirmation (few seconds)</li>
          <li>See your creator status update!</li>
        </ol>
      </div>
    </div>
  );
}
