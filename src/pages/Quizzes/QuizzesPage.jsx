import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  RotateCcw,
  Search,
  Filter,
  Layers,
  BookOpen,
  Zap,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Atom,
  FlaskConical,
  Brain,
  Code,
  Globe,
  Database,
  Check,
  X
} from 'lucide-react';
import { quizApi, subjectApi } from '../../lib/apiClient';
import { EduNovaHeroBanner } from '../../components/common/EduNovaHeroBanner';
import { Button } from '../../components/common/Button';
import { getEducationContext } from '../../services/educationContextService';
import { useTheme } from '../../context/ThemeContext';

const DEFAULT_QUIZZES = [
  {
    id: 'quiz_bio_10',
    title: 'Class 10 Biology: Human Heart & Circulatory System',
    difficulty: 'MEDIUM',
    subject: { id: 'sub_bio_10', name: 'Biology' },
    topic: { title: 'Cardiovascular Physiology' },
    totalQuestions: 6,
    duration: '10 min',
    xpReward: 170,
    attemptsCount: 14,
    questions: [
      {
        id: 'q1',
        questionText: 'Which chamber of the human heart pumps oxygenated blood into the aorta for systemic circulation?',
        options: ['Right Atrium', 'Right Ventricle', 'Left Atrium', 'Left Ventricle'],
        correctOptionIndex: 3,
        explanation: 'The Left Ventricle has the thickest muscular wall to generate high arterial pressure required to propel oxygenated blood through the aorta into systemic circulation.'
      },
      {
        id: 'q2',
        questionText: 'What is the function of the bicuspid (mitral) valve in the human heart?',
        options: ['Prevents backflow from aorta into left ventricle', 'Prevents backflow from left ventricle into left atrium', 'Transports deoxygenated blood to lungs', 'Initiates cardiac electrical impulses'],
        correctOptionIndex: 1,
        explanation: 'The bicuspid (mitral) valve is located between the left atrium and left ventricle, closing during ventricular systole to prevent regurgitation into the left atrium.'
      },
      {
        id: 'q3',
        questionText: 'Which blood vessel carries deoxygenated blood from the heart to the lungs for oxygenation?',
        options: ['Aorta', 'Pulmonary Artery', 'Pulmonary Vein', 'Coronary Artery'],
        correctOptionIndex: 1,
        explanation: 'Unlike most arteries carrying oxygenated blood, the Pulmonary Artery carries deoxygenated venous blood from the right ventricle into alveolar capillaries.'
      },
      {
        id: 'q4',
        questionText: 'What is the standard resting heart rate and stroke volume formula for Cardiac Output (CO)?',
        options: ['CO = Heart Rate × Stroke Volume', 'CO = Blood Pressure / Heart Rate', 'CO = Stroke Volume / Pulse Pressure', 'CO = Heart Rate + Respiratory Rate'],
        correctOptionIndex: 0,
        explanation: 'Cardiac Output (CO) equals Heart Rate (HR, in beats/min) multiplied by Stroke Volume (SV, in mL/beat). Resting average is ~5 L/min.'
      },
      {
        id: 'q5',
        questionText: 'Which organelle in plant cells carries out photosynthesis by converting solar light energy into chemical energy (Glucose)?',
        options: ['Mitochondrion', 'Chloroplast', 'Ribosome', 'Golgi Apparatus'],
        correctOptionIndex: 1,
        explanation: 'Chloroplasts contain chlorophyll pigments that absorb light photons to drive photolysis of water and carbon fixation into glucose.'
      },
      {
        id: 'q6',
        questionText: 'What type of blood cells are primarily responsible for transporting oxygen via hemoglobin?',
        options: ['Leukocytes (White Blood Cells)', 'Erythrocytes (Red Blood Cells)', 'Thrombocytes (Platelets)', 'Lymphocytes'],
        correctOptionIndex: 1,
        explanation: 'Erythrocytes (Red Blood Cells) contain iron-binding hemoglobin molecules that bind oxygen reversibly in pulmonary capillaries.'
      }
    ]
  },
  {
    id: 'quiz_phy_10',
    title: 'Class 10 Physics: Laws of Motion, Light & Circuits',
    difficulty: 'BEGINNER',
    subject: { id: 'sub_phy_10', name: 'Physics' },
    topic: { title: 'Mechanics & Electricity' },
    totalQuestions: 6,
    duration: '8 min',
    xpReward: 120,
    attemptsCount: 22,
    questions: [
      {
        id: 'q1',
        questionText: 'According to Newton’s Second Law of Motion, what is the relationship between Force (F), Mass (m), and Acceleration (a)?',
        options: ['F = m / a', 'F = m × a', 'F = ½ m a²', 'F = m + a'],
        correctOptionIndex: 1,
        explanation: 'Newton’s Second Law states that the net force applied on a body equals product of its mass and acceleration (F = m · a).'
      },
      {
        id: 'q2',
        questionText: 'What is Ohm’s Law relationship between Voltage (V), Current (I), and Resistance (R)?',
        options: ['V = I / R', 'V = I × R', 'I = V × R', 'R = V × I'],
        correctOptionIndex: 1,
        explanation: 'Ohm’s Law states that electric current flowing through a conductor is directly proportional to voltage across it (V = I · R).'
      },
      {
        id: 'q3',
        questionText: 'What type of lens is thinner at the edges and thicker in the middle, converging incident parallel light rays to a principal focal point?',
        options: ['Concave Lens', 'Convex Lens', 'Plane Glass Plate', 'Cylindrical Lens'],
        correctOptionIndex: 1,
        explanation: 'A convex (biconvex) lens is a converging lens that refracts parallel light rays towards a real principal focus (F).'
      },
      {
        id: 'q4',
        questionText: 'What is the SI unit of electric current?',
        options: ['Volt (V)', 'Watt (W)', 'Ampere (A)', 'Joule (J)'],
        correctOptionIndex: 2,
        explanation: 'The Ampere (A) is the SI unit of electric current, defined as one Coulomb of charge passing per second.'
      },
      {
        id: 'q5',
        questionText: 'What is the formula for Kinetic Energy of an object of mass m moving with velocity v?',
        options: ['KE = m · g · h', 'KE = ½ m v²', 'KE = F · d', 'KE = m · v'],
        correctOptionIndex: 1,
        explanation: 'Kinetic energy is scalar work stored in a moving body equal to ½ m v².'
      },
      {
        id: 'q6',
        questionText: 'What phenomenon causes a rainbow to form when sunlight passes through raindrops in atmosphere?',
        options: ['Refraction, Dispersion, and Internal Reflection', 'Diffraction only', 'Polarization only', 'Absorption only'],
        correctOptionIndex: 0,
        explanation: 'Rainbows form when white sunlight undergoes refraction entering raindrops, dispersion into spectral colors, and total internal reflection.'
      }
    ]
  },
  {
    id: 'quiz_math_10',
    title: 'Class 10 Mathematics: Quadratic Equations & Trigonometry',
    difficulty: 'MEDIUM',
    subject: { id: 'sub_math_10', name: 'Mathematics' },
    topic: { title: 'Algebra & Trigonometry' },
    totalQuestions: 6,
    duration: '12 min',
    xpReward: 170,
    attemptsCount: 18,
    questions: [
      {
        id: 'q1',
        questionText: 'What is the discriminant formula (Δ) for a quadratic equation ax² + bx + c = 0?',
        options: ['b² + 4ac', 'b² - 4ac', '-b ± √(b² - 4ac)', 'a² - b²'],
        correctOptionIndex: 1,
        explanation: 'The discriminant Δ = b² - 4ac determines nature of roots: real & distinct (Δ > 0), real & equal (Δ = 0), or complex (Δ < 0).'
      },
      {
        id: 'q2',
        questionText: 'What is the fundamental Pythagorean trigonometric identity?',
        options: ['sin²(θ) + cos²(θ) = 1', 'tan²(θ) + 1 = cos²(θ)', 'sin(θ) + cos(θ) = 1', 'sec²(θ) + tan²(θ) = 1'],
        correctOptionIndex: 0,
        explanation: 'sin²(θ) + cos²(θ) = 1 holds true for all angle theta derived from right triangle (Perpendicular² + Base² = Hypotenuse²).'
      },
      {
        id: 'q3',
        questionText: 'If sin(θ) = 3/5 in a right-angled triangle, what is the value of cos(θ)?',
        options: ['4/5', '5/3', '3/4', '4/3'],
        correctOptionIndex: 0,
        explanation: 'In a 3-4-5 right triangle, if opposite side = 3 and hypotenuse = 5, adjacent side = √(5² - 3²) = 4. Thus cos(θ) = 4/5.'
      },
      {
        id: 'q4',
        questionText: 'What is the distance between points (x₁, y₁) and (x₂, y₂) in Cartesian coordinate geometry?',
        options: ['√[(x₂ - x₁)² + (y₂ - y₁)²]', '(x₂ - x₁) + (y₂ - y₁)', '√[(x₂ + x₁)² - (y₂ + y₁)²]', '|x₂ - y₂|'],
        correctOptionIndex: 0,
        explanation: 'The Euclidean distance formula d = √[(x₂ - x₁)² + (y₂ - y₁)²] derives directly from Pythagoras theorem.'
      },
      {
        id: 'q5',
        questionText: 'What is the sum of roots of a quadratic equation ax² + bx + c = 0?',
        options: ['-b / a', 'c / a', 'b / a', '-c / a'],
        correctOptionIndex: 0,
        explanation: 'According to Vieta’s formulas, sum of roots (α + β) = -b/a and product of roots (α · β) = c/a.'
      },
      {
        id: 'q6',
        questionText: 'What is the volume of a sphere with radius r?',
        options: ['(4/3) π r³', '4 π r²', 'π r² h', '(1/3) π r² h'],
        correctOptionIndex: 0,
        explanation: 'Volume of a 3D sphere is (4/3) π r³ while surface area is 4 π r².'
      }
    ]
  },
  {
    id: 'quiz_cs_10',
    title: 'Class 10 Computer Applications: Python & Boolean Logic',
    difficulty: 'BEGINNER',
    subject: { id: 'sub_cs_10', name: 'Computer Science' },
    topic: { title: 'Python Syntax & Logic Gates' },
    totalQuestions: 6,
    duration: '8 min',
    xpReward: 120,
    attemptsCount: 31,
    questions: [
      {
        id: 'q1',
        questionText: 'Which Python data type is used to store ordered, mutable sequences enclosed in square brackets `[]`?',
        options: ['Tuple', 'List', 'Dictionary', 'Set'],
        correctOptionIndex: 1,
        explanation: 'Python Lists `[]` are mutable ordered collections, whereas Tuples `()` are immutable and Dictionaries `{}` store key-value pairs.'
      },
      {
        id: 'q2',
        questionText: 'What is the output of `10 // 3` in Python floor division?',
        options: ['3.333', '3', '1', '3.0'],
        correctOptionIndex: 1,
        explanation: 'Floor division `//` divides two numbers and truncates fractional decimal digits, returning integer 3.'
      },
      {
        id: 'q3',
        questionText: 'Which logic gate outputs 1 (TRUE) ONLY when ALL of its inputs are 1?',
        options: ['OR Gate', 'AND Gate', 'NOT Gate', 'XOR Gate'],
        correctOptionIndex: 1,
        explanation: 'An AND gate produces high output (1) only if input A AND input B are both 1.'
      },
      {
        id: 'q4',
        questionText: 'What HTML tag is used to define an hyper-link anchor element on a webpage?',
        options: ['<link>', '<a>', '<href>', '<url>'],
        correctOptionIndex: 1,
        explanation: 'The `<a>` tag specifies a hyperlink using `href` attribute: `<a href="https://example.com">Link Text</a>`.'
      },
      {
        id: 'q5',
        questionText: 'What keyword is used to declare a function in Python?',
        options: ['function', 'def', 'func', 'define'],
        correctOptionIndex: 1,
        explanation: 'Python functions are defined using the `def` keyword followed by function name and parameter list.'
      },
      {
        id: 'q6',
        questionText: 'Which operator checks equality of values in JavaScript and Python?',
        options: ['=', '==', '!=', ':='] ,
        correctOptionIndex: 1,
        explanation: 'Double equals `==` tests for equality of values, whereas single `=` is the assignment operator.'
      }
    ]
  },
  {
    id: 'quiz_dsa_sem3',
    title: 'Data Structures & Algorithms: Trees, Graphs & Complexity',
    difficulty: 'ADVANCED',
    subject: { id: 'sub_dsa', name: 'Computer Science' },
    topic: { title: 'Algorithms & Data Structures' },
    totalQuestions: 6,
    duration: '15 min',
    xpReward: 220,
    attemptsCount: 28,
    questions: [
      {
        id: 'q1',
        questionText: 'What is the worst-case time complexity of QuickSort when bad pivot selection occurs on already sorted array?',
        options: ['O(N log N)', 'O(N²)', 'O(N)', 'O(1)'],
        correctOptionIndex: 1,
        explanation: 'When pivot is chosen poorly (e.g. smallest or largest element on sorted array), QuickSort degrades to O(N²) recursion tree height N.'
      },
      {
        id: 'q2',
        questionText: 'Which self-balancing binary search tree maintains height balance factor |h_left - h_right| ≤ 1 for every node?',
        options: ['B+ Tree', 'AVL Tree', 'Red-Black Tree', 'Splay Tree'],
        correctOptionIndex: 1,
        explanation: 'AVL trees strictly enforce balance factor |BF| ≤ 1 at every node using single and double rotations.'
      },
      {
        id: 'q3',
        questionText: 'Which graph traversal algorithm uses a First-In-First-Out (FIFO) Queue data structure?',
        options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra Algorithm', 'Prim Algorithm'],
        correctOptionIndex: 1,
        explanation: 'BFS explores graph level-by-level using a FIFO queue, whereas DFS uses a LIFO stack.'
      },
      {
        id: 'q4',
        questionText: 'What is the primary advantage of a Hash Table with open addressing over a Binary Search Tree?',
        options: ['O(1) average time complexity for lookup, insert, and delete', 'Guaranteed sorted key iteration', 'Uses zero memory overhead', 'Prevents hash collisions completely'],
        correctOptionIndex: 0,
        explanation: 'Hash tables achieve O(1) expected time complexity for dictionary operations via direct array indexing.'
      },
      {
        id: 'q5',
        questionText: 'What is the space complexity of Depth-First Search (DFS) on a tree of maximum depth H?',
        options: ['O(V + E)', 'O(H)', 'O(2^H)', 'O(1)'],
        correctOptionIndex: 1,
        explanation: 'DFS call stack memory is proportional to maximum height H of recursion tree.'
      },
      {
        id: 'q6',
        questionText: 'Which data structure operates on Last-In-First-Out (LIFO) order?',
        options: ['Queue', 'Stack', 'Linked List', 'Heap'],
        correctOptionIndex: 1,
        explanation: 'A Stack processes elements LIFO (Push onto top, Pop from top).'
      }
    ]
  },
  {
    id: 'quiz_fullstack_sem5',
    title: 'Full Stack Web Architecture & React Masterclass',
    difficulty: 'INTERMEDIATE',
    subject: { id: 'sub_web', name: 'Web Development' },
    topic: { title: 'React Hooks & REST APIs' },
    totalQuestions: 6,
    duration: '10 min',
    xpReward: 170,
    attemptsCount: 19,
    questions: [
      {
        id: 'q1',
        questionText: 'What is the primary purpose of the `useMemo` hook in React?',
        options: ['Executes side effects after component DOM paint', 'Memoizes expensive calculation results to avoid recalculation on unrelated re-renders', 'Triggers async API network requests', 'Replaces Redux store completely'],
        correctOptionIndex: 1,
        explanation: '`useMemo` caches the return value of an expensive calculation function between re-renders when dependencies remain unchanged.'
      },
      {
        id: 'q2',
        questionText: 'In RESTful Web APIs, which HTTP verb should be used for idempotent full resource updates?',
        options: ['POST', 'PUT', 'PATCH', 'GET'],
        correctOptionIndex: 1,
        explanation: 'PUT replaces an entire target resource representation and is idempotent (calling it multiple times produces identical server state).'
      },
      {
        id: 'q3',
        questionText: 'What is the function of CORS (Cross-Origin Resource Sharing) headers in modern browsers?',
        options: ['Accelerates static image CDN caching', 'Allows servers to specify which external origins can read resources via browser HTTP requests', 'Encrypts WebSockets payloads', 'Compiles JavaScript to WebAssembly'],
        correctOptionIndex: 1,
        explanation: 'CORS is a browser security mechanism using HTTP headers to permit domain origins to access protected API endpoints.'
      },
      {
        id: 'q4',
        questionText: 'What is the role of Node.js Event Loop?',
        options: ['Executes multi-threaded CPU matrix operations', 'Handles non-blocking asynchronous I/O callbacks on a single main thread', 'Compiles C++ native addons', 'Manages SQL database connections'],
        correctOptionIndex: 1,
        explanation: 'Node.js event loop delegates asynchronous I/O calls to OS kernel/libuv thread pool and executes callbacks on single JS thread.'
      },
      {
        id: 'q5',
        questionText: 'What structure is a JWT (JSON Web Token) composed of?',
        options: ['Header.Payload.Signature', 'User.Password.Salt', 'Key.Value.Checksum', 'Client.Server.Session'],
        correctOptionIndex: 0,
        explanation: 'JWTs consist of three Base64URL-encoded parts separated by dots: Header, Payload (claims), and Cryptographic Signature.'
      },
      {
        id: 'q6',
        questionText: 'In CSS Flexbox layout, which property aligns flex items along the main axis?',
        options: ['align-items', 'justify-content', 'align-content', 'flex-direction'],
        correctOptionIndex: 1,
        explanation: '`justify-content` defines alignment of items along flex main axis, while `align-items` controls cross-axis alignment.'
      }
    ]
  },
  {
    id: 'quiz_chem_10',
    title: 'Class 10 Chemistry: Chemical Reactions & Periodic Table',
    difficulty: 'MEDIUM',
    subject: { id: 'sub_chem_10', name: 'Chemistry' },
    topic: { title: 'Reactions & Periodic Trends' },
    totalQuestions: 6,
    duration: '10 min',
    xpReward: 160,
    attemptsCount: 25,
    questions: [
      {
        id: 'q1',
        questionText: 'What is the chemical formula of Rust formed on iron surfaces in moist air?',
        options: ['Fe₂O₃ · xH₂O', 'FeSO₄', 'FeCO₃', 'Fe(OH)₂'],
        correctOptionIndex: 0,
        explanation: 'Rusting of iron forms hydrated ferric oxide Fe₂O₃ · xH₂O via slow redox reaction with oxygen and moisture.'
      },
      {
        id: 'q2',
        questionText: 'Which element in the Periodic Table has the highest electronegativity value on the Pauling scale?',
        options: ['Oxygen (O)', 'Chlorine (Cl)', 'Fluorine (F)', 'Helium (He)'],
        correctOptionIndex: 2,
        explanation: 'Fluorine (F) has the maximum Pauling electronegativity value of 3.98 due to its small atomic radius and high effective nuclear charge.'
      },
      {
        id: 'q3',
        questionText: 'What gas is evolved when an acid reacts with a active metal (e.g. Zinc with Hydrochloric acid)?',
        options: ['Oxygen (O₂)', 'Hydrogen (H₂)', 'Carbon Dioxide (CO₂)', 'Nitrogen (N₂)'],
        correctOptionIndex: 1,
        explanation: 'Acids react with active metals to produce metal salt and liberate Hydrogen gas (Zn + 2HCl → ZnCl₂ + H₂↑).'
      },
      {
        id: 'q4',
        questionText: 'What pH value range represents a neutral aqueous solution at 25°C?',
        options: ['pH = 0', 'pH = 7', 'pH = 14', 'pH = 4'],
        correctOptionIndex: 1,
        explanation: 'Pure water has [H⁺] = [OH⁻] = 10⁻⁷ M, yielding a neutral pH of 7 at 25°C.'
      },
      {
        id: 'q5',
        questionText: 'Which law states that mass can neither be created nor destroyed in a chemical reaction?',
        options: ['Law of Definite Proportions', 'Law of Conservation of Mass', 'Avogadro’s Law', 'Boyle’s Law'],
        correctOptionIndex: 1,
        explanation: 'Formulated by Antoine Lavoisier, total mass of reactants equals total mass of products.'
      },
      {
        id: 'q6',
        questionText: 'What type of reaction absorbs thermal heat energy from surroundings?',
        options: ['Exothermic Reaction', 'Endothermic Reaction', 'Combustion Reaction', 'Precipitation Reaction'],
        correctOptionIndex: 1,
        explanation: 'Endothermic reactions require net enthalpy absorption (ΔH > 0) to break chemical bonds.'
      }
    ]
  },
  {
    id: 'quiz_dbms_sem4',
    title: 'Database Management Systems: SQL Queries & Normalization',
    difficulty: 'INTERMEDIATE',
    subject: { id: 'sub_dbms', name: 'Database Systems' },
    topic: { title: 'Relational Model & BCNF' },
    totalQuestions: 6,
    duration: '12 min',
    xpReward: 180,
    attemptsCount: 34,
    questions: [
      {
        id: 'q1',
        questionText: 'Which normal form eliminates transitive functional dependencies X → Y where X is not a superkey?',
        options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'BCNF'],
        correctOptionIndex: 2,
        explanation: '3NF removes transitive dependencies, ensuring non-prime attributes depend solely on superkeys.'
      },
      {
        id: 'q2',
        questionText: 'Which SQL clause is used to filter aggregated records after a GROUP BY operation?',
        options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
        correctOptionIndex: 1,
        explanation: '`HAVING` filters aggregated group results (e.g. `HAVING COUNT(*) > 5`), whereas `WHERE` filters individual rows before grouping.'
      },
      {
        id: 'q3',
        questionText: 'What ACID property guarantees that database transactions are executed as all-or-nothing units?',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        correctOptionIndex: 0,
        explanation: 'Atomicity ensures that all statements within a transaction complete successfully, or all changes are rolled back.'
      },
      {
        id: 'q4',
        questionText: 'Which SQL join returns all rows from the left table and matching rows from the right table?',
        options: ['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN'],
        correctOptionIndex: 1,
        explanation: 'LEFT JOIN returns all records from left table, filling NULL for unmatched right table columns.'
      },
      {
        id: 'q5',
        questionText: 'What index structure is most widely used in relational databases for efficient range queries?',
        options: ['Hash Index', 'B+ Tree Index', 'Inverted Index', 'Bitmap Index'],
        correctOptionIndex: 1,
        explanation: 'B+ Trees keep data ordered in leaf nodes linked sequentially, optimizing range scans and log-time lookups.'
      },
      {
        id: 'q6',
        questionText: 'What SQL command is used to add a new column to an existing table schema?',
        options: ['UPDATE TABLE', 'ALTER TABLE ... ADD', 'MODIFY TABLE', 'INSERT INTO'],
        correctOptionIndex: 1,
        explanation: '`ALTER TABLE table_name ADD column_name datatype;` modifies relation schema.'
      }
    ]
  },
  {
    id: 'quiz_os_sem4',
    title: 'Operating Systems: CPU Scheduling & Virtual Memory',
    difficulty: 'ADVANCED',
    subject: { id: 'sub_os', name: 'Operating Systems' },
    topic: { title: 'Process Management & Deadlocks' },
    totalQuestions: 6,
    duration: '15 min',
    xpReward: 200,
    attemptsCount: 22,
    questions: [
      {
        id: 'q1',
        questionText: 'Which CPU scheduling algorithm gives optimal minimum average waiting time for a given set of processes?',
        options: ['First-Come First-Served (FCFS)', 'Shortest Job First (SJF / SRTF)', 'Round Robin (RR)', 'Priority Scheduling'],
        correctOptionIndex: 1,
        explanation: 'SJF (Shortest Job First) is provably optimal for minimizing average waiting time.'
      },
      {
        id: 'q2',
        questionText: 'What algorithm is used by OS kernels for Deadlock Avoidance by analyzing resource requests?',
        options: ['Banker’s Algorithm', 'Peterson’s Algorithm', 'LRU Page Replacement', 'Dijkstra’s Algorithm'],
        correctOptionIndex: 0,
        explanation: 'Edsger Dijkstra’s Banker’s Algorithm checks safety states before allocating resources to prevent deadlocks.'
      },
      {
        id: 'q3',
        questionText: 'What is the condition called when a process repeatedly suffers page faults due to insufficient physical RAM frames?',
        options: ['Deadlock', 'Thrashing', 'Starvation', 'Fragmentation'],
        correctOptionIndex: 1,
        explanation: 'Thrashing occurs when the OS spends more CPU time swapping pages in/out of disk than executing real instructions.'
      },
      {
        id: 'q4',
        questionText: 'What memory management technique suffers from Internal Fragmentation?',
        options: ['Paging', 'Segmentation', 'Dynamic Partitioning', 'Variable Allocation'],
        correctOptionIndex: 0,
        explanation: 'Paging allocates fixed-size physical frames; if a process payload is smaller than frame size, leftover frame space is wasted.'
      },
      {
        id: 'q5',
        questionText: 'What synchronization primitive relies on atomic test-and-set instructions to prevent race conditions?',
        options: ['Mutex Lock / Semaphore', 'Virtual Page Table', 'Translation Lookaside Buffer', 'File Control Block'],
        correctOptionIndex: 0,
        explanation: 'Semaphores and Mutex locks provide mutual exclusion for critical section access.'
      },
      {
        id: 'q6',
        questionText: 'What is Belady’s Anomaly in page replacement algorithms?',
        options: ['Page faults increase when allocated RAM frames increase', 'CPU utilization drops to zero during I/O', 'Deadlock occurs in single process system', 'Heap memory leaks'],
        correctOptionIndex: 0,
        explanation: 'Belady’s anomaly occurs in FIFO page replacement where increasing page frames leads to more page faults.'
      }
    ]
  }
];

