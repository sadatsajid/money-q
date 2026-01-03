"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="grid grid-cols-2 gap-1">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary-500" />
                <div className="h-2.5 w-2.5 rounded-sm bg-primary-400" />
                <div className="h-2.5 w-2.5 rounded-sm bg-primary-400" />
                <div className="h-2.5 w-2.5 rounded-sm bg-primary-500" />
              </div>
              <span className="text-xl font-bold text-white">MoneyQ</span>
            </div>
            <p className="text-sm">
              Smart personal finance management for Bangladesh, powered by AI.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-white">Features</Link></li>
              <li><Link href="/signup" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/signup" className="hover:text-white">Security</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-white">About</Link></li>
              <li><Link href="/signup" className="hover:text-white">Blog</Link></li>
              <li><Link href="/signup" className="hover:text-white">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/signup" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/signup" className="hover:text-white">Contact</Link></li>
              <li><Link href="/signup" className="hover:text-white">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; 2024 MoneyQ. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/signup" className="hover:text-white">Terms</Link>
            <Link href="/signup" className="hover:text-white">Privacy</Link>
            <Link href="/signup" className="hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

