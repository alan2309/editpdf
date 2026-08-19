# EditPDF PDF Engine Rebuild

## Objective

The recently added PDF tools are producing distorted or incorrect PDFs.

The common architectural problem is using `pdf-lib` page copying and document reconstruction as a universal PDF transformation engine.

Rebuild the processing layer around the correct engine for each operation while preserving the core promise:

```text
PDF processing happens locally in the browser.
No PDF upload.
No PDF database.
No third party PDF processing API.
No server side PDF processing.
```

The browser may download application assets such as JavaScript, WASM, PDF.js workers and CMaps. Document bytes must remain in browser memory.

---

# 1. Processing architecture

Use three layers.

```text
PDF operation dispatcher
        |
        +-- QPDF WASM: structure preserving operations
        |
        +-- PDF.js: rendering and raster workflows
        |
        +-- pdf-lib: controlled authoring operations
```

## QPDF WASM

Use for:

```text
Merge
Split
Extract
Delete pages
Reorder pages
Rotate pages
Protect / Encrypt
Structural optimization
```

## PDF.js

Use for:

```text
Rendering
Thumbnails
PDF to JPG
PDF to PNG
Maximum compression rasterization
Visual verification
```

PDF.js is a rendering engine, not the primary PDF rewriting engine.

## pdf-lib

Use for:

```text
Watermark text
Page numbers
Adding text
Adding signatures
Creating PDFs from images
EditPDF overlays
AcroForm operations where supported
```

Do not use `PDFDocument.create()` + `copyPages()` as the universal solution for arbitrary page operations.

---

# 2. Existing local assets

The repository already contains:

```text
public/qpdf.wasm
public/pdf.worker.min.mjs
public/cmaps/
```

Keep QPDF WASM and PDF.js assets local.

Do not load PDF.js workers from a CDN.

Do not load CMaps from jsDelivr.

Do not replace QPDF WASM with a remote PDF API.

---

# 3. Build a QPDF WASM abstraction

Create:

```text
src/pdf/qpdf/
  qpdfEngine.ts
  qpdfLoader.ts
  qpdfTypes.ts
  qpdfErrors.ts
```

The rest of the application must not directly manipulate the raw WASM API.

Expose operations such as:

```ts
mergePdfs(...)
splitPdf(...)
extractPages(...)
deletePages(...)
reorderPages(...)
rotatePages(...)
protectPdf(...)
optimizePdf(...)
```

First inspect the actual installed QPDF WASM/PDFStudio integration and use its real API. Do not invent a wrapper API without verifying how the package initializes WASM, manages its virtual filesystem, executes commands and returns output.

Use a singleton engine loader so QPDF is not initialized repeatedly.

All temporary WASM files must be deleted after each operation.

Use unique temporary filenames.

---

# 4. Merge PDF

## Replace

Do not use:

```ts
PDFDocument.create()
PDFDocument.copyPages()
PDFDocument.save()
```

as the production merge implementation.

## Use

QPDF WASM page/document merging.

The exact command/API must match the installed QPDF WASM wrapper.

Conceptually it should perform the equivalent of a QPDF page merge.

## Preserve

```text
page content
fonts
images
vectors
page boxes
rotation
annotations where supported
links
forms where supported
transparency
```

Do not rasterize.

Do not scale pages to a common size.

Each source page retains its own dimensions.

## Test

Use PDFs with:

```text
A4 + Letter
portrait + landscape
0° + 90°
text + images
embedded fonts
Unicode
annotations
```

Verify page count, page dimensions, rotation and visual rendering.

---

# 5. Split PDF

Replace `pdf-lib.copyPages()` with QPDF page selection.

Support:

```text
Every page
Every N pages
Custom ranges
```

Convert user selections into validated ordered page lists.

Do not render pages.

For multiple outputs, create the ZIP locally in the browser.

Verify every generated PDF with PDF.js.

---

# 6. Extract PDF Pages

Use the same QPDF page selection engine as Split.

Extract must produce one output PDF.

Example:

```text
Input: 20 pages
Selection: 1-3,8,12-15
Output: 8 pages
```

Do not duplicate page selection logic.

---

# 7. Delete PDF Pages

Calculate pages to retain and pass them to QPDF.

Example:

```text
Original: 1 2 3 4 5 6
Delete: 2 5
Keep: 1 3 4 6
```

Never allow deleting every page.

---

# 8. Reorder PDF Pages

Replace `pdf-lib.copyPages()` with QPDF page selection.

Example:

```ts
[5, 1, 3, 2, 4]
```

must produce exactly:

```text
5
1
3
2
4
```

