import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { SendHorizontalIcon } from "lucide-react";
import Select from "react-select";

function Home() {
  const navigate = useNavigate();

  const options = [
    { value: "html-css-bootstrap", label: "HTML + CSS + Bootstrap" },
    { value: "html-tailwind-js", label: "HTML + Tailwind CSS + JS" },
    { value: "html-css-js", label: "HTML + CSS + JS" },
    { value: "react-tailwind", label: "React JS + Tailwind CSS" },
  ];

  const [framework, setFramework] = useState(options[2]);
  const [prompt, setPrompt] = useState("");

  const samplePrompts = [
    "A landing hero with curved glow and CTA button",
    "A dashboard card grid with gradients and stats",
    "A pricing section with highlighted recommended plan",
  ];

  const [typing, setTyping] = useState(samplePrompts[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const current = samplePrompts[wordIndex % samplePrompts.length];
    const isAtWord = typing === current;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (!isAtWord) {
          setTyping(current.slice(0, typing.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else {
        if (typing.length > 0) {
          setTyping(current.slice(0, typing.length - 1));
        } else {
          setIsDeleting(false);
          setWordIndex((i) => (i + 1) % samplePrompts.length);
        }
      }
    }, isDeleting ? 45 : isAtWord ? 1200 : 80);

    return () => clearTimeout(timeout);
  }, [typing, isDeleting, wordIndex]);

  const themeStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "var(--background-tertiary)",
      borderColor: state.isFocused ? "var(--accent)" : "var(--btn-border)",
      color: "var(--text-primary)",
      minHeight: "44px",
      cursor: "pointer",
      boxShadow: "none",
      zIndex: 2,
    }),
    menuPortal: (base) => ({ ...base, zIndex: 50 }),
    menu: (base) => ({
      ...base,
      backgroundColor: "var(--background-secondary)",
      color: "var(--text-primary)",
      border: "1px solid var(--btn-border)",
      zIndex: 60,
    }),
    singleValue: (base) => ({ ...base, color: "var(--text-primary)" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? "rgba(99,179,255,0.1)"
        : "transparent",
      color: state.isFocused ? "#ffffff" : "var(--text-primary)",
      cursor: "pointer",
      paddingLeft: 16,
      transition: "background-color 0.15s ease, color 0.15s ease",
    }),
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    navigate("/generate", {
      state: {
        prompt,
        frameworkValue: framework.value,
        frameworkLabel: framework.label,
      },
    });
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleGenerate();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bolt-bg"
      style={{ color: "var(--text-primary)" }}
    >
      <Navbar />

      <div className="bolt-arc" aria-hidden="true" />

      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-6 text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
          <span className="hero-text-strong">What will you </span>
          <span className="hero-text-accent">build</span>
          <span className="hero-text-strong"> today?</span>
        </h1>

        <p className="text-secondary text-base sm:text-lg max-w-2xl mb-10">
          Create stunning apps and components by chatting with AI. Pick your
          stack, describe the idea, and we will generate the code and preview
          instantly.
        </p>

        <div className="w-full max-w-3xl glass-panel rounded-2xl p-6 sm:p-7 shadow-2xl">
          <div className="flex flex-col gap-4">
            {/* Framework Dropdown */}
            <div className="text-left">
              <label className="block text-xs uppercase tracking-[0.08em] mb-2 text-secondary">
                Framework
              </label>
              <Select
                inputId="framework-select"
                options={options}
                styles={themeStyles}
                value={framework}
                onChange={setFramework}
                menuPortalTarget={document.body}
              />
            </div>

            <div className="text-left">
              <label className="block text-xs uppercase tracking-[0.08em] mb-2 text-secondary">
                Your idea
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Let's Build ${prompt ? undefined : typing}`}
                className="w-full h-32 sm:h-36 rounded-xl p-4 resize-none font-mono"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--btn-border)",
                }}
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                aria-disabled={!prompt.trim()}
                className={`cta-button px-7 cursor-pointer py-3 rounded-full font-semibold inline-flex items-center justify-center gap-2 text-base ${
                  !prompt.trim() ? "opacity-80" : ""
                }`}
              >
                Build now
                <SendHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
