# EditPDF PDF Toolbox Expansion Specification

## Objective

Expand EditPDF from a PDF editor into a complete local first PDF toolbox.

The product promise must remain:

```text
Your PDF stays on your device.

No signup.
No PDF upload.
No document storage.
No server side PDF processing.
```

All PDF processing must happen client side in the browser.

The existing PDF editor must remain functional.

Do not turn the project into a collection of unrelated mini applications.

Build a shared PDF operation layer and reusable UI components so all tools use the same infrastructure.

---

# Current Technology Constraints

The existing project uses:

```text
React
TypeScript
Vite
pdf-lib
pdfjs-dist
Tailwind CSS
Lucide React
Vitest
```

Do not introduce a backend.

Do not introduce a database.

Do not introduce authentication.

Do not introduce remote PDF processing.

Do not send PDF bytes to third party APIs.

---

# Tools To Build

Build all of the following.

## Phase 1: Core PDF page tools

1. Merge PDF
2. Split PDF
3. Extract PDF Pages
4. Delete PDF Pages
5. Reorder PDF Pages
6. Rotate PDF

## Phase 2: Conversion and optimization

7. Compress PDF
8. PDF to JPG
9. PDF to PNG
10. JPG to PDF
11. PNG to PDF

## Phase 3: Document enhancement

12. Watermark PDF
13. PDF Page Numbers
14. Flatten PDF
15. Protect PDF

## Shared infrastructure

16. PDF file loading
17. Multi file drag and drop
18. Page selection
19. Page range parsing
20. Page previews
21. Progress reporting
22. Processing cancellation
23. Output file naming
24. Download handling
25. Error handling
26. Local privacy status
27. Responsive mobile UI
28. Tool navigation
29. SEO landing pages

---

# IMPORTANT: Architecture

Do not implement each tool as an independent PDF processing system.

Create a shared PDF operation layer.

Recommended:

```text
src/
  pdf/
    loadPdf.ts
    mergePdf.ts
    splitPdf.ts
    extractPages.ts
    deletePages.ts
    reorderPages.ts
    rotatePages.ts
    compressPdf.ts
    renderPdf.ts
    imagesToPdf.ts
    watermarkPdf.ts
    pageNumbers.ts
    flattenPdf.ts
    protectPdf.ts
    validation.ts
    errors.ts
    types.ts
```

UI:

```text
src/
  tools/
    MergePdf/
    SplitPdf/
    ExtractPages/
    DeletePages/
    ReorderPages/
    RotatePdf/
    CompressPdf/
    PdfToJpg/
    PdfToPng/
    JpgToPdf/
    PngToPdf/
    WatermarkPdf/
    PageNumbers/
    FlattenPdf/
    ProtectPdf/
```

Shared components:

```text
src/
  components/
    FileDropzone/
    PDFFileList/
    PDFPreview/
    PageSelector/
    PageRangeInput/
    ProcessingProgress/
    DownloadResult/
    ToolHeader/
    PrivacyBadge/
    ErrorMessage/
```

Do not duplicate file validation, PDF loading, progress, download or page selection logic across tools.

---

# Global Privacy Requirements

Every tool must process files locally.

## Forbidden

Do not use:

```text
fetch()
XMLHttpRequest
WebSocket
remote OCR
remote PDF APIs
cloud conversion services
external PDF processing APIs
```

for PDF contents.

Do not upload:

```text
PDF bytes
images
document text
page thumbnails
signatures
watermarks
```

to external services.

Third party resources must not receive document content.

---

# CMaps

Do not use a remote CDN for PDF.js CMaps.

Do not use:

```text
https://cdn.jsdelivr.net/...
```

for PDF processing dependencies.

Bundle the required CMaps locally under:

```text
public/cmaps/
```

and configure PDF.js to use:

```ts
cMapUrl: '/cmaps/'
```

The local worker should also remain local.

---

# Shared File Handling

Create a reusable file validation layer.

Validate:

```text
file exists
file size
file type
PDF signature
image type
image dimensions
```

Recommended PDF maximum:

```text
100 MB
```

Keep this configurable.

Do not assume file size equals memory usage.

Large PDFs can consume significantly more memory after decompression.

---

# File Dropzone

Create one reusable component supporting:

```text
click to browse
drag and drop
multiple files where appropriate
paste where appropriate
```

Show:

```text
filename
file size
file type
remove button
processing state
```

