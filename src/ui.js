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
