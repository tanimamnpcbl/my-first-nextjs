import React, { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebase";
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

const ADMIN_EMAIL = "tanimsirakmcc@gmail.com";

export default function AdminLogin({ onLoginSuccess, onBackToHome }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
      const adminDoc = await getDoc(doc(db, "admin", user.uid));

      if (!adminDoc.exists()) {
        setError(`Admin record is missing. Create Firestore document admin/${user.uid} with email "${ADMIN_EMAIL}" and role "admin".`);
        return;
      }

      const adminData = adminDoc.data();
      if (adminData.role !== "admin" || String(adminData.email ?? "").trim().toLowerCase() !== ADMIN_EMAIL) {
        setError('The Firestore admin record must have this account email and role set to "admin".');
        return;
      }

      onLoginSuccess();
    } catch (authError: any) {
      const code = String(authError?.code ?? "");
      const normalizedCode = code.replace(/^firestore\//, "");
      const message = String(authError?.message ?? "");

      if (normalizedCode === "permission-denied" || message.includes("Missing or insufficient permissions")) {
        setError("Firebase Authentication succeeded, but Firestore blocked the admin record read. Add an owner-only get rule for admin/{uid} from the project's firestore.rules file in the Firebase Console.");
      } else if (["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password", "auth/invalid-email"].includes(code)) {
        setError("Email or password is incorrect. Check the Firebase Authentication account and try again.");
      } else if (code === "auth/operation-not-allowed") {
        setError("Email and password sign-in is disabled. Enable the Email/Password provider in Firebase Authentication.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many sign-in attempts. Wait a while before trying again.");
      } else if (code === "auth/network-request-failed") {
        setError("Could not reach Firebase. Check your internet connection and try again.");
      } else if (code === "auth/unauthorized-domain") {
        setError("This site domain is not authorized for Firebase sign-in. Add the current domain in Firebase Authentication settings.");
      } else if (code === "auth/invalid-api-key") {
        setError("Firebase rejected the web API key. Check that the app is using the correct Firebase project configuration.");
      } else {
        setError(`Sign-in could not be completed (Firebase error: ${code || "unknown"}). Check Firebase Authentication and Firestore setup.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-12 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white text-center">
        <ShieldAlert className="w-10 h-10 mx-auto text-indigo-400 mb-2" />
        <h2 className="text-xl font-bold uppercase tracking-wider">Admin Secure Portal</h2>
        <p className="text-xs text-indigo-200 mt-1">Sign in with an authorized Firebase administrator account.</p>
      </div>

      <div className="p-8">
        {error && (
          <div role="alert" className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-sm font-semibold flex gap-2.5 items-start">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={ADMIN_EMAIL}
                readOnly
                autoCapitalize="none"
                spellCheck={false}
                aria-readonly="true"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-xs font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-950 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign in to Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Firebase email/password authentication</span>
        </div>

        <div className="text-center mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onBackToHome}
            className="text-xs font-bold text-gray-500 hover:text-indigo-600 transition-colors"
          >
            ← Back to Portal Home
          </button>
        </div>
      </div>
    </div>
  );
}
