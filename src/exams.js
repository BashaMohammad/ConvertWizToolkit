// Exam-specific photo & signature pages.
// RULE: every value here must come from the exam body's own latest notification/bulletin (link in `src`).
// When a new notification is published, update the values, `notice`, `src` and `checked`.
// Upload item fields: id, n (name), w/h (output px), min/max (KB), keep (fit inside w×h without cropping),
// dpi (write DPI into the JPG), spec (what the notice says, shown in the table), live (captured live – no file).
const CHECKED = '7 November 2026';

const NTA_PHOTO = { id: 'photo', n: 'Photograph', w: 413, h: 531, min: 10, max: 200, spec: 'JPG/JPEG, 10–200 KB. No pixel size is prescribed; our preset outputs 413×531 px (3.5 × 4.5 cm at 300 DPI).' };
const IBPS_SET = [
  { id: 'photo', n: 'Photograph', w: 200, h: 230, min: 20, max: 50, spec: '200 × 230 px (preferred), 20–50 KB, JPG/JPEG' },
  { id: 'sign', n: 'Signature', w: 140, h: 60, min: 10, max: 20, spec: '140 × 60 px (preferred), 10–20 KB, JPG/JPEG, black ink, not in capital letters' },
  { id: 'lti', n: 'Left thumb impression', w: 240, h: 240, min: 20, max: 50, dpi: 200, spec: '240 × 240 px at 200 DPI (3 × 3 cm), 20–50 KB, JPG/JPEG, black or blue ink' },
  { id: 'decl', n: 'Hand-written declaration', w: 800, h: 400, min: 50, max: 100, dpi: 200, spec: '800 × 400 px at 200 DPI (10 × 5 cm), 50–100 KB, JPG/JPEG, English, black ink, not in capital letters' },
];
const IBPS_DECL = 'I, _______ (Name of the candidate), hereby declare that all the information submitted by me in the application form is correct, true and valid. I will present the supporting documents as and when required.';