Do not upload anything.

---

# PDF File List

For multi PDF tools:

```text
┌─────────────────────────────────┐
│ file1.pdf                 4.2 MB│
│ file2.pdf                 8.1 MB│
│ file3.pdf                 2.4 MB│
└─────────────────────────────────┘
```

Allow:

```text
reorder
remove
add another PDF
```

Use drag and drop where useful.

On mobile, also provide move up and move down controls.

---

# Page Selection System

Create a shared page selector.

It must support:

```text
individual pages
ranges
multiple ranges
all pages
odd pages
even pages
```

Examples:

```text
1
1,3,5
1-5
1-5,8,10-12
```

Validate:

```text
page >= 1
page <= totalPages
```

Remove duplicates.

Preserve user requested ordering when the tool supports custom ordering.

---

# Page Range Parser

Create:

```ts
parsePageRanges(
  input: string,
  totalPages: number
): number[]
```

Examples:

```text
"1-5"
→ [1,2,3,4,5]

"1,3,7"
→ [1,3,7]

"1-3,8,10-12"
→ [1,2,3,8,10,11,12]
```

Invalid input must produce a useful error.

Examples:

```text
0
-1
1000
abc
1-
-5
```

---

# PAGE TOOL 1: MERGE PDF

## Goal

Combine multiple PDFs into one PDF.

UI:

```text
Merge PDF

[ Drop PDFs here ]

file1.pdf
file2.pdf
file3.pdf

Drag to reorder

[ Merge PDFs ]
```

After processing:

```text
Merged PDF
12 pages
8.4 MB

[ Download ]
```

## Behaviour

Preserve the order selected by the user.

For each input:

```text
load PDF
copy pages
append pages to output
```

Use `pdf-lib`.

Do not rasterize pages.

---

# PAGE TOOL 2: SPLIT PDF

## Goal

Create multiple PDFs from one PDF.

UI:

```text
Split PDF

document.pdf
24 pages

Split mode:

○ Every page
○ Page ranges
○ Every N pages

Ranges:
[ 1-5, 6-10, 11-24 ]

[ Split PDF ]
```

## Modes

### Every page

Create:

```text
document-1.pdf
document-2.pdf
...
```

### Page ranges

Create:

```text
document-part-1.pdf
document-part-2.pdf
...
```

### Every N pages

Example:

```text
Every 5 pages
```

creates:

```text
1-5
6-10
11-15
...
```

If multiple output files are produced, package them into a ZIP.

Do not require a server.

Use a small ZIP library only if necessary.

---

# PAGE TOOL 3: EXTRACT PDF PAGES

This is the focused single-output version of page extraction.

UI:

```text
Extract Pages

document.pdf
24 pages

Pages:
[ 1-3, 7, 12-15 ]

Selected: 8 pages

[ Extract Pages ]
```

Output:

```text
document-extracted.pdf
```

This tool should reuse the same page selection engine as Split PDF.

---

# PAGE TOOL 4: DELETE PDF PAGES

UI:

```text
Delete Pages

24 pages

Pages to delete:
[ 2, 5-7, 20 ]

Remaining:
20 pages

[ Delete Pages ]
```

Never allow the user to delete every page.

Require at least one page to remain.

---

# PAGE TOOL 5: REORDER PDF PAGES

Use thumbnails or compact page cards.

Example:

```text
1    2    3    4    5
↓
Drag page 5 to position 1

5    1    2    3    4
```

For large documents, do not render every page at huge resolution.

Use low resolution thumbnails.

Mobile:

```text
Page 5
[ Move up ]
[ Move down ]
```

Support drag and drop on desktop and touch friendly controls on mobile.

---

# PAGE TOOL 6: ROTATE PDF

UI:

```text
Rotate PDF

All pages
Selected pages

Rotation:
90° clockwise
180°
90° counterclockwise

[ Rotate PDF ]
```

Do not merely rotate the viewer.

Modify the actual PDF page rotation.

Preserve existing page dimensions.

Test:

```text
0°
90°
180°
270°
```

and existing page rotation metadata.

---

# PAGE TOOL 7: COMPRESS PDF

This must perform actual optimization.

Do not create a fake compression tool that simply re-saves the PDF.

UI:

```text
Compress PDF

document.pdf
12.4 MB

Compression:

○ Maximum compression
○ Balanced
○ High quality

Image quality:
[ slider ]

Target DPI:
72
100
150
200
300

[ Compress PDF ]
```

