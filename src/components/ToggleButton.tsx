import React, { useState } from 'react';

const ToggleButton: React.FC = () => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    setIsOn(!isOn);
    console.log('Extension is ' + (isOn ? 'Off' : 'On'));
  };

  return (
    <button
      onClick={handleToggle}
      className={`rounded px-4 py-2 ${isOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
    >
      {isOn ? 'On' : 'Off'}
    </button>
  );
};

export default ToggleButton;