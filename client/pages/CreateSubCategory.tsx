import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Check, AlertCircle, Plus } from "lucide-react";
import { Layout } from "@/components/Layout";

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
  createdBy: string;
}

export default function CreateSubCategory() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<{
    categoryId: string;
    name: string;
    status: "active" | "inactive";
  }>({
    categoryId: "",
    name: "",
    status: "active",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchCategories();
    fetchSubcategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
        if (!data.success) console.error("Failed to fetch categories:", data.message);
        else console.warn("Unexpected categories payload:", data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  }; 

  const fetchSubcategories = async () => {
    try {
      setTableLoading(true);
      const response = await fetch("/api/subcategories");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setSubcategories(data.data);
      } else {
        setSubcategories([]);
        if (!data.success) console.error("Failed to fetch subcategories:", data.message);
        else console.warn("Unexpected subcategories payload:", data.data);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubcategories([]);
    } finally {
      setTableLoading(false);
    }
  }; 

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Sub Category name is required";
    }

    const isDuplicate = (subcategories || []).some(
      (sub) =>
        sub.name.toLowerCase() === formData.name.toLowerCase() &&
        sub._id !== editingId,
    );
    if (isDuplicate) {
      newErrors.name = "Sub Category with this name already exists";
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
        ? `/api/subcategories/${editingId}`
        : "/api/subcategories";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage(data.message);
        setFormData({ categoryId: "", name: "", status: "active" });
        setEditingId(null);
        setErrors({});

        setTimeout(() => {
          fetchSubcategories();
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Operation failed");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error saving sub category");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subcategory: SubCategory) => {
    try {
      setFormData({
        categoryId: subcategory.categoryId ?? "",
        name: subcategory.name ?? "",
        status: (subcategory.status as "active" | "inactive") ?? "active",
      });
      setEditingId(subcategory._id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error while attempting to edit subcategory:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sub category?")) return;

    try {
      const response = await fetch(`/api/subcategories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage("Sub Category deleted successfully");
        setTimeout(() => {
          fetchSubcategories();
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to delete sub category");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error deleting sub category");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData({ categoryId: "", name: "", status: "active" });
    setEditingId(null);
    setErrors({});
  };

  return (
    <Layout title="Create Sub Category">
      <div className="space-y-8">
        {/* Form Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {editingId ? "Edit Sub Category" : "Add New Sub Category"}
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
            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border transition-all ${
                  errors.categoryId
                    ? "border-red-500 dark:border-red-400"
                    : "border-slate-300 dark:border-slate-600"
                } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500`}
              >
                <option value="">Choose a category</option>
                {(categories || []).map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.categoryId}
                </p>
              )}
            </div>

            {/* Sub Category Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sub Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter sub category name"
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
                      {editingId
                        ? "Update Sub Category"
                        : "Create Sub Category"}
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
              Sub Categories
            </h2>
          </div>

          {tableLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Loading sub categories...
              </p>
            </div>
          ) : subcategories.length === 0 ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              No sub categories found. Create one above!
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
                      Category
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
                  {(subcategories || []).map((subcategory) => (
                    <tr
                      key={subcategory._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {subcategory.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {subcategory.categoryName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            subcategory.status === "active"
                              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                          }`}
                        >
                          {subcategory.status
                            ? subcategory.status.charAt(0).toUpperCase() + subcategory.status.slice(1)
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {subcategory.createdBy}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(subcategory)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded hover:bg-teal-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subcategory._id)}
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
