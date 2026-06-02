"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  BookOpen,
  CalendarDays,
  QrCode,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  nombre: string;
  role: string;
}

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/pedidos", icon: ShoppingBag, label: "Pedidos" },
  { href: "/admin/clientes", icon: Users, label: "Clientes" },
  { href: "/admin/secciones", icon: BookOpen, label: "Secciones" },
  { href: "/admin/eventos", icon: CalendarDays, label: "Eventos" },
  { href: "/admin/archivos", icon: FileText, label: "Archivos" },
  { href: "/admin/tickets", icon: MessageSquare, label: "Tickets" },
  { href: "/admin/qr", icon: QrCode, label: "Lector QR" },
];

export default function AdminSidebar({ nombre, role }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* User info */}
      <div className="p-4 border-b border-gray-100">
        {!collapsed && (
          <>
            <p className="font-semibold text-sm truncate">{nombre}</p>
            <p className="text-xs text-gray-400">{role}</p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "text-[var(--color-primary)] bg-purple-50 border-r-2 border-[var(--color-primary)]"
                  : "text-gray-600 hover:text-[var(--color-primary)] hover:bg-gray-50"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="p-4 border-t border-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
