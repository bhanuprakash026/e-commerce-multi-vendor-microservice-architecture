import prisma from "../../../../packages/libs/prisma/index";
export const updateUserAnalytics = async (event: any) => {
  try {
    const existingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      }
    });

    let udpatedActions: any = existingData?.actions || [];

    const actionExists = udpatedActions.some((entry: any) => entry.productId === event.id && event.action === event.action);

    // Always strore `product_view` for recommendations
    if(event.action === "product_view") {
      udpatedActions.push({
        productId: event?.productId,
        shopId: event.shopId,
        actioon: "product_view",
        timeStamp: new Date()
      })
    }

    else if(["add_to_cart", "add_to_wishlist"].includes(event.action) && !actionExists) {
      udpatedActions.push({
        productId: event?.productId,
        shopId: event.shopId,
        actioon: event.action,
        timeStamp: new Date()
      })
    }
  } catch (error) {

  }
}