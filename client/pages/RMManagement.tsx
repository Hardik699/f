import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Plus,
  X,
  Eye,
  History,
} from "lucide-react";
import { Layout } from "@/components/Layout";

interface Category {
  _id: string;
  name: string;
}

interface SubCategory {
  _id: string;
  name: string;
  categoryId: string;
}

interface Unit {
  _id: string;
  name: string;
}

interface Vendor {
  _id: string;
  name: string;
}

interface RawMaterial {
  _id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  unitId?: string;
  unitName?: string;
  hsnCode?: string;
  createdAt: string;
  lastAddedPrice?: number;
  lastVendorName?: string;
  lastPriceDate?: string;
}

interface VendorPrice {
  _id: string;
  rawMaterialId: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unitName?: string;
  price: number;
  addedDate: string;
}

interface PriceLog {
  _id: string;
  rawMaterialId: string;
  vendorId: string;
  vendorName: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
  unitName?: string;
  changeDate: string;
  changedBy: string;
}

export default function RMManagement() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);

  // Filter state
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterSubCategoryId, setFilterSubCategoryId] = useState("");
  const [filterVendorId, setFilterVendorId] = useState("");

  // Form state
  const [showAddRMForm, setShowAddRMForm] = useState(false);
  const [rmFormData, setRmFormData] = useState({
    name: "",
    categoryId: "",
    subCategoryId: "",
    unitId: "",
    hsnCode: "",
  });
  const [editingRMId, setEditingRMId] = useState<string | null>(null);

  // Vendor price form state
  const [showVendorPriceForm, setShowVendorPriceForm] = useState(false);
  const [selectedRMForVendor, setSelectedRMForVendor] = useState<string | null>(
    null,
  );
  const [vendorPriceForm, setVendorPriceForm] = useState({
    vendorId: "",
    price: "",
    totalQuantity: "",
    totalPrice: "",
  });

  // Vendor prices list for modal
  const [showVendorPricesModal, setShowVendorPricesModal] = useState(false);
  const [vendorPrices, setVendorPrices] = useState<VendorPrice[]>([]);
  const [selectedRMForPrices, setSelectedRMForPrices] =
    useState<RawMaterial | null>(null);

  // Price logs modal
  const [showPriceLogsModal, setShowPriceLogsModal] = useState(false);
  const [priceLogs, setPriceLogs] = useState<PriceLog[]>([]);
  const [selectedRMForLogs, setSelectedRMForLogs] =
    useState<RawMaterial | null>(null);

  // Costing modal state
  // (removed)

  // UI state
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rmErrors, setRmErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/");
      return;
    }
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      setTableLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchSubCategories(),
        fetchUnits(),
        fetchVendors(),
        fetchRawMaterials(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
        if (!data.success)
          console.error("Failed to fetch categories:", data.message);
        else console.warn("Unexpected categories payload:", data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await fetch("/api/subcategories");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setSubCategories(data.data);
      } else {
        setSubCategories([]);
        if (!data.success)
          console.error("Failed to fetch subcategories:", data.message);
        else console.warn("Unexpected subcategories payload:", data.data);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubCategories([]);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/units");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setUnits(data.data);
      } else {
        setUnits([]);
        if (!data.success)
          console.error("Failed to fetch units:", data.message);
        else console.warn("Unexpected units payload:", data.data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
      setUnits([]);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch("/api/vendors");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setVendors(data.data);
      } else {
        setVendors([]);
        if (!data.success)
          console.error("Failed to fetch vendors:", data.message);
        else console.warn("Unexpected vendors payload:", data.data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    }
  };

  const fetchRawMaterials = async () => {
    try {
      const response = await fetch("/api/raw-materials");
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setRawMaterials(data.data);
      } else {
        setRawMaterials([]);
        if (!data.success)
          console.error("Failed to fetch raw materials:", data.message);
        else console.warn("Unexpected raw materials payload:", data.data);
      }
    } catch (error) {
      console.error("Error fetching raw materials:", error);
      setRawMaterials([]);
    }
  };

  const getFilteredSubCategories = () => {
    if (!filterCategoryId) return [];
    return subCategories.filter((sc) => sc.categoryId === filterCategoryId);
  };

  const getSelectedCategorySubCategories = () => {
    if (!rmFormData.categoryId) return [];
    return subCategories.filter(
      (sc) => sc.categoryId === rmFormData.categoryId,
    );
  };

  const getFilteredRawMaterials = () => {
    const list = Array.isArray(rawMaterials) ? rawMaterials : [];
    return list.filter((rm) => {
      if (filterCategoryId && rm.categoryId !== filterCategoryId) return false;
      if (filterSubCategoryId && rm.subCategoryId !== filterSubCategoryId)
        return false;
      if (filterVendorId) {
        // This is a simple filter - in real scenario you'd want to check vendor prices
        return true;
      }
      return true;
    });
  };

  const validateRMForm = () => {
    const newErrors: Record<string, string> = {};
    if (!rmFormData.name.trim()) newErrors.name = "RM name is required";
    if (!rmFormData.categoryId) newErrors.categoryId = "Category is required";
    if (!rmFormData.subCategoryId)
      newErrors.subCategoryId = "Sub-category is required";
    setRmErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVendorPriceForm = () => {
    const newErrors: Record<string, string> = {};
    if (!vendorPriceForm.vendorId) newErrors.vendorId = "Vendor is required";

    // Total price is required per spec
    if (!vendorPriceForm.totalPrice || Number(vendorPriceForm.totalPrice) <= 0)
      newErrors.totalPrice = "Total buy price is required";

    // Total quantity is required
    const tq = Number(vendorPriceForm.totalQuantity);
    if (isNaN(tq) || tq <= 0) {
      newErrors.totalQuantity = "Total buy quantity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateRM = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRMForm()) return;

    setLoading(true);
    try {
      const selectedCategory = categories.find(
        (c) => c._id === rmFormData.categoryId,
      );
      const selectedSubCategory = subCategories.find(
        (sc) => sc._id === rmFormData.subCategoryId,
      );
      const selectedUnit = units.find((u) => u._id === rmFormData.unitId);

      // If editing an existing RM
      if (editingRMId) {
        const response = await fetch(`/api/raw-materials/${editingRMId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: rmFormData.name,
            categoryId: rmFormData.categoryId,
            categoryName: selectedCategory?.name,
            subCategoryId: rmFormData.subCategoryId,
            subCategoryName: selectedSubCategory?.name,
            unitId: rmFormData.unitId,
            unitName: selectedUnit?.name,
            hsnCode: rmFormData.hsnCode,
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setMessageType("success");
          setMessage("Raw material updated successfully");
          setRmFormData({
            name: "",
            categoryId: "",
            subCategoryId: "",
            unitId: "",
            hsnCode: "",
          });
          setRmErrors({});
          setShowAddRMForm(false);
          setEditingRMId(null);

          setTimeout(() => {
            fetchRawMaterials();
            setMessage("");
          }, 1500);
        } else {
          setMessageType("error");
          setMessage(data.message || "Failed to update raw material");
        }

        setLoading(false);
        return;
      }

      const response = await fetch("/api/raw-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: rmFormData.name,
          categoryId: rmFormData.categoryId,
          categoryName: selectedCategory?.name,
          subCategoryId: rmFormData.subCategoryId,
          subCategoryName: selectedSubCategory?.name,
          unitId: rmFormData.unitId,
          unitName: selectedUnit?.name,
          hsnCode: rmFormData.hsnCode,
          createdBy: "admin",
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessageType("success");
        setMessage("Raw material created successfully");
        setRmFormData({
          name: "",
          categoryId: "",
          subCategoryId: "",
          unitId: "",
          hsnCode: "",
        });
        setRmErrors({});
        setShowAddRMForm(false);

        setTimeout(() => {
          fetchRawMaterials();
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to create raw material");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error creating raw material");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendorPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateVendorPriceForm()) return;
    if (!selectedRMForVendor) return;

    setLoading(true);
    try {
      const selectedVendor = vendors.find(
        (v) => v._id === vendorPriceForm.vendorId,
      );

      const response = await fetch("/api/raw-materials/vendor-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawMaterialId: selectedRMForVendor,
          vendorId: vendorPriceForm.vendorId,
          vendorName: selectedVendor?.name,
          quantity: (() => {
            const tq = Number(vendorPriceForm.totalQuantity);
            // quantity field removed; using totalQuantity only now
            if (!isNaN(tq) && tq > 0) return tq;
            // fallback to 0 to avoid undefined variable
            return 0;
          })(),
          price: (() => {
            const tq = Number(vendorPriceForm.totalQuantity);
            const tp = Number(vendorPriceForm.totalPrice);
            if (!isNaN(tq) && tq > 0 && !isNaN(tp) && tp > 0) {
              return parseFloat((tp / tq).toFixed(2));
            }
            return Number(vendorPriceForm.price);
          })(),
          createdBy: "admin",
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessageType("success");
        setMessage("Vendor price added successfully");
        setVendorPriceForm({
          vendorId: "",
          price: "",
          totalQuantity: "",
          totalPrice: "",
        });
        setErrors({});
        setShowVendorPriceForm(false);

        setTimeout(() => {
          fetchRawMaterials();
          if (selectedRMForVendor) {
            fetchVendorPrices(selectedRMForVendor);
          }
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to add vendor price");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error adding vendor price");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorPrices = async (rawMaterialId: string) => {
    try {
      const response = await fetch(
        `/api/raw-materials/${rawMaterialId}/vendor-prices`,
      );
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setVendorPrices(data.data);
      } else {
        setVendorPrices([]);
        if (!data.success)
          console.error("Failed to fetch vendor prices:", data.message);
        else console.warn("Unexpected vendor prices payload:", data.data);
      }
    } catch (error) {
      console.error("Error fetching vendor prices:", error);
      setVendorPrices([]);
    }
  };

  const fetchPriceLogs = async (rawMaterialId: string) => {
    try {
      const response = await fetch(
        `/api/raw-materials/${rawMaterialId}/price-logs`,
      );
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setPriceLogs(data.data);
      } else {
        setPriceLogs([]);
        if (!data.success)
          console.error("Failed to fetch price logs:", data.message);
        else console.warn("Unexpected price logs payload:", data.data);
      }
    } catch (error) {
      console.error("Error fetching price logs:", error);
      setPriceLogs([]);
    }
  };

  const handleViewVendorPrices = async (rm: RawMaterial) => {
    if (!rm || !rm._id) {
      console.error(
        "Invalid raw material passed to handleViewVendorPrices:",
        rm,
      );
      return;
    }
    setSelectedRMForPrices(rm);
    setShowVendorPricesModal(true);
    await fetchVendorPrices(rm._id);
  };

  const handleViewPriceLogs = async (rm: RawMaterial) => {
    if (!rm || !rm._id) {
      console.error("Invalid raw material passed to handleViewPriceLogs:", rm);
      return;
    }
    setSelectedRMForLogs(rm);
    setShowPriceLogsModal(true);
    await fetchPriceLogs(rm._id);
  };

  // handleViewCosting removed

  const handleDeletePriceLog = async (logId: string) => {
    if (!selectedRMForLogs || !selectedRMForLogs._id) return;

    if (!confirm("Are you sure you want to delete this price log entry?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/raw-materials/${selectedRMForLogs._id}/price-logs/${logId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setMessageType("success");
        setMessage("Price log deleted successfully");
        // Refresh the logs
        await fetchPriceLogs(selectedRMForLogs._id);
        setTimeout(() => setMessage(""), 2000);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to delete price log");
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error deleting price log");
      console.error(error);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // Edit RM - open modal with existing values
  const handleEditRM = (rm: RawMaterial) => {
    try {
      if (!rm || !rm._id) {
        console.error("Invalid raw material passed to handleEditRM:", rm);
        return;
      }
      setEditingRMId(rm._id);
      setRmFormData({
        name: rm.name ?? "",
        categoryId: rm.categoryId ?? "",
        subCategoryId: rm.subCategoryId ?? "",
        unitId: rm.unitId ?? "",
        hsnCode: rm.hsnCode ?? "",
      });
      setRmErrors({});
      setShowAddRMForm(true);
    } catch (err) {
      console.error("Error while attempting to edit raw material:", err);
    }
  };
  const handleDeleteRM = async (id: string) => {
    if (!confirm("Are you sure you want to delete this raw material?")) return;

    try {
      const response = await fetch(`/api/raw-materials/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMessageType("success");
        setMessage("Raw material deleted successfully");
        setTimeout(() => {
          fetchRawMaterials();
          setMessage("");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.message || "Failed to delete raw material");
      }
    } catch (error) {
      setMessageType("error");
      setMessage("Error deleting raw material");
      console.error(error);
    }
  };

  const filteredRawMaterials = getFilteredRawMaterials();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  // Handle file selection and upload
  useEffect(() => {
    const input = uploadInputRef.current;
    if (!input) return;
    const handleChange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      const file = target.files[0];
      setUploadLoading(true);
      try {
        const fd = new FormData();
        fd.append("file", file, file.name);
        const res = await fetch("/api/raw-materials/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setMessageType("error");
          setMessage(data.message || "Upload failed");
          setUploadResult(data.data || null);
        } else {
          setMessageType("success");
          setMessage(`Upload complete — created: ${data.data.created}, updated: ${data.data.updated}, skipped: ${data.data.skipped.length}`);
          setUploadResult(data.data);
          // if skipped rows exist, generate an errors CSV and download
          if (Array.isArray(data.data.skipped) && data.data.skipped.length > 0) {
            const header = ["row","reason","data"];
            const lines = [header.join(",")];
            for (const s of data.data.skipped) {
              const rowJson = JSON.stringify(s.data || {});
              const line = [s.row, `"${(s.reason || "").replace(/"/g, '""') }"`, `"${rowJson.replace(/"/g, '""')}"`];
              lines.push(line.join(","));
            }
            const blob = new Blob([lines.join("\n")], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "rm-upload-errors.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }
          // refresh list
          setTimeout(() => fetchRawMaterials(), 1000);
        }
      } catch (err) {
        console.error(err);
        setMessageType("error");
        setMessage("Error uploading CSV file");
      } finally {
        setUploadLoading(false);
        if (uploadInputRef.current) uploadInputRef.current.value = "";
      }
    };
    input.addEventListener("change", handleChange as any);
    return () => input.removeEventListener("change", handleChange as any);
  }, [fetchRawMaterials]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatUnit = (u?: string | null) => {
    if (!u) return null;
    const s = u.toLowerCase().trim();
    if (s.includes("kg") || s.includes("kilogram")) return "kg";
    if (s === "g" || s.includes("gram")) return "g";
    if (s.includes("lit") || s === "l" || s.includes("ltr") || s.includes("litre")) return "L";
    if (s.includes("ml")) return "ml";
    if (s.includes("piece") || s.includes("pc") || s === "pcs") return "pcs";
    return u; // fallback to original
  };

  return (
    <Layout title="RM Management">
      <>
      <div className="space-y-6">
        {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Raw Materials
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your raw materials inventory
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowAddRMForm(true)}
              className="btn btn-primary whitespace-nowrap flex items-center gap-2"
              style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
            >
              <Plus className="w-5 h-5" />
              <span>Add Raw Material</span>
            </button>
            <div className="flex items-center gap-2 ml-2">
              <input
                ref={useRef<HTMLInputElement | null>(null)}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                id="rm-upload-input"
              />
            </div>
          </div>
        </div>
        
        {/* Upload / Download Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/raw-materials/export");
                  if (!res.ok) throw new Error("Export failed");
                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "raw-materials-export.csv";
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  console.error(err);
                  setMessageType("error");
                  setMessage("Failed to download export");
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              ⬇ Download CSV
            </button>

            <a href="/demo-rm-create.csv" download className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              ⬇ Demo CSV
            </a>
          </div>
        </div>
        {/* Message Alert */}
        {message && (
          <div
            className={`p-4 rounded-lg flex items-start gap-3 border animate-in fade-in slide-in-from-top-2 duration-300 ${
              messageType === "success"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50"
            }`}
          >
            {messageType === "success" ? (
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <span
              className={
                messageType === "success"
                  ? "text-green-800 dark:text-green-300 font-medium text-sm"
                  : "text-red-800 dark:text-red-300 font-medium text-sm"
              }
            >
              {message}
            </span>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-500"></div>
            Filter Results
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                Category
              </label>
              <select
                value={filterCategoryId}
                onChange={(e) => {
                  setFilterCategoryId(e.target.value);
                  setFilterSubCategoryId("");
                }}
                className="w-full px-3.5 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                Sub Category
              </label>
              <select
                value={filterSubCategoryId}
                onChange={(e) => setFilterSubCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
              >
                <option value="">All Sub Categories</option>
                {getFilteredSubCategories().map((subcat) => (
                  <option key={subcat._id} value={subcat._id}>
                    {subcat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">
                Vendor
              </label>
              <select
                value={filterVendorId}
                onChange={(e) => setFilterVendorId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
              >
                <option value="">All Vendors</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Raw Materials Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-teal-500"></div>
              Raw Materials List
              <span className="ml-auto text-sm font-normal text-slate-500 dark:text-slate-400">
                {filteredRawMaterials.length} items
              </span>
            </h2>
          </div>

          {tableLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400 mt-3 font-medium">
                Loading materials...
              </p>
            </div>
          ) : filteredRawMaterials.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block p-3 bg-slate-100 dark:bg-slate-700 rounded-lg mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                No raw materials found
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                Create your first raw material to get started
              </p>
            </div>
          ) : (
            <>
              <div className="hidden sm:block overflow-x-auto table-responsive">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Sub Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Last Price</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {(filteredRawMaterials || []).map((rm) => (
                      <tr key={rm._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150">
                        <td className="px-6 py-4"><span className="inline-flex items-center gap-2 px-2.5 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-semibold">{rm.code}</span></td>
                        <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-900 dark:text-white">{rm.name}</span></td>
                        <td className="px-6 py-4"><span className="text-sm text-slate-600 dark:text-slate-400">{rm.categoryName}</span></td>
                        <td className="px-6 py-4"><span className="text-sm text-slate-600 dark:text-slate-400">{rm.subCategoryName}</span></td>
                        <td className="px-6 py-4"><span className="text-sm font-medium text-slate-900 dark:text-white">{rm.unitName || "-"}</span></td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {typeof rm.lastAddedPrice === "number" ? (
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">₹{rm.lastAddedPrice.toFixed(2)}{formatUnit(rm.unitName) ? ` / ${formatUnit(rm.unitName)}` : ""}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{rm.lastVendorName}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No price</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setSelectedRMForVendor(rm._id); setShowVendorPriceForm(true); }} className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg transition-colors" title="Add Price" aria-label={`Add price for ${rm.name}`}><Plus className="w-4 h-4" /></button>
                            <button onClick={() => handleViewVendorPrices(rm)} className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg transition-colors" title="View Prices" aria-label={`View prices for ${rm.name}`}><Eye className="w-4 h-4" /></button>
                            <button onClick={() => handleEditRM(rm)} className="p-2 hover:bg-sky-100 dark:hover:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-lg transition-colors" title="Edit" aria-label={`Edit ${rm.name}`}><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteRM(rm._id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors" title="Delete raw material" aria-label={`Delete ${rm.name}`}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="block sm:hidden px-4 py-4 space-y-3">
                {filteredRawMaterials.map((rm) => (
                  <div key={rm._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-2 px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-xs font-semibold">{rm.code}</span>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{rm.name}</div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{rm.categoryName}{rm.subCategoryName ? ` • ${rm.subCategoryName}` : ""}</div>
                        <div className="mt-2 text-sm">
                          {typeof rm.lastAddedPrice === "number" ? (
                            <div className="font-semibold text-slate-900 dark:text-white">₹{rm.lastAddedPrice.toFixed(2)}{formatUnit(rm.unitName) ? ` / ${formatUnit(rm.unitName)}` : ""}</div>
                          ) : (
                            <div className="text-slate-400 italic">No price</div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setSelectedRMForVendor(rm._id); setShowVendorPriceForm(true); }} className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-md" title="Add Price" aria-label={`Add price for ${rm.name}`}><Plus className="w-4 h-4" /></button>
                          <button onClick={() => handleViewVendorPrices(rm)} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md" title="View Prices"><Eye className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleViewPriceLogs(rm)} className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-md" title="View Logs"><History className="w-4 h-4" /></button>
                          <button onClick={() => handleEditRM(rm)} className="p-2 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded-md" title="Edit"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteRM(rm._id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Add RM Modal */}
        {showAddRMForm && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingRMId ? "Edit Raw Material" : "Add New Raw Material"}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {editingRMId ? "Update the details below" : "Fill in the information to create a new raw material"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAddRMForm(false);
                    setRmFormData({
                      name: "",
                      categoryId: "",
                      subCategoryId: "",
                      unitId: "",
                      hsnCode: "",
                    });
                    setRmErrors({});
                    setEditingRMId(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={handleCreateRM}
                className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                {/* RM Name (full width) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Raw Material Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rmFormData.name}
                    onChange={(e) =>
                      setRmFormData({ ...rmFormData, name: e.target.value })
                    }
                    placeholder="e.g., Sugar, Flour, etc."
                    className={`w-full px-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border transition-all text-sm ${
                      rmErrors.name
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-600"
                    } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500`}
                  />
                  {rmErrors.name && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1.5 font-medium">
                      {rmErrors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rmFormData.categoryId}
                    onChange={(e) =>
                      setRmFormData({
                        ...rmFormData,
                        categoryId: e.target.value,
                        subCategoryId: "",
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border transition-all text-sm ${
                      rmErrors.categoryId
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-600"
                    } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {rmErrors.categoryId && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1.5 font-medium">
                      {rmErrors.categoryId}
                    </p>
                  )}
                </div>

                {/* Sub Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Sub Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rmFormData.subCategoryId}
                    onChange={(e) =>
                      setRmFormData({
                        ...rmFormData,
                        subCategoryId: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border transition-all text-sm ${
                      rmErrors.subCategoryId
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-600"
                    } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500`}
                  >
                    <option value="">Select Sub Category</option>
                    {getSelectedCategorySubCategories().map((subcat) => (
                      <option key={subcat._id} value={subcat._id}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                  {rmErrors.subCategoryId && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1.5 font-medium">
                      {rmErrors.subCategoryId}
                    </p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Unit <span className="text-slate-400">(Optional)</span>
                  </label>
                  <select
                    value={rmFormData.unitId}
                    onChange={(e) =>
                      setRmFormData({ ...rmFormData, unitId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                  >
                    <option value="">Select Unit</option>
                    {units.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* HSN Code */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    HSN Code <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={rmFormData.hsnCode}
                    onChange={(e) =>
                      setRmFormData({ ...rmFormData, hsnCode: e.target.value })
                    }
                    placeholder="e.g., 1701"
                    className="w-full px-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Helps with GST reporting
                  </p>
                </div>

                {/* Buttons */}
                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddRMForm(false);
                      setRmFormData({
                        name: "",
                        categoryId: "",
                        subCategoryId: "",
                        unitId: "",
                        hsnCode: "",
                      });
                      setRmErrors({});
                    }}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-medium text-sm rounded-md transition-colors flex items-center justify-center gap-2"
                    aria-label={
                      editingRMId
                        ? "Update raw material"
                        : "Create raw material"
                    }
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>
                          {editingRMId ? "Updating..." : "Creating..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>{editingRMId ? "Update" : "Create"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Vendor Price Modal */}
        {showVendorPriceForm && selectedRMForVendor && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Add Vendor Price
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Record a new vendor price
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowVendorPriceForm(false);
                    setSelectedRMForVendor(null);
                    setVendorPriceForm({
                      vendorId: "",
                      price: "",
                      totalQuantity: "",
                      totalPrice: "",
                    });
                    setErrors({});
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddVendorPrice} className="p-6 space-y-5">
                {/* Vendor */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={vendorPriceForm.vendorId}
                    onChange={(e) =>
                      setVendorPriceForm({
                        ...vendorPriceForm,
                        vendorId: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border transition-all text-sm ${
                      errors.vendorId
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-600"
                    } text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500`}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                  {errors.vendorId && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1.5 font-medium">
                      {errors.vendorId}
                    </p>
                  )}
                </div>

                {/* Total Buy Quantity (required) - will calculate per-unit price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Total Buy Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={vendorPriceForm.totalQuantity}
                    onChange={(e) => {
                      const totalQ = e.target.value;
                      const totalP = vendorPriceForm.totalPrice;
                      let derivedPrice = vendorPriceForm.price;
                      if (totalQ && totalP && Number(totalQ) > 0) {
                        derivedPrice = (
                          Number(totalP) / Number(totalQ)
                        ).toFixed(2);
                      }
                      setVendorPriceForm({
                        ...vendorPriceForm,
                        totalQuantity: totalQ,
                        price: derivedPrice,
                      });
                    }}
                    placeholder="Enter quantity"
                    className={`w-full px-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border transition-all text-sm ${
                      errors.totalQuantity
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-600"
                    } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500`}
                  />
                  {errors.totalQuantity && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1.5 font-medium">
                      {errors.totalQuantity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Total Buy Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={vendorPriceForm.totalPrice}
                    onChange={(e) => {
                      const totalP = e.target.value;
                      const totalQ = vendorPriceForm.totalQuantity;
                      let derivedPrice = vendorPriceForm.price;
                      if (totalQ && totalP && Number(totalQ) > 0) {
                        derivedPrice = (
                          Number(totalP) / Number(totalQ)
                        ).toFixed(2);
                      }
                      setVendorPriceForm({
                        ...vendorPriceForm,
                        totalPrice: totalP,
                        price: derivedPrice,
                      });
                    }}
                    placeholder="Enter price"
                    className={`w-full px-4 py-2.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border transition-all text-sm ${
                      errors.totalPrice
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-600"
                    } text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500`}
                  />
                  {errors.totalPrice && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1.5 font-medium">
                      {errors.totalPrice}
                    </p>
                  )}
                </div>

                {/* Computed price display */}
                {vendorPriceForm.totalQuantity &&
                  vendorPriceForm.totalPrice &&
                  Number(vendorPriceForm.totalQuantity) > 0 && (
                    <div className="p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 rounded-md">
                      <p className="text-xs text-teal-700 dark:text-teal-300">
                        <span className="font-semibold">Calculated Price:</span> ₹
                        {(
                          Number(vendorPriceForm.totalPrice) /
                          Number(vendorPriceForm.totalQuantity)
                        ).toFixed(2)}
                        {selectedRMForVendor &&
                          (() => {
                            const rm = rawMaterials.find(
                              (r) => r._id === selectedRMForVendor,
                            );
                            return rm ? ` / ${rm.unitName || "unit"}` : "";
                          })()}
                      </p>
                    </div>
                  )}

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVendorPriceForm(false);
                      setSelectedRMForVendor(null);
                      setVendorPriceForm({
                        vendorId: "",
                        price: "",
                        totalQuantity: "",
                        totalPrice: "",
                      });
                      setErrors({});
                    }}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-400 text-white font-medium text-sm py-2.5 rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Price</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vendor Prices Modal */}
        {showVendorPricesModal && selectedRMForPrices && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Vendor Prices
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedRMForPrices.code} - {selectedRMForPrices.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowVendorPricesModal(false);
                    setSelectedRMForPrices(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {vendorPrices.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-sm">No vendor prices found for this raw material.</p>
                </div>
              ) : (
                <div className="overflow-x-auto table-responsive">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {(vendorPrices || []).map((vp) => (
                        <tr key={vp._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                            {vp.vendorName}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-teal-600 dark:text-teal-400">
                              {typeof vp.price === "number"
                                ? `₹${vp.price.toFixed(2)}${formatUnit(vp.unitName) ? ` / ${formatUnit(vp.unitName)}` : formatUnit(selectedRMForPrices?.unitName) ? ` / ${formatUnit(selectedRMForPrices?.unitName)}` : ""}`
                                : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {vp.quantity ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                            {vp.addedDate ? formatDate(vp.addedDate) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Costing Modal removed */}

        {/* Price Logs Modal */}
        {showPriceLogsModal && selectedRMForLogs && (
          <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center p-4 backdrop-blur">
            <div className="bg-white dark:bg-slate-800 rounded-xi shadow-xl max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0 sticky top-0 bg-white dark:bg-slate-800 z-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Price Logs
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedRMForLogs.code} - {selectedRMForLogs.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPriceLogsModal(false);
                    setSelectedRMForLogs(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {priceLogs.length === 0 ? (
                  <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                    <p className="text-sm">No price logs found for this raw material.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto table-responsive">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Vendor
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Old Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            New Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Change Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Changed By
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {priceLogs.map((log) => (
                          <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-slate-900 dark:text-white">
                              {log.vendorName}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                              ₹{log.oldPrice.toFixed(2)}{formatUnit(log.unitName) ? ` / ${formatUnit(log.unitName)}` : formatUnit(selectedRMForLogs?.unitName) ? ` / ${formatUnit(selectedRMForLogs?.unitName)}` : ""}
                            </td>
                            <td className="px-4 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                              ₹{log.newPrice.toFixed(2)}{formatUnit(log.unitName) ? ` / ${formatUnit(log.unitName)}` : formatUnit(selectedRMForLogs?.unitName) ? ` / ${formatUnit(selectedRMForLogs?.unitName)}` : ""}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(log.changeDate)}
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {log.changedBy}
                            </td>
                            <td className="px-4 py-4 text-sm text-center">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeletePriceLog(log._id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-md font-medium transition-colors"
                                title="Delete log entry"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
          </div>
        )}
    </>
    </Layout>
  );
}
