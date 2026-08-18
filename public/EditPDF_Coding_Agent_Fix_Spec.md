# EditPDF Bug Fix and Improvement Specification

## Purpose

This document is a coding agent implementation plan for the EditPDF repository.

Repository:

`https://github.com/alan2309/editpdf`

The objective is to fix confirmed functional issues, strengthen PDF correctness and privacy, and improve the architecture without changing the core product principles.

## Non Negotiable Product Constraints

Do not:

1. Move PDF processing to a server.
2. Upload PDF contents to external services.
3. Introduce mandatory user accounts.
4. Introduce document storage.
5. Remove existing editor functionality.
6. Make absolute security claims that cannot be demonstrated.
7. Replace working features with mock implementations.

Preserve the local only processing architecture.

---

# Phase 1: Critical Functional Bugs

## 1. Fix Replace Current

### Current problem

Search results do not reliably identify the exact substring that matched.

A PDF text item may contain:

`Customer Name: John Smith`

The query may be:

`John`

Replace Current must produce:

`Customer Name: David Smith`

It must never replace the complete text item merely because the item contains the query.

### Required implementation

Extend the search match model.

Recommended structure:

```ts
interface SearchMatch {
  itemId: string;
  pageNumber: number;
  originalText: string;
  matchedText: string;
  matchStart: number;
  matchEnd: number;
  query: string;
  matchCase: boolean;
  wholeWord: boolean;
}
```

The search algorithm must calculate the exact character offsets.

For example:

```text
Customer Name: John Smith
               ^^^^
```

The match should contain:

```text
matchedText = "John"
matchStart = 15
matchEnd = 19
```

Do not derive the match by assuming the complete PDF text item is the match.

### Replacement algorithm

Use the original string:

```ts
const before = text.slice(0, matchStart);
const after = text.slice(matchEnd);

const result = before + replacement + after;
```

If the replacement is performed after the document has changed, revalidate the match against the current text before applying it.

If the text has changed since search, either recompute the match or show a stale match state.

### Acceptance criteria

Search:

`John`

Text:

`Customer Name: John Smith`

Replace:

`David`

Result:

`Customer Name: David Smith`

Search:

`john`

with Match Case enabled must not match `John`.

Search:

`John`

with Whole Word enabled must not match:

`Johnson`

---

# 2. Preserve Match Case and Whole Word

### Current problem

Replace Current currently passes hardcoded search options rather than the active Find and Replace settings.

### Required implementation

The Find and Replace component must expose the active search settings.

Use:

```ts
replaceSingleMatch(
  match.itemId,
  match.pageNumber,
  replacement,
  match.query,
  match.matchCase,
  match.wholeWord
);
```

Do not use:

```ts
false,
false
```

as hardcoded values.

### Acceptance criteria

Every Replace Current operation must use exactly the same search semantics that produced the displayed match.

---

# 3. Make Vector Redaction Unsafe by Design

### Current problem

Vector export draws a visual black rectangle over the original PDF content.

The original PDF content can remain underneath.

Therefore vector export is not suitable for confidential redaction.

### Required implementation

When at least one blackout redaction exists:

```ts
const hasBlackoutRedaction = Object.values(redactions)
  .some(list => list.some(box => box.type === "blackout"));
```

If true:

1. Automatically select sanitized export.
2. Disable or strongly gate vector export.
3. Display a clear warning.

Recommended behaviour:

```text
Redaction detected.

For privacy, this document must be exported using Permanent Sanitization.
```

Do not silently allow a user to create an apparently redacted but recoverable PDF.

### Acceptance criteria

A PDF containing a blackout redaction cannot accidentally be exported as a normal vector overlay.

---

# Phase 2: Redaction

## 4. Improve Redact All Matches Precision

### Current problem

Redact All Matches currently identifies text items containing the query and can redact the entire text item.

Example:

`Name: Alankrit Arya`

Search:

`Alankrit`

Current behaviour may cover the entire line.

Expected behaviour is to cover only:

`Alankrit`

### Required implementation

For each text item:

1. Find exact match offsets.
2. Calculate the width of text preceding the match.
3. Calculate the width of the matched substring.
4. Convert those widths into PDF or viewport coordinates.
5. Create a redaction rectangle covering the matched substring.

