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
    const outputDocx = `converted_${Date.now()}_${originalName}.docx`;
    const outputPath = path.join(downloadsDir, outputDocx);

    console.log(`Converting PDF: ${req.file.originalname} -> ${outputDocx}`);

    // Use LibreOffice to convert PDF to Word
    const command = `soffice --headless --convert-to docx --outdir "${downloadsDir}" "${pdfPath}"`;
    
    exec(command, (err, stdout, stderr) => {
      // Clean up uploaded file
      fs.unlink(pdfPath, (unlinkErr) => {
        if (unlinkErr) console.warn('Failed to delete uploaded file:', unlinkErr);
      });

      if (err) {
        console.error('LibreOffice conversion error:', stderr);
        return res.status(500).json({
          success: false,
          message: 'PDF conversion failed. Please ensure the PDF is valid and not password-protected.'
        });
      }

      // Check if output file was created
      const generatedFile = path.join(downloadsDir, path.basename(pdfPath) + '.docx');
      const finalOutputPath = outputPath;

      // Rename the generated file to our desired name
      if (fs.existsSync(generatedFile)) {
        try {
          fs.renameSync(generatedFile, finalOutputPath);
        } catch (renameErr) {
          console.error('File rename error:', renameErr);
          return res.status(500).json({
            success: false,
            message: 'File processing error occurred'
          });
        }
      }

      if (!fs.existsSync(finalOutputPath)) {
        console.error('Output file not found:', finalOutputPath);
        return res.status(500).json({
          success: false,
          message: 'Conversion completed but output file is missing'
        });
      }

      // Get file stats
      const stats = fs.statSync(finalOutputPath);
      
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
        fs.unlink(finalOutputPath, (cleanupErr) => {
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