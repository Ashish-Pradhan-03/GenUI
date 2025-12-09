import { useState } from "react";
import { SunDimIcon, User } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

function Navbar() {
  const [isLight, setIsLight] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("light");
    setIsLight(!isLight);
  };

  return (
    <div className="flex items-center justify-between px-6 sm:px-10 md:px-24 h-20 sm:h-24 border-b border-[rgba(255,255,255,0.08)] flex-wrap gap-3 z-50 relative">
      <h3 className="text-2xl font-bold nav-text font-genui">GenUI</h3>
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className="nav-icon cursor-pointer"
          onClick={toggleTheme}
          title="Toggle theme"
        >
          <SunDimIcon className="w-6 h-6" />
        </div>

        <div className="nav-icon flex items-center justify-center">
          <SignedOut>
            <SignInButton>
              <button className="icon-btn cursor-pointer" aria-label="Sign in">
                <User className="w-5 h-5" />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </div>
  );
}

export default Navbar;