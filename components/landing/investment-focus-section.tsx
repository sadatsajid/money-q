"use client";

import { CheckCircle2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export function InvestmentFocusSection() {
  const features = [
    "Stocks, ETFs, and Mutual Funds",
    "Bangladesh-specific: DPS, Shanchaypatra, Agro Firms",
    "Real estate and gold investments",
    "Track returns, dividends, and rental income",
    "See portfolio performance over time",
  ];

  return (
    <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl sm:text-5xl font-bold">
              Track investments from past savings
            </h2>
            <p className="text-xl text-gray-300">
              Not everyone starts fresh. MoneyQ lets you track investments from savings you had before joining the app.
            </p>
            <ul className="space-y-4">
              {features.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-6 w-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-200">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl blur-3xl opacity-20"
            />
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
              {/* Placeholder for investment screenshot */}
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                <div className="text-center space-y-2">
                  <TrendingUp className="h-16 w-16 text-primary-400 mx-auto" />
                  <p className="text-sm text-gray-400">Investment Portfolio</p>
                  <p className="text-xs text-gray-500">Add screenshot here</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

