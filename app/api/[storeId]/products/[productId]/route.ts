import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: {storeId: string, productId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse("Unauthenticated", {status: 401});
        }

        if (!params.productId || !params.storeId)
        {
            return new NextResponse("Store ID and Product ID are both required.", {status: 400});
        }
        
        const body = await req.json();
        const { name, price, categoryId, colourId, sizeId, images, isArchived, isFeatured } = body;

        if (!name || !price || !categoryId || !colourId || !sizeId || !images || !images.length)
        {
            return new NextResponse('Name, Price, Category, Colour, size and images are required!', {status: 400});
        }
        

        const store = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId: userId
            }
        });

        if (!store)
        {
            return new NextResponse("Unauthorised.", {status: 403});
        }

        await prismadb.product.update({
            where: {
                id: params.productId,
                storeId: params.storeId
            },
            data: {
                name: name,
                price: price,
                categoryId: categoryId,
                colourId: colourId,
                sizeId: sizeId,
                images:   {
                    deleteMany: {}
                },
                isFeatured: isFeatured,
                isArchived: isArchived
            }
        });

        const product = await prismadb.product.update({
            where: {
                id: params.productId
            },
            data: {
                images: {
                    createMany: {
                        data: [
                            ...images.map((image : { url : string}) => image),
                        ]
                    }
                }
            }
        })
        
        return NextResponse.json(product);
        
    }catch(error)
    {
        console.log('[PRODUCT_PATCH]', error);
        return new NextResponse("Internal error", {status: 500});
    }
}

export async function DELETE(req: Request, { params } : { params: {storeId: string, productId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse("Unauthenticated", {status: 401});
        }

        if (!params.storeId || !params.productId)
        {
            return new NextResponse("Both a store and product ID is required.", {status: 400});
        }

        const store = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId: userId
            }
        });

        if (!store)
        {
            return new NextResponse("Unauthorised.", {status: 403});
        }

        const product = await prismadb.product.delete({
            where: {
                id: params.productId,
                storeId: params.storeId
            }
        });

        return NextResponse.json(product);
    }catch(error)
    {
        console.log('[PRODUCT_DELETE]', error);
        return new NextResponse("Internal Error", {status:500});
    }
}

export async function GET(req: Request, { params } : { params: {productId: string}})
{
    try{
        if (!params.productId)
        {
            return new NextResponse("Both a store and product ID is required.", {status: 400});
        }
        
        const product = await prismadb.product.findUnique({
            where: {
                id: params.productId
            },
            include: {
                images: true,
                category: true,
                size: true,
                colour: true
            }
        });

        return NextResponse.json(product);
    }catch(error)
    {
        console.log('[PRODUCT_GET]', error);
        return new NextResponse("Internal Error", {status:500});
    }
}