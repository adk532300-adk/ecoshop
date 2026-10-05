import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { material, type, weightKg = 0.5, lifespanMonths = 12 } = body;

    let baseScore = 5.0;
    
    // 1. Carbon Footprint Impact (Lower is better, impacts score positively if low)
    let carbonEmissionsPerKg = 5.0; // Default generic material
    if (material?.toLowerCase().includes('bamboo')) carbonEmissionsPerKg = 0.5;
    else if (material?.toLowerCase().includes('cotton')) carbonEmissionsPerKg = 1.2; // organic cotton
    else if (material?.toLowerCase().includes('plastic')) carbonEmissionsPerKg = 6.0;

    const totalCarbon = carbonEmissionsPerKg * weightKg;
    const carbonScore = Math.max(0, 5 - totalCarbon); // Arbitrary scaling

    // 2. Biodegradability / Plastic Savings
    let plasticSavingsScore = 0;
    if (material?.toLowerCase().includes('bamboo') || material?.toLowerCase().includes('cotton')) {
        plasticSavingsScore = 2.5; // High biodegradability
    } else if (material?.toLowerCase().includes('plastic')) {
        plasticSavingsScore = -2.5; // Penalty for plastic
    }

    // 3. Reusability (Water/Resource Conservation over time)
    let reusabilityScore = 0;
    if (type?.toLowerCase().includes('reusable')) {
        // More lifespan = better score
        reusabilityScore = (lifespanMonths / 12) * 1.5;
    } else if (type?.toLowerCase().includes('single-use')) {
        reusabilityScore = -2.0;
    }

    // Combine factors
    let finalScore = baseScore + carbonScore + plasticSavingsScore + Math.min(reusabilityScore, 3.0);

    // Normalize between 1 and 10
    finalScore = Math.max(1, Math.min(10, finalScore));

    return NextResponse.json({ 
        ecoScore: finalScore.toFixed(1),
        metrics: {
            estimatedCarbonKg: totalCarbon.toFixed(2),
            lifespanMonths: lifespanMonths
        }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
