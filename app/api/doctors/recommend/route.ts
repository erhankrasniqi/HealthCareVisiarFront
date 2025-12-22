import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type DoctorRecommendation = {
  id: string;
  fullName: string;
  specialization: string;
  matchScore: number;
  reason: string;
};

// Symptom to specialization mapping
const symptomSpecializationMap: Record<string, string[]> = {
  heart: ["Cardiology", "Internal Medicine"],
  chest: ["Cardiology", "Pulmonology"],
  pain: ["Cardiology", "Orthopedics", "Neurology"],
  breathing: ["Pulmonology", "Cardiology"],
  cough: ["Pulmonology", "Internal Medicine"],
  fever: ["Internal Medicine", "Infectious Disease"],
  headache: ["Neurology", "Internal Medicine"],
  migraine: ["Neurology"],
  back: ["Orthopedics", "Neurology"],
  joint: ["Orthopedics", "Rheumatology"],
  skin: ["Dermatology"],
  rash: ["Dermatology", "Allergology"],
  stomach: ["Gastroenterology", "Internal Medicine"],
  abdominal: ["Gastroenterology", "Surgery"],
  digestive: ["Gastroenterology"],
  child: ["Pediatrics"],
  baby: ["Pediatrics"],
  pregnancy: ["Obstetrics", "Gynecology"],
  mental: ["Psychiatry", "Psychology"],
  anxiety: ["Psychiatry", "Psychology"],
  depression: ["Psychiatry", "Psychology"],
  eye: ["Ophthalmology"],
  vision: ["Ophthalmology"],
  ear: ["Otolaryngology", "ENT"],
  throat: ["Otolaryngology", "ENT"],
  nose: ["Otolaryngology", "ENT"],
  allergy: ["Allergology", "Immunology"],
  diabetes: ["Endocrinology", "Internal Medicine"],
  thyroid: ["Endocrinology"],
  kidney: ["Nephrology", "Urology"],
  urinary: ["Urology", "Nephrology"],
  blood: ["Hematology", "Internal Medicine"],
  cancer: ["Oncology"],
};

function analyzeSymptoms(symptoms: string): Map<string, number> {
  const symptomsLower = symptoms.toLowerCase();
  const specializationScores = new Map<string, number>();

  // Analyze symptoms and score specializations
  for (const [keyword, specializations] of Object.entries(symptomSpecializationMap)) {
    if (symptomsLower.includes(keyword)) {
      specializations.forEach(spec => {
        const currentScore = specializationScores.get(spec) || 0;
        specializationScores.set(spec, currentScore + 1);
      });
    }
  }

  return specializationScores;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { symptoms: string };
    console.log("[api/doctors/recommend] Request body:", body);

    if (!body.symptoms || body.symptoms.trim().length === 0) {
      return NextResponse.json(
        { message: "Symptoms are required" },
        { status: 400 }
      );
    }

    // Get auth token from cookie
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      console.log("[api/doctors/recommend] No auth token found");
      return NextResponse.json({ message: "Unauthorized - No token" }, { status: 401 });
    }

    const backendBase = process.env.NEXT_PUBLIC_API_URL;
    if (!backendBase) {
      return NextResponse.json({ message: "Backend API URL is not configured" }, { status: 500 });
    }

    // Fetch all doctors from lookup
    const upstreamUrl = `${backendBase}/Doctors/lookup`;
    console.log("[api/doctors/recommend] Fetching doctors from:", upstreamUrl);

    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { message: "Failed to fetch doctors" },
        { status: upstream.status }
      );
    }

    const doctors = await upstream.json() as Array<{
      id: string;
      fullName: string;
      specialization: string;
    }>;

    console.log("[api/doctors/recommend] Doctors fetched:", doctors.length);

    // Analyze symptoms and score doctors
    const specializationScores = analyzeSymptoms(body.symptoms);
    
    const recommendations: DoctorRecommendation[] = doctors
      .map(doctor => {
        const score = specializationScores.get(doctor.specialization) || 0;
        let reason = "";
        
        if (score > 0) {
          reason = `Specializes in ${doctor.specialization} which matches your symptoms`;
        } else {
          reason = `General practitioner in ${doctor.specialization}`;
        }

        return {
          id: doctor.id,
          fullName: doctor.fullName,
          specialization: doctor.specialization,
          matchScore: score,
          reason,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5); // Return top 5 matches

    console.log("[api/doctors/recommend] Recommendations:", recommendations);

    // If no matches found, return all doctors as general recommendations
    if (recommendations.every(r => r.matchScore === 0)) {
      return NextResponse.json({
        recommendations: recommendations.slice(0, 3),
        message: "Here are some available doctors. For better recommendations, please describe your symptoms in more detail.",
      });
    }

    return NextResponse.json({
      recommendations: recommendations.filter(r => r.matchScore > 0),
      message: "Based on your symptoms, we recommend these doctors:",
    });
  } catch (e) {
    console.error("[api/doctors/recommend] error:", e);
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
