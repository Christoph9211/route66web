# Tools

## Product JSON generator

The `json_gen_v2.html` file was moved from `public/products/` to `tools/` so it isn't served with the public website.

### Run locally

1. Install dependencies: `npm install` (if needed).
2. Start the generator: `npm run manage_products` (uses `npx serve` to host the HTML file).
3. Open the printed URL in your browser (defaults to `http://localhost:3000`).
4. Import an existing `products.json`, make changes, and download the updated JSON or CSV.

You can also open `tools/json_gen_v2.html` directly in your browser without running the script.
