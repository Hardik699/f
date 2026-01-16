import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo, handlePopulateSampleData } from "./routes/demo";
import { handleLogin } from "./routes/login";
import { handleDBStatus } from "./routes/db-status";
import {
  handleGetCategories,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
} from "./routes/categories";
import {
  handleGetSubCategories,
  handleCreateSubCategory,
  handleUpdateSubCategory,
  handleDeleteSubCategory,
} from "./routes/subcategories";
import {
  handleGetUnits,
  handleCreateUnit,
  handleUpdateUnit,
  handleDeleteUnit,
} from "./routes/units";
import {
  handleGetVendors,
  handleCreateVendor,
  handleUpdateVendor,
  handleDeleteVendor,
} from "./routes/vendors";
import {
  handleGetRawMaterials,
  handleCreateRawMaterial,
  handleUpdateRawMaterial,
  handleDeleteRawMaterial,
  handleAddRMVendorPrice,
  handleGetRMVendorPrices,
  handleGetRMPriceLogs,
  handleDeleteRMPriceLog,
  handleUploadRawMaterials,
  handleExportRawMaterials,
  handleSyncLatestRMPrice,
} from "./routes/raw-materials";
import {
  handleGetRecipes,
  handleCreateRecipe,
  handleUpdateRecipe,
  handleDeleteRecipe,
  handleGetRecipeItems,
  handleGetRecipeHistory,
  handleDeleteRecipeHistory,
  handleGetRecipeLogs,
  handleCreateRecipeSnapshot,
} from "./routes/recipes";
import { connectDB } from "./db";

export async function createServer() {
  const app = express();

  // Wrap route registration methods to log failures and identify problematic paths
  const _wrap = (method: keyof ReturnType<typeof express>) => {
    // @ts-expect-error dynamic
    const orig = (app as any)[method];
    (app as any)[method] = function (path: any, ...handlers: any[]) {
      try {
        return orig.call(this, path, ...handlers);
      } catch (err) {
        console.error(`Route registration failed for method=${method} path=${String(path)}`);
        console.error(err);
        throw err;
      }
    };
  };

  ["get", "post", "put", "delete", "use"].forEach((m) => _wrap(m as any));

  // Middleware
  app.use(
    cors({
      origin: "*",
      credentials: false,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database connection
  await connectDB();

  // API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  // Provide a GET route for demo population for convenience during local testing
  app.get("/api/demo/populate-sample-data", handlePopulateSampleData);
  app.post("/api/demo/populate-sample-data", handlePopulateSampleData);

  // Authentication routes
  app.post("/api/login", handleLogin);
  app.get("/api/db-status", handleDBStatus);

  // Category routes
  app.get("/api/categories", handleGetCategories);
  app.post("/api/categories", handleCreateCategory);
  app.put("/api/categories/:id", handleUpdateCategory);
  app.delete("/api/categories/:id", handleDeleteCategory);

  // SubCategory routes
  app.get("/api/subcategories", handleGetSubCategories);
  app.post("/api/subcategories", handleCreateSubCategory);
  app.put("/api/subcategories/:id", handleUpdateSubCategory);
  app.delete("/api/subcategories/:id", handleDeleteSubCategory);

  // Unit routes
  app.get("/api/units", handleGetUnits);
  app.post("/api/units", handleCreateUnit);
  app.put("/api/units/:id", handleUpdateUnit);
  app.delete("/api/units/:id", handleDeleteUnit);

  // Vendor routes
  app.get("/api/vendors", handleGetVendors);
  app.post("/api/vendors", handleCreateVendor);
  app.put("/api/vendors/:id", handleUpdateVendor);
  app.delete("/api/vendors/:id", handleDeleteVendor);

  // Raw Material routes
  app.get("/api/raw-materials", handleGetRawMaterials);
  app.post("/api/raw-materials", handleCreateRawMaterial);
  app.post("/api/raw-materials/upload", handleUploadRawMaterials as any);
  app.put("/api/raw-materials/:id", handleUpdateRawMaterial);
  app.delete("/api/raw-materials/:id", handleDeleteRawMaterial);
  app.post("/api/raw-materials/vendor-price", handleAddRMVendorPrice);
  app.get(
    "/api/raw-materials/:rawMaterialId/vendor-prices",
    handleGetRMVendorPrices,
  );
  app.get("/api/raw-materials/:rawMaterialId/price-logs", handleGetRMPriceLogs);
  app.delete(
    "/api/raw-materials/:rawMaterialId/price-logs/:logId",
    handleDeleteRMPriceLog,
  );
  app.post(
    "/api/raw-materials/:rawMaterialId/sync-latest-price",
    handleSyncLatestRMPrice,
  );

  // CSV export
  app.get("/api/raw-materials/export", handleExportRawMaterials as any);

  // Recipe routes
  app.get("/api/recipes", handleGetRecipes);
  app.post("/api/recipes", handleCreateRecipe);
  app.put("/api/recipes/:id", handleUpdateRecipe);
  app.delete("/api/recipes/:id", handleDeleteRecipe);
  app.get("/api/recipes/:recipeId/items", handleGetRecipeItems);
  app.get("/api/recipes/:recipeId/history", handleGetRecipeHistory);
  app.delete(
    "/api/recipes/:recipeId/history/:historyId",
    handleDeleteRecipeHistory,
  );
  app.get("/api/recipes/:recipeId/logs", handleGetRecipeLogs);
  app.post("/api/recipes/snapshot", handleCreateRecipeSnapshot);

  return app;
}