After:

```text
Original:
12.4 MB

Compressed:
4.2 MB

Saved:
66.1%
```

## Important implementation constraint

`pdf-lib` alone does not provide a complete PDF optimizer.

Do not pretend it does.

Implement a realistic browser-side compression strategy.

Possible approach:

```text
Load PDF
↓
Inspect pages
↓
Identify raster image resources where feasible
↓
Downsample/compress raster content
↓
Rebuild PDF
```

If full object-level optimization is not practical, clearly define what compression does.

Do not destroy vector text merely to achieve a smaller file.

Do not rasterize every PDF page unless the user explicitly chooses a rasterized maximum compression mode.

---

# PAGE TOOL 8: PDF TO JPG

Render PDF pages using PDF.js.

UI:

```text
PDF to JPG

document.pdf

Pages:
All pages
Selected pages

Quality:
[ slider ]

DPI:
72
150
300

[ Convert ]
```

Output:

```text
ZIP containing JPG files
```

For a single selected page, direct JPG download is acceptable.

For multiple pages, ZIP them.

---

# PAGE TOOL 9: PDF TO PNG

Same architecture as PDF to JPG.

PNG should be preferred for:

```text
text
line art
screenshots
documents requiring lossless raster output
```

Allow DPI selection.

Do not silently load all pages at maximum resolution.

Use sequential or limited concurrency processing.

---

# PAGE TOOL 10: JPG TO PDF

UI:

```text
JPG to PDF

[ Drop images ]

image1.jpg
image2.jpg
image3.jpg

Drag to reorder

Page size:
A4
Letter
Original
Custom

Fit:
Contain
Cover
Original

[ Create PDF ]
```

Allow:

```text
rotate
remove
reorder
```

where practical.

Create the PDF client side using `pdf-lib`.

Preserve image quality as much as possible.

---

# PAGE TOOL 11: PNG TO PDF

Same architecture as JPG to PDF.

Preserve transparency appropriately.

For transparent PNGs, define a sensible page background.

Default:

```text
white
```

Allow optional background colour later.

---

# PAGE TOOL 12: WATERMARK PDF

Support text watermark first.

UI:

```text
Watermark PDF

Text:
[ CONFIDENTIAL ]

Opacity:
[ 40% ]

Size:
[ 36 ]

Rotation:
[ 45° ]

Position:
Center

Pages:
All pages

[ Add Watermark ]
```

Support:

```text
top left
top center
top right
center
bottom left
bottom center
bottom right
```

Optional later:

```text
image watermark
```

Do not rasterize the entire PDF unnecessarily.

Use PDF vector/text drawing.

---

# PAGE TOOL 13: PDF PAGE NUMBERS

UI:

```text
Page Numbers

Format:
Page {n}
Page {n} of {total}

Position:
Bottom center

Starting number:
1

Pages:
All pages

[ Add Page Numbers ]
```

Support:

```text
top left
top center
top right
bottom left
bottom center
bottom right
```

Allow:

```text
font
size
colour
margin
```

Do not overwrite existing content.

---

# PAGE TOOL 14: FLATTEN PDF

The tool should flatten supported interactive/editable content.

Goal:

```text
editable overlays
annotations
form fields where supported
```

become static PDF content.

Important:

Do not claim to flatten every possible PDF object unless verified.

Support what the implementation can actually flatten.

For the EditPDF editor's own annotations, ensure flattening works reliably.

Test:

```text
text
signature
stamp
redaction
watermark
page numbers
```

---

# PAGE TOOL 15: PROTECT PDF

Use browser-side PDF encryption if the chosen library genuinely supports it.

Do not invent fake password protection.

UI:

```text
Protect PDF

Password:
[ ******** ]

Confirm:
[ ******** ]

Permissions:

☑ Printing
☑ Copying
☑ Editing

[ Protect PDF ]
```

If the current PDF library cannot generate encrypted PDFs correctly in browser:

Do not fake the feature.

Instead either:

1. Implement a proper client-side compatible encryption library.
2. Clearly mark the feature as unavailable until a trustworthy implementation exists.

Never claim a PDF is password protected if it isn't.

---

# UNLOCK PDF

Do not implement password cracking.

A legitimate unlock feature may support:

```text
User provides password
↓
Open protected PDF
↓
Create unlocked copy
```

