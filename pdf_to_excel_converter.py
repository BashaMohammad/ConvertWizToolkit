#!/usr/bin/env python3
"""
PDF to Excel Converter with Editable Text
Standalone Python script for ConvertWiz PDF to Excel conversion
Uses PyMuPDF for text extraction and openpyxl for Excel creation with editable content
"""

import sys
import os
import pymupdf as fitz  # PyMuPDF
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill
from openpyxl.utils import get_column_letter
import time
import re

def extract_structured_text_from_page(page):
    """Extract text with structure detection for Excel organization"""
    try:
        # Get text blocks with positioning information
        blocks = page.get_text("dict")
        structured_data = []
        
        for block in blocks["blocks"]:
            if "lines" in block:
                for line in block["lines"]:
                    line_text = ""
                    font_size = 12
                    is_bold = False
                    x_pos = 0
                    y_pos = 0
                    
                    for span in line["spans"]:
                        text = span["text"].strip()
                        if text:
                            line_text += text + " "
                            font_size = max(font_size, span["size"])
                            if span["flags"] & 2**4:  # Bold flag
                                is_bold = True
                            x_pos = span["bbox"][0]  # Left position
                            y_pos = span["bbox"][1]  # Top position
                    
                    if line_text.strip():
                        structured_data.append({
                            "text": line_text.strip(),
                            "font_size": font_size,
                            "is_bold": is_bold,
                            "x_pos": x_pos,
                            "y_pos": y_pos
                        })
        
        return structured_data
    except:
        # Fallback: simple text extraction
        text = page.get_text()
        if text.strip():
            lines = text.split('\n')
            structured_data = []
            for i, line in enumerate(lines):
                if line.strip():
                    structured_data.append({
                        "text": line.strip(),
                        "font_size": 12,
                        "is_bold": False,
                        "x_pos": 0,
                        "y_pos": i * 20
                    })
            return structured_data
        
        return []

def detect_table_structure(structured_data):
    """Attempt to detect tabular data patterns"""
    if not structured_data:
        return []
    
    # Group data by similar y-positions (rows)
    rows = {}
    for item in structured_data:
        y_rounded = round(item["y_pos"] / 15) * 15  # Group by approximate line height
        if y_rounded not in rows:
            rows[y_rounded] = []
        rows[y_rounded].append(item)
    
    # Sort rows by y-position
    sorted_rows = []
    for y_pos in sorted(rows.keys()):
        # Sort items in each row by x-position
        row_items = sorted(rows[y_pos], key=lambda x: x["x_pos"])
        sorted_rows.append(row_items)
    
    return sorted_rows

def add_data_to_excel(worksheet, structured_data, page_num):
    """Add structured data to Excel worksheet"""
    # Detect if data has tabular structure
    table_rows = detect_table_structure(structured_data)
    
    if len(table_rows) > 1:
        # Tabular data detected
        start_row = (page_num - 1) * 50 + 1  # Space out pages
        
        # Add page header
        if page_num > 1:
            header_cell = worksheet.cell(row=start_row, column=1)
            header_cell.value = f"--- Page {page_num} ---"
            header_cell.font = Font(bold=True, size=14)
            start_row += 2
        
        for row_idx, row_data in enumerate(table_rows):
            excel_row = start_row + row_idx
            
            for col_idx, item in enumerate(row_data):
                excel_col = col_idx + 1
                cell = worksheet.cell(row=excel_row, column=excel_col)
                cell.value = item["text"]
                
                # Apply formatting
                if item["is_bold"]:
                    cell.font = Font(bold=True, size=max(10, min(item["font_size"], 16)))
                else:
                    cell.font = Font(size=max(10, min(item["font_size"], 16)))
                
                # Auto-adjust column width
                column_letter = get_column_letter(excel_col)
                current_width = worksheet.column_dimensions[column_letter].width or 10
                new_width = min(max(len(str(item["text"])) + 2, current_width), 50)
                worksheet.column_dimensions[column_letter].width = new_width
    else:
        # Linear data - put in single column
        start_row = (page_num - 1) * 50 + 1
        
        # Add page header
        if page_num > 1:
            header_cell = worksheet.cell(row=start_row, column=1)
            header_cell.value = f"--- Page {page_num} ---"
            header_cell.font = Font(bold=True, size=14)
            start_row += 2
        
        for idx, item in enumerate(structured_data):
            excel_row = start_row + idx
            cell = worksheet.cell(row=excel_row, column=1)
            cell.value = item["text"]
            
            # Apply formatting
            if item["is_bold"]:
                cell.font = Font(bold=True, size=max(10, min(item["font_size"], 16)))
            else:
                cell.font = Font(size=max(10, min(item["font_size"], 16)))
        
        # Auto-adjust column width for single column
        worksheet.column_dimensions['A'].width = 80

