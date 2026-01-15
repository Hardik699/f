import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  LayoutDashboard,
  Package,
  List,
  Menu,
  X,
} from "lucide-react";

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleMenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const menuItems = [
    {
      label: "Category/Unit",
      icon: Package,
      submenu: [
        { label: "Create Category", path: "/create-category" },
        { label: "Create Sub Category", path: "/create-subcategory" },
        { label: "Create Unit", path: "/create-unit" },
        { label: "Create Vendor", path: "/create-vendor" },
      ],
    },
    {
      label: "Raw Material",
      path: "/raw-materials",
      icon: Package,
    },
    {
      label: "Raw Material Costing",
      path: "/recipe-costing",
      icon: List,
    },
  ];

  const renderSubmenu = (submenu: any[], level = 0, parentLabel?: string) => {
    return (
      <div className={`mt-2 space-y-1 ml-${level * 4} pl-0`}>
        {submenu.map((subitem, subindex) => {
          const hasNested =
            Array.isArray(subitem.submenu) && subitem.submenu.length;
          if (hasNested) {
            const open = expandedMenu === subitem.label;
            return (
              <div key={subindex}>
                <button
                  onClick={() => toggleMenu(subitem.label)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(subitem.submenu[0]?.path || "")
                      ? "bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                  }`}
                >
                  <span>{subitem.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                    {renderSubmenu(subitem.submenu, level + 1, subitem.label)}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={subindex}
              to={subitem.path}
              onClick={() => {
                // Close mobile sidebar, but keep the parent submenu expanded so it remains open when returning
                setIsOpen(false);
                if (parentLabel) setExpandedMenu(parentLabel);
              }}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(subitem.path)
                  ? "bg-teal-100/60 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-l-3 border-teal-500 pl-5"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/30"
              }`}
            >
              {subitem.label}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 sm:top-5 left-4 z-50 md:hidden bg-white dark:bg-slate-800 p-2 rounded-lg border-2 border-teal-200 dark:border-teal-700 hover:bg-teal-50 dark:hover:bg-slate-700/50 hover:border-teal-300 dark:hover:border-teal-600 transition-all text-teal-600 dark:text-teal-400"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-800/95 border-r border-slate-200 dark:border-slate-700 pt-20 sm:pt-24 overflow-y-auto z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      isActive(item.submenu[0]?.path || "")
                        ? "bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300 shadow-md border-l-4 border-teal-600"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        expandedMenu === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedMenu === item.label && (
                    <div className="mt-2 ml-4 border-l-2 border-slate-200 dark:border-slate-700 pl-4">
                      {renderSubmenu(item.submenu)}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path!}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    isActive(item.path!)
                      ? "bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 text-teal-700 dark:text-teal-300 shadow-md border-l-4 border-teal-600"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/30"
                  }`}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content wrapper - offset from sidebar */}
      <div className="hidden md:block md:ml-64" />
    </>
  );
}
