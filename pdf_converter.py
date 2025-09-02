#!/usr/bin/env python3
"""
PDF to Word Converter using pdf2docx
Standalone Python script for ConvertWiz PDF conversion
"""

import sys
import os
from pdf2docx import Converter
import time

def convert_pdf_to_word(input_path, output_path):
    """Convert PDF to Word document using pdf2docx"""
    try:
        print(f"Starting conversion: {input_path} -> {output_path}")
        start_time = time.time()
        
        # Initialize converter
        cv = Converter(input_path)
        
        # Convert PDF to DOCX
        cv.convert(output_path, start=0, end=None)
        cv.close()
        
        duration = round(time.time() - start_time, 2)
        print(f"Conversion completed in {duration} seconds")
        
        # Check if output file exists
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"Output file created: {output_path} ({file_size} bytes)")
            return True
        else:
            print("Error: Output file not created")
            return False
            
    except Exception as e:
        print(f"Conversion error: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python pdf_converter.py <input_pdf> <output_docx>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Error: Input file not found: {input_file}")
        sys.exit(1)
    
    success = convert_pdf_to_word(input_file, output_file)
    sys.exit(0 if success else 1)