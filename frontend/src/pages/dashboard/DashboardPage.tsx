import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
  type PieSectorShapeProps,
} from "recharts";

import { BalanceModal } from "../../components/balance-modal/BalanceModal";
import { Loader } from "../../components/loader/Loader";

import {
  getStoredUser,
  logoutUser,
  updateUserBalance,
} from "../../services/auth/authService";

import type { User } from "../../types/auth/user";

/**
 * Tiempo mínimo, en milisegundos, durante el cual
 * se muestra el loader al cerrar sesión.
 */
const LOGOUT_LOADER_MIN_TIME = 450;

/**
 * Datos simulados utilizados para representar
 * el resumen de apuestas ganadas y perdidas.
 */
const betData = [
  {
    name: "Ganadas",
    value: 14,
  },
  {
    name: "Perdidas",
    value: 8,
  },
];

/**
 * Datos simulados utilizados para representar
 * las victorias de cada caracol.
 */
const snailData = [
  {
    name: "Turbo",
    wins: 2,
  },
  {
    name: "Flash",
    wins: 1,
  },
  {
    name: "Shelly",
    wins: 0,
  },
  {
    name: "Rocket",
    wins: 1,
  },
  {
    name: "Gary",
    wins: 1,
  },
  {
    name: "Speedy",
    wins: 1,
  },
];

/**
 * Colores utilizados en la gráfica circular
 * de resultados de apuestas.
 */
const pieColors = [
  "#FFBF00",
  "#FF5252",
];

/**
 * Renderiza cada segmento de la gráfica circular
 * utilizando el color correspondiente.
 *
 * @param props - Propiedades del segmento generado por Recharts.
 * @returns El segmento personalizado de la gráfica.
 */
function renderPieSector(
  props: PieSectorShapeProps,
) {
  return (
    <Sector
      {...props}
      fill={
        pieColors[
        props.index %
        pieColors.length
        ]
      }
    />
  );
}

/**
 * Genera una espera asíncrona durante el tiempo indicado.
 *
 * Se utiliza únicamente para mantener visible el estado
 * de carga durante ciertas transiciones de interfaz.
 *
 * @param milliseconds - Tiempo de espera en milisegundos.
 * @returns Una promesa que se resuelve después del tiempo indicado.
 */
function wait(
  milliseconds: number,
) {
  return new Promise<void>(
    (resolve) => {
      window.setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

/**
 * Página principal mostrada después de iniciar sesión.
 *
 * Presenta:
 * - Información básica del usuario.
 * - Saldo disponible.
 * - Acceso al modal de carga de saldo.
 * - Resumen gráfico de apuestas.
 * - Resultados simulados de carreras.
 * - Flujo de cierre de sesión.
 *
 * @returns El dashboard principal del usuario.
 */
export function DashboardPage() {
  const navigate =
    useNavigate();

  const [user, setUser] =
    useState<User | null>(
      getStoredUser(),
    );

  const [
    showBalanceModal,
    setShowBalanceModal,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [
    balanceSuccessMessage,
    setBalanceSuccessMessage,
  ] = useState("");

  /**
   * Procesa el cierre de sesión del usuario.
   *
   * Elimina la sesión almacenada, muestra un estado
   * de carga durante la transición y redirige al login.
   */
  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      logoutUser();

      await wait(
        LOGOUT_LOADER_MIN_TIME,
      );

      navigate("/login", {
        replace: true,
      });
    } finally {
      setLoggingOut(false);
    }
  }

  /**
 * Actualiza el saldo del usuario después
 * de una transacción aprobada por SnailPay.
 *
 * También informa visualmente al usuario
 * que la operación fue aprobada.
 *
 * @param amount - Monto acreditado al saldo.
 */
  function handleBalanceSuccess(
    amount: number,
  ) {
    const updatedUser =
      updateUserBalance(amount);

    setUser(updatedUser);

    setBalanceSuccessMessage(
      `Operación aprobada por SnailPay. Se acreditaron $${amount.toFixed(
        2,
      )} a tu saldo.`,
    );
  }

  if (loggingOut) {
    return (
      <Loader
        fullScreen
        message="Cerrando sesión..."
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-subtitle">
            Bienvenido
          </p>

          <h1>
            {user.fullName}
          </h1>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          Cerrar sesión
        </button>
      </header>

      <section className="balance-card">
        <div>
          <span>
            Saldo disponible
          </span>

          <strong>
            $
            {user.balance.toFixed(
              2,
            )}
          </strong>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => {
            setBalanceSuccessMessage(
              "",
            );

            setShowBalanceModal(
              true,
            );
          }}
        >
          Cargar saldo
        </button>
      </section>

      {balanceSuccessMessage && (
        <div className="payment-message payment-message-success">
          <span>✓</span>

          <p>
            {balanceSuccessMessage}
          </p>
        </div>
      )}

      <section className="dashboard-grid">
        <article className="card">
          <h2>
            Resultado de apuestas
          </h2>

          <p>
            Resumen simulado de
            apuestas ganadas y
            perdidas.
          </p>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <PieChart>
                <Pie
                  data={betData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={4}
                  shape={renderPieSector}
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card">
          <h2>
            Victorias por caracol
          </h2>

          <p>
            Resultados de las seis
            carreras simuladas del día.
          </p>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height={280}
            >
              <BarChart
                data={snailData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis
                  allowDecimals={
                    false
                  }
                />

                <Tooltip />

                <Bar
                  dataKey="wins"
                  name="Victorias"
                  fill="#FFBF00"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {showBalanceModal && (
        <BalanceModal
          user={user}
          onClose={() =>
            setShowBalanceModal(
              false,
            )
          }
          onSuccess={
            handleBalanceSuccess
          }
        />
      )}
    </main>
  );
}