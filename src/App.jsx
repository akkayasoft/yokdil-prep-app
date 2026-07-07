import { useState } from 'react';
import questionsData from './data/questions.json';
import './index.css';

function App() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });

  const question = questionsData[currentIdx];
  const isFinished = currentIdx >= questionsData.length;

  const handleSelect = (optionId) => {
    if (isAnswered) return;
    
    setSelectedOption(optionId);
    setIsAnswered(true);

    if (optionId === question.correctOption) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  };

  const handleNext = () => {
    setCurrentIdx(prev => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setScore({ correct: 0, wrong: 0 });
    setSelectedOption(null);
    setIsAnswered(false);
  };

  if (isFinished) {
    return (
      <div className="app-container">
        <div className="card end-screen">
          <h2>Tebrikler! Testi Tamamladınız</h2>
          <p>Toplam {questionsData.length} sorudan {score.correct} tanesini doğru cevapladınız.</p>
          <button className="reset-btn" onClick={handleReset}>Tekrar Başla</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>YÖKDİL Çalışma Platformu</h1>
        <div className="stats">
          <span>Toplam: {currentIdx + 1}/{questionsData.length}</span>
          <span className="correct">✓ {score.correct}</span>
          <span className="wrong">✗ {score.wrong}</span>
        </div>
      </header>

      <main className="card">
        <div className="question-meta">
          <span>{question.type}</span>
          <span>Soru {currentIdx + 1}</span>
        </div>

        {question.context && (
          <div className="question-context">
            {question.context}
          </div>
        )}

        <div className="question-text">
          {question.text}
        </div>

        <div className="options-list">
          {question.options.map((opt) => {
            let className = "option-btn";
            if (isAnswered) {
              if (opt.id === question.correctOption) {
                className += " correct";
              } else if (opt.id === selectedOption) {
                className += " wrong";
              }
            } else if (selectedOption === opt.id) {
              className += " selected";
            }

            return (
              <button 
                key={opt.id}
                className={className}
                onClick={() => handleSelect(opt.id)}
                disabled={isAnswered}
              >
                <span className="option-id">{opt.id})</span>
                <span className="option-text">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="feedback-section">
            <div className={`feedback-badge ${selectedOption === question.correctOption ? 'success' : 'error'}`}>
              {selectedOption === question.correctOption ? 'Doğru Cevap!' : 'Yanlış Cevap'}
            </div>
            <div className="explanation">
              <strong>Açıklama: </strong> {question.explanation}
            </div>
            <div className="actions">
              <button className="next-btn" onClick={handleNext}>
                {currentIdx === questionsData.length - 1 ? 'Sonucu Gör' : 'Sıradaki Soru ➔'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
