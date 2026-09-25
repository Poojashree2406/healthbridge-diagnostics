import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ServiceMode, PaymentStatus } from '@healthbridge/shared';
import {
  Check,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  Building2,
  Truck,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const BookingWizard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const preselectedTestId = searchParams.get('testId');
  const preselectedMode = searchParams.get('mode') as ServiceMode;

  const [step, setStep] = useState(1);

  // Form State
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);

  const [selectedTestIds, setSelectedTestIds] = useState<string[]>(preselectedTestId ? [preselectedTestId] : []);
  const [serviceMode, setServiceMode] = useState<ServiceMode>(preselectedMode || ServiceMode.HOME_COLLECTION);
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [collectionAddress, setCollectionAddress] = useState('Flat 402, Sunshine Heights, Andheri West, Mumbai');
  const [appointmentDate, setAppointmentDate] = useState('2026-09-03');
  const [timeSlot, setTimeSlot] = useState('');

  const [patientDetails, setPatientDetails] = useState({
    name: user?.name || 'Rajesh Sharma',
    phone: '9876543210',
    email: user?.email || 'patient@example.com',
    age: 38,
    gender: 'MALE' as const
  });

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CREDIT_CARD' | 'NET_BANKING'>('UPI');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch Tests & Centers
  useEffect(() => {
    api.get('/tests').then(res => setAvailableTests(res.data.tests || [])).catch(() => {});
    api.get('/centers').then(res => {
      const cnts = res.data.centers || [];
      setCenters(cnts);
      if (cnts.length > 0) setSelectedCenterId(cnts[0]._id);
    }).catch(() => {});
  }, []);

  // Fetch Slots when center or date changes
  useEffect(() => {
    if (selectedCenterId && appointmentDate) {
      api.get(`/availability?centerId=${selectedCenterId}&date=${appointmentDate}`)
        .then(res => {
          const s = res.data.slots || [];
          setSlots(s);
          if (s.length > 0) setTimeSlot(`${s[0].startTime} - ${s[0].endTime}`);
        })
        .catch(() => setSlots([]));
    }
  }, [selectedCenterId, appointmentDate]);

  // Pricing calculations
  const selectedTestsObjects = availableTests.filter(t => selectedTestIds.includes(t._id));
  const subtotal = selectedTestsObjects.reduce((acc, curr) => acc + curr.price, 0);
  const collectionFee = serviceMode === ServiceMode.HOME_COLLECTION ? 150 : 0;
  const discount = selectedTestIds.length > 1 ? Math.round(subtotal * 0.15) : 0;
  const payableAmount = subtotal - discount + collectionFee;

  const toggleTestSelection = (id: string) => {
    if (selectedTestIds.includes(id)) {
      if (selectedTestIds.length > 1) {
        setSelectedTestIds(selectedTestIds.filter(t => t !== id));
      }
    } else {
      setSelectedTestIds([...selectedTestIds, id]);
    }
  };

  const handleConfirmAndPay = async () => {
    setError('');
    setSubmitting(true);

    try {
      // 1. Create Booking
      const bookingRes = await api.post('/bookings', {
        testIds: selectedTestIds,
        centerId: selectedCenterId,
        serviceMode,
        collectionAddress: serviceMode === ServiceMode.HOME_COLLECTION ? collectionAddress : undefined,
        appointmentDate,
        timeSlot,
        patientDetails
      });

      const newBooking = bookingRes.data.booking;

      // 2. Process Mock Payment
      const payRes = await api.post('/payments/create', {
        bookingId: newBooking._id,
        paymentMethod,
        amount: payableAmount
      });

      setBookingResult({
        booking: newBooking,
        payment: payRes.data.payment,
        invoice: payRes.data.invoice
      });

      setStep(6); // Confirmation Step
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking process failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        
        {/* Wizard Progress Stepper */}
        {step < 6 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-3">
              <span className={step >= 1 ? 'text-teal-600' : ''}>1. Select Tests</span>
              <span className={step >= 2 ? 'text-teal-600' : ''}>2. Mode & Slot</span>
              <span className={step >= 3 ? 'text-teal-600' : ''}>3. Patient Info</span>
              <span className={step >= 4 ? 'text-teal-600' : ''}>4. Review</span>
              <span className={step >= 5 ? 'text-teal-600' : ''}>5. Payment</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* STEP 1: Select Tests */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Step 1: Select Diagnostic Tests</h2>
              <p className="text-xs text-slate-500 mt-1">Choose one or more pathology tests for your appointment</p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {availableTests.map((t) => {
                const isSelected = selectedTestIds.includes(t._id);
                return (
                  <div
                    key={t._id}
                    onClick={() => toggleTestSelection(t._id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${isSelected ? 'bg-teal-600' : 'border border-slate-300'}`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                        <p className="text-xs text-slate-500">Sample: {t.sampleType} • TAT: {t.turnaroundHours}h</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 text-base">₹{t.price}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                disabled={selectedTestIds.length === 0}
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-navy-900 hover:from-teal-700 text-white font-extrabold text-sm shadow-md flex items-center space-x-2"
              >
                <span>Continue to Service Mode</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Service Mode & Slot */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Step 2: Service Mode & Appointment Slot</h2>
              <p className="text-xs text-slate-500 mt-1">Select home collection or diagnostic center visit</p>
            </div>

            {/* Service Mode Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setServiceMode(ServiceMode.HOME_COLLECTION)}
                className={`p-5 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                  serviceMode === ServiceMode.HOME_COLLECTION
                    ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Truck className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Home Collection</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Phlebotomist collects sample at your address (+₹150)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setServiceMode(ServiceMode.DIAGNOSTIC_CENTER)}
                className={`p-5 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                  serviceMode === ServiceMode.DIAGNOSTIC_CENTER
                    ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-6 h-6 text-slate-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Center Visit</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Visit certified center at scheduled slot (Free)</p>
                </div>
              </button>
            </div>

            {/* Address Field if Home Collection */}
            {serviceMode === ServiceMode.HOME_COLLECTION && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Collection Address</label>
                <textarea
                  rows={2}
                  value={collectionAddress}
                  onChange={(e) => setCollectionAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                ></textarea>
              </div>
            )}

            {/* Select Center */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Diagnostic Center</label>
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-teal-500"
              >
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.address.city})</option>
                ))}
              </select>
            </div>

            {/* Select Date & Time Slot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Available Time Slot</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="07:00 - 08:00 AM">07:00 - 08:00 AM (Available)</option>
                  <option value="08:00 - 09:00 AM">08:00 - 09:00 AM (Available)</option>
                  <option value="09:00 - 10:00 AM">09:00 - 10:00 AM (Available)</option>
                  <option value="10:00 - 11:00 AM">10:00 - 11:00 AM (Available)</option>
                  <option value="11:00 - 12:00 PM">11:00 - 12:00 PM (Available)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-navy-900 hover:from-teal-700 text-white font-extrabold text-sm shadow-md flex items-center space-x-2"
              >
                <span>Continue to Patient Details</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Patient Details */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Step 3: Patient Information</h2>
              <p className="text-xs text-slate-500 mt-1">Enter patient details printed on the official lab report</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Patient Name</label>
                <input
                  type="text"
                  value={patientDetails.name}
                  onChange={(e) => setPatientDetails({ ...patientDetails, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={patientDetails.phone}
                  onChange={(e) => setPatientDetails({ ...patientDetails, phone: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={patientDetails.email}
                  onChange={(e) => setPatientDetails({ ...patientDetails, email: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={patientDetails.age}
                    onChange={(e) => setPatientDetails({ ...patientDetails, age: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={patientDetails.gender}
                    onChange={(e) => setPatientDetails({ ...patientDetails, gender: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-navy-900 hover:from-teal-700 text-white font-extrabold text-sm shadow-md flex items-center space-x-2"
              >
                <span>Review Order Summary</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review Summary */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Step 4: Order & Transparent Pricing Summary</h2>
              <p className="text-xs text-slate-500 mt-1">Review your diagnostic package details before proceeding to payment</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between font-bold text-slate-800 text-sm pb-2 border-b border-slate-200">
                <span>Selected Tests ({selectedTestsObjects.length})</span>
                <span>Subtotal</span>
              </div>
              {selectedTestsObjects.map((t) => (
                <div key={t._id} className="flex justify-between text-slate-600">
                  <span>{t.name}</span>
                  <span className="font-semibold text-slate-800">₹{t.price}</span>
                </div>
              ))}

              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Collection Mode: {serviceMode.replace('_', ' ')}</span>
                  <span>+₹{collectionFee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Bundle Discount (15%)</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-black text-lg pt-2 border-t border-slate-300">
                  <span>Total Payable Amount</span>
                  <span className="text-teal-600">₹{payableAmount}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
              <div>
                <span className="font-bold text-slate-800 block">Patient:</span>
                {patientDetails.name} ({patientDetails.age} yrs, {patientDetails.gender})
              </div>
              <div>
                <span className="font-bold text-slate-800 block">Appointment Slot:</span>
                {appointmentDate} ({timeSlot})
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-navy-900 hover:from-teal-700 text-white font-extrabold text-sm shadow-md flex items-center space-x-2"
              >
                <span>Proceed to Payment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Payment Gateway */}
        {step === 5 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Step 5: Secure Payment</h2>
              <p className="text-xs text-slate-500 mt-1">Select payment method (Mock Gateway Mode)</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {['UPI', 'CREDIT_CARD', 'NET_BANKING'].map((method) => (
                <label
                  key={method}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === method
                      ? 'border-teal-500 bg-teal-50/50 ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method as any)}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span className="font-bold text-slate-800 text-sm">
                      {method === 'UPI' && 'Google Pay / PhonePe / Paytm UPI'}
                      {method === 'CREDIT_CARD' && 'Credit or Debit Card'}
                      {method === 'NET_BANKING' && 'Net Banking (All Indian Banks)'}
                    </span>
                  </div>
                  <CreditCard className="w-5 h-5 text-slate-400" />
                </label>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Amount to Pay</span>
                <span className="text-2xl font-black text-teal-400">₹{payableAmount}</span>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmAndPay}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 text-white font-extrabold text-sm shadow-md transition-all flex items-center space-x-2"
              >
                {submitting ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Pay ₹{payableAmount} Now</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Booking Confirmation */}
        {step === 6 && bookingResult && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                Booking Confirmed
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-2">
                Booking ID: {bookingResult.booking.bookingId}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                An confirmation notification has been dispatched to {bookingResult.booking.patientDetails?.email}
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 text-left max-w-md mx-auto space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400">Patient:</span>
                <span className="font-bold text-slate-800">{bookingResult.booking.patientDetails?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400">Appointment Date:</span>
                <span className="font-bold text-slate-800">{bookingResult.booking.appointmentDate} ({bookingResult.booking.timeSlot})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400">Payment Status:</span>
                <span className="font-bold text-emerald-600">PAID (₹{bookingResult.booking.payableAmount})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice Number:</span>
                <span className="font-bold text-slate-800">{bookingResult.invoice?.invoiceNumber}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to={`/journey/${bookingResult.booking._id}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-navy-900 text-white font-extrabold text-sm shadow-md hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span>Track Diagnostic Journey Live</span>
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50"
              >
                Go to Patient Dashboard
              </Link>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
