import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from 'lib/auth'; // adjust path
import { prisma } from 'utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const userFound = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!userFound) {
      return res.status(404).json({ error: 'User not found.' });
    }

    /* default category setup... */
    const defaultCategory = await prisma.category.findFirst({
      where: { userId: userFound.id, name: 'default' },
    });

    if (!defaultCategory) {
      await prisma.category.create({
        data: { name: 'default', color: '#202dd9', icon: '👜', userId: userFound.id },
      });
    }

    const { method } = req;

    if (method === 'GET') {
      const categories = await prisma.category.findMany({
        where: { userId: userFound.id },
        select: { id: true, name: true, color: true, icon: true },
      });
      return res.status(200).json(categories);
    }

    if (method === 'POST') {
      const { name, color, icon } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required.' });
      if (name === 'default') return res.status(409).json({ error: 'Default category already exists.' });

      const newCategory = await prisma.category.create({
        data: { name, color: color || null, icon: icon || null, userId: userFound.id },
      });
      return res.status(201).json(newCategory);
    }

    if (method === 'PUT') {
      const { id, name, color, icon } = req.body;
      if (!id || !name) return res.status(400).json({ error: "'id' and 'name' are required fields." });

      const category = await prisma.category.findUnique({ where: { id } });
      if (!category || category.userId !== userFound.id) {
        return res.status(404).json({ error: 'Category not found.' });
      }
      if (category.name === 'default') {
        return res.status(403).json({ error: 'Default category cannot be modified.' });
      }

      const updatedCategory = await prisma.category.update({
        where: { id },
        data: { name, color: color || null, icon: icon || null },
      });
      return res.status(200).json(updatedCategory);
    }

    if (method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: "'id' is a required field." });

      const category = await prisma.category.findUnique({ where: { id } });
      if (!category || category.userId !== userFound.id) {
        return res.status(404).json({ error: 'Category not found.' });
      }

      await prisma.myTask.deleteMany({ where: { categoryId: id } });
      const deletedCategory = await prisma.category.delete({ where: { id } });

      if (category.name === 'default') {
        await prisma.category.create({
          data: { name: 'default', color: '#202dd9', icon: '👜', userId: userFound.id },
        });
      }

      return res.status(200).json({ message: 'Category deleted successfully.', deletedCategory });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error('Category API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}



// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getToken } from 'next-auth/jwt';
// import { prisma } from 'utils/db';

// const secret = process.env.NEXTAUTH_SECRET;

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   try {
//     const token = await getToken({ req, secret });

//     if (!token?.email) {
//       return res.status(401).json({ error: 'Unauthorized.' });
//     }

//     const userFound = await prisma.user.findUnique({
//       where: { email: token.email },
//     });

//     if (!userFound) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     /* -------------------------------------------------------
//        Ensure DEFAULT category exists
//     ------------------------------------------------------- */
//     const defaultCategory = await prisma.category.findFirst({
//       where: {
//         userId: userFound.id,
//         name: 'default',
//       },
//     });

//     if (!defaultCategory) {
//       await prisma.category.create({
//         data: {
//           name: 'default',
//           color: '#202dd9',
//           icon: '👜',
//           userId: userFound.id,
//         },
//       });
//     }

//     const { method } = req;

//     /* -------------------------------------------------------
//        GET categories
//     ------------------------------------------------------- */
//     if (method === 'GET') {
//       const categories = await prisma.category.findMany({
//         where: { userId: userFound.id },
//         select: {
//           id: true,
//           name: true,
//           color: true,
//           icon: true,
//         },
//       });

//       return res.status(200).json(categories);
//     }

//     /* -------------------------------------------------------
//        CREATE category
//     ------------------------------------------------------- */
//     if (method === 'POST') {
//       const { name, color, icon } = req.body;

//       if (!name) {
//         return res.status(400).json({ error: 'Name is required.' });
//       }

//       // Prevent duplicate "default"
//       if (name === 'default') {
//         return res
//           .status(409)
//           .json({ error: 'Default category already exists.' });
//       }

//       const newCategory = await prisma.category.create({
//         data: {
//           name,
//           color: color || null,
//           icon: icon || null,
//           userId: userFound.id,
//         },
//       });

//       return res.status(201).json(newCategory);
//     }

//     /* -------------------------------------------------------
//        UPDATE category
//     ------------------------------------------------------- */
//     if (method === 'PUT') {
//       const { id, name, color, icon } = req.body;

//       if (!id || !name) {
//         return res
//           .status(400)
//           .json({ error: "'id' and 'name' are required fields." });
//       }

//       const category = await prisma.category.findUnique({
//         where: { id },
//       });

//       if (!category || category.userId !== userFound.id) {
//         return res.status(404).json({ error: 'Category not found.' });
//       }

//       if (category.name === 'default') {
//         return res
//           .status(403)
//           .json({ error: 'Default category cannot be modified.' });
//       }

//       const updatedCategory = await prisma.category.update({
//         where: { id },
//         data: {
//           name,
//           color: color || null,
//           icon: icon || null,
//         },
//       });

//       return res.status(200).json(updatedCategory);
//     }

//     /* -------------------------------------------------------
//        DELETE category
//     ------------------------------------------------------- */
//     if (method === 'DELETE') {
//       const { id } = req.body;
    
//       if (!id) {
//         return res
//           .status(400)
//           .json({ error: "'id' is a required field." });
//       }
    
//       const category = await prisma.category.findUnique({
//         where: { id },
//       });
    
//       if (!category || category.userId !== userFound.id) {
//         return res.status(404).json({ error: 'Category not found.' });
//       }
    
//       // Delete tasks linked to category
//       await prisma.myTask.deleteMany({
//         where: {
//           categoryId: id,
//         },
//       });
    
//       // Delete category
//       const deletedCategory = await prisma.category.delete({
//         where: { id },
//       });
    
//       // Recreate default if it was deleted
//       if (category.name === 'default') {
//         await prisma.category.create({
//           data: {
//             name: 'default',
//             color: '#202dd9',
//             icon: '👜',
//             userId: userFound.id,
//           },
//         });
//       }
    
//       return res.status(200).json({
//         message: 'Category deleted successfully.',
//         deletedCategory,
//       });
//     }
    

//     res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
//     return res.status(405).end(`Method ${method} Not Allowed`);
//   } catch (error) {
//     console.error('Category API error:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }






// import { NextRequest, NextResponse } from "next/server";
// // import { prisma } from "utils/db";
// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]";


// export async function POST(request: NextRequest) {
//   try {
//     const data = await request.json();

//     if (!data.name) {
//       return NextResponse.json(
//         { error: "name is required field." },
//         { status: 400 }
//       );
//     }

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//     }

//     const userFound = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!userFound) {
//       return NextResponse.json({ error: "User not found." }, { status: 404 });
//     }

//     const newCategory = await prisma.category.create({
//       data: {
//         name: data.name,
//         color: data.color || null,
//         icon: data.icon || null,
//         userId: userFound.id,
//       },
//     });

//     return NextResponse.json(newCategory);
//   } catch (error) {
//     console.error("Error creating category:", error);
//     return NextResponse.json(
//       { error: "Something went wrong." },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//     }

//     const userFound = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!userFound) {
//       return NextResponse.json({ error: "User not found." }, { status: 404 });
//     }

//     const categories = await prisma.category.findMany({
//       where: {
//         userId: userFound.id,
//       },
//       select: {
//         id: true,
//         name: true,
//         color: true,
//         icon: true,
//       },
//     });

//     return NextResponse.json(categories, { status: 200 });
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return NextResponse.json(
//       { error: "An error occurred while fetching categories." },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const data = await request.json();

//     if (!data.id || !data.name) {
//       return NextResponse.json(
//         { error: "'id' and 'name' are required fields." },
//         { status: 400 }
//       );
//     }

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//     }

//     const userFound = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!userFound) {
//       return NextResponse.json({ error: "User not found." }, { status: 404 });
//     }

//     const updatedCategory = await prisma.category.update({
//       where: {
//         id: data.id,
//       },
//       data: {
//         name: data.name,
//         color: data.color || null,
//         icon: data.icon || null,
//       },
//     });

//     return NextResponse.json(updatedCategory, { status: 200 });
//   } catch (error) {
//     console.error("Error updating category:", error);
//     return NextResponse.json(
//       { error: "An error occurred while updating the category." },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const data = await request.json();

//     if (!data.id) {
//       return NextResponse.json(
//         { error: "'id' is a required field for deletion." },
//         { status: 400 }
//       );
//     }

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.email) {
//       return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//     }

//     const userFound = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!userFound) {
//       return NextResponse.json({ error: "User not found." }, { status: 404 });
//     }

//     await prisma.task.deleteMany({
//       where: {
//         id: data.id,
//       },
//     });

//     const deletedCategory = await prisma.category.delete({
//       where: {
//         id: data.id,
//       },
//     });

//     return NextResponse.json(
//       {
//         message: "Category and associated tasks deleted successfully.",
//         deletedCategory,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error deleting category and tasks:", error);
//     return NextResponse.json(
//       { error: "An error occurred while deleting the category and tasks." },
//       { status: 500 }
//     );
//   }
// }

// // pages/api/category/index.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getToken } from "next-auth/jwt";
// import { prisma } from "utils/db";

// const secret = process.env.NEXTAUTH_SECRET;

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   try {
//     // GET - Fetch categories
//     if (req.method === 'GET') {
//       const token = await getToken({ req, secret });
      
//       if (!token?.email) {
//         return res.status(401).json({ error: "Unauthorized." });
//       }

//       const userFound = await prisma.user.findUnique({
//         where: { email: token.email },
//       });

//       if (!userFound) {
//         return res.status(404).json({ error: "User not found." });
//       }

//       const categories = await prisma.category.findMany({
//         where: {
//           OR: [
//             { userId: userFound.id },
//             { userId: undefined } // Global categories
//           ]
//         }
//       });

//       return res.status(200).json(categories);
//     }

//     // POST - Create new category
//     if (req.method === 'POST') {
//       const data = req.body;
//       const token = await getToken({ req, secret });
      
//       if (!token?.email) {
//         return res.status(401).json({ error: "Unauthorized." });
//       }

//       const userFound = await prisma.user.findUnique({
//         where: { email: token.email },
//       });

//       if (!userFound) {
//         return res.status(404).json({ error: "User not found." });
//       }

//       if (!data.name) {
//         return res.status(400).json({ error: "Name is required." });
//       }

//       const newCategory = await prisma.category.create({
//         data: {
//           name: data.name,
//           color: data.color || '#000000',
//           userId: userFound.id
//         }
//       });

//       return res.status(201).json(newCategory);
//     }

//     // Handle unsupported methods
//     res.setHeader('Allow', ['GET', 'POST']);
//     return res.status(405).end(`Method ${req.method} Not Allowed`);
//   } catch (error) {
//     console.error('Error in category API:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }






// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getToken } from 'next-auth/jwt';
// import { prisma } from 'utils/db';

// const secret = process.env.NEXTAUTH_SECRET;

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const token = await getToken({ req, secret });

//     if (!token?.email) {
//       return res.status(401).json({ error: 'Unauthorized.' });
//     }

//     const userFound = await prisma.user.findUnique({
//       where: { email: token.email },
//     });

//     if (!userFound) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     const { method } = req;

//     if (method === 'GET') {
//       const categories = await prisma.category.findMany({
//         where: {
//           userId: userFound.id,
//         },
//         select: {
//           id: true,
//           name: true,
//           color: true,
//           icon: true,
//         },
//       });

//       return res.status(200).json(categories);
//     }

//     if (method === 'POST') {
//       const data = req.body;

//       if (!data.name) {
//         return res.status(400).json({ error: 'Name is required.' });
//       }

//       const newCategory = await prisma.category.create({
//         data: {
//           name: data.name,
//           color: data.color || null,
//           icon: data.icon || null,
//           userId: userFound.id,
//         },
//       });

//       return res.status(201).json(newCategory);
//     }

//     if (method === 'PUT') {
//       const data = req.body;

//       if (!data.id || !data.name) {
//         return res
//           .status(400)
//           .json({ error: "'id' and 'name' are required fields." });
//       }

//       const updatedCategory = await prisma.category.update({
//         where: {
//           id: data.id,
//         },
//         data: {
//           name: data.name,
//           color: data.color || null,
//           icon: data.icon || null,
//         },
//       });

//       return res.status(200).json(updatedCategory);
//     }

//     if (method === 'DELETE') {
//       const data = req.body;

//       if (!data.id) {
//         return res
//           .status(400)
//           .json({ error: "'id' is a required field for deletion." });
//       }

//       // First delete tasks related to the category
//       await prisma.task.deleteMany({
//         where: {
//           id: data.id,
//         },
//       });

//       const deletedCategory = await prisma.category.delete({
//         where: {
//           id: data.id,
//         },
//       });

//       return res.status(200).json({
//         message: 'Category and associated tasks deleted successfully.',
//         deletedCategory,
//       });
//     }

//     // Method not allowed
//     res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
//     return res.status(405).end(`Method ${method} Not Allowed`);
//   } catch (error) {
//     console.error('Error in category API:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }
