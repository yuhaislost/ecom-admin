'use client';

import { Trash } from "lucide-react";
import { Billboard, Category } from "@prisma/client";
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
import { AlertModal } from "@/components/modals/alert-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryFormProps {
    initialData: Category | null;
    billboards: Billboard[];
};

const formSchema = z.object({
    name: z.string().min(1),
    billboardId: z.string().min(1),
});

type CategoryFormValues = z.infer<typeof formSchema>;


export const CategoryForm = function({ initialData, billboards }: CategoryFormProps)
{
    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? 'Edit category' : 'Create category'
    const description = initialData ? 'Edit a category' : 'Add a new category';
    const action = initialData ? 'Save changes' : 'Create';

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            billboardId: ''
        }
    });

    const onSubmit = async function(data: CategoryFormValues)
    {
        setLoading(true);

        let promise;

        if (initialData)
        {
            promise = axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, data);
        }else{
            promise = axios.post(`/api/${params.storeId}/categories`, data);
        }

        toast.promise(promise, {
            'loading': initialData ? 'Updating a category...' : 'Creating a category...',
            'success': (res) => {
                router.push(`/${params.storeId}/categories`);
                router.refresh();
                return initialData ? 'Category updated.' : 'Category created.';
            },
            'error': initialData ? 'Failed to update a category.' : 'Failed to create a category.'
        });

        setLoading(false);
    }

    const onDelete = async function(){
        setLoading(true);
        const promise = axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`);
        
       toast.promise(promise, {
            'loading': "Deleting a category...",
            'success': (res) => {
                router.refresh();
                return 'Deleted a category!';
            },
            'error': 'Failed to delete a category.'
        });
        router.push(`/${params.storeId}/categories`);
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
                            Delete Category
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
                                    <Input disabled={loading} placeholder="Category name" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="billboardId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Billboard</FormLabel>
                                <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue defaultValue={field.value} placeholder="Select a billboard"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        { billboards.map((billboard) => (<SelectItem key={billboard.id} value={billboard.id}>
                                            {billboard.label}
                                        </SelectItem>))}
                                    </SelectContent>
                                </Select>
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