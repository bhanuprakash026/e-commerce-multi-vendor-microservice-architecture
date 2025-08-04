

// get product category

import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma";
import { imagekit } from "@packages/libs/imagekit";
import { AuthError, NotFoundError, ValidationError } from "@packages/error-handler";

// get Product categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({ message: "Categories not found" });
    }

    return res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });

  } catch (error) {
    return next(error)
  }
}

// Create discount codes
export const createDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode
      }
    });

    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          "Discount code already available please use a different code!"
        )
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id
      }
    });

    res.status(200).json({
      success: true,
      discount_code
    });

  } catch (error) {
    next(error);
  }
};

// get all discount are available for seller
export const getDiscountCodes = async (req: any, res: Response, next: NextFunction) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id
      }
    });

    res.status(201).json({
      success: true,
      discount_codes
    });

  } catch (error) {
    next(error)
  }
};

// delete discount code
export const deleteDiscountCode = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id // Because seller should allowed delete only his discounts.

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true }
    });

    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError("Unauthorized access!"));
    }

    await prisma.discount_codes.delete({ where: { id } });

    return res.status(200).json({
      message: "Discount code successfully deleted"
    });

  } catch (error) {
    next(error)
  }
};

// Upload Product Image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileData, originalName } = req.body;

    if (!fileData) {
      return res.status(400).json({ message: "Missing image data" });
    }

    const response = await imagekit.upload({
      file: fileData, // Just the base64 data without prefix
      fileName: originalName || `product-${Date.now()}.jpg`,
      folder: "/products",
    });



    return res.status(201).json({
      file_url: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("ImageKit upload error:", error?.message || error);
    }
    console.error("ImageKit upload error:", error);
    return next(error);
  }
};


// Deleting Product Image
export const deleteProductImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.body;
    const response = await imagekit.deleteFile(fileId);

    return res.status(201).json({
      success: true,
      response,
    })

  } catch (error) {
    return next(error);
  }
}

// Create a Product
export const createProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications,
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes,
      stock,
      sale_price,
      regular_price,
      subCategory,
      custom_properties,
      images = [],
    } = req.body;

    if (!title ||
      !slug ||
      !short_description ||
      !category ||
      !subCategory ||
      !sale_price ||
      !images ||
      !tags ||
      !stock ||
      !regular_price
    ) {
      return next(new ValidationError("Missing Required fields"));
    }

    if (!req.seller.id) {
      return next(new AuthError("only seller can create Products!"));
    }

    const slugChecking = await prisma.products.findUnique({
      where: {
        slug,
      }
    });

    if (slugChecking) {
      return next(
        new ValidationError("Slug already exist! Please use a different slug!")
      )
    }

    const newProduct = await prisma.products.create({
      data: {
        title,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId: req.seller?.shop?.id!,
        tags,
        brand,
        video_url,
        category,
        subCategory,
        colors: colors || [],
        discount_codes: Array.isArray(discountCodes) ? discountCodes.map((codeId: string) => codeId) : [],
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseInt(sale_price),
        regular_price: parseInt(regular_price),
        custom_properties: custom_properties || {},
        custom_specifications: custom_specifications || {},
        images: {
          connectOrCreate: Array.isArray(images)
            ? images
              .filter((img: any) => img && typeof img.fileId === "string" && typeof img.file_url === "string" && typeof img.userId === "string")
              .map((img: any) => ({
                where: {
                  userId: img.userId, // 🔁 must be unique in your Prisma schema
                },
                create: {
                  file_id: img.fileId,
                  url: img.file_url,
                  userId: img.userId,
                },
              }))
            : [],
        }


      },
      include: { images: true },
    });

    return res.status(200).json({
      sucess: true,
      newProduct
    })

  } catch (error) {
    return next(error)
  }
}