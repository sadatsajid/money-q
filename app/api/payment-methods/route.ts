import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/user";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user profile exists (auto-create if missing)
    const dbUser = await ensureUserProfile();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: authUser.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching payment methods:", error.message, error);
    } else {
      console.error("Error fetching payment methods:", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Use getUser() instead of getSession() for better security
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user profile exists (auto-create if missing)
    const dbUser = await ensureUserProfile();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, provider, lastFour } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: authUser.id,
        name,
        type,
        provider,
        lastFour,
      },
    });

    return NextResponse.json({ paymentMethod }, { status: 201 });
  } catch (error) {
    // Better error handling - check if error exists and handle Prisma errors
    if (error instanceof Error) {
      console.error("Error creating payment method:", error.message, error);
      
      // Handle foreign key constraint errors
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { 
            error: "User profile not found. Please complete your account setup.",
            code: "USER_PROFILE_MISSING"
          },
          { status: 404 }
        );
      }
    } else {
      console.error("Error creating payment method:", error);
    }
    
    return NextResponse.json(
      { error: "Failed to create payment method" },
      { status: 500 }
    );
  }
}

