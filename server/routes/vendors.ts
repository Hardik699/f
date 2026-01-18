import { RequestHandler } from "express";
import { getDB, getConnectionStatus } from "../db";
import { ObjectId } from "mongodb";

export interface Vendor {
  _id?: ObjectId;
  name: string;
  personName: string;
  mobileNumber: string;
  email?: string;
  location: string;
  gstNumber?: string;
  dataSource?: "GST_API" | "MANUAL";
  gstStatus?: string;
  registrationDate?: string;
  address?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  editLog: Array<{
    timestamp: Date;
    editedBy: string;
    changes: Record<string, any>;
  }>;
}

// GET all vendors
export const handleGetVendors: RequestHandler = async (_req, res) => {
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

    const vendors = await db
      .collection("vendors")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, data: vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST create vendor
export const handleCreateVendor: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  const { name, personName, mobileNumber, email, location, gstNumber, dataSource, gstStatus, registrationDate, address, state } = req.body;
  const username = "admin";

  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Vendor name is required" });
  }

  if (!personName || !personName.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Person name is required" });
  }

  if (!mobileNumber || !mobileNumber.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Mobile number is required" });
  }

  if (!location || !location.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Location/Address is required" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    // Check for duplicate name
    const existing = await db
      .collection("vendors")
      .findOne({ name: name.trim() });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vendor with this name already exists",
        });
    }

    // If GST provided, ensure GST is unique
    if (gstNumber && gstNumber.trim()) {
      const dupGst = await db.collection("vendors").findOne({ gstNumber: gstNumber.trim().toUpperCase() });
      if (dupGst) {
        return res.status(400).json({ success: false, message: "Vendor with this GST number already exists" });
      }
    }

    const newVendor: Vendor = {
      name: name.trim(),
      personName: personName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email?.trim() || "",
      location: location.trim(),
      gstNumber: gstNumber?.trim().toUpperCase() || undefined,
      dataSource: dataSource || "MANUAL",
      gstStatus: gstStatus || undefined,
      registrationDate: registrationDate || undefined,
      address: address || undefined,
      state: state || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: username,
      editLog: [],
    };

    const result = await db.collection("vendors").insertOne(newVendor);
    res.json({
      success: true,
      message: "Vendor created successfully",
      data: { _id: result.insertedId, ...newVendor },
    });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT update vendor
export const handleUpdateVendor: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  const { id } = req.params;
  const { name, personName, mobileNumber, email, location, gstNumber, dataSource, gstStatus, registrationDate, address, state } = req.body;
  const username = "admin";

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Vendor ID is required" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const objectId = new ObjectId(id as string);
    const existing = await db.collection("vendors").findOne({ _id: objectId });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    // Check for duplicate name
    if (name && name !== existing.name) {
      const duplicate = await db
        .collection("vendors")
        .findOne({ name: name.trim() });
      if (duplicate) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Vendor with this name already exists",
          });
      }
    }

    // Check for duplicate GST when modifying/adding
    if (gstNumber && gstNumber.trim()) {
      const gstNormalized = gstNumber.trim().toUpperCase();
      if (!existing.gstNumber || existing.gstNumber !== gstNormalized) {
        const dup = await db.collection("vendors").findOne({ gstNumber: gstNormalized });
        if (dup) {
          return res.status(400).json({ success: false, message: "Vendor with this GST number already exists" });
        }
      }
    }

    const changes: Record<string, any> = {};
    if (name && name !== existing.name)
      changes.name = { from: existing.name, to: name };
    if (personName && personName !== existing.personName)
      changes.personName = { from: existing.personName, to: personName };
    if (mobileNumber && mobileNumber !== existing.mobileNumber)
      changes.mobileNumber = { from: existing.mobileNumber, to: mobileNumber };
    if (email !== undefined && email !== existing.email)
      changes.email = { from: existing.email, to: email };
    if (location && location !== existing.location)
      changes.location = { from: existing.location, to: location };
    if (gstNumber !== undefined && gstNumber !== existing.gstNumber)
      changes.gstNumber = { from: existing.gstNumber, to: gstNumber };
    if (dataSource !== undefined && dataSource !== existing.dataSource)
      changes.dataSource = { from: existing.dataSource, to: dataSource };

    const updateData: Partial<Vendor> = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name.trim();
    if (personName) updateData.personName = personName.trim();
    if (mobileNumber) updateData.mobileNumber = mobileNumber.trim();
    if (email !== undefined) updateData.email = email?.trim() || "";
    if (location) updateData.location = location.trim();
    if (gstNumber !== undefined) updateData.gstNumber = gstNumber?.trim().toUpperCase() || undefined;
    if (dataSource !== undefined) updateData.dataSource = dataSource;
    if (gstStatus !== undefined) updateData.gstStatus = gstStatus;
    if (registrationDate !== undefined) updateData.registrationDate = registrationDate;
    if (address !== undefined) updateData.address = address;
    if (state !== undefined) updateData.state = state;

    const editLogEntry = {
      timestamp: new Date(),
      editedBy: username,
      changes,
    };

    const result = await db.collection("vendors").findOneAndUpdate(
      { _id: objectId },
      {
        $set: updateData,
        $push: { editLog: editLogEntry } as any,
      },
      { returnDocument: "after" },
    );

    res.json({
      success: true,
      message: "Vendor updated successfully",
      data: result.value,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE vendor
export const handleDeleteVendor: RequestHandler = async (req, res) => {
  if (getConnectionStatus() !== "connected") {
    return res
      .status(503)
      .json({ success: false, message: "Database not connected" });
  }

  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Vendor ID is required" });
  }

  try {
    const db = getDB();
    if (!db)
      return res
        .status(503)
        .json({ success: false, message: "Database error" });

    const objectId = new ObjectId(id as string);
    const result = await db.collection("vendors").deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    res.json({ success: true, message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
