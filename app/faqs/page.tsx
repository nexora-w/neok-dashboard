"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

function FAQsPageContent() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [deletingFAQ, setDeletingFAQ] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({ question: "", answer: "" });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { setRefreshing: setGlobalRefreshing, setOnRefresh } = useRefresh();

  useEffect(() => {
    fetchFAQs();
    setOnRefresh(() => () => fetchFAQs(true));
    return () => setOnRefresh(null);
  }, [setOnRefresh]);

  const fetchFAQs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setGlobalRefreshing(true);
      } else {
        setInitialLoading(true);
      }
      const response = await fetch("/api/faqs");
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setInitialLoading(false);
      setGlobalRefreshing(false);
    }
  };

  const handleOpenDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFAQ(faq);
      setFormData({ question: faq.question, answer: faq.answer });
    } else {
      setEditingFAQ(null);
      setFormData({ question: "", answer: "" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFAQ(null);
    setFormData({ question: "", answer: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/faqs";
      const method = editingFAQ ? "PUT" : "POST";
      const body = editingFAQ
        ? { ...formData, _id: editingFAQ._id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchFAQs();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save FAQ");
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      alert("Failed to save FAQ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (faq: FAQ) => {
    setDeletingFAQ(faq);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingFAQ) return;

    try {
      const response = await fetch(`/api/faqs?id=${deletingFAQ._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFAQs();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete FAQ");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      alert("Failed to delete FAQ");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingFAQ(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-neutral-900 border-neutral-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              FAQ MANAGEMENT
            </CardTitle>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#EDAF5F] hover:bg-[#EDAF5F]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-neutral-700">
                <TableHead className="text-neutral-300">Question</TableHead>
                <TableHead className="text-neutral-300">Answer</TableHead>
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
                      <Skeleton className="h-4 w-full bg-neutral-800" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full bg-neutral-800" />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded bg-neutral-800" />
                        <Skeleton className="h-8 w-8 rounded bg-neutral-800" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : faqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-neutral-500">
                    No FAQs found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                faqs.map((faq) => (
                  <TableRow
                    key={faq._id}
                    className="border-neutral-700 hover:bg-neutral-800"
                  >
                    <TableCell className="text-white font-medium">
                      {faq.question}
                    </TableCell>
                    <TableCell className="text-neutral-400 max-w-md truncate">
                      {faq.answer}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(faq)}
                          className="text-neutral-400 hover:text-[#EDAF5F]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(faq)}
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
        <DialogContent className="bg-neutral-900 border-neutral-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingFAQ ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              {editingFAQ
                ? "Update the FAQ information."
                : "Add a new FAQ to display on the website."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">
                  Question
                </label>
                <Input
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="Enter the question..."
                  className="bg-neutral-800 border-neutral-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">
                  Answer
                </label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  placeholder="Enter the answer..."
                  className="bg-neutral-800 border-neutral-700 text-white min-h-[120px]"
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
                {loading ? "Saving..." : editingFAQ ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete this FAQ? This action cannot be
              undone.
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

export default function FAQsPage() {
  return (
    <DashboardLayout>
      <FAQsPageContent />
    </DashboardLayout>
  );
}

