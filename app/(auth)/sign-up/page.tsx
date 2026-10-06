"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <Image
        src="/images/auth/sign-up-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Premium Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-amber-950/30" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-6 sm:px-8">
        {/* Card */}
        <div className="w-full max-w-[620px] rounded-[28px] border border-white/30 bg-white/95 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9">
          
          {/* Brand */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block text-lg font-bold tracking-[0.28em] text-slate-950 transition hover:opacity-70"
            >
              EXEPRA
            </Link>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[34px]">
              Create your account
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Join Exepra and discover products designed for the way you live.
            </p>
          </div>

          <form className="mt-7 space-y-4">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                required
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  hover:border-slate-300
                  focus:border-slate-900
                  focus:ring-4
                  focus:ring-slate-900/5
                "
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  text-slate-900
                  outline-none
                  transition
                  placeholder:text-slate-400
                  hover:border-slate-300
                  focus:border-slate-900
                  focus:ring-4
                  focus:ring-slate-900/5
                "
              />
            </div>

            {/* Passwords */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    autoComplete="new-password"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3
                      pr-11
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-300
                      focus:border-slate-900
                      focus:ring-4
                      focus:ring-slate-900/5
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-900"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3
                      pr-11
                      text-sm
                      text-slate-900
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-300
                      focus:border-slate-900
                      focus:ring-4
                      focus:ring-slate-900/5
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-900"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 pt-1 text-xs leading-5 text-slate-500">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-yellow-700"
              />

              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-semibold text-slate-900 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {/* CTA */}
            <button
              type="submit"
              className="
                group
                flex
                w-full
                items-center
                justify-center
                rounded-xl
                bg-yellow-700
                py-3.5
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-yellow-900/10
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-slate-950
                hover:shadow-xl
                active:translate-y-0
              "
            >
              Create Account
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                or continue with
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Social */}
            <div className="flex justify-center gap-3">
              {/* Google */}
              <button
                type="button"
                aria-label="Continue with Google"
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  transition-all
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:shadow-md
                "
              >
                <Image
                  src="/icons/google.svg"
                  alt="Google"
                  width={19}
                  height={19}
                />
              </button>

              {/* Apple */}
              <button
                type="button"
                aria-label="Continue with Apple"
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  transition-all
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:shadow-md
                "
              >
                <Image
                  src="/icons/apple.svg"
                  alt="Apple"
                  width={19}
                  height={19}
                />
              </button>

              {/* Facebook */}
              <button
                type="button"
                aria-label="Continue with Facebook"
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-slate-200
                  bg-white
                  transition-all
                  hover:-translate-y-0.5
                  hover:border-slate-300
                  hover:shadow-md
                "
              >
                <Image
                  src="/icons/facebook.svg"
                  alt="Facebook"
                  width={19}
                  height={19}
                />
              </button>
            </div>
          </form>

          {/* Sign In */}
          <p className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-slate-950 transition hover:text-yellow-700"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}