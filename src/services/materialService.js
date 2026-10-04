// EduNova Material Service for Learning Materials & Uploads

import { materialApi } from '../lib/apiClient';

const STORAGE_KEY = 'edunova_learning_materials';

class MaterialService {
  constructor() {
    this.materials = this.loadMaterials();
    this.fetchFromServer();
  }

  async fetchFromServer(subjectId) {
    try {
      const res = await materialApi.getMaterials(subjectId ? { subjectId } : {});
      if (res && res.data && Array.isArray(res.data)) {
        this.materials = res.data;
        this.saveMaterials(this.materials);
        return res.data;
      }
    } catch (err) {
      console.warn('Failed to sync materials from backend:', err.message);
    }
    return this.materials;
  }

  loadMaterials() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error reading materials from localStorage:', e);
    }
    return [];
  }

  saveMaterials(mats) {
    this.materials = mats;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mats));
    } catch (e) {
      console.error('Error saving materials to localStorage:', e);
    }
    return this.materials;
  }

  getMaterialsBySubject(subjectId, filterType = 'All', topicId = null, subjectName = '') {
    let list = this.materials.filter(m => !subjectId || m.subjectId === subjectId);

    // Seed dynamic subject-specific materials if none or few exist for this subject
    const seedMaterials = getDynamicSeedMaterials(subjectId, subjectName);

    // Combine custom uploaded materials with seed materials avoiding duplicate IDs
    const existingIds = new Set(list.map(m => m.id));
    seedMaterials.forEach(seed => {
      if (!existingIds.has(seed.id)) {
        list.push(seed);
      }
    });

    if (topicId) {
      list = list.filter(m => m.topicId === topicId);
    }

    if (filterType && filterType !== 'All') {
      const target = filterType.toUpperCase().replace(/\s+/g, '');
      list = list.filter(m => {
        const typeStr = (m.type || '').toUpperCase().replace(/\s+/g, '');
        return typeStr === target || typeStr.includes(target) || target.includes(typeStr);
      });
    }

    return list;
  }

  getMaterialById(id) {
    return this.materials.find(m => m.id === id) || null;
  }

  /**
   * Fetch active students for targeted material assignment
   */
  async getTargetStudents() {
    try {
      const res = await materialApi.getTargetStudents();
      return res?.data || [];
    } catch (err) {
      console.warn('Failed to load target students:', err.message);
      return [];
    }
  }

  /**
   * Upload real video or document file via multipart FormData directly to backend & PostgreSQL
   */
  async uploadFileMaterial(formData) {
    const res = await materialApi.uploadMaterial(formData);
    if (res && res.data) {
      this.materials = [res.data, ...this.materials];
      this.saveMaterials(this.materials);
      window.dispatchEvent(new CustomEvent('edunova_materials_updated', { detail: res.data }));
      return res.data;
    }
    throw new Error(res?.message || 'Failed to upload material');
  }

  async deleteMaterial(id) {
    await materialApi.deleteMaterial(id);
    this.materials = this.materials.filter(m => m.id !== id);
    this.saveMaterials(this.materials);
    window.dispatchEvent(new CustomEvent('edunova_materials_updated', { detail: { id, deleted: true } }));
    return true;
  }

  uploadMaterial(materialData) {
    // Legacy JSON metadata upload
    return materialApi.createMaterial(materialData).then(res => {
      if (res && res.data) {
        this.materials = [res.data, ...this.materials];
        this.saveMaterials(this.materials);
        window.dispatchEvent(new CustomEvent('edunova_materials_updated', { detail: res.data }));
        return res.data;
      }
      return null;
    });
  }

  searchMaterials(subjectId, query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.getMaterialsBySubject(subjectId);

    return this.materials.filter(m =>
      (!subjectId || m.subjectId === subjectId) &&
      ((m.title && m.title.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.tags && Array.isArray(m.tags) && m.tags.some(t => t.toLowerCase().includes(q))))
    );
  }
}

