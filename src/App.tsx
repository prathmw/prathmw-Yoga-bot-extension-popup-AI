import React from 'react';
import ToggleButton from './components/ToggleButton';

const App: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">AI Assistant</h1>
      <ToggleButton />
    </div>
  );
};

export default App;
