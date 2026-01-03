"use client";

import { motion } from "motion/react";

export function HowItWorksSection() {
  const steps = [
    {
      step: "1",
      title: "Sign Up Free",
      description: "Create your account in seconds. No credit card required.",
    },
    {
      step: "2",
      title: "Add Your Expenses",
      description: "Start tracking manually or let AI categorize for you automatically.",
    },
    {
      step: "3",
      title: "Get Insights",
      description: "Receive personalized recommendations and watch your savings grow.",
    },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Get started in minutes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple setup, powerful results
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="h-16 w-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold"
                >
                  {item.step}
                </motion.div>
                <h3 className="text-2xl font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
              {i < 2 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 + 0.3 }}
                  className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-transparent origin-left"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

