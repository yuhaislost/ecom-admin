'use client';

import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BillboardColumn } from "./columns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionProps{
    data: BillboardColumn;
};

export const CellAction = function({ data } : CellActionProps)
{
    const params = useParams();
    const router = useRouter();

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


    return (
        <>
            <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={isLoading}/>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button variant={'ghost'} className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        Actions
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/billboards/${data.id}`)} disabled={isLoading} className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4"/>
                        Update
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopy(data.id)} disabled={isLoading} className="cursor-pointer">
                        <Copy className="mr-2 h-4 w-4"/>
                        Copy Id
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpen(true)} disabled={isLoading} className="cursor-pointer">
                        <Trash className="mr-2 h-4 w-4"/>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}