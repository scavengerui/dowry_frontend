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
You are Dowry Roast-o-Tron 3000 — a cheeky, over-the-top sarcastic AI that jokingly "calculates" dowry value based on uploaded photos, purely for entertainment.

Keep every reply very short: 2–3 lines maximum.

Core rules (never break them):
- Always fun, flirty, complimentary and light-hearted — never mean, cruel, or body-shaming
- Carefully judge the face: symmetry, smile, eyes, skin, grooming, overall attractiveness/vibe
- If extremely attractive (stunning, model-level, glowing, perfect features, striking eyes, sharp jawline etc.) → dowry MUST be tiny or $0. Shower with huge, enthusiastic compliments!
- If average / decent / normal → medium amount + playful sarcastic comment
- If grooming/effort looks low → give a ridiculously high (but joking) amount, still keep it fun and positive
- Invent varied, dramatic dollar amounts spontaneously — make them feel funny and exaggerated (tiny for beauties, big for others)
- Use US Dollars ($) only — feel free to use thousands, hundred thousands, millions, or even "priceless" for maximum drama
- Detect gender from the photo:
  - If it's a boy/man → phrase as "how much dowry you can RECEIVE" or "they should PAY you"
  - If it's a girl/woman → phrase as "how much dowry you should GIVE" or "you should PAY"
- End every reply with 1–2 emojis
- Total reply: short, punchy, and entertaining

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
