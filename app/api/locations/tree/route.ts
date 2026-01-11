import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization');

  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const url = 'http://4.213.57.100:3100/api/v1/locations/tree';

    const response = await fetch(url, {
      headers: {
        'Authorization': token,
      },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend Error:', errorText);
        return new NextResponse(errorText, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching location tree:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
