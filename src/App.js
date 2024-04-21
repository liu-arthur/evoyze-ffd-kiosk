import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import LandingPageComponent from "./components/LandingPageComponent";
import MainPageComponent from "./components/checkin/MainPageComponent";

import './App.css';

function App() {

  return (
    <div>
      <HashRouter>
        <Routes>
          <Route
            exact
            path="/"
            element={<LandingPageComponent />}
          />
          <Route
            exact
            path="/MainPageComponent"
            element={<MainPageComponent />}
          />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
