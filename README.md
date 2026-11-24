# Warehouse Batch Scanner PWA — prototype v0.1

## What this prototype does
- Opens the rear camera in Chrome.
- Runs continuous English OCR in the browser using Tesseract.js.
- Attempts to extract Batch/Lot, MFG date, Best Before months and expiry date.
- Requires operator review before saving.
- Stores records in this Chrome profile's localStorage.
- Uploads pending records in batches of 100 to a Google Apps Script web app.
- Exports saved records to CSV.

## Important limitations
This is a first functional prototype, not yet validated for 5,000 production scans/day.
Tesseract.js in a browser may be too slow for that throughput on some phones. This prototype samples a frame about every 1.3 seconds and does not auto-save. Test OCR quality and throughput with real labels before warehouse deployment.
The parser is heuristic. Mixed label layouts, dot-matrix/inkjet codes, glare, curved packs and ambiguous dates need real sample-label tuning. Always verify extracted values.
The app uses browser localStorage rather than a durable database. Do not clear Chrome site data. A production version should use IndexedDB, robust background sync, operator/device identity, authentication and server-side access controls.
The camera requires HTTPS (or localhost). Tesseract.js is loaded from jsDelivr, so the first OCR start needs internet access.
Google Apps Script web apps have execution and quota limits. Verify current account quotas and load-test before relying on this for 5,000/day.

## A. Run locally for a quick camera test
1. Extract the ZIP.
2. On a computer, serve the folder over localhost. For example, with Python installed:
   `python -m http.server 8000`
3. Open `http://localhost:8000` in a desktop browser to inspect the page.
4. For an Android phone, localhost on the PC is not the phone. Deploy the folder to an HTTPS static host, or use a trusted HTTPS tunnel for testing.
5. Open the HTTPS URL in Chrome on Android, grant camera permission, tap Start camera.

A static host such as GitHub Pages can host the files. Do not put private keys or passwords in the web files.

## B. Create the Google Sheet endpoint
1. Create a blank Google spreadsheet named `Warehouse_Batch_Scanning`.
2. In the spreadsheet, choose Extensions → Apps Script.
3. Replace the editor contents with `Code.gs` from this package.
4. Save the project.
5. Choose Deploy → New deployment → Select type: Web app.
6. Execute as: Me.
7. Who has access: Anyone (or the narrowest access option that works for your organization).
8. Deploy and authorize the script.
9. Copy the Web app URL ending in `/exec`.
10. In the scanner page, paste this URL and tap Save URL.

Security note: “Anyone” makes the endpoint reachable by anyone who obtains the URL. The prototype has no authentication. Do not use it for sensitive data or production warehouse records until access is secured (for example, an authenticated backend / Google identity flow). Do not share the endpoint publicly.

## C. Use
1. Start camera.
2. Hold one label steady in view.
3. Wait for OCR text to appear and fields to populate.
4. Correct Batch, MFG, Best Before months and expiry if necessary.
5. Tap Save record.
6. Move to the next product.
7. Tap Sync queued records when connected.
8. Export CSV for a local copy if required.

## D. Date handling
The parser recognizes common MFG/MFD, Batch/Lot, Best Before, EXP/Expiry labels. It deliberately does not calculate expiry automatically in this prototype because month-end conventions vary by manufacturer. Preserve the printed expiry when available and verify month-only dates.

## E. Recommended next improvements before production
- Replace localStorage with IndexedDB.
- Add proper operator login and device ID.
- Tune OCR with representative product photos; consider on-device ML Kit or a dedicated OCR model.
- Add ROI/cropping, autofocus guidance, blur/glare checks and stable-frame confirmation.
- Add configurable label templates and SKU-specific parsing.
- Add duplicate product detection that does not suppress legitimate repeated batches.
- Add retry-safe background synchronization and a server-side unique Scan_ID constraint.
- Run a sustained benchmark on the target phone for 5,000 labels/day.