For a reorder tool, validate that every original page appears exactly once unless the UI explicitly supports extraction.

Preserve content, dimensions and rotation.

---

# 9. Rotate PDF

Use a PDF level rotation operation through QPDF.

For each page:

```ts
newRotation =
  normalize(existingRotation + requestedRotation)
```

where supported rotations are:

```text
0
90
180
270
```

Preserve:

```text
MediaBox
CropBox
TrimBox
BleedBox
ArtBox
```

Do not render or rebuild pages.

Test mixed rotations:

```text
0°
90°
180°
270°
```

Rotate all by 90° and verify the expected result.

---

# 10. Protect PDF

Remove the hand written PDF encryption implementation.

Do not maintain custom:

```text
MD5
RC4
owner key
user key
encryption key derivation
permission bit calculations
```

Use QPDF's mature encryption implementation through WASM.

Support:

```text
password
printing permission
copying permission
editing permission
```

Requirements:

```text
wrong password → fails
correct password → content visible
```

Preserve:

```text
text
images
fonts
vectors
page dimensions
rotation
links
```

Do not rasterize.

During development, independently verify generated files with native qpdf where available:

```bash
qpdf --show-encryption protected.pdf
```

Then test in Chrome and Acrobat.

---

# 11. Compression

Implement three explicit modes.

## Safe

Use QPDF structural optimization.

Do not rasterize.

Preserve document semantics.

If no meaningful reduction is possible, retain the original and do not report fake savings.

## Balanced

Use QPDF capabilities for genuine structural/image optimization if supported by the installed WASM build.

Do not silently rasterize text.

If safe image recompression cannot be implemented with the available engine, use structural optimization rather than pretending image compression exists.

## Maximum

Maximum may rasterize.

UI must state:

```text
Maximum compression may convert pages into images.
Text may no longer be selectable.
```

Use PDF.js only for this raster workflow.

---

# 12. Fix Maximum compression rotation

Do not combine a rotated PDF.js viewport with another blind page rotation.

The viewport can already account for page rotation.

Correct workflow:

```text
Read original PDF page dimensions and rotation
↓
Render page with PDF.js
↓
Create output page using original logical dimensions
↓
Place raster image correctly
↓
Apply rotation exactly once
```

Test:

```text
0°
90°
180°
270°
```

and mixed rotation documents.

No stretching, clipping or sideways output.

---

# 13. PDF to JPG

Use PDF.js.

For each selected page:

```text
PDF.js page
↓
viewport
↓
canvas
↓
canvas.toBlob('image/jpeg', quality)
```

Use `toBlob()` rather than `toDataURL()` for large images.

Process sequentially or with controlled concurrency.

For multiple pages create a ZIP entirely in the browser.

---

# 14. PDF to PNG

Same as JPG conversion but use:

```ts
canvas.toBlob(callback, 'image/png')
```

Test 72, 150 and 300 DPI.

Do not render hundreds of pages simultaneously.

---

# 15. JPG to PDF

`pdf-lib` is appropriate.

Support:

```text
reorder
remove
rotate
A4
Letter
Original
Custom
Contain
Cover
```

Preserve image aspect ratio.

Do not stretch images.

---

# 16. PNG to PDF

Same architecture as JPG to PDF.

Handle transparency with a sensible background.

Default background:

```text
white
```

Do not create unexpected black backgrounds.

---

# 17. Watermark PDF

Use `pdf-lib`.

Load the original PDF and draw watermark text onto existing pages.

Do not rasterize.

Preserve:

```text
page dimensions
rotation
existing content
fonts
vectors
images
```

Do not assume every page is A4 portrait.

---

# 18. Page Numbers

Use `pdf-lib`.

Draw page numbers onto existing pages.

Support:

```text
Page {n}
Page {n} of {total}
```

and:

```text
top left
top center
top right
bottom left
bottom center
bottom right
```

Preserve page size and rotation.

---

# 19. Flatten PDF

Do not rasterize every page.

Use:

```ts
const form = pdfDoc.getForm();
form.flatten();
```

for supported AcroForms.

For EditPDF overlays, draw them directly onto the original pages.

Supported examples:

```text
text
signature
stamp
watermark
page number
redaction
```

Do not claim all PDF annotation types are flattened unless verified.

If an annotation cannot be structurally flattened, fail honestly or provide a clearly labelled rasterize option.

---

# 20. Local CMaps

Ensure:

```text
public/cmaps/
```

contains the actual CMap assets corresponding to the installed `pdfjs-dist` version.

An empty directory is not sufficient.

Create:

```text
src/pdf/pdfjsConfig.ts
```

