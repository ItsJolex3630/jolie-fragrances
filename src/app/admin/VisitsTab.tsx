"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function VisitsTab() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/visits")
      .then(res => res.json())
      .then(data => {
        if (data.visits) setVisits(data.visits);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#b09e80] w-8 h-8" /></div>;

  return (
    <div className="bg-[#111] p-6 rounded border border-white/10 mt-6">
      <h2 className="text-xl font-bold mb-4 text-[#b09e80]">Registro de Visitas Anónimas ({visits.length})</h2>
      <p className="text-gray-400 mb-6 text-sm">Mostrando las últimas 500 interacciones en la plataforma.</p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-[#1a1a1a] text-gray-400">
            <tr>
              <th className="p-3">Fecha y Hora</th>
              <th className="p-3">ID Visitante</th>
              <th className="p-3">Ruta</th>
              <th className="p-3">País</th>
            </tr>
          </thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-3 whitespace-nowrap">{new Date(v.visitedAt).toLocaleString()}</td>
                <td className="p-3 text-xs opacity-70 font-mono">{String(v.visitorId).substring(0, 8)}...</td>
                <td className="p-3 font-mono text-xs">{v.path}</td>
                <td className="p-3">{v.country || "Desconocido"}</td>
              </tr>
            ))}
            {visits.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No hay visitas registradas todavía.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
