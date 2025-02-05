import React, { useState } from 'react';
import { Sparkles, RotateCw } from 'lucide-react';
import { names } from './data';

const NameSpinner: React.FC = () => {
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinCount, setSpinCount] = useState<number>(0);
  const [showSparkle, setShowSparkle] = useState<boolean>(false);
  const [rollingNames, setRollingNames] = useState<string[]>([]);

  const spin = (): void => {
    setIsSpinning(true);
    setSelectedName(null);
    setShowSparkle(false);
    setSpinCount((prev) => prev + 1);

    let currentIndex = 0;
    const rollInterval = 100; 
    const rollDuration = 3000; 

    const roll = (): void => {

      setRollingNames((prev) => {
        const newNames = [...prev];
        newNames.push(names[currentIndex]);
        if (newNames.length > 5) newNames.shift();
        return newNames;
      });

      currentIndex = (currentIndex + 1) % names.length;
    };

    const intervalId = setInterval(roll, rollInterval);

    setTimeout(() => {
      clearInterval(intervalId);
      setIsSpinning(false);
      const finalIndex = Math.floor(Math.random() * names.length);
      setSelectedName(names[finalIndex]);
      setShowSparkle(true);
      setRollingNames([]); 
    }, rollDuration);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white p-8 rounded-xl w-[350px] shadow-xl text-center transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Name Spinner
        </h1>

        <div className="relative mb-8 h-24 flex items-center justify-center overflow-hidden">
          {isSpinning ? (
            <div className="flex flex-col space-y-2">
              {rollingNames.map((name, index) => (
                <p
                  key={index}
                  className="text-xl font-semibold text-gray-700 animate-roll"
                >
                  {name}
                </p>
              ))}
            </div>
          ) : selectedName ? (
            <div className="relative">
              <p
                className={`text-2xl font-bold transition-all duration-300 ${
                  showSparkle ? 'scale-110' : 'scale-100'
                }`}
              >
                {selectedName}
              </p>
              {showSparkle && (
                <div className="absolute -top-4 -right-4">
                  <Sparkles className="text-yellow-400 animate-pulse" size={24} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-xl font-semibold text-gray-500">Spin to select a name</p>
          )}
        </div>

        <button
          onClick={spin}
          disabled={isSpinning}
          className={`
            group relative px-8 py-3 rounded-full font-semibold text-white
            ${isSpinning ? 'bg-purple-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}
            transform hover:scale-105 transition-all duration-300
            disabled:opacity-70 disabled:cursor-not-allowed
            shadow-lg hover:shadow-xl
          `}
        >
          <span className="flex items-center justify-center gap-2">
            {isSpinning ? (
              <>
                <RotateCw className="animate-spin" size={20} />
                Spinning...
              </>
            ) : (
              <>
                Spin
                <RotateCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              </>
            )}
          </span>
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
        </button>

        <div className="mt-4 text-sm text-gray-500">Spins: {spinCount}</div>
      </div>
    </div>
  );
};

export default NameSpinner;