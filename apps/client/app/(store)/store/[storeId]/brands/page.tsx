"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getAllBrands } from "@/query/queryFn"
import { BrandType } from "@/types"
import { useEffect, useMemo, useState } from "react"
import { StoreType } from "@/lib/types"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/components/Toast"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"
import LoadingPopup from "@/components/loading-popup"
import api from "@/lib/api"
import APIConfiguration from "@/lib/endpoints"

const MySwal = withReactContent(Swal)

type Props = {
  storeId: string
  stores: StoreType[]
  user?: {
    id: string
    name: string
    email: string
    type: "normal" | "store"
    is_superuser: boolean
  }
}

type BrandItem = {
  id: number
  name: string
}

type MergeBrandPayload = {
  brands: BrandItem[]
  active_brand: BrandItem
}

export default function BrandEditPage({ storeId, user }: Props) {
  // fetches all brands from db
  const { data = [], isLoading } = useQuery<BrandType[]>({
    queryKey: ["brands"],
    queryFn: () => getAllBrands(),
  })

  const { errorToast, successToast } = useToast() // custom toast
  const [searchQuery, setSearchQuery] = useState("")
  const [brands, setBrands] = useState<BrandType[]>(data)
  const [isMerging, setIsMerging] = useState(false)
  const [selectedBrands, setSelectedBrands] = useState<number[]>([])
  const debouncedQuery = useDebounce(searchQuery, 300) // updates value after a delay
  const queryClient = useQueryClient()
  const allBrands: BrandType[] = [...brands]

  const filteredBrands = useMemo(() => {
    return data.filter((brand) =>
      brand.name?.toLowerCase().includes(debouncedQuery.toLowerCase())
    )
  }, [data, debouncedQuery])

  useEffect(() => {
    setBrands(data)
  }, [data])

  const handleCheckboxChange = (brandId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedBrands((prev) => [...prev, brandId])
    } else {
      setSelectedBrands((prev) => prev.filter((id) => id !== brandId))
    }
  }

  const handleMerge = () => {
    const selected = allBrands.filter((b) => selectedBrands.includes(b.id))

    if (selected.length < 2) {
      MySwal.fire({
        icon: "warning",
        title: "Select at least 2 brands to merge",
      })
      return
    }

    const brandOptions = selected
      .map(
        (b, index) => `
          <div style="text-align: left; margin-bottom: 5px;">
            <label>
              <input type="radio" name="mainBrand" value="${b.id}" ${
                index === 0 ? "checked" : ""
              } />
              ${b.name || "(No Brand)"}
            </label>
          </div>
        `
      )
      .join("")

    MySwal.fire({
      title: "Select the brand name you wish to keep",
      html: `<form id="merge-form">${brandOptions}</form>`,
      showCancelButton: true,
      confirmButtonText: "Continue",
      preConfirm: () => {
        const form = document.getElementById("merge-form") as HTMLFormElement
        const selectedRadio = form.querySelector<HTMLInputElement>(
          'input[name="mainBrand"]:checked'
        )
        if (!selectedRadio) {
          MySwal.showValidationMessage(
            "You must select one brand as the main name."
          )
          return
        }
        return selectedRadio.value
      },
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        const mainBrandId = parseInt(res.value)
        const mainBrand = allBrands.find((b) => b.id === mainBrandId)

        // SECOND MODAL
        MySwal.fire({
          text: `Are you sure you want to keep ${mainBrand?.name} as brand name?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed && mainBrand) {
            const payload = {
              brands: selected,
              active_brand: mainBrand,
            }

            mergeBrand(
              payload,
              setIsMerging,
              setSelectedBrands,
              successToast,
              errorToast,
              queryClient
            )
          }
        })
      }
    })
  }

  const mergeBrand = (
    payload: MergeBrandPayload,
    setIsMerging: (val: boolean) => void,
    setSelectedBrands: (val: number[]) => void,
    successToast: (msg: string) => void,
    errorToast: (msg: string) => void,
    queryClient: any
  ) => {
    setIsMerging(true)

    api
      .post(APIConfiguration.POST_BRAND_MERGE_ADMIN, payload)
      .then((res) => {
        successToast(res.data.message || "Brands merged successfully")

        // Refresh updated data from the server
        queryClient.invalidateQueries({ queryKey: ["brands"] })

        setSelectedBrands([])

        MySwal.fire({
          icon: "success",
          title: "Brands merged !",
        })
      })
      .catch((err) => {
        console.error("Merge error:", err)
        errorToast("Failed to merge brands")
      })
      .finally(() => {
        setIsMerging(false)
      })
  }

  return (
    <>
      <LoadingPopup isOpen={isLoading || isMerging} />
      {/* Brand name list */}
      <div className="w-screen">
        {/* buttons */}
        <div className="flex flex-col py-6 pl-4 max-w-screen-2xl mx-auto mt-10">
          <div>
            <h1 className="text-2xl font-bold">Edit Brands</h1>
          </div>

          <div className="flex items-center mb-4 gap-4">
            <div className="flex items-center gap-4 relative flex-1 w-full mt-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9 rounded-full border-black/10 w-1/2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <p className="text-base font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full shadow">
                <span className="font-bold text-gray-900">
                  {selectedBrands.length}
                </span>{" "}
                selected
              </p>
            </div>
            <button
              disabled={selectedBrands.length < 2}
              onClick={handleMerge}
              className={`text-white px-5 py-2 rounded-md shadow-sm transition
                ${selectedBrands.length < 2 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 cursor-pointer"}`}
            >
              Merge
            </button>
            <button
              onClick={() => setSelectedBrands([])}
              className={`text-white px-5 py-2 rounded-md shadow-sm transition
                ${selectedBrands.length < 1 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 cursor-pointer"}
                `}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-screen-2xl mx-auto px-4">
          <table className="w-full table-fixed divide-y divide-gray-200 border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 w-1/4">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-3/4">
                  Brand Name
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.id)}
                      onChange={(e) =>
                        handleCheckboxChange(brand.id, e.target.checked)
                      }
                      className="w-5 h-5 text-green-600 focus:ring-green-500 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-800">{brand.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
