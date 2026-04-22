import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { district_id: string } }
) {
  const district = params.district_id.toLowerCase();
  
  // Mock data for any district
  const upazilas = [
    { id: `${district}-upazila-1`, name: `${params.district_id} Sadar` },
    { id: `${district}-upazila-2`, name: `North ${params.district_id}` },
    { id: `${district}-upazila-3`, name: `South ${params.district_id}` }
  ];

  return NextResponse.json({ success: true, data: upazilas });
}
