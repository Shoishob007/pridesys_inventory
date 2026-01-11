import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization");

  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const backendParams = new URLSearchParams();

    const q = searchParams.get("q");
    if (q) {
      backendParams.append("q", q);
    }

    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    if (page) backendParams.append("page", page);
    if (pageSize) backendParams.append("pageSize", pageSize);

    const labels = searchParams.getAll("labels");
    labels.forEach((label) => {
      backendParams.append("labels", label);
    });

    const locations = searchParams.getAll("locations");
    locations.forEach((location) => {
      backendParams.append("locations", location);
    });

    const parentIds = searchParams.getAll("parentIds");
    parentIds.forEach((parentId) => {
      backendParams.append("parentIds", parentId);
    });

    const queryString = backendParams.toString();

    const response = await fetch(`http://4.213.57.100:3100/api/v1/items${
      queryString ? `?${queryString}` : ""
    }`, {
      headers: {
        Authorization: token,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const errorText = await response.text();
      return new NextResponse(errorText, { status: response.status });
    }
  } catch (error) {
    console.error("Failed to fetch inventory items:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
