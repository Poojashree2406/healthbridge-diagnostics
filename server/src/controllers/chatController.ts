import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Report } from '../models/Report';

// ─── Medical Knowledge Base ───────────────────────────────────────────────────
const MEDICINE_KB: Record<string, any> = {
  // Diabetes / Blood Sugar
  diabetes: {
    keywords: ['diabetes', 'sugar', 'hba1c', 'glucose', 'blood sugar', 'fasting blood', 'fbs', 'prediabetes', 'insulin'],
    response: {
      heading: '🩸 Blood Sugar & Diabetes Management',
      body: `Based on elevated HbA1c or blood glucose in your reports:

**Common Medicines (prescribed by doctors):**
• **Metformin** (500–1000mg) — First-line oral medication for Type 2 Diabetes. Helps reduce liver glucose production.
• **Glimepiride** (1–4mg) — Stimulates insulin release from the pancreas.
• **Sitagliptin (Januvia)** — DPP-4 inhibitor, reduces blood sugar post-meals.
• **Empagliflozin (Jardiance)** — SGLT2 inhibitor, removes excess sugar via urine, also protects the heart.

**Supplements often recommended:**
• Berberine 500mg · Chromium Picolinate · Bitter Melon Extract · Fenugreek (Methi) seeds

**Lifestyle interventions:**
• Restrict refined carbs (white rice, maida, sugar)
• 30–45 min brisk walk daily
• Monitor fasting glucose daily at home
• Target HbA1c < 7.0%

⚠️ *Please consult your physician before starting any medication.*`
    }
  },

  // Cholesterol / Lipid Profile
  cholesterol: {
    keywords: ['cholesterol', 'ldl', 'hdl', 'triglycerides', 'lipid', 'vldl', 'heart', 'cardiovascular', 'lipid profile'],
    response: {
      heading: '❤️ Cholesterol & Lipid Management',
      body: `For elevated cholesterol or abnormal lipid parameters:

**Common Medicines (prescribed by doctors):**
• **Atorvastatin (Lipitor)** 10–80mg — Reduces LDL ("bad") cholesterol by 35–55%. Most widely prescribed statin.
• **Rosuvastatin (Crestor)** 5–40mg — Potent statin; also raises HDL.
• **Fenofibrate** 145mg — Specifically targets high triglycerides (>200 mg/dL).
• **Ezetimibe** 10mg — Reduces intestinal cholesterol absorption; often combined with statins.
• **Omega-3 Ethyl Esters (Vascepa)** — For very high triglycerides.

**Supplements that help:**
• Fish Oil (EPA/DHA) · Red Yeast Rice · Psyllium husk (Isabgol) · Plant sterols · Niacin (B3)

**Dietary changes:**
• Avoid trans fats and saturated fats
• Increase oats, legumes, nuts, olive oil
• Target: LDL < 100 mg/dL, HDL > 40 mg/dL, TG < 150 mg/dL

⚠️ *Statins require regular liver function monitoring. Consult your cardiologist.*`
    }
  },

  // Thyroid
  thyroid: {
    keywords: ['thyroid', 'tsh', 't3', 't4', 'hypothyroid', 'hyperthyroid', 'thyroxine', 'thyroid profile'],
    response: {
      heading: '🦋 Thyroid Disorder Management',
      body: `For abnormal TSH, T3, or T4 levels in your thyroid profile:

**Hypothyroidism (High TSH / Low T4):**
• **Levothyroxine (Eltroxin, Thyronorm)** 25–150mcg — Synthetic T4 replacement. Take on empty stomach, 30 min before breakfast.
• Common brands in India: Thyronorm, Eltroxin

**Hyperthyroidism (Low TSH / High T3, T4):**
• **Carbimazole (Neomercazole)** 5–20mg — Blocks thyroid hormone production.
• **Propylthiouracil (PTU)** — Alternative antithyroid drug.
• **Propranolol** — For symptom control (palpitations, tremors).

**Supplements:**
• Selenium 200mcg · Magnesium Glycinate · Vitamin D3 (if deficient) · Zinc 30mg

**Monitor regularly:**
• Repeat TSH every 6–8 weeks after starting medication
• Target TSH: 0.5 – 4.5 mIU/L
• Avoid raw cruciferous vegetables (cabbage, broccoli) with hypothyroidism

⚠️ *Thyroid medication doses are highly individual. Regular follow-ups are essential.*`
    }
  },

  // Vitamin D
  vitaminD: {
    keywords: ['vitamin d', 'vit d', 'vitamin d3', '25-hydroxy', 'bone', 'calcium', 'deficiency', 'osteoporosis'],
    response: {
      heading: '☀️ Vitamin D Deficiency Management',
      body: `For low Vitamin D3 (25-OH Vitamin D) levels:

**Normal Range:** 30–100 ng/mL
**Deficiency:** < 20 ng/mL | **Insufficiency:** 20–29 ng/mL

**Supplementation Protocols:**
• **Cholecalciferol (D3) 60,000 IU weekly** × 8–12 weeks (loading dose) — Most common protocol in India.
• **Maintenance:** 1,000–2,000 IU daily or 60,000 IU monthly thereafter.
• Common OTC brands: Uprise D3, Calcirol Sachet, D-Vitol, Vitamin D3 60K sachets

**For better absorption:**
• Take with a fatty meal (D3 is fat-soluble)
• Combine with **Vitamin K2 (MK-7)** 100mcg to direct calcium to bones, not arteries
• **Calcium Citrate** 500mg if dietary calcium is inadequate

**Dietary sources:**
• Fatty fish (salmon, mackerel) · Egg yolks · Fortified milk/cereals
• 15–20 min of morning sunlight (7–10 AM) without sunscreen

**Repeat test** after 3 months of supplementation.

⚠️ *Do not self-supplement above 4,000 IU/day without physician guidance.*`
    }
  },

  // Vitamin B12
  vitaminB12: {
    keywords: ['vitamin b12', 'b12', 'cyanocobalamin', 'cobalamin', 'methylcobalamin', 'b12 deficiency', 'anaemia', 'anemia', 'nerve'],
    response: {
      heading: '💊 Vitamin B12 Deficiency Management',
      body: `For low serum Vitamin B12 (normal: 200–900 pg/mL):

**Oral Supplements:**
• **Methylcobalamin 1500mcg** daily — Active, more bioavailable form. Better for neurological symptoms.
• **Mecobalamin/Cobamamide** — Coenzyme forms for enhanced nerve repair.
• Common brands: Meganeuron, Nurokind Gold, Nervup OD, Methycobal

**Injections (for severe deficiency <100 pg/mL):**
• **Cyanocobalamin 1000mcg IM** — Weekly × 4 weeks, then monthly.
• **Hydroxocobalamin** — Longer acting alternative.

**Combined supplements:**
• B12 + B9 (Folate) + B6 combination for homocysteine control
• Meganeuron OD, Polybion Forte

**Dietary sources:**
• Dairy products, eggs, fish, meat, nutritional yeast
• For vegans/vegetarians: B12-fortified foods are essential

**When to worry:**
• Tingling/numbness in hands and feet — possible nerve damage
• Fatigue, brain fog, pale skin — classic B12 deficiency signs

⚠️ *Vegans and elderly patients are at highest risk. Annual B12 testing recommended.*`
    }
  },

  // Hemoglobin / Anemia
  anemia: {
    keywords: ['hemoglobin', 'haemoglobin', 'anemia', 'anaemia', 'iron', 'rbc', 'blood count', 'cbc', 'ferritin', 'fatigue', 'pale'],
    response: {
      heading: '🩸 Anemia & Low Hemoglobin Management',
      body: `For low hemoglobin (Normal: Men 13–17 g/dL, Women 12–15 g/dL):

**Iron-Deficiency Anemia (most common):**
• **Ferrous Sulphate** 200mg twice daily — Best absorbed on empty stomach.
• **Ferrous Ascorbate** (with Vitamin C) — Better absorption, less GI side effects.
• **Iron Polymaltose Complex (IPC)** — Gentler on stomach; brands: Autrin, Orofer XT, Raricap
• Combination: Iron + Folic Acid (e.g., Autrin, Haem Up)

**Megaloblastic Anemia (B12/Folate deficiency):**
• Methylcobalamin + Folic Acid (see B12 section above)
• Folvite (Folic Acid 5mg) daily

**Dietary iron boosters:**
• Spinach, beetroot, pomegranate, dates, jaggery (gud)
• Eat with Vitamin C (lemon, amla) to enhance absorption
• Avoid tea/coffee within 1 hour of iron supplements

**Target hemoglobin:** > 12 g/dL (women), > 13 g/dL (men)

⚠️ *Iron supplements can cause constipation and dark stools — these are normal side effects.*`
    }
  },

  // Kidney
  kidney: {
    keywords: ['kidney', 'creatinine', 'urea', 'bun', 'uric acid', 'renal', 'kft', 'rft', 'gfr', 'nephro'],
    response: {
      heading: '🫘 Kidney Health & Renal Function',
      body: `For elevated creatinine, urea, or uric acid levels:

**High Uric Acid (Hyperuricemia/Gout):**
• **Allopurinol** 100–300mg — Reduces uric acid production. Long-term use.
• **Febuxostat (Febuget)** 40–80mg — Alternative for allopurinol-intolerant patients.
• **Colchicine** 0.5mg — For acute gout attacks (short course only).
• **Probenecid** — Increases uric acid excretion.
• Target serum uric acid: < 6 mg/dL

**Elevated Creatinine / CKD Management:**
• **ACE Inhibitors** (Ramipril, Enalapril) — Protect kidneys, reduce proteinuria.
• **ARBs** (Telmisartan, Losartan) — Kidney-protective in diabetic nephropathy.
• **Sodium Bicarbonate** — To correct metabolic acidosis in CKD.
• **Erythropoietin injections** — For anemia of CKD.

**Dietary advice for kidney health:**
• Limit protein intake (0.8g/kg body weight if CKD)
• Stay well-hydrated (2–2.5L water/day)
• Reduce sodium, potassium, phosphorus (avoid bananas, oranges if CKD stage 3+)
• Avoid NSAIDs (Ibuprofen, Diclofenac) — they worsen kidney function

⚠️ *Regular nephrology follow-up is essential for CKD management.*`
    }
  },

  // Liver
  liver: {
    keywords: ['liver', 'sgot', 'sgpt', 'alt', 'ast', 'bilirubin', 'alkaline phosphatase', 'lft', 'jaundice', 'hepatitis'],
    response: {
      heading: '🫀 Liver Health & LFT Management',
      body: `For elevated SGPT (ALT), SGOT (AST), or bilirubin levels:

**Liver Protective Supplements:**
• **Silymarin (Milk Thistle)** 140mg — Hepatoprotective, antioxidant. Widely used for NAFLD.
• **Ursodeoxycholic Acid (UDCA/Ursocol)** 300–600mg — For fatty liver and biliary disorders.
• **N-Acetyl Cysteine (NAC)** 600mg — Boosts glutathione, liver detox.
• **Liv 52 (Himalaya)** — Popular Ayurvedic liver support.
• **Phosphatidylcholine** (Essential Phospholipids) — For NASH/NAFLD.

**For Hepatitis B/C:**
• **Tenofovir, Entecavir** — Antiviral for Hepatitis B (requires specialist care)
• **Sofosbuvir-based regimens** — For Hepatitis C (highly effective, 8–12 weeks)

**SGPT/SGOT reduction lifestyle tips:**
• Complete alcohol abstinence — even one drink can worsen levels
• Avoid fatty, fried, processed foods
• Regular exercise reduces hepatic fat
• Avoid paracetamol overuse (>2g/day is hepatotoxic)

**Normal ranges:**
• SGPT (ALT): 7–56 U/L | SGOT (AST): 10–40 U/L | Bilirubin Total: 0.1–1.2 mg/dL

⚠️ *Persistent elevation >3× normal requires urgent gastroenterologist evaluation.*`
    }
  },

  // Blood Pressure
  bloodPressure: {
    keywords: ['blood pressure', 'hypertension', 'bp', 'systolic', 'diastolic', 'antihypertensive'],
    response: {
      heading: '💓 Blood Pressure Management',
      body: `For hypertension or cardiovascular risk management:

**First-line Antihypertensives:**
• **Amlodipine** 5–10mg — Calcium channel blocker; safe, well-tolerated.
• **Telmisartan** 40–80mg — ARB; excellent kidney-protective effect.
• **Ramipril/Enalapril** (ACE inhibitors) — Especially good for diabetic patients.
• **Hydrochlorothiazide (HCTZ)** — Diuretic, often combined with other agents.
• **Metoprolol/Atenolol** — Beta-blockers, especially if heart rate is high.

**Target Blood Pressure:**
• General: < 130/80 mmHg
• Diabetics/CKD: < 125/75 mmHg

**Lifestyle for BP control:**
• DASH diet: fruits, vegetables, low-fat dairy, limit sodium to <2g/day
• Regular aerobic exercise 30 min/day × 5 days/week
• Weight loss (every 1kg lost reduces BP by ~1 mmHg)
• Limit alcohol and quit smoking completely
• Manage stress (yoga, meditation)

⚠️ *Never stop BP medications suddenly — rebound hypertension is dangerous.*`
    }
  },

  // General wellness / greeting
  greeting: {
    keywords: ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good evening', 'help', 'what can you do'],
    response: {
      heading: '👋 Hello! I\'m MedBot — Your HealthBridge AI Assistant',
      body: `I can help you understand your diagnostic test results and suggest general medicine information.

**I can advise about:**
• 🩸 Blood Sugar & Diabetes medicines
• ❤️ Cholesterol & Lipid management  
• 🦋 Thyroid disorder medications
• ☀️ Vitamin D & B12 supplements
• 🩸 Anemia & Hemoglobin correction
• 🫘 Kidney health & uric acid
• 🫀 Liver health & SGPT/SGOT
• 💓 Blood pressure management

**Just ask me things like:**
• *"What medicines help with high cholesterol?"*
• *"My HbA1c is 7.2, what should I take?"*
• *"What are Vitamin D supplements available in India?"*
• *"My report shows high SGPT, what should I do?"*

⚠️ *I provide general health information only. Always consult your doctor before starting any medication.*`
    }
  }
};

