#!/usr/bin/env python3
"""
PDF to PowerPoint Converter with Editable Text
Standalone Python script for ConvertWiz PDF to PowerPoint conversion
Uses PyMuPDF for text extraction and python-pptx for PowerPoint creation with editable text
"""

import sys
import os
import pymupdf as fitz  # PyMuPDF
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import time
import re

def extract_text_blocks_from_page(page):
    """Extract text blocks with formatting information from a PDF page"""
    text_blocks = []
    
    try:
        # Get text blocks with font information
        blocks = page.get_text("dict")
        
        for block in blocks["blocks"]:
            if "lines" in block:
                for line in block["lines"]:
                    line_text = ""
                    font_size = 12
                    is_bold = False
                    
                    for span in line["spans"]:
                        text = span["text"].strip()
                        if text:
                            line_text += text + " "
                            font_size = max(font_size, span["size"])
                            if span["flags"] & 2**4:  # Bold flag
                                is_bold = True
                    
                    if line_text.strip():
                        text_blocks.append({
                            "text": line_text.strip(),
                            "font_size": font_size,
                            "is_bold": is_bold,
                            "bbox": line["bbox"]
                        })
    except:
        # Fallback: simple text extraction
        text = page.get_text()
        if text.strip():
            paragraphs = text.split('\n\n')
            for para in paragraphs:
                if para.strip():
                    text_blocks.append({
                        "text": para.strip(),
                        "font_size": 14,
                        "is_bold": False,
                        "bbox": None
                    })
    
    return text_blocks

def add_text_to_slide(slide, text_blocks):
    """Add text blocks to PowerPoint slide as editable text"""
    if not text_blocks:
        return
    
    # Determine if this looks like a title page
    first_block = text_blocks[0]
    is_title_page = (len(first_block["text"]) < 100 and 
                     (first_block["font_size"] > 16 or first_block["is_bold"]))
    
    if is_title_page and len(text_blocks) >= 1:
        # Title slide layout
        if hasattr(slide.shapes, 'title') and slide.shapes.title:
            title_shape = slide.shapes.title
            title_shape.text = first_block["text"]
            
            # Format title
            if title_shape.text_frame.paragraphs:
                title_para = title_shape.text_frame.paragraphs[0]
                if title_para.runs:
                    title_run = title_para.runs[0]
                    title_run.font.size = Pt(max(24, first_block["font_size"]))
                    title_run.font.bold = True
        
        # Add remaining text as subtitle/content
        if len(text_blocks) > 1:
            if hasattr(slide.shapes, 'placeholders') and len(slide.shapes.placeholders) > 1:
                content_shape = slide.shapes.placeholders[1]
                content_text = "\n\n".join([block["text"] for block in text_blocks[1:]])
                content_shape.text = content_text
            else:
                # Add as text box
                left = Inches(1)
                top = Inches(2.5)
                width = Inches(8)
                height = Inches(4)
                text_box = slide.shapes.add_textbox(left, top, width, height)
                text_frame = text_box.text_frame
                
                content_text = "\n\n".join([block["text"] for block in text_blocks[1:]])
                text_frame.text = content_text
    else:
        # Content slide - add all text as paragraphs
        left = Inches(0.5)
        top = Inches(0.5)
        width = Inches(9)
        height = Inches(6.5)
        
        text_box = slide.shapes.add_textbox(left, top, width, height)
        text_frame = text_box.text_frame
        text_frame.word_wrap = True
        
        # Clear existing content
        text_frame.clear()
        
        # Add each text block as a paragraph
        for i, block in enumerate(text_blocks):
            if i == 0:
                # First paragraph
                p = text_frame.paragraphs[0]
            else:
                # Add new paragraph
                p = text_frame.add_paragraph()
            
            p.text = block["text"]
            
            # Format paragraph
            if p.runs:
                run = p.runs[0]
                run.font.size = Pt(max(12, min(block["font_size"], 24)))
                run.font.bold = block["is_bold"]
                
            # Add spacing between paragraphs
            if i < len(text_blocks) - 1:
                p.space_after = Pt(6)

def convert_pdf_to_powerpoint(input_path, output_path):
    """Convert PDF to PowerPoint presentation with editable text"""
    try:
        print(f"Starting conversion: {input_path} -> {output_path}")
        start_time = time.time()
        
        # Open PDF document
        pdf_document = fitz.open(input_path)
        
        # Create new PowerPoint presentation
        prs = Presentation()
        
        # Process each page of the PDF
        total_pages = len(pdf_document)
        for page_num in range(total_pages):
            print(f"Processing page {page_num + 1}/{total_pages}")
            
            # Get the page
            page = pdf_document.load_page(page_num)
            
            # Extract text blocks from the page
            text_blocks = extract_text_blocks_from_page(page)
            
            # Determine slide layout
            if page_num == 0 and text_blocks:
                # First page - use title slide layout if it looks like a title
                first_text = text_blocks[0]["text"] if text_blocks else ""
                if len(first_text) < 100:
                    slide_layout = prs.slide_layouts[0]  # Title slide
                else:
                    slide_layout = prs.slide_layouts[1]  # Title and Content
            else:
                # Subsequent pages - use content layout
                slide_layout = prs.slide_layouts[1]  # Title and Content
            
            slide = prs.slides.add_slide(slide_layout)
            
            # Add text to slide
            if text_blocks:
                add_text_to_slide(slide, text_blocks)
            else:
                # Fallback: Add placeholder text if no text extracted
                if hasattr(slide.shapes, 'title') and slide.shapes.title:
                    slide.shapes.title.text = f"Page {page_num + 1}"
                
                # Add text box with message
                left = Inches(1)
                top = Inches(2)
                width = Inches(8)
                height = Inches(2)
                text_box = slide.shapes.add_textbox(left, top, width, height)
                text_frame = text_box.text_frame
                text_frame.text = "This page contained no extractable text or was image-based."
        
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