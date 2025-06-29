"use client"
import ImagePlaceHolder from '@/shared/modules/auth/components/image-placehoder.tsx';
import { ChevronRight } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import Input from '../../../../../../../packages/components/input';

const Page = () => {
    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm();
    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [images, setImages] = useState<(File | null)[]>([null]);
    const [loading, setLoading] = useState(false)

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
                        
                    </div>
                </div>
            </div>

            </div>

            

        </form>
    )
}

export default Page