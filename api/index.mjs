const nodeHandler = async (req, res) => {
  try {
    // Dynamic import to avoid ESM issues
    const mod = await import('../dist/server/index.js');
    const handler = mod.default;

    // Build Request object
    const url = `https://${req.headers.host}${req.url}`;
    const request = new Request(url, {
      method: req.method,
      headers: Object.fromEntries(
        Object.entries(req.headers).map(([k, v]) => [k, String(v)])
      ),
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
    });

    // Call TanStack handler
    const response = await handler.fetch(request, {}, {});

    // Send response
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(await response.text());
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'content-type': 'text/html' });
    res.end('<h1>500 Error</h1>' + (err instanceof Error ? err.message : String(err)));
  }
};

export default nodeHandler;
