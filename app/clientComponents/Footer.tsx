import React from "react";

function Footer() {
  return (
    <footer className="text-center text-sm text-gray-500 py-4 border-t">
      © {new Date().getFullYear()} Polytechnique St-Luc (développé par Orcel
      Euler)
    </footer>
  );
}

export default Footer;
