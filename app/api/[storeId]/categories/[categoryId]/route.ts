import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: {storeId: string, categoryId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse("Unauthenticated", {status: 401});
        }

        if (!params.categoryId || !params.storeId)
        {
            return new NextResponse("Store ID and Category ID are both required.", {status: 400});
        }
        
        const body = await req.json();
        const { name, billboardId } = body;

        if (!name || !billboardId)
        {
            return new NextResponse("Name and Billboard Id is required", {status:400});
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

        const cateogry = await prismadb.category.update({
            where: {
                id: params.categoryId,
                storeId: params.storeId
            },
            data: {
                name: name,
                billboardId: billboardId
            }
        });
        
        return NextResponse.json(cateogry);
        
    }catch(error)
    {
        console.log('[CATEGORY_PATCH]', error);
        return new NextResponse("Internal error", {status: 500});
    }
}

export async function DELETE(req: Request, { params } : { params: {storeId: string, categoryId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse("Unauthenticated", {status: 401});
        }

        if (!params.storeId || !params.categoryId)
        {
            return new NextResponse("Both a store and category ID is required.", {status: 400});
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

        const category  = await prismadb.category.delete({
            where: {
                id: params.categoryId,
                storeId: params.storeId
            }
        });

        return NextResponse.json(category);
    }catch(error)
    {
        console.log('[CATEGORY_DELETE]', error);
        return new NextResponse("Internal Error", {status:500});
    }
}

export async function GET(req: Request, { params } : { params: {categoryId: string}})
{
    try{
        if (!params.categoryId)
        {
            return new NextResponse("Both a store and billboard ID is required.", {status: 400});
        }
        
        const category = await prismadb.category.findUnique({
            where: {
                id: params.categoryId
            },
            include:
            {
                billboard: true
            }
        });

        return NextResponse.json(category);
    }catch(error)
    {
        console.log('[CATEGORY_GET]', error);
        return new NextResponse("Internal Error", {status:500});
    }
}