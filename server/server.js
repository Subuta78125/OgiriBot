// expressやGeminiAPIの呼び出し
const express = require("express");
const { GoogleGenAI } = require("@google/genai"); // geminiAPI
const cors = require("cors");
const OpenAI = require("openai"); // openAIライブラリ
require("dotenv").config(); // envファイルの読み込み

const app = express();
const port = 3001;

// APIキーを環境変数から取得
const geminiApiKey = process.env.GEMINI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not found");
}
if (!openaiApiKey) {
  throw new Error("OPENAI_API_KEY is not found");
}

const geminiAi = new GoogleGenAI({ apiKey: geminiApiKey }); // Geminiクライアント
const openai = new OpenAI({ apiKey: openaiApiKey }); // OpenAIクライアント

// ミドルウェア
app.use(cors()); // CORSを許可(Reactアプリからのアクセス用)
app.use(express.json()); // リクエストボディのJSONをパース

// 大喜利回答APIエンドポイント
app.post("/api/ogiri", async (req, res) => {
  const { topic } = req.body; // フロントエンドから送られてきたお題

  if (!topic) {
    return res.status(400).send({ error: "Topic is required." });
  }

  // 大喜利を生成するためのプロンプト
  const prompt = `あなたはプロのお笑い芸人で、大喜利が得意です。
    以下のお題に対して、面白く、簡潔な回答を1つだけ提供してください。
    回答はテキストのみとし、前後の説明や余計な記号は一切付けないでください。
    お題: "${topic}"`;

  let geminiAnswer = "Geminiからの回答を取得できませんでした。";
  let openAiAnswer = "OpenAIからの回答を取得できませんでした。";

  // 2つのAPI呼び出しを並行して実行 (Promise.all)
  try {
    const [geminiResponse, openAiResponse] = await Promise.allSettled([
      // Gemini API呼び出し
      geminiAi.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      }),

      // OpenAI API呼び出し
      openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "あなたはお題に対して大喜利を行う大喜利AIです。このお題に対してユーモアのある面白い回答を一言言ってください。",
          },
          { role: "user", content: `お題: "${topic}"` },
        ],
        max_tokens: 100, // 回答が長くなりすぎないように制限
      }),
    ]);

    // Geminiの結果を処理
    if (geminiResponse.status === "fulfilled") {
      geminiAnswer = geminiResponse.value.text.trim();
    } else {
      console.error("Gemini API Error:", geminiResponse.reason.message);
    }

    // OpenAIの結果を処理
    if (
      openAiResponse.status === "fulfilled" &&
      openAiResponse.value.choices[0]
    ) {
      openAiAnswer = openAiResponse.value.choices[0].message.content.trim();
    } else {
      console.error(
        "OpenAI API Error:",
        openAiResponse.reason
          ? openAiResponse.reason.message
          : "No content received."
      );
    }
  } catch (error) {
    console.error("General API Call Error:", error);
    // ここで発生するエラーは、Promise.allSettledでキャッチされない個別のエラー
  }

  // 両方の回答をフロントエンドに返す
  res.json({
    gemini: geminiAnswer,
    openai: openAiAnswer,
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
