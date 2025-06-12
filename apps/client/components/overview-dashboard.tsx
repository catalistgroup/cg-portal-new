"use client";

import React, { useState } from "react";
import { StoreMetrics } from "./store-metrics";
import { StoreCharts } from "./store-charts";
import { useQuery } from "@tanstack/react-query";
import { overviewByStoreId } from "@/query/queryFn";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DatePicker } from "@mantine/dates";
import { MantineProvider } from "@mantine/core";

type Props = {
  storeId: string;
};

type DateValue = {
  from: string;
  to: string;
};

const DEFAULT_DATE: DateValue = {
  from: "2025-05-06",
  to: "2025-05-22",
};

function DashboardOverview({ storeId }: Props) {
  const [date, setDate] = useState<DateValue>(DEFAULT_DATE);
  const { data, isLoading } = useQuery({
    queryKey: ["overview", storeId, date],
    queryFn: () => overviewByStoreId(storeId, date),
  });

  return (
    <>
      <div className="flex justify-end">
        <MantineProvider>
          <DatePickerWithRange value={date} onChange={setDate} />
        </MantineProvider>
      </div>
      <StoreMetrics isLoading={isLoading} metrics={data?.overview} />
      <StoreCharts data={data?.history} isLoading={isLoading} />
    </>
  );
}

type PickerProps = {
  value: DateValue;
  onChange: (d: DateValue) => void;
};

export function DatePickerWithRange({ value, onChange }: PickerProps) {
  const [popupOpen, setPopupOpen] = useState(false);

  const [anotherValue, setAnotherValue] = useState<
    [string | null, string | null]
  >([value.from, value.to]);

  return (
    <div className={cn("grid gap-2")}>
      <Popover
        open={popupOpen}
        onOpenChange={(e) => {
          if (e === false) {
            if (anotherValue.filter((f) => f).length != 2) {
              setTimeout(() => {
                setAnotherValue([value.from, value.to]);
              }, 300);
            }
          }
          setPopupOpen(e);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value.from && !value.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {value && value.from && value.to ? (
              <>
                {format(value.from, "LLL dd, y")} -{" "}
                {format(value.to, "LLL dd, y")}
              </>
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DatePicker
            type="range"
            value={anotherValue}
            onChange={(e) => {
              setAnotherValue(e);
              if (e.filter((f) => f).length == 2) {
                onChange({ from: e[0], to: e[1] });
                setTimeout(() => {
                  setPopupOpen(false);
                }, 100);
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DashboardOverview;
