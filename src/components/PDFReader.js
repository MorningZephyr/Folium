    //**Since PDFjs is designed to render PDF onto a <canvas>,
    //     we'll need a way to "reach in" inside it, thus
    //     using the useRef()
    //  */
    
'use client'

import {useRef} from 'react'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.1.91/build/pdf.worker.min.mjs';

export default function PDFReader() {

    const canvasRef = useRef(null);

    // Handles what happens when user uploads a PDF
    const handleFileChange = (e) => {

        const file = e.target.files[0];

        // No file or invalid file type, warn user
        if (!file || file.type !== 'application/pdf')  {
            alert("No file or invalid file type");
            return;
        }

        console.log('User uploaded:', file.name);

        // Initialize Reader from JS
        const reader = new FileReader();

        // Tells reader what to do after the file reading from below is finished
        reader.onload = async function () {

            console.log('File loaded');
            console.log(this.result);       // this.result is the ArrayBuffer of binaries of the pdf
            
            // Converting the raw binaries to Uint8Array for PDFjs
            const typedArray = new Uint8Array(this.result);
            console.log('First few bytes of the file:', typedArray.slice(0, 10));   // For tesing purpose, privacy concerns

            // Loading and parsing the PDF, aka PDFLoadingTask object representing the in-process load
            const loadingTask = getDocument({data: typedArray});

            // When loading is finished, store the parsed PDF. It is now a PDFDocumentProxy object of the PDFjs
            const loadedPDF = await loadingTask.promise;
            console.log('PDF loaded');

            // Getting the first page
            const page = await loadedPDF.getPage(1);
            // ???
            const viewport = page.getViewport({scale: 1});


            // --- Canva config


            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = viewport.width
            canvas.height = viewport.height;

            const renderContext = {
                canvasContext: context, viewport,
            };

            page.render(renderContext);

        }

        // Reader will read the file as pure raw binary
        reader.readAsArrayBuffer(file);






    }

    return (
        <div>
            <input 
                type='file' 
                accept='application/pdf' 
                onChange={handleFileChange}
            />

            <canvas ref={canvasRef}></canvas>

        </div>
    )
}