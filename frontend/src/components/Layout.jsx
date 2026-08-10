import React from "react";
import {
  Home,
  HeartPulse,
  FileText,
  History,
  UserCircle,
  Info,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Layout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Home",
      path: "/home",
      icon: Home,
    },
    {
      name: "Health Assessment",
      path: "/health-assessment",
      icon: HeartPulse,
    },
    {
      name: "Upload Report",
      path: "/upload-report",
      icon: FileText,
    },
    {
      name: "My Assessments",
      path: "/my-assessments",
      icon: History,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserCircle,
    },
    {
      name: "About",
      path: "/about",
      icon: Info,
    },
  ];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================= SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 bottom-0 z-30 w-[230px] bg-white border-r border-slate-200 flex flex-col">

        {/* LOGO */}
        <div className="h-[76px] px-5 flex items-center border-b border-slate-100">
          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <HeartPulse
                size={22}
                className="text-white"
                strokeWidth={2}
              />
            </div>

            <div>
              <h1 className="text-[17px] font-bold text-slate-800">
                VitalSignAI
              </h1>

              <p className="text-[10px] text-slate-400">
                Early health prediction
              </p>
            </div>

          </div>
        </div>


        {/* ================= NAVIGATION ================= */}
        <div className="flex-1 px-3 py-6 overflow-y-auto">

          <p className="px-3 mb-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Explore
          </p>

          <nav className="space-y-1">

            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                  />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}

          </nav>
        </div>


        {/* ================= USER AREA ================= */}
        {/* IMPORTANT:
            No doctor name
            No doctor email
            No specialty
            No user.name
            No user.email
        */}

        <div className="border-t border-slate-100 p-4">

          <div className="flex items-center gap-3 mb-3">

            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <UserCircle
                size={23}
                className="text-blue-600"
                strokeWidth={1.8}
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700">
                My Profile
              </p>

              <p className="text-xs text-slate-400">
                Personal health account
              </p>
            </div>

          </div>


          {/* PROFILE BUTTON */}
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <UserCircle size={17} />

            <span>View Profile</span>
          </button>


          {/* LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut size={17} />

            <span>Sign Out</span>
          </button>

        </div>

      </aside>


      {/* ================= MAIN CONTENT ================= */}

      <main className="ml-[230px] min-h-screen">

        {/* TOP HEADER */}
        <header className="h-[76px] bg-white border-b border-slate-200 flex items-center justify-between px-8">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Early Health Prediction
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Understand your health risks earlier
            </p>
          </div>


          {/* TOP RIGHT PROFILE ICON */}
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition"
          >
            <UserCircle
              size={22}
              className="text-blue-600"
              strokeWidth={1.8}
            />
          </button>

        </header>


        {/* PAGE CONTENT */}
        <section className="p-6 lg:p-8">
          {children}
        </section>

      </main>

    </div>
  );
}