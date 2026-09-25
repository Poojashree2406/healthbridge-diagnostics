import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Search, Plus, Edit2, Trash2, CheckCircle2, X } from 'lucide-react';

export const AdminTestsPage: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    description: '',
    measures: '',
    whyPerformed: '',
    preparationInstructions: '',
    fastingRequired: false,
    sampleType: 'Whole Blood (EDTA)',
    turnaroundHours: 24,
    price: 499,
    homeCollectionAvailable: true
  });

  const fetchCatalog = () => {
    setLoading(true);
    Promise.all([
      api.get('/tests'),
      api.get('/tests/categories')
    ]).then(([tRes, cRes]) => {
      setTests(tRes.data.tests || []);
      const cats = cRes.data.categories || [];
      setCategories(cats);
      if (cats.length > 0) setFormData(prev => ({ ...prev, categoryId: cats[0]._id }));
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tests', formData);
      alert('New diagnostic test added to catalog!');
      setShowModal(false);
      fetchCatalog();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create test');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm('Deactivate this test from public search catalog?')) return;
    try {
      await api.delete(`/tests/${id}`);
      fetchCatalog();
    } catch (e) {
      alert('Deactivation failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Test Catalog Manager</h1>
            <p className="text-slate-500 text-sm mt-1">Create, update, or deactivate diagnostic pathology tests & prices</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center space-x-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Test</span>
          </button>
        </div>

        {loading ? (
          <div className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Test Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">TAT</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tests.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{t.code}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{t.name}</td>
                    <td className="px-4 py-3"><span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-semibold">{t.categoryId?.name}</span></td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">₹{t.price}</td>
                    <td className="px-4 py-3">{t.turnaroundHours}h</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleDeactivate(t._id)}
                        className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold hover:bg-rose-100"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold text-slate-900">Add New Diagnostic Test</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleCreateTest} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Test Code</label>
                    <input type="text" required placeholder="CBC-02" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Test Name</label>
                    <input type="text" required placeholder="Serum Iron Assay" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 bg-white">
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Description</label>
                  <textarea rows={2} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200"></textarea>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Measures</label>
                    <input type="text" required placeholder="Iron, Ferritin" value={formData.measures} onChange={(e) => setFormData({ ...formData, measures: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Why Performed</label>
                    <input type="text" required placeholder="Screening anemia" value={formData.whyPerformed} onChange={(e) => setFormData({ ...formData, whyPerformed: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Preparation Instructions</label>
                  <input type="text" required placeholder="Fasting recommended" value={formData.preparationInstructions} onChange={(e) => setFormData({ ...formData, preparationInstructions: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Price (₹)</label>
                    <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border border-slate-200" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Turnaround (Hours)</label>
                    <input type="number" required value={formData.turnaroundHours} onChange={(e) => setFormData({ ...formData, turnaroundHours: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border border-slate-200" />
                  </div>
                </div>

                <button type="submit" className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md">
                  Save Test to Catalog
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
