const PDFDocument = require('pdfkit');
const { createClient } = require('@supabase/supabase-js');
// const { supabase } = require('../config/supabase'); // Don't use global client

const generateReport = async (req, res) => {
    try {
        // Create a scoped client for this user to pass RLS
        const scopedSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${req.token}`
                }
            }
        });

        // Filter by Month
        const now = new Date();
        const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();
        const monthQuery = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
        const monthIndex = monthQuery - 1;

        const startDate = new Date(year, monthIndex, 1);
        const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

        const { data: transactions, error } = await scopedSupabase
            .from('transactions')
            .select(`
                *,
                categories (name, type)
            `)
            .eq('user_id', req.user.id)
            .gte('date', startDate.toISOString())
            .lte('date', endDate.toISOString())
            .order('date', { ascending: false });

        if (error) {
            console.error("PDF Fetch Error:", error);
            throw error;
        }

        console.log(`Generating PDF for user ${req.user.id}. Found ${transactions.length} transactions.`);

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=reporte_${Date.now()}.pdf`);

        doc.pipe(res);

        // --- Header ---
        const monthName = new Date(year, monthIndex).toLocaleString('es-ES', { month: 'long' });
        doc.fillColor('#1e3a8a').fontSize(20).text('MI BOLSILLO', { align: 'center' });
        doc.fillColor('#444').fontSize(12).text(`Reporte de Movimientos - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`, { align: 'center' });
        doc.moveDown();
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.text(`Usuario: ${req.user.username || req.user.email}`, { align: 'right' });
        doc.moveDown();

        // --- Table Headers ---
        const tableTop = 150;
        let y = tableTop;

        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('Fecha', 50, y);
        doc.text('Categoría', 150, y);
        doc.text('Descripción', 280, y);
        doc.text('Monto', 450, y, { width: 90, align: 'right' });

        doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor('#ccc').stroke();
        y += 25;
        doc.font('Helvetica').fontSize(10);

        // --- Table Rows ---
        let totalIncome = 0;
        let totalExpense = 0;

        transactions.forEach(t => {
            if (y > 700) { // Add new page if close to bottom
                doc.addPage();
                y = 50;
            }

            const date = new Date(t.date).toLocaleDateString();
            const categoryName = t.categories ? t.categories.name : 'Varios';
            const catType = t.categories?.type || 'expense';
            const description = t.description || '-';

            const isExpense = catType === 'expense';
            if (isExpense) totalExpense += Number(t.amount);
            else totalIncome += Number(t.amount);

            doc.fillColor('#000').text(date, 50, y);
            doc.text(categoryName, 150, y);
            doc.text(description, 280, y, { width: 160, lineBreak: false, ellipsis: true });

            doc.fillColor(isExpense ? '#ef4444' : '#10b981');
            doc.text(`${isExpense ? '-' : '+'}$${Number(t.amount).toFixed(2)}`, 450, y, { width: 90, align: 'right' });

            y += 20;
        });

        doc.moveTo(50, y).lineTo(550, y).strokeColor('#ccc').stroke();
        y += 10;

        // --- Totals ---
        doc.font('Helvetica-Bold').fillColor('#000');
        doc.text('Total Ingresos:', 350, y);
        doc.fillColor('#10b981').text(`+$${totalIncome.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
        y += 15;
        doc.fillColor('#000').text('Total Gastos:', 350, y);
        doc.fillColor('#ef4444').text(`-$${totalExpense.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
        y += 15;
        doc.fillColor('#000').text('Balance:', 350, y);
        const balance = totalIncome - totalExpense;
        doc.fillColor(balance >= 0 ? '#10b981' : '#ef4444')
            .text(`$${balance.toFixed(2)}`, 450, y, { width: 90, align: 'right' });

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating PDF: ' + error.message });
    }
};

module.exports = { generateReport };
