"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { LoaderIcon, LogOut, Menu, X, ChevronDown } from "lucide-react";

import sante1 from "@/public/logo.jpg";
import { auth } from "../firebase/config";
import { useAuth } from "./AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md flex justify-center p-4 shadow-sm z-[60]">
        <LoaderIcon className="animate-spin text-yellow-700" />
      </div>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 shadow-sm">
      <nav className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <Image
            src={sante1}
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full shadow-sm"
          />
          <span className="font-bold text-[8px] md:text-xl tracking-tight text-gray-800">
            POLYTECHNIQUE SAINT LUC TABARRE
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/" label="Accueil" />

          <NavDropdown
            label="Filières"
            items={[
              {
                label: "Informatique bureautique",
                href: "/ourprogram/education",
              },
              { label: "Télécommunications", href: "/ourprogram/health" },
              { label: "Mécanique Auto", href: "/ourprogram/food" },
              { label: "Electrotechnique", href: "/ourprogram/food" },
              { label: "Plomberie & Hydraulique", href: "/ourprogram/food" },
            ]}
          />

          <NavDropdown
            label="Admission"
            items={[
              { label: "Conditions d’admission", href: "/admission-docs" },
              { label: "Procédure d’inscription", href: "/who-we-are" },
            ]}
          />

          <NavDropdown
            label="À propos"
            underline
            items={[
              { label: "Présentation", href: "#getupdate" },
              { label: "Vision", href: "/contact" },
              { label: "Équipe pédagogique", href: "/blog" },
            ]}
          />
        </div>

        {/* AUTH SECTION */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            {user && (
              <p className="text-xs font-medium text-gray-500">{user.email}</p>
            )}
          </div>

          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-gray-600"
            >
              <LogOut size={20} />
            </Button>
          )}

          {/* MOBILE TOGGLE */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 gap-4">
            <Link href="/" className="font-semibold text-gray-800 px-2">
              Accueil
            </Link>
            <Separator />
            <p className="font-bold text-yellow-700 px-2">Filières</p>
            <div className="flex flex-col gap-3 pl-6 text-sm text-gray-600">
              <Link href="/ourprogram/education">Informatique bureautique</Link>
              <Link href="/ourprogram/health">Télécommunications</Link>
              <Link href="/ourprogram/food">Mécanique Auto</Link>
            </div>
            <Separator />
            <p className="font-bold text-yellow-700 px-2">À propos</p>
            <div className="flex flex-col gap-3 pl-6 text-sm text-gray-600 pb-4">
              <Link href="/contact">Vision</Link>
              <Link href="/blog">Équipe</Link>
            </div>
            {user && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// --- SOUS-COMPOSANTS POUR LA PROPRETÉ ---

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}>
      <span className="text-gray-600 hover:text-yellow-700 font-semibold transition-colors cursor-pointer text-sm tracking-wide">
        {label}
      </span>
    </Link>
  );
}

function NavDropdown({
  label,
  items,
  underline,
}: {
  label: string;
  items: { label: string; href: string }[];
  underline?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bouton Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 text-gray-600 hover:text-yellow-700 font-semibold transition-colors outline-none text-sm tracking-wide group
          ${underline ? "underline decoration-yellow-700 underline-offset-4 text-yellow-700" : ""}`}
      >
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-yellow-700" : ""}`}
        />
      </button>

      {/* Contenu du Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-3 w-56 origin-top-left bg-white border border-gray-100 rounded-xl shadow-xl z-[100] animate-in fade-in zoom-in duration-150">
          <div className="p-1">
            {items.map((item, idx) => (
              <React.Fragment key={idx}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
                {idx < items.length - 1 && (
                  <div className="h-[1px] bg-gray-100 my-1 mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
