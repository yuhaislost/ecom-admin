import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: {storeId: string, billboardId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse("Unauthenticated", {status: 401});
        }

        if (!params.billboardId || !params.storeId)
        {
            return new NextResponse("Store ID and Billboard ID are both required.", {status: 400});
        }
        
        const body = await req.json();
        const { label, imageUrl } = body;

        if (!label || !imageUrl)
        {
            return new NextResponse("An image and a label is required", {status:400});
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

        const billboard = await prismadb.billboard.update({
            where: {
                id: params.billboardId,
                storeId: params.storeId
            },
            data: {
                imageUrl: imageUrl,
                label: label
            }
        });
        
        return NextResponse.json(billboard);
        
    }catch(error)
    {
        console.log('[BILLBOARD_PATCH]', error);
        return new NextResponse("Internal error", {status: 500});
    }
}

export async function DELETE(req: Request, { params } : { params: {storeId: string, billboardId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse("Unauthenticated", {status: 401});
        }

        if (!params.storeId || !params.billboardId)
        {
            return new NextResponse("Both a store and billboard ID is required.", {status: 400});
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

        const billboard = await prismadb.billboard.delete({
            where: {
                id: params.billboardId,
                storeId: params.storeId
            }
        });

        return NextResponse.json(store);
    }catch(error)
    {
        console.log('[BILLBOARD_DELETE]', error);
        return new NextResponse("Internal Error", {status:500});
    }
}

export async function GET(req: Request, { params } : { params: {billboardId: string}})
{
    try{
        if (!params.billboardId)
        {
            return new NextResponse("Both a store and billboard ID is required.", {status: 400});
        }
        
        const billboard = await prismadb.billboard.findUnique({
            where: {
                id: params.billboardId
            }
        });

        return NextResponse.json(billboard);
    }catch(error)
    {
        console.log('[BILLBOARD_GET]', error);
        return new NextResponse("Internal Error", {status:500});
    }
}