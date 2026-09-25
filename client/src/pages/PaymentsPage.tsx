import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { CreditCard, Download, CheckCircle2, FileText } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments')
      .then(res => setPayments(res.data.payments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Payments & Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">Transaction history and downloadable GST invoices</p>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold">No Payments Recorded</h3>
            <p className="text-xs text-slate-500">Your completed payment receipts will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.invoiceNumber}</td>
                      <td className="px-4 py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 font-semibold">{p.paymentMethod} ({p.gateway})</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900 text-sm">₹{p.amount}</td>
                      <td className="px-4 py-3">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full text-[11px]">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => alert(`Downloading Invoice PDF: ${p.invoiceNumber}.pdf`)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 inline-flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
