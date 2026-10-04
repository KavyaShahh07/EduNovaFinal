import React, { lazy } from 'react';
import {
  Zap,
  Flame,
  Layers,
  Puzzle,
  ArrowUp,
  Bug,
  FlaskConical,
  Sword,
  Target,
  Key,
  Eye,
  Shield,
  Compass,
  Atom,
  Terminal,
  Code,
  BookOpen,
  Search,
  Box,
  Cpu,
  Vault,
  Skull,
  Wind,
  Gauge,
  Plane,
  Rocket
} from 'lucide-react';

// Lazy-loaded new games to optimize performance
const NeuralReactionArena = lazy(() => import('../games/NeuralReactionArena'));
const MemoryMatrix = lazy(() => import('../games/MemoryMatrix'));
const LogicEscape = lazy(() => import('../games/LogicEscape'));
const QuantumPatternBreaker = lazy(() => import('../games/QuantumPatternBreaker'));
const MathMeteorDefense = lazy(() => import('../games/MathMeteorDefense'));
const PhysicsRush = lazy(() => import('../games/PhysicsRush'));
const ChemicalReactor = lazy(() => import('../games/ChemicalReactor'));
const CodeBreaker = lazy(() => import('../games/CodeBreaker'));
const AlgorithmRace = lazy(() => import('../games/AlgorithmRace'));
const WordHunter = lazy(() => import('../games/WordHunter'));
const DataDetective = lazy(() => import('../games/DataDetective'));
const SpatialMind = lazy(() => import('../games/SpatialMind'));
const CircuitBreaker = lazy(() => import('../games/CircuitBreaker'));
const MemoryVault = lazy(() => import('../games/MemoryVault'));
const BossBattle2 = lazy(() => import('../games/BossBattle2'));
const NeuralSurvival = lazy(() => import('../games/NeuralSurvival'));
const FocusFlow = lazy(() => import('../games/FocusFlow'));
const MistakeHunter = lazy(() => import('../games/MistakeHunter'));

// Realistic Environment Action & Racing Games
const KineticCyberRacer = lazy(() => import('../games/KineticCyberRacer'));
const AeroGravityJet = lazy(() => import('../games/AeroGravityJet'));
const NeonHorizonDrift = lazy(() => import('../games/NeonHorizonDrift'));

// 3D Arcade Garage Games
const CityRushOpenRoad = lazy(() => import('../games/3d/CityRushOpenRoad'));
const HighwayHavoc = lazy(() => import('../games/3d/HighwayHavoc'));
const DriftKingArena = lazy(() => import('../games/3d/DriftKingArena'));
const ImpossibleStuntGarage = lazy(() => import('../games/3d/ImpossibleStuntGarage'));
const ParkingMaster3D = lazy(() => import('../games/3d/ParkingMaster3D'));
const MountainOffRoadExplorer = lazy(() => import('../games/3d/MountainOffRoadExplorer'));
const TrafficCopilot = lazy(() => import('../games/3d/CityRushOpenRoad')); // re-uses high quality traffic engine
const DownhillBikeRush = lazy(() => import('../games/3d/DownhillBikeRush'));
const BMXStuntPark = lazy(() => import('../games/3d/BMXStuntPark'));
const MotorcycleHighwayRacer = lazy(() => import('../games/3d/MotorcycleHighwayRacer'));
const CrazyDeliveryRider = lazy(() => import('../games/3d/CrazyDeliveryRider'));
const WobblyWheelChaos = lazy(() => import('../games/3d/WobblyWheelChaos'));
const TinyCarGiantWorld = lazy(() => import('../games/3d/TinyCarGiantWorld'));
const PhysicsPlayground3D = lazy(() => import('../games/3d/PhysicsPlayground3D'));
const CrashTestChallenge = lazy(() => import('../games/3d/CrashTestChallenge'));
const ToiletKartGrandPrix = lazy(() => import('../games/3d/ToiletKartGrandPrix'));
const RagdollDeliveryDisaster = lazy(() => import('../games/3d/RagdollDeliveryDisaster'));
const NeonTunnelRacer = lazy(() => import('../games/3d/NeonTunnelRacer'));
const MonsterTruckMayhem = lazy(() => import('../games/3d/MonsterTruckMayhem'));
const EscapeGiantBoulder = lazy(() => import('../games/3d/EscapeGiantBoulder'));

export const GAME_CATEGORIES = [
  'ALL',
  '3D GARAGE',
  'CAR RACING',
  'BIKE RACING',
  'STUNTS & DRIFTING',
  'OPEN WORLD',
  'FUNNY PHYSICS',
  'ENDLESS RUNNER',
  'ACTION',
  'RACING',
  'BRAIN',
  'MEMORY',
  'LOGIC',
  'MATH',
  'SCIENCE',
  'CODING',
  'LANGUAGE',
  'STRATEGY',
  'REACTION',
  'PUZZLE',
  'SPATIAL',
  'BOSS BATTLES'
];

