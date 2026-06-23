import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export function MapaDireccion({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  // Coordenadas iniciales por defecto (por ejemplo, Concordia, Entre Ríos: -31.3929, -58.0201)
  const [position, setPosition] = useState({ lat: -31.3929, lng: -58.0201 });
  const markerRef = useRef<any>(null);

  // Maneja el arrastre del marcador
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
          onLocationSelect(newPos.lat, newPos.lng); // Le pasa las coordenadas al formulario padre
        }
      },
    }),
    [onLocationSelect],
  );

  // Permite que si hacen click en cualquier parte del mapa, el marcador se mueva ahí
  function MapEvents() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div style={{ height: '350px', width: '100%', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer 
        center={[position.lat, position.lng]} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={[position.lat, position.lng]}
          ref={markerRef}
        />
      </MapContainer>
    </div>
  );
}
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
  esPrincipal: true, latitud: -31.3929, longitud: -58.0201
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
      latitud: a.latitud ?? -31.3929,
      longitud: a.longitud ?? -58.0201
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

          <div className="form-group" style={{ margin: "16px 0" }}>
            <label style={{ display: "block", marginBottom: 8 }}>Ubicación exacta en el mapa (Arrastrá el pin o hacé click)</label>
            <MapaDireccion onLocationSelect={(lat, lng) => {
              setForm((prev: any) => ({ ...prev, latitud: lat, longitud: lng }));
            }} />
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