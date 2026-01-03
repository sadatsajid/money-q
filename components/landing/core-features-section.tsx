"use client";

import { Brain, CheckCircle2, PiggyBank, Target, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "motion/react";

export function CoreFeaturesSection() {
  const features = [
    {
      icon: Target,
      title: "Smart Budgets",
      description: "Set limits that adapt to your life, without the guilt. Get alerts before overspending.",
    },
    {
      icon: Zap,
      title: "Auto-Tracking",
      description: "Recurring expenses automatically added. Subscriptions, EMI, utilities - all tracked.",
    },
    {
      icon: PiggyBank,
      title: "Savings Goals",
      description: "Create buckets for trips, emergencies, investments. Track progress automatically.",
    },
    {
      icon: TrendingUp,
      title: "Investment Tracking",
      description: "Track stocks, bonds, DPS, Shanchaypatra, real estate. See your portfolio grow.",
    },
    {
      icon: CheckCircle2,
      title: "Multi-Currency",
      description: "BDT-first with support for USD, EUR, GBP. Perfect for freelancers and expats.",
    },
    {
      icon: Brain,
      title: "Smart Analytics",
      description: "Beautiful charts and reports. Understand your spending patterns at a glance.",
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
            See everything, without clutter
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete financial management designed for simplicity and clarity
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="border-2 hover:border-primary-200 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
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

