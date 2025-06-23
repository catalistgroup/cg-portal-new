'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calculator,
  ChevronLeft,
  ClipboardList,
  CreditCard,
  Download,
  HelpingHand,
  Search,
  ShoppingCart,
  User,
  SquarePen,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CatalogType, StoreType } from '@/lib/types';
import { getAllBrands, getCatalogs } from '@/query/queryFn';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../ui/datatable';
import { SelectableTableWrapper } from '../selectable-table';
import { usePurchaseOrderColumns } from './usePurchaseOrderColumns';
import FilterComponent, {
  FilterState,
  initialFilterState,
} from './filter-components';
import { useFilteredCatalog } from './useFiltered';
import api from '@/lib/api';
import { toast } from 'sonner';
import MetricCard from '../metrics-card';
import { Input } from '../ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useRoot } from '@/context/RootProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UpdateSellingPriceModal } from '@/components/modal';
import APIConfiguration from '@/lib/endpoints';
import { BrandType } from '@/types';

interface OrderFormState {
  paymentMethod: string;
  prepRequired: string;
  ungateAssistance: string;
  billingCountry: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  storefront: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

type Props = {
  storeId: string;
  stores: StoreType[];
  isAdmin: boolean;
};

export function ModifyInventory({ storeId, stores, isAdmin }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery<CatalogType[]>({
    queryKey: ['catalogs'],
    queryFn: () => getCatalogs(),
  });

  const { data: brands = [] } = useQuery<BrandType[]>({
    queryKey: ['brands'],
    queryFn: () => getAllBrands(),
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductSelected, setEditProductSelected] =
    useState<CatalogType | null>(null);

  const catalogColumns: ColumnDef<CatalogType>[] = [
    {
      accessorKey: 'image_url',
      header: 'Image',
      cell: ({ getValue }) => (
        <div className="flex items-center justify-center border-[1.6px] border-gray-200 rounded-md p-1.5">
          <Image
            height={80}
            width={80}
            alt="product_image"
            className="h-[45px] object-cover"
            src={String(getValue() || '/default_product.png')}
          />
        </div>
      ),
    },
    { accessorKey: 'brand', header: 'Brand' },
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => {
        const asin = row.original.asin;
        const productName = String(row.getValue('name'));
        const amazonLink = `https://www.amazon.com/dp/${asin}`;

        return (
          <div className="min-w-[300px] max-w-[400px] text-primary hover:underline">
            <a href={amazonLink} target="_blank" rel="noopener noreferrer">
              {productName}
            </a>
          </div>
        );
      },
    },
    {
      accessorKey: 'selling_price',
      header: 'Price',
      cell({ getValue }) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(getValue()));
      },
    },
    {
      accessorKey: 'buying_price',
      header: 'Buying Price',
      cell({ getValue }) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(getValue()));
      },
    },
    { accessorKey: 'asin', header: 'ASIN' },
    { accessorKey: 'upc', header: 'UPC/EAN' },
    { accessorKey: 'moq', header: 'MOQ' },
    {
      accessorKey: 'buybox_price',
      header: () => <div className="text-center">Amazon Buybox</div>,
      id: 'amazon_buybox',
      cell({ getValue }) {
        return (
          <div className="text-center">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(Number(getValue()))}
          </div>
        );
      },
    },

    {
      accessorKey: 'amazon_fee',
      id: 'amazon_fee',
      header: () => <div className="text-center">Amazon Fees</div>,
      cell({ getValue }) {
        return (
          <div className="text-center">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(Number(getValue()))}
          </div>
        );
      },
    },
    {
      accessorKey: 'profit',
      header: 'Profit',
      id: 'amazon_profit',
      cell({ getValue }) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(Number(getValue()));
      },
    },
    { accessorKey: 'profitable', header: 'Profitable' },
    { accessorKey: 'selling_status', header: 'Selling Status' },
    {
      accessorKey: 'margin',
      header: 'Margin',
      id: 'amazon_margin',
      cell({ getValue }) {
        return Number(getValue()).toFixed(2) + '%';
      },
    },
    {
      accessorKey: 'roi',
      header: 'ROI',
      id: 'amazon_roi',
      cell({ getValue }) {
        return Number(getValue()).toFixed(2) + '%';
      },
    },
  ];

  if (isAdmin) {
    catalogColumns.push({
      accessorKey: 'edit',
      header: 'Edit',
      id: 'edit_column',
      cell({ row }) {
        return (
          <SquarePen
            className="w-4 h-4 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => {
              handleEdit(row.original, row.index);
            }}
          />
        );
      },
    });
  }

  const handleEdit = (product: CatalogType, rowIndex: number) => {
    setIsEditModalOpen(true);
    setEditProductSelected({ ...product, rowIndex: rowIndex });
  };

  const handleEditSave = (data: {
    buying_price: string;
    selling_status: boolean;
  }) => {
    api
      .post(APIConfiguration.POST_UPDATE_CATALOG_PRODUCT, {
        ...editProductSelected,
        ...data,
      })
      .then((res) => {
        toast.success(res.data.message || 'Product updated successfully');
        // Update the specific item in the local state to avoid re-loading the page
        queryClient.setQueryData<CatalogType[]>(['catalogs'], (oldData) => {
          if (!oldData) return [];

          return oldData.map((item) =>
            item.asin === editProductSelected?.asin
              ? {
                  ...res.data.data,
                }
              : item
          );
        });

        handleEditClose();
      })
      .catch((err) => {
        console.log('err', err);
        toast.error('Failed to update product');
      });
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditProductSelected(null);
  };

  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const { columns: pColumns, orderQuantities } = usePurchaseOrderColumns();
  const filtered = useFilteredCatalog(data, filters);
  const [isCreatingOrder, setCreatingOrder] = useState(false);

  const { user } = useRoot();

  const storeName = useMemo(() => {
    return stores?.find((v: StoreType) => v.id == Number(storeId))?.name;
  }, [storeId, stores]);

  const [formState, setFormState] = useState<OrderFormState>({
    paymentMethod: '',
    prepRequired: '',
    ungateAssistance: user?.orders?.[0]?.ungateAssistance || '',
    billingCountry: 'United States',
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: storeName || '',
    storefront: user?.orders?.[0]?.storefront || 'Amazon',
    street: user?.orders?.[0]?.street || '',
    city: user?.orders?.[0]?.city || '',
    state: user?.orders?.[0]?.state || '',
    zip: user?.orders?.[0]?.zip || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setErrors({});
  }, [formState]);

  const [pendingOrderItems, setPendingOrderItems] = useState<any[]>([]);

  const handleCreateOrder = async () => {
    if (isCreatingOrder) return;

    const newErrors: { [key: string]: string } = {};

    if (!formState.paymentMethod?.trim()) {
      newErrors.paymentMethod = 'Payment method is required.';
    }
    if (!formState.prepRequired?.trim()) {
      newErrors.prepRequired = 'Prep requirement is required.';
    }
    if (!formState.ungateAssistance) {
      newErrors.ungateAssistance = 'Ungating assistance selection is required.';
    }
    if (!formState.billingCountry) {
      newErrors.billingCountry = 'Billing country is required.';
    }
    if (!formState.firstName) {
      newErrors.firstName = 'First name is required.';
    }
    if (!formState.lastName) {
      newErrors.lastName = 'Last name is required.';
    }
    if (!formState.email) {
      newErrors.email = 'Email is required.';
    }
    if (!formState.phone) {
      newErrors.phone = 'Phone number is required.';
    }
    if (!formState.company) {
      newErrors.company = 'Company name is required.';
    }
    if (!formState.storefront) {
      newErrors.storefront = 'Storefront name is required.';
    }
    if (!formState.street) {
      newErrors.street = 'Street is required.';
    }
    if (!formState.city) {
      newErrors.city = 'City is required.';
    }
    if (!formState.state) {
      newErrors.state = 'State is required.';
    }
    if (!formState.zip) {
      newErrors.zip = 'Zip/Post Code is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    const orderedItems = data
      .filter((d) => selected.includes(String(d.id)))
      .map((v) => ({
        asin: v.asin,
        title: v.name,
        brand: v.brand,
        unit_price: Number(v.selling_price),
        quantity: orderQuantities?.[v.id] || 1,
        sku: v.sku,
        upc: v.upc,
        supplier: v.supplier || '',
        moq: v.moq || 100,
      }));

    // Store the orderedItems in state
    setPendingOrderItems(orderedItems);

    // Check items with quantity less than their specific MOQ
    const itemsWithLowQuantity = orderedItems
      .filter((item) => item.quantity < (item.moq || 100))
      .map((item) => ({
        name: item.title,
        quantity: item.quantity,
        asin: item.asin,
        moq: item.moq || 100,
      }));

    if (itemsWithLowQuantity.length > 0) {
      setLowQuantityItems(itemsWithLowQuantity);
      setShowWarningModal(true);
      return;
    }

    await submitOrder(orderedItems);
  };

  const submitOrder = async (orderedItems: any[]) => {
    try {
      setCreatingOrder(true);
      const response = await api.post(`/purchase-order/store/${storeId}`, {
        order_placed_at: new Date(),
        order_status: 'received',
        is_draft: false,
        ...formState,
        items: orderedItems,
      });
      setSelected([]);
      toast.success('Order created successfully');

      setFormState({
        paymentMethod: '',
        prepRequired: '',
        ungateAssistance: '',
        billingCountry: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        storefront: '',
        street: '',
        city: '',
        state: '',
        zip: '',
      });
      const newOrderId = response.data.id;
      router.replace(`/store/${storeId}/orders/${newOrderId}`);
    } catch (error) {
      toast.error('An error occurred while creating the order.');
      setCreatingOrder(false);
    }
  };

  const totalAmount = useMemo(() => {
    const selectedProducts = data.filter((f) =>
      selected.includes(String(f.id))
    );
    return selectedProducts.reduce(
      (a, b) => a + Number(b.selling_price) * (orderQuantities?.[b.id] || 1),
      0
    );
  }, [data, selected, orderQuantities]);

  const overview = useMemo(() => {
    const dt = data || [];

    const now = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);

    const recentBrands = new Set(
      dt
        .filter((item) => new Date(item.created_at) >= fourteenDaysAgo)
        .map((item) => item.brand)
    );

    const allBrands = new Set(dt.map((item) => item.brand));

    return {
      brandsAdded: recentBrands.size,
      totalBrands: allBrands.size,
      totalProducts: dt.length,
    };
  }, [data]);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchFiltered = useMemo(
    () =>
      filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.asin.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          p.upc?.toLowerCase().includes(debouncedQuery.toLowerCase())
      ),
    [filtered, debouncedQuery]
  );

  const rootData = useRoot();

  const [tab, setTab] = useState('all');

  const tabFiltered = useMemo(() => {
    const now = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);

    if (tab == 'latest') {
      return searchFiltered.filter(
        (item) => new Date(item.created_at) >= fourteenDaysAgo
      );
    }
    return searchFiltered;
  }, [tab, searchFiltered]);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [lowQuantityItems, setLowQuantityItems] = useState<
    {
      name: string;
      quantity: number;
      asin: string;
      moq: number;
    }[]
  >([]);

  const getOrderedItems = (
    selectedData: CatalogType[],
    orderQuantities: Record<number, number>,
    formState: OrderFormState
  ) => {
    const calculateSum = (array: any[], property: string) => {
      return array.reduce((sum, item) => sum + Number(item[property]), 0);
    };

    const PRE_RATE = 1;
    const CREDIT_CARD_RATE = 0.0299;

    const baseItems = selectedData.map((item) => ({
      ...item,
      quantity: orderQuantities[item.id] || 1,
      line_total: Number(item.selling_price) * (orderQuantities[item.id] || 1),
    }));

    let orderItems = [...baseItems];
    let invoiceTotal = calculateSum(baseItems, 'line_total');

    if (
      formState.prepRequired &&
      formState.prepRequired.toLowerCase() !== 'no'
    ) {
      const totalUnits = calculateSum(baseItems, 'quantity');
      const prepFeeTotal = totalUnits * PRE_RATE;

      invoiceTotal += prepFeeTotal;

      const prepFeeItem: CatalogType & {
        quantity: number;
        line_total: number;
      } = {
        id: -1,
        store_id: Number(storeId),
        asin: 'PREP_AND_PACK_FEES',
        name: 'Prep & Pack Fees',
        brand: 'PREP_AND_PACK_FEES',
        quantity: totalUnits,
        selling_price: PRE_RATE.toFixed(2),
        buying_price: '0.75',
        line_total: prepFeeTotal,
        sku: '',
        upc: '',
        supplier: '',
        moq: null,
        image_url: null,
        amazon_fee: '0',
        buybox_price: '0',
        margin: '0',
        profit: '0',
        roi: 0,
        walmart_buybox: '0',
        walmart_fees: '0',
        walmart_margin: '0',
        walmart_profit: '0',
        walmart_roi: '0',
        selling_status: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      orderItems.push(prepFeeItem);
    }

    if (formState.paymentMethod === 'credit_card') {
      const creditCardFees = invoiceTotal * CREDIT_CARD_RATE;
      invoiceTotal += creditCardFees;

      const creditCardFeeItem: CatalogType & {
        quantity: number;
        line_total: number;
      } = {
        id: -2,
        store_id: Number(storeId),
        asin: 'CREDIT_CARD_FEE',
        name: 'Credit Card (2.99% Fee)',
        brand: 'CREDIT_CARD_FEE',
        quantity: 1,
        selling_price: creditCardFees.toFixed(2),
        buying_price: creditCardFees.toFixed(2),
        line_total: creditCardFees,
        sku: '',
        upc: '',
        supplier: '',
        moq: null,
        image_url: null,
        amazon_fee: '0',
        buybox_price: '0',
        margin: '0',
        profit: '0',
        roi: 0,
        walmart_buybox: '0',
        walmart_fees: '0',
        walmart_margin: '0',
        walmart_profit: '0',
        walmart_roi: '0',
        selling_status: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      orderItems.push(creditCardFeeItem);
    }

    return {
      items: orderItems,
      total: Number(invoiceTotal.toFixed(2)),
    };
  };

  const { items: displayItems, total: calculatedTotal } = getOrderedItems(
    data.filter((d) => selected.includes(String(d.id))),
    orderQuantities,
    formState
  );

  const handleDownloadCSV = () => {
    const dataColumns = catalogColumns.filter(
      (
        col
      ): col is ColumnDef<CatalogType> & { accessorKey: keyof CatalogType } =>
        typeof (col as any).accessorKey === 'string'
    );

    const headers = dataColumns
      .map((col) =>
        typeof col.header === 'function' ? '' : String(col.header)
      )
      .join(',');

    const rows = data.map((item) =>
      dataColumns
        .map((col) => {
          const raw = item[col.accessorKey];
          const value = raw != null ? raw.toString() : '';
          return `"${value.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `CatalistGroup_catalog_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.click();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">
        {!showOrderPanel ? 'Master Catalogue' : 'Create Purchase Order'}
      </h2>
      {showOrderPanel && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            Please make sure you read our FAQ in entirety before completing an
            order form.
          </div>
          <div
            onClick={() => {
              setSelected([]);
              setShowOrderPanel(false);
            }}
            className="min-w-28 text-blue-600 cursor-pointer flex items-center gap-1 hover:text-blue-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Go Back
          </div>
        </div>
      )}

      {!showOrderPanel && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-8 gap-4">
          <MetricCard
            title="New Brands Added"
            value={overview.brandsAdded}
            format="count"
            loading={isLoading}
            icon={<Calculator />}
            colors={{
              iconColor: 'text-yellow-600',
              valueColor: 'text-yellow-600',
            }}
          />
          <MetricCard
            title="Total Brands"
            value={overview.totalBrands}
            format="count"
            loading={isLoading}
            icon={<Calculator />}
            colors={{
              iconColor: 'text-pink-600',
              valueColor: 'text-pink-600',
            }}
          />
          <MetricCard
            title="Total Products"
            value={overview.totalProducts}
            format="count"
            loading={isLoading}
            icon={<Calculator />}
            colors={{
              iconColor: 'text-red-600',
              valueColor: 'text-red-600',
            }}
          />
        </div>
      )}
      <div className="space-y-6">
        {showOrderPanel ? (
          <>
            <CardContent className="p-2 sm:p-4">
              <div className="space-y-6">
                <div className="bg-[#f8fafc] rounded-xl border border-[#e5e7eb] p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList />
                    <h3 className="text-base font-semibold">
                      Preferences <span className="text-red-600">*</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Payment Method <span className="text-red-600">*</span>
                      </label>
                      <Select
                        value={formState.paymentMethod}
                        onValueChange={(v) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            paymentMethod: v || '',
                          }))
                        }
                      >
                        <SelectTrigger
                          className={`w-full bg-white border ${
                            errors.paymentMethod
                              ? 'border-red-500'
                              : 'border-[#e5e7eb]'
                          } rounded-lg`}
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">
                            Credit Card (2.99% Fee)
                          </SelectItem>
                          <SelectItem value="wire_ach">
                            Wire/ACH (No Fee)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.paymentMethod && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.paymentMethod}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Prep Required <span className="text-red-600">*</span>
                      </label>
                      <Select
                        value={formState.prepRequired}
                        onValueChange={(v) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            prepRequired: v || '',
                          }))
                        }
                      >
                        <SelectTrigger
                          className={`w-full bg-white border ${
                            errors.prepRequired
                              ? 'border-red-500'
                              : 'border-[#e5e7eb]'
                          } rounded-lg`}
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="amazon">Yes - Amazon</SelectItem>
                          <SelectItem value="walmart">Yes - Walmart</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.prepRequired && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.prepRequired}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8fafc] rounded-xl border border-[#e5e7eb] p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <HelpingHand />
                    <h3 className="text-base font-semibold">
                      Ungating Assistance{' '}
                      <span className="text-red-600 font-semibold">
                        (Mandatory)
                      </span>
                    </h3>
                  </div>
                  <ol className="list-decimal text-sm text-gray-600 pl-5 space-y-1">
                    <li>
                      After submitting this form, send a user permissions
                      invitation to{' '}
                      <span className="font-medium">
                        ungate@catalistgroup.co
                      </span>
                    </li>
                    <li>Our team will accept the invitation.</li>
                    <li>
                      Once accepted please grant View/Edit access for Manage
                      Inventory, Add a Product, Manage Selling Applications,
                      Manage Case Log.
                    </li>
                  </ol>
                  <div className="flex items-center gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        className="accent-blue-600"
                        checked={formState.ungateAssistance === 'yes'}
                        onChange={() =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            ungateAssistance: 'yes',
                          }))
                        }
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        className="accent-blue-600"
                        checked={formState.ungateAssistance === 'no'}
                        onChange={() =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            ungateAssistance: 'no',
                          }))
                        }
                      />
                      <span className="text-sm">No</span>
                    </label>
                    {errors.ungateAssistance && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.ungateAssistance}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-[#f8fafc] rounded-xl border border-[#e5e7eb] p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <User />
                    <h3 className="text-base font-semibold">
                      Client Details <span className="text-red-600">*</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        First Name <span className="text-red-600">*</span>
                      </label>
                      <Input
                        placeholder="Enter first name"
                        value={formState.firstName}
                        onChange={(e) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            firstName: e.target.value,
                          }))
                        }
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Last Name <span className="text-red-600">*</span>
                      </label>
                      <Input
                        placeholder="Enter last name"
                        value={formState.lastName}
                        onChange={(e) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            lastName: e.target.value,
                          }))
                        }
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email <span className="text-red-600">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={formState.email}
                        onChange={(e) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            email: e.target.value,
                          }))
                        }
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone <span className="text-red-600">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 border border-[#e5e7eb] bg-white rounded-md">
                          <img
                            src="https://flagcdn.com/us.svg"
                            alt="US"
                            className="w-5 h-5 mr-1"
                          />
                          <span className="text-xs font-medium">+1</span>
                        </span>
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
                          value={formState.phone}
                          onChange={(e) =>
                            setFormState((s: OrderFormState) => ({
                              ...s,
                              phone: e.target.value,
                            }))
                          }
                          className="flex-1"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Company <span className="text-red-600">*</span>
                      </label>
                      <Input
                        placeholder="Enter company name"
                        value={formState.company}
                        onChange={(e) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            company: e.target.value,
                          }))
                        }
                      />
                      {errors.company && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.company}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Marketplace <span className="text-red-600">*</span>
                      </label>
                      <Select
                        value={formState.storefront}
                        onValueChange={(v) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            storefront: v,
                          }))
                        }
                        defaultValue="Amazon"
                      >
                        <SelectTrigger className="w-full bg-white border border-[#e5e7eb] rounded-lg">
                          <SelectValue placeholder="Select marketplace" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Amazon">Amazon</SelectItem>
                          <SelectItem value="Walmart">Walmart</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.storefront && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.storefront}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8fafc] rounded-xl border border-[#e5e7eb] p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={24} className="text-blue-500" />
                    <h3 className="text-base font-semibold">
                      Billing Address <span className="text-red-600">*</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Street <span className="text-red-600">*</span>
                      </label>
                      <Input
                        placeholder="Enter street address"
                        value={formState.street}
                        onChange={(e) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            street: e.target.value,
                          }))
                        }
                      />
                      {errors.street && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.street}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        City/Suburb
                      </label>
                      <Input
                        placeholder="Enter city/suburb"
                        value={formState.city}
                        onChange={(e) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            city: e.target.value,
                          }))
                        }
                      />
                      {errors.city && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Zip/Post Code <span className="text-red-600">*</span>
                      </label>
                      <Input
                        placeholder="Enter ZIP code"
                        value={formState.zip}
                        onChange={(e) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            zip: e.target.value,
                          }))
                        }
                      />
                      {errors.zip && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.zip}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        State <span className="text-red-600">*</span>
                      </label>
                      <Input
                        placeholder="Enter state"
                        value={formState.state}
                        onChange={(e) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            state: e.target.value,
                          }))
                        }
                      />
                      {errors.state && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Country <span className="text-red-600">*</span>
                      </label>
                      <Select
                        value={formState.billingCountry}
                        onValueChange={(v) =>
                          setFormState((s: OrderFormState) => ({
                            ...s,
                            billingCountry: v,
                          }))
                        }
                      >
                        <SelectTrigger className="w-full bg-white border border-[#e5e7eb] rounded-lg">
                          <SelectValue placeholder="United States" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">
                            United States
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.billingCountry && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.billingCountry}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold">Product List</h3>
                    <div className="font-bold flex">
                      Order Total:
                      <span className="block min-w-[130px]">
                        &nbsp;
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(calculatedTotal)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-auto h-full">
                    <DataTable
                      columns={pColumns}
                      data={displayItems}
                      isLoading={isLoading}
                      defaultPageSize={100}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder}
                    className="rounded-md px-8"
                  >
                    {isCreatingOrder ? 'Processing...' : 'Submit Order'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <Card className="border-none shadow-md">
            <CardContent className="pb-0">
              <FilterComponent
                brands={brands}
                onFiltered={setFilters}
                onCleared={() => setFilters(initialFilterState)}
              />

              <div
                className={`flex flex-col md:flex-row gap-y-5 mt-10 ${rootData.user?.type == 'store' ? '' : 'pt-8'} items-center justify-between`}
              >
                <div className="relative flex items-center gap-3">
                  <div className="relative max-w-[500px] w-full">
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="min-w-80 pl-9 rounded-xl border-black/10 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleDownloadCSV}
                    disabled={isLoading}
                    className="rounded-xl border-blue-700 bg-blue-600 text-white border-2 transition-opacity duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-sm">
                    {selected.length} product
                    {selected.length !== 1 ? 's' : ''} selected
                  </div>
                  <Button
                    onClick={() => {
                      setShowOrderPanel(true);
                    }}
                    className="rounded-xl border-blue-700 bg-blue-600 text-white border-2 transition-opacity duration-200"
                    disabled={selected.length === 0}
                    style={{ opacity: selected.length > 0 ? 1 : 0.5 }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Create Purchase Order
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardContent className="py-4 px-6">
              <SelectableTableWrapper
                columns={catalogColumns}
                data={tabFiltered}
                selected={selected}
                onSelected={setSelected}
                keyExtractor={(r) => String(r.id)}
              >
                {(d) => (
                  <DataTable
                    columns={d.columns}
                    data={d.data}
                    isLoading={isLoading}
                    defaultPageSize={100}
                  />
                )}
              </SelectableTableWrapper>
            </CardContent>
          </Card>
        )}
      </div>
      {showOrderPanel && (
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <div className="flex-1 bg-white rounded-xl border border-[#e5e7eb] p-6 flex items-start gap-3">
            <span className="mt-1 text-blue-500">
              <svg width="24" height="24" fill="none">
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="3"
                  stroke="#2563EB"
                  strokeWidth="2"
                />
                <path
                  d="M8 8h8M8 12h8M8 16h4"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <div className="font-semibold text-base mb-1">
                Terms and Conditions
              </div>
              <div className="text-sm text-gray-600">
                By submitting this order sheet, you agree to abide by the terms
                and conditions outlined by Catalist Group LLC.
              </div>
            </div>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-[#e5e7eb] p-6 flex items-start gap-3">
            <span className="mt-1 text-blue-500">
              <svg width="24" height="24" fill="none">
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="3"
                  stroke="#2563EB"
                  strokeWidth="2"
                />
                <path
                  d="M8 8h8M8 12h8M8 16h4"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <div className="font-semibold text-base mb-1">
                Questions? Get in Touch
              </div>
              <div className="text-sm text-gray-600">
                Catalist Group LLC &bull;{' '}
                <a href="mailto:sales@catalistgroup.co" className="underline">
                  sales@catalistgroup.co
                </a>{' '}
                &bull; 287 Park Avenue South New York, NY 10010
              </div>
            </div>
          </div>
        </div>
      )}

      {showWarningModal && (
        <AlertDialog open={showWarningModal} onOpenChange={setShowWarningModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">
                Low Quantity Warning
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p className="font-medium">
                  The following items have quantities less than their Minimum
                  Order Quantity (MOQ):
                </p>
                <div className="max-h-[200px] overflow-y-auto">
                  <ul className="list-disc font-bold pl-4 space-y-3">
                    {lowQuantityItems.map((item, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-700 border-b last:border-b-0 py-2"
                        title={item.name}
                      >
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {item.asin}
                        </span>
                        <span className="truncate max-w-[180px] font-medium">
                          {item.name?.length > 80
                            ? item.name.slice(0, 80) + '...'
                            : item.name}
                        </span>
                        <span className="ml-auto flex items-center gap-2">
                          <span className="text-gray-500">MOQ:</span>
                          <span className="font-semibold">{item.moq}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-red-600 font-semibold">
                            {item.quantity} units
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="font-medium mt-4">
                  This order needs to be approved by one of our team members. Do
                  you want to proceed with the order anyway?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setShowWarningModal(false)}
                className="border-gray-300"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowWarningModal(false);
                  submitOrder(pendingOrderItems);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Proceed Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <UpdateSellingPriceModal
        product={editProductSelected}
        isOpen={isEditModalOpen}
        onSavePress={handleEditSave}
        onClosePress={handleEditClose}
      />
    </div>
  );
}
