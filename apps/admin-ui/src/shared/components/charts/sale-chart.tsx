"use client"
import Box from "../box"
import React from "react";
import Chart, { Props } from "react-apexcharts";

export const SalesChart = ({
    ordersData
}: {
    ordersData?: {
        month: string;
        count: number;
    }[];
}) => {
    const chartSeries: Props['series'] = [
        {
            name: "Sales",
            data: ordersData?.map((order) => order.count) || [31, 40, 28, 51, 42, 109, 100],
        }
    ];
}