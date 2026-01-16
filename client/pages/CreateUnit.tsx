import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Trash2, Check, AlertCircle, Plus } from "lucide-react";
import { Layout } from "@/components/Layout";

interface Unit {
  _id: string;
  name: string;
  shortCode: string;
  createdAt: string;
  createdBy: string;
}

export default function CreateUnit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    shortCode: "",
  });

  const [units, setUnits] = useState<Unit[]>([]);
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
    fetchUnits();
  }, [navigate]);

  const fetchUnits = async () => {
    try {
      setTableLoading(true);
      const response = await fetch("/api/units");
      const data = await response.json();
      if (data.success) {
        setUnits(data.data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Unit name is required";
    }

    if (!formData.shortCode.trim()) {
      newErrors.shortCode = "Unit short code is required";
    }

    const isDuplicate = units.some(
      (unit) =>
        unit.name.toLowerCase() === formData.name.toLowerCase() &&
        unit._id !== editingId,
    );
    if (isDuplicate) {
      newErrors.name = "Unit with this name already exists";
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
      const url = editingId ? `/api/units/${editingId}` : "/api/units";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage(data.message);
        setFormData({ name: "", shortCode: "" });
        setEditingId(null);
        setErrors({});

        setTimeout(() => {
          fetchUnits();
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Operation failed");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error saving unit");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit: Unit) => {
    setFormData({
      name: unit.name,
      shortCode: unit.shortCode,
    });
    setEditingId(unit._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;

    try {
      const response = await fetch(`/api/units/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage("Unit deleted successfully");
        setTimeout(() => {
          fetchUnits();
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to delete unit");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error deleting unit");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", shortCode: "" });
    setEditingId(null);
    setErrors({});
  };

  return (
    <Layout title="Create Unit">
      <div className="space-y-8">
        {/* Form Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {editingId ? "Edit Unit" : "Add New Unit"}
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
            {/* Unit Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Unit Name (e.g., kg, gm, liter) *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter unit name"
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

            {/* Unit Short Code */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Unit Short Code *
              </label>
              <input
                type="text"
                value={formData.shortCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shortCode: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., KG, GM, LTR"
                className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border transition-all ${
                  errors.shortCode
                    ? "border-red-500 dark:border-red-400"
                    : "border-slate-300 dark:border-slate-600"
                } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              {errors.shortCode && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.shortCode}
                </p>
              )}
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
                    <span>{editingId ? "Update Unit" : "Create Unit"}</span>
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
              Units
            </h2>
          </div>

          {tableLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Loading units...
              </p>
            </div>
          ) : units.length === 0 ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              No units found. Create one above!
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
                      Short Code
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
                  {units.map((unit) => (
                    <tr
                      key={unit._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {unit.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-900 dark:text-slate-200 font-semibold">
                          {unit.shortCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {unit.createdBy}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(unit)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded hover:bg-teal-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(unit._id)}
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
