 "use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CategoryColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ReactNode, useEffect, useState } from "react";
import { ApiList } from "@/components/ui/api-list";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { toast } from "sonner";
import axios from "axios";
import { AlertModal } from "@/components/modals/alert-modal";

interface CategoryClientProps{
    data: CategoryColumn[]
};

 export const CategoryClient = function({ data } : CategoryClientProps)
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
                <Heading title={`Categories (${data.length})`} description="Manage the categories inside your store"/>
                <Button onClick={() => router.push(`/${params.storeId}/categories/new`)}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add New
                </Button>
            </div>
            <Separator/>
            <DataTable columns={columns} data={data} searchKey="name" />
            <Heading title="API" description="API calls for categories"/>
            <Separator/>
            <ApiList entityName={'categories'} entityIdName={"categoryId"}/>
        </>
    );
}