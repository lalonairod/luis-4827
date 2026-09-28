import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { BalanceModal } from "../../components/balance-modal/BalanceModal";

import {
  getStoredUser,
  logoutUser,
  updateUserBalance,
} from "../../services/auth/authService";

import type { User } from "../../types/auth/user";

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

const pieColors = [
  "#FFBF00",
  "#FF5252",
];

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

  function handleLogout() {
    logoutUser();

    navigate("/login");
  }

  function handleBalanceSuccess(
    amount: number,
  ) {
    const updatedUser =
      updateUserBalance(amount);

    setUser(updatedUser);
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
          className="secondary-button"
          onClick={handleLogout}
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
          onClick={() =>
            setShowBalanceModal(
              true,
            )
          }
        >
          Cargar saldo
        </button>
      </section>

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
                >
                  {betData.map(
                    (
                      entry,
                      index,
                    ) => (
                      <Cell
                        key={
                          entry.name
                        }
                        fill={
                          pieColors[
                            index %
                              pieColors.length
                          ]
                        }
                      />
                    ),
                  )}
                </Pie>

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