Only if the browser-side PDF stack supports this correctly.

Do not bypass encryption.

Do not advertise password cracking.

---

# Shared Processing Engine

Create a standard operation interface.

Example:

```ts
interface PDFOperation<TOptions, TResult> {
  execute(
    input: Uint8Array | File | File[],
    options: TOptions,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<TResult>;
}
```

Not every implementation must literally use this exact interface, but the architecture should provide consistent behaviour.

---

# Progress

Every expensive operation should report progress.

Example:

```text
Processing PDF

Page 37 of 120

[██████████░░░░░░░░]

31%
```

For multi-file merge:

```text
Processing file 3 of 8
```

Do not freeze the UI during long operations.

---

# Cancellation

Long operations should support:

```text
[ Cancel ]
```

Use `AbortController` where practical.

Cancellation must clean up:

```text
render tasks
temporary canvases
object URLs
large buffers
```

---

# Memory Management

This is critical because everything is client side.

Do not keep unnecessary copies of:

```text
PDF bytes
rendered canvases
large image blobs
temporary output buffers
```

Release resources after download or cancellation.

For multi-page conversion:

Process pages sequentially or with controlled concurrency.

Do not render 500 pages at 300 DPI simultaneously.

---

# Output Naming

Create a shared naming utility.

Examples:

```text
document.pdf
→ document-merged.pdf

document.pdf
→ document-split-1.pdf

document.pdf
→ document-extracted.pdf

document.pdf
→ document-compressed.pdf

document.pdf
→ document-watermarked.pdf
```

For conversions:

```text
document-page-1.jpg
document-page-2.jpg
```

---

# Download Handling

Create a reusable download function.

Ensure:

```text
Blob
Object URL
download
URL.revokeObjectURL()
```

are handled safely.

Do not retain object URLs after download.

---

# Privacy UI

Every tool should display a small privacy indicator.

Example:

```text
🔒 Processed locally in your browser
Your files are never uploaded.
```

Do not use claims that exceed the actual implementation.

Because this product is intentionally local, this should be a prominent differentiator.

---

# Unified Tool Navigation

Add a PDF Tools navigation area.

Suggested categories:

```text
Edit
Pages
Convert
Optimize
Security
```

Example:

```text
PDF Tools

Edit
  Edit PDF

Pages
  Merge PDF
  Split PDF
  Extract Pages
  Delete Pages
  Reorder Pages
  Rotate PDF

Convert
  PDF to JPG
  PDF to PNG
  JPG to PDF
  PNG to PDF

Optimize
  Compress PDF

Enhance
  Watermark PDF
  Page Numbers
  Flatten PDF

Security
  Protect PDF
  Unlock PDF
```

Do not overwhelm the main editor toolbar with all of these tools.

---

# Mobile Navigation

Mobile should use:

```text
Tools
```

opening a full screen or bottom sheet tool picker.

Do not create a giant horizontal toolbar.

---

# Tool Landing Pages

Each major tool should have a dedicated route.

Recommended:

```text
/pdf-editor
/merge-pdf
/split-pdf
/extract-pdf-pages
/delete-pdf-pages
/reorder-pdf-pages
/rotate-pdf
/compress-pdf
/pdf-to-jpg
/pdf-to-png
/jpg-to-pdf
/png-to-pdf
/watermark-pdf
/pdf-page-numbers
/flatten-pdf
/protect-pdf
```

The exact router implementation should match the current application architecture.

---

# SEO

Each page should have:

```text
unique title
unique description
canonical URL
H1
structured headings
FAQ content where useful
internal links
```

Example:

```text
Title:
Merge PDF Online Free | Private Browser PDF Merger

Description:
Merge PDF files directly in your browser. No signup, no upload and no server processing.
```

Do not keyword stuff.

---

# Internal Linking

Every tool should link to related tools.

Example:

Merge PDF:

```text
Related tools:
Split PDF
Compress PDF
Rotate PDF
Edit PDF
```

Compress PDF:

```text
Related tools:
Merge PDF
Split PDF
PDF to JPG
Edit PDF
```

This creates a coherent PDF utility cluster.

---

# Home Page

Update the home page to communicate the larger product.

Recommended positioning:

```text
Private PDF Tools

Edit, merge, split, compress and convert PDFs
directly in your browser.

No signup.
No upload.
No document storage.
```

Then tool cards:

