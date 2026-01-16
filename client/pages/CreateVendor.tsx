import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Plus,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Layout } from "@/components/Layout";

interface Vendor {
  _id: string;
  name: string;
  personName: string;
  mobileNumber: string;
  email: string;
  location: string;
  createdAt: string;
  createdBy: string;
}

export default function CreateVendor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    personName: "",
    mobileNumber: "",
    email: "",
    location: "",
  });

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showVendorViewModal, setShowVendorViewModal] = useState(false);
  const [selectedVendorForView, setSelectedVendorForView] =
    useState<Vendor | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchVendors();
  }, [navigate]);

  const fetchVendors = async () => {
    try {
      setTableLoading(true);
      const response = await fetch("/api/vendors");
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vendor name is required";
    }

    if (!formData.personName.trim()) {
      newErrors.personName = "Person name is required";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location/Address is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    const isDuplicate = vendors.some(
      (vendor) =>
        vendor.name.toLowerCase() === formData.name.toLowerCase() &&
        vendor._id !== editingId,
    );
    if (isDuplicate) {
      newErrors.name = "Vendor with this name already exists";
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
      const url = editingId ? `/api/vendors/${editingId}` : "/api/vendors";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage(data.message);
        setFormData({
          name: "",
          personName: "",
          mobileNumber: "",
          email: "",
          location: "",
        });
        setEditingId(null);
        setErrors({});

        setTimeout(() => {
          fetchVendors();
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Operation failed");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error saving vendor");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      personName: vendor.personName,
      mobileNumber: vendor.mobileNumber,
      email: vendor.email,
      location: vendor.location,
    });
    setEditingId(vendor._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleView = (vendor: Vendor) => {
    setSelectedVendorForView(vendor);
    setShowVendorViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const response = await fetch(`/api/vendors/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageType("success");
        setMessage("Vendor deleted successfully");
        setTimeout(() => {
          fetchVendors();
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to delete vendor");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error deleting vendor");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      personName: "",
      mobileNumber: "",
      email: "",
      location: "",
    });
    setEditingId(null);
    setErrors({});
  };

  return (
    <Layout title="Create Vendor">
      <div className="space-y-8">
        {/* Form Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {editingId ? "Edit Vendor" : "Add New Vendor"}
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
            {/* Vendor Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Vendor Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter vendor name"
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

            {/* Person Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Person Name *
              </label>
              <input
                type="text"
                value={formData.personName}
                onChange={(e) =>
                  setFormData({ ...formData, personName: e.target.value })
                }
                placeholder="Enter contact person name"
                className={`w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border transition-all ${
                  errors.personName
                    ? "border-red-500 dark:border-red-400"
                    : "border-slate-300 dark:border-slate-600"
                } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              {errors.personName && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.personName}
                </p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNumber: e.target.value })
                  }
                  placeholder="Enter mobile number"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border transition-all ${
                    errors.mobileNumber
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-300 dark:border-slate-600"
                  } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.mobileNumber}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border transition-all ${
                    errors.email
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-300 dark:border-slate-600"
                  } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Location/Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Enter location or full address"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-slate-700 border transition-all ${
                    errors.location
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-300 dark:border-slate-600"
                  } text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500`}
                />
              </div>
              {errors.location && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.location}
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
                    <span>{editingId ? "Update Vendor" : "Create Vendor"}</span>
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
              Vendors
            </h2>
          </div>

          {tableLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Loading vendors...
              </p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">
              No vendors found. Create one above!
            </div>
          ) : (
            <div className="overflow-x-auto table-responsive">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center justify-between">
                          <div className="truncate">{vendor.name}</div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleView(vendor)}
                              title="View"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-sm">View</span>
                            </button>
                            <button
                              onClick={() => handleEdit(vendor)}
                              title="Edit"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded hover:bg-teal-200 dark:hover:bg-blue-800 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="text-sm">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(vendor._id)}
                              title="Delete"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-sm">Delete</span>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 text-right">
                        {/* empty column for layout alignment */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Vendor View Modal */}
        {showVendorViewModal && selectedVendorForView && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50">
              <div className="p-4 sm:p-6 md:p-8 border-b-2 border-teal-100 dark:border-teal-900/50 flex items-center justify-between sticky top-0 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/50">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Vendor Details - {selectedVendorForView.name}
                </h3>
                <button
                  onClick={() => {
                    setShowVendorViewModal(false);
                    setSelectedVendorForView(null);
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Contact Person</p>
                  <p className="font-semibold text-slate-900">{selectedVendorForView.personName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Mobile</p>
                  <p className="font-semibold text-slate-900">{selectedVendorForView.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold text-slate-900">{selectedVendorForView.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Location</p>
                  <p className="font-semibold text-slate-900">{selectedVendorForView.location}</p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowVendorViewModal(false);
                      setSelectedVendorForView(null);
                    }}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
