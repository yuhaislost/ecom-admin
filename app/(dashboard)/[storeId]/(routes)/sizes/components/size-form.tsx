'use client';

import { Trash } from "lucide-react";
import { Size } from "@prisma/client";
import * as z from 'zod';

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";;

interface SizeFormProps {
    initialData: Size | null
};

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1),
});

type SizeFormValues = z.infer<typeof formSchema>;


export const SizeForm = function({ initialData }: SizeFormProps)
{
    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? 'Edit size' : 'Create size'
    const description = initialData ? 'Edit a size' : 'Add a new size';
    const action = initialData ? 'Save changes' : 'Create';

    const form = useForm<SizeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            value: ''
        }
    });

    const onSubmit = async function(data: SizeFormValues)
    {
        setLoading(true);

        let promise;

        if (initialData)
        {
            promise = axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, data);
        }else{
            promise = axios.post(`/api/${params.storeId}/sizes`, data);
        }

        toast.promise(promise, {
            'loading': initialData ? 'Updating a size...' : 'Creating a size...',
            'success': (res) => {
                router.push(`/${params.storeId}/sizes`);
                router.refresh();
                return initialData ? 'Size updated.' : 'Size created.';
            },
            'error': initialData ? 'Failed to update a size.' : 'Failed to create a size.'
        });

        setLoading(false);
    }

    const onDelete = async function(){
        setLoading(true);
        const promise = axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`);
        
       toast.promise(promise, {
            'loading': "Deleting a size...",
            'success': (res) => {
                router.refresh();
                return 'Deleted a size!';
            },
            'error': 'Failed to delete a size.'
        });
        router.push(`/${params.storeId}/sizes`);
        setLoading(false);
        setOpen(false);
    }

    return(
        <>
            <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading}/>
            <div className="flex items-center justify-between">
                <Heading title={title} description={description}/>
                {
                    initialData && (
                        <Button variant='destructive' size="sm" onClick={() => setOpen(true)} className="flex gap-2">
                            <Trash className="h-4 w-4"/>
                            Delete size
                        </Button>
                )
                }
            </div>
            <Separator/>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <div className="grid grid-cols-3 gap-8">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Size name" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="value" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Value</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Size value" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                    </div>
                    <Button disabled={loading} className="ml-auto" type="submit">
                        {action}
                    </Button>
                </form>
            </Form>
            <Separator/>
        </>
    );
}