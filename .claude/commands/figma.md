Fetch and summarize design specs from a Figma URL.

**Usage:** `/figma <figma-url>`

**Example:** `/figma https://www.figma.com/design/Mwpl0ZrMdAts95EaHmzrjh/Med-Tech-Care?node-id=3045-11426`

---

The user has passed this Figma URL: $ARGUMENTS

Follow these steps:

1. Extract the **file key** from the URL — it is the segment after `/file/` or `/design/` and before the next `/` or `?`.
   Example: `https://www.figma.com/design/Mwpl0ZrMdAts95EaHmzrjh/...` → file key = `Mwpl0ZrMdAts95EaHmzrjh`

2. Extract the **node ID** from the `node-id` query param if present (e.g. `node-id=3045-11426`). Replace `-` with `:` for the API call.

3. Read the Figma token from the project `.mcp.json`:
   ```bash
   python3 -c "import json; d=json.load(open('.mcp.json')); print(d['mcpServers']['figma']['headers']['X-Figma-Token'])"
   ```

4. If a node ID is present, fetch that node with depth 5:
   ```bash
   curl -s "https://api.figma.com/v1/files/<FILE_KEY>/nodes?ids=<NODE_ID>&depth=5" \
     -H "X-Figma-Token: <TOKEN>"
   ```
   Otherwise fetch the full file with depth 2:
   ```bash
   curl -s "https://api.figma.com/v1/files/<FILE_KEY>?depth=2" \
     -H "X-Figma-Token: <TOKEN>"
   ```

5. Parse and summarize the response. For each node/frame report:
   - **Screen name** and dimensions
   - **Typography**: every text node → text content, fontSize, fontWeight, color (as hex)
   - **Components/frames**: name, width, height, background fill color
   - **Neumorphic knob-elevation** elements: width, height, fill
   - Any spacing or layout gaps visible (itemSpacing, padding)

6. Format the summary as a clean reference table the developer can use to match the design. Highlight any values that differ from what is currently in the codebase if context is available.

The Figma token is already configured in `.mcp.json` — no authentication needed.
