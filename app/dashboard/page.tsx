import PanelLayout from "@/components/PanelLayout";

export default function DashboardPage() {
  return (
    <PanelLayout title="Dashboard">
      <div style={{ padding: 25 }}>
        <h1
          style={{
            fontFamily: "Montserrat",
            color: "#078a92",
            marginBottom: 5,
          }}
        >
          Dashboard Clínico
        </h1>
        <p style={{ color: "#666", marginBottom: 25 }}>
          Estado general de tu centro médico HeyDoctor
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 22,
              borderRadius: 16,
              boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
              borderLeft: "6px solid #07acb5",
            }}
          >
            <h3 style={{ color: "#999", marginBottom: 10 }}>Pacientes totales</h3>
            <p style={{ fontSize: 32, color: "#078a92", margin: 0 }}>0</p>
          </div>
          <div
            style={{
              background: "white",
              padding: 22,
              borderRadius: 16,
              boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
              borderLeft: "6px solid #0bb38a",
            }}
          >
            <h3 style={{ color: "#999", marginBottom: 10 }}>Consultas hoy</h3>
            <p style={{ fontSize: 32, color: "#078a92", margin: 0 }}>0</p>
          </div>
          <div
            style={{
              background: "white",
              padding: 22,
              borderRadius: 16,
              boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
              borderLeft: "6px solid #f2a900",
            }}
          >
            <h3 style={{ color: "#999", marginBottom: 10 }}>Ingresos del mes</h3>
            <p style={{ fontSize: 32, color: "#078a92", margin: 0 }}>$0</p>
          </div>
          <div
            style={{
              background: "white",
              padding: 22,
              borderRadius: 16,
              boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
              borderLeft: "6px solid #df3c3c",
            }}
          >
            <h3 style={{ color: "#999", marginBottom: 10 }}>
              Consultas pendientes
            </h3>
            <p style={{ fontSize: 32, color: "#078a92", margin: 0 }}>0</p>
          </div>
        </div>
        <h2
          style={{
            fontFamily: "Montserrat",
            marginTop: 40,
            color: "#078a92",
          }}
        >
          Actividad Clínica
        </h2>
        <p style={{ marginTop: 20, color: "#666" }}>
          Bienvenido al panel principal de HeyDoctor.
        </p>
      </div>
    </PanelLayout>
  );
}
