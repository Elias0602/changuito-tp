import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";

interface Address {
  id: number;
  alias?: string | null;
  calle: string;
  numero: string;
  piso?: string | null;
  depto?: string | null;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  referencias?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  esPrincipal: boolean;
}

const VACIA = {
  alias: "Casa", calle: "", numero: "", piso: "", depto: "",
  ciudad: "", provincia: "", codigoPostal: "", referencias: "",
  esPrincipal: true,
};

export function Direcciones() {
  const toast = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<any>(VACIA);

  async function cargar() {
    setLoading(true);
    try {
      const data = await api<Address[]>("/addresses");
      setAddresses(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/addresses/${editing}`, { method: "PATCH", body: form });
        toast.success("Dirección actualizada");
      } else {
        await api("/addresses", { method: "POST", body: form });
        toast.success("Dirección guardada");
      }
      setForm(VACIA);
      setEditing(null);
      cargar();
    } catch (e: any) {
      toast.error("Error", e.message);
    }
  }

  async function eliminar(id: number) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    await api(`/addresses/${id}`, { method: "DELETE" });
    toast.info("Dirección eliminada");
    cargar();
  }

  function editar(a: Address) {
    setEditing(a.id);
    setForm({
      alias: a.alias ?? "",
      calle: a.calle,
      numero: a.numero,
      piso: a.piso ?? "",
      depto: a.depto ?? "",
      ciudad: a.ciudad,
      provincia: a.provincia,
      codigoPostal: a.codigoPostal,
      referencias: a.referencias ?? "",
      esPrincipal: a.esPrincipal,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="container-narrow">
      <h2 className="section-title">📍 Mis direcciones de envío</h2>

      <div style={{ background: "white", borderRadius: 6, padding: 24, boxShadow: "var(--ml-shadow)", marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>{editing ? "Editar dirección" : "Nueva dirección"}</h3>

        <form onSubmit={guardar}>
          <div className="form-group">
            <label>Etiqueta (Casa, Trabajo, etc.)</label>
            <input value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} placeholder="Casa" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Calle *</label>
              <input value={form.calle} onChange={(e) => setForm({ ...form, calle: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Número *</label>
              <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Piso</label>
              <input value={form.piso} onChange={(e) => setForm({ ...form, piso: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Depto</label>
              <input value={form.depto} onChange={(e) => setForm({ ...form, depto: e.target.value })} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label>Ciudad *</label>
              <input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Provincia *</label>
              <input value={form.provincia} onChange={(e) => setForm({ ...form, provincia: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>CP *</label>
              <input value={form.codigoPostal} onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label>Referencias (timbre, color de puerta, etc.)</label>
            <input value={form.referencias} onChange={(e) => setForm({ ...form, referencias: e.target.value })} placeholder="Casa amarilla, timbre 3" />
          </div>

          {/*
            TODO MAPA — ACÁ VA EL MÓDULO DE MAPAS
            ------------------------------------------------------------
            El amigo que se encarga de este módulo tiene que:
            1. Instalar leaflet + react-leaflet (gratis, OpenStreetMap)
               o cargar Google Maps JS API con su API key
            2. Mostrar un mapa que reciba la dirección y permita ajustar
               el pin con drag
            3. Guardar las coordenadas en form.latitud y form.longitud
            4. Opcional: geocoding automático (calle+numero -> lat/lng)

            Ejemplo con Leaflet (gratis):
              import { MapContainer, TileLayer, Marker } from "react-leaflet";
              <MapContainer center={[-34.6, -58.4]} zoom={13}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[form.latitud, form.longitud]} draggable
                  eventHandlers={{ dragend: (e) => { ... } }} />
              </MapContainer>
          */}
          <div style={{
            background: "#f5f5f5", borderRadius: 6, padding: 20, margin: "16px 0",
            textAlign: "center", border: "2px dashed #ccc", color: "#888", fontSize: 13
          }}>
            🗺️ <strong>Mapa interactivo</strong><br/>
            <span style={{ fontSize: 12 }}>(módulo en desarrollo — próximamente vas a poder ubicar tu casa en el mapa)</span>
          </div>

          <div className="form-check">
            <input type="checkbox" id="ppal" checked={form.esPrincipal}
              onChange={(e) => setForm({ ...form, esPrincipal: e.target.checked })} />
            <label htmlFor="ppal">Marcar como dirección principal</label>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" className="btn-primary" style={{ maxWidth: 220 }}>
              {editing ? "Guardar cambios" : "Agregar dirección"}
            </button>
            {editing && (
              <button type="button" className="btn-secondary"
                onClick={() => { setEditing(null); setForm(VACIA); }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 style={{ marginBottom: 12 }}>Mis direcciones guardadas</h3>

      {loading ? <div className="spinner" /> : addresses.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">📭</div>
          <p>Todavía no tenés direcciones guardadas</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {addresses.map((a) => (
            <div key={a.id} style={{ background: "white", borderRadius: 6, padding: 16, boxShadow: "var(--ml-shadow)" }}>
              <div className="flex-between">
                <div>
                  <strong>{a.alias || "Sin etiqueta"}</strong>
                  {a.esPrincipal && (
                    <span style={{ marginLeft: 8, background: "var(--ml-green)", color: "white", fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>
                      PRINCIPAL
                    </span>
                  )}
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    {a.calle} {a.numero}{a.piso && `, Piso ${a.piso}`}{a.depto && ` Depto ${a.depto}`}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {a.ciudad}, {a.provincia} ({a.codigoPostal})
                  </div>
                  {a.referencias && (
                    <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                      📝 {a.referencias}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-secondary" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => editar(a)}>
                    Editar
                  </button>
                  <button className="btn-danger" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => eliminar(a.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
