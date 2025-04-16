/**
 * Future Considerations:
 * - make this page ssr for faster initial loading
 */

'use client'
import dynamic from "next/dynamic";

// --- Client Side Rendering ---
const DynamicPDFReader = dynamic(
  () => import('@/components/PDFReader'),
  {
    ssr: false,
    loading: () => <p>Loading PDF Reader</p>
  }
);

export default function Home() {
  return (
  
    <DynamicPDFReader/>
      
  );
}
