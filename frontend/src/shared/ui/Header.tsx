import { useState } from "react";
import { Burger } from "./Burger";
import { Link } from "react-router-dom";
import { AppRoutes } from "../../app/routes/routes";


export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="flex bg-white md:h-auto  justify-between px-3 items-center py-2 shadow-md fixed w-full z-100 top-0 rounded-b-md">
      <Burger handleClick={toggleMenu} clicked={isOpen} />
      <div>

      </div>
      <div className="md:flex gap-2 hidden">
        <Link to="/lecciones" className="p-2 hover:bg-gray-100 rounded-md">
          <span className="font-bold text-gray-500">Ejemplo1</span>
        </Link>
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-md">
          <span className="font-bold text-gray-500">Ejemplo2</span>
        </Link>
        <Link to="" className="p-2 hover:bg-gray-100 rounded-md">
          <span className="font-bold text-gray-500">Ejemplo3</span>
        </Link>
        <Link to="" className="p-2 hover:bg-gray-100 rounded-md">
          <span className="font-bold text-gray-500 ">Ejemplo4</span>
        </Link>
      </div>
      <Link to="/" className="cursor-pointer">
        <img
          src="/images/logo.webp"
          alt="Logo"
          className="w-22.5 h-17.5 bg-cover"
        />
      </Link>
    </header>
  );
}