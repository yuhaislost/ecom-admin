'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useStoreModal } from "@/hooks/use-store-modal";
import { Modal } from "@/components/modal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import axios from 'axios';
import { AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { redirect } from 'next/navigation';


const formSchema = z.object({
    name: z.string().min(1),
})

export const StoreModal = function()
{
    const storeModal = useStoreModal();

    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
        },
    });

    const onSubmit = async function(values : z.infer<typeof formSchema>)
    {
        setLoading(true);

        const promise = axios.post('/api/stores', values);

        toast.promise(promise, {
            loading: 'Creating a store...',
            success: (res: AxiosResponse<any,any>) => {
                window.location.assign(`/${res.data.id}`);
                return `${res.data.name} has been created!`
            }, 
            error: "Something went wrong while creating a store."
        });

        setLoading(false);

        // try{
        //     setLoading(true);
        //     toast.loading("Creating a store.");

        //     const res = await axios.post('/api/stores', values);
            
        //     console.log(res.data);
        //     toast.success("Created a store.");
        // }catch(error)
        // {
        //     toast.error("Something went wrong while creating a store!");
        // } finally {
        //     setLoading(false);
        // }
    }

    return (
        <Modal title="Create store" description={"Add a new store to manage products and categories"} isOpen={storeModal.isOpen} onClose={storeModal.onClose}>
            <div>
                <div className='space-y-4 py-2 pb-4 '>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder={"E-commerce store"} {...field} autoComplete='off'/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}/>
                            <div className='pt-6 space-x-2 flex items-center justify-end w-full'>
                                <Button variant={'outline'} onClick={storeModal.onClose} disabled={loading}>
                                    Cancel
                                </Button>
                                <Button type='submit' disabled={loading}>
                                    Continue
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </Modal>
    );
}