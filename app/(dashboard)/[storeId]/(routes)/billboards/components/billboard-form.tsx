'use client';

import { Trash } from "lucide-react";
import { Billboard } from "@prisma/client";
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
import ImageUpload from "@/components/ui/image-upload";

interface BillboardFormProps {
    initialData: Billboard | null
};

const formSchema = z.object({
    label: z.string().min(1),
    imageUrl: z.string().min(1),
});

type BillboardFormValues = z.infer<typeof formSchema>;


export const BillboardForm = function({ initialData }: BillboardFormProps)
{
    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? 'Edit billboard' : 'Create billboard'
    const description = initialData ? 'Edit a billboard' : 'Add a new billboard';
    const action = initialData ? 'Save changes' : 'Create';

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            label: '',
            imageUrl: ''
        }
    });

    const onSubmit = async function(data: BillboardFormValues)
    {
        setLoading(true);

        let promise;

        if (initialData)
        {
            promise = axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data);
        }else{
            promise = axios.post(`/api/${params.storeId}/billboards`, data);
        }

        toast.promise(promise, {
            'loading': initialData ? 'Updating a billboard...' : 'Creating a billboard...',
            'success': (res) => {
                router.refresh();
                const { id } = res.data;
                router.push(`/${params.storeId}/billboards/${id}`);
                return initialData ? 'Billboard updated.' : 'Billboard created.';
            },
            'error': initialData ? 'Failed to update a billboard.' : 'Failed to create a billboard.'
        });

        setLoading(false);
    }

    const onDelete = async function(){
        setLoading(true);
        const promise = axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
        
       toast.promise(promise, {
            'loading': "Deleting a billboard...",
            'success': (res) => {
                router.refresh();
                return 'Deleted a billboard';
            },
            'error': 'Failed to delete a billboard.'
        });
        router.push(`/${params.storeId}/billboards`);
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
                            Delete billboard
                        </Button>
                )
                }
            </div>
            <Separator/>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background Image</FormLabel>
                                <FormControl>
                                    <ImageUpload value={field.value ? [field.value] : []} disabled={loading} onChange={(url) => field.onChange(url)} onRemove={() => field.onChange("")}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                    <div className="grid grid-cols-3 gap-8">
                        <FormField control={form.control} name="label" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Label</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Billboard label" {...field}/>
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