const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Ensure downloads directory exists
const downloadsDir = path.join(__dirname, '..', 'downloads');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

router.post('/pdf-to-excel', upload.single('pdfFile'), async (req, res) => {
    console.log('PDF to Excel conversion request received');

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded'
            });
        }

        const inputPath = req.file.path;
        const originalName = req.file.originalname;
        const baseName = path.parse(originalName).name;
        const outputFileName = `converted_${baseName}.xlsx`;
        const outputPath = path.join(downloadsDir, outputFileName);

        console.log(`Converting PDF: ${originalName} -> ${outputFileName}`);

        // Execute Python PDF to Excel conversion
        const pythonCommand = `python3 pdf_to_excel_converter.py "${inputPath}" "${outputPath}"`;
        console.log(`Executing Python PDF to Excel command: ${pythonCommand}`);
        console.log(`Expected output file: ${outputPath}`);

        // Log input file info
        const inputStats = fs.statSync(inputPath);
        console.log(`Input file size: ${inputStats.size} bytes`);

        exec(pythonCommand, { timeout: 120000 }, (error, stdout, stderr) => {
            console.log(`Python PDF to Excel stdout: ${stdout}`);
            console.log(`Python PDF to Excel stderr: ${stderr}`);

            // Clean up input file
            try {
                fs.unlinkSync(inputPath);
            } catch (cleanupError) {
                console.log('Error cleaning up input file:', cleanupError.message);
            }

            if (error) {
                console.log('Python PDF to Excel conversion error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'PDF to Excel conversion failed: ' + (stderr || error.message)
                });
            }

            // Check if output file was created
            if (!fs.existsSync(outputPath)) {
                console.log('Output file not found after conversion');
                return res.status(500).json({
                    success: false,
                    message: 'Conversion completed but output file was not created'
                });
            }

            // Get output file stats
            const outputStats = fs.statSync(outputPath);
            const fileSizeMB = (outputStats.size / (1024 * 1024)).toFixed(2);

            console.log(`Python PDF to Excel conversion successful, file created at: ${outputPath}`);

            // Return success response
            res.json({
                success: true,
                downloadLink: `/downloads/${outputFileName}`,
                fileName: outputFileName,
                originalFile: originalName,
                outputFormat: 'Microsoft Excel (.xlsx)',
                fileSizeMB: fileSizeMB
            });
        });

    } catch (error) {
        console.error('Error in PDF to Excel conversion:', error);
        
        // Clean up input file if it exists
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (cleanupError) {
                console.log('Error cleaning up input file:', cleanupError.message);
            }
        }

        res.status(500).json({
            success: false,
            message: 'Server error during PDF to Excel conversion: ' + error.message
        });
    }
});

module.exports = router;