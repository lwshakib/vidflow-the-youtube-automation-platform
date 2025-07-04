"use client";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingTable } from "@clerk/nextjs";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function LandingPage() {
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.hash === "#pricing" && pricingRef.current) {
      const y =
        pricingRef.current.getBoundingClientRect().top +
        window.pageYOffset -
        100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
      {/* Header */}
      <header className="px-8 py-4 flex justify-between items-center border-b border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-md sticky top-0  transition-all">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Instant Reel Logo" className="w-6 h-6" />
          <span className="text-xl font-bold tracking-wide text-zinc-900 dark:text-white drop-shadow-sm">
            Vidflow
          </span>
        </div>
        <div className="flex gap-4">
          <Link href={"/dashboard"}>
            <Button
              variant="outline"
              className="transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white shadow-sm font-semibold px-6 py-2"
            >
              Launch App
            </Button>
          </Link>
          <ModeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center px-6 pt-24 pb-12">
        <h2 className="text-5xl font-bold max-w-4xl text-zinc-900 dark:text-white">
          Automate Your YouTube Shorts with AI-Powered Video Creation
        </h2>

        <p className="text-lg text-zinc-700 dark:text-zinc-300 mt-6 max-w-xl">
          Generate, schedule, and upload viral YouTube Shorts effortlessly with
          our smart automation platform.
        </p>

        <div className="mt-8">
          <Link href={"/dashboard"}>
            <Button size="lg">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* <img
          src="/images/app-preview.png"
          alt="App Preview"
          className="mt-16 rounded-xl shadow-2xl w-full max-w-5xl"
        /> */}
      </main>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        {[
          "AI Script Generator",
          "Voice-to-Video",
          "Trending Topic Finder",
          "Auto Scheduler",
          "SEO Optimization",
          "One-Click Upload",
        ].map((feature, index) => (
          <Card
            key={feature}
            className="bg-white/5 dark:bg-zinc-900 border-none shadow-xl"
          >
            <CardHeader className="flex flex-col items-center">
              <CheckCircle className="text-green-400 mb-4" size={32} />
              <CardTitle className="text-xl font-semibold mb-2 text-center dark:text-white text-zinc-900">
                {feature}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 dark:text-gray-400 text-center">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque,
                ratione.
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-10 text-center text-zinc-900 dark:text-white">
          How It Works
        </h2>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            "Input your idea or topic",
            "AI generates engaging script",
            "Voice-over and video creation",
            "Preview, edit and optimize",
            "Schedule publishing",
            "One-click upload to YouTube",
          ].map((text, index) => (
            <Card
              key={text}
              className="bg-white dark:bg-zinc-900 border shadow-sm"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  Step {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-700 dark:text-gray-300 text-base">
                {text}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 max-w-2xl mx-auto flex flex-col items-center">
        <h2 className="text-4xl font-bold text-center mb-12 text-zinc-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-1"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>
              How does Instant Reel automate YouTube Shorts?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Our platform uses AI to generate scripts, create voice-overs,
                and assemble videos, then schedules and uploads them directly to
                your YouTube channel.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              Can I edit videos before publishing?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Yes! You can preview, edit, and optimize your videos before
                scheduling or uploading.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Is there a free trial?</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Absolutely. Get started for free and explore all core features
                before upgrading.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>What languages are supported?</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                We support English and are working on adding more languages
                soon.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="mt-10 text-center">
          <span className="text-gray-500 dark:text-gray-500">
            Still have questions?
          </span>
          <Button className="ml-3" size="sm" variant="outline">
            Contact Us
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-zinc-900">
        <h2 className="text-3xl font-bold text-center mb-10 text-zinc-900 dark:text-white">
          What Creators Are Saying
        </h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "This tool saved me hours!",
              name: "Alex Kim",
              tag: "YouTuber",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            },
            {
              quote: "My views skyrocketed!",
              name: "Priya Singh",
              tag: "Content Creator",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            },
            {
              quote: "Now I focus only on creativity!",
              name: "Carlos Rivera",
              tag: "Shorts Producer",
              avatar: "https://randomuser.me/api/portraits/men/65.jpg",
            },
          ].map((t, i) => (
            <Card
              key={i}
              className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex flex-col items-center p-6 rounded-xl shadow-sm"
            >
              <img
                src={t.avatar}
                alt={t.name}
                className="w-14 h-14 rounded-full mb-3 object-cover border border-gray-300 dark:border-zinc-600"
              />
              <CardContent className="text-gray-700 dark:text-gray-200 text-center mb-3 text-base font-normal">
                "{t.quote}"
              </CardContent>
              <div className="mt-1 flex flex-col items-center">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  {t.tag}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section
        ref={pricingRef}
        id="pricing"
        className="py-20 px-6 max-w-6xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-zinc-900 dark:text-white">
          Simple, Transparent Pricing
        </h2>
        <PricingTable />
      </section>

      {/* Call to Action */}
      <section className="py-24 text-center relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-green-950 transition-colors">
        {/* Decorative Badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-block px-4 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-semibold shadow-md animate-bounce">
            🚀 New for 2025!
          </span>
        </div>
        <h2 className="text-4xl font-bold mb-3 text-zinc-900 dark:text-white drop-shadow-lg">
          Ready to Go Viral?
        </h2>
        <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-8 max-w-xl mx-auto">
          Join thousands of creators automating their YouTube Shorts workflow.
          Start for free—no credit card required!
        </p>
        <Button
          size="lg"
          className="text-white bg-green-600 hover:bg-green-700 shadow-lg relative animate-pulse focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-all duration-300"
        >
          <span className="relative z-10 flex items-center">
            Join Now for Free <ArrowRight className="ml-2 w-4 h-4" />
          </span>
          {/* Glowing effect */}
          <span
            className="absolute inset-0 rounded-lg bg-green-400 opacity-30 blur-lg animate-ping z-0"
            aria-hidden="true"
          ></span>
        </Button>
        {/* Decorative sparkles */}
        <svg
          className="absolute left-10 top-10 w-12 h-12 opacity-30 text-green-400 animate-spin-slow"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07-1.42 1.42M6.34 17.66l-1.42 1.42m12.02 0-1.42-1.42M6.34 6.34 4.92 4.92"
          />
        </svg>
        <svg
          className="absolute right-10 bottom-10 w-10 h-10 opacity-20 text-green-300 animate-spin-reverse"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </section>

      {/* Footer */}
      <footer className="text-sm text-gray-500 dark:text-gray-400 text-center py-10 border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-bold text-lg dark:text-white text-zinc-900 mb-2">
              Instant Reel
            </span>
            <span className="mb-2">Automate your YouTube Shorts with AI.</span>
            <div className="flex gap-3 mt-2">
              <a href="#" aria-label="Twitter" className="hover:text-blue-400">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.92 4.92 0 0 0 16.616 3c-2.73 0-4.942 2.21-4.942 4.932 0 .386.045.762.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.722-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.237-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-red-500">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a2.993 2.993 0 0 0-2.107-2.117C19.24 3.5 12 3.5 12 3.5s-7.24 0-9.391.569A2.993 2.993 0 0 0 .502 6.186C0 8.338 0 12 0 12s0 3.662.502 5.814a2.993 2.993 0 0 0 2.107 2.117C4.76 20.5 12 20.5 12 20.5s7.24 0 9.391-.569a2.993 2.993 0 0 0 2.107-2.117C24 15.662 24 12 24 12s0-3.662-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="#" aria-label="Email" className="hover:text-green-400">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 13.065 2.4 6.6A2 2 0 0 1 4 4h16a2 2 0 0 1 1.6 2.6l-9.6 6.465zm9.6 1.335-7.68 5.175a2 2 0 0 1-2.4 0L2.4 14.4A2 2 0 0 1 2 13.065V6.935l9.6 6.465 9.6-6.465v6.13a2 2 0 0 1-.4 1.335z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <a
              href="#"
              className="hover:underline dark:text-white text-zinc-900"
            >
              About
            </a>
            <a
              href="#"
              className="hover:underline dark:text-white text-zinc-900"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:underline dark:text-white text-zinc-900"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:underline dark:text-white text-zinc-900"
            >
              Contact
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
          © {new Date().getFullYear()} Instant Reel. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
