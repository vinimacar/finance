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
