import React from "react";

interface HeartIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
  stroke?: string;
  title?: string;
}

const HeartIcon: React.FC<HeartIconProps> = ({
  width = 48,
  height = 48,
  className = "",
  fill = "none",
  stroke = "#DC2626", // Tailwind red-600
  title = "Heart Icon",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={width}
    height={height}
    className={className}
    fill={fill}
    stroke={stroke}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label={title}
  >
    {title && <title>{title}</title>}
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

export default HeartIcon;
