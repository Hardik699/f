import { RequestHandler } from "express";
// multer and csv-parse are dynamically imported inside the upload handler
import { getDB, getConnectionStatus } from "../db";
import { ObjectId } from "mongodb";

export interface RawMaterial {
  _id?: ObjectId;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  unitId?: string;
  unitName?: string;
  hsnCode?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastAddedPrice?: number;
  lastVendorName?: string;
  lastPriceDate?: Date;
}

export interface RMVendorPrice {
  _id?: ObjectId;
  rawMaterialId: string;
  vendorId: string;
  vendorName: string;
  quantity: number;
  unitId?: string;
  unitName?: string;
  price: number;
  addedDate: Date;
  createdBy: string;
}

export interface RMPriceLog {
  _id?: ObjectId;
  rawMaterialId: string;
  vendorId: string;
  vendorName: string;
  oldPrice: number;
  newPrice: number;
  quantity: number;
  unitId?: string;
  unitName?: string;
  changeDate: Date;
  changedBy: string;
}

// Get next RM code
const getNextRMCode = async (db: any): Promise<string> => {
  const appData = await db
    .collection("app_data")
    .findOne({ key: "rm_counter" });

  let nextNumber = 1;
  if (appData && appData.value) {
    nextNumber = appData.value + 1;
  }

  await db
    .collection("app_data")
    .updateOne(
      { key: "rm_counter" },
      { $set: { value: nextNumber } },
      { upsert: true },
    );

  return `RM${String(nextNumber).padStart(3, "0")}`;
};

