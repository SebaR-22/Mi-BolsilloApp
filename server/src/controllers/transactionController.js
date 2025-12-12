const { supabase } = require('../config/supabase');

const getTransactions = async (req, res) => {
    try {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select(`
                *,
                categories (
                    id,
                    name,
                    color,
                    icon,
                    type
                )
            `)
            .eq('user_id', req.user.id)
            .order('date', { ascending: false });

        if (error) throw error;

        const formatted = transactions.map(t => ({
            ...t,
            Category: t.categories
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const addTransaction = async (req, res) => {
    const { amount, description, date, categoryId } = req.body;

    try {
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert([{
                amount,
                description,
                date,
                category_id: categoryId,
                user_id: req.user.id
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        // Check ownership first
        const { data: transaction, error: findError } = await supabase
            .from('transactions')
            .select('user_id')
            .eq('id', req.params.id)
            .single();

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.user_id !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const { error: deleteError } = await supabase
            .from('transactions')
            .delete()
            .eq('id', req.params.id);

        if (deleteError) throw deleteError;

        res.json({ message: 'Transaction removed' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
}

module.exports = { getTransactions, addTransaction, deleteTransaction };
