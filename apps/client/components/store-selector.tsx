"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check, Store } from "lucide-react"

// Mock data for stores
const stores = [
  { id: "1", name: "ABC Store" },
  { id: "2", name: "XYZ Store" },
  { id: "3", name: "123 Mart" },
  { id: "4", name: "Global Retail" },
]

export function StoreSelector() {
  const router = useRouter()
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId)
  }

  const handleContinue = async () => {
    if (!selectedStore) return

    setIsLoading(true)

    try {
      // Simulate API call to set the selected store
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Navigate to store home page
      router.push(`/store/${selectedStore}`)
    } catch (error) {
      console.error("Failed to select store:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Select a Store</CardTitle>
        <CardDescription className="text-center">Choose a store to manage</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedStore || ""} onValueChange={handleStoreSelect} className="space-y-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className={`flex items-center space-x-2 rounded-md border p-4 transition-all ${
                selectedStore === store.id
                  ? "border-black bg-black/5 shadow-sm"
                  : "hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem value={store.id} id={`store-${store.id}`} />
              <Label htmlFor={`store-${store.id}`} className="flex flex-1 items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-black/5">
                    <Store className="h-4 w-4" />
                  </div>
                  <span>{store.name}</span>
                </div>
                {selectedStore === store.id && <Check className="h-5 w-5 text-green-500" />}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Button onClick={handleContinue} className="w-full mt-6" disabled={!selectedStore || isLoading}>
          {isLoading ? "Loading..." : "Continue"}
        </Button>
      </CardContent>
    </Card>
  )
}
