import React from "react";

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  readOnly?: boolean;
}

const Ratings: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  size = 24,
  readOnly = true,
}) => {
  const safeRating = Math.max(0, Math.min(rating, maxRating));

  const stars = Array.from({ length: maxRating }, (_, i) => {
    const starValue = i + 1;
    if (safeRating >= starValue) {
      return "full"; 
    } else if (safeRating >= starValue - 0.5) {
      return "half";
    } else {
      return "empty";
    }
  });

  return (
    <div className="flex items-center gap-1">
      {stars.map((type, idx) => {
        switch (type) {
          case "full":
            return (
              <svg
                key={idx}
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="gold"
                stroke="gold"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10" />
              </svg>
            );
          case "half":
            return (
              <svg
                key={idx}
                width={size}
                height={size}
                viewBox="0 0 24 24"
              >
                <defs>
                  <linearGradient id={`halfGrad-${idx}`}>
                    <stop offset="50%" stopColor="gold" />
                    <stop offset="50%" stopColor="lightgray" />
                  </linearGradient>
                </defs>
                <polygon
                  points="12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10"
                  fill={`url(#halfGrad-${idx})`}
                  stroke="gold"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            );
          case "empty":
          default:
            return (
              <svg
                key={idx}
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="lightgray"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12,2 15,10 23,10 17,14 19,22 12,17 5,22 7,14 1,10 9,10" />
              </svg>
            );
        }
      })}
      <span className="ml-2 text-sm font-medium">{safeRating.toFixed(1)}</span>
    </div>
  );
};

export default Ratings;