```text
Edit PDF
Merge PDF
Split PDF
Compress PDF
Convert PDF
More Tools
```

---

# Existing PDF Editor Integration

The existing editor remains the flagship tool.

Add:

```text
More PDF Tools
```

from the editor.

After exporting an edited PDF, offer:

```text
Continue with:

Compress PDF
Merge PDF
Split PDF
Watermark PDF
Add Page Numbers
```

The exported PDF must remain entirely client side.

---

# Shared Preview

Where practical, show page previews before processing.

For example:

Merge:

```text
PDF 1
Pages 1-10

PDF 2
Pages 1-5
```

Split:

```text
Selected pages:
1,2,3,7,8
```

Delete:

```text
Pages to remove:
4,5
```

Do not render high-resolution previews unnecessarily.

Use thumbnails.

---

# Accessibility

All tools must support:

```text
keyboard navigation
focus states
ARIA labels
screen reader labels
Escape to close modals
Enter to submit
```

Drag and drop must have keyboard alternatives.

For page reordering:

```text
Move up
Move down
```

must exist even if drag and drop is available.

---

# Responsive Design

Test:

```text
320px
360px
390px
430px
768px
1024px
1280px
1440px
1920px
```

Mobile must not simply display a compressed desktop interface.

Use deliberate mobile layouts.

---

# Error Handling

Errors must be understandable.

Bad:

```text
Unknown Error
```

Better:

```text
This PDF could not be opened.
It may be corrupted, encrypted, or use an unsupported feature.
```

For password protected PDFs:

```text
This PDF requires a password.
Enter the password to continue.
```

For invalid page range:

```text
Page 27 does not exist. This PDF contains 24 pages.
```

---

# Test Strategy

Every tool must have unit tests.

Create tests for:

```text
page range parsing
page selection
duplicate removal
page ordering
file validation
output naming
```

---

# Integration Tests

Add browser-level tests where practical.

Recommended Playwright.

Test real UI workflows.

## Merge

```text
Upload PDF A
Upload PDF B
Reorder
Merge
Download
Reopen
Verify page count
```

## Split

```text
Upload
Select ranges
Split
Verify output files
```

## Extract

```text
Select pages
Extract
Verify page count and order
```

## Delete

```text
Select pages
Delete
Verify remaining pages
```

## Reorder

```text
Move page
Export
Verify order
```

## Rotate

```text
Rotate
Export
Reopen
Verify page rotation
```

## PDF to image

```text
Upload
Select pages
Convert
Verify image count
```

## Image to PDF

```text
Upload images
Reorder
Create PDF
Verify page count
```

## Watermark

```text
Upload
Enter watermark
Export
Reopen
Verify watermark text exists
```

## Page numbers

```text
Add page numbers
Export
Reopen
Verify added content
```

## Flatten

```text
Edit PDF
Add annotation
Flatten
Reopen
Verify annotation is no longer editable
```

## Protect

Only test if actual encryption is implemented.

---

# Security Tests

Verify that PDF data is never sent externally.

During:

```text
upload
processing
preview
conversion
download
```

inspect network requests.

No PDF payload should leave the browser.

Also search source code for:

```text
fetch
XMLHttpRequest
WebSocket
```

and inspect each occurrence.

Do not assume every `fetch` is a privacy violation. A local static asset request is fine.

---

# Performance Tests

Test:

```text
1 page
10 pages
50 pages
100 pages
250 pages
500 pages
```

For:

```text
merge
split
render
PDF to JPG
PDF to PNG
compression
```

Measure:

```text
processing time
peak memory
UI responsiveness
output size
```

Do not introduce a tool that freezes the browser for minutes without progress feedback.

---

# Large Image Tests

For image to PDF:

```text
small JPG
large JPG
high resolution JPG
transparent PNG
very large PNG
```

Ensure the browser does not crash due to huge decoded images.

Consider resizing images before placing them into PDF if they are absurdly larger than the selected page dimensions.

---

# Compression Tests

Compression must prove it actually changes output characteristics.

Test:

```text
image-heavy PDF
text-heavy PDF
vector PDF
mixed PDF
```

Verify:

```text
output opens
text remains readable
images remain acceptable
output is not accidentally larger
```

If compression produces a larger file:

```text
keep original
or clearly report that no meaningful compression was possible
```

Do not call a larger file “compressed”.

---

# Flatten Tests

Test:

