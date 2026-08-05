"use client";

import Image from "next/image";
import Link from "next/link";
import { Apple, Globe, Eye, EyeOff } from "lucide-react";

import { useState } from "react";



export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-6">
        
        {/* Left Side */}
        <div className="relative hidden h-[780px] w-1/2 overflow-hidden rounded-[32px] lg:block">

          <Image
            src="/images/auth/sign-in.jpg"
            alt="Exepra Lifestyle"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

          <div className="absolute bottom-12 left-12 right-12 text-white">

            <span className="text-sm font-medium uppercase tracking-[0.35em] text-white/80">
              Shop with Exepra
            </span>

            <h1 className="mt-5 text-5xl font-semibold leading-tight">
              Elevate
              <br />
              Everyday Living.
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-white/80">
              Discover carefully curated products designed to elevate your everyday living.
            </p>

          </div>

        </div>

        {/* Right Side */}
        <div className="flex w-full items-center justify-center lg:w-1/2">
          <div className=" flex h-[780px] w-full max-w-[580px] flex-col rounded-[32px] bg-white p-12 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">

            <h2 className="mt-4 text-4xl font-semibold text-slate-900">
              Welcome back
            </h2>

            <p className="mt-4 text-slate-500">
              Sign in to continue your shopping experience.
            </p>

            <form className="mt-10 space-y-6">

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-4
                    text-slate-900
                    outline-none
                    transition
                    focus:border-slate-700
                    focus:ring-4
                    focus:ring-amber-900/10
                  "
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      px-5
                      py-4
                      pr-14
                      text-slate-900
                      outline-none
                      transition
                      focus:border-slate-700
                      focus:ring-4
                      focus:ring-amber-900/10
                    "
                  />

                  <button

                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute
                      right-6
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      transition
                      hover:text-slate-700
                    "
                    >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>

                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-sm font-medium text-slate-900 transition hover:text-yellow-700"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="
                  w-full
                  rounded-2xl
                  bg-yellow-700
                  py-4
                  text-white
                  font-medium
                  shadow-lg
                  shadow-slate-900/10
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-black
                  hover:shadow-xl
                  active:translate-y-0
                "
              >
                Sign In
              </button>

              <div className="my-10 flex items-center">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="px-5 text-sm text-slate-400">
                  or continue with
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="flex items-center justify-center gap-5">
                <button
                  type="button"
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                  "
                >
                  <Image
                    src="/icons/google.svg"
                    alt="Google"
                    width={22}
                    height={22}
                  />
                </button>

                <button
                  type="button"
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                  "
                >
                  <Image
                    src="/icons/apple.svg"
                    alt="Apple"
                    width={22}
                    height={22}
                  />
                </button>

                <button
                  type="button"
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-slate-200
                    bg-white
                  "
                >
                  <Image
                    src="/icons/facebook.svg"
                    alt="Facebook"
                    width={22}
                    height={22}
                  />
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="font-semibold text-slate-900 hover:underline"
              >
                Sign Up
              </Link>
            </p>

          </div>
        </div>
      </div>
    </main>
  );
}