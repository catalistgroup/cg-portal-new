'use client';

import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  label = 'Brand',
  placeholder = 'Select',
  disabled = false,
  className,
}: BrandDropdownProps) {
  const [search, setSearch] = useState('');
  const [filteredBrands, setFilteredBrands] = useState<BrandType[]>(brands);

  const fuse = useMemo(() => {
    return new Fuse(brands, {
      keys: ['name'],
      threshold: 0.3,
    });
  }, [brands]);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredBrands(brands);
    } else {
      const results = fuse.search(search).map((res) => res.item);
      setFilteredBrands(results);
    }
  }, [search, fuse, brands]);

  const handleValueChange = (value: string) => {
    if (value === '') {
      onBrandSelect(null);
      return;
    }
    const brand = brands.find((b) => b.id.toString() === value);
    onBrandSelect(brand || null);
  };

  return (
    <div className={cn('flex flex-col items-center gap-2 text-black', className)}>
      <p className="text-sm font-semibold w-full pb-[3px]">{label}</p>
      <Select
        disabled={disabled}
        value={selectedBrand?.id.toString() || ''}
        onValueChange={handleValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="p-0">
          {/* Fixed Search Input */}
          <div className="px-2 py-1 border-b bg-white sticky top-0 z-10">
            <Input
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pr-8 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-4 top-[50%] -translate-y-1/2 text-gray-500 hover:text-black"
              >
                X
              </button>
            )}
          </div>

          {/* Brand List */}
          <div className="max-h-60 overflow-auto">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  <div className="flex justify-between gap-2 w-full">
                    <span>{brand.name}</span>
                    <span className="text-muted-foreground">
                      ({brand!.all_catalog_count || brand!.profitable_and_selling})
                    </span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-2 text-sm text-gray-500">No results found</div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
