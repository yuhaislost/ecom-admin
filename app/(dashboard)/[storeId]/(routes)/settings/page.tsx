import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import prismadb from "@/lib/prismadb";
import { SettingsForm } from "./components/settings-form";

interface SettingsPagePropsP{
    params: {
        storeId: string;
    }
};

const SettingsPage = async function({ params }: SettingsPagePropsP)
{
    const { userId } = auth();
    if (!userId)
    {
        redirect("/sign-in");
    }

    const store = await prismadb.store.findFirst({
        where: {
            id: params.storeId,
            userId: userId
        }
    });

    if (!store)
    {
        redirect("/");
    }

    return(
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SettingsForm initialData={store}/>
            </div>
        </div>
    );
}

export default SettingsPage;