with:

```ts
export const PDFJS_CMAP_URL = '/cmaps/';
export const PDFJS_CMAP_PACKED = true;
export const PDFJS_WORKER_URL = '/pdf.worker.min.mjs';
```

Every PDF.js consumer must use the centralized configuration.

Search the repository for:

```text
cdn.jsdelivr.net
cMapUrl
GlobalWorkerOptions
getDocument(
```

Remove hardcoded remote CMap URLs.

---

# 21. PDF integrity verification

Create:

```text
src/pdf/verifyPdf.ts
```

Suggested API:

```ts
export interface PdfVerificationResult {
  valid: boolean;
  pageCount: number;
  errors: string[];
}

export async function verifyPdf(
  bytes: Uint8Array,
  expectedPageCount?: number
): Promise<PdfVerificationResult>
```

Minimum checks:

```text
PDF loads successfully
page count exists
expected page count matches
page dimensions are valid
rotation is valid
```

For high risk operations, render every output page with PDF.js.

If verification fails:

```text
Do not offer the broken output for download.
```

Show:

```text
The PDF could not be safely processed.
Your original file has not been changed.
```

---

# 22. Operation lifecycle

Every operation should follow:

```text
Validate input
↓
Load
↓
Process
↓
Verify output
↓
Create Blob
↓
Download
```

Never report success before verification.

---

# 23. Cancellation and memory

Use `AbortController` for expensive operations where practical.

On cancellation:

```text
cancel QPDF operation if supported
cancel PDF.js render task
release canvases
release object URLs
delete WASM temporary files
```

Do not keep unnecessary copies of:

```text
original bytes
processed bytes
canvas
image Blob
base64 strings
```

Avoid base64 for large documents.

---

# 24. File size handling

Default maximum:

```text
100 MB
```

Make the limit configurable.

For large files show a useful warning instead of freezing the browser.

---

# 25. Page range parser

Use strict validation.

Valid:

```text
1
1,3,5
1-5
1-5,8,10-12
```

Invalid:

```text
12abc
abc12
1.5
1foo-5
0
-1
5-
-5
```

Do not rely on loose `parseInt()` parsing.

Validate numeric bounds against total page count.

---

# 26. Split group syntax

Use one group per line.

Example:

```text
1-5,8
9-12
15-20
```

Meaning:

```text
Group 1 = 1-5 + 8
Group 2 = 9-12
Group 3 = 15-20
```

Comma is a page separator.

Newline is a group separator.

---

# 27. Output verification and UX

Do not display:

```text
Successfully compressed!
```

until verification passes.

For compression show:

```text
Original: 12.4 MB
Result: 5.8 MB
Saved: 53.2%
```

If output is larger:

```text
No smaller PDF was produced.
The original file was retained.
```

For any failed operation:

```text
The PDF could not be safely processed.
Your original file has not been changed.
```

---

# 28. Offline/local architecture

Normal processing must remain:

```text
File
↓
Browser
↓
WASM / PDF.js / pdf-lib
↓
Blob
↓
Download
```

No backend.

No database.

No external PDF processing API.

Application assets may be downloaded from the website. PDF contents must not be transmitted.

---

# 29. Optional PWA

Only after PDF processing is stable, consider a service worker that caches:

```text
application JS
CSS
qpdf.wasm
pdf.worker.min.mjs
CMaps
```

Then test:

```text
First visit
↓
cache assets
↓
disable network
↓
reload
↓
open PDF
↓
process PDF
↓
download
```

Do not claim fully offline operation until this test passes.

---

# 30. Test fixtures

Create:

```text
tests/fixtures/
```

with:

```text
simple-text.pdf
image-heavy.pdf
mixed-content.pdf
unicode.pdf
forms.pdf
annotations.pdf
rotated-0.pdf
rotated-90.pdf
rotated-180.pdf
rotated-270.pdf
mixed-rotation.pdf
different-page-sizes.pdf
transparency.pdf
large-multipage.pdf
```

Use real PDFs, not only PDFs generated by pdf-lib.

---

# 31. Required tests

## Merge

Verify:

```text
page count
page order
page size
rotation
visual output
text
images
```

## Split

Verify:

```text
every page
every N pages
custom ranges
multiple output ZIP
```

## Extract

Verify exact selected pages and order.

## Delete

Verify selected pages removed and at least one page remains.

## Reorder

Verify every page appears exactly once in the requested order.

## Rotate

Verify existing rotation plus requested rotation.

## Compress

Test:

```text
text-heavy
image-heavy
mixed
unicode
rotated
different page sizes
transparent
large multipage
```

