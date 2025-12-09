import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Sparkles } from "lucide-react";
import Select from "react-select";

function Home() {
  const navigate = useNavigate();
  const options = [
    { value: "html-css-bootstrap", label: "HTML + CSS + Bootstrap" },
    { value: "html-tailwind-js", label: "HTML + Tailwind CSS + JS" },
    { value: "html-css-js", label: "HTML + CSS + JS" },
    { value: "react-tailwind", label: "React JS + Tailwind CSS" },
  ];

  // use same object from options to avoid mismatch
  const [framework, setFramework] = useState(options[2]);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const setVh = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  const themeStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "var(--background-tertiary)",
      borderColor: state.isFocused ? "var(--accent)" : "var(--btn-border)",
      color: "var(--text-primary)",
      minHeight: "44px",
      cursor: "pointer",
      boxShadow: 'none'
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--background-secondary)",
      color: "var(--text-primary)",
      border: '1px solid var(--btn-border)'
    }),
    singleValue: (base) => ({ ...base, color: "var(--text-primary)" }),
    placeholder: (base) => ({ ...base, color: "var(--text-secondary)" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      color: state.isFocused ? '#ffffff' : 'var(--text-primary)',
      cursor: 'pointer',
      paddingLeft: 12,
      borderLeft: state.isFocused ? `4px solid var(--accent)` : '4px solid transparent'
    }),
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    // pass both value and label so the next page can display them if needed
    navigate("/generate", { state: { prompt, frameworkValue: framework.value, frameworkLabel: framework.label } });
  };

  // submit on Ctrl/Cmd + Enter
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleGenerate();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, var(--background-primary), var(--background-secondary))",
        color: "var(--text-primary)",
      }}
    >
      <Navbar />

      <div className="flex flex-col justify-center items-center flex-1 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary nav-text">AI Component Generator</h1>
        <p className="mb-8 max-w-md text-secondary">
          Create stunning components by chatting with AI.
        </p>

        <div
          className="w-full max-w-2xl rounded-2xl p-6 shadow-xl card"
          style={{
            border: "1px solid var(--btn-border)",
          }}
        >
          <div className="mb-4 text-left">
            <label className="block text-sm mb-2 text-secondary" htmlFor="framework-select">Framework</label>
            <Select
              inputId="framework-select"
              options={options}
              styles={themeStyles}
              value={framework}
              onChange={setFramework}
              aria-label="Framework selector"
              menuPortalTarget={document.body} // optional: avoids clipping inside constrained containers
            />
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., A responsive login form with gradient background..."
            aria-label="Prompt for component generation"
            className="w-full h-40 rounded-xl p-4 resize-none"
            style={{
              background: "var(--background-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--btn-border)",
            }}
          />

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            aria-disabled={!prompt.trim()}
            className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-medium cursor-pointer transition ${!prompt.trim() ? 'opacity-100' : ''}`}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "1px solid transparent",
            }}
            title={prompt.trim() ? "Generate component" : "Enter a prompt to generate"}
          >
            <Sparkles className="w-5 h-5" /> Generate
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
