"use client";

import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, PercentIcon, Calculator } from "lucide-react";
import MetricCard from "./metrics-card";

interface Metrics {
  revenue: number;
  profit: number;
  roi: number;

  cogs: number;

  orders: number;
  unitsSold: number;
  profitPerAsin: number;
  margin: number;
}

type Props = {
  metrics?: Metrics;
  isLoading: boolean;
};

export function StoreMetrics({ metrics, isLoading }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard
        title="Revenue"
        value={metrics?.revenue}
        format="currency"
        loading={isLoading}
        icon={<DollarSign />}
        colors={{
          iconColor: "text-green-600",
          valueColor: "text-green-600",
        }}
      />
      <MetricCard
        title="Profit"
        value={metrics?.profit}
        format="currency"
        loading={isLoading}
        icon={<DollarSign />}
        colors={{
          iconColor: "text-blue-600",
          valueColor: "text-blue-600",
        }}
      />
      <MetricCard
        title="ROI"
        value={metrics?.roi}
        format="percentage"
        loading={isLoading}
        icon={<PercentIcon />}
        colors={{
          iconColor: "text-purple-600",
          valueColor: "text-purple-600",
        }}
      />
      <MetricCard
        title="Margin"
        value={metrics?.margin}
        format="percentage"
        loading={isLoading}
         icon={<PercentIcon />}
        colors={{
          iconColor: "text-yellow-600",
          valueColor: "text-yellow-600",
        }}
      />
      <MetricCard
        title="Orders"
        value={metrics?.orders}
        format="count"
        loading={isLoading}
        icon={<Calculator />}
        colors={{
          iconColor: "text-pink-600",
          valueColor: "text-pink-600",
        }}
      />
      <MetricCard
        title="Units Sold"
        value={metrics?.unitsSold}
        format="count"
        loading={isLoading}
        icon={<Calculator />}
        colors={{
          iconColor: "text-red-600",
          valueColor: "text-red-600",
        }}
      />
    </div>
  );
}
