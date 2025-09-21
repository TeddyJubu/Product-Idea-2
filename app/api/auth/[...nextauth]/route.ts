export async function GET() {
  return new Response(JSON.stringify({ error: "Authentication disabled" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ error: "Authentication disabled" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });
}
