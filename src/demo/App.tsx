/* eslint no-magic-numbers: 0 */
import React, { useState } from 'react';

import { DashKaleido } from '../lib';

interface AppState {
  value: string;
  label: string;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ value: '', label: 'Type Here' });
  const setProps = (newProps: Partial<AppState>) => {
  setState((prev) => ({ ...prev, ...newProps }));
  };

  return (
  <div>
    <DashKaleido setProps={setProps} {...state} />
  </div>
  );
};

export default App;
