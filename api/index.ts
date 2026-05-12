import type { VercelRequest, VercelResponse } from "@vercel/node";

// Lazy load the server handler to avoid import issues
let cachedHandler: any = null;

async function getHandler() {
  if (!cachedHandler) {
    const serverModule = await import("../dist/server/index.js");
    cachedHandler = serverModule.default;
  }
  return cachedHandler;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const handler = await getHandler();

    // Convert Vercel request to standard Request API
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    // Create request object
    let body: BodyInit | undefined;
    if (["POST", "PUT", "PATCH"].includes(req.method || "")) {
      if (typeof req.body === "string") {
        body = req.body;
      } else if (req.body) {
        body = JSON.stringify(req.body);
      }
    }

    const request = new Request(url, {
      method: req.method || "GET",
      headers: Object.entries(req.headers).reduce(
        (acc, [key, value]) => {
          if (typeof value === "string" || typeof value === "number") {
            acc[key] = String(value);
          } else if (Array.isArray(value)) {
            acc[key] = value.join(", ");
          }
          return acc;
        },
        {} as Record<string, string>
      ),
      body,
    });

    // Get the response from TanStack Start server
    const response = await handler.fetch(request, {}, {});

    // Convert Response to Vercel response
    res.status(response.status);

    // Copy headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Send body
    const responseBody = await response.text();
    res.end(responseBody);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
};
