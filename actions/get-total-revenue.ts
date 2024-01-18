import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async function(storeId: string)
{
    const paidOrders = await prismadb.order.findMany({
        where: {
            storeId: storeId,
            isPaid: true
        },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            }
        }
    });

    const revenue = paidOrders.reduce((total, order) => {
        const orderT = order.orderItems.reduce((money, item) => {
            return money + item.product.price.toNumber();
        }, 0);

        return total + orderT;
    }, 0);

    return revenue;
}