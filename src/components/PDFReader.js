    //**Since PDFjs is designed to render PDF onto a <canvas>,
    //     we'll need a way to "reach in" inside it, thus
    //     using the useRef()
    //  */
    
'use client'

import { useRef, useState, useEffect } from 'react'


export default function PDFReader() {

    const canvasRef = useRef(null);
    const [pdfjsLib, setPdfjsLib] = useState(null)

    useEffect(() => {
        import('pdfjs-dist')
          .then((lib) => {
            // Set the worker source to point to your .mjs worker file
            lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs'
            setPdfjsLib(lib)
          })
          .catch((error) => {
            console.error('Failed to load pdfjs-dist:', error)
          })
      }, [])

    // Handles what happens when user uploads a PDF
    const handleFileChange = (e) => {
        const file = e.target.files[0]
    
        // Warn if there's no file or if the file type is invalid
        if (!file || file.type !== 'application/pdf') {
          alert('No file or invalid file type')
          return
        }
    
        console.log('User uploaded:', file.name)
    
        // Check if pdfjsLib is loaded; otherwise, warn the user
        if (!pdfjsLib) {
          alert('PDF library is still loading. Please try again in a moment.')
          return
        }
    
        // Read the file as an ArrayBuffer
        const reader = new FileReader()
        reader.onload = async function () {
          console.log('File loaded')
          console.log(this.result) // this.result is the ArrayBuffer of the PDF
    
          // Convert the raw binaries to Uint8Array for PDF.js
          const typedArray = new Uint8Array(this.result)
          console.log('First few bytes of the file:', typedArray.slice(0, 10)) // for testing purposes
    
          try {
            // Load and parse the PDF (returns a PDFLoadingTask)
            const loadingTask = pdfjsLib.getDocument({ data: typedArray })
            const loadedPDF = await loadingTask.promise
            console.log('PDF loaded')
    
            // Get the first page of the PDF
            const page = await loadedPDF.getPage(1)
    
            // Step 1: Set up scale and viewport
            const scale = 1
            const viewport = page.getViewport({ scale })
    
            // Step 2: Use device pixel ratio for sharper rendering
            const outputScale = window.devicePixelRatio || 1
    
            // Step 3: Get canvas context from ref
            const canvas = canvasRef.current
            const context = canvas.getContext('2d')
    
            // Step 4: Set canvas resolution (in pixels)
            canvas.width = viewport.width * outputScale
            canvas.height = viewport.height * outputScale
    
            // Step 5: Set canvas display size (in CSS pixels)
            canvas.style.width = `${viewport.width}px`
            canvas.style.height = `${viewport.height}px`
    
            // Step 6: Scale the canvas context
            context.setTransform(outputScale, 0, 0, outputScale, 0, 0)
    
            // Step 7: Render the page
            const renderContext = {
              canvasContext: context,
              viewport,
            }
            await page.render(renderContext).promise
          } catch (error) {
            console.error('Error rendering PDF:', error)
          }
        }
    
        reader.readAsArrayBuffer(file)
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