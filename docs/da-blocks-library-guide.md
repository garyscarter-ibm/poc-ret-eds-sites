# DA Blocks Panel — How It Works & How to Add New Blocks

## Background: What Was Broken

When clicking blocks in the DA editor's Blocks panel, every block showed as empty — no content, no variants. There were three root causes.

### 1. Wrong HTML format in block documents

DA stores content as nested `<div>` elements with `<p>` tags. The block documents had been imported in SharePoint/Google Drive `<table>` format, which DA can't parse for the library:

```html
<!-- WRONG (table format) -->
<table>
  <tr><th>Cards About</th></tr>
  <tr><td>Content here</td></tr>
</table>

<!-- CORRECT (DA div/p format) -->
<div class="cards-about">
  <div>
    <div><p>Content here</p></div>
  </div>
</div>
```

### 2. Missing `library-metadata`

Every block variant needs a `library-metadata` div immediately after it. This is what gives the block its name in the panel and makes it appear as an insertable item:

```html
<div class="library-metadata">
  <div>
    <div><p>name</p></div>
    <div><p>Cards About</p></div>
  </div>
</div>
```

Without this, the library sees the block content but has no variant to display.

### 3. Relative paths in `blocks.json`

The `blocks.json` file (which tells the Blocks panel where to find each block's content) had relative paths like `/docs/library/blocks/cards-about`. DA's library fetcher needs **absolute URLs**:

```json
{
  "name": "Cards About",
  "path": "https://content.da.live/garyscarter-ibm/poc-ret-eds-sites/docs/library/blocks/cards-about"
}
```

---

## Steps to Add a New Block to the Library

### Step 1: Create the block document

Create an HTML file at `docs/library/blocks/{block-name}.html` in DA. Use this structure:

```html
<body>
  <header></header>
  <main>
    <!-- Variant 1 -->
    <div>
      <div class="my-block">
        <div>
          <div><p>Cell 1 content</p></div>
          <div><p>Cell 2 content</p></div>
        </div>
        <div>
          <div><p>Row 2, Cell 1</p></div>
          <div><p>Row 2, Cell 2</p></div>
        </div>
      </div>
      <div class="library-metadata">
        <div>
          <div><p>name</p></div>
          <div><p>My Block</p></div>
        </div>
        <div>
          <div><p>description</p></div>
          <div><p>Default variant</p></div>
        </div>
      </div>
    </div>

    <!-- Variant 2 (optional — add more sections for more variants) -->
    <div>
      <div class="my-block special">
        <div>
          <div><p>Special variant content</p></div>
        </div>
      </div>
      <div class="library-metadata">
        <div>
          <div><p>name</p></div>
          <div><p>My Block (Special)</p></div>
        </div>
      </div>
    </div>
  </main>
  <footer></footer>
</body>
```

#### Key rules

- Block class name must match the block folder name in `/blocks/` (e.g. `my-block` → `/blocks/my-block/`)
- Variants go as extra CSS classes: `class="my-block special"`
- Each variant gets its own section (child `<div>` of `<main>`)
- Each variant **must** have `library-metadata` after it with at least a `name`
- Wrap all plain text in `<p>` tags — DA expects it

### Step 2: Upload the document to DA

Either create it in the DA editor at `da.live/edit#/{org}/{site}/docs/library/blocks/{block-name}`, or upload via the Source API:

```bash
curl -X PUT \
  "https://admin.da.live/source/{org}/{site}/docs/library/blocks/{block-name}.html" \
  -H "Authorization: bearer $TOKEN" \
  -H "Content-Type: text/html" \
  --data-binary "@block-file.html"
```

### Step 3: Add the block to `blocks.json`

Add a row to the `blocks.json` file with an **absolute** `content.da.live` URL:

```json
{
  "name": "My Block",
  "path": "https://content.da.live/{org}/{site}/docs/library/blocks/my-block"
}
```

Upload the updated `blocks.json` using multipart form (this prevents DA from stripping absolute URLs):

```bash
curl -X PUT \
  "https://admin.da.live/source/{org}/{site}/docs/library/blocks.json" \
  -H "Authorization: bearer $TOKEN" \
  -F "data=@blocks.json;type=application/json"
```

### Step 4: Verify

Hard-refresh the DA editor (`Cmd+Shift+R`), open the Blocks panel, and confirm your block appears with its variants.
