import { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Auth/Login';
import { LanguageProvider } from './context/LanguageContext';
import PrivacyInfo from './components/Info/PrivacyInfo';
import Terms from './components/Info/Terms';
import DataRights from './components/Info/DataRights';
import ConsentBanner from './components/Info/ConsentBanner';
import MathConcept from './components/MathConcept/MathConcept';
import { getGameById } from './config/GameConfig';
import TestRunner from './components/TestRunner/TestRunner';

function App() {
  const [activeGame, setActiveGame] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('isAuth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuth', 'true');
  };

  const handleSelectGame = (gameId) => {
    setActiveGame(gameId);
  };

  const handleBackToDashboard = () => {
    setActiveGame(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Helper to determine if we are in "learn" mode
  const isLearnMode = activeGame && activeGame.startsWith('learn-');
  const learnGameId = isLearnMode ? activeGame.replace('learn-', '') : null;
  const learnGameObj = isLearnMode ? getGameById(learnGameId) : null;

  // Helper to find active game object for normal play
  const activeGameObj = !isLearnMode ? getGameById(activeGame) : null;
  const isLegalPage = ['privacy', 'terms', 'gdpr'].includes(activeGame);

  return (
    <LanguageProvider>
      {/* Legal Pages */}
      {activeGame === 'privacy' && (
        <PrivacyInfo onBack={handleBackToDashboard} onNavigate={handleSelectGame} />
      )}
      {activeGame === 'terms' && (
        <Terms onBack={handleBackToDashboard} onNavigate={handleSelectGame} />
      )}
      {activeGame === 'gdpr' && (
        <DataRights onBack={handleBackToDashboard} onNavigate={handleSelectGame} />
      )}

      {/* Math Concept Pages */}
      {isLearnMode && (
        <MathConcept
          gameId={learnGameId}
          GameComponent={learnGameObj?.component}
          onBack={handleBackToDashboard}
          onNavigate={handleSelectGame}
        />
      )}

      {/* Main Game Layout */}
      {!isLegalPage && !isLearnMode && (
        <Layout onNavigate={handleSelectGame} activeGame={activeGame}>
          {activeGame === 'test-runner' ? (
            <TestRunner onBack={handleBackToDashboard} />
          ) : activeGameObj ? (
            <activeGameObj.component onBack={handleBackToDashboard} />
          ) : (
            <Dashboard onSelectGame={handleSelectGame} />
          )}
        </Layout>
      )}
      <ConsentBanner />
    </LanguageProvider>
  );
}

export default App;
