/**
 * Future Considerations:
 * - Don't clear the states when users try to upload but cancels the operation
 */

'use client'

import { useState, useEffect, useRef } from 'react';
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
  const canvasRef = useRef(null);

  // --- Event Handler for File Change ---
  const handleFileChange = (event) => {

    
    const file = event.target.files[0];

    if (!file) return;

    // Resetting state and canva for new file
    setSelectedFile(null);
    setFileName('');
    setPdfDoc(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Setting New File's State
    setSelectedFile(file);
    setFileName(file.name);

    console.log("User uploaded:", file);    // May need to get rid of for privacy concerns

  }

  // --- Loading the PDF into Reader After Getting File Object ---
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

  }, [selectedFile]);  // Only rerenders when users add/change file

  useEffect(()=> {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async (pageNum) => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({scale: 1.0});
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }
        await page.render(renderContext).promise;
        console.log(`Page ${pageNum} rendered`);

      } catch (renderError){
        console.error(`Error rendering page ${pageNum}`, renderError);
        setError(`Failed to render page ${pageNum}: ${renderError.message}`);
      }
    };

    renderPage(1);

  }, [pdfDoc]);        // Only rerenders when the pdfDoc is loaded and available

  return (
    <div>

      <h1>Select a PDF: </h1>

      <input 
        type='file'
        accept='application/pdf'
        onChange={handleFileChange}
      />

      {isLoading && <p>Loading PDF...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {fileName && <p>Selected: {fileName}</p>}
      {numPages > 0 && <p>Number of Pages: {numPages}</p>}

      {/* Canvas Container */}
      <div style={{ border: '1px solid black', marginTop: '20px', width: 'fit-content' }}>
          <canvas ref={canvasRef}></canvas>
      </div>

    </div>
    

  )
}