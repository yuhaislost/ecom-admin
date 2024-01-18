import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: {storeId: string, colourId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse("Unauthenticated", {status: 401});
        }

        if (!params.colourId || !params.storeId)
        {
            return new NextResponse("Store ID and Colour ID are both required.", {status: 400});
        }
        
        const body = await req.json();
        const { name, value } = body;

        if (!name || !value)
        {
            return new NextResponse("A value and a colour is required", {status:400});
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

        const colour = await prismadb.colour.update({
            where: {
                id: params.colourId,
                storeId: params.storeId
            },
            data: {
                name: name,
                value: value
            }
        });
        
        return NextResponse.json(colour);
        
    }catch(error)
    {
        console.log('[colour_PATCH]', error);
        return new NextResponse("Internal error", {status: 500});
    }
}

export async function DELETE(req: Request, { params } : { params: {storeId: string, colourId: string}})
{
    try{
        const { userId } = auth();

        if (!userId)
        {
            return new NextResponse("Unauthenticated", {status: 401});
        }

        if (!params.storeId || !params.colourId)
        {
            return new NextResponse("Both a store and colour ID is required.", {status: 400});
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

        const colour = await prismadb.colour.delete({
            where: {
                id: params.colourId,
                storeId: params.storeId
            }
        });

        return NextResponse.json(colour);
    }catch(error)
    {
        console.log('[COLOUR_DELETE]', error);
        return new NextResponse("Internal Error", {status:500});
    }
}

export async function GET(req: Request, { params } : { params: {storeId: string, colourId: string}})
{
    try{
        if (!params.colourId || !params.storeId)
        {
            return new NextResponse("Both a store and colour ID is required.", {status: 400});
        }
        
        const colour = await prismadb.colour.findUnique({
            where: {
                id: params.colourId
            }
        });

        return NextResponse.json(colour);
    }catch(error)
    {
        console.log('[COLOUR_GET]', error);
        return new NextResponse("Internal Error", {status:500});
    }
}