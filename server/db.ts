import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;
let connectionStatus = "disconnected";

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB(): Promise<boolean> {
  if (db) {
    return true;
  }

  try {
    if (!MONGODB_URI) {
      console.error("❌ MONGODB_URI environment variable is not set. Aborting DB connect.");
      return false;
    }
    connectionStatus = "connecting";
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db("faction_app");

    // Verify connection by pinging the database
    await db.admin().ping();
    connectionStatus = "connected";
    console.log("✅ Connected to MongoDB");

    // Initialize collections
    await initializeCollections();

    return true;
  } catch (error) {
    connectionStatus = "disconnected";
    console.error("❌ MongoDB connection failed:", error);
    return false;
  }
}

async function initializeCollections() {
  if (!db) return;

  try {
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // Create users collection if it doesn't exist
    if (!collectionNames.includes("users")) {
      await db.createCollection("users");
      // Create a default admin user
      await db.collection("users").insertOne({
        username: "Hanuram",
        password: "HAnuram@214#", // In production, this should be hashed
        email: "hanuram@faction.local",
        createdAt: new Date(),
        role: "admin",
      });
      console.log("✅ Users collection initialized with default admin user");
    }

    // Create categories collection
    if (!collectionNames.includes("categories")) {
      await db.createCollection("categories");
      // Create unique index on category name
      await db
        .collection("categories")
        .createIndex({ name: 1 }, { unique: true });
      console.log("✅ Categories collection initialized");
    }

    // Create subcategories collection
    if (!collectionNames.includes("subcategories")) {
      await db.createCollection("subcategories");
      // Create unique index on subcategory name within a category
      await db
        .collection("subcategories")
        .createIndex({ name: 1 }, { unique: true });
      console.log("✅ SubCategories collection initialized");
    }

    // Create units collection
    if (!collectionNames.includes("units")) {
      await db.createCollection("units");
      // Create unique index on unit name
      await db.collection("units").createIndex({ name: 1 }, { unique: true });
      console.log("✅ Units collection initialized");
    }

    // Create vendors collection
    if (!collectionNames.includes("vendors")) {
      await db.createCollection("vendors");
      // Create unique index on vendor name
      await db.collection("vendors").createIndex({ name: 1 }, { unique: true });
      console.log("✅ Vendors collection initialized");
    }

    // Create raw materials collection
    if (!collectionNames.includes("raw_materials")) {
      await db.createCollection("raw_materials");
      // Create unique index on RM code
      await db
        .collection("raw_materials")
        .createIndex({ code: 1 }, { unique: true });
      console.log("✅ Raw Materials collection initialized");
    }

    // Create RM vendor prices collection (for price history and vendor-specific pricing)
    if (!collectionNames.includes("rm_vendor_prices")) {
      await db.createCollection("rm_vendor_prices");
      console.log("✅ RM Vendor Prices collection initialized");
    }

    // Create RM price logs collection (for price change tracking)
    if (!collectionNames.includes("rm_price_logs")) {
      await db.createCollection("rm_price_logs");
      console.log("✅ RM Price Logs collection initialized");
    }

    // Create recipes collection
    if (!collectionNames.includes("recipes")) {
      await db.createCollection("recipes");
      // Create unique index on recipe code
      await db.collection("recipes").createIndex({ code: 1 }, { unique: true });
      console.log("✅ Recipes collection initialized");
    }

    // Create recipe items collection (RMs in each recipe)
    if (!collectionNames.includes("recipe_items")) {
      await db.createCollection("recipe_items");
      console.log("✅ Recipe Items collection initialized");
    }

    // Create recipe history collection (snapshots of recipes over time)
    if (!collectionNames.includes("recipe_history")) {
      await db.createCollection("recipe_history");
      console.log("✅ Recipe History collection initialized");
    }

    // Create recipe logs collection (logs for changes in recipes)
    if (!collectionNames.includes("recipe_logs")) {
      await db.createCollection("recipe_logs");
      console.log("✅ Recipe Logs collection initialized");
    }

    // Create app_data collection if it doesn't exist
    if (!collectionNames.includes("app_data")) {
      await db.createCollection("app_data");
      console.log("✅ App data collection initialized");
    }
  } catch (error) {
    console.error("Error initializing collections:", error);
  }
}

export function getDB(): Db | null {
  return db;
}

export function getConnectionStatus(): string {
  return connectionStatus;
}

export async function disconnectDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    connectionStatus = "disconnected";
    console.log("Disconnected from MongoDB");
  }
}
