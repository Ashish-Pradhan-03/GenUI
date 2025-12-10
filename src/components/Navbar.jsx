import { User } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

function Navbar() {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between px-6 sm:px-10 md:px-24 h-20 sm:h-24 border-b border-[rgba(255,255,255,0.08)] flex-wrap gap-3 z-50 relative">
      <h3 className="text-2xl font-bold nav-text font-header">GenUI</h3>
      <div className="flex items-center gap-3 sm:gap-4">
        <SignedOut>
          <SignInButton>
            <button className="px-5 py-2.5 rounded-lg font-semibold cursor-pointer transition-all cta-button text-sm" aria-label="Sign in">
              Get Started
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <span className="text-md text-secondary mr-2 font-para">
            Hi, {user?.firstName || user?.username || "User"}
          </span>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}

export default Navbar;