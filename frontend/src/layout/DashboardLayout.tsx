import { type PropsWithChildren, useState } from "react";

import { FaUserAlt } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import { Link } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import "react-toastify/dist/ReactToastify.css";
import { UserRole } from "../types/user-role";
import { menuSection } from "../shared/menu-section";
import { Burger } from "../shared/ui/Burger";
import useAuth from "../app/hooks/use-auth";
import { AppRoutes } from "../app/routes/routes";
import { getUserRoleLabel } from "../lib/getUserRoleLabel";

export function DashboardLayout({ children }: PropsWithChildren) {
  const { currentUser, logoutUser } = useAuth();

  const [clicked, setClicked] = useState<boolean>(false);
  const handleClick = () => setClicked(!clicked);

  return (
    <div className="flex h-screen w-screen">
      <div className="bg-white hidden md:block h-screen w-62.5 p-5">
        <Link to={AppRoutes.homeAdmin.route()} className="mb-5 text-center cursor-pointer">
          <h2 className="text-5xl text-blue-600 font-lilita">CBJ</h2>
          <p className="text-blue-400 text-sm mt-2 font-semibold">
            Centro Barrial de Juventud
          </p>
        </Link >

        <nav>
          {menuSection.map((section, index) => (
            <section key={index}>
              {section.label.map(
                (label, index) =>
                  (!label.role ||
                    label.role.includes(currentUser?.role as UserRole)) && (
                    <p key={index} className="mt-2 font-bold font-heading">
                      {label.label}
                    </p>
                  ),
              )}
              {section.items.map(
                (item) =>
                  (!item.role ||
                    (currentUser?.role &&
                      item.role.includes(currentUser?.role))) && (
                    <Link
                      to={item.to}
                      className="px-4 w-full flex p-2 justify-start! items-center gap-2 hover:bg-blue-100 transition-colors rounded"
                      key={item.label}
                    >
                      <div>{item.icon && item.icon}</div>
                      <span>{item.label}</span>
                    </Link>
                  ),
              )}
            </section>
          ))}
        </nav>
      </div>
      <div className="flex flex-col h-screen w-full">
        {/* desktop */}
        <header className="bg-white w-full gap-2 hidden md:flex justify-end items-center print:hidden">
          <div>
            <button className="flex items-center gap-2">
              <FaUserAlt />
              {currentUser?.firstName}({getUserRoleLabel(currentUser?.role)})
            </button>
          </div>
          <button
            className="flex items-center cursor-pointer gap-2 p-3 h-full pr-4 rounded hover:bg-gray-200 transition-colors"
            onClick={logoutUser}
          >
            Salir
            <IoIosLogOut />
          </button>
        </header>

        {/* mobile */}
        <header className="border-b-2 shadow-sm md:hidden w-full h-14 flex justify-between items-center p-4  z-100 fixed bg-white">
          <Burger clicked={clicked} handleClick={handleClick} />
          <div>
            <button className="flex items-center gap-2">
              <FaUserAlt />
              {currentUser?.firstName} ({currentUser?.role})
            </button>
          </div>
        </header>
        <div
          className={`${clicked && "activeAdmin"} bgAdmin flex flex-col item md:hidden `}
        >
          {menuSection.map((section, index) => (
            <section key={index}>
              {section.label.map(
                (label, index) =>
                  (!label.role ||
                    label.role.includes(currentUser?.role as UserRole)) && (
                    <p key={index} className="mt-2 font-bold font-heading">
                      {label.label}
                    </p>
                  ),
              )}
              {section.items.map(
                (item) =>
                  (!item.role ||
                    (currentUser?.role &&
                      item.role.includes(currentUser?.role))) && (
                    <Link
                      to={item.to}
                      key={item.label}
                      className="flex items-center gap-2 p-2 hover:bg-gray-500 hover:text-white text-gray-600 hover:font-bold"
                    >
                      {" "}
                      <div>{item.icon && item.icon}</div>
                      <span>{item.label}</span>
                    </Link>
                  ),
              )}
            </section>
          ))}
          <button
            onClick={logoutUser}
            className="flex items-center gap-2 p-2 hover:bg-gray-500 hover:text-white text-gray-600 hover:font-bold"
          >
            <CiLogout />
            Cerrar Sesión
          </button>
        </div>
        <div className="bg-gray-100 w-full min-h-screen flex flex-col mt-14 md:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
