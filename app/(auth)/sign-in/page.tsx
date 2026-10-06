"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-5 py-6 sm:px-8">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.12)] lg:grid-cols-2">

          {/* =========================================================
              LEFT — BRAND / LIFESTYLE
          ========================================================== */}
          <div className="relative hidden min-h-[680px] lg:block">
            <Image
              src="/images/auth/sign-in.jpg"
              alt="Exepra Lifestyle"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />

            {/* Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

            {/* Brand content */}
            <div className="absolute inset-x-10 bottom-10 text-white xl:inset-x-12">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/75">
                Shop with Exepra
              </p>

              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight xl:text-5xl">
                Elevate
                <br />
                Everyday Living.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/75 xl:text-base">
                Discover carefully curated products designed to elevate your
                everyday living.
              </p>
            </div>
          </div>

          {/* =========================================================
              RIGHT — SIGN IN
          ========================================================== */}
          <div className="flex min-h-[680px] items-center justify-center bg-white">
            <div className="w-full max-w-[480px] px-7 py-8 sm:px-10">

              {/* Logo */}
              <div className="text-center">
                <Link
                  href="/"
                  className="inline-block text-lg font-bold tracking-[0.28em] text-slate-950 transition hover:opacity-70"
                >
                  EXEPRA
                </Link>

                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[34px]">
                  Welcome back
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Sign in to continue your shopping experience.
                </p>
              </div>

              {/* Form */}
              <form className="mt-8 space-y-5">

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3.5
                      text-sm
                      text-slate-900
                      placeholder:text-slate-400
                      outline-none
                      transition
                      focus:border-yellow-700
                      focus:ring-4
                      focus:ring-yellow-700/10
                    "
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-medium text-slate-500 transition hover:text-yellow-700"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-4
                        py-3.5
                        pr-12
                        text-sm
                        text-slate-900
                        placeholder:text-slate-400
                        outline-none
                        transition
                        focus:border-yellow-700
                        focus:ring-4
                        focus:ring-yellow-700/10
                      "
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="
                        absolute
                        right-4
                        top-1/2
                        flex
                        -translate-y-1/2
                        items-center
                        justify-center
                        text-slate-400
                        transition
                        hover:text-slate-700
                      "
                    >
                      {showPassword ? (
                        <EyeOff className="h-[18px] w-[18px]" />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                  />
                  Remember me
                </label>

                {/* Sign In */}
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
                  Sign In
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs font-medium text-slate-400">
                    OR CONTINUE WITH
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* Social login */}
                <div className="flex items-center justify-center gap-4">
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
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-slate-300
                      hover:shadow-md
                    "
                  >
                    <Image
                      src="/icons/google.svg"
                      alt="Google"
                      width={20}
                      height={20}
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
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-slate-300
                      hover:shadow-md
                    "
                  >
                    <Image
                      src="/icons/apple.svg"
                      alt="Apple"
                      width={20}
                      height={20}
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
                      duration-300
                      hover:-translate-y-0.5
                      hover:border-slate-300
                      hover:shadow-md
                    "
                  >
                    <Image
                      src="/icons/facebook.svg"
                      alt="Facebook"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </form>

              {/* Sign Up */}
              <p className="mt-6 text-center text-xs text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-semibold text-slate-950 transition hover:text-yellow-700"
                >
                  Create one
                </Link>
              </p>

              {/* Small trust message */}
              <p className="mt-5 text-center text-[11px] text-slate-400">
                Secure access to your Exepra account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}