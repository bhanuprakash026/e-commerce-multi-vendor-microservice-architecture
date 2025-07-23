import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig= await prisma.site_config.findFirst();
    if(!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            "Electonics",
            "Fashion",
            "Home & Kitchen",
            "Sports & Fitness"
          ],
          subCategories: {
            "Electronics": ["Mobiles", "Laptops","Accessories","Gaming"],
            "Fashion": ["Men", "Woemn", "Footwear"],
            "Home & Kitchen": ["Furniure", "Appliances", "Decor"],
            "Sports & Fitness" : [
              "Gym Equipmen",
              "Oudoor Sports",
              "Wearables"
            ]
          }
        }
      })
    }
  } catch (error) {
    console.log("Error initializing sie config: ", error)
  }
};

export default initializeSiteConfig;