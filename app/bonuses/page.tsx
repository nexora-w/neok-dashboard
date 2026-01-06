"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { useRefresh } from "@/components/refresh-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { ImageKitProvider, IKUpload } from "imagekitio-next";
import { Skeleton } from "@/components/ui/skeleton";

interface Bonus {
  _id: string;
  name: string;
  subtitle: string;
  offers: string[];
  code: string;
  image: string;
  url: string;
}

const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "";
const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";

const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    if (!response.ok) {
      throw new Error("Failed to authenticate");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("ImageKit auth error:", error);
    throw error;
  }
};

function BonusesPageContent() {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
  const [deletingBonus, setDeletingBonus] = useState<Bonus | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    offers: [""],
    code: "",
    image: "",
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const ikUploadRef = useRef<HTMLInputElement>(null);
  const { setRefreshing: setGlobalRefreshing, setOnRefresh } = useRefresh();

  const fetchBonuses = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setGlobalRefreshing(true);
      } else {
        setInitialLoading(true);
      }
      const response = await fetch("/api/bonuses");
      const data = await response.json();
      setBonuses(data);
    } catch (error) {
      console.error("Error fetching bonuses:", error);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
      setGlobalRefreshing(false);
    }
  }, [setGlobalRefreshing]);

  useEffect(() => {
    fetchBonuses();
    setOnRefresh(() => () => fetchBonuses(true));
    return () => setOnRefresh(null);
  }, [fetchBonuses, setOnRefresh]);

  const onUploadError = (err: { message: string }) => {
    console.error("Upload error:", err);
    alert("Failed to upload image: " + err.message);
    setUploading(false);
  };

  const onUploadSuccess = (res: { url: string }) => {
    setFormData({ ...formData, image: res.url });
    setUploading(false);
  };

  const onUploadStart = () => {
    setUploading(true);
  };

  const handleOpenDialog = (bonus?: Bonus) => {
    if (bonus) {
      setEditingBonus(bonus);
      setFormData({
        name: bonus.name,
        subtitle: bonus.subtitle,
        offers: bonus.offers.length > 0 ? bonus.offers : [""],
        code: bonus.code,
        image: bonus.image,
        url: bonus.url,
      });
    } else {
      setEditingBonus(null);
      setFormData({
        name: "",
        subtitle: "",
        offers: [""],
        code: "",
        image: "",
        url: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBonus(null);
    setFormData({
      name: "",
      subtitle: "",
      offers: [""],
      code: "",
      image: "",
      url: "",
    });
  };

  const handleAddOffer = () => {
    setFormData({ ...formData, offers: [...formData.offers, ""] });
  };

  const handleRemoveOffer = (index: number) => {
    const newOffers = formData.offers.filter((_, i) => i !== index);
    setFormData({ ...formData, offers: newOffers.length > 0 ? newOffers : [""] });
  };

  const handleOfferChange = (index: number, value: string) => {
    const newOffers = [...formData.offers];
    newOffers[index] = value;
    setFormData({ ...formData, offers: newOffers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/bonuses";
      const method = editingBonus ? "PUT" : "POST";
      const filteredOffers = formData.offers.filter((offer) => offer.trim() !== "");
      const body = editingBonus
        ? { ...formData, offers: filteredOffers, _id: editingBonus._id }
        : { ...formData, offers: filteredOffers };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchBonuses();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save bonus");
      }
    } catch (error) {
      console.error("Error saving bonus:", error);
      alert("Failed to save bonus");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (bonus: Bonus) => {
    setDeletingBonus(bonus);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBonus) return;

    try {
      const response = await fetch(`/api/bonuses?id=${deletingBonus._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchBonuses();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete bonus");
      }
    } catch (error) {
      console.error("Error deleting bonus:", error);
      alert("Failed to delete bonus");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingBonus(null);
    }
  };

  return (
      <div className="p-6 space-y-6">
        <Card className="bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                PARTNER BONUSES MANAGEMENT
              </CardTitle>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-[#EDAF5F] hover:bg-[#EDAF5F]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Bonus
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-700">
                  <TableHead className="text-neutral-300 w-16">Image</TableHead>
                  <TableHead className="text-neutral-300">Partner</TableHead>
                  <TableHead className="text-neutral-300">Code</TableHead>
                  <TableHead className="text-neutral-300">Offers</TableHead>
                  <TableHead className="text-neutral-300">URL</TableHead>
                  <TableHead className="text-neutral-300 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-neutral-700">
                      <TableCell>
                        <Skeleton className="w-12 h-12 rounded bg-neutral-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 bg-neutral-800" />
                        <Skeleton className="h-3 w-24 bg-neutral-800 mt-2" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 bg-neutral-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40 bg-neutral-800" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32 bg-neutral-800" />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-8 rounded bg-neutral-800" />
                          <Skeleton className="h-8 w-8 rounded bg-neutral-800" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : bonuses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-neutral-500">
                      No bonuses found. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  bonuses.map((bonus) => (
                    <TableRow
                      key={bonus._id}
                      className="border-neutral-700 hover:bg-neutral-800"
                    >
                      <TableCell>
                        {bonus.image ? (
                          <div className="w-12 h-12 rounded overflow-hidden bg-neutral-800">
                            <img
                              src={bonus.image}
                              alt={bonus.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-neutral-800 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-neutral-600" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-white font-mono">
                        <div>
                          <div className="font-semibold">{bonus.name}</div>
                          {bonus.subtitle && (
                            <div className="text-xs text-neutral-500">{bonus.subtitle}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-[#EDAF5F] font-mono font-bold">
                        {bonus.code}
                      </TableCell>
                      <TableCell className="text-neutral-400">
                        <ul className="list-disc list-inside text-xs">
                          {bonus.offers.slice(0, 2).map((offer, i) => (
                            <li key={i} className="truncate max-w-[200px]">{offer}</li>
                          ))}
                          {bonus.offers.length > 2 && (
                            <li className="text-neutral-500">+{bonus.offers.length - 2} more</li>
                          )}
                        </ul>
                      </TableCell>
                      <TableCell className="text-neutral-400">
                        <a
                          href={bonus.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#EDAF5F] underline text-xs truncate block max-w-[150px]"
                        >
                          {bonus.url}
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(bonus)}
                            className="text-neutral-400 hover:text-[#EDAF5F]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(bonus)}
                            className="text-neutral-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-neutral-900 border-neutral-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingBonus ? "Edit Partner Bonus" : "Add Partner Bonus"}
              </DialogTitle>
              <DialogDescription className="text-neutral-400">
                {editingBonus
                  ? "Update the partner bonus information."
                  : "Add a new partner bonus to display on the website."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">
                      Partner Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., HOWL, KeyDrop"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">
                      Subtitle
                    </label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      placeholder="e.g., HOWL.GG"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">
                      Bonus Code *
                    </label>
                    <Input
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="e.g., NEOK"
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">
                      Partner URL *
                    </label>
                    <Input
                      type="url"
                      value={formData.url}
                      onChange={(e) =>
                        setFormData({ ...formData, url: e.target.value })
                      }
                      placeholder="https://..."
                      className="bg-neutral-800 border-neutral-700 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">
                    Partner Image
                  </label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {formData.image && (
                      <div className="relative w-full h-32 bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700">
                        <img
                          src={formData.image}
                          alt="Partner preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="absolute top-2 right-2 bg-neutral-900/80 text-neutral-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Upload Button */}
                    <ImageKitProvider
                      publicKey={publicKey}
                      urlEndpoint={urlEndpoint}
                      authenticator={authenticator}
                    >
                      <div className="flex gap-2">
                        <IKUpload
                          fileName="partner-image"
                          folder="/partners"
                          onError={onUploadError}
                          onSuccess={onUploadSuccess}
                          onUploadStart={onUploadStart}
                          ref={ikUploadRef}
                          className="hidden"
                          accept="image/*"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => ikUploadRef.current?.click()}
                          disabled={uploading}
                          className="flex-1 border-neutral-700 text-neutral-300 hover:text-white"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </>
                          )}
                        </Button>
                      </div>
                    </ImageKitProvider>

                    {/* Or manual URL */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-neutral-700" />
                      <span className="text-xs text-neutral-500">or enter URL</span>
                      <div className="flex-1 h-px bg-neutral-700" />
                    </div>
                    <Input
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="https://example.com/image.png"
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-300">
                      Offers
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddOffer}
                      className="border-neutral-700 text-neutral-300 hover:text-white"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Offer
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.offers.map((offer, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={offer}
                          onChange={(e) => handleOfferChange(index, e.target.value)}
                          placeholder={`Offer ${index + 1}...`}
                          className="bg-neutral-800 border-neutral-700 text-white"
                        />
                        {formData.offers.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveOffer(index)}
                            className="text-neutral-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  className="border-neutral-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#EDAF5F] hover:bg-[#EDAF5F]"
                  disabled={loading}
                >
                  {loading ? "Saving..." : editingBonus ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-neutral-900 border-neutral-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Delete Partner Bonus
              </AlertDialogTitle>
              <AlertDialogDescription className="text-neutral-400">
                Are you sure you want to delete "{deletingBonus?.name}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-neutral-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}

export default function BonusesPage() {
  return (
    <DashboardLayout>
      <BonusesPageContent />
    </DashboardLayout>
  );
}