// ─── Intent Matcher ───────────────────────────────────────────────────────────
function matchIntent(message: string): any | null {
  const lower = message.toLowerCase();

  for (const [key, entry] of Object.entries(MEDICINE_KB)) {
    if (entry.keywords.some((kw: string) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return null;
}

// ─── Context-Aware Response from Patient Reports ──────────────────────────────
async function getReportContext(patientId: string): Promise<string> {
  try {
    const reports = await Report.find({ patientId })
      .sort({ reportDate: -1 })
      .limit(3)
      .lean() as any[];

    if (!reports.length) return '';

    const abnormal: string[] = [];
    reports.forEach(r => {
      (r.parameters || []).forEach((p: any) => {
        if (p.status === 'HIGH' || p.status === 'LOW' || p.status === 'CRITICAL') {
          abnormal.push(`${p.parameterName} (${p.resultValue} ${p.unit} — ${p.status})`);
        }
      });
    });

    if (!abnormal.length) return '';

    return `\n\n📋 **Based on your latest report abnormalities:** ${abnormal.slice(0, 5).join(', ')}`;
  } catch {
    return '';
  }
}

// ─── Main Chat Handler ────────────────────────────────────────────────────────
export const chatWithMedBot = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const trimmed = message.trim();
    if (trimmed.length > 500) {
      return res.status(400).json({ success: false, message: 'Message too long (max 500 characters)' });
    }

    // Try to match a known medical intent
    const matched = matchIntent(trimmed);

    // Get patient report context if logged in
    let reportContext = '';
    if (req.user?.id) {
      reportContext = await getReportContext(req.user.id);
    }

    if (matched) {
      return res.json({
        success: true,
        response: {
          heading: matched.heading,
          body: matched.body + reportContext,
          type: 'medical_advice'
        }
      });
    }

    // Fallback — general health response
    return res.json({
      success: true,
      response: {
        heading: '🤖 MedBot — HealthBridge AI',
        body: `I understood your query: *"${trimmed}"*

I currently have detailed knowledge on:
• **Diabetes** — HbA1c, blood sugar, Metformin, insulin
• **Cholesterol** — statins, lipid profile, Atorvastatin
• **Thyroid** — TSH, T3, T4, Levothyroxine, Carbimazole
• **Vitamins** — Vitamin D3, Vitamin B12, supplements
• **Anemia** — Hemoglobin, iron supplements, ferritin
• **Kidney** — Creatinine, uric acid, Allopurinol
• **Liver** — SGPT/SGOT, fatty liver, Silymarin
• **Blood Pressure** — Hypertension, Amlodipine, Telmisartan

Try asking: *"What should I take for high LDL cholesterol?"* or *"My HbA1c is 6.8, what medicines help?"*

${reportContext || ''}

⚠️ *All advice is informational only. Please consult your physician before starting any treatment.*`,
        type: 'fallback'
      }
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