// GET all raw materials
export const handleGetRawMaterials: RequestHandler = async (_req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const rawMaterials = await db
      .collection("raw_materials")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();

    res.json({ success: true, data: rawMaterials });
  } catch (error) {
    console.error("Error fetching raw materials:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST create raw material
export const handleCreateRawMaterial: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const {
      name,
      categoryId,
      categoryName,
      subCategoryId,
      subCategoryName,
      unitId,
      unitName,
      hsnCode,
      createdBy,
    } = req.body;

    // Validate required fields
    if (!name || !categoryId || !subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Name, category, and sub-category are required",
      });
    }

    const code = await getNextRMCode(db);

    const newRM: RawMaterial = {
      code,
      name,
      categoryId,
      categoryName,
      subCategoryId,
      subCategoryName,
      unitId,
      unitName,
      hsnCode,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
    };

    const result = await db.collection("raw_materials").insertOne(newRM);

    res.status(201).json({
      success: true,
      message: "Raw material created successfully",
      data: { ...newRM, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating raw material:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT update raw material
export const handleUpdateRawMaterial: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const { id } = req.params;
    const {
      name,
      categoryId,
      categoryName,
      subCategoryId,
      subCategoryName,
      unitId,
      unitName,
      hsnCode,
    } = req.body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (categoryId) updateData.categoryId = categoryId;
    if (categoryName) updateData.categoryName = categoryName;
    if (subCategoryId) updateData.subCategoryId = subCategoryId;
    if (subCategoryName) updateData.subCategoryName = subCategoryName;
    if (unitId) updateData.unitId = unitId;
    if (unitName) updateData.unitName = unitName;
    if (hsnCode !== undefined) updateData.hsnCode = hsnCode;

    const result = await db
      .collection("raw_materials")
      .updateOne({ _id: new ObjectId(id as string) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Raw material not found" });
    }

    res.json({
      success: true,
      message: "Raw material updated successfully",
    });
  } catch (error) {
    console.error("Error updating raw material:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE raw material
export const handleDeleteRawMaterial: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const { id } = req.params;

    const result = await db
      .collection("raw_materials")
      .deleteOne({ _id: new ObjectId(id as string) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Raw material not found" });
    }

    // Also delete associated vendor prices and price logs
    await db.collection("rm_vendor_prices").deleteMany({ rawMaterialId: id });
    await db.collection("rm_price_logs").deleteMany({ rawMaterialId: id });

    res.json({
      success: true,
      message: "Raw material deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting raw material:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// CSV upload handler (bulk create / update)
export const handleUploadRawMaterials: RequestHandler = async (req, res) => {
  try {
    const { default: multer } = await import("multer");
    const { parse } = await import("csv-parse/sync");
    const upload = multer({ storage: multer.memoryStorage() });

    await new Promise<void>((resolve, reject) => {
      upload.single("file")(req as any, res as any, (err: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const db = getDB();
    if (!db) return res.status(503).json({ success: false, message: "Database error" });

    const text = req.file.buffer.toString("utf-8");
    const records: any[] = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

      const results: { created: number; updated: number; skipped: Array<any> } = {
        created: 0,
        updated: 0,
        skipped: [],
      };

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowIndex = i + 2; // header is line 1

        const name = (row.rawMaterialName || row.name || "").toString().trim();
        const categoryName = (row.category || "").toString().trim();
        const subCategoryName = (row.subCategory || "").toString().trim();
        const unitName = (row.unit || "").toString().trim();
        const hsnCode = (row.hsnCode || "").toString().trim();
        const id = row.id ? row.id.toString().trim() : undefined;

        if (!name || !categoryName || !subCategoryName) {
          results.skipped.push({ row: rowIndex, reason: "Missing required field(s)", data: row });
          continue;
        }

        // find category & subcategory
        const category = await db.collection("categories").findOne({ name: categoryName });
        if (!category) {
          results.skipped.push({ row: rowIndex, reason: `Category not found: ${categoryName}`, data: row });
          continue;
        }

        const subcategory = await db.collection("subcategories").findOne({ name: subCategoryName, categoryId: category._id?.toString() ?? category._id });
        // fallback: try only by name
        if (!subcategory) {
          const sub2 = await db.collection("subcategories").findOne({ name: subCategoryName });
            if (!sub2) {
            results.skipped.push({ row: rowIndex, reason: `SubCategory not found: ${subCategoryName}`, data: row });
            continue;
          }
        }

        // resolve unit if exists
        let unit: any = null;
        if (unitName) {
          unit = await db.collection("units").findOne({ name: unitName });
        }

        // If id present -> update
        if (id) {
          try {
            const updateData: any = {
              name,
              categoryId: (category._id as any).toString(),
              categoryName: category.name,
              subCategoryName,
              updatedAt: new Date(),
            };

            if (subcategory) updateData.subCategoryId = (subcategory._id as any).toString();
            if (unit) {
              updateData.unitId = (unit._id as any).toString();
              updateData.unitName = unit.name;
            }
            if (hsnCode !== undefined) updateData.hsnCode = hsnCode;

            const { matchedCount } = await db
              .collection("raw_materials")
              .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

            if (matchedCount === 0) {
              results.skipped.push({ row: rowIndex, reason: `ID not found: ${id}`, data: row });
              continue;
            }

            results.updated += 1;
          } catch (err) {
            results.skipped.push({ row: rowIndex, reason: `Update error: ${String(err)}`, data: row });
          }
        } else {
          // create
          try {
            const code = await getNextRMCode(db);
            const newRM: RawMaterial = {
              code,
              name,
              categoryId: (category._id as any).toString(),
              categoryName: category.name,
              subCategoryId: (subcategory ? (subcategory._id as any).toString() : undefined) as any,
              subCategoryName,
              unitId: unit ? (unit._id as any).toString() : undefined,
              unitName: unit ? unit.name : undefined,
              hsnCode: hsnCode || undefined,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: "admin",
            };

            await db.collection("raw_materials").insertOne(newRM);
            results.created += 1;
          } catch (err) {
            results.skipped.push({ row: rowIndex, reason: `Create error: ${String(err)}`, data: row });
          }
        }
      }

      res.json({ success: true, data: results });
    } catch (error) {
      console.error("Error processing CSV:", error);
      res.status(500).json({ success: false, message: "Server error parsing CSV" });
    }
};

// Export all raw materials as CSV
export const handleExportRawMaterials: RequestHandler = async (_req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res.status(503).json({ success: false, message: "Database not connected" });
  }

  try {
    const db = getDB();
    if (!db) return res.status(503).json({ success: false, message: "Database error" });

    const rawMaterials = await db.collection("raw_materials").find({}).toArray();

    const headers = ["id", "rawMaterialName", "category", "subCategory", "unit", "hsnCode"];

    const lines = [headers.join(",")];
    for (const rm of rawMaterials) {
      const row = [
        rm._id?.toString() || "",
        (rm.name || "").replace(/"/g, '""'),
        (rm.categoryName || "").replace(/"/g, '""'),
        (rm.subCategoryName || "").replace(/"/g, '""'),
        (rm.unitName || "").replace(/"/g, '""'),
        (rm.hsnCode || "").toString().replace(/"/g, '""'),
      ].map((v) => (v && v.toString().includes(",") ? `"${v}"` : v));
      lines.push(row.join(","));
    }

    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="raw-materials-export.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST add vendor price for raw material
export const handleAddRMVendorPrice: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const {
      rawMaterialId,
      vendorId,
      vendorName,
      quantity,
      unitId,
      unitName,
      price,
      createdBy,
    } = req.body;

    // Validate required fields
    if (
      !rawMaterialId ||
      !vendorId ||
      !quantity ||
      !price ||
      price < 0 ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    // Get the existing raw material to update last added price
    const rm = await db
      .collection("raw_materials")
      .findOne({ _id: new ObjectId(rawMaterialId) });

    if (!rm) {
      return res
        .status(404)
        .json({ success: false, message: "Raw material not found" });
    }

    // Check if this vendor already has a price for this RM
    const existingVendorPrice = await db.collection("rm_vendor_prices").findOne({
      rawMaterialId: new ObjectId(rawMaterialId),
      vendorId: new ObjectId(vendorId)
    });

    let oldPrice = null;
    if (existingVendorPrice) {
      oldPrice = existingVendorPrice.price;
    }

    // Create price log if this vendor already had a price and it's different
    if (oldPrice !== null && oldPrice !== price) {
      const priceLog: RMPriceLog = {
        rawMaterialId,
        vendorId,
        vendorName,
        oldPrice,
        newPrice: price,
        quantity,
        unitId,
        unitName,
        changeDate: new Date(),
        changedBy: createdBy,
      };

      await db.collection("rm_price_logs").insertOne(priceLog);
    }

    // Create vendor price record
    const vendorPrice: RMVendorPrice = {
      rawMaterialId,
      vendorId,
      vendorName,
      quantity,
      unitId,
      unitName,
      price,
      addedDate: new Date(),
      createdBy,
    };

    const result = await db
      .collection("rm_vendor_prices")
      .insertOne(vendorPrice);

    // Update raw material with last added price
    await db.collection("raw_materials").updateOne(
      { _id: new ObjectId(rawMaterialId) },
      {
        $set: {
          lastAddedPrice: price,
          lastVendorName: vendorName,
          lastPriceDate: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    // Propagate price change to recipes that include this raw material
    try {
      const affectedItems = await db.collection("recipe_items").find({ rawMaterialId }).toArray();
      const recipeIds = Array.from(new Set(affectedItems.map((it: any) => it.recipeId)));

      for (const recipeId of recipeIds) {
        const recipe = await db.collection("recipes").findOne({ _id: new ObjectId(recipeId) });
        if (!recipe) continue;

        let anyChange = false;

        // Update each matching item in the recipe
        for (const it of affectedItems.filter((a: any) => a.recipeId === recipeId)) {
          const oldItemPrice = it.price;
          if (oldItemPrice !== price) {
            const newTotalPrice = (it.quantity || 0) * price;
            const newPricePerKg = it.yield ? newTotalPrice / it.yield : undefined;

            await db.collection("recipe_items").updateOne(
              { _id: it._id },
              { $set: { price, totalPrice: newTotalPrice, pricePerKg: newPricePerKg } },
            );

            // Log the change for this recipe
            await db.collection("recipe_logs").insertOne({
              recipeId,
              recipeItemId: it._id ? it._id.toString() : undefined,
              rawMaterialId,
              fieldChanged: "price",
              oldValue: oldItemPrice,
              newValue: price,
              changeDate: new Date(),
              changedBy: createdBy,
              recipeCode: recipe.code,
            });

            anyChange = true;
          }
        }

        // Recalculate recipe totals and create a history snapshot if any item changed
        if (anyChange) {
          const updatedItems = await db.collection("recipe_items").find({ recipeId }).toArray();
          const totalRawMaterialCost = updatedItems.reduce(
            (sum: number, x: any) => sum + (x.totalPrice || 0),
            0,
          );
          const pricePerUnit = recipe.batchSize > 0 ? totalRawMaterialCost / recipe.batchSize : 0;

          await db.collection("recipes").updateOne(
            { _id: new ObjectId(recipeId) },
            { $set: { totalRawMaterialCost, pricePerUnit: parseFloat(pricePerUnit.toFixed(2)), updatedAt: new Date() } },
          );

          const historySnapshot = {
            recipeId,
            recipeCode: recipe.code,
            recipeName: recipe.name,
            snapshotDate: new Date(),
            totalRawMaterialCost,
            pricePerUnit: parseFloat(pricePerUnit.toFixed(2)),
            items: updatedItems,
            createdReason: "price_change",
            changedBy: createdBy,
          };

          await db.collection("recipe_history").insertOne(historySnapshot);
        }
      }
    } catch (err) {
      console.error("Error propagating RM price to recipes:", err);
    }

    res.status(201).json({
      success: true,
      message: "Vendor price added successfully",
      data: { ...vendorPrice, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error adding vendor price:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET vendor prices for a raw material
export const handleGetRMVendorPrices: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const { rawMaterialId } = req.params;

    const prices = await db
      .collection("rm_vendor_prices")
      .find({ rawMaterialId })
      .sort({ addedDate: -1 })
      .toArray();

    res.json({ success: true, data: prices });
  } catch (error) {
    console.error("Error fetching vendor prices:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET price logs for a raw material
export const handleGetRMPriceLogs: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const { rawMaterialId } = req.params;

    const logs = await db
      .collection("rm_price_logs")
      .find({ rawMaterialId })
      .sort({ changeDate: -1 })
      .toArray();

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error("Error fetching price logs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
;

// POST sync latest vendor price for a raw material and propagate to recipes
export const handleSyncLatestRMPrice: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const { rawMaterialId } = req.params;
    const { createdBy } = req.body || { createdBy: "system" };

    const rm = await db
      .collection("raw_materials")
      .findOne({ _id: new ObjectId(rawMaterialId as string) });

    if (!rm) {
      return res
        .status(404)
        .json({ success: false, message: "Raw material not found" });
    }

    // Find latest vendor price
    const latestPrice = await db
      .collection("rm_vendor_prices")
      .find({ rawMaterialId })
      .sort({ addedDate: -1 })
      .limit(1)
      .toArray();

    if (!latestPrice || latestPrice.length === 0) {
      return res.json({ success: false, message: "No vendor prices found for this RM" });
    }

    const latest = latestPrice[0];
    const price = latest.price;
    const vendorName = latest.vendorName;

    // No change
    if (rm.lastAddedPrice === price) {
      return res.json({ success: true, message: "No price change", data: { price } });
    }

    // Update raw material last price
    await db.collection("raw_materials").updateOne(
      { _id: new ObjectId(rawMaterialId as string) },
      {
        $set: {
          lastAddedPrice: price,
          lastVendorName: vendorName,
          lastPriceDate: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    // Propagate to recipes
    const affectedItems = await db.collection("recipe_items").find({ rawMaterialId }).toArray();
    const recipeIds = Array.from(new Set(affectedItems.map((it: any) => it.recipeId)));
    const updatedRecipes: string[] = [];

    for (const recipeId of recipeIds) {
      const recipe = await db.collection("recipes").findOne({ _id: new ObjectId(recipeId) });
      if (!recipe) continue;

      let anyChange = false;

      for (const it of affectedItems.filter((a: any) => a.recipeId === recipeId)) {
        const oldItemPrice = it.price;
        if (oldItemPrice !== price) {
          const newTotalPrice = (it.quantity || 0) * price;
          const newPricePerKg = it.yield ? newTotalPrice / it.yield : undefined;

          await db.collection("recipe_items").updateOne(
            { _id: it._id },
            { $set: { price, totalPrice: newTotalPrice, pricePerKg: newPricePerKg } },
          );

          await db.collection("recipe_logs").insertOne({
            recipeId,
            recipeItemId: it._id ? it._id.toString() : undefined,
            rawMaterialId,
            fieldChanged: "price",
            oldValue: oldItemPrice,
            newValue: price,
            changeDate: new Date(),
            changedBy: createdBy || "system",
            recipeCode: recipe.code,
          });

          anyChange = true;
        }
      }

      if (anyChange) {
        const updatedItems = await db.collection("recipe_items").find({ recipeId }).toArray();
        const totalRawMaterialCost = updatedItems.reduce(
          (sum: number, x: any) => sum + (x.totalPrice || 0),
          0,
        );
        const pricePerUnit = recipe.batchSize > 0 ? totalRawMaterialCost / recipe.batchSize : 0;

        await db.collection("recipes").updateOne(
          { _id: new ObjectId(recipeId) },
          { $set: { totalRawMaterialCost, pricePerUnit: parseFloat(pricePerUnit.toFixed(2)), updatedAt: new Date() } },
        );

        const historySnapshot = {
          recipeId,
          recipeCode: recipe.code,
          recipeName: recipe.name,
          snapshotDate: new Date(),
          totalRawMaterialCost,
          pricePerUnit: parseFloat(pricePerUnit.toFixed(2)),
          items: updatedItems,
          createdReason: "price_change",
          changedBy: createdBy || "system",
        };

        await db.collection("recipe_history").insertOne(historySnapshot);
        updatedRecipes.push(recipeId);
      }
    }

    res.json({ success: true, message: "Price synced and recipes updated", data: { price, updatedRecipes } });
  } catch (error) {
    console.error("Error syncing latest RM price:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE price log
export const handleDeleteRMPriceLog: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const { rawMaterialId, logId } = req.params;
    const rawMaterialIdStr = Array.isArray(rawMaterialId) ? rawMaterialId[0] : rawMaterialId;
    const logIdStr = Array.isArray(logId) ? logId[0] : logId;

    const result = await db.collection("rm_price_logs").deleteOne({
      _id: new ObjectId(logIdStr),
      rawMaterialId: new ObjectId(rawMaterialIdStr)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Price log not found" });
    }

    res.json({ success: true, message: "Price log deleted successfully" });
  } catch (error) {
    console.error("Error deleting price log:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
