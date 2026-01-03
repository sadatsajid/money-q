import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@prisma/client";

/**
 * Ensures a user profile exists in the database.
 * If the user is authenticated in Supabase but doesn't have a Prisma profile,
 * this function will create one automatically.
 * 
 * @returns The user profile, or null if not authenticated
 */
export async function ensureUserProfile(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    // Check if user profile exists
    let dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    // If profile doesn't exist, create it
    if (!dbUser) {
      // Get user metadata from Supabase (name might be in user_metadata)
      const name = authUser.user_metadata?.name || authUser.email?.split("@")[0] || null;
      
      dbUser = await prisma.user.create({
        data: {
          id: authUser.id,
          email: authUser.email!,
          name,
          defaultCurrency: "BDT",
        },
      });

      // Create default payment method (Cash) - only if it doesn't exist
      const existingPaymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          userId: dbUser.id,
          name: "Cash",
          deletedAt: null,
        },
      });

      if (!existingPaymentMethod) {
        await prisma.paymentMethod.create({
          data: {
            userId: dbUser.id,
            name: "Cash",
            type: "Cash",
          },
        });
      }

      // Create default savings buckets - only if they don't exist
      const existingBuckets = await prisma.savingsBucket.findMany({
        where: { userId: dbUser.id },
      });

      if (existingBuckets.length === 0) {
        await prisma.savingsBucket.createMany({
          data: [
            {
              userId: dbUser.id,
              name: "Trip Fund",
              type: "Trip Fund",
              sortOrder: 1,
            },
            {
              userId: dbUser.id,
              name: "Emergency Fund",
              type: "Emergency Fund",
              sortOrder: 2,
            },
            {
              userId: dbUser.id,
              name: "Investment Pool",
              type: "Investment Pool",
              sortOrder: 3,
            },
          ],
        });
      }
    }

    return dbUser;
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    return null;
  }
}

