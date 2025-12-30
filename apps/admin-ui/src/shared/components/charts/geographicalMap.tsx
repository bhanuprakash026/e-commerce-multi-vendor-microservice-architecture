"use client"
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { motion, AnimatePresence } from "framer-motion";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const countryData = [
    { name: "United States of America", users: 120, sellers: 30 },
    { name: "India", users: 100, sellers: 20 },
    { name: "China", users: 80, sellers: 10 },
    { name: "Brazil", users: 60, sellers: 5 },
    { name: "Nigeria", users: 40, sellers: 3 },
    { name: "Pakistan", users: 20, sellers: 1 }
];

const getColor = (countryName: string) => {
    const country = countryData.find((c) => c.name === countryName);
    if (!country) return "#1e293b";
    const total = country.users + country.sellers;
    if (total > 100) return "#22c55e";
    if (total > 0) return "#3b82f6";
    return "#1e293b";
};

const GeograhicalMap = () => {
    const [hovered, setHovered] = useState<{
        name: string;
        users: number;
        sellers: number;
    } | null>(null);

    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    return (
        <div className="relative w-full px-0 py-5 overflow-visible">
            <ComposableMap
                projection="geoEqualEarth"
                projectionConfig={{
                    scale: 230,
                    center: [0, 10],
                }}
                width={1400}
                height={500}
                viewBox="0 0 1400 500"
                preserveAspectRatio="xMidYMid slice"
                style={{
                    width: "100%",
                    height: "35vh",
                    backgorund: "transparent",
                    margin: "0",
                    padding: "0",
                    display: "block",
                }}
            >
                <Geographies geographies={geoUrl} >
                    {({ geographies }) => (
                        geographies.map((geo) => {
                            const countryName = geo.properties.name;
                            const country = countryData.find((c) => c.name === countryName);
                            const color = getColor(countryName);

                            return (
                                <Geography
                                    key={countryName}
                                    geography={geo}
                                    fill={color}
                                    onMouseEnter={(e) => {
                                        const country = countryData.find((c) => c.name === countryName);
                                        if (country) {
                                            setHovered(country);
                                            setTooltipPosition({
                                                x: e.clientX,
                                                y: e.clientY,
                                            });
                                        }
                                    }}
                                    onMouseLeave={() => setHovered(null)}
                                />
                            )
                        })
                    )}
                </Geographies>

            </ComposableMap>

            {/** Tooltip with Animation */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                            position: "absolute",
                            top: tooltipPosition.y,
                            left: tooltipPosition.x,
                            background: "white",
                            padding: "8px 12px",
                            borderRadius: "4px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                            zIndex: 1000,
                        }}
                    >
                        <p>{hovered.name}</p>
                        <p>Users: {hovered.users}</p>
                        <p>Sellers: {hovered.sellers}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default GeograhicalMap;