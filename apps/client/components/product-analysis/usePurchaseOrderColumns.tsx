import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CatalogType } from "@/lib/types";
import { Input } from "../ui/input";

const QUANTITY_CHANGE_EVENT = "quantity-change";

class QuantityChangeEvent extends CustomEvent<{
  id: string;
  quantity: number;
}> {
  constructor(id: string, quantity: number) {
    super(QUANTITY_CHANGE_EVENT, {
      detail: { id, quantity },
      bubbles: true,
    });
  }
}

declare global {
  interface WindowEventMap {
    [QUANTITY_CHANGE_EVENT]: QuantityChangeEvent;
  }
}

export function usePurchaseOrderColumns() {
  const [orderQuantities, setOrderQuantities] = useState<
    Record<string, number>
  >({});
  const orderQuantitiesRef = useRef(orderQuantities);

  // Keep ref updated to avoid stale closure
  useEffect(() => {
    orderQuantitiesRef.current = orderQuantities;
  }, [orderQuantities]);

  useEffect(() => {
    const handleQuantityChange = (event: QuantityChangeEvent) => {
      const { id, quantity } = event.detail;
      setOrderQuantities((prev) => ({ ...prev, [id]: quantity }));
    };
    window.addEventListener(QUANTITY_CHANGE_EVENT, handleQuantityChange);
    return () =>
      window.removeEventListener(QUANTITY_CHANGE_EVENT, handleQuantityChange);
  }, []);

  // QuantityInput uses ref to read latest quantity, so no need to pass via props
  const QuantityInput = React.memo(
    ({ id, defaultQty, isDisabled }: { id: string; defaultQty: number, isDisabled?: boolean }) => {
      const [value, setValue] = useState(
        orderQuantitiesRef.current[id] ?? (defaultQty || 1)
      );

      useEffect(() => {
        const initialQty = defaultQty || 1;
        setValue(initialQty);
        window.dispatchEvent(new QuantityChangeEvent(id, initialQty));
      }, [id, defaultQty]);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Math.max(
          1,
          parseInt(e.target.value) || defaultQty || 1
        );
        setValue(newValue);
        window.dispatchEvent(new QuantityChangeEvent(id, newValue));
      };

      return (
        <Input
          type="number"
          min={1}
          value={value}
          disabled={isDisabled}
          onChange={handleChange}
          className="w-20 text-right rounded-full border-black/10"
        />
      );
    }
  );

  // Quantity cell (doesn't depend on orderQuantities)
  const QuantityCell = useCallback(
    ({ row }: { row: { original: CatalogType } }) => {
      const asin = row.original.asin;

      if (asin === "PREP_AND_PACK_FEES" || asin === "CREDIT_CARD_FEE") {
        const lineTotal = Number(row.original.line_total);
        return (
          <QuantityInput
          isDisabled={true}
            id={String(row.original.id)}
            defaultQty={row.original.quantity || 1}
          />
        );
      }

      return (
        <QuantityInput
          id={String(row.original.id)}
          defaultQty={row.original.moq || 1}
        />
      );
    },
    []
  );

  const TotalCell = useCallback(
    ({ row }: { row: { original: CatalogType } }) => {
      const id = String(row.original.id);
      const asin = row.original.asin;

      if (asin === "PREP_AND_PACK_FEES" || asin === "CREDIT_CARD_FEE") {
        const lineTotal = Number(row.original.line_total);
        return (
          <div className="w-[50px] text-right font-semibold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(lineTotal)}
          </div>
        );
      }

      const qty = orderQuantitiesRef.current[id] ?? 1;
      const total = Number(row.original.selling_price) * qty;

      return (
        <div className="w-[50px] text-right font-semibold">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(total)}
        </div>
      );
    },
    []
  );

  // Columns memoized once without orderQuantities dependency
  const columns = useMemo<ColumnDef<CatalogType>[]>(() => {
    return [
      { accessorKey: "asin", header: "ASIN" },
      { accessorKey: "name", header: "Product Name" },
      { accessorKey: "moq", header: "MOQ" },
      {
        accessorKey: "selling_price",
        header: "Unit Price",
        cell: (info) =>
          new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(info.getValue() as number),
        meta: { align: "right" },
      },
      {
        id: "quantity",
        header: "QTY",
        cell: QuantityCell,
        meta: { align: "right" },
      },
      {
        id: "total",
        header: "Total",
        cell: TotalCell,
        meta: { align: "right", fontWeight: "bold" },
      },
    ];
  }, [QuantityCell, TotalCell]);

  return { columns, orderQuantities };
}
