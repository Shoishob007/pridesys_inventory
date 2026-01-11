import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = request.headers.get('Authorization');

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = params;

    const response = await fetch(`http://4.213.57.100:3100/api/v1/items/${id}`, {
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
    console.error('Failed to fetch item details:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}