import { useEffect, useRef } from "react";

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
  disabled = false,
}: GoogleLoginButtonProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled || !GOOGLE_CLIENT_ID) return;

    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            onSuccess(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "signin_with",
            shape: "rectangular",
          });
        }
      }
    };

    // Check if Google script is loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkGoogle);
        onError?.("Google script failed to load");
      }, 10000);

      return () => {
        clearInterval(checkGoogle);
        clearTimeout(timeout);
      };
    }
  }, [onSuccess, onError, disabled]);

  // Show fallback if no client ID
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="w-full py-3 px-4 border border-red-300 rounded-full bg-red-50 flex items-center justify-center">
        <span className="text-red-500 font-medium text-sm">
          Google Client ID not configured
        </span>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="w-full py-3 px-4 border border-gray-300 rounded-full bg-gray-100 flex items-center justify-center opacity-50 cursor-not-allowed">
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-gray-500 font-medium">Continue with Google</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={googleButtonRef} className="w-full"></div>
    </div>
  );
}
