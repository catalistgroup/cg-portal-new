import { CatalogType } from '@/lib/types';
import { FilterState } from './filter-components';
import { useMemo } from 'react';

function compareValue(
  itemValue: number,
  comparator: string,
  filterValue: number
): boolean {
  switch (comparator) {
    case '>=':
      return itemValue >= filterValue;
    case '<=':
      return itemValue <= filterValue;
    case '>':
      return itemValue > filterValue;
    case '<':
      return itemValue < filterValue;
    case '=':
      return itemValue === filterValue;
    default:
      return true; // if unknown comparator, do not filter out
  }
}

export function useFilteredCatalog(
  catalog: CatalogType[],
  filters: FilterState
): CatalogType[] {
  return useMemo(() => {
    // Parse filter values as numbers
    const priceVal = parseFloat(filters.priceValue);
    const profitVal = parseFloat(filters.profitValue);
    const marginVal = parseFloat(filters.marginValue);

    return catalog.filter((item) => {
      // Check price filter only if priceValue is a valid number
      if (
        !isNaN(priceVal) &&
        !compareValue(
          Number(item.selling_price),
          filters.priceComparator,
          priceVal
        )
      ) {
        return false;
      }

      // Check profit filter only if profitValue is valid
      if (
        !isNaN(profitVal) &&
        !compareValue(Number(item.profit), filters.profitComparator, profitVal)
      ) {
        return false;
      }

      // Check margin filter only if marginValue is valid
      if (
        !isNaN(marginVal) &&
        !compareValue(Number(item.margin), filters.marginComparator, marginVal)
      ) {
        return false;
      }

      // Check brand filter only if brand is valid
      if (filters.brand && item.brand !== filters.brand.name) {
        return false;
      }

      // If all filters passed
      return true;
    });
  }, [catalog, filters]);
}