```text
text overlay
signature
stamp
watermark
page number
redaction
```

After flattening:

```text
reopen PDF
copy text
inspect annotations
```

Verify the intended objects are flattened.

---

# Build Quality

Before considering the implementation complete:

```text
npm run lint
npm run test
npm run build
```

All must pass.

---

# CI

Create a GitHub Actions workflow.

On:

```text
push
pull_request
```

run:

```text
npm install
npm run lint
npm run test
npm run build
```

Do not allow broken builds to merge unnoticed.

---

# Definition of Done

The PDF toolbox expansion is complete only when:

1. Merge PDF works.
2. Split PDF works.
3. Extract Pages works.
4. Delete Pages works.
5. Reorder Pages works.
6. Rotate PDF works.
7. Compress PDF performs genuine optimization.
8. PDF to JPG works.
9. PDF to PNG works.
10. JPG to PDF works.
11. PNG to PDF works.
12. Watermark PDF works.
13. Page numbering works.
14. Flatten PDF works for supported objects.
15. Protect PDF genuinely encrypts the PDF if implemented.
16. No fake security features exist.
17. All tools work locally.
18. No PDF contents are uploaded.
19. Large files are handled without obvious memory leaks.
20. Progress is displayed for expensive operations.
21. Cancellation works where practical.
22. Downloads are cleaned up correctly.
23. Mobile layouts work.
24. Desktop layouts work.
25. Tool navigation is coherent.
26. Dedicated SEO pages exist.
27. Internal linking exists.
28. Tests exist for every tool.
29. Integration tests cover critical workflows.
30. Lint passes.
31. Tests pass.
32. Production build passes.
33. GitHub Actions passes.

---

# Implementation Order

Do not implement all 15 tools in one giant change.

Use this order.

## Milestone 1

Build shared infrastructure:

```text
file handling
PDF loading
page range parser
page selector
PDF previews
progress
downloads
errors
```

Then:

```text
Merge
Split
Extract
Delete
Reorder
Rotate
```

## Milestone 2

Build:

```text
PDF to JPG
PDF to PNG
JPG to PDF
PNG to PDF
```

## Milestone 3

Build:

```text
Watermark
Page Numbers
Flatten
```

## Milestone 4

Build:

```text
Compress
Protect
```

Compression and protection require more technical validation and must not be implemented as superficial UI features.

## Milestone 5

Build:

```text
tool navigation
landing pages
SEO
internal linking
mobile polish
```

## Milestone 6

Run:

```text
full regression suite
large PDF tests
privacy/network audit
performance audit
```

---

# Critical Coding Agent Rules

Do not create fake functionality.

If a library cannot perform an operation correctly in the browser:

```text
do not pretend it works
```

Do not upload documents to solve a difficult operation.

Do not add a server just because browser implementation is inconvenient.

Do not rasterize PDFs unnecessarily.

Do not destroy selectable text unless the user explicitly chooses a rasterized output.

Do not sacrifice PDF quality simply to make implementation easier.

Do not duplicate the PDF processing engine across tools.

Do not add 15 independent file upload implementations.

Use shared infrastructure.

Do not hide processing failures.

Do not claim:

```text
100% private
100% secure
100% unrecoverable
```

unless the implementation can actually demonstrate those properties.

The product's core advantage is:

```text
Local
Private
No signup
No upload
Fast
Simple
```

Every new tool must strengthen that promise rather than undermine it.

---

# Final Product Direction

The finished EditPDF ecosystem should feel like:

```text
                    EditPDF
                       |
        ┌──────────────┼──────────────┐
        │              │              │
       Edit           Pages         Convert
        │              │              │
   Edit PDF        Merge PDF       PDF → JPG
   Redact          Split PDF       PDF → PNG
   Sign            Extract         JPG → PDF
   Stamp           Delete          PNG → PDF
                   Reorder
                   Rotate
        │              │              │
        └──────────────┼──────────────┘
                       │
                  Optimize
                       │
                Compress PDF
                       │
                  Enhance
                       │
             Watermark / Numbers
                       │
                    Flatten
                       │
                    Security
                       │
                 Protect PDF
```

Everything runs locally in the browser.

The user should be able to enter through any tool, complete the task, and immediately continue to another PDF operation without leaving the EditPDF ecosystem.

Do not optimize for having the largest number of buttons.

Optimize for having the most useful PDF workflows with the least friction.