def convert_pdf_to_excel(input_path, output_path):
    """Convert PDF to Excel spreadsheet with editable text"""
    try:
        print(f"Starting conversion: {input_path} -> {output_path}")
        start_time = time.time()
        
        # Open PDF document
        pdf_document = fitz.open(input_path)
        
        # Create new Excel workbook
        workbook = Workbook()
        worksheet = workbook.active
        worksheet.title = "PDF Content"
        
        # Add title row
        title_cell = worksheet.cell(row=1, column=1)
        title_cell.value = "Converted from PDF"
        title_cell.font = Font(bold=True, size=16)
        title_cell.fill = PatternFill(start_color="E6F3FF", end_color="E6F3FF", fill_type="solid")
        
        # Add conversion info
        info_cell = worksheet.cell(row=2, column=1)
        info_cell.value = f"Source: {os.path.basename(input_path)}"
        info_cell.font = Font(italic=True, size=10)
        
        current_row = 4  # Start data from row 4
        
        # Process each page of the PDF
        total_pages = len(pdf_document)
        for page_num in range(total_pages):
            print(f"Processing page {page_num + 1}/{total_pages}")
            
            # Get the page
            page = pdf_document.load_page(page_num)
            
            # Extract structured text from the page
            structured_data = extract_structured_text_from_page(page)
            
            if structured_data:
                # Add page separator for multi-page documents
                if page_num > 0:
                    separator_cell = worksheet.cell(row=current_row, column=1)
                    separator_cell.value = f"--- Page {page_num + 1} ---"
                    separator_cell.font = Font(bold=True, size=12)
                    separator_cell.fill = PatternFill(start_color="F0F0F0", end_color="F0F0F0", fill_type="solid")
                    current_row += 2
                
                # Detect table structure
                table_rows = detect_table_structure(structured_data)
                
                if len(table_rows) > 2:  # Looks like tabular data
                    for row_data in table_rows:
                        for col_idx, item in enumerate(row_data):
                            excel_col = col_idx + 1
                            cell = worksheet.cell(row=current_row, column=excel_col)
                            cell.value = item["text"]
                            
                            # Apply formatting
                            if item["is_bold"]:
                                cell.font = Font(bold=True, size=max(10, min(item["font_size"], 14)))
                            else:
                                cell.font = Font(size=max(10, min(item["font_size"], 14)))
                            
                            # Auto-adjust column width
                            column_letter = get_column_letter(excel_col)
                            current_width = worksheet.column_dimensions[column_letter].width or 10
                            new_width = min(max(len(str(item["text"])) + 2, current_width), 60)
                            worksheet.column_dimensions[column_letter].width = new_width
                        
                        current_row += 1
                else:
                    # Linear data - single column
                    for item in structured_data:
                        cell = worksheet.cell(row=current_row, column=1)
                        cell.value = item["text"]
                        
                        # Apply formatting
                        if item["is_bold"]:
                            cell.font = Font(bold=True, size=max(10, min(item["font_size"], 14)))
                        else:
                            cell.font = Font(size=max(10, min(item["font_size"], 14)))
                        
                        current_row += 1
                    
                    # Auto-adjust column width
                    worksheet.column_dimensions['A'].width = 80
            else:
                # No text extracted
                placeholder_cell = worksheet.cell(row=current_row, column=1)
                placeholder_cell.value = f"Page {page_num + 1}: No extractable text (may be image-based)"
                placeholder_cell.font = Font(italic=True, color="666666")
                current_row += 2
        
        # Close PDF document
        pdf_document.close()
        
        # Add summary information
        summary_row = current_row + 2
        summary_cell = worksheet.cell(row=summary_row, column=1)
        summary_cell.value = f"Conversion completed: {total_pages} pages processed"
        summary_cell.font = Font(bold=True, size=10)
        summary_cell.fill = PatternFill(start_color="E6FFE6", end_color="E6FFE6", fill_type="solid")
        
        # Save Excel workbook
        workbook.save(output_path)
        
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
        print("Usage: python pdf_to_excel_converter.py <input_pdf> <output_xlsx>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Error: Input file not found: {input_file}")
        sys.exit(1)
    
    success = convert_pdf_to_excel(input_file, output_file)
    sys.exit(0 if success else 1)