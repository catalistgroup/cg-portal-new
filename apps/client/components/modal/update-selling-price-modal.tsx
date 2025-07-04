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
import { Checkbox } from '@/components/ui/checkbox';
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
    selling_price: string;
    moq: number;
    profitable: boolean | null;
    force_profitable_manual: boolean;
    force_selling_price_manual: boolean;
  }) => void;
}) {
  const [isSelling, setIsSelling] = useState(true);
  const [isProfitable, setIsProfitable] = useState<boolean | null>(null);
  //   const [price, setPrice] = useState('');
  //   const [isChecked, setIsChecked] = useState(false);
  const [forceProfitable, setForceProfitable] = useState(false);
  const [forceSellingPrice, setForceSellingPrice] = useState(false);
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [moq, setMOQ] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIsProfitable(product?.profitable ?? null);
      setIsSelling(product?.selling_status ?? false);
      setBuyingPrice(product?.buying_price?.toString() ?? '');
      setSellingPrice(product?.selling_price?.toString() ?? '');
      setMOQ(product?.moq ?? 0);
      setForceProfitable(false);
      setForceSellingPrice(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSavePress({
      selling_status: isSelling,
      buying_price: buyingPrice,
      selling_price: sellingPrice,
      moq: moq,
      profitable: isProfitable,
      force_profitable_manual: forceProfitable,
      force_selling_price_manual: forceSellingPrice,
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
            <div className="col-span-3">
              <Select
                value={isSelling.toString()}
                onValueChange={(value) => setIsSelling(value === 'true')}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Profitable Status
            </Label>
            <div className="col-span-3">
              <Select
                value={isProfitable?.toString?.()}
                onValueChange={(value) => setIsProfitable(value === 'true')}
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
          <div className="grid grid-cols-4 items-center gap-4 pl-10">
            <div className="col-span-4 flex items-center space-x-2">
              <Checkbox
                id="forceProfitable"
                checked={forceProfitable}
                onCheckedChange={(checked) => setForceProfitable(checked as boolean)}
              />
              <Label htmlFor="forceProfitable">Force Profitable</Label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="buyingPrice" className="text-right">
              Buying Price
            </Label>
            <Input
              id="buyingPrice"
              type="number"
              value={buyingPrice}
              onChange={(e) => setBuyingPrice(e.target.value)}
              placeholder="0.00"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="moq" className="text-right">
              MOQ
            </Label>
            <Input
              id="moq"
              type="number"
              value={moq}
              onChange={(e) => setMOQ(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sellingPrice" className="text-right">
              Selling Price
            </Label>
            <Input
              id="sellingPrice"
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="0.00"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4 pl-10">
            <div className="col-span-4 flex items-center space-x-2">
              <Checkbox
                id="forceSellingPrice"
                checked={forceSellingPrice}
                onCheckedChange={(checked) => setForceSellingPrice(checked as boolean)}
              />
              <Label htmlFor="forceSellingPrice">Force Selling Price</Label>
            </div>
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
