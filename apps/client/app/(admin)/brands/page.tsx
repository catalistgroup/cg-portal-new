"use client"

import { useQuery } from "@tanstack/react-query"
import { getAllBrands } from "@/query/queryFn"
import { BrandType } from "@/types"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { BarChart3, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import { StoreType } from "@/lib/types"
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

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

export default function BrandEditPage({ storeId, user }: Props) {
  const baseClass = "rounded-full text-sm w-full md:w-auto"
  const pathname = usePathname()
  const isEditBrands = pathname === `/brands`
  const isModifyInventory = pathname === `/store/${storeId}/admin-inventory`
  const isAnalysis = pathname === `/store/${storeId}/analysis`
  const isOrders = pathname === `/store/${storeId}/orders`
  const router = useRouter()

  const { data = [] } = useQuery<BrandType[]>({
    queryKey: ["brands"],
    queryFn: () => getAllBrands(),
  })

  const [brands, setBrands] = useState<BrandType[]>(data)

  useEffect(() => {
    setBrands(data)
  }, [data])

  const allBrands: BrandType[] = [...brands]
  const [selectedBrands, setSelectedBrands] = useState<number[]>([])

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
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const mainBrandId = parseInt(result.value)
        const mainBrand = allBrands.find((b) => b.id === mainBrandId)

        // SECOND MODAL
        MySwal.fire({
          text: `Are you sure you want to keep ${mainBrand?.name} as brand name?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "Cancel",
        }).then((confirmResult) => {
          if (confirmResult.isConfirmed) {
            const mergedBrandIds = selected.map((b) => b.id)
            const newBrands = brands.filter(
              (b) => !mergedBrandIds.includes(b.id) || b.id === mainBrandId
            )

            setBrands(newBrands)
            setSelectedBrands([])

            MySwal.fire({
              icon: "success",
              title: "Merged",
            })

            // Send callback to API here with
            // - mainBrandId
            // - mergedBrandIds
          }
        })
      }
    })
  }

  return (
    <>
      {/* {user?.is_superuser && (
        <> */}
      <Button
        variant="outline"
        className={`${baseClass} ${isEditBrands ? "bg-catalogue_primary-background text-white" : "text-gray-600"}`}
        onClick={() => (window.location.href = `/brands`)}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Edit Brands
      </Button>
      <Button
        variant="outline"
        className={`${baseClass} ${isModifyInventory ? "bg-catalogue_primary-background text-white" : "text-gray-600"}`}
        onClick={() =>
          (window.location.href = `/store/${storeId}/admin-inventory`)
        }
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Modify Inventory
      </Button>
      {/* </>
      )} */}
      <Button
        variant="outline"
        className={`${baseClass} ${isAnalysis ? "bg-catalogue_primary-background text-white" : "text-gray-600"}`}
        onClick={() => (window.location.href = `/store/${storeId}/analysis`)}
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Master Catalogue
      </Button>
      <Button
        variant="outline"
        className={`${baseClass} ${isOrders ? "bg-catalogue_primary-background text-white" : "text-gray-600"}`}
        onClick={() => router.push(`/store/${storeId}/orders`)}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Purchase Orders
      </Button>

      {/* Brand name list */}
      <div className="p-6 bg-white rounded-xl shadow-lg max-w-3xl mx-auto">
        <div className="flex justify-end items-center mb-4 gap-4">
          <button
            onClick={handleMerge}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow-sm transition"
          >
            Merge
          </button>
          <button
            onClick={() => setSelectedBrands([])}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow-sm transition"
          >
            Clear
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Brand Name
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {brands.map((brand) => (
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
