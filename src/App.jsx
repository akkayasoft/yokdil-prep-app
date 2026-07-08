import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [selectedTest, setSelectedTest] = useState(null);
  const [questionsData, setQuestionsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [savedScores, setSavedScores] = useState({});

  useEffect(() => {
    const scores = localStorage.getItem('yokdil_scores');
    if (scores) {
      setSavedScores(JSON.parse(scores));
    }
  }, []);

  const loadTest = async (testNumber) => {
    setIsLoading(true);
    try {
      const module = await import(`./data/deneme${testNumber}.json`);
      setQuestionsData(module.default);
      setSelectedTest(testNumber);
      setCurrentIdx(0);
      setScore({ correct: 0, wrong: 0 });
      setSelectedOption(null);
      setIsAnswered(false);
    } catch (e) {
      alert(`Deneme ${testNumber} henüz yüklenmedi veya bulunamadı.`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedTest) {
    return (
      <div className="app-container menu-container">
        <header className="header" style={{justifyContent: 'center', textAlign: 'center'}}>
          <h1>YÖKDİL Deneme Platformu</h1>
        </header>
        <div className="card test-grid">
          <h2>Lütfen Bir Deneme Seçin</h2>
          <div className="grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
              const bestScore = savedScores[num];
              return (
                <button 
                  key={num} 
                  className="test-btn"
                  onClick={() => loadTest(num)}
                  disabled={isLoading}
                >
                  <span>Deneme Sınavı {num} {isLoading ? '...' : ''}</span>
                  {bestScore && (
                    <span className="best-score">
                      En İyi: {bestScore.correct} Doğru
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

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
    // Sınav bittiğinde skor kaydetme işlemi
    if (currentIdx === questionsData.length - 1) {
      const prevBest = savedScores[selectedTest];
      // Eğer daha önce skor yoksa veya yeni skor eskisinden iyiyse kaydet
      if (!prevBest || score.correct > prevBest.correct) {
        const updatedScores = { ...savedScores, [selectedTest]: score };
        setSavedScores(updatedScores);
        localStorage.setItem('yokdil_scores', JSON.stringify(updatedScores));
      }
    }
    setCurrentIdx(prev => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleReset = () => {
    setSelectedTest(null);
    setQuestionsData([]);
  };

  if (isFinished) {
    return (
      <div className="app-container">
        <div className="card end-screen">
          <h2>Tebrikler! Deneme {selectedTest} Sınavını Tamamladınız</h2>
          <p>Toplam {questionsData.length} sorudan {score.correct} tanesini doğru cevapladınız.</p>
          <button className="reset-btn" onClick={handleReset}>Ana Menüye Dön</button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">
          <button className="back-btn" onClick={() => setSelectedTest(null)}>❮ Menü</button>
          <h1>Deneme {selectedTest}</h1>
        </div>
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
