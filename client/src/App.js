import React, { useState } from 'react';
import './App.css';

function App() {
  const [topic, setTopic] = useState('');
  // 回答をオブジェクトとして保持
  const [answers, setAnswers] = useState({ gemini: '', openai: '' }); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // エラーメッセージ用

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setAnswers({ gemini: '', openai: '' });
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/ogiri', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (response.ok) {
        // 成功時、両方の回答をセット
        setAnswers({
          gemini: data.gemini,
          openai: data.openai,
        });
      } else {
        // エラー時
        setError(`エラー: ${data.error || '回答の取得に失敗しました。'}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('ネットワーク接続エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1 className="title">AI大喜利Bot</h1>
        <p className="discription">お題を入力して、GeminiとGPTのユーモアを確かめよう!</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          className="themeBox"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="お題を入力してください"
          disabled={isLoading}
        />
        <button className="submitButton" type="submit" disabled={isLoading || !topic.trim()}>
          {isLoading ? 'AIが考え中...' : '回答を生成'}
        </button>
      </form>
      
      {/* エラーメッセージの表示 */}
      {error && <div style={{ color: 'red', marginTop: '20px' }}>{error}</div>}

      {/* 2つの回答の表示 */}
      {isLoading ? (
        <div style={{ marginTop: '20px' }}>AIが考え中...</div>
      ) : (answers.gemini || answers.openai) && (
        <div className="answers-container" style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
          
          <div className="answer-box gemini-box" style={{ flex: 1, border: '1px solid #007bff', padding: '15px', borderRadius: '8px' }}>
            <h2>🧠 Gemini 2.5 Flash のユーモア</h2>
            <p>{answers.gemini}</p>
          </div>
          
          <div className="answer-box openai-box" style={{ flex: 1, border: '1px solid #28a745', padding: '15px', borderRadius: '8px' }}>
            <h2>🤖 GPT-4o のユーモア</h2>
            <p>{answers.openai}</p>
          </div>
          
        </div>
      )}
    </div>
  );
}
export default App;