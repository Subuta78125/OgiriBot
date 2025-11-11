// expressやGeminiAPIの呼び出し
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');
require('dotenv').config(); // envファイルの読み込み

const app = express();
const port = 3001;

// APIキーを環境変数から取得
const apiKey = process.env.GEMINI_API_KEY;
if(!apiKey){
    throw new Error("apiKey is not found");
}

const ai = new GoogleGenAI({ apiKey });

// ミドルウェア
app.use(cors()); // CORSを許可(Reactアプリからのアクセス用)
app.use(express.json()); // リクエストボディのJSONをパース

// 大喜利回答APIエンドポイント
app.post('/api/ogiri', async (req, res) => {
    const { topic } = req.body; // フロントエンドから送られてきたお題

    if(!topic){
        return res.status(400).send({ error: 'Topic is required.' });
    }

    // 大喜利を生成するためのプロンプト
    const prompt = `あなたはプロのお笑い芸人で、大喜利が得意です。
    以下のお題に対して、面白く、簡潔な回答を1つだけ提供してください。
    お題: "${topic}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // 任意のモデルを入力
            contents: prompt,
        });

        // 生成されたテキストを抽出
        const ogiriAnswer = response.text.trim();

        res.json({ answer: ogiriAnswer });
    }catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).send({ error: 'Failed to generate ogiri answer'});
    }
});

app.listen(port, () =>{
    console.log(`Server listening at http://localhost:${port}`);
});
