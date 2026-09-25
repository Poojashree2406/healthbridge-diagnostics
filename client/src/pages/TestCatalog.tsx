import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  Search,
  Filter,
  Clock,
  Truck,
  ShieldCheck,
  Star,
  ChevronRight,
  Info,
  Activity,
  Check
} from 'lucide-react';

export const TestCatalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [tests, setTests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const [fastingOnly, setFastingOnly] = useState(false);
  const [homeOnly, setHomeOnly] = useState(false);

  useEffect(() => {
    api.get('/tests/categories').then(res => setCategories(res.data.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentCategory) params.append('category', currentCategory);
    if (currentSearch) params.append('search', currentSearch);
    if (fastingOnly) params.append('fasting', 'true');
    if (homeOnly) params.append('homeCollection', 'true');

    api.get(`/tests?${params.toString()}`)
      .then(res => setTests(res.data.tests || []))
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, [currentCategory, currentSearch, fastingOnly, homeOnly]);

  const handleSearchChange = (val: string) => {
    if (val) searchParams.set('search', val);
    else searchParams.delete('search');
    setSearchParams(searchParams);
  };

  const handleCategorySelect = (slug: string) => {
    if (slug) searchParams.set('category', slug);
    else searchParams.delete('category');
    setSearchParams(searchParams);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Diagnostic Test Discovery</h1>
        <p className="text-slate-500 text-sm mt-1">Search 100+ certified pathology & radiology tests across India</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search tests by name, code, or medical parameter..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold text-slate-700">
            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100">
              <input
                type="checkbox"
                checked={homeOnly}
                onChange={(e) => setHomeOnly(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Home Collection Only</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100">
              <input
                type="checkbox"
                checked={fastingOnly}
                onChange={(e) => setFastingOnly(e.target.checked)}
                className="rounded text-teal-600 focus:ring-teal-500"
              />
              <span>Fasting Required</span>
            </label>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
              !currentCategory ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => handleCategorySelect(c.slug)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                currentCategory === c.slug ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Info className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg">No Diagnostic Tests Found</h3>
          <p className="text-sm text-slate-500 mt-1">Try resetting your category or search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div
              key={test._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-100">
                    {test.categoryId?.name || 'General Pathology'}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{test.rating || 4.9}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-900 text-lg leading-snug mb-1">{test.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{test.description}</p>

                <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Sample Type:</span>
                    <span className="font-semibold text-slate-700">{test.sampleType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Report Turnaround:</span>
                    <span className="font-semibold text-slate-700">{test.turnaroundHours} Hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Fasting:</span>
                    <span className={`font-semibold ${test.fastingRequired ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {test.fastingRequired ? 'Fasting Required' : 'No Fasting Needed'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Price per test</span>
                  <span className="text-2xl font-black text-slate-900">₹{test.price}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/tests/${test._id}`}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => navigate(`/book?testId=${test._id}`)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-teal-600 to-navy-900 hover:from-teal-700 hover:to-slate-900 shadow-md transition-all"
                  >
                    Book Now
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
