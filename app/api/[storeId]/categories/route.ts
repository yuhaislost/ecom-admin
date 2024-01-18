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
        const { name , billboardId } = body;

        if (!name || !billboardId)
        {
            return new NextResponse('Name and Billboard Id required', {status: 400});
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

        const category = await prismadb.category.create({
            data: {
                name: name,
                billboardId: billboardId,
                storeId: params.storeId
            }
        });

        return NextResponse.json(category);

    }catch(error)
    {
        console.log('[CATEGORIES_POST]', error);
        return new NextResponse('Internal Error', {status: 500});
    }
}


export async function GET(req: Request, { params } : { params: {storeId: string}})
{
    try{
        if (!params.storeId)
        {
            return new NextResponse("Store ID is required", {status:400});
        }

        const categories = await prismadb.category.findMany({
            where: {
                storeId: params.storeId
            },
            include: {
                billboard: true
            }
        });

        return NextResponse.json(categories);

    }catch(error)
    {
        console.log('[CATEGORIES_GET]', error);
        return new NextResponse('Internal Error', {status: 500});
    }
}