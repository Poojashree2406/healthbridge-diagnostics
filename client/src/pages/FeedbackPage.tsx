import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Home Collection');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/feedback')
      .then(res => setFeedbacks(res.data.feedbacks || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/feedback', {
        bookingId: 'HB-2026-000123',
        rating,
        category,
        comments
      });
      setMsg('Feedback submitted successfully. Thank you for rating our diagnostic service!');
      setComments('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Feedback submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lab Ratings & Feedback</h1>
          <p className="text-slate-500 text-sm mt-1">Rate phlebotomist behavior, waiting time, and report turnaround</p>
        </div>

        {msg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{msg}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Rate Your Recent Diagnostic Booking</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Star Rating</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-xl transition-all ${rating >= star ? 'text-amber-500 bg-amber-50' : 'text-slate-300'}`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Feedback Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Home Collection">Home Collection Service</option>
                <option value="Staff Behavior">Staff & Phlebotomist Behavior</option>
                <option value="Waiting Time">Center Waiting Time</option>
                <option value="Report Turnaround">Report Turnaround Time</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Comments & Reviews</label>
              <textarea
                rows={3}
                required
                placeholder="Share your experience..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
            >
              Submit Feedback
            </button>
          </form>
        </div>

        {/* Existing Ratings */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Verified Patient Reviews</h3>
          <div className="space-y-3">
            {feedbacks.map((f) => (
              <div key={f._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{f.patientName || 'Verified Patient'}</span>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-1">{f.rating}/5</span>
                  </div>
                </div>
                <p className="text-slate-600">{f.comments}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
