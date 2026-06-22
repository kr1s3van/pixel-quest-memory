import React, { useState, useEffect } from 'react';
import { Swords } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const App = () => {
  const [status, setStatus] = useState('MENU'); 
  const [hero, setHero] = useState('LINK');
  const [difficulty, setDifficulty] = useState('EASY'); 
  const [lives, setLives] = useState(3); 
  const [path, setPath] = useState([]);
  const [userStep, setUserStep] = useState(1); 
  const [currentTile, setCurrentTile] = useState(null);

  const gridSize = difficulty === 'EASY' ? 4 : 6;
  const pathLength = difficulty === 'EASY' ? 5 : 8;

  const startNewGame = () => {
    let newPath = [0]; let curr = 0;
    while(newPath.length < pathLength) {
      let n = [curr-1, curr+1, curr-gridSize, curr+gridSize].filter(x => x >= 0 && x < gridSize*gridSize && !newPath.includes(x));
      let next = n[Math.floor(Math.random() * n.length)] || curr;
      if (next === curr) break;
      newPath.push(next); curr = next;
    }
    setPath(newPath); setUserStep(1); setLives(3); setStatus('SHOWING');
  };

  useEffect(() => {
    if (status === 'SHOWING') {
      let i = 0;
      const interval = setInterval(() => {
        setCurrentTile(path[i]); i++;
        if (i > path.length) { clearInterval(interval); setCurrentTile(null); setStatus('PLAYING'); }
      }, 700);
      return () => clearInterval(interval);
    }
  }, [status, path]);

  const handleTileClick = (index) => {
    if (status !== 'PLAYING') return;
    if (index === path[userStep]) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);
      if (nextStep === path.length) setStatus('WON');
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives === 0) setStatus('LOST');
    }
  };

  const getStatusText = () => {
    if (status === 'SHOWING') return "MÉMORISE LE CHEMIN !";
    if (status === 'PLAYING') return "TROUVE LA SORTIE !";
    if (status === 'WON') return "VICTOIRE !";
    if (status === 'LOST') return "PERDU !";
    return "";
  };

  return (
    <div className="game-container">
      <div className="scanline-overlay"></div>
      
      {status === 'MENU' && (
        <div className="bento-grid-container">
          <div className="section-wrapper title-section w-100">
            <h1 className="m-0">PIXEL QUEST</h1>
          </div>

          <div className="section-wrapper welcome-section w-100">
            <Swords color="var(--ruby-red)" size={40} strokeWidth={2.5} className="mb-2" />
            <h2 className="m-0">BIENVENUE, VOYAGEUR !</h2>
            <p className="small m-0">Le labyrinthe t'attend. Mémorise le chemin pour t'échapper sain et sauf!</p>
          </div>

          <div className="bento-row">
            <div className="section-wrapper flex-2">
              <h3 className="m-0 mb-3">CHOISIS TON HÉROS</h3>
              <div className="char-grid">
                <div onClick={() => setHero('LINK')} className={`char-card link-theme ${hero === 'LINK' ? 'selected' : ''}`}>
                  <div className="pixel-char link-pixel"></div>
                </div>
                <div onClick={() => setHero('KIRBY')} className={`char-card kirby-theme ${hero === 'KIRBY' ? 'selected' : ''}`}>
                  <div className="pixel-char kirby-pixel"></div>
                </div>
              </div>
            </div>

            <div className="section-wrapper flex-1">
              <h3 className="m-0 mb-3">DIFFICULTÉ</h3>
              <div className="diff-container-vertical">
                <button className={`diff-btn w-100 ${difficulty === 'EASY' ? 'selected' : ''}`} onClick={() => setDifficulty('EASY')}>EASY</button>
                <button className={`diff-btn w-100 ${difficulty === 'HARD' ? 'selected' : ''}`} onClick={() => setDifficulty('HARD')}>HARD</button>
              </div>
            </div>
          </div>

          <div className="section-wrapper w-100" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
            <button className="start-btn w-100" onClick={startNewGame}>START</button>
          </div>
        </div>
      )}
      
      {status !== 'MENU' && (
        <div className="text-center w-100 d-flex flex-column align-items-center">
          <div className="dungeon-hud">
             <div className="hearts-container">
                {"♥".repeat(lives).padEnd(3, "♡")}
             </div>
             <div>MODE: {difficulty}</div>
             <div>STEP: {userStep - 1}/{pathLength - 1}</div>
          </div>
          
          <div className="black-title-box">
             <h2 className="m-0">{getStatusText()}</h2>
          </div>
          
          <div className="dungeon-frame">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
              {[...Array(gridSize * gridSize)].map((_, i) => {
                const isPassed = status === 'PLAYING' && path.slice(0, userStep).includes(i);
                const isExit = i === path[path.length - 1];
                const isWinPath = status === 'WON' && path.includes(i);

                return (
                  <div key={i} 
                    className={`tile 
                      ${currentTile === i ? 'active' : ''} 
                      ${isPassed ? 'passed-tile' : ''} 
                      ${isExit ? 'exit-tile' : ''} 
                      ${isWinPath ? 'win-path' : ''} 
                      ${i === 0 ? 'start-point' : ''} 
                      ${status === 'LOST' && path[userStep] === i ? 'wrong' : ''}`}
                    onClick={() => handleTileClick(i)}>
                    <AnimatePresence>
                      {((status === 'PLAYING' && path[userStep-1] === i) || (status === 'WON' && i === path[path.length-1])) && (
                        <motion.div layoutId="hero" className={`pixel-char ${hero === 'LINK' ? 'link-pixel' : 'kirby-pixel'}`} />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
          {(status === 'WON' || status === 'LOST') && (
             <button className="start-btn mt-4" style={{fontSize: '1.5rem'}} onClick={() => setStatus('MENU')}>RETOUR</button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;