export const GAME_REGISTRY = [
  // ================= 8 EXISTING GAMES (PRESERVED 100%) =================
  {
    id: 'rapid-fire',
    legacyKey: 'RAPID',
    isLegacyModal: true,
    title: 'Rapid Fire Sprint',
    description: '60-second high-speed conceptual question sprint with dynamic combo multiplier.',
    category: 'REACTION',
    categories: ['REACTION', 'BRAIN', 'ACTION'],
    difficulty: 'Medium',
    estimatedDuration: '60s',
    skills: ['Speed Recall', 'Conceptual Precision'],
    subject: 'Physics',
    badge: '⚡ SPEED ENGINE',
    accentColor: '#38bdf8',
    icon: Zap,
    xpReward: 120
  },
  {
    id: 'formula-rush',
    legacyKey: 'FORMULA',
    isLegacyModal: true,
    title: 'Formula Rush Blitz',
    description: '30-second high-intensity formula matching sprint for physics, math & chemistry.',
    category: 'MATH',
    categories: ['MATH', 'SCIENCE', 'ACTION'],
    difficulty: 'Hard',
    estimatedDuration: '30s',
    skills: ['Equation Retrieval', 'Symbol Speed'],
    subject: 'Mathematics',
    badge: '🏎️ BLITZ ENGINE',
    accentColor: '#f59e0b',
    icon: Flame,
    xpReward: 100
  },
  {
    id: 'memory-match-lab',
    legacyKey: 'MEMORY',
    isLegacyModal: true,
    title: 'Memory Match Laboratory',
    description: 'Card flip pairing engine for key formulas, terms, and definitions.',
    category: 'MEMORY',
    categories: ['MEMORY', 'BRAIN', 'PUZZLE'],
    difficulty: 'Easy',
    estimatedDuration: '2 mins',
    skills: ['Visual Memory', 'Term Association'],
    subject: 'Biology',
    badge: '🃏 MEMORY ENGINE',
    accentColor: '#c084fc',
    icon: Layers,
    xpReward: 80
  },
  {
    id: 'concept-match',
    legacyKey: 'CONCEPT',
    isLegacyModal: true,
    title: 'Concept Match Challenge',
    description: 'Interactive drag-and-drop matching of theoretical concepts to real-world examples.',
    category: 'LOGIC',
    categories: ['LOGIC', 'STRATEGY', 'PUZZLE'],
    difficulty: 'Medium',
    estimatedDuration: '2 mins',
    skills: ['Deductive Reasoning', 'Application Analysis'],
    subject: 'Physics',
    badge: '🧩 MATCH ENGINE',
    accentColor: '#10b981',
    icon: Puzzle,
    xpReward: 90
  },
  {
    id: 'sort-it',
    legacyKey: 'SORT',
    isLegacyModal: true,
    title: 'Sort It Sequence Builder',
    description: 'Arrange algorithm steps, mathematical derivations, and timelines in strict order.',
    category: 'STRATEGY',
    categories: ['STRATEGY', 'LOGIC', 'CODING'],
    difficulty: 'Medium',
    estimatedDuration: '90s',
    skills: ['Step Derivation', 'Algorithmic Order'],
    subject: 'Computer Science',
    badge: '🔀 SEQUENCE ENGINE',
    accentColor: '#fbbf24',
    icon: ArrowUp,
    xpReward: 100
  },
  {
    id: 'fix-mistake',
    legacyKey: 'FIX',
    isLegacyModal: true,
    title: 'Fix the Mistake Debugger',
    description: 'Spot and correct flawed equations, code snippets, and chemical reactions with Sage AI.',
    category: 'CODING',
    categories: ['CODING', 'LOGIC', 'BRAIN'],
    difficulty: 'Hard',
    estimatedDuration: '2 mins',
    skills: ['Code Analysis', 'Error Detection'],
    subject: 'Web Development',
    badge: '🐛 DEBUGGER ENGINE',
    accentColor: '#ef4444',
    icon: Bug,
    xpReward: 130
  },
  {
    id: 'optics-lab',
    legacyKey: 'LAB',
    isLegacyModal: true,
    title: 'Virtual Optics & Trajectory Lab',
    description: 'Interactive virtual lab experiment simulator for physics trajectory & optics calculations.',
    category: 'SCIENCE',
    categories: ['SCIENCE', 'SPATIAL', 'ACTION'],
    difficulty: 'Medium',
    estimatedDuration: '3 mins',
    skills: ['Experimental Physics', 'Ray Tracing'],
    subject: 'Physics',
    badge: '🧪 LAB SIMULATOR',
    accentColor: '#2dd4bf',
    icon: FlaskConical,
    xpReward: 110
  },
  {
    id: 'boss-battle',
    legacyKey: 'BOSS',
    isLegacyModal: true,
    title: 'Subject Boss Battle',
    description: 'Multi-stage epic boss battle with adaptive difficulty and stage progression.',
    category: 'BOSS BATTLES',
    categories: ['BOSS BATTLES', 'ACTION', 'STRATEGY'],
    difficulty: 'Expert',
    estimatedDuration: '3 mins',
    skills: ['Multi-Disciplinary Mastery', 'Crisis Management'],
    subject: 'General STEM',
    badge: '⚔️ BOSS BATTLE',
    accentColor: '#ec4899',
    icon: Sword,
    xpReward: 150
  },

  // ================= 18 NEW PREMIERE ARENA GAMES =================
  {
    id: 'neural-reaction',
    title: 'Neural Reaction Arena',
    description: 'Fast-twitch cognitive reaction arena with dynamic color-symbol shifts, decoy traps, and curriculum checks.',
    category: 'REACTION',
    categories: ['REACTION', 'ACTION', 'BRAIN'],
    difficulty: 'Hard',
    estimatedDuration: '45s',
    skills: ['Reflex Speed', 'Target Discrimination', 'Focus Inhibition'],
    subject: 'Cognitive Science',
    component: NeuralReactionArena,
    engine: 'React + Canvas Reflex Loop',
    badge: '⚡ FAST REACTION',
    accentColor: '#06b6d4',
    icon: Target,
    xpReward: 140
  },
  {
    id: 'memory-matrix',
    title: 'Memory Matrix',
    description: 'Spatial working-memory matrix. Reproduce accelerating glowing cyber node sequences across expanding grids.',
    category: 'MEMORY',
    categories: ['MEMORY', 'BRAIN', 'SPATIAL'],
    difficulty: 'Medium',
    estimatedDuration: '90s',
    skills: ['Visuospatial Working Memory', 'Pattern Retention'],
    subject: 'Neuroscience',
    component: MemoryMatrix,
    engine: 'React + Procedural Audio',
    badge: '🧠 WORKING MEMORY',
    accentColor: '#c084fc',
    icon: Layers,
    xpReward: 120
  },
  {
    id: 'logic-escape',
    title: 'Logic Escape Room',
    description: 'Mini cyber escape-room experience. Solve deductive constraints, Modus Tollens, and logic vaults to escape.',
    category: 'LOGIC',
    categories: ['LOGIC', 'STRATEGY', 'PUZZLE'],
    difficulty: 'Hard',
    estimatedDuration: '2 mins',
    skills: ['Formal Logic', 'Deduction', 'Syllogisms'],
    subject: 'Discrete Mathematics',
    component: LogicEscape,
    engine: 'Interactive Escape Engine',
    badge: '🔐 ESCAPE ROOM',
    accentColor: '#10b981',
    icon: Key,
    xpReward: 150
  },
  {
    id: 'pattern-breaker',
    title: 'Quantum Pattern Breaker',
    description: 'High-speed sequence deciphering across Fibonacci series, geometric progressions, and geometric rotations.',
    category: 'PUZZLE',
    categories: ['PUZZLE', 'BRAIN', 'MATH'],
    difficulty: 'Medium',
    estimatedDuration: '60s',
    skills: ['Inductive Reasoning', 'Series Extrapolation'],
    subject: 'Mathematics',
    component: QuantumPatternBreaker,
    engine: 'Quantum Sequence Engine',
    badge: '🌌 PATTERN RECOGNITION',
    accentColor: '#a855f7',
    icon: Eye,
    xpReward: 110
  },
  {
    id: 'math-meteor',
    title: 'Math Meteor Defense',
    description: 'Arcade defense game! Solve curriculum algebra, percentages, and ratios to fire lasers and vaporize meteors.',
    category: 'MATH',
    categories: ['MATH', 'ACTION', 'REACTION'],
    difficulty: 'Hard',
    estimatedDuration: '2 mins',
    skills: ['Mental Arithmetic', 'Rapid Calculation', 'Defense Strategy'],
    subject: 'Mathematics',
    component: MathMeteorDefense,
    engine: 'Arcade Laser Physics',
    badge: '💥 ACTION MATH',
    accentColor: '#f97316',
    icon: Shield,
    xpReward: 140
  },
  {
    id: 'physics-rush',
    title: 'Physics Rush',
    description: 'Trajectory motion puzzle! Calibrate launch angle, initial velocity, and gravity to navigate obstacles into portals.',
    category: 'SCIENCE',
    categories: ['SCIENCE', 'ACTION', 'SPATIAL'],
    difficulty: 'Hard',
    estimatedDuration: '2 mins',
    skills: ['Kinematics', 'Gravitational Dynamics', 'Trajectory Math'],
    subject: 'Physics',
    component: PhysicsRush,
    engine: 'Parabolic Physics Simulator',
    badge: '🚀 TRAJECTORY LAB',
    accentColor: '#2dd4bf',
    icon: Compass,
    xpReward: 130
  },
  {
    id: 'chemical-reactor',
    title: 'Chemical Reactor',
    description: 'Molecular synthesis lab. Bond valence electron pairs to build H₂O, CO₂, CH₄, and balance chemical equations.',
    category: 'SCIENCE',
    categories: ['SCIENCE', 'PUZZLE', 'BRAIN'],
    difficulty: 'Medium',
    estimatedDuration: '2 mins',
    skills: ['Chemical Stoichiometry', 'Valence Bonding', 'Periodic Law'],
    subject: 'Chemistry',
    component: ChemicalReactor,
    engine: 'Molecular Bonding Engine',
    badge: '🧪 MOLECULAR SYNTHESIS',
    accentColor: '#10b981',
    icon: Atom,
    xpReward: 125
  },
  {
    id: 'code-breaker',
    title: 'Code Breaker',
    description: 'Programming bug hunter! Inspect realistic JavaScript and Python code, locate runtime flaws, and pass test cases.',
    category: 'CODING',
    categories: ['CODING', 'LOGIC', 'STRATEGY'],
    difficulty: 'Hard',
    estimatedDuration: '2 mins',
    skills: ['Syntax Debugging', 'Edge-Case Inspection', 'Scope Mechanics'],
    subject: 'Computer Science',
    component: CodeBreaker,
    engine: 'Syntax Diagnostic Engine',
    badge: '💻 CODE DEBUGGER',
    accentColor: '#38bdf8',
    icon: Terminal,
    xpReward: 140
  },
  {
    id: 'algorithm-race',
    title: 'Algorithm Race',
    description: 'Race through animated array visualizers. Guide Bubble Sort and Binary Search step-by-step to optimize Big-O.',
    category: 'CODING',
    categories: ['CODING', 'STRATEGY', 'LOGIC'],
    difficulty: 'Medium',
    estimatedDuration: '90s',
    skills: ['Sorting Mechanics', 'Algorithmic Efficiency', 'Array Pointers'],
    subject: 'Data Structures',
    component: AlgorithmRace,
    engine: 'Array Visualizer Engine',
    badge: '⚡ ALGORITHM VISUALIZER',
    accentColor: '#0284c7',
    icon: Code,
    xpReward: 120
  },
  {
    id: 'word-hunter',
    title: 'Word Hunter',
    description: 'Fast-paced lexical reflex hunt. Target floating synonyms, antonyms, definitions, and spelling corrections.',
    category: 'LANGUAGE',
    categories: ['LANGUAGE', 'REACTION', 'BRAIN'],
    difficulty: 'Medium',
    estimatedDuration: '50s',
    skills: ['Vocabulary Fluency', 'Etymology', 'Linguistic Agility'],
    subject: 'English & Verbal Ability',
    component: WordHunter,
    engine: 'Lexical Galaxy Engine',
    badge: '📖 VOCABULARY SPRINT',
    accentColor: '#f43f5e',
    icon: BookOpen,
    xpReward: 110
  },
  {
    id: 'data-detective',
    title: 'Data Detective',
    description: 'Investigative data interpretation. Examine charts, graphs, and telemetry to isolate critical statistical anomalies.',
    category: 'STRATEGY',
    categories: ['STRATEGY', 'MATH', 'LOGIC'],
    difficulty: 'Medium',
    estimatedDuration: '2 mins',
    skills: ['Data Analysis', 'Graph Interpretation', 'Outlier Detection'],
    subject: 'Data Analytics',
    component: DataDetective,
    engine: 'Telemetry Case Engine',
    badge: '📊 DATA INTERPRETATION',
    accentColor: '#0ea5e9',
    icon: Search,
    xpReward: 120
  },
  {
    id: 'spatial-mind',
    title: 'Spatial Mind 3D',
    description: '3D mental rotation and spatial reasoning. Mentally rotate isometric cubes, unfolded nets, and mirror projections.',
    category: 'SPATIAL',
    categories: ['SPATIAL', 'BRAIN', 'PUZZLE'],
    difficulty: 'Hard',
    estimatedDuration: '2 mins',
    skills: ['3D Mental Rotation', 'Isometric Projection', 'Perspective Inversion'],
    subject: 'Spatial Reasoning',
    component: SpatialMind,
    engine: '3D Isometric Engine',
    badge: '🧊 3D SPATIAL LAB',
    accentColor: '#8b5cf6',
    icon: Box,
    xpReward: 130
  },
  {
    id: 'circuit-breaker',
    title: 'Circuit Breaker',
    description: 'Electronics physics puzzle. Connect batteries, switches, resistors, and LEDs applying Ohm’s Law without burnout.',
    category: 'SCIENCE',
    categories: ['SCIENCE', 'PUZZLE', 'LOGIC'],
    difficulty: 'Medium',
    estimatedDuration: '2 mins',
    skills: ['Ohm’s Law (V=IR)', 'Series & Parallel', 'Electronic Schematics'],
    subject: 'Electrical Physics',
    component: CircuitBreaker,
    engine: 'DC Circuit Simulation',
    badge: '🔌 ELECTRONICS LAB',
    accentColor: '#06b6d4',
    icon: Cpu,
    xpReward: 125
  },
  {
    id: 'memory-vault',
    title: 'Memory Vault Heist',
    description: 'Futuristic story-driven vault heist. Memorize high-security scientific constants before doors seal to bypass locks.',
    category: 'MEMORY',
    categories: ['MEMORY', 'BRAIN', 'STRATEGY'],
    difficulty: 'Hard',
    estimatedDuration: '90s',
    skills: ['Scientific Constants Recall', 'Pressure Retention', 'Heist Strategy'],
    subject: 'Universal Science',
    component: MemoryVault,
    engine: 'Vault Security Engine',
    badge: '🏦 VAULT HEIST',
    accentColor: '#c084fc',
    icon: Vault,
    xpReward: 135
  },
  {
    id: 'boss-battle-2',
    title: 'Boss Battle 2.0',
    description: 'Multi-stage titan confrontation! Battle the Matrix Golem and Quantum Colossus with phase shifts and attack spells.',
    category: 'BOSS BATTLES',
    categories: ['BOSS BATTLES', 'ACTION', 'STRATEGY'],
    difficulty: 'Expert',
    estimatedDuration: '3 mins',
    skills: ['Multi-Stage Strategy', 'Curriculum Defense', 'Critical Combos'],
    subject: 'All Subjects',
    component: BossBattle2,
    engine: 'Multi-Stage Boss Arena',
    badge: '⚔️ TITAN BOSS 2.0',
    accentColor: '#ec4899',
    icon: Skull,
    xpReward: 180
  },
  {
    id: 'neural-survival',
    title: 'Neural Survival Mode',
    description: 'Endless educational endurance mode. Continuous rapid-fire challenges with 3 lives and an accelerating clock.',
    category: 'ACTION',
    categories: ['ACTION', 'BRAIN', 'REACTION'],
    difficulty: 'Expert',
    estimatedDuration: '3 mins',
    skills: ['Endurance Recall', 'Speed Multi-Tasking', 'Stress Management'],
    subject: 'Omni-Curriculum',
    component: NeuralSurvival,
    engine: 'Endless Survival Loop',
    badge: '🔥 ENDLESS SURVIVAL',
    accentColor: '#f43f5e',
    icon: Flame,
    xpReward: 160
  },
  {
    id: 'focus-flow',
    title: 'Focus Flow Zen',
    description: 'Mindful focus stamina game. Paced breathing cycles coupled with calm cognitive challenges to cultivate deep focus.',
    category: 'BRAIN',
    categories: ['BRAIN', 'STRATEGY'],
    difficulty: 'Easy',
    estimatedDuration: '2 mins',
    skills: ['Mindful Attention', 'Deep Work Stamina', 'Breath Synchrony'],
    subject: 'Cognitive Wellness',
    component: FocusFlow,
    engine: 'Zen Flow Rhythm',
    badge: '🧘 MINDFUL FOCUS',
    accentColor: '#2dd4bf',
    icon: Wind,
    xpReward: 90
  },
  {
    id: 'mistake-hunter',
    title: 'Mistake Hunter',
    description: 'Cognitive debugging arena. Detect subtle conceptual flaws in derivations and equations with Sage AI remediation.',
    category: 'BRAIN',
    categories: ['BRAIN', 'LOGIC', 'SCIENCE'],
    difficulty: 'Hard',
    estimatedDuration: '90s',
    skills: ['Misconception Detection', 'Critical Proof Reading', 'Metacognition'],
    subject: 'STEM Derivations',
    component: MistakeHunter,
    engine: 'Metacognitive Debug Engine',
    badge: '🔍 MISTAKE HUNTER',
    accentColor: '#ef4444',
    icon: Bug,
    xpReward: 130
  },

  // ================= REALISTIC ENVIRONMENT ACTION & RACING GAMES =================
  {
    id: 'velocity-apex',
    title: 'Velocity Apex: 3D Highway Racer',
    description: 'High-octane pseudo-3D perspective curved highway racer. Dodge traffic, monitor RPM and digital telemetry, and storm through physics speed portals with Super Nitro.',
    category: 'RACING',
    categories: ['RACING', 'ACTION', 'SCIENCE', 'MATH'],
    difficulty: 'Hard',
    estimatedDuration: '90s',
    skills: ['Kinetic Dynamics', 'Centripetal Force', 'High-Speed Reflexes', 'Slipstream Weaving'],
    subject: 'Physics & Kinematics',
    component: KineticCyberRacer,
    engine: '3D Canvas Perspective Highway Engine',
    badge: '🏎️ 3D REALISTIC RACER',
    accentColor: '#38bdf8',
    icon: Gauge,
    xpReward: 160
  },
  {
    id: 'aero-mach3',
    title: 'Aero Mach 3: Supersonic Combat',
    description: 'High-altitude flight simulator with 3D cockpit HUD, vulcan laser cannons, flare countermeasures, and aerospace vector navigation rings.',
    category: 'ACTION',
    categories: ['ACTION', 'RACING', 'SCIENCE', 'SPATIAL'],
    difficulty: 'Hard',
    estimatedDuration: '90s',
    skills: ['Mach Aerodynamics', 'Vector Navigation', 'Airborne Combat Reflexes'],
    subject: 'Aerospace & Physics',
    component: AeroGravityJet,
    engine: '3D Avionics Sky Simulator',
    badge: '✈️ SUPERSONIC COMBAT',
    accentColor: '#06b6d4',
    icon: Plane,
    xpReward: 170
  },
  {
    id: 'neon-horizon-drift',
    title: 'Neon Horizon: Midnight Cyber Drift',
    description: 'Realistic wet asphalt night circuit with slip angle physics, counter-steering mechanics, tire smoke, and apex traction challenges.',
    category: 'RACING',
    categories: ['RACING', 'ACTION', 'SCIENCE'],
    difficulty: 'Medium',
    estimatedDuration: '90s',
    skills: ['Slip Angle Drift Control', 'Friction Coefficients', 'Apex Timing'],
    subject: 'Traction & Friction Dynamics',
    component: NeonHorizonDrift,
    engine: 'Slip Angle Physics Circuit Engine',
    badge: '🔥 MIDNIGHT DRIFT',
    accentColor: '#ec4899',
    icon: Flame,
    xpReward: 150
  },

  // ================= 20 3D ARCADE GARAGE GAMES =================
  {
    id: 'city-rush-open-road',
    title: 'City Rush: Open Road',
    description: 'Drive through a 3D city grid with buildings, streetlights, traffic, and a third-person chase camera. Dodge traffic and collect checkpoints.',
    category: 'CAR RACING',
    categories: ['3D GARAGE', 'CAR RACING', 'OPEN WORLD'],
    difficulty: 'Medium',
    estimatedDuration: '75s',
    skills: ['Urban Navigation', 'Obstacle Avoidance', 'Chase Camera Mechanics'],
    subject: 'Kinematics & Traffic Flow',
    component: CityRushOpenRoad,
    badge: '🏙️ 3D CITY RUSH',
    accentColor: '#0284c7',
    icon: Gauge,
    xpReward: 160
  },
  {
    id: 'highway-havoc-3d',
    title: 'Highway Havoc 3D',
    description: 'Drive on an endless 3D highway with multi-lane traffic, cars, and trucks. Earn near-miss bonuses and speed multipliers.',
    category: 'CAR RACING',
    categories: ['3D GARAGE', 'CAR RACING', 'ENDLESS RUNNER'],
    difficulty: 'Hard',
    estimatedDuration: '60s',
    skills: ['Near-Miss Timing', 'High-Speed Weaving', 'Reflex Reaction'],
    subject: 'Relative Velocity Dynamics',
    component: HighwayHavoc,
    badge: '🛣️ HIGHWAY HAVOC',
    accentColor: '#38bdf8',
    icon: Gauge,
    xpReward: 150
  },
  {
    id: 'drift-king-arena',
    title: 'Drift King Arena',
    description: 'Master dynamic slip angle physics, skid marks, tire smoke, and combo multipliers inside a 3D stadium circuit.',
    category: 'STUNTS & DRIFTING',
    categories: ['3D GARAGE', 'STUNTS & DRIFTING', 'CAR RACING'],
    difficulty: 'Hard',
    estimatedDuration: '60s',
    skills: ['Slip Angle Control', 'Oversteer Handling', 'Friction Coefficients'],
    subject: 'Traction Mechanics',
    component: DriftKingArena,
    badge: '🔥 DRIFT KING',
    accentColor: '#ec4899',
    icon: Flame,
    xpReward: 170
  },
  {
    id: 'impossible-stunt-garage',
    title: 'Impossible Stunt Garage',
    description: 'Launch over elevated ramps, sky loops, jumps, and narrow platforms with airtime scoring and vehicle recovery.',
    category: 'STUNTS & DRIFTING',
    categories: ['3D GARAGE', 'STUNTS & DRIFTING', 'CAR RACING'],
    difficulty: 'Expert',
    estimatedDuration: '70s',
    skills: ['Stunt Airtime', 'Trajectory Calculation', 'Vehicle Recovery'],
    subject: 'Gravitational Acceleration',
    component: ImpossibleStuntGarage,
    badge: '🚀 IMPOSSIBLE STUNTS',
    accentColor: '#c084fc',
    icon: Rocket,
    xpReward: 180
  },
  {
    id: 'parking-master-3d',
    title: 'Parking Master 3D',
    description: 'Navigate realistic parking bays, avoid cone obstacles, use reverse camera view, and score collision-free accuracy.',
    category: 'CAR RACING',
    categories: ['3D GARAGE', 'CAR RACING', 'SPATIAL'],
    difficulty: 'Medium',
    estimatedDuration: '90s',
    skills: ['Precision Steering', 'Reverse Camera Awareness', 'Collision Avoidance'],
    subject: 'Visuospatial Geometry',
    component: ParkingMaster3D,
    badge: '🅿️ PARKING MASTER',
    accentColor: '#10b981',
    icon: Shield,
    xpReward: 140
  },
  {
    id: 'mountain-offroad-explorer',
    title: 'Mountain Off-Road Explorer',
    description: 'Traverse mountain dirt tracks, slopes, wooden bridges, and uneven rocky terrain with suspension traction physics.',
    category: 'OPEN WORLD',
    categories: ['3D GARAGE', 'OPEN WORLD', 'CAR RACING'],
    difficulty: 'Hard',
    estimatedDuration: '75s',
    skills: ['Terrain Traversal', 'Hill Climb Traction', 'Suspension Balance'],
    subject: 'Off-Road Physics',
    component: MountainOffRoadExplorer,
    badge: '⛰️ OFF-ROAD EXPLORER',
    accentColor: '#f59e0b',
    icon: Compass,
    xpReward: 160
  },
  {
    id: 'traffic-copilot',
    title: 'Traffic Copilot',
    description: 'Navigate urban city streets while adhering to traffic lights, speed limits, safe braking, and hazard avoidance rules.',
    category: 'CAR RACING',
    categories: ['3D GARAGE', 'CAR RACING', 'STRATEGY'],
    difficulty: 'Medium',
    estimatedDuration: '75s',
    skills: ['Safe Braking Distance', 'Rule Compliance', 'Hazard Awareness'],
    subject: 'Traffic Safety & Law',
    component: TrafficCopilot,
    badge: '🚦 TRAFFIC COPILOT',
    accentColor: '#34d399',
    icon: Shield,
    xpReward: 140
  },
  {
    id: 'downhill-bike-rush',
    title: 'Downhill Bike Rush',
    description: 'Race down mountain trails with ramps, rocks, sharp turns, checkpoints, and airtime scoring on a mountain bike.',
    category: 'BIKE RACING',
    categories: ['3D GARAGE', 'BIKE RACING', 'ACTION'],
    difficulty: 'Hard',
    estimatedDuration: '60s',
    skills: ['Downhill Leaning', 'Jump Timing', 'Trail Checkpoints'],
    subject: 'Potential to Kinetic Energy',
    component: DownhillBikeRush,
    badge: '🚵 DOWNHILL BIKE',
    accentColor: '#06b6d4',
    icon: Gauge,
    xpReward: 155
  },
  {
    id: 'bmx-stunt-park',
    title: 'BMX Stunt Park',
    description: 'Ride through a 3D skatepark with quarter-pipes, half-pipes, and rails. Score points for Tailwhips, Backflips, and 360 Spins.',
    category: 'BIKE RACING',
    categories: ['3D GARAGE', 'BIKE RACING', 'STUNTS & DRIFTING'],
    difficulty: 'Medium',
    estimatedDuration: '60s',
    skills: ['Trick Execution', 'Rotational Momentum', 'Landing Balance'],
    subject: 'Angular Momentum',
    component: BMXStuntPark,
    badge: '🚲 BMX STUNT PARK',
    accentColor: '#a855f7',
    icon: Flame,
    xpReward: 150
  },
  {
    id: 'motorcycle-highway-racer',
    title: 'Motorcycle Highway Racer',
    description: 'Superbike highway racer. Weave through traffic at 200+ km/h, execute high-speed overtakes, and hit checkpoints.',
    category: 'BIKE RACING',
    categories: ['3D GARAGE', 'BIKE RACING', 'RACING'],
    difficulty: 'Hard',
    estimatedDuration: '60s',
    skills: ['Superbike Weaving', 'High-Speed Overtaking', 'Lean Angle Timing'],
    subject: 'High-Speed Physics',
    component: MotorcycleHighwayRacer,
    badge: '🏍️ SUPERBIKE RACER',
    accentColor: '#38bdf8',
    icon: Gauge,
    xpReward: 165
  },
  {
    id: 'crazy-delivery-rider',
    title: 'Crazy Delivery Rider',
    description: 'Ride a delivery scooter through a chaotic city obstacle course while maintaining package integrity under time limits.',
    category: 'BIKE RACING',
    categories: ['3D GARAGE', 'BIKE RACING', 'FUNNY PHYSICS'],
    difficulty: 'Medium',
    estimatedDuration: '70s',
    skills: ['Package Balance', 'Shortcut Discovery', 'Time Management'],
    subject: 'Inertia & Momentum',
    component: CrazyDeliveryRider,
    badge: '📦 CRAZY DELIVERY',
    accentColor: '#10b981',
    icon: Zap,
    xpReward: 145
  },
  {
    id: 'wobbly-wheel-chaos',
    title: 'Wobbly Wheel Chaos',
    description: 'Drive vehicles with funny, jelly-like bouncy suspension over bumpy hills, rolling obstacles, and unexpected flips.',
    category: 'FUNNY PHYSICS',
    categories: ['3D GARAGE', 'FUNNY PHYSICS', 'STUNTS & DRIFTING'],
    difficulty: 'Medium',
    estimatedDuration: '60s',
    skills: ['Suspension Control', 'Jelly Bounce Physics', 'Flip Recovery'],
    subject: 'Oscillatory Harmonics',
    component: WobblyWheelChaos,
    badge: '🤪 WOBBLY CHAOS',
    accentColor: '#f59e0b',
    icon: Flame,
    xpReward: 150
  },
  {
    id: 'tiny-car-giant-world',
    title: 'Tiny Car, Giant World',
    description: 'Drive a miniature toy car in an oversized classroom/desk room using giant textbooks, pencils, and cans as ramps.',
    category: 'FUNNY PHYSICS',
    categories: ['3D GARAGE', 'FUNNY PHYSICS', 'OPEN WORLD'],
    difficulty: 'Medium',
    estimatedDuration: '60s',
    skills: ['Scale Perspective', 'Miniature Navigation', 'Object Ramps'],
    subject: 'Dimensional Scaling',
    component: TinyCarGiantWorld,
    badge: '🚗 TINY CAR GIANT WORLD',
    accentColor: '#f43f5e',
    icon: Box,
    xpReward: 145
  },
  {
    id: 'physics-playground-3d',
    title: 'Physics Playground 3D',
    description: 'Interactive 3D sandbox experiment with gravity modifiers, bouncing spheres, domino blocks, and catapult ramps.',
    category: 'FUNNY PHYSICS',
    categories: ['3D GARAGE', 'FUNNY PHYSICS', 'SCIENCE'],
    difficulty: 'Easy',
    estimatedDuration: '60s',
    skills: ['Sandbox Experimentation', 'Elastic Collisions', 'Gravity Modulation'],
    subject: 'Classical Mechanics',
    component: PhysicsPlayground3D,
    badge: '🧪 PHYSICS PLAYGROUND',
    accentColor: '#06b6d4',
    icon: Atom,
    xpReward: 130
  },
  {
    id: 'crash-test-challenge',
    title: 'Crash-Test Challenge',
    description: 'Accelerate into impact barriers to evaluate stopping distance, energy absorption, and arcade vehicle durability.',
    category: 'FUNNY PHYSICS',
    categories: ['3D GARAGE', 'FUNNY PHYSICS', 'SCIENCE'],
    difficulty: 'Medium',
    estimatedDuration: '60s',
    skills: ['Impact Energy Analysis', 'Stopping Distance', 'Deformation Mechanics'],
    subject: 'Impulse & Momentum',
    component: CrashTestChallenge,
    badge: '💥 CRASH-TEST LAB',
    accentColor: '#ef4444',
    icon: Shield,
    xpReward: 140
  },
  {
    id: 'toilet-kart-grand-prix',
    title: 'Toilet Kart Grand Prix',
    description: 'Silly cartoon kart racing with bathtub/toilet karts, banana peel oil slips, and plunger rocket boosters.',
    category: 'FUNNY PHYSICS',
    categories: ['3D GARAGE', 'FUNNY PHYSICS', 'CAR RACING'],
    difficulty: 'Medium',
    estimatedDuration: '60s',
    skills: ['Cartoon Cornering', 'Hazard Slip Recovery', 'Rocket Boosting'],
    subject: 'Arcade Physics',
    component: ToiletKartGrandPrix,
    badge: '🚽 TOILET KART GP',
    accentColor: '#ec4899',
    icon: Zap,
    xpReward: 145
  },
  {
    id: 'ragdoll-delivery-disaster',
    title: 'Ragdoll Delivery Disaster',
    description: 'Deliver fragile stacked boxes on a bouncy ragdoll courier over obstacle courses with controlled landings.',
    category: 'FUNNY PHYSICS',
    categories: ['3D GARAGE', 'FUNNY PHYSICS', 'ACTION'],
    difficulty: 'Medium',
    estimatedDuration: '60s',
    skills: ['Ragdoll Balancing', 'Stack Center of Mass', 'Bouncy Landings'],
    subject: 'Center of Mass Physics',
    component: RagdollDeliveryDisaster,
    badge: '📦 RAGDOLL DISASTER',
    accentColor: '#38bdf8',
    icon: Target,
    xpReward: 140
  },
  {
    id: 'neon-tunnel-racer',
    title: 'Neon Tunnel Racer',
    description: 'Control a high-speed ship through a 3D futuristic glowing neon tunnel, dodging barriers and collecting energy orbs.',
    category: 'ENDLESS RUNNER',
    categories: ['3D GARAGE', 'ENDLESS RUNNER', 'REACTION'],
    difficulty: 'Hard',
    estimatedDuration: '60s',
    skills: ['Tunnel Rotation', 'High-Speed Reflexes', 'Energy Orb Collection'],
    subject: '3D Rotational Vectors',
    component: NeonTunnelRacer,
    badge: '⚡ NEON TUNNEL',
    accentColor: '#22d3ee',
    icon: Zap,
    xpReward: 160
  },
  {
    id: 'monster-truck-mayhem',
    title: 'Monster Truck Mayhem',
    description: 'Drive a giant monster truck with massive tires crushing barrels, car stacks, and ramps across an arena.',
    category: 'ENDLESS RUNNER',
    categories: ['3D GARAGE', 'ENDLESS RUNNER', 'CAR RACING'],
    difficulty: 'Medium',
    estimatedDuration: '60s',
    skills: ['Crush Mechanics', 'Huge Wheel Suspension', 'Arena Rampage'],
    subject: 'Mass & Force Dynamics',
    component: MonsterTruckMayhem,
    badge: '🚜 MONSTER MAYHEM',
    accentColor: '#ef4444',
    icon: Flame,
    xpReward: 150
  },
  {
    id: 'escape-giant-boulder',
    title: 'Escape the Giant Boulder',
    description: 'Race down a winding canyon path fleeing a giant rolling Indiana-Jones style boulder right behind you!',
    category: 'ENDLESS RUNNER',
    categories: ['3D GARAGE', 'ENDLESS RUNNER', 'ACTION'],
    difficulty: 'Hard',
    estimatedDuration: '60s',
    skills: ['Escape Acceleration', 'Steep Slalom Steering', 'Obstacle Avoidance'],
    subject: 'Translational Kinematics',
    component: EscapeGiantBoulder,
    badge: '🪨 BOULDER ESCAPE',
    accentColor: '#f59e0b',
    icon: Compass,
    xpReward: 165
  }
];

export const getGameById = (id) => {
  return GAME_REGISTRY.find(g => g.id === id || g.legacyKey === id);
};

export const filterGames = ({ category = 'ALL', search = '' }) => {
  return GAME_REGISTRY.filter(g => {
    // 1. Category check
    const matchesCategory =
      category === 'ALL' ||
      g.category === category ||
      (g.categories && g.categories.includes(category));

    // 2. Search check (title, subject, category, skills)
    if (!search.trim()) return matchesCategory;

    const term = search.toLowerCase();
    const matchesSearch =
      g.title.toLowerCase().includes(term) ||
      g.description.toLowerCase().includes(term) ||
      (g.subject && g.subject.toLowerCase().includes(term)) ||
      (g.skills && g.skills.some(s => s.toLowerCase().includes(term))) ||
      g.category.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });
};
