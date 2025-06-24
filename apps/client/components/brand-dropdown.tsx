'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { BrandType } from '@/types';

interface BrandDropdownProps {
  brands: BrandType[];
  selectedBrand?: BrandType | null;
  onBrandSelect: (brand: BrandType | null) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function BrandDropdown({
  brands,
  selectedBrand,
  onBrandSelect,
  label = 'Brand:',
  placeholder = 'Select a brand',
  disabled = false,
  className,
}: BrandDropdownProps) {
  const handleValueChange = (value: string) => {
    if (value === '') {
      onBrandSelect(null);
      return;
    }

    const brand = brands.find((b) => b.id.toString() === value);
    onBrandSelect(brand || null);
  };

  return (
    <div className={cn('flex items-center gap-2 text-black', className)}>
      <p className="text-sm font-medium">{label}</p>
      <Select
        disabled={disabled}
        value={selectedBrand?.id.toString() || ''}
        onValueChange={handleValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id.toString()}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
