import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { upazila_id: string } }
) {
  const upazila = params.upazila_id.toLowerCase();
  
  // Mock data for any upazila
  const unions = [
    { id: `${upazila}-union-1`, name: `Union 1 of ${params.upazila_id}` },
    { id: `${upazila}-union-2`, name: `Union 2 of ${params.upazila_id}` },
    { id: `${upazila}-union-3`, name: `Union 3 of ${params.upazila_id}` }
  ];

  return NextResponse.json({ success: true, data: unions });
}
