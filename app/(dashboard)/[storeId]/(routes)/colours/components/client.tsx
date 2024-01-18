 "use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ColourColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { useEffect, useState } from "react";
import { ApiList } from "@/components/ui/api-list";

interface ColourClientProps{
    data: ColourColumn[]
};

 export const ColoursClient = function({ data } : ColourClientProps)
{
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const params = useParams();

    useEffect(()=>{
        setIsMounted(true);
    }, [setIsMounted]);

    if (!isMounted)
    {
        return null;
    }

    return(
        <>
            <div className="flex items-center justify-between">
                <Heading title={`Colours (${data.length})`} description="Manage the colours inside your store"/>
                <Button onClick={() => router.push(`/${params.storeId}/colours/new`)}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add New
                </Button>
            </div>
            <Separator/>
            <DataTable columns={columns} data={data} searchKey="name"/>
            <Heading title="API" description="API calls for Sizes"/>
            <Separator/>
            <ApiList entityName={'colours'} entityIdName={"colourId"}/>
        </>
    );
}