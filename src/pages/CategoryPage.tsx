import { useEffect, useState } from "react";
import {
  categoryService,
  type Category,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from "@/services/categoryService";
import {
  Card,
  CardContent,

  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  Trash2,
  Plus,
  Pencil,
  FolderOpen,
} from "lucide-react";
import { motion } from "motion/react";

const CategoryPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog States
  const [isBulkCreateOpen, setIsBulkCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Form States
  const [bulkData, setBulkData] = useState<CreateCategoryRequest[]>([
    { nameEn: "", nameAr: "", slug: "", icon: "" },
  ]);
  const [editFormData, setEditFormData] = useState<UpdateCategoryRequest>({
    id: 0,
    nameEn: "",
    nameAr: "",
    slug: "",
    icon: "",
  });

  // Delete Dialog State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      // User comment implied response shape might be { data: [...] }
      // Service handles this, but let's be safe
      const data = await categoryService.getCategories();
      // Ensure data is array
      setCategories(Array.isArray(data) ? data : (data as any).data || []);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- Bulk Create Handlers ---
  const handleAddBulkRow = () => {
    setBulkData([...bulkData, { nameEn: "", nameAr: "", slug: "", icon: "" }]);
  };

  const handleRemoveBulkRow = (index: number) => {
    const newData = [...bulkData];
    newData.splice(index, 1);
    setBulkData(newData);
  };

  const handleBulkChange = (
    index: number,
    field: keyof CreateCategoryRequest,
    value: string
  ) => {
    const newData = [...bulkData];
    newData[index] = { ...newData[index], [field]: value };
    setBulkData(newData);
  };

  const handleBulkSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Filter out empty rows if needed, or validate
      await categoryService.createCategoriesBulk(bulkData);
      toast.success("Categories created successfully");
      setIsBulkCreateOpen(false);
      setBulkData([{ nameEn: "", nameAr: "", slug: "", icon: "" }]); // Reset
      fetchCategories();
    } catch (error) {
      toast.error("Failed to create categories");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Edit Handlers ---
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setEditFormData({
      id: category.id,
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      slug: category.slug,
      icon: category.icon || "",
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      await categoryService.updateCategory(selectedCategory.id, editFormData);
      toast.success("Category updated successfully");
      setIsEditOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error("Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Delete Handlers ---
  // --- Delete Handlers ---
  const promptDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsSubmitting(true);
    try {
      await categoryService.safeDeleteCategory(categoryToDelete.id);
      toast.success("Category deleted safely");
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error("Failed to delete category safely");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Dialog State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateCategoryRequest>({
    nameEn: "",
    nameAr: "",
    slug: "",
    icon: "",
  });

  // --- Create Handlers ---
  const handleCreateSubmit = async () => {
    setIsSubmitting(true);
    try {
      await categoryService.createCategory(createFormData);
      toast.success("Category created successfully");
      setIsCreateOpen(false);
      setCreateFormData({ nameEn: "", nameAr: "", slug: "", icon: "" }); // Reset
      fetchCategories();
    } catch (error) {
      toast.error("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <title>Admin - Categories</title>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Categories
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage product and campaign categories
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Category</DialogTitle>
                  <DialogDescription>Add a single category.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Name (EN)</Label>
                    <Input
                      value={createFormData.nameEn}
                      onChange={(e) => setCreateFormData({ ...createFormData, nameEn: e.target.value })}
                      placeholder="Technology"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Name (AR)</Label>
                    <Input
                      value={createFormData.nameAr}
                      onChange={(e) => setCreateFormData({ ...createFormData, nameAr: e.target.value })}
                      placeholder="التكنولوجيا"
                      className="text-right"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Slug</Label>
                    <Input
                      value={createFormData.slug}
                      onChange={(e) => setCreateFormData({ ...createFormData, slug: e.target.value })}
                      placeholder="technology"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Icon</Label>
                    <Input
                      value={createFormData.icon || ""}
                      onChange={(e) => setCreateFormData({ ...createFormData, icon: e.target.value })}
                      placeholder="💻"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateSubmit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isBulkCreateOpen} onOpenChange={setIsBulkCreateOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Bulk Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Bulk Create Categories</DialogTitle>
                  <DialogDescription>
                    Add multiple categories at once.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {bulkData.map((row, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="grid grid-cols-4 gap-4 flex-1">
                        <div className="grid gap-2">
                          <Label>Name (EN)</Label>
                          <Input
                            value={row.nameEn}
                            onChange={(e) =>
                              handleBulkChange(index, "nameEn", e.target.value)
                            }
                            placeholder="Technology"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Name (AR)</Label>
                          <Input
                            value={row.nameAr}
                            onChange={(e) =>
                              handleBulkChange(index, "nameAr", e.target.value)
                            }
                            placeholder="التكنولوجيا"
                            className="text-right"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Slug</Label>
                          <Input
                            value={row.slug}
                            onChange={(e) =>
                              handleBulkChange(index, "slug", e.target.value)
                            }
                            placeholder="technology"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Icon (Emoji/URL)</Label>
                          <Input
                            value={row.icon || ""}
                            onChange={(e) =>
                              handleBulkChange(index, "icon", e.target.value)
                            }
                            placeholder="💻"
                          />
                        </div>

                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveBulkRow(index)}
                        disabled={bulkData.length === 1}
                        className="mb-0.5"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddBulkRow} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Another Row
                  </Button>
                </div>
                <DialogFooter>
                  <Button onClick={handleBulkSubmit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Create All
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {category.nameEn}
                  </CardTitle>
                  <div className="text-2xl">{category.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-4">
                    {category.nameAr}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FolderOpen className="w-3 h-3" />
                      <span>{category.childrenCount} sub</span>
                    </div>
                    <div className="font-bold">
                      {category.campaignsCount} campaigns
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => openEditDialog(category)}>
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="icon"
                    title="Delete"
                    onClick={() => promptDelete(category)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name (EN)</Label>
                <Input
                  value={editFormData.nameEn}
                  onChange={(e) => setEditFormData({ ...editFormData, nameEn: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Name (AR)</Label>
                <Input
                  value={editFormData.nameAr}
                  onChange={(e) => setEditFormData({ ...editFormData, nameAr: e.target.value })}
                  className="text-right"
                />
              </div>
              <div className="grid gap-2">
                <Label>Slug</Label>
                <Input
                  value={editFormData.slug}
                  onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Icon</Label>
                <Input
                  value={editFormData.icon || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, icon: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleEditSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{categoryToDelete?.nameEn}"?
                This will be a safe delete operation, checking for any dependencies before removal.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Delete Safely
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div >
    </>
  );
};

export default CategoryPage;