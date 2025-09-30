import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Works from './pages/Works';
import './index.css';

function App() {
  return (
    <Router>
      <div className="font-poppins bg-soft-black text-soft-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/works" element={<Works />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;