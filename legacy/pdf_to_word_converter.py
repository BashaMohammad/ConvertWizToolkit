#!/usr/bin/env python3
import sys
import os
import time

def convert_pdf_to_word(input_path, output_path):
    try:
        print(f"Starting conversion: {input_path} -> {output_path}")
        start_time = time.time()

        from pdf2docx import Converter

        cv = Converter(input_path)
        cv.convert(output_path, start=0, end=None)
        cv.close()

        duration = round(time.time() - start_time, 2)
        print(f"Conversion completed in {duration} seconds")

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
        print("Usage: python pdf_to_word_converter.py <input_pdf> <output_docx>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    if not os.path.exists(input_file):
        print(f"Error: Input file not found: {input_file}")
        sys.exit(1)

    success = convert_pdf_to_word(input_file, output_file)
    sys.exit(0 if success else 1)
