'use client';

import { Trash } from "lucide-react";
import { Store } from "@prisma/client";
import * as z from 'zod';

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import prismadb from "@/lib/prismadb";
import axios from "axios";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";

interface SettingsFormProps {
    initialData: Store;
};

const formSchema = z.object({
    name: z.string().min(1),
});

type SettingsFormValues = z.infer<typeof formSchema>;


export const SettingsForm = function({ initialData }: SettingsFormProps)
{
    const params = useParams();
    const router = useRouter();
    const origin = useOrigin();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
    });

    const onSubmit = async function(data: SettingsFormValues)
    {
        setLoading(true);
        const promise = axios.patch(`/api/stores/${params.storeId}`, data);

        await toast.promise(promise, {
            'loading': 'Updating store...',
            'success': (res) => {
                router.refresh();
                return "Updated a store!"
            },
            'error': 'Failed to update a store'
        });
        setLoading(false);
    }

    const onDelete = async function(){
        setLoading(true);
        const promise = axios.delete(`/api/stores/${params.storeId}`);
        
       toast.promise(promise, {
            'loading': "Deleting a store...",
            'success': (res) => {
                router.refresh();
                router.push('/');
                return 'Deleted a store!';
            },
            'error': 'Unable to delete a store'
        });
        setLoading(false);
        setOpen(false);
    }

    return(
        <>
            <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading}/>
            <div className="flex items-center justify-between">
                <Heading title="Settings" description="Manage store preferences"/>
                <Button variant='destructive' size="sm" onClick={() => setOpen(true)} className="flex gap-2">
                    <Trash className="h-4 w-4"/>
                    Delete Store
                </Button>
            </div>
            <Separator/>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <div className="grid grid-cols-3 gap-8">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Store Name</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Store name" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        Save Changes
                    </Button>
                </form>
            </Form>
            <Separator/>
            <ApiAlert title="NEXT_PUBLIC_API_URL" description={`${origin}/api/${params.storeId}`} variant="public"/>
        </>
    );
}