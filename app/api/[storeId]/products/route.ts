import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params } : { params: {storeId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse('Unauthenticated', {status: 401});
        }
        
        const body = await req.json();
        const { name, price, categoryId, colourId, sizeId, images, isArchived, isFeatured } = body;

        if (!name || !price || !categoryId || !colourId || !sizeId || !images || !images.length)
        {
            return new NextResponse('Name, Price, Category, Colour, size and images are required!', {status: 400});
        }
        
        if (!params.storeId)
        {
            return new NextResponse("Store ID is required", {status:400});
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId: userId
            }
        });

        if (!storeByUserId)
        {
            return new NextResponse("Unauthorised", {status:403});
        }

        const product = await prismadb.product.create({
            data: {
                name: name,
                price: price,
                categoryId: categoryId,
                colourId: colourId,
                sizeId: sizeId,
                isArchived: isArchived,
                isFeatured: isFeatured,
                storeId: params.storeId,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string}) => image)
                        ]
                    }
                }
            }
        });

        return NextResponse.json(product);

    }catch(error)
    {
        console.log('[PRODUCTS_POST]', error);
        return new NextResponse('Internal Error', {status: 500});
    }
}


export async function GET(req: Request, { params } : { params: {storeId: string}})
{
    try{
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId") || undefined;
        const colourId = searchParams.get("colourId") || undefined;
        const sizeId = searchParams.get("sizeId") || undefined;
        const isFeatured = searchParams.get("isFeatured");

        if (!params.storeId)
        {
            return new NextResponse("Store ID is required", {status:400});
        }

        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                colourId,
                sizeId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false
            },
            include : {
                images: true,
                category: true,
                colour: true,
                size: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(products);

    }catch(error)
    {
        console.log('[PRODUCTS_GET]', error);
        return new NextResponse('Internal Error', {status: 500});
    }
}