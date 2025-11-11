import React, { useState } from'react';
import './App.css';

function App(){
  const [topic, setTopic] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) =>{
    e.preventDefault();
    if(!topic.trim()) return;

    setIsLoading(true);
    setAnswer('');

    try{
      // Node.jsバックエンドAPIを呼び出す
      const response = await fetch('http://localhost:3001/api/ogiri', {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();

      if(response.ok){
        setAnswer(data.answer);
      }else{
        setAnswer(`エラー: ${data.error || '回答の取得に失敗しました'}`);
      }
    }catch(error){
      console.error('Fetch error:', error);
      setAnswer('ネットワークエラーが発生しました。');
    }finally{
      setIsLoading(false);
    }
  };

  return(
    <div className="App">
      <h1>AI大喜利サイト 😆</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="お題を入力してください (例: カニとゴリラを足してできるもの)"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !topic.trim()}>
          {isLoading ? 'AIが考え中...' : '回答を生成'}
        </button>
      </form>

      {answer && (
        <div className="answer-box">
          <h2>大喜利の回答</h2>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}
export default App;