const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes code for quality, complexity, and best practices.
 * @param {string} code - The candidate's code submission.
 * @param {string} problemDescription - The description of the coding task.
 * @param {string} language - The programming language used (default: python).
 * @returns {Promise<object>} - Analysis results.
 */
async function analyzeCode(code, problemDescription, language = 'python') {
  const modelsToTry = ['gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-pro'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`🤖 Attempting analysis with ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
        You are an expert software engineer and technical interviewer. 
        Analyze the following code submission for a coding challenge.
        
        Problem Description:
        "${problemDescription}"
        
        Candidate's Code (${language}):
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Please provide a detailed evaluation in JSON format with the following fields:
        - bigO: A string representing time and space complexity (e.g., "O(N) time, O(1) space").
        - qualityScore: A number from 1 to 10 for overall code quality.
        - readability: A brief comment on code readability.
        - bestPractices: A list of 2-3 key best practices followed or missed.
        - feedback: A concise, human-like summary of the code and how it could be improved.
        
        Return ONLY the JSON object.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      if (text.startsWith('```json')) {
        text = text.replace(/```json|```/g, '').trim();
      } else if (text.startsWith('```')) {
        text = text.replace(/```/g, '').trim();
      }

      console.log(`✅ AI Analysis successful with ${modelName}`);
      return JSON.parse(text);
    } catch (err) {
      console.error(`⚠️ ${modelName} failed:`, err.message);
      lastError = err;
      if (err.status !== 404) break;
    }
  }

  return {
    error: 'AI analysis failed after multiple attempts',
    bigO: 'Unknown',
    qualityScore: 0,
    readability: 'Error processing code',
    feedback: 'Gemini API Error: ' + (lastError ? lastError.message : 'Unknown error')
  };
}

/**
 * OCR for certificate verification using Gemini Vision.
 * @param {string} filePath - Path to the uploaded image file.
 * @returns {Promise<object>} - Extracted certificate details.
 */
async function verifyCertificateOCR(filePath) {
  try {
    console.log('👁️ Running Certificate OCR with Gemini (gemini-1.5-flash-latest)...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const fs = require('fs');

    const imageBuffer = fs.readFileSync(filePath);
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg', // Multer should handle type validation
      },
    };

    const prompt = `
      Analyze this certificate image carefully. 
      Identify the platform (e.g., Pearson, Coursera, Udemy, Cisco, Google) from any logos, headers, or footers.
      
      Extract the following information in JSON format:
      - platform: The issuing platform name.
      - candidateName: Full name of the certificate holder.
      - courseName: Full name of the course/exam/certification.
      - issueDate: Date issued (if visible).
      - credentialId: ID or serial number (if visible).
      - trustScore: Confidence score (0-100) based on authenticity indicators like official logos and professional formatting.
      
      Return ONLY the JSON object.
    `;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text();

    if (text.startsWith('```json')) {
      text = text.replace(/```json|```/g, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/```/g, '').trim();
    }

    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini OCR Error:', err);
    return { error: 'OCR processing failed' };
  }
}

module.exports = { analyzeCode, verifyCertificateOCR };
