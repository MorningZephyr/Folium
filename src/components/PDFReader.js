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
  const [numPages, setNumPages] = useState(0)
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

        // --- Defines what to do when reader finishes reading file (Setup for PDfjs) ---
        reader.onload = async (e) => {

          try {
            
            // May happen when reading file is cancelled midway, or user upload 0 byte file
            if (!e.target?.result) throw new Error("Failed to read file"); 

            // Convert so pdfjs can interpret
            const typedArray = new Uint8Array(e.target.result);

            // PDFjs parsing the uint8array. Asynchronous, so immediately returns a 'loadingTask' object (similar to promise)
            const loadingTask = pdfjsLib.getDocument({data: typedArray});

            // Waits for the loading to finish. Result is a PDFDocumentProxy object, the parsed PDF
            const loadedPdfDoc = await loadingTask.promise;

            // Set the finished PDF to the state 
            setPdfDoc(loadedPdfDoc);
            setNumPages(loadedPdfDoc.numPages);
            setIsLoading(false);

          } catch (loadErr) {   // Catches error when loading and processing PDF into reader
            console.error("Error occurred in reader:", loadErr);
            setIsLoading(false);
            setError(`Error! Reader unable to load PDF: ${loadErr.message}`);
            setPdfDoc(null);
          }


        }

        // --- Defines what to do when reader has error ---
        reader.onerror = (e) => {   // Handles Error such as locked PDF/permission issues
          
          setIsLoading(false);
          console.error("FileReader error:", e);
          setError("Failed to read file. File may be locked.");

        }

        // --- Reader reads raw file bytes ---
        reader.readAsArrayBuffer(selectedFile);
      
      } catch (err) {     // Errors that occur when setting up the FileReader

        console.error("Error setting up FileReader:", err);
        setError(`Failed to set up the FileReader: ${err.message}`);
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
        <p>User uploaded: {fileName}</p>
        <p>Number of pages: {numPages}</p>

    </div>
    

  )
}