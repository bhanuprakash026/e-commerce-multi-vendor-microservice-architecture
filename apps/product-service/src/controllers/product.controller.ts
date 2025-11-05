

// get product category

import { Request, Response, NextFunction } from "express";
import prisma from "@packages/libs/prisma";
import { Prisma } from "@prisma/client";
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
        tags: tags.split(","),
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
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url

            })),
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

// get logged in seller products
export const getShopProducts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: {
        images: true,
      }
    });

    res.status(201).json({
      success: true,
      products
    });
  } catch (error) {
    return next(error)
  }
}

// delete Product
export const deleteProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const sellerId = req?.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true }
    });

    if (!product) {
      return next(new ValidationError("Product not found"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized action"));
    }

    if (product.isDeleted) {
      return next(new ValidationError("Product is already deleted"))
    }

    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    return res.status(200).json({
      message:
        "Product is scheduled for deletion in 24 Hours. You can restore it within this 24 Hours",
      deletedAt: deletedProduct?.deletedAt
    })
  } catch (error) {
    return next(error)
  }
}

// Restore Deleted Product with in 24 Hrs
export const restoreProduct = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true }
    });

    if (!product) {
      return next(new ValidationError("Product is not found"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized Action"))
    }

    if (!product.isDeleted) {
      return res
        .status(400)
        .json({ message: "Product is not in deleted state" });
    }

    await prisma.products.update({
      where: { id: productId },
      data: { isDeleted: false, deletedAt: null }
    });

    return res.status(200).json({ message: "Product Successfully restored!" });

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error retoring Product!", error });
  }
}

// get all Products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" }
        : { totalSales: "desc" };

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          Shop: {
            include: {
              avatar: true
            }
          },
        },
        // where: baseFilter,
        orderBy, // use the same order as top10
      }),

      prisma.products.count(),

      prisma.products.findMany({
        take: 10,
        // where: baseFilter,
        orderBy,
        include: {
          images: true,
          Shop: {
            include: {
              avatar: true
            }
          }
        }
      }),
    ]);

    res.status(200).json({
      products,
      top10By: type === "latest" ? "latest" : "topSales",
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// get product details
export const getProductDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.products.findUnique({
      where: {
        slug: req.params.slug!
      },
      include: {
        images: true,
        Shop: true,
      },
    });
    res.status(201).json({
      success: true,
      product,
    })
  } catch (error) {
    next(error)
  }
}

export const getFilteredProducts = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12
    } = req.query;

    const parsedPriceRange = typeof priceRange === "string" ? priceRange.split(",").map(Number) : [0, 10000];
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1]
      },
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories) ? categories : String(categories).split(",")
      }
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors]
      }
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.category = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes]
      }
    }

    console.log("filters:--", filters)

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          Shop: true
        }
      }),
      prisma.products.count({ where: filters })
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      }
    })

  } catch (error) {
    next(error);
  }
}

export const getFilteredEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      priceRange = [0, 10000],
      categories = [],
      colors = [],
      sizes = [],
      page = 1,
      limit = 12
    } = req.query;

    const parsedPriceRange = typeof priceRange === "string" ? priceRange.split(",").map(Number) : [0, 10000];
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1]
      },
      NOT: {
        starting_date: null,
      }
    };

    if (categories && (categories as string[]).length > 0) {
      filters.category = {
        in: Array.isArray(categories) ? categories : String(categories).split(",")
      }
    }

    if (colors && (colors as string[]).length > 0) {
      filters.colors = {
        hasSome: Array.isArray(colors) ? colors : [colors]
      }
    }

    if (sizes && (sizes as string[]).length > 0) {
      filters.category = {
        hasSome: Array.isArray(sizes) ? sizes : [sizes]
      }
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          images: true,
          Shop: true
        }
      }),
      prisma.products.count({ where: filters })
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      products,
      pagination: {
        total,
        page: parsedPage,
        totalPages,
      }
    })

  } catch (error) {
    next(error);
  }
}

export const getFilteredShops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 12;
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && String(categories).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(",")
      };
    }

    if (countries && String(countries).length > 0) {
      filters.country = {
        in: Array.isArray(countries)
          ? countries
          : String(countries).split(",")
      };
    }

    console.log("filters", filters)

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          products: true
        }
      }),
      prisma.shops.count({ where: filters })
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      shops,
      pagination: {
        total,
        page: parsedPage,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.params.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const products = await prisma.products.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { short_description: { contains: query, mode: "insensitive" } }
        ],
      },

      select: {
        id: true,
        title: true,
        slug: true
      },
      take: 10,
      orderBy: {
        createdAt: "desc"
      }
    });

    res.status(200).json({ products })

  } catch (error) {
    return next(error)
  }
}

export const top10Shops = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shops = await prisma.shops.findMany({
      orderBy: [
        { rating: "desc" },
        { reviews: { _count: "desc" } }
      ],
      take: 10,
      include: {
        _count: {
          select: { reviews: true, products: true }
        }
      }
    });


    res.status(200).json({
      success: true,
      message: "Top 10 shops fetched successfully",
      data: shops
    });

  } catch (error) {
    next(error)
  }
}

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const baseFilter = {
      AND: [{ starting_date: { not: null } }, { ending_date: { not: null } }]
    }
    const [events, total, top10BySales] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        where: baseFilter,
        include: {
          images: true,
          Shop: true
        },
        orderBy: {
          totalSales: "desc"
        },
      }),
      prisma.products.count({ where: baseFilter }),
      prisma.products.findMany({
        where: baseFilter,
        take: 10,
        orderBy: {
          totalSales: "desc"
        }

      })
    ]);

    res.status(200).json({
      events,
      top10BySales,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    res.status(500).json({message: "Failed to fetch events"})
  }
}