"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard-layout";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefresh } from "@/components/refresh-context";

interface Social {
  _id: string;
  name: string;
  url: string;
}

function SocialsPageContent() {
  const [socials, setSocials] = useState<Social[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<Social | null>(null);
  const [deletingSocial, setDeletingSocial] = useState<Social | null>(null);
  const [formData, setFormData] = useState({ name: "", url: "" });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { setRefreshing: setGlobalRefreshing, setOnRefresh } = useRefresh();

  useEffect(() => {
    fetchSocials();
    setOnRefresh(() => () => fetchSocials(true));
    return () => setOnRefresh(null);
  }, [setOnRefresh]);

  const fetchSocials = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setGlobalRefreshing(true);
      } else {
        setInitialLoading(true);
      }
      const response = await fetch("/api/socials");
      const data = await response.json();
      setSocials(data);
    } catch (error) {
      console.error("Error fetching socials:", error);
    } finally {
      setInitialLoading(false);
      setGlobalRefreshing(false);
    }
  };

  const handleOpenDialog = (social?: Social) => {
    if (social) {
      setEditingSocial(social);
      setFormData({ name: social.name, url: social.url });
    } else {
      setEditingSocial(null);
      setFormData({ name: "", url: "" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSocial(null);
    setFormData({ name: "", url: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/socials";
      const method = editingSocial ? "PUT" : "POST";
      const body = editingSocial
        ? { ...formData, _id: editingSocial._id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchSocials();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save social");
      }
    } catch (error) {
      console.error("Error saving social:", error);
      alert("Failed to save social");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (social: Social) => {
    setDeletingSocial(social);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingSocial) return;

    try {
      const response = await fetch(
        `/api/socials?id=${deletingSocial._id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchSocials();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete social");
      }
    } catch (error) {
      console.error("Error deleting social:", error);
      alert("Failed to delete social");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingSocial(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              SOCIAL LINKS MANAGEMENT
            </CardTitle>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#EDAF5F] hover:bg-[#EDAF5F]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Social
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-700">
                <TableHead className="text-neutral-300">Name</TableHead>
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
                      <Skeleton className="h-4 w-32 bg-neutral-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-64 bg-neutral-800" />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded bg-neutral-800" />
                        <Skeleton className="h-8 w-8 rounded bg-neutral-800" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : socials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-neutral-500">
                    No social links found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                socials.map((social) => (
                  <TableRow
                    key={social._id}
                    className="border-neutral-700 hover:bg-neutral-800"
                  >
                    <TableCell className="text-white font-mono">
                      {social.name}
                    </TableCell>
                    <TableCell className="text-neutral-400">
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#EDAF5F] underline"
                      >
                        {social.url}
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(social)}
                          className="text-neutral-400 hover:text-[#EDAF5F]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(social)}
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
        <DialogContent className="bg-neutral-900 border-neutral-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingSocial ? "Edit Social Link" : "Add Social Link"}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              {editingSocial
                ? "Update the social link information."
                : "Add a new social link to display on the website."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">
                  Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="DISCORD, TWITTER, etc."
                  className="bg-neutral-800 border-neutral-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">
                  URL
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
                {loading ? "Saving..." : editingSocial ? "Update" : "Add"}
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
              Delete Social Link
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete "{deletingSocial?.name}"? This
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

export default function SocialsPage() {
  return (
    <DashboardLayout>
      <SocialsPageContent />
    </DashboardLayout>
  );
}

