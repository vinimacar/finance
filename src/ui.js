import Chart from 'chart.js/auto';

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

export const renderBalance = (balance) => {
    document.getElementById('total-balance').textContent = formatCurrency(balance.total);
    document.getElementById('total-income').textContent = `+ ${formatCurrency(balance.income)}`;
    document.getElementById('total-expense').textContent = `- ${formatCurrency(balance.expense)}`;
};

export const renderTransactions = (transactions) => {
    const list = document.getElementById('transaction-list');
    list.innerHTML = '';

    transactions.forEach(t => {
        const li = document.createElement('li');
        li.className = 'transaction-item';
        li.innerHTML = `
      <div class="t-info">
        <h4>${t.description}</h4>
        <span>${new Date(t.date).toLocaleDateString('pt-BR')} • ${t.category}</span>
      </div>
      <div class="${t.type === 'income' ? 'text-green' : 'text-red'}">
        ${t.type === 'income' ? '+' : '-'} ${formatCurrency(t.amount)}
      </div>
    `;
        list.appendChild(li);
    });
};

let chartInstance = null;

export const renderChart = (transactions) => {
    const ctx = document.getElementById('expenseChart').getContext('2d');

    // Group expenses by category
    const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {});

    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#00f3ff',
                    '#bc13fe',
                    '#0aff00',
                    '#ff0055',
                    '#ffffff'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#ffffff' }
                },
                title: {
                    display: true,
                    text: 'Despesas por Categoria',
                    color: '#ffffff',
                    font: { family: 'Orbitron' }
                }
            }
        }
    });
};

export const setupModal = (onSave) => {
    const modal = document.getElementById('transaction-modal');
    const addBtn = document.getElementById('add-btn');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('transaction-form');

    addBtn.onclick = () => modal.classList.remove('hidden');
    closeBtn.onclick = () => modal.classList.add('hidden');

    window.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        const type = form.type.value;
        const description = form.desc.value;
        const amount = parseFloat(form.amount.value);
        const category = form.category.value;

        if (description && amount) {
            onSave({
                type,
                description,
                amount,
                category,
                date: new Date().toISOString()
            });
            form.reset();
            modal.classList.add('hidden');
        }
    };
};

let evolutionChartInstance = null;

export const renderEvolutionChart = (transactions) => {
    const ctx = document.getElementById('evolutionChart')?.getContext('2d');
    if (!ctx) return;

    const evolution = {};
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(t => {
        const date = new Date(t.date);
        const key = `${date.getDate()}/${date.getMonth() + 1}`;

        if (!evolution[key]) {
            evolution[key] = { income: 0, expense: 0 };
        }

        if (t.type === 'income') evolution[key].income += t.amount;
        if (t.type === 'expense') evolution[key].expense += t.amount;
    });

    const labels = Object.keys(evolution);
    const incomeData = Object.values(evolution).map(v => v.income);
    const expenseData = Object.values(evolution).map(v => v.expense);

    if (evolutionChartInstance) {
        evolutionChartInstance.destroy();
    }

    evolutionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomeData,
                    borderColor: '#0aff00',
                    backgroundColor: 'rgba(10, 255, 0, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Despesas',
                    data: expenseData,
                    borderColor: '#ff0055',
                    backgroundColor: 'rgba(255, 0, 85, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                x: {
                    ticks: { color: '#ffffff' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            }
        }
    });
};

export const renderStats = (transactions) => {
    // Biggest expense
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length > 0) {
        const biggest = expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0]);
        document.getElementById('biggest-expense').textContent = formatCurrency(biggest.amount);
        document.getElementById('biggest-expense-desc').textContent = biggest.description;
    } else {
        document.getElementById('biggest-expense').textContent = 'R$ 0,00';
        document.getElementById('biggest-expense-desc').textContent = '-';
    }

    // Savings rate
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const rate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    document.getElementById('savings-rate').textContent = `${rate}%`;
};