Conceptually:

```text
item.x
+
width(text before match)
=
redaction.x
```

and:

```text
width(matched substring)
=
redaction.width
```

### Important edge cases

Test:

1. Multiple matches inside one text item.
2. Multiple matches across different text items.
3. Case insensitive matching.
4. Whole word matching.
5. Unicode.
6. Rotated pages.
7. Text with unusual transforms.

If exact substring geometry is not reliable for a particular PDF structure, fall back safely to the containing text item and document that behaviour rather than producing an inaccurate redaction.

---

# 5. Strengthen Redaction Verification

### Current problem

Verification checks whether sensitive terms are extractable from the exported PDF.

That is useful but should not be described as proof against every possible forensic recovery technique.

### Required implementation

Use accurate wording:

`The exported PDF was scanned and the redacted terms were not found in extractable PDF text.`

For sanitized export verify:

1. Original text is not extractable.
2. Original sensitive terms are not found.
3. Original PDF objects are not reused as the output document.
4. Metadata stripping behaves according to the selected setting.

Do not claim:

`100% unrecoverable by any PDF inspector`

unless the implementation can actually demonstrate that property.

---

# Phase 3: Undo and History

## 6. Fix Per Character Undo

### Current problem

Text input calls updateText on every keystroke.

If the user types:

`Hello World`

the history can contain many intermediate states.

### Required implementation

Implement edit transactions.

When text editing begins:

```ts
beginTextEdit(id);
```

During typing:

```ts
updateTextWithoutHistory(id, value);
```

When the user commits the edit:

```ts
commitTextEdit(id);
```

Only the committed edit should become one undo operation.

Commit on:

1. Blur.
2. Enter.
3. Explicit completion.

Escape may restore the pre edit value if that behaviour is chosen.

### Acceptance criteria

Typing a 100 character sentence must produce one logical undo operation, not 100 undo operations.

---

# 7. Improve History Memory Usage

### Current problem

History clones complete editor state.

For large PDFs and many edits this can become expensive.

### Short term solution

Keep the existing snapshot model but make text editing transactional.

Also avoid history entries when an operation produces no actual state change.

### Long term solution

Consider operation based history:

```ts
type EditOperation =
  | AddText
  | UpdateText
  | MoveText
  | FormatText
  | AddRedaction
  | UpdateRedaction
  | DeleteRedaction
  | AddSignature
  | UpdateSignature
  | DeleteSignature
  | AddStamp
  | UpdateStamp
  | DeleteStamp;
```

This should only be implemented after correctness is established.

---

# Phase 4: Coordinate Architecture

## 8. Separate PDF Coordinates From Screen Coordinates

### Current problem

Editor geometry is tightly coupled to rendering scale.

Zoom should not change the document's actual coordinates.

### Required architecture

Store document objects in PDF coordinates.

For example:

