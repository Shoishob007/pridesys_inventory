import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get("Authorization");

  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items/${id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const errorText = await response.text();
      return new NextResponse(errorText, { status: response.status });
    }
  } catch (error) {
    console.error("Failed to fetch item details:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get("Authorization");

  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const errorText = await response.text();
      return new NextResponse(errorText, { status: response.status });
    }
  } catch (error) {
    console.error("Failed to update item:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get("Authorization");

  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = params;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/items/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      }
    );

    if (response.ok) {
      return new NextResponse(null, { status: 204 });
    } else {
      const errorText = await response.text();
      return new NextResponse(errorText, { status: response.status });
    }
  } catch (error) {
    console.error("Failed to delete item:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
