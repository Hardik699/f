import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Check, AlertCircle, Plus } from "lucide-react";
import { Layout } from "@/components/Layout";

interface Category {
  _id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  editLog?: Array<any>;
}

export default function CreateCategory() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    status: "active" | "inactive";
  }>({
    name: "",
    description: "",
    status: "active",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      setTableLoading(true);
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        // Defensive fallback to avoid rendering crashes
        setCategories([]);
        if (!data.success) console.error("Failed to fetch categories:", data.message);
        else console.warn("Unexpected categories payload:", data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    // Check for duplicate
    const isDuplicate = categories.some(
      (cat) =>
        cat.name.toLowerCase() === formData.name.toLowerCase() &&
        cat._id !== editingId,
    );
    if (isDuplicate) {
      newErrors.name = "Category with this name already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage(data.message);
        setFormData({ name: "", description: "", status: "active" });
        setEditingId(null);
        setErrors({});

        // Refresh categories
        setTimeout(() => {
          fetchCategories();
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Operation failed");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error saving category");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    try {
      setFormData({
        name: category.name ?? "",
        description: category.description ?? "",
        status: (category.status as "active" | "inactive") ?? "active",
      });
      setEditingId(category._id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error while attempting to edit category:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage("Category deleted successfully");
        setTimeout(() => {
          fetchCategories();
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to delete category");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error deleting category");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", status: "active" });
    setEditingId(null);
    setErrors({});
  };

  return (
    <Layout title="Create Category">
      <div className="space-y-8">
        {/* Form Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {editingId ? "Edit Category" : "Add New Category"}
          </h2>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                messageType === "success"
                  ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
              }`}
            >
              {messageType === "success" ? (
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              )}
              <span
                className={
                  messageType === "success"
                    ? "text-green-700 dark:text-green-300"
                    : "text-red-700 dark:text-red-300"
                }
              >
                {message}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter category name"
                className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border transition-all ${
                  errors.name
                    ? "border-red-500 dark:border-red-400"
                    : "border-slate-300 dark:border-slate-600"
                } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              {errors.name && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter category description"
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "inactive",
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="form-actions pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>
                      {editingId ? "Update Category" : "Create Category"}
                    </span>
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md overflow-hidden">
          <div className="p-8 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Categories
            </h2>
          </div>

          {tableLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Loading categories...
              </p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              No categories found. Create one above!
            </div>
          ) : (
            <div className="overflow-x-auto table-responsive">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {(categories || []).map((category) => (
                    <tr
                      key={category._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {category.description || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            category.status === "active"
                              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {category.status
                            ? category.status.charAt(0).toUpperCase() + category.status.slice(1)
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {category.createdBy}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded hover:bg-teal-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
