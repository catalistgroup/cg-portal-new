'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BrandType } from '@/types';

export default function BrandUpdateModel({
  brand,
  isOpen,
  onClosePress = () => {},
  onSavePress = () => {},
}: {
  brand: BrandType | null;
  isOpen: boolean;
  onClosePress: () => void;
  onSavePress: (data: {
    selling_status: boolean;
    // profitable_status: boolean;
  }) => void;
}) {
  const [isBrandSelling, setIsBrandSelling] = useState('');
  // const [isBrandProfitable, setIsBrandProfitable] = useState('');

  const handleSave = () => {
    onSavePress({
      selling_status: isBrandSelling === 'true',
      // profitable_status: isBrandProfitable === 'true',
    });
    onClosePress();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClosePress}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Brand Update Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <p className="text-lg">You are updating:</p>
            <p className="text-lg font-bold">{brand?.name}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Selling Status
            </Label>
            <div className="col-span-3">
              <Select
                value={isBrandSelling.toString()}
                onValueChange={(value) => setIsBrandSelling(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Profitable Status
            </Label>
            <div className="col-span-3">
              <Select
                value={isBrandProfitable.toString()}
                onValueChange={(value) => setIsBrandProfitable(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div> */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClosePress}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
