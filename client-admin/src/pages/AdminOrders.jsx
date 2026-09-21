import { useEffect, useState } from "react";
import {
  Package,
  IndianRupee,
  CreditCard,
  Truck,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext.jsx";

const STATUSES = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

const STATUS_COLOR = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-cyan-100 text-cyan-700",
  packed: "bg-amber-100 text-amber-700",
  shipped: "bg-indigo-100 text-indigo-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-slate-200 text-slate-700",
};

export default function AdminOrders() {
  const { adminApi } = useAdminAuth();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");

  function load() {
    adminApi
      .get("/orders", {
        params: filter ? { status: filter } : {},
      })
      .then(({ data }) => setOrders(data.orders));
  }

  useEffect(load, [adminApi, filter]);

  async function updateStatus(id, status) {
    const extra = {};

    if (status === "shipped") {
      extra.courierName =
        window.prompt("Courier Name") || "";
      extra.trackingId =
        window.prompt("Tracking ID") || "";
    }

    await adminApi.patch(
      `/orders/${id}/status`,
      {
        status,
        ...extra,
      }
    );

    load();
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 p-8 text-white shadow-xl">

        <div className="flex items-center gap-4">

          <Package size={36} />

          <div>

            <h1 className="text-3xl font-bold">
              Order Management
            </h1>

            <p className="mt-2 text-white/80">
              Track and manage medicine
              orders in real-time.
            </p>

          </div>

        </div>

      </div>

      {/* Filter */}

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <label className="mb-2 block text-sm font-medium text-slate-600">
          Filter by Status
        </label>

        <select
          className="w-full max-w-xs rounded-xl border border-slate-300 p-3 outline-none transition focus:border-emerald-500"
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
        >
          <option value="">
            All Orders
          </option>

          {STATUSES.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>

      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-slate-50">

              <tr className="text-left text-sm font-semibold text-slate-600">

                <th className="px-6 py-4">
                  Order ID
                </th>

                <th className="px-6 py-4">
                  Patient
                </th>

                <th className="px-6 py-4">
                  Total
                </th>

                <th className="px-6 py-4">
                  Payment
                </th>

                <th className="px-6 py-4">
                  Status
                </th>

                <th className="px-6 py-4">
                  Update
                </th>

              </tr>

            </thead>

            <tbody>

              {orders.map((order) => (

                <tr
                  key={order._id}
                  className="border-t transition hover:bg-slate-50"
                >

                  <td className="px-6 py-5 font-mono text-sm font-semibold">
                    {order.orderNumber}
                  </td>

                  <td className="px-6 py-5">

                    <div className="font-medium">
                      {order.patient?.name}
                    </div>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-1">

                      <IndianRupee size={15} />

                      {order.total}

                    </div>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2">

                      <CreditCard size={16} />

                      <span>

                        {order.paymentMethod}

                      </span>

                    </div>

                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs capitalize">

                      {order.paymentStatus}

                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        STATUS_COLOR[
                          order.status
                        ]
                      }`}
                    >
                      {order.status.replaceAll(
                        "_",
                        " "
                      )}
                    </span>

                  </td>

                  <td className="px-6 py-5">

                    <div className="flex items-center gap-2">

                      <Truck
                        size={16}
                        className="text-slate-400"
                      />

                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatus(
                            order._id,
                            e.target.value
                          )
                        }
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-500"
                      >

                        {STATUSES.map((status) => (

                          <option
                            key={status}
                            value={status}
                          >
                            {status.replaceAll(
                              "_",
                              " "
                            )}
                          </option>

                        ))}

                      </select>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}