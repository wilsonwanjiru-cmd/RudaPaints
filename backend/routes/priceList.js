const express = require('express');
const router = express.Router();
const Paint = require('../models/Paint');
const XLSX = require('xlsx');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit'); // <-- NEW

// Generate and download price list (CSV or Excel)
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

// NEW: Generate and download price list as PDF
router.get('/download/pdf', async (req, res) => {
    try {
        const paints = await Paint.find({ available: true })
            .select('name category brand size price description')
            .sort({ category: 1, name: 1 });

        // Create PDF document
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="ruda-paints-price-list.pdf"');

        // Pipe PDF to response
        doc.pipe(res);

        // Add title
        doc.fontSize(20).text('Ruda Paints - Price List', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        // Group paints by category
        const groupedPaints = paints.reduce((acc, paint) => {
            if (!acc[paint.category]) acc[paint.category] = [];
            acc[paint.category].push(paint);
            return acc;
        }, {});

        // Table settings
        const startY = doc.y;
        const col1 = 50;   // Product
        const col2 = 150;  // Description
        const col3 = 300;  // Size
        const col4 = 400;  // Price

        Object.entries(groupedPaints).forEach(([category, categoryPaints]) => {
            // Category header
            doc.fontSize(14).fillColor('blue').text(category, { underline: true });
            doc.moveDown(0.5);
            
            // Table headers
            doc.fontSize(10).fillColor('black');
            doc.text('Product', col1, doc.y, { width: 90, continued: true });
            doc.text('Description', col2, doc.y, { width: 140, continued: true });
            doc.text('Size', col3, doc.y, { width: 70, continued: true });
            doc.text('Price (KES)', col4, doc.y);
            doc.moveDown();

            // Table rows
            categoryPaints.forEach(paint => {
                doc.fontSize(9);
                doc.text(paint.name.substring(0, 15), col1, doc.y, { width: 90, continued: true });
                doc.text(paint.description ? paint.description.substring(0, 25) : '-', col2, doc.y, { width: 140, continued: true });
                doc.text(paint.size, col3, doc.y, { width: 70, continued: true });
                doc.text(paint.price.toLocaleString(), col4, doc.y);
                doc.moveDown(0.5);
            });
            doc.moveDown();
        });

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get price list data (for display)
router.get('/', async (req, res) => {
    try {
        const paints = await Paint.find({ available: true })
            .select('name category brand size price')
            .sort({ category: 1, name: 1 });
        
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