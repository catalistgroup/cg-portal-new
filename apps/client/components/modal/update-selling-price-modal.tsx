'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CatalogType } from '@/lib/types';

export default function UpdateSellingPriceModal({
  product,
  isOpen,
  onClosePress = () => {},
  onSavePress = () => {},
}: {
  isOpen: boolean;
  product: CatalogType | null;
  onClosePress: () => void;
  onSavePress: (data: {
    selling_status: boolean;
    buying_price: string;
  }) => void;
}) {
  const [isActive, setIsActive] = useState(true);
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsActive(product?.selling_status || true);
      setPrice(product?.buying_price?.toString?.() || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    onSavePress({
      selling_status: isActive,
      buying_price: price,
    });
    onClosePress();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClosePress}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Price Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Selling Status
            </Label>
            <Select
              value={isActive.toString()}
              onValueChange={(value) => setIsActive(value === 'true')}
              //  className="col-span-3"
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Buying Price
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="col-span-3"
            />
          </div>
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
