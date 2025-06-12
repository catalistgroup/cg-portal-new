"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, BarChart, LineChart } from "@/components/ui/chart";

type DataItem = {
  date: string;
  revenue: number;
  profit: number;
  unitsSold: number;
};

type StoreChartsProps = {
  data?: DataItem[];
  isLoading: boolean;
};

export function StoreCharts({ data = [], isLoading }: StoreChartsProps) {
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  const { salesData, profitData, productData, revenueProfitData } =
    useMemo(() => {
      const safeData = data ?? [];

      const sales = [];
      const profits = [];
      const products = [];
      const revenueProfit = [];

      for (const item of safeData) {
        const formattedDate = formatDate(item.date);
        sales.push({ name: formattedDate, value: item.revenue });
        profits.push({ name: formattedDate, value: item.profit });
        products.push({ name: formattedDate, value: item.unitsSold });
        revenueProfit.push({
          name: formattedDate,
          revenue: item.revenue,
          profit: item.profit,
        });
      }

      return {
        salesData: sales,
        profitData: profits,
        productData: products,
        revenueProfitData: revenueProfit,
      };
    }, [data]);

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">
          Performance Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        <Tabs defaultValue="revenue_profit" className="w-full">
          <div className="px-4 sm:px-0">
            <TabsList className="mb-4 w-full overflow-x-auto flex-nowrap justify-start">
              <TabsTrigger value="revenue_profit">Revenue & Profit</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="profit">Profit</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-hidden w-full">
            <TabsContent value="revenue_profit" className="mt-0">
              {isLoading ? (
                <div className="px-4 sm:px-0">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <div className="w-full overflow-x-auto pb-4">
                  <div className="h-[250px] min-w-[500px] px-4 sm:px-0 sm:min-w-0">
                    <AreaChart
                      data={revenueProfitData}
                      index="name"
                      categories={["revenue", "profit"]}
                      colors={["#4F46E5", "#10B981"]}
                      valueFormatter={(value) => `$${value.toLocaleString()}`}
                      className="h-full"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sales" className="mt-0">
              {isLoading ? (
                <Skeleton className="h-[250px] w-full px-4 sm:px-0" />
              ) : (
                <div className="w-full overflow-x-auto pb-4">
                  <div className="h-[250px] w-full px-4 sm:px-0 sm:min-w-0">
                    <AreaChart
                      data={salesData}
                      index="name"
                      categories={["value"]}
                      colors={["#4F46E5", "#10B981"]}
                      valueFormatter={(value) => `$${value.toLocaleString()}`}
                      className="h-full"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="profit" className="mt-0">
              {isLoading ? (
                <Skeleton className="h-[250px] w-full px-4 sm:px-0" />
              ) : (
                <div className="w-full overflow-x-auto pb-4">
                  <div className="h-[250px] w-full px-4 sm:px-0 sm:min-w-0">
                    <LineChart
                      data={profitData}
                      index="name"
                      categories={["value"]}
                      colors={["#4F46E5", "#10B981"]}
                      valueFormatter={(value) => `$${value.toLocaleString()}`}
                      className="h-full"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              {isLoading ? (
                <Skeleton className="h-[250px] w-full px-4 sm:px-0" />
              ) : (
                <div className="w-full overflow-x-auto pb-4">
                  <div className="h-[250px] w-full px-4 sm:px-0 sm:min-w-0">
                    <BarChart
                      data={productData}
                      index="name"
                      categories={["value"]}
                      colors={["#4F46E5", "#10B981"]}
                      valueFormatter={(value) => `${value} units`}
                      className="h-full"
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
