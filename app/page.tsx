"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, Trash2, Power, Save } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type Subscriber = {
  id: number;
  email: string;
  active: boolean;
};

export default function Home() {
  const [emails, setEmails] = useState<Subscriber[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    const { data, error } = await supabase
      .from("subscribers")
      .select("*")
      .eq("active", true);

    if (error) {
      setMessage("Failed to load emails.");
    } else {
      setEmails(data || []);
    }
  };

  const addEmail = async () => {
    const email = newEmail.trim().toLowerCase();

    if (!isValidEmail(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    const { error } = await supabase.from("subscribers").insert([
      {
        email,
        active: true,
      },
    ]);

    if (error) {
      // setMessage("Failed to add email.");
      setMessage(`Failed to add email: ${error.message}`);
      return;
    }

    setNewEmail("");
    setMessage("Email added.");
    fetchEmails();
  };

  const deleteEmail = async (id: number) => {
    const { error } = await supabase
      .from("subscribers")
      .update({ active: false })
      .eq("id", id);

    if (error) {
      setMessage("Failed to remove email.");
      return;
    }

    setMessage("Email removed.");
    fetchEmails();
  };

  const saveSettings = () => {
    setMessage("Settings synced with Supabase.");
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Reddit Stock Email Agent</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage who receives the weekly Reddit hot stock report.
            </p>
          </div>

          <button
            onClick={() => setEnabled(!enabled)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
              enabled ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-700"
            }`}
          >
            <Power size={16} />
            {enabled ? "On" : "Off"}
          </button>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Schedule: every Monday, 9:00 AM Singapore time
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Mail size={16} /> Recipient Emails
          </label>

          <div className="flex gap-2">
            <input
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addEmail()}
              placeholder="Enter email address"
              className="flex-1 rounded-2xl border px-4 py-3 text-sm outline-none"
            />
            <button
              onClick={addEmail}
              className="rounded-2xl bg-slate-900 px-4 text-white"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {emails.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-4 text-center text-sm text-slate-500">
              No email added yet.
            </div>
          ) : (
            emails.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-medium">{item.email}</span>
                <button
                  onClick={() => deleteEmail(item.id)}
                  className="rounded-xl p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))
          )}
        </div>

        {message && (
          <div className="mt-5 rounded-2xl bg-slate-200 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <button
          onClick={saveSettings}
          className="mt-6 flex w-full items-center justify-center rounded-2xl bg-slate-900 py-4 text-white"
        >
          <Save className="mr-2" size={18} /> Save Settings
        </button>
      </div>
    </main>
  );
}