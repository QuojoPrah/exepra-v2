"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { useState } from "react";



export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Background */}
      <Image
        src="/images/auth/sign-up-bg.jpg"
        alt="Background"
        fill
        priority
        className="object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-amber-900/30 backdrop-blur-[2px]" />


      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">

        {/* Right Side */}
        <div className="flex w-full items-center justify-center lg:w-1/2">
          <div className=" flex w-full max-w-[760px] flex-col rounded-[32px] bg-white/95 backdrop-blur-xl p-14 shadow-[0_35px_90px_rgba(0,0,0,0.25)]">

            <h2 className="mt-4 text-4xl font-semibold text-slate-900">
              Sign Up
            </h2>

            <p className="mt-4 text-slate-500">
              Create your account and enjoy shopping with Exepra.
            </p>

            <form className="mt-10 space-y-6">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    px-5
                    py-[18px]
                    outline-none
                    transition
                    focus:border-slate-900
                    focus:ring-4
                    focus:ring-slate-900/10
                  "
                />
              </div>

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
              <div className="grid gap-6 md:grid-cols-2">
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

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>

                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>

                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 accent-slate-900"
                />

                <span>
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-slate-900 hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-slate-900 hover:underline">
                    Privacy Policy
                  </Link>.
                </span>
              </label>

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
                Create Account
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
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-slate-900 hover:underline"
              >
                Sign In
              </Link>
            </p>

          </div>
        </div>
      </div>
    </main>
  );
}