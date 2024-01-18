import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: {storeId: string, sizeId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse("Unauthenticated", {status: 401});
        }

        if (!params.sizeId || !params.storeId)
        {
            return new NextResponse("Store ID and Size ID are both required.", {status: 400});
        }
        
        const body = await req.json();
        const { name, value } = body;

        if (!name || !value)
        {
            return new NextResponse("A value and a size is required", {status:400});
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

        const size = await prismadb.size.update({
            where: {
                id: params.sizeId,
                storeId: params.storeId
            },
            data: {
                name: name,
                value: value
            }
        });
        
        return NextResponse.json(size);
        
    }catch(error)
    {
        console.log('[SIZE_PATCH]', error);
        return new NextResponse("Internal error", {status: 500});
    }
}

export async function DELETE(req: Request, { params } : { params: {storeId: string, sizeId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse("Unauthenticated", {status: 401});
        }

        if (!params.storeId || !params.sizeId)
        {
            return new NextResponse("Both a store and size ID is required.", {status: 400});
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

        const size = await prismadb.size.delete({
            where: {
                id: params.sizeId,
                storeId: params.storeId
            }
        });

        return NextResponse.json(size);
    }catch(error)
    {
        console.log('[SIZE_DELETE]', error);
        return new NextResponse("Internal Error", {status:500});
    }
}

export async function GET(req: Request, { params } : { params: {storeId: string, sizeId: string}})
{
    try{
        if (!params.sizeId || !params.storeId)
        {
            return new NextResponse("Both a store and size ID is required.", {status: 400});
        }
        
        const size = await prismadb.size.findUnique({
            where: {
                id: params.sizeId
            }
        });

        return NextResponse.json(size);
    }catch(error)
    {
        console.log('[SIZE_GET]', error);
        return new NextResponse("Internal Error", {status:500});
    }
}