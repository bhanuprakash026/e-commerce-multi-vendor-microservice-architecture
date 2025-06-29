import React from "react";

const Logo: React.FC = () => {
  const gridSize = 4;
  const dotRadius = 4;
  const spacing = 12;
  const offset = (gridSize - 1) * spacing / 2;

  const dots = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      dots.push(
        <circle
          key={`${x}-${y}`}
          cx={x * spacing - offset + 32}
          cy={y * spacing - offset + 32}
          r={dotRadius}
          fill="white"
        />
      );
    }
  }

  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      style={{ backgroundColor: "black", borderRadius: "8px" }}
    >
      {dots}
    </svg>
  );
};

export default Logo;
