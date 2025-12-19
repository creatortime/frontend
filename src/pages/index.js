import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import CreatorTokenABI from '../contracts/CreatorTokenABI.json';

const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // 1. Подключение кошелька
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        alert(`Кошелек подключен: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      } catch (error) {
        console.error("Ошибка подключения:", error);
      }
    } else {
      alert("Установите MetaMask!");
    }
  };

  // 2. Чтение данных контракта
  const fetchTokenData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CreatorTokenABI, provider);
    const name = await contract.name();
    const symbol = await contract.symbol();
    setTokenName(name);
    setTokenSymbol(symbol);
  };

  // 3. Регистрация создателя (упрощенно)
  const registerCreator = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CreatorTokenABI, signer);
    try {
      const tx = await contract.registerCreator("youtube", "my_channel");
      await tx.wait();
      alert("✅ Вы успешно зарегистрированы как создатель!");
    } catch (error) {
      alert("Ошибка: " + error.message);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>⏳ CreatorTime dApp</h1>
      <p>Адрес контракта: {CONTRACT_ADDRESS}</p>

      {!isConnected ? (
        <button onClick={connectWallet} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Подключить MetaMask
        </button>
      ) : (
        <div>
          <p>✅ Подключен: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
          <button onClick={fetchTokenData} style={{ margin: '10px' }}>
            Загрузить данные токена
          </button>
          {tokenName && <p>Название токена: <strong>{tokenName}</strong></p>}
          {tokenSymbol && <p>Символ: <strong>{tokenSymbol}</strong></p>}

          <hr />
          <h3>Регистрация создателя:</h3>
          <button onClick={registerCreator} style={{ background: 'gold', padding: '10px 20px' }}>
            Зарегистрироваться (как YouTube-автор)
          </button>
        </div>
      )}

      <div style={{ marginTop: '30px', background: '#f0f0f0', padding: '20px' }}>
        <h4>Инструкция:</h4>
        <ol>
          <li>Подключите MetaMask к сети Hardhat (RPC: http://127.0.0.1:8545, Chain ID: 31337)</li>
          <li>Импортируйте тестовый аккаунт из терминала Hardhat</li>
          <li>Нажмите "Подключить MetaMask"</li>
          <li>Загрузите данные токена и зарегистрируйтесь!</li>
        </ol>
      </div>
    </div>
  );
}
