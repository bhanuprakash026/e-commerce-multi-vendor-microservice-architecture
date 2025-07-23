"use client"
import ImagePlaceHolder from '@/shared/modules/auth/components/image-placehoder.tsx';
import { ChevronRight } from 'lucide-react';
import React, { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Input from '../../../../../../../packages/components/input';
import ColorSelector from "../../../../../../../packages/components/color-selector/index"
import CustomSpecifications from '../../../../../../../packages/components/custom-specifications';
import CustomProperties from '../../../../../../../packages/components/custom-properties';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';

const Page = () => {
    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm();
    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [images, setImages] = useState<(File | null)[]>([null]);
    const [loading, setLoading] = useState(false)

    const { data, isLoading, isError } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/product/api/get-categories");
                return res.data;
            } catch (error) {
                console.log(error);
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2

    });

    const categories = data?.categories || [];
    const subCategoriesData = data?.subCategories || [];

    // In React hook form we have function called watch, which is get the value of select tag without using useState
    const selectedCategory = watch("category");
    const regularPrice = watch("regular_price");

    const subCategories = useMemo(() => {
        return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
    }, [selectedCategory, subCategoriesData])

    console.log(categories, subCategoriesData);

    const onSubmit = (data: any) => {
        console.log(data);
    };

    const handleImageChange = (file: File | null, index: number) => {
        const updatedImages = [...images];

        updatedImages[index] = file;
        if (index === images.length - 1 && images.length < 8) {
            updatedImages.push(null);

            setImages(updatedImages);
            setValue("images", updatedImages)
        }
    }

    const handleRemoveImage = (index: number) => {
        setImages((prevImages) => {
            let updatedImages = [...prevImages];
            if (index === -1) {
                updatedImages[0] = null;
            } else {
                updatedImages.splice(index, 1);
            };

            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null);
            }
            return updatedImages
        });

        setValue("images", images)
    }

    return (
        <form className=' w-full mx-auto p-8 shadow-md rounded-lg text-white'
            onSubmit={handleSubmit(onSubmit)}
        >
            <h2 className='text-2xl py-2 font-semibold font-Poppins text-white'>Create Product</h2>
            <div className="flex items-center">
                <span className='text-[#80deea] cursor-pointer'>Dashboard</span>
                <ChevronRight size={20} className='opacity-[0.8]' />
                <span>Create Product</span>
            </div>
            {/* Content Layout */}
            <div className='py-4 w-full flex gap-6'>
                {/* Left side - Image upload section */}
                <div className='md:w-[35%]'>
                    {images?.length > 0 && (
                        <ImagePlaceHolder
                            size="765 x 850"
                            setOpenImageModal={setOpenImageModal}
                            small={false}
                            index={0}
                            onImageChange={handleImageChange}
                            onRemove={handleRemoveImage}
                        />
                    )}

                    <div className='grid grid-cols-2 gap-3 mt-4'>
                        {images.slice(1).map((_, index) => (
                            <ImagePlaceHolder
                                size="765 x 850"
                                key={index}
                                setOpenImageModal={setOpenImageModal}

                                small
                                index={index + 1}
                                onImageChange={handleImageChange}
                                onRemove={handleRemoveImage}
                            />
                        ))}
                    </div>
                </div>


                {/* Right side */}
                <div className='md:w-[65%]'>
                    <div className='w-full flex gap-6'>
                        {/* Product Title Input */}
                        <div className="w-2/4">
                            <Input
                                label="Product Title *"
                                placeholder='Enter Product title'
                                {...register("title", { required: "Title is Required!" })}
                            />
                            {errors.title && (
                                <p className='text-red-500 text-xs mt-1'>{errors.title.message as string}</p>
                            )}

                            <div className='mt-2'>
                                <Input
                                    type='textarea'
                                    rows={7}
                                    cols={10}
                                    label='Short Descripton * ( Max 10 words)'
                                    placeholder='Enter product description for quick view'
                                    {...register("description", {
                                        required: "Description is required",
                                        validate: (value) => {
                                            const worCount = value.trim().split(/\s+/).length;
                                            return (
                                                worCount <= 150 ||
                                                `Description cannot exceed 150 words (Current: ${worCount})`
                                            );
                                        }
                                    })}
                                />

                                {errors.description && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.description.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label="Tags *"
                                    placeholder='apple, flagship'
                                    {...register("tags", {
                                        required: "Seperate related products tags with a coma, ",
                                    })}
                                />

                                {errors.tags && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.tags.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label="Warranty *"
                                    placeholder='1 Year / No Warranty'
                                    {...register("warranty", {
                                        required: "Warranty is required!",
                                    })}
                                />

                                {errors.warranty && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.warranty.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label="Slug *"
                                    placeholder='product_slug'
                                    {...register("tags", {
                                        required: "Slug is required!",
                                        pattern: {
                                            value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                            message: "Invalid slug format! Only lowercase letters, numbers, and hyphens are allowed. Must start and end with a letter or number, and hyphens cannot be consecutive."
                                        },
                                        minLength: {
                                            value: 3,
                                            message: "Slug must be at least 3 Charancters long."
                                        },
                                        maxLength: {
                                            value: 50,
                                            message: "Slug cannot be longer thatn 50 characters."
                                        }
                                    })}
                                />

                                {errors.tags && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.tags.message as string}</p>
                                )}
                            </div>

                            <div className='mt-2'>
                                <Input
                                    label="Brand"
                                    placeholder='Apple'
                                    {...register("brand")}
                                />

                                {errors.brand && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.brand.message as string}</p>
                                )}
                            </div>

                            <div className="mt-2">
                                <ColorSelector control={control} errors={errors} />
                            </div>

                            <div className="mt-2">
                                <CustomSpecifications control={control} errors={errors} />
                            </div>

                            <div className="mt-2">
                                <CustomProperties control={control} errors={errors} />
                            </div>

                            <div className='mt-2'>
                                <label className='block font-semibold text-gray-300 mb-1'>Cash On Delivery *</label>
                                <select defaultValue="yes"
                                    className='w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md'
                                    {...register("cash_on_delivery", {
                                        required: "Cash on Delivery is required"
                                    })}
                                >
                                    <option className='bg-black' value="yes">Yes</option>
                                    <option className='bg-black' value="no">No</option>
                                </select>
                                {errors.cash_on_delivery && (
                                    <p className='text-red-500 text-xs mt-1'>{errors.cash_on_delivery.message as string}</p>
                                )}
                            </div>
                        </div>

                        <div className="w-2/4">
                            <label className='block font-semibold tex-gray-300 mb-1'>Category *</label>
                            {isLoading ? (
                                <p className='text-gray-400'>Loading Categories ...</p>
                            ) : isError ? (
                                <p className='text-red-500'>Failed to Load Categories</p>
                            ) : (
                                <Controller
                                    name="category"
                                    control={control}
                                    rules={{ required: "Category is Required" }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className='w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md'
                                        >
                                            <option value="" className='bg-black'>
                                                Select Category
                                            </option>
                                            {categories?.map((category: string) => (
                                                <option
                                                    key={category}
                                                    value={category}
                                                    className='bg-black'
                                                >
                                                    {category}
                                                </option>
                                            ))}

                                        </select>
                                    )}
                                />
                            )}
                            {errors.category && (
                                <p className='text-red-500 text-xs mt-1'>{errors.category.message as string}</p>
                            )}

                            <div className="mt-2">
                                <label className='block font-semibold tex-gray-300 mb-1'>
                                    Subcategory *
                                </label>
                                <Controller
                                    name="subcategory"
                                    control={control}
                                    rules={{ required: "Subcategoy is Required" }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className='w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md'
                                        >
                                            <option value="" className='bg-black'>
                                                Select Category
                                            </option>
                                            {subCategories?.map((category: string) => (
                                                <option
                                                    key={category}
                                                    value={category}
                                                    className='bg-black'
                                                >
                                                    {category}
                                                </option>
                                            ))}

                                        </select>
                                    )}
                                />
                                {errors.subcategory && (
                                <p className='text-red-500 text-xs mt-1'>{errors.subcategory.message as string}</p>
                            )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>



        </form>
    )
}

export default Page