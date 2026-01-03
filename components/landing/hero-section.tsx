"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium"
          >
            <Sparkles className="h-4 w-4" />
            AI-Powered Financial Clarity
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight"
          >
            Stop fighting with{" "}
            <span className="text-primary-600">spreadsheets</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-gray-600 leading-relaxed"
          >
            MoneyQ replaces financial anxiety with clarity, giving you a calm, confident view of your future. 
            Built for Bangladesh, powered by AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base">
                Get started for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-6 pt-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white"
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">2.5M+ Users</p>
              <p className="text-sm text-gray-600">Calm control over your money</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
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
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
            {/* Placeholder for dashboard screenshot */}
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center space-y-2">
                <Target className="h-16 w-16 text-primary-500 mx-auto" />
                <p className="text-sm text-gray-500">Dashboard Preview</p>
                <p className="text-xs text-gray-400">Add screenshot here</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

