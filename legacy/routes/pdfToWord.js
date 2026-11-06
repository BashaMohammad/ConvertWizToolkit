const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Configure multer for PDF uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Ensure directories exist
const uploadsDir = path.join(__dirname, '../uploads');
const downloadsDir = path.join(__dirname, '../downloads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

router.post('/', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const pdfPath = req.file.path;
    const originalName = req.file.originalname.replace(/\.pdf$/i, '');
    const outputDocx = `converted_${originalName}.docx`;
    const outputPath = path.join(downloadsDir, outputDocx);

    console.log(`Converting PDF: ${req.file.originalname} -> ${outputDocx}`);

    // Use Python PyMuPDF for PDF to Word conversion
    const command = `python3 pdf_to_word_converter.py "${pdfPath}" "${outputPath}"`;
    
    console.log('Executing Python PDF to Word command:', command);
    console.log('Expected output file:', outputPath);
    console.log('Input file size:', fs.statSync(pdfPath).size, 'bytes');
    
    exec(command, { timeout: 60000 }, (err, stdout, stderr) => {
      console.log('Python PDF to Word stdout:', stdout);
      console.log('Python PDF to Word stderr:', stderr);
      
      // Clean up uploaded file
      fs.unlink(pdfPath, (unlinkErr) => {
        if (unlinkErr) console.warn('Failed to delete uploaded file:', unlinkErr);
      });

      if (err) {
        console.error('Python PDF to Word conversion error:', err);
        console.error('Python PDF to Word stderr:', stderr);
        
        let errorMessage = 'PDF conversion failed';
        if (err.killed && err.signal === 'SIGTERM') {
          errorMessage = 'PDF conversion timed out. The PDF may be too complex or corrupted.';
        } else if (stderr) {
          errorMessage += '. Python error: ' + stderr;
        } else {
          errorMessage += '. Error: ' + err.message;
        }
        
        return res.status(500).json({
          success: false,
          message: errorMessage
        });
      }

      // Check if output file was created
      if (!fs.existsSync(outputPath)) {
        console.error('Output file not found:', outputPath);
        console.error('Available files in downloads:', fs.readdirSync(downloadsDir));
        return res.status(500).json({
          success: false,
          message: 'Conversion completed but output file is missing'
        });
      }

      console.log('Python pdf2docx conversion successful, file created at:', outputPath);

      // Get file stats
      const stats = fs.statSync(outputPath);
      
      // Return success response with download info
      res.json({
        success: true,
        downloadLink: `/downloads/${outputDocx}`,
        originalFile: req.file.originalname,
        outputFormat: 'Microsoft Word (.docx)',
        fileSizeMB: (stats.size / (1024 * 1024)).toFixed(2),
        fileName: outputDocx
      });

      // Schedule file cleanup after 1 hour
      setTimeout(() => {
        fs.unlink(outputPath, (cleanupErr) => {
          if (cleanupErr) console.warn('Failed to cleanup converted file:', cleanupErr);
          else console.log('Cleaned up converted file:', outputDocx);
        });
      }, 60 * 60 * 1000); // 1 hour
    });

  } catch (error) {
    console.error('Unexpected error in PDF to Word conversion:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during conversion'
    });
  }
});

module.exports = router;