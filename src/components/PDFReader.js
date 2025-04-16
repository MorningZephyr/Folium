/**
 * Future Considerations:
 * - Don't clear the states when users try to upload but cancels the operation
 */

'use client'

import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Setting the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'

export default function PDFReader() {

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null)

  // --- Event Handler for File Change ---
  const handleFileChange = (event) => {

    
    const file = event.target.files[0];

    if (!file) return;

    // Resetting State for New File
    setSelectedFile(null);
    setFileName('');

    // Setting New File's State
    setSelectedFile(file);
    setFileName(file.name);

    console.log("User uploaded:", file);    // May need to get rid of for privacy concerns

  }

  // --- Loading the PDF After Getting File Object ---
  useEffect(() => {


    if (!selectedFile) return;

    const loadPDF = async () => {
      setIsLoading(true);
      setError(null);
      setPdfDoc(null);

      try {
        const reader = new FileReader();

        // --- Defines what to do when reader finishes reading file ---
        reader.onload = async (e) => {

          

        }

        // --- Defines what to do when reader has error ---
        reader.onerror = (e) => {
          
          console.error("FileReader error:", e);
          setError("Failed to read file");
          setIsLoading(false);

        }

        // --- Reader reads raw file bytes ---
        reader.readAsArrayBuffer(selectedFile);
      
      } catch (err) {

        console.error("Error setting up FileReader:", err);
        setError(`Failed setup: ${err.message}`);
        setIsLoading(false);

      }

    }

    loadPDF();


  }, [selectedFile])  // Only rerenders when users add/change file


  return (
    <div>

        <h1>Select a PDF: </h1>

        <input 
          type='file'
          accept='application/pdf'
          onChange={handleFileChange}
        />

        {fileName && <p>Selected file: {fileName}</p>}

    </div>
    

  )
}