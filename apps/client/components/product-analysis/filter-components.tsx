"use client"

import React, { useEffect, useReducer } from "react"

import { Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { BrandDropdown } from "@/components/index"
import { BrandType } from "@/types"

export type FilterState = {
  priceComparator: string
  priceValue: string
  profitComparator: string
  profitValue: string
  marginComparator: string
  marginValue: string
  brand: BrandType | null
}

type FilterAction =
  | { type: "SET_PRICE_COMPARATOR"; payload: string }
  | { type: "SET_PRICE_VALUE"; payload: string }
  | { type: "SET_PROFIT_COMPARATOR"; payload: string }
  | { type: "SET_PROFIT_VALUE"; payload: string }
  | { type: "SET_MARGIN_COMPARATOR"; payload: string }
  | { type: "SET_MARGIN_VALUE"; payload: string }
  | { type: "SET_BRAND"; payload: BrandType | null }
  | { type: "RESET_FILTERS" }

export const initialFilterState: FilterState = {
  priceComparator: ">=",
  priceValue: "",
  profitComparator: ">",
  profitValue: "",
  marginComparator: ">",
  marginValue: "",
  brand: null,
}

type Props = {
  onFiltered?: (filters: FilterState) => void
  onCleared?: () => void
  brands: BrandType[]
}

export default function FilterComponent({
  onFiltered,
  onCleared,
  brands,
}: Props) {
  const [state, dispatch] = useReducer(
    (state: FilterState, action: FilterAction) => {
      switch (action.type) {
        case "SET_PRICE_COMPARATOR":
          return { ...state, priceComparator: action.payload }
        case "SET_PRICE_VALUE":
          return { ...state, priceValue: action.payload }
        case "SET_PROFIT_COMPARATOR":
          return { ...state, profitComparator: action.payload }
        case "SET_PROFIT_VALUE":
          return { ...state, profitValue: action.payload }
        case "SET_MARGIN_COMPARATOR":
          return { ...state, marginComparator: action.payload }
        case "SET_MARGIN_VALUE":
          return { ...state, marginValue: action.payload }
        case "SET_BRAND":
          return { ...state, brand: action.payload }
        case "RESET_FILTERS":
          return { ...initialFilterState }
        default:
          return state
      }
    },
    initialFilterState
  )

  const isAnalyzeDisabled =
    !state.priceValue.trim() &&
    !state.profitValue.trim() &&
    !state.marginValue.trim() &&
    !state.brand?.id

  const handleAnalyze = () => {
    if (!isAnalyzeDisabled) {
      onFiltered?.(state)
    }
  }

  useEffect(() => {
    handleAnalyze()
  }, [state])

  const handleClear = () => {
    dispatch({ type: "RESET_FILTERS" })
    onCleared?.()
  }

  return (
    <div className="pt-6 flex gap-y-6 flex-col lg:flex-row">
      <div className="grid flex-1 gap-6 md:grid-cols-3">
        {/* Price Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium min-w-10">Price:</span>
          <div className="flex flex-1 gap-2">
            <Select
              value={state.priceComparator}
              onValueChange={(v) =>
                dispatch({ type: "SET_PRICE_COMPARATOR", payload: v })
              }
            >
              <SelectTrigger className="w-20 rounded-l-full border-r-0 border-black/10">
                {state.priceComparator}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="=">is equal to</SelectItem>
                <SelectItem value=">">is greater than</SelectItem>
                <SelectItem value="<">is less than</SelectItem>
                <SelectItem value=">=">is greater than or equal to</SelectItem>
                <SelectItem value="<=">is less than or equal to</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Enter price"
              value={state.priceValue}
              onChange={(e) =>
                dispatch({ type: "SET_PRICE_VALUE", payload: e.target.value })
              }
              className="rounded-r-full border-black/10"
            />
          </div>
        </div>

        {/* Profit Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium min-w-10">Profit:</span>
          <div className="flex flex-1 gap-2">
            <Select
              value={state.profitComparator}
              onValueChange={(v) =>
                dispatch({ type: "SET_PROFIT_COMPARATOR", payload: v })
              }
            >
              <SelectTrigger className="w-20 rounded-l-full border-r-0 border-black/10">
                {state.profitComparator}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="=">is equal to</SelectItem>
                <SelectItem value=">">is greater than</SelectItem>
                <SelectItem value="<">is less than</SelectItem>
                <SelectItem value=">=">is greater than or equal to</SelectItem>
                <SelectItem value="<=">is less than or equal to</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Enter profit"
                value={state.profitValue}
                onChange={(e) =>
                  dispatch({
                    type: "SET_PROFIT_VALUE",
                    payload: e.target.value,
                  })
                }
                className="pr-8 rounded-r-full border-black/10"
              />
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                $
              </span>
            </div>
          </div>
        </div>

        {/* Margin Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium min-w-10">Margin:</span>
          <div className="flex flex-1 gap-2">
            <Select
              value={state.marginComparator}
              onValueChange={(v) =>
                dispatch({ type: "SET_MARGIN_COMPARATOR", payload: v })
              }
            >
              <SelectTrigger className="w-20 rounded-l-full border-r-0 border-black/10">
                {state.marginComparator}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="=">is equal to</SelectItem>
                <SelectItem value=">">is greater than</SelectItem>
                <SelectItem value="<">is less than</SelectItem>
                <SelectItem value=">=">is greater than or equal to</SelectItem>
                <SelectItem value="<=">is less than or equal to</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Enter margin"
                value={state.marginValue}
                onChange={(e) =>
                  dispatch({
                    type: "SET_MARGIN_VALUE",
                    payload: e.target.value,
                  })
                }
                className="pr-8 rounded-r-full border-black/10"
              />
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                %
              </span>
            </div>
          </div>
        </div>

        <BrandDropdown
          brands={brands}
          selectedBrand={state.brand}
          onBrandSelect={(v) => {
            dispatch({ type: "SET_BRAND", payload: v }), handleAnalyze()
          }}
        />
      </div>

      <div className="flex justify-end pl-5">
        <div className="flex gap-2">
          {/* <Button
              variant="outline"
              size="icon"
              onClick={() => dispatch({ type: "TOGGLE_FILTERS" })}
              aria-label="Toggle filters"
              className="rounded-full border-black/10"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button> */}

          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzeDisabled}
            className="rounded-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Analyze
          </Button>
          <Button
            variant="outline"
            size="default"
            disabled={isAnalyzeDisabled}
            onClick={handleClear}
            className="rounded-full"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
