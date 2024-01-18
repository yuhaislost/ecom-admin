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
        const { name, value } = body;

        if (!name || !value)
        {
            return new NextResponse('Value and name required', {status: 400});
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

        const colour = await prismadb.colour.create({
            data: {
                name: name, 
                value: value,
                storeId: params.storeId
            }
        });

        return NextResponse.json(colour);

    }catch(error)
    {
        console.log('[COLOURS_POST]', error);
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

        const colours = await prismadb.colour.findMany({
            where: {
                storeId: params.storeId
            }
        });

        return NextResponse.json(colours);

    }catch(error)
    {
        console.log('[COLOURS_GET]', error);
        return new NextResponse('Internal Error', {status: 500});
    }
}