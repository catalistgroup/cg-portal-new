"use client";

import { getCookie } from 'cookies-next';
import { useEffect, useState } from "react";
import { useRoot } from "@/context/RootProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Edit2,
  Save,
  Trash2,
  Store,
  X,
  Check,
  CirclePlus,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { PurchaseOrderType, StoreType } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import Link from "next/link";

function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export type UserType = {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  type: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  stores?: StoreType[];
  orders?: PurchaseOrderType[];
};

function splitName(fullName: string = '') {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || ''
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: contextUser } = useRoot();
  const [user, setUser] = useState<UserType | null>(null);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserType>>({});
  const [storeToDelete, setStoreToDelete] = useState<number | null>(null);
  const [isEditingStore, setIsEditingStore] = useState<number | null>(null);
  const [editedStore, setEditedStore] = useState<Partial<StoreType>>({});
  const [isStoreLoading, setIsStoreLoading] = useState<number | null>(null);
  const [isUserUpdateLoading, setIsUserUpdateLoading] = useState(false);
  const [isStoresLoading, setIsStoresLoading] = useState(false);

  const getStores = async () => {
    try {
      setIsStoresLoading(true);
      const authToken = getCookie('auth');

      const { data } = await api.get("/store", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setStores(data.filter((store: StoreType) => !store.is_deleted));
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      toast.error("Failed to load stores");
    } finally {
      setIsStoresLoading(false);
    }
  };

  useEffect(() => {
    if (!contextUser?.id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchUserData(),
          getStores()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [contextUser?.id]);

  const fetchUserData = async () => {
    if (!contextUser?.id) {
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await api.get(`/user/${contextUser.id}`);
      setUser(data);
      setEditedUser(data); // Initialize editedUser with fetched data
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to fetch user data";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserUpdate = async () => {
    try {
      setIsUserUpdateLoading(true);
      const updatedUser = {
        ...editedUser,
        name: `${editedUser.firstName || ''} ${editedUser.lastName || ''}`.trim()
      };

      await api.put(`/user/${user?.id}`, updatedUser);
      setUser({ ...user, ...updatedUser } as UserType);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUserUpdateLoading(false);
    }
  };

  const handleStoreUpdate = async (storeId: number) => {
    try {
      await api.put(`/store/${storeId}`, editedStore);
      fetchUserData();
      setIsEditingStore(null);
      toast.success("Store updated successfully");
    } catch (error) {
      toast.error("Failed to update store");
    }
  };

  const confirmStoreUpdate = async (storeId: number) => {
    try {
      setIsStoreLoading(storeId);
      const authToken = getCookie('auth');
      if (!authToken || !editedStore.name) {
        toast.error("Invalid store data");
        return;
      }

      await api.put(`/store/${storeId}`, editedStore, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      await getStores();
      setIsEditingStore(null);
      setEditedStore({});
      toast.success("Store updated successfully");
    } catch (error: any) {
      const message = error?.response?.data?.error || "Failed to update store";
      toast.error(message);
    } finally {
      setIsStoreLoading(null);
    }
  };

  const confirmStoreDelete = async (storeId: number) => {
    try {
      setIsStoreLoading(storeId);
      const authToken = getCookie('auth');

      if (!authToken) {
        toast.error("Authentication failed");
        return;
      }

      await api.delete(`/store/${storeId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setStores(stores.filter(store => store.id !== storeId));
      setStoreToDelete(null);
      toast.success("Store deleted successfully");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to delete store";
      toast.error(message);
    } finally {
      setIsStoreLoading(null);
    }
  };

  const handleEditClick = () => {
    const { firstName, lastName } = splitName(user?.name);
    setEditedUser({
      ...user,
      firstName,
      lastName,
      name: user?.name
    });
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex justify-end mb-4">
        <Link 
          href="/store"
          className="inline-flex items-center text-sm text-muted-foreground text-blue-500 hover:underline hover:text-blue-600 hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary/10">
              <AvatarFallback className="text-xl bg-primary/5">
                {user?.name ? getInitials(user.name) : '??'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user?.name || 'Loading...'}
                  </h2>
                  <div className="text-muted-foreground space-y-1">
                    <p>{user?.email || 'Loading...'}</p>
                    <p>{user?.phone || 'No phone number'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setEditedUser(user || {});
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUserUpdate}
                        disabled={isUserUpdateLoading}
                      >
                        {isUserUpdateLoading ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditClick}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <Input
                  value={editedUser.firstName || splitName(user?.name).firstName}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      firstName: e.target.value,
                      name: `${e.target.value} ${editedUser.lastName || splitName(user?.name).lastName}`.trim()
                    })
                  }
                  className="border-gray-200"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <Input
                  value={editedUser.lastName || splitName(user?.name).lastName}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      lastName: e.target.value,
                      name: `${editedUser.firstName || splitName(user?.name).firstName} ${e.target.value}`.trim()
                    })
                  }
                  className="border-gray-200"
                  placeholder="Enter your last name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  disabled={true}
                  value={editedUser.email || ''}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, email: e.target.value })
                  }
                  className="border-gray-200"
                  placeholder="Enter your email"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input
                  value={editedUser.phone || ''}
                  onChange={(e) =>
                    setEditedUser({ ...editedUser, phone: e.target.value })
                  }
                  className="border-gray-200"
                  placeholder="Enter your phone"
                  type="tel"
                />
              </div>
            </div>
          )}
        </CardContent>
        <div className="border-t border-gray-200" />
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Connected Stores</CardTitle>
            <CardDescription>Manage your marketplace stores</CardDescription>
          </div>
          <Button
            disabled={user?.type !== "store"}
            variant="ghost"
            size="sm"
            className="h-8 text-primary hover:text-primary/90"
            onClick={() => router.push("/create-store")}
          >
            <CirclePlus className="h-4 w-4 mr-1" />
            New Store
          </Button>
        </CardHeader>
        <CardContent>
          {isStoresLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground">Loading stores...</p>
              </div>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground">No stores connected yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stores.map((store) => (
                <Card key={store.id} className="border border-gray-100 hover:border-primary/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/5">
                          <Store className="h-5 w-5 text-primary" />
                        </div>
                        {isEditingStore === store.id ? (
                          <div className="space-y-2 min-w-[200px]">
                            <Input
                              value={editedStore.name || store.name}
                              onChange={(e) =>
                                setEditedStore({ ...editedStore, name: e.target.value })
                              }
                              className="border-gray-200 mb-2"
                              placeholder="Store name"
                            />
                            <select
                              value={editedStore.marketplace || store.marketplace}
                              onChange={(e) =>
                                setEditedStore({ ...editedStore, marketplace: e.target.value })
                              }
                              className="w-full p-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="amazon">Amazon</option>
                              <option value="walmart">Walmart</option>
                            </select>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-gray-900">{store.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {store.marketplace}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isEditingStore === store.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingStore(null)}
                              disabled={isStoreLoading === store.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => confirmStoreUpdate(store.id)}
                              disabled={isStoreLoading === store.id}
                            >
                              {isStoreLoading === store.id ? (
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsEditingStore(store.id);
                                setEditedStore(store);
                              }}
                              disabled={user?.type !== "store" || isStoreLoading === store.id}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setStoreToDelete(store.id)}
                              disabled={user?.type !== "store" || isStoreLoading === store.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!storeToDelete} onOpenChange={(open) => {
        if (!open && isStoreLoading !== storeToDelete) {
          setStoreToDelete(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this store? This action cannot be undone.
              All associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                // Prevent default to stop auto-closing
                e.preventDefault();
                if (storeToDelete) {
                  await confirmStoreDelete(storeToDelete);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isStoreLoading === storeToDelete}
            >
              {isStoreLoading === storeToDelete ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Deleting...</span>
                </div>
              ) : (
                "Delete Store"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}