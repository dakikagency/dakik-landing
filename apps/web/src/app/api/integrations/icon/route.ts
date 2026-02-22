import prisma from "@collab/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-auth";

// Schema for creating a single icon
const createIconSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  svgContent: z.string().min(1, "SVG content is required"),
  keywords: z.array(z.string()).default([]),
  isCustom: z.boolean().default(true),
});

// Schema that accepts either a single icon object or an array of icon objects
const createIconsInputSchema = z.union([
  createIconSchema,
  z.array(createIconSchema),
]);

/**
 * POST /api/integrations/icon
 * Create one or more icons
 */
export async function POST(request: Request) {
  const authResult = validateApiKey(request);
  if (!authResult.valid) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const validationResult = createIconsInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const inputData = validationResult.data;

    // Handle array input (bulk creation)
    if (Array.isArray(inputData)) {
      const results = {
        total: inputData.length,
        created: 0,
        failed: 0,
        errors: [] as { slug: string; error: string }[],
        createdSlugs: [] as string[],
      };

      for (const iconData of inputData) {
        try {
          // Check if slug already exists
          const existingIcon = await prisma.icon.findUnique({
            where: { slug: iconData.slug },
          });

          if (existingIcon) {
            results.failed++;
            results.errors.push({
              slug: iconData.slug,
              error: "Icon with this slug already exists",
            });
            continue;
          }

          await prisma.icon.create({
            data: {
              ...iconData,
              keywords: iconData.keywords || [],
              isCustom: iconData.isCustom ?? true,
            },
          });

          results.created++;
          results.createdSlugs.push(iconData.slug);
        } catch (err: any) {
          results.failed++;
          results.errors.push({
            slug: iconData.slug,
            error: err.message || "Unknown error",
          });
        }
      }

      return NextResponse.json({ data: results }, { status: 201 });
    }

    // Handle single object input
    const iconData = inputData;

    // Check if slug already exists
    const existingIcon = await prisma.icon.findUnique({
      where: { slug: iconData.slug },
    });

    if (existingIcon) {
      return NextResponse.json(
        { error: "An icon with this slug already exists" },
        { status: 409 }
      );
    }

    const icon = await prisma.icon.create({
      data: {
        ...iconData,
        keywords: iconData.keywords || [],
        isCustom: iconData.isCustom ?? true,
      },
    });

    return NextResponse.json({ data: icon }, { status: 201 });
  } catch (error) {
    console.error("Error creating icon(s):", error);
    return NextResponse.json(
      { error: "Failed to create icon(s)" },
      { status: 500 }
    );
  }
}
