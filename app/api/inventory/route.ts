import { NextResponse } from "next/server";

const fetchAllPages = async (url: string, token: string) => {
  let allItems: any[] = [];
  let page = 1;
  const pageSize = 50;

  while (true) {
    const response = await fetch(`${url}&page=${page}&pageSize=${pageSize}`, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch page ${page}: ${errorText}`);
    }

    const data = await response.json();

    if (data && data.items && data.items.length > 0) {
      allItems = allItems.concat(data.items);
      if (data.items.length < pageSize) {
        break;
      }
      page++;
    } else {
      break;
    }
  }

  return allItems;
};

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
    const baseUrl = `http://4.213.57.100:3100/api/v1/items?${queryString}`;

    const allItems = await fetchAllPages(baseUrl, token);

    return NextResponse.json({ items: allItems });
  } catch (error) {
    console.error("Failed to fetch inventory items:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
