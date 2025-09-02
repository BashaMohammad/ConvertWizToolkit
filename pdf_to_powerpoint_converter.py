#!/usr/bin/env python3
"""
PDF to PowerPoint Converter 
Standalone Python script for ConvertWiz PDF to PowerPoint conversion
Uses PyMuPDF for PDF reading and python-pptx for PowerPoint creation
"""

import sys
import os
import pymupdf as fitz  # PyMuPDF
from pptx import Presentation
from pptx.util import Inches
import time
from io import BytesIO

def convert_pdf_to_powerpoint(input_path, output_path):
    """Convert PDF to PowerPoint presentation using PyMuPDF and python-pptx"""
    try:
        print(f"Starting conversion: {input_path} -> {output_path}")
        start_time = time.time()
        
        # Open PDF document
        pdf_document = fitz.open(input_path)
        
        # Create new PowerPoint presentation
        prs = Presentation()
        
        # Process each page of the PDF
        for page_num in range(len(pdf_document)):
            print(f"Processing page {page_num + 1}/{len(pdf_document)}")
            
            # Get the page
            page = pdf_document.load_page(page_num)
            
            # Convert page to image (PNG format)
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better quality
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Add slide to presentation
            if page_num == 0:
                # Use the first slide layout for the first page
                slide_layout = prs.slide_layouts[0]  # Title slide
            else:
                # Use blank layout for subsequent pages
                slide_layout = prs.slide_layouts[6]  # Blank slide
            
            slide = prs.slides.add_slide(slide_layout)
            
            # Add the page image to the slide
            img_stream = BytesIO(img_data)
            
            # Add image to slide with proper positioning
            left = Inches(0.5)
            top = Inches(0.5)
            width = Inches(9)  # Standard slide width minus margins
            
            slide.shapes.add_picture(img_stream, left, top, width=width)
        
        # Close PDF document
        pdf_document.close()
        
        # Save PowerPoint presentation
        prs.save(output_path)
        
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
        print("Usage: python pdf_to_powerpoint_converter.py <input_pdf> <output_pptx>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Error: Input file not found: {input_file}")
        sys.exit(1)
    
    success = convert_pdf_to_powerpoint(input_file, output_file)
    sys.exit(0 if success else 1)