export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-6 py-16">

        <div className="grid gap-10 md:grid-cols-4">

          <div>
            <h2 className="text-3xl font-bold text-white">
              exe<span className="text-blue-500">pra</span>
            </h2>

            <p className="mt-4 text-slate-400">
              Elevate the way you live with carefully curated products for modern lifestyles.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white">Shop</h3>

            <ul className="mt-4 space-y-2">
              <li>Home & Living</li>
              <li>Tech & Gadgets</li>
              <li>Fitness</li>
              <li>Lifestyle</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">Company</h3>

            <ul className="mt-4 space-y-2">
              <li>About</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white">Follow Us</h3>

            <ul className="mt-4 space-y-2">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>X (Twitter)</li>
              <li>TikTok</li>
            </ul>
          </div>

        </div>

        <div className="mt-16 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
          © 2026 Exepra. All rights reserved.
        </div>

      </div>
    </footer>
  );
}