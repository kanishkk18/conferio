// // import { NextRequest, NextResponse } from 'next/server'
// // import { getFileUrlService } from '@/lib/services/files'

// // export async function GET(
// //   req: NextRequest,
// //   { params }: { params: { fileId: string } }
// // ) {
// //   try {
// //     const { stream, contentType, fileSize } = await getFileUrlService(params.fileId)

// //     const headers = new Headers({
// //       'Content-Type': contentType,
// //       'Content-Length': fileSize.toString(),
// //       'Cache-Control': 'public, max-age=3600',
// //       'Content-Disposition': 'inline',
// //       'X-Content-Type-Options': 'nosniff',
// //     })

// //     // Convert stream to response
// //     const response = new NextResponse(stream as any, {
// //       status: 200,
// //       headers,
// //     })

// //     return response
// //   } catch (error) {
// //     console.error('Get file error:', error)
// //     return NextResponse.json(
// //       { message: 'File not found' },
// //       { status: 404 }
// //     )
// //   }
// // }

// import { NextRequest, NextResponse } from 'next/server'
// import { getFileUrlService } from '@/lib/services/files'

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { fileId: string } }
// ) {
//   try {
//     const { stream, contentType, fileSize } = await getFileUrlService(params.fileId)

//     // Create a readable stream from the response
//     const readableStream = new ReadableStream({
//       start(controller) {
//         stream.on('data', (chunk) => {
//           controller.enqueue(chunk)
//         })
//         stream.on('end', () => {
//           controller.close()
//         })
//         stream.on('error', (err) => {
//           controller.error(err)
//         })
//       },
//       cancel() {
//         stream.destroy()
//       }
//     })

//     const headers = new Headers({
//       'Content-Type': contentType,
//       'Content-Length': fileSize.toString(),
//       'Cache-Control': 'public, max-age=3600',
//       'Content-Disposition': 'inline',
//       'X-Content-Type-Options': 'nosniff',
//     })

//     return new NextResponse(readableStream, {
//       status: 200,
//       headers,
//     })
//   } catch (error) {
//     console.error('Get file error:', error)
//     return NextResponse.json(
//       { message: 'File not found' },
//       { status: 404 }
//     )
//   }
// }
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function FileViewPage() {
  const router = useRouter();
  const { fileId } = router.query;
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (fileId) {
      // Set the URL to the API route
      setFileUrl(`/api/files/${fileId}`);
      
      // Determine file type based on extension (in a real app, this would come from API)
      const extension = fileId.toString().split('.').pop()?.toLowerCase() || '';
      
      if (['pdf'].includes(extension)) {
        setFileType('pdf');
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
        setFileType('image');
      } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
        setFileType('video');
      } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        setFileType('audio');
      } else {
        setFileType('other');
      }
      
      setIsLoading(false);
    }
  }, [fileId]);

  const handleDownload = () => {
    // In a real application, this would trigger the download
    window.open(fileUrl, '_blank');
  };

  const handleGoBack = () => {
    router.back();
  };

}