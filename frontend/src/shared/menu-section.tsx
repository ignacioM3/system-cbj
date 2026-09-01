import { UserRole } from "../types/user-role";
import { TbBuildings } from "react-icons/tb";
import { AiFillHome } from "react-icons/ai";
import { AppRoutes } from "../app/routes/routes";
import type { JSX } from "react/jsx-runtime";
import { RiCalendarCheckLine, RiTeamFill } from "react-icons/ri";
import { PiChalkboardTeacherDuotone } from "react-icons/pi";
import { FaChildren } from "react-icons/fa6";
import { IoCalendarNumberSharp, IoStatsChartSharp } from "react-icons/io5";
import { GrWorkshop } from "react-icons/gr";

export interface MenuItem {
  label: string;
  icon: JSX.Element;
  to: string;
  role?: UserRole[];
}

export interface MenuLabel {
  label: string;
  role?: UserRole[];
}

export interface MenuSection {
  label: MenuLabel[];
  items: MenuItem[];
}

export const menuSection: MenuSection[] = [
  {
    label: [
      {
        label: "Administración",
        role: [
          UserRole.ADMIN,
          UserRole.COORDINATOR,
          UserRole.EQUIPMENT,
          UserRole.TUTOR,
        ],
      },
    ],
    items: [
      {
        label: "Inicio",
        icon: <AiFillHome />,
        to: AppRoutes.homeAdmin.route(),
      },
      {
        label: "Centros",
        icon: <TbBuildings />,
        to: AppRoutes.locationsList.route(),
      },
         {
        label: "Coordinadores",
        icon: <RiTeamFill />,
        role: [UserRole.ADMIN],
        to: AppRoutes.listUsersCoordinator.route(),
      },
      {
        label: "Tallerista",
        icon: <GrWorkshop />,
        to: AppRoutes.homeAdmin.route(),
      },
      {
        label: "Jovenes",
        icon: <FaChildren />,
        role: [UserRole.ADMIN, UserRole.COORDINATOR, UserRole.EQUIPMENT],
        to: ""
      },
      {
        label: "Asistencias",
        icon: <RiCalendarCheckLine />,
        to: AppRoutes.homeAdmin.route(),
      },
      {
        label: "Talleres",
        icon: <PiChalkboardTeacherDuotone />,
        to: AppRoutes.homeAdmin.route(),
      },
    ],
  },
  {
    label: [
      {
        label: "Planificación",
        role: [UserRole.ADMIN],
      },
    ],
    items: [
      {
        label: "Estadisticas",
        icon: <IoStatsChartSharp />,
        to: "",
        role: [UserRole.ADMIN],
      },
      {
        label: "Eventos",
        icon: <IoCalendarNumberSharp />,
        to: "",
        role: [UserRole.ADMIN],
      },
    ],
  },
];