```ts
interface PDFObject {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

These values must not change when zoom changes.

Rendering:

```ts
screenX = pdfX * scale;
screenY = pdfY * scale;
screenWidth = pdfWidth * scale;
screenHeight = pdfHeight * scale;
```

Dragging:

```ts
pdfDeltaX = mouseDeltaX / scale;
pdfDeltaY = mouseDeltaY / scale;
```

Export uses the original PDF coordinate values.

### Acceptance criteria

An object placed at a given PDF position must remain at that same PDF position regardless of whether the user edited it at 50%, 100%, 200%, or 300% zoom.

---

# 9. Test Zoom, Move, Resize, Export

Create an automated or manual regression matrix.

For every zoom level:

```text
50%
75%
100%
125%
150%
200%
300%
```

Test:

1. Add text.
2. Move text.
3. Add signature.
4. Resize signature.
5. Add stamp.
6. Resize stamp.
7. Add redaction.
8. Resize redaction.
9. Export.
10. Reopen exported PDF.

Compare object positions against the expected PDF coordinate values.

---

# Phase 5: Sanitized Export

## 10. Fix the DPI Claim

### Current problem

The UI claims 300 DPI but the export scale does not correspond to 300 DPI.

PDF points use 72 points per inch.

300 DPI requires approximately:

```ts
const exportScale = 300 / 72;
```

which is approximately:

```text
4.1667
```

### Required implementation

Either:

1. Render at actual 300 DPI.

Or:

2. Change the UI wording to accurately describe the actual export resolution.

Prefer actual 300 DPI if memory and performance remain acceptable.

### Important

Benchmark:

1. 1 page.
2. 10 pages.
3. 50 pages.
4. Large page dimensions.

Do not introduce a 300 DPI setting that crashes browsers on large documents.

---

# 11. Improve Raster Export Format

### Current problem

Sanitized pages are converted to JPEG.

JPEG compression can degrade:

1. Small text.
2. Tables.
3. Thin lines.
4. Barcodes.
5. QR codes.
6. Signatures.
7. Technical diagrams.

### Recommended implementation

Use PNG for text and line art.

JPEG can remain an optional optimization for image heavy pages.

At minimum provide a high quality export path.

Do not silently introduce visible degradation in a PDF editor whose primary purpose is document fidelity.

---

# Phase 6: Signatures

## 12. Signature Resize Validation

Test:

1. Very wide signature.
2. Very tall signature.
3. Tiny signature.
4. Large signature.
5. Transparent PNG.
6. JPEG.
7. Corrupt image.
8. Huge image.

Maintain aspect ratio.

Prevent dimensions outside sensible page bounds.

---

# 13. Signature Placement Across Zoom Levels

Test:

```text
100% → insert → export
```

against:

```text
200% → insert → export
```

The relative PDF placement should be equivalent.

This should naturally be solved by the PDF coordinate architecture.

---

# 14. Validate Uploaded Signature Images

Recommended constraints:

```text
Maximum file size: 5 MB
Maximum dimensions: 4096 × 4096
Allowed: PNG, JPEG, WebP
```

Reject malformed image data before export.

Show a clear error instead of allowing an export exception.

---

# Phase 7: Stamps

## 15. Improve Stamp Rotation

Current rotation presets can remain as a quick action.

Add:

1. Arbitrary rotation input.
2. Rotation slider.
3. 90 degree rotation.
4. Reset rotation.

Recommended range:

```text
-180° to 180°
```

---

# 16. Handle Rotated Stamp Bounds

When a stamp is rotated, its visual bounding box changes.

Test:

1. Rotate 45 degrees.
2. Move to page edge.
3. Resize.
4. Export.

Ensure the stamp is not unintentionally clipped.

---

# Phase 8: Text Editing

## 17. Font Handling

The editor uses standard PDF fonts.

This is acceptable as a fallback but can visually differ from the source PDF.

Improve the UI to show:

```text
Original font: ArialMT
Editing font: Helvetica
```

where the original font can be detected.

Do not promise exact font preservation unless implemented.

---

# 18. Text Width and Overflow

Test replacing:

```text
WWW
```

with:

```text
iiiiiiiiiiiiiiii
```

and:

```text
1
```

with:

```text
Customer Reference Number
```

After replacement:

1. Recalculate width.
2. Resize editable overlay.
3. Detect overlap where possible.
4. Optionally provide a `Fit to original width` option.

---

# Phase 9: Unicode

## 19. Unicode Text Support

Test:

```text
English
Hindi
Marathi
Arabic
Chinese
Japanese
Accented Latin
₹
€
$
```

The standard PDF fonts are not sufficient for arbitrary Unicode.

Recommended font strategy:

```text
Noto Sans
Noto Sans Devanagari
Noto Sans Arabic
Noto Sans CJK
```

Embed fonts when required.

Never silently generate missing glyphs.

---

# Phase 10: PDF Geometry

## 20. Rotated Page Tests

Create PDFs with pages rotated:

```text
0°
90°
180°
270°
```

Test:

1. Text edit.
2. Text move.
3. Text replacement.
4. Redaction.
5. Signature.
6. Stamp.
7. Export.

All objects must appear in the correct location.

---

## 21. Page Size Tests

Test:

```text
A4
A3
A5
Letter
Legal
Square
Custom large page
```

Objects must retain correct relative positions.

---

# Phase 11: Large PDF Performance

## 22. Large Document Regression Tests

Test:

```text
1 page
10 pages
50 pages
100 pages
250 pages
500 pages
```

Measure:

1. Load time.
2. Page switching.
3. Zoom.
4. Search.
5. Replace All.
6. Redaction.
7. Undo.
8. Redo.
9. Export.
10. Peak memory.

Do not load every page's rendering data simultaneously.

Only keep necessary page state and release unnecessary rendering resources.

---

# Phase 12: Search

## 23. Search Edge Cases

Test:

```text
John
john
JOHN
John Smith
John*
John?
123
₹500
Hindi
multiple spaces
line breaks
```

Test every combination:

```text
Match Case ON/OFF
Whole Word ON/OFF
```

Multiple occurrences inside one text item must produce multiple logical matches.

---

# 24. Replace Edge Cases

Test:

1. Replace with empty string.
2. Replace with longer string.
3. Replace with shorter string.
4. Replace with special characters.
5. Replace with Unicode.
6. Replace all.
7. Replace current repeatedly.
8. Search after replacement.
9. Replace after undo.
10. Replace after redo.

Prevent infinite replacement when replacement contains the search term.

Example:

```text
Search: John
Replace: John Smith
```

Replace All must operate against the original match set rather than continuously matching newly inserted text.

---

# Phase 13: PDF Input Robustness

Test:

1. Empty file.
2. TXT renamed as PDF.
3. Corrupt PDF.
4. Password protected PDF.
5. Encrypted PDF.
6. Malformed PDF.
7. PDF containing JavaScript.
8. PDF containing forms.
9. PDF containing annotations.
10. PDF containing embedded files.
11. PDF containing huge images.

All failures must:

1. Stop loading.
2. Cancel active tasks.
3. Show a useful error.
4. Return the editor to a usable state.

Never leave the UI permanently stuck on `Rendering` or `Processing`.

---

# Phase 14: File Size

Test around the advertised limit:

```text
49 MB
50 MB
50.1 MB
100 MB
```

Ensure the actual implementation matches the advertised limit.

Also consider decompressed PDF memory consumption.

---

# Phase 15: Resource Cleanup

When starting a new PDF:

1. Destroy the previous PDF.js document.
2. Cancel active render tasks.
3. Revoke object URLs.
4. Clear history.
5. Clear redo history.
6. Clear large ArrayBuffers.
7. Reset canvas state.
8. Reset verification state.

The original PDF bytes are retained in a ref, so they must not survive after the document is closed.

---

# Phase 16: Mobile Interaction

Current interaction is heavily mouse oriented.

Replace mouse specific interactions with Pointer Events:

```ts
pointerdown
pointermove
pointerup
```

Use:

```ts
setPointerCapture(pointerId)
```

Support:

1. Mouse.
2. Touch.
3. Stylus.

Test on:

1. Android Chrome.
2. iPhone Safari.
3. iPad Safari.

Test:

1. Redaction drawing.
2. Object dragging.
3. Resizing.
4. Signature placement.
5. Stamp placement.
6. Zoom.

---

# Phase 17: Accessibility

Add:

1. Keyboard navigation.
2. ARIA labels.
3. Visible focus states.
4. Modal focus trapping.
5. Correct dialog semantics.
6. Accessible radio buttons.
7. Accessible checkboxes.
8. Screen reader labels.
9. Keyboard accessible export controls.

Keyboard shortcuts must not interfere with:

1. Text editing.
2. Find input.
3. Replace input.
4. Signature input.
5. Stamp input.

---

# Phase 18: Metadata

When metadata sanitization is enabled, verify:

```text
Author
Title
Subject
Creator
Producer
CreationDate
ModificationDate
Keywords
Custom metadata
```

Do not claim all identifying fingerprints are removed unless the resulting PDF has actually been inspected.

---

# Phase 19: Privacy Verification

The application must remain local only.

Inspect network activity during:

1. Upload.
2. Rendering.
3. Text extraction.
4. Search.
5. Replace.
6. Redaction.
7. Signature creation.
8. Stamp creation.
9. Export.
10. Verification.

Search source code for:

```text
fetch
XMLHttpRequest
WebSocket
analytics
telemetry
error reporting
remote OCR
remote PDF processing
external APIs
```

No PDF content may be transmitted externally.

Telemetry, if present, must never include PDF content.

---

# Phase 20: UX Improvements

## Smarter export mode

Recommended logic:

```text
No blackout redactions
    ↓
