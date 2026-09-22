import axios from 'axios';

/**
 * Heuristic fallback parser when GEMINI_API_KEY is not configured or network request fails
 */
function fallbackRegexFieldExtraction(rawOcrText) {
  let fullName = null;
  let dateOfBirth = null;
  let casteCategory = null;
  let certificateNumber = null;

  const lines = rawOcrText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Caste category regex
  const casteMatch = rawOcrText.match(/\b(Scheduled Tribe|ST|Scheduled Caste|SC|OBC|Other Backward Class|General)\b/i);
  if (casteMatch) {
    const raw = casteMatch[1].toUpperCase();
    if (raw.includes('TRIBE') || raw === 'ST') casteCategory = 'ST';
    else if (raw.includes('CASTE') || raw === 'SC') casteCategory = 'SC';
    else if (raw.includes('BACKWARD') || raw === 'OBC') casteCategory = 'OBC';
    else casteCategory = 'General';
  }

  // Date of birth regex (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD)
  const dobMatch = rawOcrText.match(/(?:DOB|Date of Birth|Birth Date)[:\s]*([0-3]?[0-9][\/\-\.][0-1]?[0-9][\/\-\.][1-2][0-9]{3})/i)
    || rawOcrText.match(/\b([0-3]?[0-9][\/\-\.][0-1]?[0-9][\/\-\.][1-2][0-9]{3})\b/);
  if (dobMatch) {
    dateOfBirth = dobMatch[1];
  }

  // Name regex heuristics (e.g. "Name: ...", "Candidate Name: ...", "Shri/Kumari ...")
  const nameMatch = rawOcrText.match(/(?:Name of Candidate|Applicant Name|Candidate Name|Name of the Person|Name)[:\s]+([A-Z][a-zA-Z\s]{2,40})/i)
    || rawOcrText.match(/(?:certify that|certifies that|certify)\s+(?:Shri|Smt|Kumari|Mr|Ms)?\.?\s*([A-Za-z\s]{2,40}?)[,\s]+(?:son|daughter|wife|care of|s\/o|d\/o|w\/o|resident|belonging)/i);
  if (nameMatch) {
    fullName = nameMatch[1].replace(/^(Shri|Smt|Kumari|Mr|Ms)\.?\s+/i, '').trim();
  }

  // Certificate number regex
  const certMatch = rawOcrText.match(/(?:Certificate No|Application No|Roll No|Reg No|Ref No)[:\s]*([A-Z0-9\/\-]{5,30})/i);
  if (certMatch) {
    certificateNumber = certMatch[1].trim();
  }

  return {
    fullName,
    dateOfBirth,
    casteCategory,
    certificateNumber,
    issuingAuthority: null,
    source: 'heuristic-regex-fallback'
  };
}

/**
 * Extract structured fields from raw OCR text using Google's Gemini API (Free tier)
 * @param {string} rawOcrText - The concatenated raw text from the document
 * @param {string} [docType] - The document category (e.g., 'ST Caste Certificate', 'Marksheet')
 * @returns {Promise<{ fullName: string|null, dateOfBirth: string|null, casteCategory: string|null, certificateNumber: string|null, issuingAuthority: string|null, source: string }>}
 */
export async function extractFieldsWithGemini(rawOcrText, docType = 'Official Government Certificate') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.warn('[Gemini AI] No GEMINI_API_KEY detected in environment. Using robust heuristic fallback parser.');
    return fallbackRegexFieldExtraction(rawOcrText);
  }

  if (!rawOcrText || rawOcrText.trim().length === 0) {
    return {
      fullName: null,
      dateOfBirth: null,
      casteCategory: null,
      certificateNumber: null,
      issuingAuthority: null,
      source: 'empty-text'
    };
  }

  const prompt = `You are an expert document verification auditor for the Ministry of Tribal Affairs (MoTA), Government of India.
You are given the raw OCR text extracted from an uploaded document (${docType}).
Your task is to accurately extract the applicant's identity information.

Carefully identify:
1. "fullName": The applicant's/candidate's legal full name (do not include salutations like Shri/Smt/Mr/Ms unless part of the name). Return null if not found.
2. "dateOfBirth": The applicant's date of birth (format YYYY-MM-DD or as printed). Return null if not found.
3. "casteCategory": The caste or tribe category (strictly return one of: "ST", "SC", "OBC", "General", or null if not mentioned).
4. "certificateNumber": The official certificate number, roll number, or registration ID if present, otherwise null.
5. "issuingAuthority": The government department, state revenue office, or institution that issued the document, otherwise null.

Format Requirements:
- Return ONLY valid JSON matching this exact schema:
{
  "fullName": string | null,
  "dateOfBirth": string | null,
  "casteCategory": string | null,
  "certificateNumber": string | null,
  "issuingAuthority": string | null
}
- Do NOT include any markdown code blocks, explanations, or commentary outside the JSON object.

RAW OCR TEXT:
${rawOcrText.substring(0, 10000)}`;

  try {
    console.log(`[Gemini AI] Querying Gemini for ${docType} field extraction...`);

    // Use Gemini 3.5 Flash with responseMimeType: application/json
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    const candidates = response.data?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('Gemini returned no candidate responses');
    }

    let responseText = candidates[0]?.content?.parts?.[0]?.text || '{}';

    // Strip any markdown backticks if present
    responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsedJson = JSON.parse(responseText);

    console.log('[Gemini AI] Successfully extracted structured fields:', parsedJson);

    return {
      fullName: parsedJson.fullName || null,
      dateOfBirth: parsedJson.dateOfBirth || null,
      casteCategory: parsedJson.casteCategory || null,
      certificateNumber: parsedJson.certificateNumber || null,
      issuingAuthority: parsedJson.issuingAuthority || null,
      source: model
    };
  } catch (err) {
    console.warn(`[Gemini AI] Gemini API call failed (${err.message}). Falling back to heuristic extraction.`);
    const fallback = fallbackRegexFieldExtraction(rawOcrText);
    fallback.source = `fallback-due-to-error: ${err.message}`;
    return fallback;
  }
}
