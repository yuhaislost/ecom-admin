 "use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BillboardColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ReactNode, useEffect, useState } from "react";
import { ApiList } from "@/components/ui/api-list";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { toast } from "sonner";
import axios from "axios";
import { AlertModal } from "@/components/modals/alert-modal";

interface BillboardClientProps{
    data: BillboardColumn[]
};

 export const BillboardClient = function({ data } : BillboardClientProps)
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

    interface selfContextMenuProps{
        children: ReactNode
        data: any;
    };

    const SelfContextMenu = function({children, data} : selfContextMenuProps)
    {
    
        const [isLoading, setIsLoading] = useState(false);
        const [open, setOpen] = useState(false);
    
        const onCopy = function(id: string)
        {
            navigator.clipboard.writeText(id);
            toast.success("Billboard Id copied to clipboard!");
        }
    
        const onDelete = function()
        {
            setIsLoading(true);
            const promise = axios.delete(`/api/${params.storeId}/billboards/${data.id}`);
    
            toast.promise(promise, {
                'loading': 'Deleting billboard...',
                'success': (res) => {
                    router.refresh();
                    return `Deleted the billboard '${data.label}'!`
                },
                'error': 'Failed to delete a billboard.'
            });
            setIsLoading(false);
            setOpen(false);
        }
    
        return(
            
            <ContextMenu>
                <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={isLoading}/>
                <ContextMenuTrigger asChild>
                    {children}
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem onClick={() => router.push(`/${params.storeId}/billboards/${data.id}`)} disabled={isLoading}>
                        Update
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => onCopy(data.id)} disabled={isLoading} >
                        Copy Id
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => setOpen(true)} disabled={isLoading}>
                        Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
        );
    }

    return(
        <>
            <div className="flex items-center justify-between">
                <Heading title={`Billboards (${data.length})`} description="Manage the billboards inside your store"/>
                <Button onClick={() => router.push(`/${params.storeId}/billboards/new`)}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Add New
                </Button>
            </div>
            <Separator/>
            <DataTable columns={columns} data={data} searchKey="label" contextMenu={SelfContextMenu}/>
            <Heading title="API" description="API calls for Billboards"/>
            <Separator/>
            <ApiList entityName={'billboards'} entityIdName={"billboardId"}/>
        </>
    );
}