Vector export available

Blackout redaction exists
    ↓
Sanitized export required
```

---

## Security status indicator

Add a document security summary:

```text
Privacy Status

Local processing ✓
No upload ✓
Redactions: 3
Export: Sanitized
Verification: Passed
```

---

## Better terminology

Use:

`Permanent Sanitization`

instead of relying only on:

`Permanent Stream Sanitization`

Explain the technical behaviour below the label.

---

## Page thumbnails

Add a sidebar containing:

1. Page thumbnails.
2. Page number.
3. Redaction indicator.
4. Signature indicator.
5. Stamp indicator.

This becomes increasingly important for documents with many pages.

---

# Automated Test Requirements

Create a test suite covering at minimum:

## Search

```text
case sensitivity
whole word
multiple occurrences
multiple pages
Unicode
no results
```

## Replace

```text
replace current
replace all
case sensitivity
whole word
empty replacement
replacement containing query
undo
redo
```

## Redaction

```text
single match
multiple matches
same item multiple matches
multiple pages
case sensitivity
whole word
sanitized export
vector export rejection
verification
```

## Coordinates

```text
zoom levels
drag
resize
rotation
page sizes
rotated pages
```

## Export

```text
vector
sanitized
metadata
reopen exported PDF
text extraction
```

## Resource management

```text
load
close
load another PDF
rapid page switching
rapid zoom
cancelled rendering
```

---

# Definition of Done

A change is complete only when:

1. TypeScript compilation succeeds.
2. Existing build succeeds.
3. Existing tests pass.
4. New regression tests pass.
5. No existing feature is intentionally broken.
6. PDF processing remains client side.
7. No PDF data is transmitted externally.
8. Exported PDFs can be reopened.
9. Search and Replace operate on exact matches.
10. Redaction cannot accidentally produce an unsafe vector export.
11. Zoom does not alter document coordinates.
12. Undo operates on logical user actions.
13. Unicode failures are either supported or clearly reported.
14. Rotated pages are tested.
15. Large documents do not cause obvious memory leaks.

---

# Recommended Implementation Order

## Sprint 1: Fix correctness

1. Replace Current.
2. Match Case.
3. Whole Word.
4. Redaction export safety.
5. Redact All match precision.
6. Verification wording.

## Sprint 2: Fix architecture

1. Text edit transactions.
2. PDF coordinate system.
3. Zoom conversion.
4. Dragging conversion.
5. Signature coordinates.
6. Stamp coordinates.
7. Redaction coordinates.

## Sprint 3: Export quality

1. DPI.
2. Raster format.
3. Metadata.
4. Verification.
5. Export regression tests.

## Sprint 4: PDF compatibility

1. Unicode.
2. Fonts.
3. Rotated pages.
4. Different page sizes.
5. Large PDFs.
6. Malformed PDFs.

## Sprint 5: Product polish

1. Mobile Pointer Events.
2. Accessibility.
3. Page thumbnails.
4. Security status.
5. Smarter export UI.
6. Better error handling.

---

# Important Coding Agent Rules

Before changing code:

1. Inspect the existing implementation.
2. Identify all affected files.
3. Avoid unnecessary rewrites.
4. Preserve existing APIs where practical.
5. Do not duplicate PDF processing logic.
6. Add regression tests before or alongside fixes.

After changing code:

1. Run TypeScript checks.
2. Run the production build.
3. Run automated tests.
4. Inspect the diff.
5. Check for accidental privacy regressions.
6. Check that no PDF data is sent externally.

Do not solve a bug by hiding it in the UI.

Do not weaken verification to make a test pass.

Do not silently fall back to unsafe redaction.

Do not claim a feature is secure merely because it looks correct visually.

The goal is not simply to make EditPDF appear functional.

The goal is to make the underlying PDF operations correct, predictable, private, and defensible.
