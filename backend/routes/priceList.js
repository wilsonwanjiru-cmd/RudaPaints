const express = require('express');
const router = express.Router();
const Paint = require('../models/Paint');
const XLSX = require('xlsx');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

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

// IMPROVED: Generate and download price list as PDF with proper table formatting
router.get('/download/pdf', async (req, res) => {
    try {
        const paints = await Paint.find({ available: true })
            .select('name category brand size price description')
            .sort({ category: 1, name: 1 });

        // Create PDF document with multi‑page support
        const doc = new PDFDocument({ 
            margin: 30, 
            size: 'A4',
            bufferPages: true
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="ruda-paints-price-list.pdf"');

        // Pipe PDF to response
        doc.pipe(res);

        // Helper function to draw a table row (header or data)
        const drawRow = (y, columns, isHeader = false) => {
            const startX = 50;
            const colWidths = [100, 220, 60, 80]; // Product, Description, Size, Price
            let x = startX;

            if (isHeader) {
                doc.fillColor('#2c3e50').font('Helvetica-Bold').fontSize(10);
            } else {
                doc.fillColor('black').font('Helvetica').fontSize(9);
            }

            // Draw cell backgrounds for header
            if (isHeader) {
                doc.fillColor('#ecf0f1').rect(startX, y-3, 460, 18).fill();
                doc.fillColor('black');
            }

            // Draw each cell
            columns.forEach((text, i) => {
                doc.fillColor(isHeader ? '#2c3e50' : 'black');
                doc.text(text, x + 2, y, { 
                    width: colWidths[i] - 4, 
                    align: i === 3 ? 'right' : 'left',
                    lineBreak: i === 1 // Only wrap description column
                });
                x += colWidths[i];
            });

            // Draw horizontal line
            doc.strokeColor('#bdc3c7').lineWidth(0.5)
               .moveTo(startX, y + 15)
               .lineTo(startX + 460, y + 15)
               .stroke();
        };

        // Add title
        doc.fontSize(20).fillColor('#2980b9').text('Ruda Paints - Price List', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).fillColor('#7f8c8d').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown(2);

        // Group paints by category
        const groupedPaints = paints.reduce((acc, paint) => {
            if (!acc[paint.category]) acc[paint.category] = [];
            acc[paint.category].push(paint);
            return acc;
        }, {});

        let y = doc.y;

        Object.entries(groupedPaints).forEach(([category, categoryPaints]) => {
            // Category header
            doc.fillColor('#2980b9').fontSize(14).font('Helvetica-Bold')
               .text(category, 50, y, { underline: true });
            y = doc.y + 10;

            // Table headers
            drawRow(y, ['Product', 'Description', 'Size', 'Price (KES)'], true);
            y += 20;

            // Table rows
            categoryPaints.forEach(paint => {
                // Check if we need a new page
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                    // Redraw headers on new page
                    drawRow(y, ['Product', 'Description', 'Size', 'Price (KES)'], true);
                    y += 20;
                }

                // Calculate description height to know row height
                const descLines = doc.heightOfString(paint.description || '-', { width: 216, align: 'left' });
                const rowHeight = Math.max(18, descLines + 4); // Minimum 18, expand for wrapped text

                // Draw row background (alternating)
                doc.fillColor('#f9f9f9')
                   .rect(50, y - 3, 460, rowHeight)
                   .fill();

                // Draw product name (full)
                doc.fillColor('black').font('Helvetica').fontSize(9)
                   .text(paint.name, 52, y, { width: 96, align: 'left' });

                // Draw description (wrapped)
                doc.text(paint.description || '-', 152, y, { width: 216, align: 'left' });

                // Draw size
                doc.text(paint.size, 372, y, { width: 56, align: 'left' });

                // Draw price
                doc.text(paint.price.toLocaleString(), 432, y, { width: 76, align: 'right' });

                // Draw cell borders
                doc.strokeColor('#bdc3c7').lineWidth(0.2);
                let x = 50;
                [100, 220, 60, 80].forEach(width => {
                    doc.rect(x, y - 3, width, rowHeight).stroke();
                    x += width;
                });

                y += rowHeight;
            });

            y += 10; // Space after category
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