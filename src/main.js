```javascript
import { calculateBalance, generateSmartTip } from './finance.js';
import { renderBalance, renderTransactions, renderChart, renderEvolutionChart, renderStats, setupModal } from './ui.js';
import { addTransactionToFirebase, getTransactionsFromFirebase } from './firebase-service.js';

let transactions = [];

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
  // Optimistic update
  const tempId = Date.now();
  const tempTransaction = { ...transaction, id: tempId };
  transactions.unshift(tempTransaction);
  updateUI();

  try {
    const savedTransaction = await addTransactionToFirebase(transaction);
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
  setupModal(addTransaction);

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  themeBtn.onclick = () => {
    document.body.classList.toggle('light-mode');
  };

  // Load data
  try {
    const firebaseTransactions = await getTransactionsFromFirebase();
    if (firebaseTransactions.length > 0) {
      transactions = firebaseTransactions;
    } else {
      // Keep empty or use mock if needed, but better to start clean
      transactions = [];
    }
    updateUI();
  } catch (error) {
    console.error("Failed to load transactions", error);
    // Fallback to mock data for demo purposes if firebase fails (e.g. no credentials)
    transactions = [
      { id: 1, type: 'income', description: 'Demo Salário', amount: 5000, category: 'salary', date: new Date().toISOString() },
      { id: 2, type: 'expense', description: 'Demo Aluguel', amount: 1500, category: 'bills', date: new Date().toISOString() }
    ];
    updateUI();
    alert("Modo Demo: Configure o Firebase em src/firebase-config.js para salvar dados reais.");
  }
};

init();
