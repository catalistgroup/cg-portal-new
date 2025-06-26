'use client';

import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  BarChart3,
  ChevronDown,
  CirclePlus,
  Edit2,
  Home,
  LogOut,
  RefreshCw,
  Settings,
  ShoppingCart,
  Menu,
  X,
  Store,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { StoreType } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

export function StoreHeader({ storeId, stores, user }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>(storeId);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [showAllStores, setShowAllStores] = useState(false);

  // Memoized values
  const storeName = useMemo(() => {
    return stores.find((v) => v.id == Number(storeId))?.name;
  }, [storeId, stores]);

  const isDashboard = pathname === `/store/${storeId}`;
  const isAnalysis = pathname === `/store/${storeId}/analysis`;
  const isModifyInventory = pathname === `/store/${storeId}/admin-inventory`;
  const isOrders = pathname === `/store/${storeId}/orders`;
  const storeLimit = 3;
  const visibleStores = showAllStores ? stores : stores.slice(0, storeLimit);
  const hasMoreStores = stores.length > storeLimit;

  const handleLogout = () => {
    router.push('/logout');
  };

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
    router.push(`/store/${storeId}`);
  };

  if (!storeName) {
    return redirect("/store");
  }


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  return (
    <div className="w-full border-b bg-white">
      <div className="flex justify-between items-center py-2 px-6 md:px-8 lg:px-12">
        <div className="flex items-center gap-2">
          <Image
            src="/header_logo.svg"
            alt="Catalist Group"
            width={200}
            height={50}
            className="object-contain"
          />
        </div>

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {renderNavigationButtons()}
          {!isMobileMenuOpen &&
            (user?.type === "normal" ? renderUserDropdown() : renderStoreDropdown())}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="flex flex-col md:hidden gap-2 px-6 pb-4">
          {renderNavigationButtons("mobile")}
          <div className="flex items-center justify-center gap-1 mt-4">
            {user?.type === "normal" ? renderUserDropdown() : renderStoreDropdown()}
          </div>
        </div>
      )}
    </div>
  );

  function renderNavigationButtons(mode = 'desktop') {
    const baseClass = 'rounded-full text-sm w-full md:w-auto';
    return (
      <>
        {user?.type === 'store' && (
          <Button
            variant="outline"
            className={`${baseClass} ${isDashboard ? 'bg-black text-white' : 'text-gray-600'}`}
            onClick={() => router.push(`/store/${storeId}`)}
          >
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        )}
        {user?.is_superuser && (
          <Button
            variant="outline"
            className={`${baseClass} ${isModifyInventory ? 'bg-black text-white' : 'text-gray-600'}`}
            onClick={() =>
              (window.location.href = `/store/${storeId}/admin-inventory`)
            }
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Modify Inventory
          </Button>
        )}
        <Button
          variant="outline"
          className={`${baseClass} ${isAnalysis ? 'bg-black text-white' : 'text-gray-600'}`}
          onClick={() => (window.location.href = `/store/${storeId}/analysis`)}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Master Catalogue
        </Button>
        <Button
          variant="outline"
          className={`${baseClass} ${isOrders ? 'bg-black text-white' : 'text-gray-600'}`}
          onClick={() => router.push(`/store/${storeId}/orders`)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Purchase Orders
        </Button>
      </>
    );
  }

  function renderUserDropdown() {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center gap-3 cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/default_profile.jpg" alt="@shadcn" />
              <AvatarFallback className="bg-primary text-white text-xs uppercase">
                {getInitials(user?.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-600 hover:text-red-600" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex flex-col items-center justify-center p-2 gap-1 cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/70 uppercase text-white text-xs">
                {getInitials(user?.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm flex flex-col items-center">
              <p className="font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile/" + storeId)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  function renderStoreDropdown() {
    return (
      <DropdownMenu open={isStoreDropdownOpen} onOpenChange={setIsStoreDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 h-auto p-2 hover:bg-gray-50">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/default_profile.jpg" alt="@shadcn" />
              <AvatarFallback className="bg-primary uppercase text-white">
                {getInitials(storeName || "Store")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <p className="font-medium text-gray-900 text-sm">{storeName}</p>
              <p className="text-xs text-gray-500">Switch store</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isMobileMenuOpen ? "center" : "end"} className="w-80 p-4">
          <div className="flex flex-col items-center justify-center p-4 mb-2 bg-gray-50 rounded-lg relative">
            {/* Edit Profile Button - Top Right */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-gray-700"
              onClick={() => router.push("/profile")}
            >
              <Edit2 className="h-6 w-6" />
            </Button> */}

            {/* Logout Button - Top Left */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 h-8 w-8 text-red-500 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-6 w-6" />
            </Button> */}

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-gray-700"
              onClick={() => setIsStoreDropdownOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            <Avatar className="h-12 w-12 mb-3">
              <AvatarFallback className="bg-primary uppercase text-white">
                {getInitials(user?.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-900">
              Your Stores ({stores.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-primary hover:text-primary/90"
              onClick={() => router.push("/create-store")}
            >
              <CirclePlus className="h-4 w-4 mr-1" />
              New Store
            </Button>
          </div>

          <div className="max-h-[280px] overflow-y-auto mb-2">
            <RadioGroup
              value={selectedStore}
              onValueChange={handleStoreSelect}
              className="space-y-0.5"
            >
              {visibleStores.map((store) => (
                <div
                  key={store.id}
                  className={`flex items-center space-x-2 rounded-lg border p-2.5 transition-all ${selectedStore === String(store.id)
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem
                    value={String(store.id)}
                    id={`store-${store.id}`}
                    className="text-primary"
                    defaultChecked={selectedStore === String(store.id)}
                  />
                  <Label
                    htmlFor={`store-${store.id}`}
                    className="flex flex-1 items-center justify-between cursor-pointer py-0.5"
                  >
                    <div className="flex items-center gap-2"> {/* Reduced gap from 3 to 2 */}
                      <div className="p-1 rounded-md bg-white border"> {/* Reduced padding from 1.5 to 1 */}
                        <Store className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="font-medium">{store.name}</span>
                    </div>
                    {selectedStore === String(store.id) && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {hasMoreStores && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-primary hover:text-primary/90"
                onClick={() => setShowAllStores(!showAllStores)}
              >
                {showAllStores ? (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show {stores.length - storeLimit} More
                  </>
                )}
              </Button>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/profile/" + storeId)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

type Props = {
  storeId: string;
  stores: StoreType[];
  user?: {
    id: string;
    name: string;
    email: string;
    type: "normal" | "store";
    is_superuser: boolean;
  };
};
