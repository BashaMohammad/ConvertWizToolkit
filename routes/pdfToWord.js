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

    // Use LibreOffice to convert PDF to Word with Java environment
    const javaHome = process.env.JAVA_HOME || '/nix/store/w0b9gzgv23b8amxsf5vmygp8fvyy9r5c-openjdk-headless-21.0.4+7';
    const command = `JAVA_HOME="${javaHome}" libreoffice --headless --convert-to docx --outdir "${downloadsDir}" "${pdfPath}"`;
    
    console.log('Executing command:', command);
    console.log('Expected output file:', outputPath);
    console.log('Java Home:', javaHome);
    
    exec(command, (err, stdout, stderr) => {
      console.log('LibreOffice stdout:', stdout);
      console.log('LibreOffice stderr:', stderr);
      
      // Clean up uploaded file
      fs.unlink(pdfPath, (unlinkErr) => {
        if (unlinkErr) console.warn('Failed to delete uploaded file:', unlinkErr);
      });

      if (err) {
        console.error('LibreOffice conversion error:', err);
        console.error('LibreOffice stderr:', stderr);
        return res.status(500).json({
          success: false,
          message: 'PDF conversion failed. LibreOffice error: ' + (stderr || err.message)
        });
      }

      // Check what files were actually created
      const downloadFiles = fs.readdirSync(downloadsDir);
      console.log('Files in downloads directory after conversion:', downloadFiles);
      
      // LibreOffice generates file with original name + .docx
      const baseName = path.basename(pdfPath, path.extname(pdfPath));
      const generatedFile = path.join(downloadsDir, baseName + '.docx');
      console.log('Looking for generated file:', generatedFile);

      // Rename the generated file to our desired name
      if (fs.existsSync(generatedFile)) {
        try {
          fs.renameSync(generatedFile, outputPath);
          console.log('File renamed successfully from', generatedFile, 'to', outputPath);
        } catch (renameErr) {
          console.error('File rename error:', renameErr);
          return res.status(500).json({
            success: false,
            message: 'File processing error occurred'
          });
        }
      } else {
        // Try alternative naming patterns
        const possibleFiles = downloadFiles.filter(f => f.endsWith('.docx'));
        console.log('Found DOCX files:', possibleFiles);
        
        if (possibleFiles.length > 0) {
          const sourceFile = path.join(downloadsDir, possibleFiles[0]);
          try {
            fs.renameSync(sourceFile, outputPath);
            console.log('File renamed from alternative source:', sourceFile, 'to', outputPath);
          } catch (renameErr) {
            console.error('Alternative rename error:', renameErr);
          }
        }
      }

      if (!fs.existsSync(outputPath)) {
        console.error('Output file not found:', outputPath);
        console.error('Available files in downloads:', fs.readdirSync(downloadsDir));
        return res.status(500).json({
          success: false,
          message: 'Conversion completed but output file is missing. Check server logs.'
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