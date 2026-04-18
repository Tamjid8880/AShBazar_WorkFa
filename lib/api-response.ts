export function apiSuccess<T>(message: string, data: T) {
  return Response.json({ success: true, message, data });
}

export function apiError(message: string, status = 500) {
  return Response.json({ success: false, message, data: null }, { status });
}
