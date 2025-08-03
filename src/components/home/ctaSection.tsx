import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface CTAButton {
  href: string;
  text: string;
  icon: LucideIcon;
  variant: "primary" | "secondary";
}

interface CTASectionProps {
  title: string;
  description: string;
  buttons: CTAButton[];
}

export function CtaSection({ title, description, buttons }: CTASectionProps) {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto text-center">
        <div className="max-w-3xl mx-auto text-white">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-xl mb-8 text-blue-100">{description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {buttons.map((button, index) => {
              const Icon = button.icon;
              return (
                <Link key={index} href={button.href}>
                  <Button
                    size="lg"
                    variant={
                      button.variant === "primary" ? "secondary" : "outline"
                    }
                    className={
                      button.variant === "primary"
                        ? "bg-white text-blue-600 hover:bg-gray-100"
                        : "border-white bg-transparent text-white hover:bg-white hover:text-blue-600"
                    }
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {button.text}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
