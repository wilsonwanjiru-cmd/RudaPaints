const express = require('express');
const router = express.Router();
const Paint = require('../models/Paint');
const XLSX = require('xlsx');
const { Parser } = require('json2csv');

// Generate and download price list
router.get('/download', async (req, res) => {
    try {
        const format = req.query.format || 'csv'; // csv or excel
        
        const paints = await Paint.find({ available: true })
            .select('name category brand size price description')
            .sort({ category: 1, name: 1 });
        
        if (format === 'excel') {
            // Generate Excel file
            const worksheet = XLSX.utils.json_to_sheet(paints.map(paint => ({
                'Product Name': paint.name,
                'Category': paint.category,
                'Brand': paint.brand,
                'Size': paint.size,
                'Price (KES)': paint.price,
                'Description': paint.description || ''
            })));
            
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Price List');
            
            // Generate buffer
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="ruda-paints-price-list.xlsx"');
            res.send(excelBuffer);
            
        } else {
            // Generate CSV file
            const fields = [
                { label: 'Product Name', value: 'name' },
                { label: 'Category', value: 'category' },
                { label: 'Brand', value: 'brand' },
                { label: 'Size', value: 'size' },
                { label: 'Price (KES)', value: 'price' },
                { label: 'Description', value: 'description' }
            ];
            
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(paints);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="ruda-paints-price-list.csv"');
            res.send(csv);
        }
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get price list data (for display)
router.get('/', async (req, res) => {
    try {
        const paints = await Paint.find({ available: true })
            .select('name category brand size price')
            .sort({ category: 1, name: 1 });
        
        // Group by category for easier display
        const groupedPaints = paints.reduce((acc, paint) => {
            if (!acc[paint.category]) {
                acc[paint.category] = [];
            }
            acc[paint.category].push(paint);
            return acc;
        }, {});
        
        res.json({
            lastUpdated: new Date(),
            paints: groupedPaints
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;