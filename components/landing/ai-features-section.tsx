"use client";

import { Brain, Sparkles, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";

export function AIFeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "Smart Categorization",
      description: "AI automatically categorizes your expenses with high accuracy. No manual tagging needed.",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      icon: Brain,
      title: "Monthly Insights",
      description: "Detailed financial analysis every month with actionable recommendations to save more.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "AI Chat Assistant",
      description: "Ask anything about your finances. Get instant answers and personalized advice.",
      gradient: "from-amber-500/20 to-orange-500/20",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
  ];

  return (
    <section className="relative bg-primary-50 py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-700 text-white text-sm font-medium mb-6 shadow-lg"
          >
            <Brain className="h-4 w-4" />
            Powered by AI
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-900"
          >
            Your personal financial advisor
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed"
          >
            Get Bangladesh-specific insights and recommendations, tailored to your spending patterns
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full"
              >
                <Card className="group relative bg-white border border-gray-200 hover:border-primary-300 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 h-[280px] flex flex-col">
                <CardContent className="pt-6 pb-8 flex flex-col flex-1">
                  <div className={`h-14 w-14 rounded-xl ${feature.iconBg} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

