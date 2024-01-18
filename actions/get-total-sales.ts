import prismadb from "@/lib/prismadb"

export const getTotalSales = async function(storeId: string)
{
    const salesCount = await prismadb.order.count({
        where: {
            storeId: storeId,
            isPaid: true
        }
    });

    return salesCount;
}