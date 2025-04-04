//@ts-ignore
import React from "react";
import useSidebar from "./useSidebar";
import logo from '../../../assets/sidebarIcons/logo.png';
import dasboardIcon from '../../../assets/sidebarIcons/dashboard-icon.svg';
import userIcon from '../../../assets/sidebarIcons/user-icon.svg';
import classroomIcon from '../../../assets/sidebarIcons/classroom-icon.svg';
import areaIcon from '../../../assets/sidebarIcons/book-icon.svg';
import dateIcon from '../../../assets/sidebarIcons/clock-icon.svg';
import colapsarIcon from '../../../assets/sidebarIcons/collapsed-icon-menu.svg';
import sidebarExpand from '../../../assets/sidebarIcons/collapsed-left.svg';
import sidebarCollapse from '../../../assets/sidebarIcons/collapsed-right.svg';
import {PrivateRoutes} from '../../../app/routes/routes';
import "./Sidebar.css"; // Importamos los estilos CSS
import { Link } from "react-router-dom";
import Tooltip from "../toolTip/Tooltip";
import { toolTipsData } from "../../../domain/entities/toolTipsData";

const Sidebar = () => {
  const { isOpen, activeSubmenu, toggleSidebar, toggleSubmenu } = useSidebar();

  return (
    <div className="sidebar-container">
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        
        {/* Botón de Toggle */}
        <div className="toggle-button" onClick={toggleSidebar}>
          <img className="sidebar-icons-option" src={logo} alt="área docente" />
          {isOpen ? (
            <img
              className="sidebar-icons-option"
              src={sidebarCollapse}
              alt="Cerrar sidebar"
            />
          ) : (
            <img
              className="sidebar-icons-option"
              src={sidebarExpand}
              alt="Abrir sidebar"
            />
          )}
        </div>

        {/* Contenedor de Iconos */}
        <div className="icon-container">
          {/* Dashboard */}
          <div className={isOpen ? "icon": "icon-collapse"} >
            <img
              className="sidebar-icons"
              src={dasboardIcon}
              alt="Dashboard"
            />
            {isOpen && <span className="icon-text"><p>Dashboard</p></span>}
            <span className="icon-text"></span>
          </div>

          {/* ---------------------------------------------- */}
          <div className={isOpen ? "icon": "icon-collapse"}
            onClick={() => toggleSubmenu("matricula")}
          >
            <img className="sidebar-icons" src={userIcon} alt="Matrícula" />
            {isOpen && <span className="icon-text"><p>Matricula</p></span>}
            {isOpen && (
              <span className="icon-text">
                <img src={colapsarIcon} alt="Expandir/colapsar"/>
              </span>
            )}
          </div>
          <div className={`submenu ${
              activeSubmenu === "matricula" ? "submenu-active" : ""
            }`}
          >
            <Tooltip text={toolTipsData.PERIODO1} position="right">
              <Link to={`/private/dashboard/${PrivateRoutes.CREATESTUDENT}`} style={{ textDecoration: 'none' }}>
                <p>Período Académico 1</p>
              </Link>
            </Tooltip>
          </div>
          {/* ---------------------------------------------- */}
          <div className={isOpen ? "icon": "icon-collapse"}
            onClick={() => toggleSubmenu("salones")}
          >
            <img className="sidebar-icons" src={classroomIcon} alt="Salones" />
            {isOpen && <span className="icon-text"><p>Salones</p></span>}
            {isOpen && (
              <span className="icon-text">
                <img src={colapsarIcon} alt="Expandir/colapsar" />
              </span>
            )}
          </div>
          <div className={`submenu ${
              activeSubmenu === "salones" ? "submenu-active" : ""
            }`}
          >
            <div className="submenu-item">
              <Tooltip text={toolTipsData.PERIODO1} position="right">
                <Link to={`/private/dashboard/${PrivateRoutes.CLASSROOMS}`} style={{ textDecoration: 'none' }}>
                  <p>Crear un nuevo salón</p>
                </Link>
              </Tooltip>
            </div>
          </div>
          {/* ---------------------------------------------- */}
          <div className={isOpen ? "icon": "icon-collapse"}
            
          >
            <img className="sidebar-icons" src={areaIcon} alt="Configuración" />
            {isOpen && <span className="icon-text">
                  <Tooltip text={toolTipsData.PERIODO1} position="right">
                  <Link to={`/private/dashboard/${PrivateRoutes.AREA}`} style={{ textDecoration: 'none' }}>
                    <p>Asignatura</p>
                  </Link>
                </Tooltip>
              </span>}
            <span className="icon-text"></span>
          </div>
          {/* ---------------------------------------------- */}
          <div className={isOpen ? "icon": "icon-collapse"}
            
          >
            <img className="sidebar-icons" src={dateIcon} alt="Configuración" />
            {isOpen && <span className="icon-text"><p>Fechas</p></span>}
            <span className="icon-text"></span>
          </div>
          {/* ---------------------------------------------- */}
          <div className={isOpen ? "icon": "icon-collapse"}
            onClick={() => toggleSubmenu("periodos")}
          >
            <img className="sidebar-icons" src={userIcon} alt="Periodos" />
            {isOpen && <span className="icon-text"><p>Periodos</p></span>}
            {isOpen && (
              <span className="icon-text">
                <img src={colapsarIcon} alt="Expandir/colapsar" />
              </span>
            )}
          </div>
          <div className={`submenu ${
              activeSubmenu === "periodos" ? "submenu-active" : ""
            }`}
          >
            <div className="submenu-item-link">
            <Tooltip text={toolTipsData.PERIODO1} position="right">
              <Link to={`/private/dashboard/${PrivateRoutes.ACADEMY}/1`} style={{ textDecoration: 'none' }}>
                <p>Período Académico 1</p>
              </Link>
            </Tooltip>
            </div>
            <div className="submenu-item-link">
              <Link to={`/private/dashboard/${PrivateRoutes.ACADEMY}/2`} style={{ textDecoration: 'none' }}>
                <p>Período Académico 2</p>
              </Link>
            </div>
            <div className="submenu-item-link">
              <Link to={`/private/dashboard/${PrivateRoutes.ACADEMY}/3`} style={{ textDecoration: 'none' }}>
                <p>Período Académico 3</p>
              </Link>
            </div>
            <div className="submenu-item-link">
              <Link to={`/private/dashboard/${PrivateRoutes.ACADEMY}/4`} style={{ textDecoration: 'none' }}>
                <p>Período Académico 4</p>
              </Link>
            </div>
          </div>
          {/* ---------------------------------------------- */}
              <Link to={`/private/dashboard/${PrivateRoutes.ACADEMY}`} >
                <div className={isOpen ? "icon": "icon-collapse"}>
                      <img className="sidebar-icons" src={areaIcon} alt="Configuración" />
                      {isOpen && <span className="icon-text"><p>Evaluaciones</p></span>}
                      <span className="icon-text"></span>
                </div>
              </Link>
          {/* ---------------------------------------------- */}
          <Tooltip text={toolTipsData.USER} position="right">
              <Link to={`/private/dashboard/${PrivateRoutes.USER}`} >
                <div className={isOpen ? "icon": "icon-collapse"}>
                      <img className="sidebar-icons" src={areaIcon} alt="Configuración" />
                      {isOpen && <span className="icon-text"><p>Usuarios</p></span>}
                      <span className="icon-text"></span>
                </div>
              </Link>
          </Tooltip>
          {/* ---------------------------------------------- */}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
