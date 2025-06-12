import React, { useState, useMemo, ReactNode } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "./ui/checkbox";

type SelectableTableWrapperProps<TData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  keyExtractor?: (row: TData, index: number) => string;
  selected?: string[]; // selected keys as array
  onSelected?: (selectedKeys: string[]) => void; // callback with array
  children: (props: {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    selection: Record<string, boolean>;
    toggleRow: (id: string) => void;
    toggleAll: () => void;
    allSelected: boolean;
    someSelected: boolean;
  }) => ReactNode;
};

export function SelectableTableWrapper<TData>({
  columns,
  data,
  keyExtractor = (_row, index) => index.toString(),
  selected,
  onSelected,
  children,
}: SelectableTableWrapperProps<TData>) {
  // Convert selected string[] prop to Record<string, boolean>
  const selectedRecord: Record<string, boolean> = useMemo(() => {
    const rec: Record<string, boolean> = {};
    (selected ?? []).forEach((key) => (rec[key] = true));
    return rec;
  }, [selected]);

  // Internal state for uncontrolled mode
  const [internalSelection, setInternalSelection] = useState<
    Record<string, boolean>
  >({});

  // Use controlled selection if selected prop passed, else internal state
  const selectedRowIds = selected ? selectedRecord : internalSelection;

  const allSelected =
    data.length > 0 &&
    data.every((row, idx) => selectedRowIds[keyExtractor(row, idx)]);
  const someSelected = data.some(
    (row, idx) => selectedRowIds[keyExtractor(row, idx)]
  );

  const toggleRow = (id: string) => {
    const newSelection = { ...selectedRowIds };
    if (newSelection[id]) {
      delete newSelection[id];
    } else {
      newSelection[id] = true;
    }
    // Convert back to array
    const newSelectedArray = Object.keys(newSelection);
    if (onSelected) onSelected(newSelectedArray);
    if (!selected) setInternalSelection(newSelection);
  };

  const toggleAll = () => {
    if (allSelected) {
      if (onSelected) onSelected([]);
      if (!selected) setInternalSelection({});
    } else {
      const newSelection: Record<string, boolean> = {};
      data.forEach((row, idx) => {
        newSelection[keyExtractor(row, idx)] = true;
      });
      if (onSelected) onSelected(Object.keys(newSelection));
      if (!selected) setInternalSelection(newSelection);
    }
  };

  const selectionColumn: ColumnDef<TData> = {
    id: "select",
    header: () => (
      <Checkbox
        checked={allSelected}
        onCheckedChange={() => toggleAll()}
        className="ml-2 rounded-full data-[state=checked]:bg-[#0B24FB] data-[state=checked]:border-[#0B24FB] border-[#D9D9D9] border-2 data-[state=checked]:border"
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }: { row: { original: TData; index: number } }) => {
      const id = keyExtractor(row.original, row.index);
      return (
        <Checkbox
          checked={!!selectedRowIds[id]}
          onCheckedChange={() => toggleRow(id)}
          className="ml-4 mr-4 rounded-full data-[state=checked]:bg-[#0B24FB] data-[state=checked]:border-[#0B24FB] border-[#D9D9D9] border-2 data-[state=checked]:border"
          aria-label={`Select row ${id}`}
        />
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
    size: 40,
  };

  const finalColumns = useMemo(
    () => [selectionColumn, ...columns],
    [columns, selectedRowIds]
  );

  return children({
    columns: finalColumns,
    data,
    selection: selectedRowIds,
    toggleRow,
    toggleAll,
    allSelected,
    someSelected,
  });
}
