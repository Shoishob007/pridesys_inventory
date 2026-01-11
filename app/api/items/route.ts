import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = request.headers.get('Authorization');

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await fetch('http://4.213.57.100:3100/api/v1/items', {
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
    console.error('Failed to create item:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
