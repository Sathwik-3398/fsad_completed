import React, { useState } from "react";
import { useApp } from "../store";
import { Outlet } from "../types";

const Hubs = () => {
  const { outlets, addOutlet } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    serviceArea: "",
    contactNumber: "",
    status: "ACTIVE" as const,
    lat: 0,
    lng: 0
  });

  const handleAddHub = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.address) {
      alert("Please fill required fields");
      return;
    }

    addOutlet({
      name: form.name,
      address: form.address,
      serviceArea: form.serviceArea,
      contactNumber: form.contactNumber,
      status: form.status,
      lat: form.lat,
      lng: form.lng
    });

    // Reset form
    setForm({
      name: "",
      address: "",
      serviceArea: "",
      contactNumber: "",
      status: "ACTIVE",
      lat: 0,
      lng: 0
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Hub Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Hub
        </button>
      </div>

      {/* Add Hub Form */}
      {showForm && (
        <form
          onSubmit={handleAddHub}
          className="bg-white p-6 rounded shadow space-y-4"
        >
          <input
            type="text"
            placeholder="Hub Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            placeholder="Service Area (Pincode/Zone)"
            value={form.serviceArea}
            onChange={(e) =>
              setForm({ ...form, serviceArea: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="Contact Number"
            value={form.contactNumber}
            onChange={(e) =>
              setForm({ ...form, contactNumber: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Save Hub
            </button>
          </div>
        </form>
      )}

      {/* Hub List */}
      {outlets.length === 0 ? (
        <div className="text-gray-500">No hubs found</div>
      ) : (
        <div className="grid gap-4">
          {outlets.map((hub) => (
            <div key={hub.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg">{hub.name}</h3>
              <p className="text-sm text-gray-600">{hub.address}</p>
              <p className="text-sm text-gray-500">
                Area: {hub.serviceArea}
              </p>
              <p className="text-sm text-gray-500">
                Contact: {hub.contactNumber}
              </p>
              <p className="text-xs mt-2">
                Status: <span className={hub.status === 'ACTIVE' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{hub.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hubs;
