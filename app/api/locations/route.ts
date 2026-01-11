import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization');

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filterChildren = searchParams.get("filterChildren");

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations`);
    if (filterChildren) {
        url.searchParams.append("filterChildren", filterChildren);
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': token,
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
    console.error('Failed to fetch locations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  const token = request.headers.get('Authorization');

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/locations`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
    } else {
        const errorText = await response.text();
        return new NextResponse(errorText, { status: response.status });
    }
  } catch (error) {
    console.error('Failed to create location:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