Verify:

```text
opens
renders
page count
dimensions
rotation
file size
text preservation
```

Maximum may rasterize. Safe and Balanced must not silently rasterize text.

## Protect

Verify:

```text
password prompt
wrong password fails
correct password works
content visible
fonts visible
images visible
vectors visible
permissions
```

## Conversions

Verify:

```text
PDF to JPG
PDF to PNG
JPG to PDF
PNG to PDF
```

including dimensions, orientation and quality.

---

# 32. Repository audit

Before completion search for:

```text
PDFDocument.create
copyPages
cdn.jsdelivr.net
cMapUrl
GlobalWorkerOptions
parseInt
toDataURL
qpdf
qpdf.wasm
password
encrypt
```

Review every occurrence.

Do not blindly remove valid uses. Make sure each occurrence belongs to the correct processing layer.

---

# 33. Migration order

Do the work in this exact order.

### Step 1

Build and verify QPDF WASM abstraction.

### Step 2

Move:

```text
Merge
Split
Extract
Delete
Reorder
Rotate
```

to QPDF.

### Step 3

Move Protect to QPDF encryption.

Independently verify encrypted PDFs.

### Step 4

Fix and verify local CMaps.

### Step 5

Fix Maximum compression rotation and raster pipeline.

### Step 6

Implement Safe compression using QPDF.

### Step 7

Implement Balanced only if genuine non-destructive optimization is available.

### Step 8

Fix Flatten structurally.

### Step 9

Verify Watermark, Page Numbers and image conversion tools.

### Step 10

Add output verification to every operation.

### Step 11

Add real PDF fixtures and browser tests.

### Step 12

Run full regression testing.

### Step 13

Only then polish UI and SEO.

---

# 34. Do not do these things

Do not:

```text
patch individual visual symptoms
rasterize everything
use copyPages() for every PDF operation
write custom PDF encryption
upload PDFs to fix processing
use CDN CMaps
claim success before output validation
claim compression when output is larger
assume A4
assume one page rotation
double-apply PDF.js rotation
keep hundreds of canvases in memory
```

---

# 35. Definition of done

## Merge

[ ] No distortion
[ ] No stretching
[ ] No clipping
[ ] Correct page order
[ ] Correct dimensions
[ ] Correct rotation
[ ] Fonts preserved
[ ] Images preserved

## Split

[ ] Correct pages
[ ] Correct dimensions
[ ] Correct rotation
[ ] Output opens
[ ] ZIP works

## Extract

[ ] Correct pages
[ ] Correct order
[ ] Output opens

## Delete

[ ] Correct pages removed
[ ] At least one page remains

## Reorder

[ ] Every page exactly once
[ ] Correct order
[ ] No distortion

## Rotate

[ ] Existing rotation preserved correctly
[ ] Requested rotation applied exactly once
[ ] Dimensions preserved

## Protect

[ ] Genuine encryption
[ ] Correct password works
[ ] Wrong password fails
[ ] Content visible after correct password
[ ] Permissions work

## Compression

[ ] Safe produces valid output
[ ] Balanced does not silently rasterize
[ ] Maximum warns about rasterization
[ ] No distortion
[ ] No unexpected rotation
[ ] No stretching
[ ] No blank pages
[ ] Claimed compression actually reduces size

## Flatten

[ ] Form fields flatten correctly
[ ] Text remains selectable where expected
[ ] Vectors remain intact
[ ] No unnecessary rasterization

## Conversion

[ ] PDF to JPG works
[ ] PDF to PNG works
[ ] JPG to PDF works
[ ] PNG to PDF works

## Reliability

[ ] Real PDF fixtures pass
[ ] Unicode PDFs pass
[ ] Large PDFs pass
[ ] Mixed rotation PDFs pass
[ ] Different page sizes pass
[ ] Output is verified
[ ] No PDF content leaves browser
[ ] Lint passes
[ ] Tests pass
[ ] Build passes

---

# 36. Final engineering principle

The downloaded PDF is the product.

A feature is not working because:

```text
button clicked
progress reached 100%
download happened
```

It is working only when:

```text
original PDF
↓
operation
↓
valid output PDF
↓
opens correctly
↓
content intact
↓
dimensions correct
↓
rotation correct
↓
expected semantics preserved
```

Prioritize PDF fidelity over adding more features.

Final architecture:

```text
QPDF WASM
    ↓
structure preserving PDF operations

PDF.js
    ↓
rendering and raster workflows

pdf-lib
    ↓
controlled authoring and overlays

Browser
    ↓
all document processing local

No backend
No upload
No document storage
```