const EXAMS = [
  { s: 'ssc-cgl-photo-signature-size', n: 'SSC CGL', full: 'SSC Combined Graduate Level Examination (CGL)', body: 'Staff Selection Commission', year: '2026',
    notice: 'Notice of Combined Graduate Level Examination, 2026 (published 21 May 2026)',
    src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_cgl_2025.pdf',
    items: [
      { id: 'photo', n: 'Photograph', live: true, spec: 'Captured live through the application module (webcam or the SSC mobile app via QR code). No photo file is uploaded.' },
      { id: 'sign', n: 'Signature', w: 472, h: 157, min: 10, max: 20, spec: 'JPEG/JPG, 10–20 KB, about 6.0 cm (width) × 2.0 cm (height). Our preset outputs 472 × 157 px (6 × 2 cm at 200 DPI).' },
    ],
    rules: ['Your photo is taken live while you fill the form: no cap, mask or spectacles, full frontal view, face inside the red rectangle.', 'Do not photograph an existing printed or digital photo – such applications are rejected.', 'Blurred or miniature signatures are rejected.', 'Check the photograph and signature with the Preview/Print option before you submit.'] },
  { s: 'ssc-chsl-photo-signature-size', n: 'SSC CHSL', full: 'SSC Combined Higher Secondary (10+2) Level Examination (CHSL)', body: 'Staff Selection Commission', year: '2026',
    notice: 'Notice of Combined Higher Secondary (10+2) Level Examination, 2026',
    src: 'https://ssc.gov.in/api/attachment/uploads/masterData/NoticeBoards/Notice_of_adv_chsl_2026.pdf',
    items: [
      { id: 'photo', n: 'Photograph', live: true, spec: 'Captured live through the application module (webcam or mobile). No photo file is uploaded.' },
      { id: 'sign', n: 'Signature', w: 472, h: 157, min: 10, max: 20, spec: 'JPEG/JPG, 10–20 KB, about 6.0 cm (width) × 2.0 cm (height). Our preset outputs 472 × 157 px (6 × 2 cm at 200 DPI).' },
    ],
    rules: ['Do not wear a cap, mask or glasses/spectacles while capturing the live photo.', 'Your appearance on exam day should match the live photo.', 'Blurred or miniature signatures are rejected.'] },
  { s: 'upsc-photo-signature-size', n: 'UPSC', full: 'UPSC exams (Civil Services, IFoS, NDA, CDS, CAPF, ESE and more)', body: 'Union Public Service Commission', year: '2026',
    notice: 'UPSC “Instructions for uploading the photo & signature” (online application portal), referenced in Examination Notice No. 05/2026-CSE dated 04.02.2026',
    src: 'https://upsconline.nic.in/ngrp/assets/PDF/instruction-photo-signature-upload-upsc.pdf',
    items: [
      { id: 'photo', n: 'Photograph', w: 413, h: 531, min: 20, max: 200, spec: 'JPG, 20–200 KB, file named “photo”. Face must cover at least 75% of the photo, plain white background, both ears visible. Our preset outputs 413 × 531 px.' },
      { id: 'live', n: 'Live photograph', live: true, spec: 'Mandatory. Captured with your device camera or by scanning a QR code with your mobile, and matched with your uploaded photo.' },
      { id: 'sign', n: 'Signature (signed three times)', w: 400, h: 500, min: 20, max: 100, spec: 'JPG, 20–100 KB, 350–500 pixels, file named “signature”. Sign three times one below the other on plain white paper in black ink and scan as one image. Our preset outputs 400 × 500 px.' },
    ],
    rules: ['If the live photo does not match your uploaded photo, you cannot continue with the application.', 'The photograph must not be signed, and eyes must not be hidden by glasses or hair.', 'The signature image must contain exactly three signatures, arranged vertically, on plain white paper.'] },
  { s: 'jee-main-photo-signature-size', n: 'JEE Main', full: 'JEE (Main)', body: 'National Testing Agency (NTA)', year: '2027',
    notice: 'Information Bulletin – JEE (Main) 2027 (released 24 October 2026)',
    src: 'https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2026/10/202610241890224107.pdf',
    items: [
      { ...NTA_PHOTO, spec: 'Recent passport-size photo in colour, 80% face (including ears, without mask), white background, JPG/JPEG, 10–200 KB. Our preset outputs 413 × 531 px.' },
      { id: 'live', n: 'Live photograph', live: true, spec: 'Captured with your webcam or by scanning a QR code with a mobile during the application. White background, good lighting, 80% face visible.' },
      { id: 'sign', n: 'Signature', w: 413, h: 177, min: 10, max: 100, spec: 'JPG/JPEG, 10–100 KB. Our preset outputs 413 × 177 px (3.5 × 1.5 cm at 300 DPI).' },
    ],
    rules: ['Keep two extra copies of the same passport-size photo for the admit card and attendance sheet.', 'Update your Aadhaar with a recent photograph, as the live photo is verified.'] },
  { s: 'neet-ug-photo-signature-size', n: 'NEET UG', full: 'NEET (UG)', body: 'National Testing Agency (NTA)', year: '2026',
    notice: 'Information Bulletin NEET (UG) 2026 (February 2026). The NEET (UG) 2027 bulletin has not been released yet.',
    src: 'https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/02/202602081576322299.pdf',
    items: [
      { ...NTA_PHOTO, spec: 'Passport-size photo taken after 1 January 2026, colour or black & white, 80% face (without mask) including ears, white background, JPG/JPEG, 10–200 KB. Our preset outputs 413 × 531 px.' },
      { id: 'live', n: 'Live photograph', live: true, spec: 'Captured during the application and matched with your Aadhaar photograph.' },
      { id: 'sign', n: 'Signature', w: 413, h: 177, min: 10, max: 100, spec: 'JPG/JPEG, 10–100 KB. Our preset outputs 413 × 177 px.' },
      { id: 'thumbs', n: 'Left and right hand fingers and thumb impressions', w: 1200, h: 1200, keep: true, min: 50, max: 200, spec: 'JPG/JPEG. The bulletin’s detailed instructions give 50–300 KB. Our preset keeps your scan’s shape and aims for 50–200 KB so it stays well inside the limit.' },
    ],
    rules: ['Keep 6–8 passport-size and 4–6 postcard-size (4″ × 6″) colour photos with white background for the exam and counselling.', 'Polaroid and computer-generated photos are not accepted.', 'Unclear finger and thumb impressions lead to rejection.'] },
  { s: 'cuet-ug-photo-signature-size', n: 'CUET UG', full: 'CUET (UG)', body: 'National Testing Agency (NTA)', year: '2026',
    notice: 'Information Bulletin CUET (UG) 2026 (January 2026). The CUET (UG) 2027 bulletin has not been released yet.',
    src: 'https://cdnbbsr.s3waas.gov.in/s3d1a21da7bca4abff8b0b61b87597de73/uploads/2026/01/202601031633478370.pdf',
    items: [
      { ...NTA_PHOTO, spec: 'Recent passport-size photo in colour, 80% face (including ears, without mask), white background, JPG/JPEG, 10–200 KB. Our preset outputs 413 × 531 px.' },
      { id: 'live', n: 'Live photograph', live: true, spec: 'Captured during the application with your camera or a mobile via QR code.' },
      { id: 'sign', n: 'Signature', w: 413, h: 177, min: 10, max: 50, spec: 'JPG/JPEG, 10–50 KB. Our preset outputs 413 × 177 px.' },
    ],
    rules: ['Carry a passport-size photo (the same one you uploaded) for the attendance sheet.'] },
  { s: 'ugc-net-photo-signature-size', n: 'UGC NET', full: 'UGC-NET', body: 'National Testing Agency (NTA)', year: 'December 2026',
    notice: 'Information Bulletin UGC-NET December 2026 (8 October 2026, updated 16 October 2026)',
    src: 'https://cdnbbsr.s3waas.gov.in/s301eee509ee2f68dc6014898c309e86bf/uploads/2026/10/202610081852912625.pdf',
    items: [
      { ...NTA_PHOTO, spec: 'Recent photo in colour or black & white, 80% face (without mask) including ears, white background, 10–200 KB. Our preset outputs 413 × 531 px.' },
      { id: 'live', n: 'Live photograph', live: true, spec: 'Captured at the time of filling the application form.' },
      { id: 'sign', n: 'Signature', w: 413, h: 177, min: 10, max: 50, spec: 'Full signature in running handwriting (not capital letters), blue/black ink on white paper, 10–50 KB. Our preset outputs 413 × 177 px.' },
    ],
    rules: ['Writing your name in capital letters is not accepted as a signature.', 'Keep 6–8 passport-size photos, the same as the one uploaded.'] },
  { s: 'csir-net-photo-signature-size', n: 'CSIR NET', full: 'Joint CSIR-UGC NET', body: 'National Testing Agency (NTA)', year: 'December 2026',
    notice: 'Information Bulletin Joint CSIR-UGC NET December 2026 (October 2026)',
    src: 'https://cdnbbsr.s3waas.gov.in/s3efdf562ce2fb0ad460fd8e9d33e57f57/uploads/2026/10/202610071407707951.pdf',
    items: [
      { ...NTA_PHOTO, spec: 'Recent passport-size photo in colour, 80% face (including ears, without mask), white background, JPG/JPEG, 10–200 KB. Our preset outputs 413 × 531 px.' },
      { id: 'live', n: 'Live photograph', live: true, spec: 'Captured during the application with your camera or a mobile via QR code.' },
      { id: 'sign', n: 'Signature', w: 413, h: 177, min: 10, max: 50, spec: 'JPG/JPEG, 10–50 KB. Our preset outputs 413 × 177 px.' },
    ],
    rules: ['Carry a passport-size photo (the same one you uploaded) for the attendance sheet.'] },
  { s: 'ctet-photo-signature-size', n: 'CTET', full: 'Central Teacher Eligibility Test (CTET)', body: 'Central Board of Secondary Education (CBSE)', year: 'September 2026',
    notice: 'Information Bulletin CTET – September 2026 (May 2026), the latest bulletin published',
    src: 'https://cdnbbsr.s3waas.gov.in/s3443dec3062d0286986e21dc0631734c9/uploads/2026/05/202605111250310617.pdf',
    items: [
      { id: 'photo', n: 'Photograph', w: 276, h: 354, min: 10, max: 100, dpi: 200, spec: 'JPG/JPEG, 10–100 KB, 3.5 cm (width) × 4.5 cm (height). Our preset outputs 276 × 354 px (3.5 × 4.5 cm at 200 DPI).' },
      { id: 'sign', n: 'Signature', w: 276, h: 118, min: 3, max: 30, dpi: 200, spec: 'JPG/JPEG, 3–30 KB, 3.5 cm × 1.5 cm. Our preset outputs 276 × 118 px (at 200 DPI).' },
    ],
    rules: ['Your photo is matched with you at the exam centre, so use a recent one.'] },
  { s: 'ibps-po-clerk-photo-signature-size', n: 'IBPS PO & Clerk', full: 'IBPS PO/MT and Clerk (CRP-XVI)', body: 'Institute of Banking Personnel Selection (IBPS)', year: '2026',
    notice: 'IBPS Notification CRP PO/MT-XVI (30 June 2026) and CRP CSA-XVI – “Guidelines for scanning and upload of documents”',
    src: 'https://www.ibps.in/wp-content/uploads/Detailed-Notification_CRP-PO-XVI_Final_V1_30.06.2026.pdf',
    items: [...IBPS_SET, { id: 'live', n: 'Live photograph', live: true, spec: 'Captured through webcam or mobile phone during registration.' }],
    decl: IBPS_DECL,
    rules: ['Signature and declaration in CAPITAL LETTERS are not accepted.', 'If your signature at the exam does not match the uploaded one, you will be disqualified.', 'Scan at a minimum of 200 DPI in true colour.'] },
  { s: 'sbi-po-clerk-photo-signature-size', n: 'SBI PO & Clerk', full: 'SBI Probationary Officers and Junior Associates (Clerk)', body: 'State Bank of India', year: '2026',
    notice: 'SBI Recruitment of Probationary Officers, Advt. No. CRPD/PO/2026-27/09 (18 June 2026) and Junior Associates, Advt. No. CRPD/CR/2026-27/17',
    src: 'https://sbi.bank.in/csfile/18062026_1_Detailed_Adv.2026.pdf',
    items: IBPS_SET,
    decl: IBPS_DECL,
    rules: ['Signature and declaration in CAPITAL LETTERS are not accepted.', 'Use a recent passport-style colour photo against a light, preferably white, background.'] },
  { s: 'rrb-photo-signature-size', n: 'RRB (Railways)', full: 'Railway Recruitment Boards (NTPC, ALP, Group D, JE and others)', body: 'Railway Recruitment Boards', year: '2026',
    notice: 'Centralised Employment Notice (CEN) No. 01/2026 and later 2026 CENs – para 13.4–13.5',
    src: 'https://www.rrbchennai.gov.in/downloads/CEN%2001_2026%20english%20.pdf',
    items: [
      { id: 'photo', n: 'Photograph', live: true, spec: 'A live image is captured during the application. Do not photograph a printed or digital photo.' },
      { id: 'sign', n: 'Signature', w: 350, h: 200, min: 30, max: 49, dpi: 100, spec: 'JPG/JPEG, 30–49 KB, minimum 140 × 60 px, scanned at 100 DPI or more, in running handwriting (not BLOCK/CAPITAL letters). Our preset outputs 350 × 200 px.' },
    ],
    rules: ['Signatures must be identical on all documents at every stage.', 'Non-white background, non-black ink or block letters lead to rejection.'] },
];

module.exports = { EXAMS, CHECKED };
