    //**Since PDFjs is designed to render PDF onto a <canvas>,
    //     we'll need a way to "reach in" inside it, thus
    //     using the useRef()
    //  */
    
'use client'

import {useRef, useState} from 'react'

export default function PDFReader() {
    
    const canvasRef = useRef(null)


    // For when user uploads a file
    const handleFileChange = async (e) => {
        const file = e.target.files[0]                              // .files is a built=in props, we just need the first file                           

        if (!file || file.type !== 'application/pdf') return        // No file enter or invalid format

        const reader = new FileReader()

        reader.onload = async function 
    }
}