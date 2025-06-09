import React from "react";

interface AddToCartIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
  stroke?: string;
  title?: string;
}

const AddToCartIcon: React.FC<AddToCartIconProps> = ({
  width = 48,
  height = 48,
  className = "",
  fill = "none",
  stroke = "#2D3748", // Tailwind slate-800
  title = "Add to Cart",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 64 64"
    fill={fill}
    stroke={stroke}
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-label={title}
  >
    {title && <title>{title}</title>}
    {/* Cart Body */}
    <path d="M8 10h6l8 32h26l6-20H18" />
    {/* Wheels */}
    <circle cx="26" cy="52" r="3" fill={stroke} stroke="none" />
    <circle cx="46" cy="52" r="3" fill={stroke} stroke="none" />
    
  </svg>
);

export default AddToCartIcon;
