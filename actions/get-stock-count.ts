import prismadb from "@/lib/prismadb"

export const getStockCount = async function(storeId: string)
{
    const stockCount = await prismadb.product.count({
        where: {
            storeId: storeId,
            isArchived: false
        }
    });

    return stockCount;
}