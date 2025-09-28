import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    if (session.user.role !== "VENDOR") {
      return NextResponse.json(
        { message: "Vendor access required" },
        { status: 403 }
      )
    }

    // Get vendor
    const vendor = await db.vendor.findUnique({
      where: { userId: session.user.id }
    })

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      )
    }

    // Get vendor's products
    const products = await db.product.findMany({
      where: { vendorId: vendor.id },
      include: {
        category: {
          select: { name: true }
        },
        images: {
          select: { url: true, isPrimary: true }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Vendor products API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      )
    }

    if (session.user.role !== "VENDOR") {
      return NextResponse.json(
        { message: "Vendor access required" },
        { status: 403 }
      )
    }

    // Get vendor
    const vendor = await db.vendor.findUnique({
      where: { userId: session.user.id }
    })

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      )
    }

    if (vendor.status !== "APPROVED" || !vendor.isActive) {
      return NextResponse.json(
        { message: "Vendor account must be approved and active" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      shortDesc,
      price,
      comparePrice,
      categoryId,
      stockQuantity,
      sku,
      tags,
      isDigital,
      weight,
      dimensions,
      status
    } = body

    // Validate required fields
    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingProduct = await db.product.findUnique({
      where: { slug }
    })

    if (existingProduct) {
      return NextResponse.json(
        { message: "A product with this name already exists" },
        { status: 400 }
      )
    }

    // Create product
    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description || null,
        shortDesc: shortDesc || null,
        price,
        comparePrice: comparePrice || null,
        categoryId,
        vendorId: vendor.id,
        stockQuantity: stockQuantity || 0,
        sku: sku || null,
        tags: tags || "",
        isDigital: isDigital || false,
        weight: weight || null,
        dimensions: dimensions || null,
        status,
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create product API error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}