// // import type { NextApiRequest, NextApiResponse } from 'next';

// // const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY!;

// // export default async function handler(req: NextApiRequest, res: NextApiResponse) {
// //   const baseQuery = req.query.q as string;

// //   if (!baseQuery) {
// //     return res.status(400).json({ error: 'Missing query parameter' });
// //   }

// //   const tags = ['nature', 'galaxy', 'world', 'professional', 'work'];
// //   const query = `${baseQuery} ${tags.join(' ')}`;

// //   const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=10`;

// //   try {
// //     const response = await fetch(url);
// //     const data = await response.json();

// //     if (data.hits && data.hits.length > 0) {
// //       const randomImage = data.hits[Math.floor(Math.random() * data.hits.length)];
// //       return res.status(200).json({ imageUrl: randomImage.webformatURL });
// //     } else {
// //       return res.status(404).json({ error: 'No image found' });
// //     }
// //   } catch (error) {
// //     return res.status(500).json({ error: 'Failed to fetch image' });
// //   }
// // }


// // pages/api/unsplash/search.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';

// const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getServerSession(req, res, authOptions);
//   if (!session) return res.status(401).json({ error: 'Unauthorized' });

//   if (req.method !== 'GET') {
//     res.setHeader('Allow', ['GET']);
//     return res.status(405).end();
//   }

//   const { query, page = '1', per_page = '12' } = req.query;

//   if (!query || typeof query !== 'string') {
//     return res.status(400).json({ error: 'Query required' });
//   }

//   if (!UNSPLASH_ACCESS_KEY) {
//     return res.status(500).json({ error: 'Unsplash not configured' });
//   }

//   try {
//     const response = await fetch(
//       `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`,
//       {
//         headers: {
//           Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
//         },
//       }
//     );

//     if (!response.ok) throw new Error('Unsplash API error');

//     const data = await response.json();
    
//     // Return simplified results
//     const images = data.results.map((img: any) => ({
//       id: img.id,
//       url: img.urls.regular,
//       thumb: img.urls.small,
//       alt: img.alt_description || img.description || 'Unsplash image',
//       author: img.user.name,
//       authorUrl: img.user.links.html,
//     }));

//     return res.status(200).json({ images, total: data.total });
//   } catch (error) {
//     console.error('Unsplash search error:', error);
//     return res.status(500).json({ error: 'Failed to search images' });
//   }
// }

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const { query, page = '1', per_page = '12' } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query required' });
  }

  if (!UNSPLASH_ACCESS_KEY) {
    return res.status(500).json({ error: 'Unsplash not configured' });
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`,
      {
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) throw new Error('Unsplash API error');

    const data = await response.json();
    
    const images = data.results.map((img: any) => ({
      id: img.id,
      url: img.urls.regular,
      thumb: img.urls.small,
      alt: img.alt_description || img.description || 'Unsplash image',
      author: img.user.name,
      authorUrl: img.user.links.html,
    }));

    return res.status(200).json({ images, total: data.total });
  } catch (error) {
    console.error('Unsplash search error:', error);
    return res.status(500).json({ error: 'Failed to search images' });
  }
}