export const calculateBalance = (transactions) => {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    return {
        income,
        expense,
        total: income - expense
    };
};

export const generateSmartTip = (transactions) => {
    const { income, expense } = calculateBalance(transactions);

    if (transactions.length === 0) {
        return "Comece adicionando suas receitas e despesas para receber insights.";
    }

    if (expense > income) {
        return "⚠️ Alerta: Seus gastos superaram seus ganhos este mês. Revise categorias como Lazer.";
    }

    if (expense < income * 0.5) {
        return "🚀 Ótimo! Você economizou mais de 50% da sua renda. Considere investir o excedente.";
    }

    const foodExpenses = transactions
        .filter(t => t.category === 'food')
        .reduce((acc, t) => acc + t.amount, 0);

    if (foodExpenses > income * 0.3) {
        return "🍔 Seus gastos com alimentação estão altos (>30%). Tente cozinhar mais em casa.";
    }

    return "💡 Mantenha o foco! Economizar regularmente é a chave para a liberdade financeira.";
};

export const getMonthlyEvolution = (transactions) => {
    const evolution = {};

    // Sort by date ascending
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(t => {
        const date = new Date(t.date);
        const key = `${date.getMonth() + 1}/${date.getFullYear()}`; // MM/YYYY

        if (!evolution[key]) {
            evolution[key] = { income: 0, expense: 0, balance: 0 };
        }

        if (t.type === 'income') evolution[key].income += t.amount;
        if (t.type === 'expense') evolution[key].expense += t.amount;
        evolution[key].balance = evolution[key].income - evolution[key].expense;
    });

    return evolution;
};

export const getBiggestExpense = (transactions) => {
    const expenses = transactions.filter(t => t.type === 'expense');
    if (expenses.length === 0) return null;

    return expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0]);
};

export const getSavingsRate = (transactions) => {
    const { income, expense } = calculateBalance(transactions);
    if (income === 0) return 0;
    return Math.round(((income - expense) / income) * 100);
};
