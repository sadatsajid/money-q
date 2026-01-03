import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Food & Dining", icon: "UtensilsCrossed", color: "#f59e0b", sortOrder: 1 },
  { name: "Transport", icon: "Car", color: "#3b82f6", sortOrder: 2 },
  { name: "Bills & Utilities", icon: "FileText", color: "#ef4444", sortOrder: 3 },
  { name: "Shopping", icon: "ShoppingBag", color: "#ec4899", sortOrder: 4 },
  { name: "Healthcare", icon: "Heart", color: "#f43f5e", sortOrder: 5 },
  { name: "Entertainment", icon: "Tv", color: "#8b5cf6", sortOrder: 6 },
  { name: "Education", icon: "GraduationCap", color: "#06b6d4", sortOrder: 7 },
  { name: "Subscriptions", icon: "RefreshCw", color: "#14b8a6", sortOrder: 8 },
  { name: "EMI & Loans", icon: "CreditCard", color: "#f97316", sortOrder: 9 },
  { name: "Work Related", icon: "Briefcase", color: "#64748b", sortOrder: 10 },
  { name: "Rent", icon: "Home", color: "#7c3aed", sortOrder: 11 },
  { name: "Household", icon: "Home", color: "#10b981", sortOrder: 12 },
  { name: "Others", icon: "MoreHorizontal", color: "#6b7280", sortOrder: 13 },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Seed categories
  console.log("📦 Seeding categories...");
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

