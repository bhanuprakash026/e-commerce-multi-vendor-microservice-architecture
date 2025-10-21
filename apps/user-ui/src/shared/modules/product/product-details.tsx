import React from 'react'

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  return (
    <div className='w-full bg-[#f5f5f5] py-5'>
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
        { /* left column - product images */ }
        <div className="p-4">
          <div className="relative w-full">
            Bhanu
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails