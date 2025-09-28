import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user already has a vendor application
    const existingVendor = await db.vendor.findUnique({
      where: { userId: session.user.id }
    })

    if (existingVendor) {
      return NextResponse.json(
        { message: "You already have a vendor application" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      businessName,
      businessType,
      description,
      businessPhone,
      businessEmail,
      website,
      churchAffiliation,
      faithStatement,
    } = body

    // Validate required fields
    if (!businessName || !businessType || !description) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create vendor application
    const vendor = await db.vendor.create({
      data: {
        userId: session.user.id,
        businessName,
        businessType,
        description,
        businessPhone: businessPhone || null,
        businessEmail: businessEmail || null,
        website: website || null,
        churchAffiliation: churchAffiliation || null,
        faithStatement: faithStatement || null,
        status: 'PENDING',
        isActive: false, // Will be activated after approval
      },
    })

    return NextResponse.json(
      { message: "Vendor application submitted successfully", vendor },
      { status: 201 }
    )
  } catch (error) {
    console.error("Vendor application error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}