'use client';

import { Trash } from "lucide-react";
import { Colour } from "@prisma/client";
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

interface ColourFormProps {
    initialData: Colour | null
};

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(4).regex(/^#/, {
        message: 'String must be a valid hex code',
    }),
});

type ColourFormValues = z.infer<typeof formSchema>;


export const ColourForm = function({ initialData }: ColourFormProps)
{
    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? 'Edit colour' : 'Create colour'
    const description = initialData ? 'Edit a colour' : 'Add a new colour';
    const action = initialData ? 'Save changes' : 'Create';

    const form = useForm<ColourFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            value: ''
        }
    });

    const onSubmit = async function(data: ColourFormValues)
    {
        setLoading(true);

        let promise;

        if (initialData)
        {
            promise = axios.patch(`/api/${params.storeId}/colours/${params.colourId}`, data);
        }else{
            promise = axios.post(`/api/${params.storeId}/colours`, data);
        }

        toast.promise(promise, {
            'loading': initialData ? 'Updating a colour...' : 'Creating a colour...',
            'success': (res) => {
                router.push(`/${params.storeId}/colours`);
                router.refresh();
                return initialData ? 'colour updated.' : 'colour created.';
            },
            'error': initialData ? 'Failed to update a colour.' : 'Failed to create a colour.'
        });

        setLoading(false);
    }

    const onDelete = async function(){
        setLoading(true);
        const promise = axios.delete(`/api/${params.storeId}/colours/${params.colourId}`);
        
       toast.promise(promise, {
            'loading': "Deleting a colour...",
            'success': (res) => {
                router.refresh();
                return 'Deleted a colour!';
            },
            'error': 'Failed to delete a colour.'
        });
        router.push(`/${params.storeId}/colours`);
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
                            Delete colour
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
                                    <Input disabled={loading} placeholder="Colour name" {...field} autoComplete="off"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="value" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Value</FormLabel>
                                <FormControl>
                                    <div className="flex items-center gap-x-4">
                                        <Input disabled={loading} placeholder="Colour value" {...field} autoComplete="off"/>
                                        <div className="border p-4 rounded-full" style={{ backgroundColor: field.value }}/>
                                    </div>
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