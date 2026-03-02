import multer from "multer";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── CONFIG ──
export const config = {
    api: {
        bodyParser: false,
    },
};

// ── PASSWORDS ──
const ALLOWED_PASSWORDS = [
    "secret123",
    "dowrycalc_2026",
    "myappkey_xyz",
    "testpass456",
    "ranan",
    "tanu",
    "chakresh",
    "doc",
    "madhu",
    "spidey"
];

// ── MULTER MEMORY STORAGE ──
const upload = multer({ storage: multer.memoryStorage() });

// helper to run multer in vercel
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
}

// ── MAIN HANDLER ──
export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        await runMiddleware(req, res, upload.single("face"));

        const sentPassword = req.body?.password || req.body?.apiKey;

        if (!sentPassword) {
            return res.status(401).json({ error: "Password required" });
        }

        if (!ALLOWED_PASSWORDS.includes(sentPassword)) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const file = req.file;
        if (!file) return res.status(400).json({ error: "Upload a photo" });

        const base64Image = file.buffer.toString("base64");

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
        });

        const prompt = `
You are Dowry Roast-o-Tron 3000 — a cheeky sarcastic AI.
Keep reply 2–3 lines max. Always fun, never cruel.
Use ₹ amounts and emojis.
`;

        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: file.mimetype || "image/jpeg", data: base64Image } },
        ]);

        let reply = result.response.text()?.trim() || "Nice photo 😎";

        res.status(200).json({ success: true, result: reply });

    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
}