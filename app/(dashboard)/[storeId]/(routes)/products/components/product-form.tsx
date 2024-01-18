'use client';

import { Trash } from "lucide-react";
import { Category, Colour, Image, Product, Size } from "@prisma/client";
import * as z from 'zod';

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";;
import ImageUpload from "@/components/ui/image-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductFormProps {
    initialData: Product & {
        images: Image[]
    }| null
    categories: Category[]
    colours: Colour[]
    sizes: Size[]
};

const formSchema = z.object({
    name: z.string().min(1),
    images: z.object({ url : z.string()}).array(),
    price: z.coerce.number().min(1),
    categoryId: z.string().min(1),
    colourId: z.string().min(1),
    sizeId: z.string().min(1),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional()
});

type ProductFormValues = z.infer<typeof formSchema>;


export const ProductForm = function({ initialData, categories, colours, sizes }: ProductFormProps)
{
    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? 'Edit product' : 'Create product'
    const description = initialData ? 'Edit a product' : 'Add a new product';
    const action = initialData ? 'Save changes' : 'Create';
    const defaultValues = initialData ? {...initialData, price: parseFloat(String(initialData?.price))} : {
        name: '',
        images: [],
        price: 0,
        categoryId: '',
        colourId: '',
        sizeId: '',
        isFeatured: false,
        isArchived: false,
    };

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
    });

    const onSubmit = async function(data: ProductFormValues)
    {
        setLoading(true);

        let promise;

        if (initialData)
        {
            promise = axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
        }else{
            promise = axios.post(`/api/${params.storeId}/products`, data);
        }

        toast.promise(promise, {
            'loading': initialData ? 'Updating a product...' : 'Creating a product...',
            'success': (res) => {
                router.push(`/${params.storeId}/products`);
                router.refresh();
                return initialData ? 'Product updated.' : 'Product created.';
            },
            'error': initialData ? 'Failed to update a product.' : 'Failed to create a product.'
        });

        setLoading(false);
    }

    const onDelete = async function(){
        setLoading(true);
        const promise = axios.delete(`/api/${params.storeId}/products/${params.productId}`);
        
       toast.promise(promise, {
            'loading': "Deleting a product...",
            'success': (res) => {
                router.refresh();
                return 'Deleted a product';
            },
            'error': 'Failed to delete a product.'
        });
        router.push(`/${params.storeId}/products`);
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
                            Delete a Product
                        </Button>
                )
                }
            </div>
            <Separator/>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
                    <FormField control={form.control} name="images" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                                <ImageUpload value={field.value.map((image)=>image.url)} disabled={loading} onChange={(url) => field.onChange([...field.value, {url}])} onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>
                    <div className="md:grid md:grid-cols-3 gap-8">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Product name" {...field} autoComplete="off"/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="price" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Product Price</FormLabel>
                                <FormControl>
                                    <Input type="number" disabled={loading} placeholder="9.99" {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="categoryId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue defaultValue={field.value} placeholder="Select a category"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        { categories.map((category) => (<SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="sizeId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Size</FormLabel>
                                <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue defaultValue={field.value} placeholder="Select a size"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        { sizes.map((size) => (<SelectItem key={size.id} value={size.id}>
                                            {size.name}
                                        </SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="colourId" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Size</FormLabel>
                                <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue defaultValue={field.value} placeholder="Select a colour"/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        { colours.map((colour) => (<SelectItem key={colour.id} value={colour.id}>
                                            {colour.name}
                                        </SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="isFeatured" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Featured
                                    </FormLabel>
                                    <FormDescription>
                                        This product will appear in featured section.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="isArchived" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange}/>
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Archived
                                        </FormLabel>
                                        <FormDescription>
                                            This will hide the product from anywhere in the store.
                                        </FormDescription>
                                </div>
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