export const QuizzesPage = () => {
  const { theme } = useTheme() || {};
  const isLight = theme === 'light';

  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [myAttempts, setMyAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'history'

  // AI Quiz Generator Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    subjectId: '',
    topic: '',
    difficulty: 'MEDIUM',
    count: 6
  });

  // Active Quiz Execution State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const notify = (message, type = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const edCtx = getEducationContext();
      const edType = String(edCtx?.educationType || 'school').toUpperCase();

      const [quizzesRes, subsRes, attemptsRes] = await Promise.all([
        quizApi.getQuizzes({ educationType: edType }).catch(() => ({ data: [] })),
        subjectApi.getAllSubjects({ educationType: edType }).catch(() => ({ data: [] })),
        quizApi.getMyAttempts().catch(() => ({ data: [] }))
      ]);

      const qList = Array.isArray(quizzesRes?.data) ? quizzesRes.data : (Array.isArray(quizzesRes) ? quizzesRes : []);
      const sList = Array.isArray(subsRes?.data) ? subsRes.data : (Array.isArray(subsRes) ? subsRes : []);
      // Filter out dummy/empty backend entries (e.g. adadad, Production Verification, test quizzes)
      const validBackendQuizzes = qList.filter(q => {
        const t = (q.title || q.name || '').toLowerCase();
        const top = (q.topic?.title || q.topic?.name || '').toLowerCase();
        const sub = (q.subject?.name || '').toLowerCase();
        const isDummy = (
          t.includes('production verification') ||
          t.includes('test quiz') ||
          t.includes('diagnostic quiz') ||
          t.includes('adadad') ||
          top.includes('adadad') ||
          top.includes('test') ||
          sub.includes('adadad')
        );
        return !isDummy;
      });

      // Merge backend quizzes with curated DEFAULT_QUIZZES without duplicates
      const seenIds = new Set();
      const finalQuizzes = [];

      validBackendQuizzes.forEach(q => {
        seenIds.add(q.id);
        finalQuizzes.push(q);
      });

      DEFAULT_QUIZZES.forEach(q => {
        if (!seenIds.has(q.id)) {
          seenIds.add(q.id);
          finalQuizzes.push(q);
        }
      });

      setQuizzes(finalQuizzes);
      setSubjects(sList);
      setMyAttempts(aList);
      if (sList.length > 0 && !aiForm.subjectId) {
        setAiForm(prev => ({ ...prev, subjectId: sList[0].id }));
      }
    } catch (err) {
      setQuizzes(DEFAULT_QUIZZES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartQuiz = async (quiz) => {
    setLoading(true);
    try {
      if (quiz.questions && quiz.questions.length > 0) {
        setActiveQuiz(quiz);
        setCurrentQIndex(0);
        setUserAnswers({});
        setQuizResult(null);
        setLoading(false);
        return;
      }
      const full = await quizApi.getQuiz(quiz.id);
      const data = full?.data || quiz;
      if (!data.questions || data.questions.length === 0) {
        notify('This quiz does not have any questions registered yet.', 'error');
        return;
      }
      setActiveQuiz(data);
      setCurrentQIndex(0);
      setUserAnswers({});
      setQuizResult(null);
    } catch (err) {
      // Fallback if network issue
      if (quiz.questions && quiz.questions.length > 0) {
        setActiveQuiz(quiz);
        setCurrentQIndex(0);
        setUserAnswers({});
        setQuizResult(null);
      } else {
        notify(err.message || 'Could not load quiz questions', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiQuiz = async (e) => {
    e.preventDefault();
    if (!aiForm.subjectId && subjects.length > 0) {
      notify('Please select a subject', 'error');
      return;
    }
    setGenerating(true);
    try {
      const edCtx = getEducationContext();
      const edType = String(edCtx?.educationType || 'school').toUpperCase();

      const res = await quizApi.generateAiQuiz({
        subjectId: aiForm.subjectId || (subjects[0]?.id || 'sub_gen'),
        topic: aiForm.topic.trim() || undefined,
        difficulty: aiForm.difficulty,
        count: Number(aiForm.count) || 6,
        educationType: edType
      });

      if (res && res.data) {
        notify('Gemini AI generated a new quiz and saved it to the database!');
        setIsAiModalOpen(false);
        await loadData();
        setActiveQuiz(res.data);
        setCurrentQIndex(0);
        setUserAnswers({});
        setQuizResult(null);
      }
    } catch (err) {
      notify(err.message || 'Gemini AI Quiz generation failed. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (optIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQIndex]: optIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !activeQuiz.questions) return;
    setSubmitting(true);
    try {
      const formattedAnswers = activeQuiz.questions.map((q, idx) => ({
        questionId: q.id,
        selectedOptionIndex: typeof userAnswers[idx] === 'number' ? userAnswers[idx] : -1
      }));

      // Try server-side evaluation API first
      const res = await quizApi.submitQuiz(activeQuiz.id, formattedAnswers).catch(() => null);
      if (res && res.data) {
        setQuizResult(res.data);
        quizApi.getMyAttempts().then(r => setMyAttempts(r.data || []));
      } else {
        // Client evaluation fallback
        let correct = 0;
        const review = activeQuiz.questions.map((q, idx) => {
          const sel = typeof userAnswers[idx] === 'number' ? userAnswers[idx] : -1;
          const isCorrect = sel === q.correctOptionIndex;
          if (isCorrect) correct++;
          return {
            questionId: q.id,
            questionText: q.questionText,
            userOption: sel >= 0 ? q.options[sel] : 'Unanswered',
            correctOption: q.options[q.correctOptionIndex],
            isCorrect,
            explanation: q.explanation
          };
        });
        const acc = Math.round((correct / activeQuiz.questions.length) * 100);
        const resObj = {
          score: correct,
          totalQuestions: activeQuiz.questions.length,
          accuracy: acc,
          xpAwarded: (correct * 20) + (acc >= 80 ? 50 : 0),
          detailedReview: review
        };
        setQuizResult(resObj);
        setMyAttempts(prev => [
          {
            id: `att_${Date.now()}`,
            score: correct,
            totalQuestions: activeQuiz.questions.length,
            accuracy: acc,
            createdAt: new Date().toISOString(),
            quiz: { title: activeQuiz.title, subject: activeQuiz.subject }
          },
          ...prev
        ]);
      }
    } catch (err) {
      notify(err.message || 'Failed to submit quiz answers', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter quizzes by search query, subject, and category tab
  const displayQuizzesList = quizzes.length > 0 ? quizzes : DEFAULT_QUIZZES;

  const filteredQuizzes = displayQuizzesList.filter(q => {
    const matchesSearch = !search ||
      q.title?.toLowerCase().includes(search.toLowerCase()) ||
      q.subject?.name?.toLowerCase().includes(search.toLowerCase()) ||
      q.topic?.title?.toLowerCase().includes(search.toLowerCase());

    const matchesSub = selectedSubjectId === 'ALL' || q.subjectId === selectedSubjectId || q.subject?.id === selectedSubjectId;

    let matchesCat = true;
    const subName = (q.subject?.name || '').toLowerCase();
    if (categoryFilter === 'SCIENCE') matchesCat = subName.includes('bio') || subName.includes('chem') || subName.includes('sci');
    else if (categoryFilter === 'PHYSICS_MATH') matchesCat = subName.includes('physic') || subName.includes('math');
    else if (categoryFilter === 'TECH') matchesCat = subName.includes('comp') || subName.includes('cs') || subName.includes('web') || subName.includes('code');

    return matchesSearch && matchesSub && matchesCat;
  });

  const getSubjectIcon = (subName = '') => {
    const s = subName.toLowerCase();
    if (s.includes('bio')) return Atom;
    if (s.includes('chem')) return FlaskConical;
    if (s.includes('physic')) return Zap;
    if (s.includes('math')) return Layers;
    if (s.includes('comp') || s.includes('web') || s.includes('code')) return Code;
    if (s.includes('ai') || s.includes('data')) return Brain;
    return BookOpen;
  };

  const getDifficultyBadge = (diff = 'MEDIUM') => {
    const d = String(diff).toUpperCase();
    if (d === 'BEGINNER') return { bg: isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(52, 211, 153, 0.2)', color: isLight ? '#059669' : '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' };
    if (d === 'ADVANCED' || d === 'EXPERT') return { bg: isLight ? 'rgba(239, 68, 68, 0.12)' : 'rgba(244, 63, 94, 0.2)', color: isLight ? '#dc2626' : '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)' };
    return { bg: isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(251, 191, 36, 0.2)', color: isLight ? '#d97706' : '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' };
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '0 0 40px 0' }}>
      
      {/* HERO BANNER WITH 3D GLASS ORB */}
      <EduNovaHeroBanner
        title="Interactive Quizzes & Question Bank"
        subtitle="Challenge your mastery with curriculum-aligned diagnostic tests or generate unlimited new assessments with Gemini AI."
        badge="✦ Adaptive Assessment Engine"
        badgeIcon={HelpCircle}
        stats={[
          { label: `${filteredQuizzes.length}`, subtext: 'Quizzes Available', icon: BookOpen, color: '#38bdf8', iconBg: 'rgba(56, 189, 248, 0.25)' },
          { label: '+170 XP', subtext: 'Avg. Reward / Quiz', icon: Zap, color: '#f59e0b', iconBg: 'rgba(245, 158, 11, 0.25)' },
          { label: `${myAttempts.length}`, subtext: 'Attempts Completed', icon: Award, color: '#34d399', iconBg: 'rgba(52, 211, 153, 0.25)' }
        ]}
      />

      {notice && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '16px',
          marginTop: '20px',
          background: notice.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: notice.type === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          color: notice.type === 'error' ? '#ef4444' : '#10b981',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {notice.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          {notice.message}
        </div>
      )}

      {/* ACTIVE QUIZ EXECUTION RUNNER */}
      {activeQuiz ? (
        <div style={{
          borderRadius: '24px',
          background: isLight ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(240, 246, 255, 0.88) 100%)' : 'linear-gradient(135deg, rgba(25, 35, 75, 0.82) 0%, rgba(15, 20, 48, 0.92) 100%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: isLight ? '1.5px solid rgba(255, 255, 255, 0.98)' : '1px solid rgba(255, 255, 255, 0.18)',
          padding: '28px',
          marginTop: '24px',
          boxShadow: isLight ? '0 15px 45px rgba(64, 100, 160, 0.12)' : '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}>
          {!quizResult ? (
            <div>
              {/* Runner Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: isLight ? '#0284c7' : '#38bdf8',
                      background: isLight ? 'rgba(2, 132, 199, 0.12)' : 'rgba(56, 189, 248, 0.16)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}>
                      {activeQuiz.subject?.name || 'Academic Quiz'} · {activeQuiz.difficulty || 'MEDIUM'}
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: isLight ? '#0f172a' : '#ffffff', fontFamily: 'var(--font-heading)' }}>
                    {activeQuiz.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: isLight ? '#64748b' : '#94a3b8', fontWeight: 700 }}>
                    Question {currentQIndex + 1} of {activeQuiz.questions.length}
                  </span>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.08)',
                      border: isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.14)',
                      color: isLight ? '#334155' : '#cbd5e1',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}
                  >
                    Exit Quiz
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ height: '7px', width: '100%', background: isLight ? 'rgba(226, 232, 240, 0.8)' : 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', overflow: 'hidden', marginBottom: '28px' }}>
                <div style={{
                  height: '100%',
                  width: `${((currentQIndex + 1) / activeQuiz.questions.length) * 100}%`,
                  background: 'linear-gradient(90deg, #38bdf8 0%, #6366f1 50%, #10b981 100%)',
                  transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </div>

              {/* Question Box */}
              {activeQuiz.questions[currentQIndex] && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.5, marginBottom: '24px', color: isLight ? '#0f172a' : '#ffffff' }}>
                    {activeQuiz.questions[currentQIndex].questionText || activeQuiz.questions[currentQIndex].text}
                  </h3>

                  {/* Options List */}
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(activeQuiz.questions[currentQIndex].options || []).map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQIndex] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            border: isSelected
                              ? (isLight ? '2px solid #0284c7' : '2px solid #38bdf8')
                              : (isLight ? '1.5px solid rgba(226, 232, 240, 0.9)' : '1px solid rgba(255, 255, 255, 0.12)'),
                            background: isSelected
                              ? (isLight ? 'rgba(224, 242, 254, 0.9)' : 'rgba(56, 189, 248, 0.18)')
                              : (isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.04)'),
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            boxShadow: isSelected ? '0 4px 16px rgba(56, 189, 248, 0.25)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: isSelected ? 'none' : (isLight ? '1.5px solid rgba(148, 163, 184, 0.6)' : '1.5px solid rgba(255, 255, 255, 0.2)'),
                            background: isSelected
                              ? 'linear-gradient(135deg, #0284c7, #2563eb)'
                              : (isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(255, 255, 255, 0.06)'),
                            color: isSelected ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.88rem',
                            flexShrink: 0
                          }}>
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span style={{ fontSize: '0.98rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? (isLight ? '#0369a1' : '#ffffff') : (isLight ? '#1e293b' : '#cbd5e1') }}>
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
                <button
                  disabled={currentQIndex === 0}
                  onClick={() => setCurrentQIndex(prev => prev - 1)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.08)',
                    border: isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.14)',
                    color: isLight ? '#334155' : '#cbd5e1',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: currentQIndex === 0 ? 'not-allowed' : 'pointer',
                    opacity: currentQIndex === 0 ? 0.5 : 1
                  }}
                >
                  Previous
                </button>

                {currentQIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                    style={{
                      padding: '11px 24px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(90deg, #0284c7 0%, #2563eb 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)'
                    }}
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    style={{
                      padding: '11px 24px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Complete & Submit Quiz'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: quizResult.accuracy >= 60 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: quizResult.accuracy >= 60 ? '#10b981' : '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: quizResult.accuracy >= 60 ? '2px solid rgba(16, 185, 129, 0.4)' : '2px solid rgba(239, 68, 68, 0.4)'
              }}>
                <Award size={40} />
              </div>

              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 6px 0', color: isLight ? '#0f172a' : '#ffffff' }}>
                {quizResult.accuracy >= 60 ? 'Quiz Completed Successfully!' : 'Quiz Attempt Finished'}
              </h2>
              <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.98rem', margin: '0 0 20px 0' }}>
                Score: <strong style={{ color: isLight ? '#0f172a' : '#ffffff' }}>{quizResult.score} / {quizResult.totalQuestions}</strong> ({quizResult.accuracy}%)
              </p>

              {quizResult.xpAwarded > 0 && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  background: 'rgba(245, 158, 11, 0.18)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: isLight ? '#d97706' : '#f59e0b',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  marginBottom: '28px'
                }}>
                  <Zap size={18} /> +{quizResult.xpAwarded} XP Recorded in Database!
                </div>
              )}

              {/* Detailed Question Review */}
              {quizResult.detailedReview && quizResult.detailedReview.length > 0 && (
                <div style={{ textAlign: 'left', marginTop: '24px', display: 'grid', gap: '14px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff' }}>Answer Review & Explanations</h4>
                  {quizResult.detailedReview.map((rev, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 18px',
                        borderRadius: '16px',
                        border: `1px solid ${rev.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        background: rev.isCorrect ? (isLight ? 'rgba(236, 253, 245, 0.8)' : 'rgba(16, 185, 129, 0.08)') : (isLight ? 'rgba(254, 242, 242, 0.8)' : 'rgba(239, 68, 68, 0.08)')
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {rev.isCorrect ? <CheckCircle2 size={18} color="#10b981" /> : <AlertTriangle size={18} color="#ef4444" />}
                        <strong style={{ fontSize: '0.96rem', color: isLight ? '#0f172a' : '#ffffff' }}>Question {idx + 1}: {rev.questionText}</strong>
                      </div>
                      <div style={{ fontSize: '0.86rem', color: isLight ? '#475569' : '#cbd5e1', marginLeft: '26px' }}>
                        Your Answer: <strong>{rev.userOption || 'Unanswered'}</strong> · Correct: <strong style={{ color: '#10b981' }}>{rev.correctOption}</strong>
                      </div>
                      {rev.explanation && (
                        <div style={{ fontSize: '0.84rem', color: isLight ? '#64748b' : '#94a3b8', marginLeft: '26px', marginTop: '6px', lineHeight: 1.4 }}>
                          💡 <em>{rev.explanation}</em>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={() => setActiveQuiz(null)}
                  style={{
                    padding: '11px 24px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Return to Quizzes Catalog
                </button>
                <button
                  onClick={() => handleStartQuiz(activeQuiz)}
                  style={{
                    padding: '11px 20px',
                    borderRadius: '9999px',
                    background: isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.08)',
                    border: isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.14)',
                    color: isLight ? '#334155' : '#cbd5e1',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCcw size={16} /> Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CATALOG VIEW */
        <div style={{ marginTop: '24px' }}>
          
          {/* Controls & Filter Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '20px'
          }}>
            {/* Catalog vs History Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('catalog')}
                style={{
                  padding: '9px 20px',
                  borderRadius: '14px',
                  border: 'none',
                  background: activeTab === 'catalog'
                    ? 'linear-gradient(90deg, #0284c7 0%, #2563eb 100%)'
                    : (isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.06)'),
                  color: activeTab === 'catalog' ? '#ffffff' : (isLight ? '#334155' : '#94a3b8'),
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'catalog' ? '0 4px 14px rgba(2, 132, 199, 0.3)' : 'none'
                }}
              >
                All Quizzes ({filteredQuizzes.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                style={{
                  padding: '9px 20px',
                  borderRadius: '14px',
                  border: 'none',
                  background: activeTab === 'history'
                    ? 'linear-gradient(90deg, #0284c7 0%, #2563eb 100%)'
                    : (isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.06)'),
                  color: activeTab === 'history' ? '#ffffff' : (isLight ? '#334155' : '#94a3b8'),
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'history' ? '0 4px 14px rgba(2, 132, 199, 0.3)' : 'none'
                }}
              >
                My Attempts ({myAttempts.length})
              </button>
            </div>

            {/* Quick Gemini AI Generator Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => setIsAiModalOpen(true)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)'
                }}
              >
                <Sparkles size={16} /> Generate AI Quiz
              </button>

              <button
                onClick={loadData}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.08)',
                  border: isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.14)',
                  color: isLight ? '#18345F' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Refresh Quizzes"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* Search & Subject Category Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '22px',
            padding: '12px 18px',
            borderRadius: '20px',
            background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'linear-gradient(135deg, rgba(30, 45, 90, 0.65) 0%, rgba(18, 25, 60, 0.78) 100%)',
            backdropFilter: 'blur(20px)',
            border: isLight ? '1px solid rgba(255, 255, 255, 0.95)' : '1px solid rgba(255, 255, 255, 0.18)'
          }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
              {[
                { id: 'ALL', label: 'All Subjects' },
                { id: 'SCIENCE', label: '🔬 Biology & Chemistry' },
                { id: 'PHYSICS_MATH', label: '📐 Physics & Math' },
                { id: 'TECH', label: '💻 Computer Science & Web' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '9999px',
                    background: categoryFilter === cat.id
                      ? (isLight ? 'rgba(2, 132, 199, 0.15)' : 'rgba(56, 189, 248, 0.2)')
                      : 'transparent',
                    border: categoryFilter === cat.id
                      ? '1px solid #38bdf8'
                      : '1px solid transparent',
                    color: categoryFilter === cat.id
                      ? (isLight ? '#0284c7' : '#38bdf8')
                      : (isLight ? '#64748b' : '#94a3b8'),
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: isLight ? '#64748b' : '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search quizzes by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 36px',
                  borderRadius: '9999px',
                  border: isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.14)',
                  background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.06)',
                  color: isLight ? '#0f172a' : '#ffffff',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {activeTab === 'catalog' ? (
            loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <RefreshCw size={32} className="spin" style={{ color: '#38bdf8', marginBottom: '12px' }} />
                <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontWeight: 600 }}>Loading quizzes from database...</p>
              </div>
            ) : filteredQuizzes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '24px',
                border: isLight ? '1px dashed rgba(2, 132, 199, 0.3)' : '1px dashed rgba(255, 255, 255, 0.14)'
              }}>
                <HelpCircle size={44} style={{ color: '#0284c7', opacity: 0.6, marginBottom: '12px' }} />
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff' }}>No Quizzes Found</h4>
                <p style={{ color: isLight ? '#64748b' : '#94a3b8', fontSize: '0.88rem', margin: '6px 0 16px 0' }}>
                  Generate an AI quiz on any topic using Google Gemini or select another subject filter.
                </p>
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles size={16} /> Generate Quiz with Gemini AI
                </button>
              </div>
            ) : (
              /* EYE-CATCHING QUIZ CARDS GRID */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {filteredQuizzes.map(q => {
                  const IconComp = getSubjectIcon(q.subject?.name || q.title);
                  const diffBadge = getDifficultyBadge(q.difficulty);
                  const questionCount = q.questions?.length || q.totalQuestions || q._count?.questions || 6;
                  const durationStr = q.duration || `${questionCount * 2} min`;
                  const xpVal = q.xpReward || (questionCount * 20 + 50);

                  return (
                    <div
                      key={q.id}
                      style={{
                        position: 'relative',
                        borderRadius: '24px',
                        background: isLight ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.92) 0%, rgba(235, 244, 255, 0.82) 100%)' : 'linear-gradient(135deg, rgba(30, 45, 90, 0.72) 0%, rgba(18, 25, 60, 0.82) 60%, rgba(35, 25, 80, 0.75) 100%)',
                        backdropFilter: 'blur(28px)',
                        WebkitBackdropFilter: 'blur(28px)',
                        border: isLight ? '1.5px solid rgba(255, 255, 255, 0.95)' : '1px solid rgba(255, 255, 255, 0.18)',
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '18px',
                        boxShadow: isLight ? '0 12px 32px rgba(64, 100, 160, 0.1)' : '0 16px 40px rgba(0, 0, 0, 0.4)',
                        overflow: 'hidden',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {/* Top Accent Line */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: 'linear-gradient(90deg, #38bdf8 0%, #6366f1 50%, #ec4899 100%)'
                      }} />

                      <div>
                        {/* Subject Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <IconComp size={18} color="#38bdf8" />
                            </div>
                            <div>
                              <strong style={{ display: 'block', fontSize: '0.84rem', color: isLight ? '#0284c7' : '#38bdf8', lineHeight: 1.1 }}>
                                {q.subject?.name || 'General Academic'}
                              </strong>
                              <span style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                                {q.topic?.title || 'Core Syllabus'}
                              </span>
                            </div>
                          </div>

                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '0.70rem',
                            fontWeight: 800,
                            background: diffBadge.bg,
                            color: diffBadge.color,
                            border: diffBadge.border
                          }}>
                            {q.difficulty || 'MEDIUM'}
                          </span>
                        </div>

                        {/* Quiz Title */}
                        <h3 style={{
                          margin: '0 0 10px 0',
                          fontSize: '1.08rem',
                          fontWeight: 800,
                          color: isLight ? '#0f172a' : '#ffffff',
                          lineHeight: 1.35,
                          fontFamily: 'var(--font-heading)'
                        }}>
                          {q.title}
                        </h3>

                        {/* Meta Tags Row */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                            color: isLight ? '#475569' : '#cbd5e1',
                            fontWeight: 600
                          }}>
                            <HelpCircle size={13} color="#38bdf8" /> {questionCount} Questions
                          </span>

                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                            color: isLight ? '#475569' : '#cbd5e1',
                            fontWeight: 600
                          }}>
                            <Clock size={13} color="#f59e0b" /> {durationStr}
                          </span>

                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.74rem',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: isLight ? '#d97706' : '#f59e0b',
                            fontWeight: 800
                          }}>
                            <Zap size={13} /> +{xpVal} XP
                          </span>
                        </div>
                      </div>

                      {/* Start Action Button */}
                      <button
                        onClick={() => handleStartQuiz(q)}
                        style={{
                          width: '100%',
                          padding: '11px 18px',
                          borderRadius: '14px',
                          background: 'linear-gradient(90deg, #0284c7 0%, #2563eb 50%, #7c3aed 100%)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 6px 18px rgba(2, 132, 199, 0.35)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Play size={16} fill="#ffffff" /> Start Assessment Now
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* MY ATTEMPTS HISTORY VIEW */
            <div style={{
              borderRadius: '24px',
              background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 26, 58, 0.75)',
              backdropFilter: 'blur(24px)',
              border: isLight ? '1.5px solid rgba(255, 255, 255, 0.95)' : '1px solid rgba(255, 255, 255, 0.12)',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff' }}>
                Your Quiz Performance & History ({myAttempts.length})
              </h3>

              {myAttempts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: isLight ? '#64748b' : '#94a3b8' }}>
                  You haven't attempted any quizzes yet. Start a quiz to track your mastery score!
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {myAttempts.map((att, attIdx) => (
                    <div
                      key={att.id || attIdx}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '16px',
                        border: isLight ? '1px solid rgba(226, 232, 240, 0.8)' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isLight ? 'rgba(248, 250, 252, 0.8)' : 'rgba(255, 255, 255, 0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '1rem', color: isLight ? '#0f172a' : '#ffffff', display: 'block' }}>
                          {att.quiz?.title || 'Subject Diagnostic Quiz'}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: isLight ? '#64748b' : '#94a3b8', marginTop: '3px' }}>
                          Date: {new Date(att.completedAt || att.createdAt || Date.now()).toLocaleDateString()} · Subject: {att.quiz?.subject?.name || 'Academic'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            color: att.accuracy >= 60 || (att.score / Math.max(1, att.totalQuestions)) >= 0.6 ? '#10b981' : '#f59e0b'
                          }}>
                            {att.score} / {att.totalQuestions} ({att.accuracy || Math.round((att.score / Math.max(1, att.totalQuestions)) * 100)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* GEMINI AI QUIZ GENERATOR MODAL */}
      {isAiModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: isLight ? '#ffffff' : '#0f172a',
            border: isLight ? '1.5px solid rgba(255, 255, 255, 0.98)' : '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 25px 65px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color="#ffffff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: isLight ? '#0f172a' : '#ffffff' }}>
                    Generate Quiz with Gemini AI
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                    Instant curriculum-aligned question synthesis
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                style={{ background: 'none', border: 'none', color: isLight ? '#64748b' : '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateAiQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isLight ? '#334155' : '#cbd5e1', marginBottom: '6px' }}>
                  Select Subject
                </label>
                <select
                  value={aiForm.subjectId}
                  onChange={(e) => setAiForm(prev => ({ ...prev, subjectId: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.16)',
                    background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.06)',
                    color: isLight ? '#0f172a' : '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  {subjects.length > 0 ? (
                    subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                  ) : (
                    <option value="sub_gen">General Academic Subject</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isLight ? '#334155' : '#cbd5e1', marginBottom: '6px' }}>
                  Target Topic Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Organic Chemistry, Quantum Physics, Calculus..."
                  value={aiForm.topic}
                  onChange={(e) => setAiForm(prev => ({ ...prev, topic: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.16)',
                    background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.06)',
                    color: isLight ? '#0f172a' : '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isLight ? '#334155' : '#cbd5e1', marginBottom: '6px' }}>
                    Difficulty Level
                  </label>
                  <select
                    value={aiForm.difficulty}
                    onChange={(e) => setAiForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.16)',
                      background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.06)',
                      color: isLight ? '#0f172a' : '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="MEDIUM">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: isLight ? '#334155' : '#cbd5e1', marginBottom: '6px' }}>
                    Question Count
                  </label>
                  <select
                    value={aiForm.count}
                    onChange={(e) => setAiForm(prev => ({ ...prev, count: Number(e.target.value) }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: isLight ? '1px solid rgba(210, 225, 250, 0.9)' : '1px solid rgba(255, 255, 255, 0.16)',
                      background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.06)',
                      color: isLight ? '#0f172a' : '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none'
                    }}
                  >
                    <option value={5}>5 Questions</option>
                    <option value={6}>6 Questions</option>
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating}
                style={{
                  marginTop: '10px',
                  padding: '12px',
                  borderRadius: '14px',
                  background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)',
                  opacity: generating ? 0.7 : 1
                }}
              >
                {generating ? (
                  <>
                    <RefreshCw size={18} className="spin" /> Generating Assessment...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} /> Synthesize & Start AI Quiz
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