/**
 * Generate rich, dynamic, topic-accurate Smart Materials per subject across all 9 categories
 */
function getDynamicSeedMaterials(subjectId, subjectName = '') {
  const name = subjectName || 'Subject';
  const subLower = (subjectId + ' ' + name).toLowerCase();

  const isBio = subLower.includes('bio') || subLower.includes('life') || subLower.includes('botany') || subLower.includes('zoology');
  const isPhy = subLower.includes('phy') || subLower.includes('mechanic') || subLower.includes('optic');
  const isCS = subLower.includes('cs') || subLower.includes('comp') || subLower.includes('code') || subLower.includes('dsa') || subLower.includes('dbms');

  if (isBio) {
    return [
      {
        id: `mat_bio_vid_1`,
        subjectId,
        title: `3D Visual Lecture: Human Heart Anatomy, Chambers & Double Circulation`,
        description: `High-definition 3D video lecture detailing the 4 chambers (atria & ventricles), SA node electrical conduction, cardiac cycle (systole/diastole), and systemic vs pulmonary loops.`,
        type: `Videos`,
        fileUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`,
        fileName: `Human_Heart_3D_Anatomy_Lecture.mp4`,
        fileSize: 18500000,
        createdAt: `2026-09-29`,
        uploadedBy: `EduNova Medical & Life Sciences Faculty`,
        tags: [`Anatomy`, `HumanHeart`, `Class12Bio`, `3DVisual`],
        content: `Detailed lecture on the human circulatory system, cardiac cycle, and electrical conduction of the sinoatrial (SA) node.`
      },
      {
        id: `mat_bio_vid_2`,
        subjectId,
        title: `Cellular Respiration & Mitochondrial ATP Synthesis Masterclass`,
        description: `Step-by-step visual walk-through of Glycolysis, the Krebs Cycle, and Electron Transport Chain (ETC) with oxidative phosphorylation.`,
        type: `Videos`,
        fileUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
        fileName: `Cellular_Respiration_Masterclass.mp4`,
        fileSize: 24100000,
        createdAt: `2026-09-28`,
        uploadedBy: `EduNova Academic Faculty`,
        tags: [`Bioenergetics`, `KrebsCycle`, `CellBio`],
        content: `Comprehensive video tutorial explaining ATP yields, NAD+/FAD reduction, and chemiosmosis in eukaryotic cells.`
      },
      {
        id: `mat_bio_note_1`,
        subjectId,
        title: `Class 12 Biology: Complete Chapter-by-Chapter Notes PDF`,
        description: `Thorough NCERT & Board Exam revision notes covering Reproduction, Genetics, Biotechnology, Ecology, and Human Health with key bullet points.`,
        type: `Notes`,
        fileUrl: `/uploads/Biology_Class12_Complete_Notes.pdf`,
        fileName: `Biology_Class12_Complete_Notes.pdf`,
        fileSize: 4800000,
        createdAt: `2026-09-27`,
        uploadedBy: `Senior Biology Educator`,
        tags: [`NCERT`, `BoardExam`, `HighYieldNotes`],
        content: `# Class 12 Biology Master Revision Notes\n\n## Chapter 1: Reproduction in Organisms\n- Sexual vs Asexual reproduction mechanisms.\n## Chapter 2: Human Reproduction\n- Male & Female reproductive systems, Gametogenesis, Fertilization, Implantation.\n## Chapter 3: Genetics & Inheritance\n- Mendel's Laws of Inheritance, Chromosomal Disorders, DNA Structure, Transcription & Translation.`
      },
      {
        id: `mat_bio_note_2`,
        subjectId,
        title: `Genetics & Molecular Basis of Inheritance Revision Sheet`,
        description: `Summary of DNA replication fork enzymes (Helicase, Polymerase, Primase, Ligase), lac operon regulation, and Human Genome Project key facts.`,
        type: `Notes`,
        fileUrl: `/uploads/Genetics_Molecular_Basis_Notes.pdf`,
        fileName: `Genetics_Molecular_Basis_Notes.pdf`,
        fileSize: 3200000,
        createdAt: `2026-09-26`,
        uploadedBy: `Genetics Curriculum Specialist`,
        tags: [`Genetics`, `DNA`, `MolecularBio`],
        content: `Detailed breakdown of DNA structure, Okazaki fragments, central dogma, and Mendelian pedigree analysis.`
      },
      {
        id: `mat_bio_guide_1`,
        subjectId,
        title: `Biotechnology Principles & Applications Study Guide`,
        description: `Comprehensive study guide detailing Recombinant DNA Technology, Restriction Enzymes, Gel Electrophoresis, PCR amplification, and Bt Cotton applications.`,
        type: `Study Guides`,
        fileUrl: `/uploads/Biotechnology_Study_Guide.pdf`,
        fileName: `Biotechnology_Study_Guide.pdf`,
        fileSize: 5100000,
        createdAt: `2026-09-25`,
        uploadedBy: `EduNova BioTech Team`,
        tags: [`Biotech`, `PCR`, `GeneCloning`],
        content: `Study guide covering restriction endonuclease cleavage, plasmid vectors (pBR322), transformation, downstream processing, and gene therapy.`
      },
      {
        id: `mat_bio_guide_2`,
        subjectId,
        title: `Ecology, Ecosystems & Biodiversity Conservation Guide`,
        description: `High-scoring exam study guide covering Ecological Pyramids, Food Webs, Nutrient Cycles (Carbon/Nitrogen), and Biodiversity Hotspots.`,
        type: `Study Guides`,
        fileUrl: `/uploads/Ecology_Biodiversity_Guide.pdf`,
        fileName: `Ecology_Biodiversity_Guide.pdf`,
        fileSize: 3800000,
        createdAt: `2026-09-24`,
        uploadedBy: `Ecology Department`,
        tags: [`Ecology`, `Biodiversity`, `Environment`],
        content: `Detailed guide on population interactions (mutualism, commensalism, parasitism), energy flow 10% law, and in-situ vs ex-situ conservation.`
      },
      {
        id: `mat_bio_form_1`,
        subjectId,
        title: `Biological Formulas, Ratios & Hardy-Weinberg Equations Sheet`,
        description: `Quick reference formula sheet containing Hardy-Weinberg Equilibrium (p^2 + 2pq + q^2 = 1), Genetics Dihybrid ratios (9:3:3:1), and Cardiac Output formulas.`,
        type: `Formula Sheets`,
        fileUrl: `/uploads/Biology_Key_Formulas_Ratios.pdf`,
        fileName: `Biology_Key_Formulas_Ratios.pdf`,
        fileSize: 1400000,
        createdAt: `2026-09-23`,
        uploadedBy: `EduNova Science Team`,
        tags: [`Formulas`, `HardyWeinberg`, `GeneticsRatios`],
        content: `Formulas & Quantitative Biology Sheet:\n- Cardiac Output = Stroke Volume x Heart Rate = 70mL x 72bpm = 5.04 L/min\n- Hardy-Weinberg Principle: p + q = 1, p^2 + 2pq + q^2 = 1\n- Monohybrid Phenotypic Ratio: 3:1 | Genotypic: 1:2:1\n- Dihybrid Phenotypic Ratio: 9:3:3:1`
      },
      {
        id: `mat_bio_flash_1`,
        subjectId,
        title: `Essential Biology Terminology & Diagram Flashcards (42 Cards)`,
        description: `Interactive digital flashcard deck covering essential anatomical terms, cell structures, enzymes, and physiological processes.`,
        type: `Flashcards`,
        fileUrl: `/uploads/Biology_Flashcards_Deck.json`,
        fileName: `Biology_Flashcards_Deck.json`,
        fileSize: 850000,
        createdAt: `2026-09-22`,
        uploadedBy: `Interactive Learning Team`,
        tags: [`Flashcards`, `MemoryDeck`, `HighYield`],
        cards: [
          { question: `What is the pacemaker of the human heart?`, answer: `The Sinoatrial (SA) Node, located in the right atrium.` },
          { question: `Which blood vessel carries oxygenated blood from lungs to left atrium?`, answer: `The Pulmonary Vein.` },
          { question: `Define Codominance with an example.`, answer: `A condition where both alleles are fully expressed in heterozygotes (e.g. ABO Blood Group AB).` }
        ]
      },
      {
        id: `mat_bio_prac_1`,
        subjectId,
        title: `Biology Subject Practice Questions & Assertions-Reasons (35 Qs)`,
        description: `Comprehensive practice set with 35 short-answer, long-answer, and Assertion-Reason questions aligned with modern exam blueprints.`,
        type: `Practice Questions`,
        fileUrl: `/uploads/Biology_Practice_Questions_35.pdf`,
        fileName: `Biology_Practice_Questions_35.pdf`,
        fileSize: 2600000,
        createdAt: `2026-09-21`,
        uploadedBy: `Examination Board Expert`,
        tags: [`Practice`, `AssertionReason`, `ShortAnswer`],
        content: `Practice Questions Set:\n1. Explain the double circulation mechanism in human cardiac system with neat diagram.\n2. Differentiate between Spermatogenesis and Oogenesis with respect to meiotic divisions.\n3. State Mendel's Law of Independent Assortment.`
      },
      {
        id: `mat_bio_mcq_1`,
        subjectId,
        title: `Top 120 NCERT & Competitive Pattern Biology MCQs`,
        description: `120 curated Multiple Choice Questions with detailed step-by-step explanations covering all core chapters of biology.`,
        type: `MCQs`,
        fileUrl: `/uploads/Biology_Top_120_MCQs.pdf`,
        fileName: `Biology_Top_120_MCQs.pdf`,
        fileSize: 3400000,
        createdAt: `2026-09-20`,
        uploadedBy: `MCQ Bank Team`,
        tags: [`MCQs`, `QuestionBank`, `Explanations`],
        content: `Sample MCQs:\nQ1: Tricuspid valve is present between:\nA) Right atrium & Right ventricle [CORRECT]\nB) Left atrium & Left ventricle\nC) Right ventricle & Pulmonary artery\nD) Left ventricle & Aorta`
      },
      {
        id: `mat_bio_pyq_1`,
        subjectId,
        title: `Previous 10 Years Solved Board Question Papers (PYQs 2015-2025)`,
        description: `Archive of previous year questions with official marking scheme answers and chapter-wise weightage breakdown.`,
        type: `Previous Questions`,
        fileUrl: `/uploads/Biology_Previous_10_Years_PYQs.pdf`,
        fileName: `Biology_Previous_10_Years_PYQs.pdf`,
        fileSize: 6200000,
        createdAt: `2026-09-19`,
        uploadedBy: `Exam Archive Unit`,
        tags: [`PYQ`, `SolvedPapers`, `Past10Years`],
        content: `Solves past 10 years of board paper questions arranged by topic with full marking scheme answers.`
      },
      {
        id: `mat_bio_diag_1`,
        subjectId,
        title: `High-Resolution Labeled Diagrams Collection (Heart, Cell, DNA)`,
        description: `Vector SVG & PNG collection of key exam diagrams including Human Heart, Nephron Structure, DNA Double Helix, and Reflex Arc.`,
        type: `Diagrams`,
        fileUrl: `/uploads/Biology_HighRes_Diagrams_Collection.pdf`,
        fileName: `Biology_HighRes_Diagrams_Collection.pdf`,
        fileSize: 7800000,
        createdAt: `2026-09-18`,
        uploadedBy: `Medical Illustrator`,
        tags: [`Diagrams`, `LabeledAnatomy`, `HighRes`],
        svgContent: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a; border-radius:12px; padding:10px;"><rect x="120" y="40" width="160" height="200" rx="30" fill="#ef4444" opacity="0.8"/><text x="145" y="100" fill="#ffffff" font-weight="bold" font-size="14">Right Atrium</text><text x="215" y="100" fill="#ffffff" font-weight="bold" font-size="14">Left Atrium</text><text x="145" y="180" fill="#ffffff" font-weight="bold" font-size="14">Right Ventricle</text><text x="215" y="180" fill="#ffffff" font-weight="bold" font-size="14">Left Ventricle</text><path d="M 200 40 L 200 240" stroke="#ffffff" stroke-dasharray="4,4" stroke-width="2"/><text x="130" y="270" fill="#38bdf8" font-size="12">Human Heart 4-Chamber Structure</text></svg>`,
        content: `Contains high resolution diagrams for human heart, nephron, reflex arc, and plant cell mitosis.`
      }
    ];
  }

  // Generic/CS/Physics Dynamic Fallback
  return [
    {
      id: `mat_${subjectId}_vid_1`,
      subjectId,
      title: `${name}: Interactive Video Lecture & Concept Breakdown`,
      description: `Comprehensive video lecture covering foundational principles, derivations, and step-by-step problem solving for ${name}.`,
      type: `Videos`,
      fileUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`,
      fileName: `${name}_Concept_Lecture.mp4`,
      fileSize: 21000000,
      createdAt: `2026-09-29`,
      uploadedBy: `EduNova Lead Instructor`,
      tags: [`VideoLecture`, name, `CoreConcepts`],
      content: `In-depth video lecture introducing fundamental laws, theorem proofs, and real-world applications in ${name}.`
    },
    {
      id: `mat_${subjectId}_note_1`,
      subjectId,
      title: `${name}: Comprehensive Subject Notes & Chapter Summaries PDF`,
      description: `Structured, easy-to-read textbook notes, key definitions, and chapter revision guides for ${name}.`,
      type: `Notes`,
      fileUrl: `/uploads/${name.replace(/\s+/g, '_')}_Complete_Notes.pdf`,
      fileName: `${name}_Complete_Notes.pdf`,
      fileSize: 4500000,
      createdAt: `2026-09-28`,
      uploadedBy: `EduNova Academic Board`,
      tags: [`Notes`, `Revision`, name],
      content: `# ${name} Revision Notebook\n\n## Key Topics & Theories\n- Core Principles & Definitions\n- Key Theorems & Derivations\n- Standard Problem-Solving Methodology.`
    },
    {
      id: `mat_${subjectId}_guide_1`,
      subjectId,
      title: `${name}: High-Yield Exam Study Guide & Master Workbook`,
      description: `Comprehensive study guide featuring target score strategies, weak area practice, and exam preparation tips.`,
      type: `Study Guides`,
      fileUrl: `/uploads/${name.replace(/\s+/g, '_')}_Study_Guide.pdf`,
      fileName: `${name}_Study_Guide.pdf`,
      fileSize: 3900000,
      createdAt: `2026-09-27`,
      uploadedBy: `Curriculum Designer`,
      tags: [`StudyGuide`, `ExamPrep`, name],
      content: `Master study guide containing structured learning pathways, topic priority charts, and high-yield review notes.`
    },
    {
      id: `mat_${subjectId}_form_1`,
      subjectId,
      title: `${name}: Essential Formula Sheet & Quick Reference Guide`,
      description: `Handy formula sheet with core equations, units, constants, and quick identity transformations.`,
      type: `Formula Sheets`,
      fileUrl: `/uploads/${name.replace(/\s+/g, '_')}_Formula_Sheet.pdf`,
      fileName: `${name}_Formula_Sheet.pdf`,
      fileSize: 1200000,
      createdAt: `2026-09-26`,
      uploadedBy: `EduNova Academic Board`,
      tags: [`Formulas`, `CheatSheet`, name],
      content: `Essential Formulas & Equations for ${name}:\n1. Fundamental Theorem & Governing Equations\n2. Key Constants & Standard Units\n3. Quick Conversion Tables`
    },
    {
      id: `mat_${subjectId}_flash_1`,
      subjectId,
      title: `${name}: Essential Terms & Concepts Flashcard Deck (42 Cards)`,
      description: `Interactive flashcards covering key definitions, active recall prompts, and quick practice questions.`,
      type: `Flashcards`,
      fileUrl: `/uploads/${name.replace(/\s+/g, '_')}_Flashcards.json`,
      fileName: `${name}_Flashcards.json`,
      fileSize: 640000,
      createdAt: `2026-09-25`,
      uploadedBy: `Interactive Content Team`,
      tags: [`Flashcards`, `ActiveRecall`],
      cards: [
        { question: `What is the core principle of ${name}?`, answer: `Refer to fundamental subject definitions and theoretical axioms.` },
        { question: `How do you solve high-complexity questions in ${name}?`, answer: `Break the problem into sub-components, state initial boundary conditions, and apply standard formulas.` }
      ]
    },
    {
      id: `mat_${subjectId}_prac_1`,
      subjectId,
      title: `${name}: Subject Practice Questions Set (35 Questions)`,
      description: `Curated practice questions spanning easy, intermediate, and advanced difficulty levels.`,
      type: `Practice Questions`,
      fileUrl: `/uploads/${name.replace(/\s+/g, '_')}_Practice_Questions.pdf`,
      fileName: `${name}_Practice_Questions.pdf`,
      fileSize: 2800000,
      createdAt: `2026-09-24`,
      uploadedBy: `EduNova Test Division`,
      tags: [`Practice`, `ProblemSet`],
      content: `Practice Question Set for ${name}:\n1. Explain key concepts with practical examples.\n2. Derive the primary relationship equation.\n3. Solve standard numerical and theoretical problems.`
    },
    {
      id: `mat_${subjectId}_mcq_1`,
      subjectId,
      title: `${name}: Top 120 Practice MCQs with Step-by-Step Solutions`,
      description: `Multiple choice question bank designed for quick diagnostic self-assessment and exam readiness.`,
      type: `MCQs`,
      fileUrl: `/uploads/${name.replace(/\s+/g, '_')}_120_MCQs.pdf`,
      fileName: `${name}_120_MCQs.pdf`,
      fileSize: 3100000,
      createdAt: `2026-09-23`,
      uploadedBy: `MCQ Bank Expert`,
      tags: [`MCQs`, `SelfTest`],
      content: `120 Curated MCQs covering all syllabus chapters with detailed rationale and step-by-step explanations.`
    },
    {
      id: `mat_${subjectId}_pyq_1`,
      subjectId,
      title: `${name}: Solved Previous Year Exam Papers (PYQs)`,
      description: `Solved question papers from past 10 exam sessions with marking rubrics.`,
      type: `Previous Questions`,
      fileUrl: `/uploads/${name.replace(/\s+/g, '_')}_Solved_PYQs.pdf`,
      fileName: `${name}_Solved_PYQs.pdf`,
      fileSize: 5800000,
      createdAt: `2026-09-22`,
      uploadedBy: `Past Papers Archive`,
      tags: [`PYQ`, `PastPapers`],
      content: `10 years of solved question papers organized by chapter with model solution keys.`
    },
    {
      id: `mat_${subjectId}_diag_1`,
      subjectId,
      title: `${name}: High-Res Diagrams & Mindmaps Collection`,
      description: `Mindmaps, flowcharts, labeled schematics, and architectural diagrams.`,
      type: `Diagrams`,
      fileUrl: `/uploads/${name.replace(/\s+/g, '_')}_Diagrams.pdf`,
      fileName: `${name}_Diagrams.pdf`,
      fileSize: 6400000,
      createdAt: `2026-09-21`,
      uploadedBy: `Visual Design Team`,
      tags: [`Diagrams`, `Mindmaps`],
      content: `Contains high resolution schematics, flowcharts, and mindmaps for easy visual recall.`
    }
  ];
}

export const materialService = new MaterialService();
export default materialService;


