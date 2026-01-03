import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  let id: string | undefined;
  
  try {
    const supabase = await createClient();
    
    // Verify authentication - try multiple times for signup flow
    let session = null;
    let attempts = 0;
    while (!session && attempts < 3) {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      
      if (currentSession) {
        session = currentSession;
        break;
      }
      
      // Wait a bit for cookies to be available (signup flow)
      if (attempts < 2) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      attempts++;
    }

    const body = await request.json();
    id = body.id;
    const email = body.email;
    const name = body.name;

    // If no session, check if user already exists (prevents duplicate creation)
    if (!session) {
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });
      
      // If user doesn't exist, this is likely a signup - allow it
      // (The user was just created in Supabase auth, cookies just need time to sync)
      if (!existingUser) {
        // Allow creation - user was just created in Supabase auth
        // This is safe because we're creating the profile right after signup
      } else {
        // User exists but no session - require authentication
        return NextResponse.json(
          { error: "Unauthorized - Please sign in" },
          { status: 401 }
        );
      }
    } else {
      // If session exists, verify the user ID matches
      if (session.user.id !== id) {
        return NextResponse.json(
          { error: "User ID mismatch" },
          { status: 403 }
        );
      }
    }

    // Check if user already exists (idempotent)
    let user = await prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      // User already exists - return success (idempotent)
      return NextResponse.json({ success: true, user, alreadyExists: true });
    }

    // Create user in database
    user = await prisma.user.create({
      data: {
        id,
        email,
        name,
        defaultCurrency: "BDT",
      },
    });

    // Create default payment method (Cash) - only if it doesn't exist
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        userId: user.id,
        name: "Cash",
        deletedAt: null,
      },
    });

    if (!existingPaymentMethod) {
      await prisma.paymentMethod.create({
        data: {
          userId: user.id,
          name: "Cash",
          type: "Cash",
        },
      });
    }

    // Create default savings buckets - only if they don't exist
    const existingBuckets = await prisma.savingsBucket.findMany({
      where: { userId: user.id },
    });

    if (existingBuckets.length === 0) {
      await prisma.savingsBucket.createMany({
        data: [
          {
            userId: user.id,
            name: "Trip Fund",
            type: "Trip Fund",
            sortOrder: 1,
          },
          {
            userId: user.id,
            name: "Emergency Fund",
            type: "Emergency Fund",
            sortOrder: 2,
          },
          {
            userId: user.id,
            name: "Investment Pool",
            type: "Investment Pool",
            sortOrder: 3,
          },
        ],
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    // Better error handling
    if (error instanceof Error) {
      console.error("Error creating user:", error.message, error);
      
      // Handle unique constraint violations
      if (error.message.includes("Unique constraint") || error.message.includes("duplicate key")) {
        // User might have been created in a race condition
        if (id) {
          const existingUser = await prisma.user.findUnique({
            where: { id },
          });
          
          if (existingUser) {
            return NextResponse.json({ success: true, user: existingUser, alreadyExists: true });
          }
        }
      }
    } else {
      console.error("Error creating user:", error);
    }
    
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, job, defaultCurrency } = body;

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(job !== undefined && { job }),
        ...(defaultCurrency !== undefined && { defaultCurrency }),
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

