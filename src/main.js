import { calculateBalance, generateSmartTip } from './finance.js';
import { renderBalance, renderTransactions, renderChart, renderEvolutionChart, renderStats, setupModal } from './ui.js';
import { addTransactionToFirebase, getTransactionsFromFirebase } from './firebase-service.js';
import { loginWithGoogle, logout, onAuthChange } from './auth.js';

let transactions = [];
let currentUser = null;

const updateUI = () => {
  const balance = calculateBalance(transactions);
  renderBalance(balance);
  renderTransactions(transactions);
  renderChart(transactions);
  renderEvolutionChart(transactions);
  renderStats(transactions);

  const tip = generateSmartTip(transactions);
  document.getElementById('smart-tip').textContent = tip;
};

const addTransaction = async (transaction) => {
  if (!currentUser) return;

  // Optimistic update
  const tempId = Date.now();
  const tempTransaction = { ...transaction, id: tempId };
  transactions.unshift(tempTransaction);
  updateUI();

  try {
    const savedTransaction = await addTransactionToFirebase(transaction, currentUser.uid);
    // Replace temp transaction with real one (optional, or just reload)
    const index = transactions.findIndex(t => t.id === tempId);
    if (index !== -1) {
      transactions[index] = savedTransaction;
    }
  } catch (error) {
    console.error("Failed to save transaction", error);
    alert("Erro ao salvar no Firebase. Verifique suas credenciais.");
    // Rollback
    transactions = transactions.filter(t => t.id !== tempId);
    updateUI();
  }
};

const init = async () => {
  // Setup login button
  const loginBtn = document.getElementById('google-login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const loginScreen = document.getElementById('login-screen');
  const mainApp = document.getElementById('main-app');

  loginBtn.onclick = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert('Erro ao fazer login. Tente novamente.');
    }
  };

  logoutBtn.onclick = async () => {
    try {
      await logout();
    } catch (error) {
      alert('Erro ao fazer logout.');
    }
  };

  // Listen for auth state changes
  onAuthChange(async (user) => {
    if (user) {
      currentUser = user;
      loginScreen.classList.add('hidden');
      mainApp.classList.remove('hidden');

      // Update user name
      document.getElementById('user-name').textContent = user.displayName || user.email;

      // Setup app
      setupModal(addTransaction);

      // Theme toggle
      const themeBtn = document.getElementById('theme-toggle');
      themeBtn.onclick = () => {
        document.body.classList.toggle('light-mode');
      };

      // Load user's data
      try {
        const firebaseTransactions = await getTransactionsFromFirebase(user.uid);
        transactions = firebaseTransactions;
        updateUI();
      } catch (error) {
        console.error("Failed to load transactions", error);
        transactions = [];
        updateUI();
      }
    } else {
      currentUser = null;
      loginScreen.classList.remove('hidden');
      mainApp.classList.add('hidden');
      transactions = [];
    }
  });
};

init();
