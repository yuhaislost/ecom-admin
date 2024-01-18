 "use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ReactNode, useEffect, useState } from "react";
import { ApiList } from "@/components/ui/api-list";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { toast } from "sonner";
import axios from "axios";
import { AlertModal } from "@/components/modals/alert-modal";

interface OrderClientProps{
    data: OrderColumn[]
};

 export const OrderClient = function({ data } : OrderClientProps)
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
            <Heading title={`Orders (${data.length})`} description="View the orders inside your store"/>
            <Separator/>
            <DataTable columns={columns} data={data} searchKey="phone"/>
        </>
    );
}