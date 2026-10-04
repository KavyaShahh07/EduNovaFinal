/**
 * EduNova Game Arena — Dynamic Content & Curriculum Synthesizer
 * Generates endless, curriculum-aligned, mathematically and scientifically
 * accurate challenges on the fly across disciplines.
 */

import { gameService } from '../../services/gameService';

export class DynamicGameContentGenerator {
  /**
   * Generate an endless stream of dynamic Math challenges
   * (Percentages, Arithmetic, Algebra, Ratios, Powers & Roots)
   */
  static generateMathChallenge(difficulty = 'MEDIUM') {
    const types = ['PERCENTAGE', 'ARITHMETIC', 'ALGEBRA', 'RATIO', 'POWER'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    let equation = '';
    let answer = 0;

    if (chosenType === 'PERCENTAGE') {
      const percents = [10, 15, 20, 25, 30, 40, 50, 75];
      const bases = [80, 120, 150, 200, 240, 300, 400, 500, 600];
      const p = percents[Math.floor(Math.random() * percents.length)];
      const b = bases[Math.floor(Math.random() * bases.length)];
      answer = Math.round((p / 100) * b);
      equation = `${p}% of ${b}`;
    } else if (chosenType === 'ARITHMETIC') {
      const a = Math.floor(Math.random() * 18) + 12;
      const b = Math.floor(Math.random() * 15) + 11;
      answer = a * b;
      equation = `${a} × ${b}`;
    } else if (chosenType === 'ALGEBRA') {
      const a = Math.floor(Math.random() * 5) + 2;
      const x = Math.floor(Math.random() * 12) + 3;
      const b = Math.floor(Math.random() * 15) + 5;
      const c = a * x + b;
      answer = x;
      equation = `Solve: ${a}x + ${b} = ${c}; x = ?`;
    } else if (chosenType === 'RATIO') {
      const r1 = Math.floor(Math.random() * 4) + 2;
      const r2 = Math.floor(Math.random() * 5) + 3;
      const multiplier = Math.floor(Math.random() * 6) + 4;
      const a = r1 * multiplier;
      const x = r2 * multiplier;
      answer = x;
      equation = `Ratio ${r1}:${r2} = ${a}:x; x = ?`;
    } else {
      const bases = [3, 4, 5, 6, 7, 8, 9, 12, 14, 15];
      const n = bases[Math.floor(Math.random() * bases.length)];
      answer = n;
      equation = `Square root of ${n * n}`;
    }

    // Generate 3 plausible numeric distractors
    const optionsSet = new Set([String(answer)]);
    const deltas = [-10, 10, -5, 5, -2, 2, -1, 1, -12, 12];
    for (const d of deltas) {
      if (optionsSet.size >= 4) break;
      const candidate = answer + d;
      if (candidate > 0 && candidate !== answer) {
        optionsSet.add(String(candidate));
      }
    }
    while (optionsSet.size < 4) {
      optionsSet.add(String(answer + optionsSet.size * 3));
    }

    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    return {
      equation,
      answer: String(answer),
      options,
      type: chosenType
    };
  }

  /**
   * Generate dynamic Pattern Recognition series
   */
  static generatePatternChallenge() {
    const types = ['FIBONACCI', 'GEOMETRIC', 'ARITHMETIC_STEP', 'SQUARES', 'CUBES'];
    const chosen = types[Math.floor(Math.random() * types.length)];

    let display = [];
    let answer = 0;
    let rule = '';

    if (chosen === 'GEOMETRIC') {
      const r = Math.floor(Math.random() * 2) + 2; // 2 or 3
      const start = Math.floor(Math.random() * 3) + 2;
      const series = [start, start * r, start * r * r, start * r * r * r];
      answer = start * Math.pow(r, 4);
      display = [...series.map(String), '?'];
      rule = `Common ratio r = ${r} (${series[3]} × ${r} = ${answer}).`;
    } else if (chosen === 'ARITHMETIC_STEP') {
      const step = Math.floor(Math.random() * 7) + 4;
      const start = Math.floor(Math.random() * 10) + 3;
      const series = [start, start + step, start + 2 * step, start + 3 * step];
      answer = start + 4 * step;
      display = [...series.map(String), '?'];
      rule = `Constant common difference d = +${step}.`;
    } else if (chosen === 'SQUARES') {
      const start = Math.floor(Math.random() * 3) + 2;
      const series = [start * start, (start + 1) * (start + 1), (start + 2) * (start + 2), (start + 3) * (start + 3)];
      answer = (start + 4) * (start + 4);
      display = [...series.map(String), '?'];
      rule = `Consecutive integer squares (${start + 4}² = ${answer}).`;
    } else {
      const a = Math.floor(Math.random() * 3) + 2;
      const b = Math.floor(Math.random() * 3) + 3;
      const series = [a, b, a + b, b + (a + b), (a + b) + (b + a + b)];
      answer = series[3] + series[4];
      display = [...series.map(String), '?'];
      rule = `Fibonacci additive sequence (${series[3]} + ${series[4]} = ${answer}).`;
    }

    const optionsSet = new Set([String(answer)]);
    const offsets = [-2, 2, -4, 4, -1, 1, 5, -5];
    for (const off of offsets) {
      if (optionsSet.size >= 4) break;
      const val = answer + off;
      if (val > 0) optionsSet.add(String(val));
    }
    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    return {
      prompt: `Predict the next number in the pattern series:`,
      display,
      answer: String(answer),
      options,
      rule
    };
  }

  /**
   * Generate dynamic Chemistry Molecules and Reactions
   */
  static getChemicalMolecules() {
    return [
      {
        formula: 'H₂O',
        name: 'Water',
        description: 'Formed by 2 Hydrogen atoms covalently bonded to 1 Oxygen atom.',
        required: { H: 2, O: 1 },
        bonds: '2 Single Covalent Polar Bonds',
        reactionEq: '2H₂ + O₂ → 2H₂O'
      },
      {
        formula: 'CO₂',
        name: 'Carbon Dioxide',
        description: 'Linear molecule with 1 Carbon atom double-bonded to 2 Oxygen atoms.',
        required: { C: 1, O: 2 },
        bonds: '2 Double Covalent Bonds (O=C=O)',
        reactionEq: 'C + O₂ → CO₂'
      },
      {
        formula: 'CH₄',
        name: 'Methane',
        description: 'Simplest tetrahedral alkane hydrocarbon.',
        required: { C: 1, H: 4 },
        bonds: '4 Single C-H Bonds',
        reactionEq: 'C + 2H₂ → CH₄'
      },
      {
        formula: 'NH₃',
        name: 'Ammonia',
        description: 'Trigonal pyramidal molecule with 1 Nitrogen and 3 Hydrogen atoms.',
        required: { N: 1, H: 3 },
        bonds: '3 Single N-H Polar Bonds',
        reactionEq: 'N₂ + 3H₂ → 2NH₃'
      },
      {
        formula: 'NaCl',
        name: 'Sodium Chloride (Salt)',
        description: 'Ionic compound formed by complete electron transfer.',
        required: { Na: 1, Cl: 1 },
        bonds: 'Ionic Crystal Lattice (Na⁺ Cl⁻)',
        reactionEq: '2Na + Cl₂ → 2NaCl'
      },
      {
        formula: 'HCl',
        name: 'Hydrochloric Acid',
        description: 'Strong binary acid molecule.',
        required: { H: 1, Cl: 1 },
        bonds: '1 Polar Covalent Bond',
        reactionEq: 'H₂ + Cl₂ → 2HCl'
      }
    ];
  }

  /**
   * Fetch curriculum-specific topics based on user profile
   */
  static getCurriculumTopics(track = 'SCHOOL', subject = 'Physics') {
    return gameService.getContentForTrack(track, subject);
  }
}

export default DynamicGameContentGenerator;
