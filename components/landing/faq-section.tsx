"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is MoneyQ really free?",
      a: "Yes! MoneyQ is completely free to use with all core features. Track unlimited expenses, income, and get AI insights at no cost.",
    },
    {
      q: "How secure is my financial data?",
      a: "Your data is encrypted and stored securely on Supabase. We never share your information with third parties. You own your data.",
    },
    {
      q: "Can I track investments from before joining MoneyQ?",
      a: "Absolutely! You can add past investments and savings to get a complete picture of your financial portfolio.",
    },
    {
      q: "Does it work for Bangladesh?",
      a: "Yes! MoneyQ is designed for Bangladesh with BDT as the primary currency. It supports local investment types like DPS, Shanchaypatra, and more.",
    },
    {
      q: "How does AI help with my finances?",
      a: "AI automatically categorizes expenses, generates monthly insights, and provides personalized recommendations based on your spending patterns.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-50 py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-6">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-primary-200 transition-colors">
                  <button
                    onClick={() => toggleAccordion(i)}
                    className="w-full p-6 flex items-center justify-between font-semibold text-gray-900 text-left hover:text-primary-700 transition-colors"
                  >
                    <span>{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="ml-4 flex-shrink-0 text-primary-600"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <motion.p
                          initial={{ y: -10 }}
                          animate={{ y: 0 }}
                          exit={{ y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-6 text-gray-600"
                        >
                          {item.a}
                        </motion.p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

