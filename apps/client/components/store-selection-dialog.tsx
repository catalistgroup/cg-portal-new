"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Store } from "lucide-react";
import { StoreType } from "@/lib/types";

// Mock data for stores

interface StoreSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStore: (storeId: string) => void;
  currentStoreId: string;
  stores: StoreType[];
}

export function StoreSelectionDialog({
  isOpen,
  onClose,
  onSelectStore,
  currentStoreId,
  stores,
}: StoreSelectionDialogProps) {
  const [selectedStore, setSelectedStore] = useState<string>(currentStoreId);

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
  };

  const handleConfirm = () => {
    onSelectStore(selectedStore);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a Store</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedStore}
            onValueChange={handleStoreSelect}
            className="space-y-3"
          >
            {stores.map((store) => (
              <div
                key={store.id}
                className={`flex items-center space-x-2 rounded-md border p-4 transition-all ${
                  selectedStore === String(store.id)
                    ? "border-black bg-black/5 shadow-sm"
                    : "hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <RadioGroupItem
                  value={String(store.id)}
                  id={`store-${store.id}`}
                />
                <Label
                  htmlFor={`store-${store.id}`}
                  className="flex flex-1 items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-black/5">
                      <Store className="h-4 w-4" />
                    </div>
                    <span>{store.name}</span>
                  </div>
                  {selectedStore === String(store.id) && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleConfirm} className="rounded-full">
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
