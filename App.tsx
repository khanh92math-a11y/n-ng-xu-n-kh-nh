
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Question } from './types';
import { TOTAL_QUESTIONS } from './constants';
import { generateMathQuestions } from './services/geminiService';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import WinScreen from './components/WinScreen';
import LoadingScreen from './components/LoadingScreen';
import { useSounds } from './hooks/useSounds';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const { playSound, stopAllSounds } = useSounds();

  const fetchQuestions = useCallback(async () => {
    setError(null);
    setGameState(GameState.LOADING);
    try {
      const fetchedQuestions = await generateMathQuestions();
      setQuestions(fetchedQuestions);
      setCurrentQuestionIndex(0);
      setGameState(GameState.PLAYING);
      playSound('play');
    } catch (err) {
      setError("Không thể tải câu hỏi. Vui lòng thử lại.");
      setGameState(GameState.START);
    }
  }, [playSound]);

  const handleStartGame = () => {
    stopAllSounds();
    playSound('start');
    fetchQuestions();
  };

  const handleAnswer = (isCorrect: boolean) => {
    stopAllSounds();
    if (isCorrect) {
      playSound('correct');
      setTimeout(() => {
        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          playSound('play');
        } else {
          setGameState(GameState.WIN);
          playSound('win');
        }
      }, 3000);
    } else {
      playSound('wrong');
      setTimeout(() => {
        setGameState(GameState.GAME_OVER);
      }, 3000);
    }
  };
  
  const handleTimeUp = () => {
      stopAllSounds();
      playSound('wrong');
      setTimeout(() => {
        setGameState(GameState.GAME_OVER);
      }, 1000);
  };

  const handlePlayAgain = () => {
    stopAllSounds();
    setGameState(GameState.START);
  };

  const renderContent = () => {
    switch (gameState) {
      case GameState.LOADING:
        return <LoadingScreen />;
      case GameState.PLAYING:
        return (
          <GameScreen
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            onAnswer={handleAnswer}
            onTimeUp={handleTimeUp}
            playSound={playSound}
            stopSound={stopAllSounds}
          />
        );
      case GameState.GAME_OVER:
        return <GameOverScreen onPlayAgain={handlePlayAgain} questionIndex={currentQuestionIndex} />;
      case GameState.WIN:
        return <WinScreen onPlayAgain={handlePlayAgain} />;
      case GameState.START:
      default:
        return <StartScreen onStart={handleStartGame} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black">
      <div className="w-full max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
