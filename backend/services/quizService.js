/**
 * EduNova Quiz Service
 * 
 * Manages cheat-proof quiz retrieval (omits correct answer keys from client payloads)
 * and server-side evaluation with atomic multi-table transactions (Prisma $transaction).
 */

const prisma = require('../config/db');

class QuizService {
  /**
   * Retrieve quiz questions with answer keys stripped to prevent cheating via DevTools
   * @param {string} quizId 
   * @param {boolean} sanitize Whether to strip correctOptionIndex and explanations
   */
  async getQuizQuestions(quizId, { sanitize = true } = {}) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        subject: {
          select: { id: true, name: true, category: true },
        },
        topic: {
          select: { id: true, title: true },
        },
        questions: {
          select: {
            id: true,
            questionText: true,
            options: true,
            // Only expose answer keys if explicitly asked (e.g. for instructors / review)
            correctOptionIndex: !sanitize,
            explanation: !sanitize,
            fingerprint: true,
          },
        },
      },
    });

    if (!quiz) {
      const error = new Error('Quiz not found');
      error.status = 404;
      throw error;
    }

    return quiz;
  }

  /**
   * Server-side Quiz Evaluation
   * Evaluates student answers, records QuizAttempt, updates LearnerProfile XP,
   * streak, and dynamic weakTopics within an atomic transaction.
   * 
   * @param {string} userId 
   * @param {string} quizId 
   * @param {Array<{ questionId: string, selectedOptionIndex: number }>|Record<string, number>} userAnswers 
   * @param {number} timeSpentSec 
   */
  async submitQuiz(userId, quizId, userAnswers, timeSpentSec = 0) {
    // 1. Fetch complete quiz with internal answer keys
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        subject: { select: { id: true, name: true } },
        topic: { select: { id: true, title: true } },
        questions: true,
      },
    });

    if (!quiz) {
      const error = new Error('Quiz not found');
      error.status = 404;
      throw error;
    }

    // Normalize user answers to a lookup map: questionId -> selectedOptionIndex
    const answerMap = new Map();
    if (Array.isArray(userAnswers)) {
      userAnswers.forEach((ans) => {
        answerMap.set(ans.questionId, Number(ans.selectedOptionIndex));
      });
    } else if (typeof userAnswers === 'object' && userAnswers !== null) {
      Object.entries(userAnswers).forEach(([qId, optIdx]) => {
        answerMap.set(qId, Number(optIdx));
      });
    }

    // 2. Evaluate answers
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const detailedReview = [];

    quiz.questions.forEach((q) => {
      const selectedIndex = answerMap.has(q.id) ? answerMap.get(q.id) : -1;
      const isCorrect = selectedIndex === q.correctOptionIndex;

      if (isCorrect) {
        correctCount += 1;
      }

      detailedReview.push({
        questionId: q.id,
        questionText: q.questionText,
        options: q.options,
        selectedOptionIndex: selectedIndex,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation || 'No explanation provided for this question.',
      });
    });

    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const roundedAccuracy = Math.round(accuracy * 10) / 10;

    // Calculate XP: 20 XP per correct question + 50 XP bonus for accuracy >= 80%
    let xpAwarded = correctCount * 20;
    if (roundedAccuracy >= 80) {
      xpAwarded += 50; // Mastery bonus
    }

    const topicOrSubjectName = quiz.topic?.title || quiz.subject?.name || 'General';

    // 3. Execute atomic multi-table updates
    const result = await prisma.$transaction(async (tx) => {
      // A. Create QuizAttempt
      const attempt = await tx.quizAttempt.create({
        data: {
          quizId,
          userId,
          score: correctCount,
          totalQuestions,
          accuracy: roundedAccuracy,
          timeSpentSec: Number(timeSpentSec) || 0,
        },
      });

      // B. Create XP transaction if points earned
      if (xpAwarded > 0) {
        await tx.xpTransaction.create({
          data: {
            userId,
            amount: xpAwarded,
            sourceTitle: `Completed Quiz: ${quiz.title} (${roundedAccuracy}% accuracy)`,
          },
        });
      }

      // C. Update LearnerProfile (XP, level, weakTopics)
      const profile = await tx.learnerProfile.findUnique({
        where: { userId },
      });

      let currentWeakTopics = profile?.weakTopics || [];
      let weakTopicsModified = false;

      // Rule: If accuracy < 60%, auto-flag as weak topic
      if (roundedAccuracy < 60) {
        if (!currentWeakTopics.includes(topicOrSubjectName)) {
          currentWeakTopics = [...currentWeakTopics, topicOrSubjectName];
          weakTopicsModified = true;
        }
      } else if (roundedAccuracy >= 80) {
        // Mastery achieved: remove from weak topics if previously flagged
        if (currentWeakTopics.includes(topicOrSubjectName)) {
          currentWeakTopics = currentWeakTopics.filter((t) => t !== topicOrSubjectName);
          weakTopicsModified = true;
        }
      }

      const updatedProfile = await tx.learnerProfile.upsert({
        where: { userId },
        update: {
          xp: { increment: xpAwarded },
          weakTopics: currentWeakTopics,
        },
        create: {
          userId,
          xp: xpAwarded,
          level: Math.floor(xpAwarded / 250) + 1,
          weakTopics: currentWeakTopics,
        },
      });

      let newXp = updatedProfile.xp;
      let newLevel = Math.floor(newXp / 250) + 1;
      if (updatedProfile.level !== newLevel) {
        await tx.learnerProfile.update({
          where: { userId },
          data: { level: newLevel },
        });
      }

      // D. Update StudentSubjectProgress if linked
      if (quiz.subjectId) {
        const subjectProgress = await tx.studentSubjectProgress.findUnique({
          where: {
            userId_subjectId: {
              userId,
              subjectId: quiz.subjectId,
            },
          },
        });

        if (subjectProgress) {
          // Weight quiz score into subject progress
          const updatedScore = Math.round((subjectProgress.progress * 0.7) + (roundedAccuracy * 0.3));
          await tx.studentSubjectProgress.update({
            where: {
              userId_subjectId: {
                userId,
                subjectId: quiz.subjectId,
              },
            },
            data: {
              progress: Math.min(100, updatedScore),
            },
          });
        }
      }

      return {
        attempt,
        newXp,
        newLevel,
        weakTopics: updatedProfile.weakTopics,
        weakTopicsModified,
      };
    });

    return {
      attemptId: result.attempt.id,
      score: correctCount,
      totalQuestions,
      accuracy: roundedAccuracy,
      xpAwarded,
      newXp: result.newXp,
      newLevel: result.newLevel,
      weakTopics: result.weakTopics,
      weakTopicsModified: result.weakTopicsModified,
      detailedReview,
    };
  }

  /**
   * Create a new quiz with its questions in a single atomic transaction
   */
  async createQuiz({ subjectId, topicId = null, title, difficulty = 'BEGINNER', questions = [] }) {
    if (!subjectId || !title || !questions.length) {
      const error = new Error('subjectId, title, and at least one question are required');
      error.status = 400;
      throw error;
    }

    return await prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          subjectId,
          topicId,
          title,
          difficulty,
          totalQuestions: questions.length,
        },
      });

      await tx.quizQuestion.createMany({
        data: questions.map((q) => ({
          quizId: quiz.id,
          questionText: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation || null,
          fingerprint: q.fingerprint || null,
        })),
      });

      return await tx.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          questions: true,
          subject: true,
        },
      });
    });
  }

  /**
   * Automatically seed high quality, comprehensive 5-10 question quizzes per education tier if missing or empty
   */
  async seedTieredQuizzesIfEmpty() {
    try {
      const quizCount = await prisma.quiz.count();
      if (quizCount >= 8) return; // Already populated

      let schoolSub = await prisma.subject.findFirst({ where: { educationType: 'SCHOOL' } });
      let collegeSub = await prisma.subject.findFirst({ where: { educationType: 'COLLEGE' } });
      let skillSub = await prisma.subject.findFirst({ where: { educationType: 'SKILLS' } });

      const fallbackSub = await prisma.subject.findFirst();
      if (!fallbackSub) return;

      // Tier 1: SCHOOL QUIZZES (K-12 Math, Science, Biology, Physics, Computer Applications)
      const schoolQuizzes = [
        {
          title: 'Class 10 Biology: Human Heart & Circulatory System',
          difficulty: 'MEDIUM',
          subjectId: (await prisma.subject.findFirst({ where: { OR: [{ id: 'sch_bio_10' }, { name: { contains: 'Bio', mode: 'insensitive' } }] } }))?.id || schoolSub?.id || fallbackSub.id,
          questions: [
            {
              questionText: 'Which chamber of the human heart pumps oxygenated blood into the aorta for systemic circulation?',
              options: ['Right Atrium', 'Right Ventricle', 'Left Atrium', 'Left Ventricle'],
              correctOptionIndex: 3,
              explanation: 'The Left Ventricle has the thickest muscular wall to generate high arterial pressure required to propel oxygenated blood through the aorta into systemic circulation.'
            },
            {
              questionText: 'What is the function of the bicuspid (mitral) valve in the human heart?',
              options: ['Prevents backflow from aorta into left ventricle', 'Prevents backflow from left ventricle into left atrium', 'Transports deoxygenated blood to lungs', 'Initiates cardiac electrical impulses'],
              correctOptionIndex: 1,
              explanation: 'The bicuspid (mitral) valve is located between the left atrium and left ventricle, closing during ventricular systole to prevent regurgitation into the left atrium.'
            },
            {
              questionText: 'Which blood vessel carries deoxygenated blood from the heart to the lungs for oxygenation?',
              options: ['Aorta', 'Pulmonary Artery', 'Pulmonary Vein', 'Coronary Artery'],
              correctOptionIndex: 1,
              explanation: 'Unlike most arteries carrying oxygenated blood, the Pulmonary Artery carries deoxygenated venous blood from the right ventricle into alveolar capillaries.'
            },
            {
              questionText: 'What is the standard resting heart rate and stroke volume formula for Cardiac Output (CO)?',
              options: ['CO = Heart Rate × Stroke Volume', 'CO = Blood Pressure / Heart Rate', 'CO = Stroke Volume / Pulse Pressure', 'CO = Heart Rate + Respiratory Rate'],
              correctOptionIndex: 0,
              explanation: 'Cardiac Output (CO) equals Heart Rate (HR, in beats/min) multiplied by Stroke Volume (SV, in mL/beat). Resting average is ~5 L/min.'
            },
            {
              questionText: 'Which organelle in plant cells carries out photosynthesis by converting solar light energy into chemical energy (Glucose)?',
              options: ['Mitochondrion', 'Chloroplast', 'Ribosome', 'Golgi Apparatus'],
              correctOptionIndex: 1,
              explanation: 'Chloroplasts contain chlorophyll pigments that absorb light photons to drive photolysis of water and carbon fixation into glucose.'
            },
            {
              questionText: 'What type of blood cells are primarily responsible for transporting oxygen via hemoglobin?',
              options: ['Leukocytes (White Blood Cells)', 'Erythrocytes (Red Blood Cells)', 'Thrombocytes (Platelets)', 'Lymphocytes'],
              correctOptionIndex: 1,
              explanation: 'Erythrocytes (Red Blood Cells) contain iron-binding hemoglobin molecules that bind oxygen reversibly in pulmonary capillaries.'
            }
          ]
        },
        {
          title: 'Class 10 Physics: Laws of Motion, Light & Circuits',
          difficulty: 'BEGINNER',
          subjectId: (await prisma.subject.findFirst({ where: { OR: [{ id: 'sch_physics_10' }, { name: { contains: 'Physic', mode: 'insensitive' } }] } }))?.id || schoolSub?.id || fallbackSub.id,
          questions: [
            {
              questionText: 'According to Newton’s Second Law of Motion, what is the relationship between Force (F), Mass (m), and Acceleration (a)?',
              options: ['F = m / a', 'F = m × a', 'F = ½ m a²', 'F = m + a'],
              correctOptionIndex: 1,
              explanation: 'Newton’s Second Law states that the net force applied on a body equals product of its mass and acceleration (F = m · a).'
            },
            {
              questionText: 'What is Ohm’s Law relationship between Voltage (V), Current (I), and Resistance (R)?',
              options: ['V = I / R', 'V = I × R', 'I = V × R', 'R = V × I'],
              correctOptionIndex: 1,
              explanation: 'Ohm’s Law states that electric current flowing through a conductor is directly proportional to voltage across it (V = I · R).'
            },
            {
              questionText: 'What type of lens is thinner at the edges and thicker in the middle, converging incident parallel light rays to a principal focal point?',
              options: ['Concave Lens', 'Convex Lens', 'Plane Glass Plate', 'Cylindrical Lens'],
              correctOptionIndex: 1,
              explanation: 'A convex (biconvex) lens is a converging lens that refracts parallel light rays towards a real principal focus (F).'
            },
            {
              questionText: 'What is the SI unit of electric current?',
              options: ['Volt (V)', 'Watt (W)', 'Ampere (A)', 'Joule (J)'],
              correctOptionIndex: 2,
              explanation: 'The Ampere (A) is the SI unit of electric current, defined as one Coulomb of charge passing per second.'
            },
            {
              questionText: 'What is the formula for Kinetic Energy of an object of mass m moving with velocity v?',
              options: ['KE = m · g · h', 'KE = ½ m v²', 'KE = F · d', 'KE = m · v'],
              correctOptionIndex: 1,
              explanation: 'Kinetic energy is scalar work stored in a moving body equal to ½ m v².'
            },
            {
              questionText: 'What phenomenon causes a rainbow to form when sunlight passes through raindrops in atmosphere?',
              options: ['Refraction, Dispersion, and Internal Reflection', 'Diffraction only', 'Polarization only', 'Absorption only'],
              correctOptionIndex: 0,
              explanation: 'Rainbows form when white sunlight undergoes refraction entering raindrops, dispersion into spectral colors, and total internal reflection.'
            }
          ]
        },
        {
          title: 'Class 10 Mathematics: Quadratic Equations & Trigonometry',
          difficulty: 'MEDIUM',
          subjectId: (await prisma.subject.findFirst({ where: { OR: [{ id: 'sch_math_10' }, { name: { contains: 'Math', mode: 'insensitive' } }] } }))?.id || schoolSub?.id || fallbackSub.id,
          questions: [
            {
              questionText: 'What is the discriminant formula (Δ) for a quadratic equation ax² + bx + c = 0?',
              options: ['b² + 4ac', 'b² - 4ac', '-b ± √(b² - 4ac)', 'a² - b²'],
              correctOptionIndex: 1,
              explanation: 'The discriminant Δ = b² - 4ac determines nature of roots: real & distinct (Δ > 0), real & equal (Δ = 0), or complex (Δ < 0).'
            },
            {
              questionText: 'What is the fundamental Pythagorean trigonometric identity?',
              options: ['sin²(θ) + cos²(θ) = 1', 'tan²(θ) + 1 = cos²(θ)', 'sin(θ) + cos(θ) = 1', 'sec²(θ) + tan²(θ) = 1'],
              correctOptionIndex: 0,
              explanation: 'sin²(θ) + cos²(θ) = 1 holds true for all angle theta derived from right triangle (Perpendicular² + Base² = Hypotenuse²).'
            },
            {
              questionText: 'If sin(θ) = 3/5 in a right-angled triangle, what is the value of cos(θ)?',
              options: ['4/5', '5/3', '3/4', '4/3'],
              correctOptionIndex: 0,
              explanation: 'In a 3-4-5 right triangle, if opposite side = 3 and hypotenuse = 5, adjacent side = √(5² - 3²) = 4. Thus cos(θ) = 4/5.'
            },
            {
              questionText: 'What is the distance between points (x₁, y₁) and (x₂, y₂) in Cartesian coordinate geometry?',
              options: ['√[(x₂ - x₁)² + (y₂ - y₁)²]', '(x₂ - x₁) + (y₂ - y₁)', '√[(x₂ + x₁)² - (y₂ + y₁)²]', '|x₂ - y₂|'],
              correctOptionIndex: 0,
              explanation: 'The Euclidean distance formula d = √[(x₂ - x₁)² + (y₂ - y₁)²] derives directly from Pythagoras theorem.'
            },
            {
              questionText: 'What is the sum of roots of a quadratic equation ax² + bx + c = 0?',
              options: ['-b / a', 'c / a', 'b / a', '-c / a'],
              correctOptionIndex: 0,
              explanation: 'According to Vieta’s formulas, sum of roots (α + β) = -b/a and product of roots (α · β) = c/a.'
            },
            {
              questionText: 'What is the volume of a sphere with radius r?',
              options: ['(4/3) π r³', '4 π r²', 'π r² h', '(1/3) π r² h'],
              correctOptionIndex: 0,
              explanation: 'Volume of a 3D sphere is (4/3) π r³ while surface area is 4 π r².'
            }
          ]
        },
        {
          title: 'Class 10 Computer Applications: Python & Boolean Logic',
          difficulty: 'BEGINNER',
          subjectId: (await prisma.subject.findFirst({ where: { OR: [{ id: 'sch_cs_10' }, { name: { contains: 'Computer', mode: 'insensitive' } }] } }))?.id || schoolSub?.id || fallbackSub.id,
          questions: [
            {
              questionText: 'Which Python data type is used to store ordered, mutable sequences enclosed in square brackets `[]`?',
              options: ['Tuple', 'List', 'Dictionary', 'Set'],
              correctOptionIndex: 1,
              explanation: 'Python Lists `[]` are mutable ordered collections, whereas Tuples `()` are immutable and Dictionaries `{}` store key-value pairs.'
            },
            {
              questionText: 'What is the output of `10 // 3` in Python floor division?',
              options: ['3.333', '3', '1', '3.0'],
              correctOptionIndex: 1,
              explanation: 'Floor division `//` divides two numbers and truncates fractional decimal digits, returning integer 3.'
            },
            {
              questionText: 'Which logic gate outputs 1 (TRUE) ONLY when ALL of its inputs are 1?',
              options: ['OR Gate', 'AND Gate', 'NOT Gate', 'XOR Gate'],
              correctOptionIndex: 1,
              explanation: 'An AND gate produces high output (1) only if input A AND input B are both 1.'
            },
            {
              questionText: 'What HTML tag is used to define an hyper-link anchor element on a webpage?',
              options: ['<link>', '<a>', '<href>', '<url>'],
              correctOptionIndex: 1,
              explanation: 'The `<a>` tag specifies a hyperlink using `href` attribute: `<a href="https://example.com">Link Text</a>`.'
            },
            {
              questionText: 'What keyword is used to declare a function in Python?',
              options: ['function', 'def', 'func', 'define'],
              correctOptionIndex: 1,
              explanation: 'Python functions are defined using the `def` keyword followed by function name and parameter list.'
            },
            {
              questionText: 'Which operator checks equality of values in JavaScript and Python?',
              options: ['=', '==', '!=', ':='] ,
              correctOptionIndex: 1,
              explanation: 'Double equals `==` tests for equality of values, whereas single `=` is the assignment operator.'
            }
          ]
        }
      ];

      // Tier 2: COLLEGE QUIZZES
      const collegeQuizzes = [
        {
          title: 'Data Structures & Algorithms: Trees, Graphs & Complexity',
          difficulty: 'MEDIUM',
          subjectId: (await prisma.subject.findFirst({ where: { OR: [{ id: 'col_dsa_sem3' }, { name: { contains: 'Data Struct', mode: 'insensitive' } }] } }))?.id || collegeSub?.id || fallbackSub.id,
          questions: [
            {
              questionText: 'What is the worst-case time complexity of QuickSort when bad pivot selection occurs on already sorted array?',
              options: ['O(N log N)', 'O(N²)', 'O(N)', 'O(1)'],
              correctOptionIndex: 1,
              explanation: 'When pivot is chosen poorly (e.g. smallest or largest element on sorted array), QuickSort degrades to O(N²) recursion tree height N.'
            },
            {
              questionText: 'Which self-balancing binary search tree maintains height balance factor |h_left - h_right| ≤ 1 for every node?',
              options: ['B+ Tree', 'AVL Tree', 'Red-Black Tree', 'Splay Tree'],
              correctOptionIndex: 1,
              explanation: 'AVL trees strictly enforce balance factor |BF| ≤ 1 at every node using single and double rotations.'
            },
            {
              questionText: 'Which graph traversal algorithm uses a First-In-First-Out (FIFO) Queue data structure?',
              options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra Algorithm', 'Prim Algorithm'],
              correctOptionIndex: 1,
              explanation: 'BFS explores graph level-by-level using a FIFO queue, whereas DFS uses a LIFO stack.'
            },
            {
              questionText: 'What is the primary advantage of a Hash Table with open addressing or chaining over a Binary Search Tree?',
              options: ['O(1) average time complexity for lookup, insert, and delete', 'Guaranteed sorted key iteration', 'Uses zero memory overhead', 'Prevents hash collisions completely'],
              correctOptionIndex: 0,
              explanation: 'Hash tables achieve O(1) expected time complexity for dictionary operations via direct array indexing.'
            },
            {
              questionText: 'What is the space complexity of Depth-First Search (DFS) on a tree of maximum depth H?',
              options: ['O(V + E)', 'O(H)', 'O(2^H)', 'O(1)'],
              correctOptionIndex: 1,
              explanation: 'DFS call stack memory is proportional to maximum height H of recursion tree.'
            },
            {
              questionText: 'Which data structure operates on Last-In-First-Out (LIFO) order?',
              options: ['Queue', 'Stack', 'Linked List', 'Heap'],
              correctOptionIndex: 1,
              explanation: 'A Stack processes elements LIFO (Push onto top, Pop from top).'
            }
          ]
        },
        {
          title: 'Database Management Systems: SQL, ACID & Indexing',
          difficulty: 'ADVANCED',
          subjectId: (await prisma.subject.findFirst({ where: { OR: [{ id: 'col_dbms_sem5' }, { name: { contains: 'Database', mode: 'insensitive' } }] } }))?.id || collegeSub?.id || fallbackSub.id,
          questions: [
            {
              questionText: 'In relational database ACID properties, what does Atomicity guarantee?',
              options: ['Transactions execute in complete isolation', 'All operations within a transaction complete fully or rollback entirely (All-or-Nothing)', 'Data remains in valid state after crash', 'Disk blocks are encrypted'],
              correctOptionIndex: 1,
              explanation: 'Atomicity ensures that a transaction is atomic: if any single SQL statement fails, the entire transaction is aborted and rolled back.'
            },
            {
              questionText: 'Why are B+ Trees preferred over standard Binary Search Trees for relational database indexing on secondary storage?',
              options: ['B+ Trees store data in RAM only', 'B+ Trees have high fanout factor (B) reducing disk seek block IOs to O(log_B N)', 'B+ Trees do not support range queries', 'B+ Trees require no re-balancing'],
              correctOptionIndex: 1,
              explanation: 'B+ Tree nodes match disk page sizes (16KB) with high fanout factor B=100-500, requiring only 3-4 disk seeks to locate rows.'
            },
            {
              questionText: 'Which SQL JOIN returns all rows from the left table, and matching rows from the right table, filling NULLs if no match exists?',
              options: ['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN'],
              correctOptionIndex: 1,
              explanation: 'LEFT JOIN preserves all records from left table regardless of whether matching records exist in right table.'
            },
            {
              questionText: 'What Normal Form requires removing transitive functional dependencies (X → Y where Y → Z)?',
              options: ['1NF', '2NF', '3NF', 'BCNF'],
              correctOptionIndex: 2,
              explanation: 'Third Normal Form (3NF) requires 2NF and elimination of transitive non-key dependencies.'
            },
            {
              questionText: 'What is a Primary Key constraint in relational databases?',
              options: ['Column with unique non-null values uniquely identifying each row', 'Column containing foreign key pointers', 'Nullable index column', 'Auto-incrementing string'],
              correctOptionIndex: 0,
              explanation: 'A Primary Key enforces uniqueness and NOT NULL constraints on table records.'
            },
            {
              questionText: 'Which SQL clause is used to filter aggregate results grouped by `GROUP BY`?',
              options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
              correctOptionIndex: 1,
              explanation: '`WHERE` filters individual rows before grouping, whereas `HAVING` filters aggregated group records.'
            }
          ]
        }
      ];

      // Tier 3: SKILLS QUIZZES
      const skillQuizzes = [
        {
          title: 'Full Stack Web Architecture & React Masterclass',
          difficulty: 'MEDIUM',
          subjectId: (await prisma.subject.findFirst({ where: { OR: [{ id: 'skl_fullstack' }, { name: { contains: 'Full', mode: 'insensitive' } }] } }))?.id || skillSub?.id || fallbackSub.id,
          questions: [
            {
              questionText: 'What is the primary purpose of the `useMemo` hook in React?',
              options: ['Executes side effects after component DOM paint', 'Memoizes expensive calculation results to avoid recalculation on unrelated re-renders', 'Triggers async API network requests', 'Replaces Redux store completely'],
              correctOptionIndex: 1,
              explanation: '`useMemo` caches the return value of an expensive calculation function between re-renders when dependencies remain unchanged.'
            },
            {
              questionText: 'In RESTful Web APIs, which HTTP verb should be used for idempotent full resource updates?',
              options: ['POST', 'PUT', 'PATCH', 'GET'],
              correctOptionIndex: 1,
              explanation: 'PUT replaces an entire target resource representation and is idempotent (calling it multiple times produces identical server state).'
            },
            {
              questionText: 'What is the function of CORS (Cross-Origin Resource Sharing) headers in modern browsers?',
              options: ['Accelerates static image CDN caching', 'Allows servers to specify which external origins can read resources via browser HTTP requests', 'Encrypts WebSockets payloads', 'Compiles JavaScript to WebAssembly'],
              correctOptionIndex: 1,
              explanation: 'CORS is a browser security mechanism using HTTP headers to permit domain origins to access protected API endpoints.'
            },
            {
              questionText: 'What is the role of Node.js Event Loop?',
              options: ['Executes multi-threaded CPU matrix operations', 'Handles non-blocking asynchronous I/O callbacks on a single main thread', 'Compiles C++ native addons', 'Manages SQL database connections'],
              correctOptionIndex: 1,
              explanation: 'Node.js event loop delegates asynchronous I/O calls to OS kernel/libuv thread pool and executes callbacks on single JS thread.'
            },
            {
              questionText: 'What structure is a JWT (JSON Web Token) composed of?',
              options: ['Header.Payload.Signature', 'User.Password.Salt', 'Key.Value.Checksum', 'Client.Server.Session'],
              correctOptionIndex: 0,
              explanation: 'JWTs consist of three Base64URL-encoded parts separated by dots: Header, Payload (claims), and Cryptographic Signature.'
            },
            {
              questionText: 'In CSS Flexbox layout, which property aligns flex items along the main axis?',
              options: ['align-items', 'justify-content', 'align-content', 'flex-direction'],
              correctOptionIndex: 1,
              explanation: '`justify-content` defines alignment of items along flex main axis, while `align-items` controls cross-axis alignment.'
            }
          ]
        }
      ];

      const allSeedQuizzes = [...schoolQuizzes, ...collegeQuizzes, ...skillQuizzes];
      for (const qData of allSeedQuizzes) {
        if (!qData.subjectId) continue;
        const exists = await prisma.quiz.findFirst({ where: { title: qData.title } });
        if (!exists) {
          await this.createQuiz({
            subjectId: qData.subjectId,
            title: qData.title,
            difficulty: qData.difficulty,
            questions: qData.questions
          });
        }
      }
    } catch (e) {
      console.warn('[QuizSeeder Notice]', e.message);
    }
  }

  /**
   * List available quizzes with optional filters and bounded pagination
   */
  async listQuizzes({ subjectId, topicId, difficulty, educationType, search, page = 1, limit = 20 } = {}) {
    await this.seedTieredQuizzesIfEmpty();

    const where = {};
    if (subjectId && subjectId !== 'ALL') where.subjectId = subjectId;
    if (topicId) where.topicId = topicId;
    if (difficulty && difficulty !== 'ALL') where.difficulty = difficulty;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * take;

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, educationType: true } },
        topic: { select: { id: true, title: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    return quizzes;
  }

  /**
   * Retrieve student's personal quiz attempt history from PostgreSQL
   */
  async getUserAttempts(userId, { limit = 30 } = {}) {
    return await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            subject: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(100, Math.max(1, parseInt(limit, 10) || 30)),
    });
  }
}

module.exports = new QuizService();
