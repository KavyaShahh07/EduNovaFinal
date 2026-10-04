// EduNova Universal Curriculum & Subject Topic Service
// Provides dynamic, curriculum-accurate chapter and topic hierarchies for School, College, Exam, and Skill subjects.

export const getTopicsForSubject = (subject = {}) => {
  // If subject already has a non-empty topics array from DB or local state, sanitize and return it
  if (Array.isArray(subject?.topics) && subject.topics.length > 0) {
    return subject.topics.map((t, idx) => ({
      id: t.id || `topic_${idx + 1}`,
      name: t.name || t.title || `Topic ${idx + 1}`,
      desc: t.desc || t.description || `Topic Order #${t.order || idx + 1}`,
      order: t.order || idx + 1,
      completed: Boolean(t.completed),
      isCurrent: Boolean(t.isCurrent || idx === 0),
      isWeak: Boolean(t.isWeak),
    }));
  }

  const sId = (subject?.id || '').toLowerCase();
  const sName = (subject?.name || '').toLowerCase();
  const sCategory = (subject?.category || '').toLowerCase();
  const rawName = subject?.name || 'Curriculum';

  let rawTopics = [];

  // 1. C Programming & Problem Solving / C++ / Fundamentals of Programming
  if (
    sId.includes('col_c') || 
    sId.includes('c_prog') || 
    sName.includes('c programming') || 
    sName.includes('programming in c') || 
    sName.includes('c++') || 
    (sName.includes('c') && sName.includes('problem solving')) ||
    sName.includes('computer programming')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Fundamentals of C & Problem Solving Algorithms',
        desc: 'Algorithm design, flowcharts, compilation process, main() structure, printf/scanf, variables & data types.'
      },
      {
        name: 'Chapter 2: Control Flow - Conditionals & Loop Structures',
        desc: 'if-else, switch-case, while, do-while, for loops, break/continue, and nested conditional logic.'
      },
      {
        name: 'Chapter 3: Functions, Scope & Recursive Problem Solving',
        desc: 'Function prototypes, call-by-value, local vs global scope, call stack, and recursive function design.'
      },
      {
        name: 'Chapter 4: Arrays, Matrices & String Manipulation',
        desc: '1D & 2D arrays, matrix arithmetic, null-terminated strings, and <string.h> functions (strlen, strcpy, strcmp).'
      },
      {
        name: 'Chapter 5: Pointers, Memory Addresses & Dynamic Memory Allocation',
        desc: 'Pointer arithmetic, indirection (*), address-of (&), malloc(), calloc(), realloc(), free(), and preventing memory leaks.'
      },
      {
        name: 'Chapter 6: User-Defined Data Types - Structures, Unions & Enums',
        desc: 'struct, union, typedef, structure pointers (->), bit-fields, and nested data structures.'
      },
      {
        name: 'Chapter 7: File Handling & Stream Input/Output Operations',
        desc: 'File streams (FILE*), fopen, fclose, fread, fwrite, fprintf, fscanf, and text vs binary mode operations.'
      },
      {
        name: 'Chapter 8: C Preprocessor Directives, Macros & Modular Projects',
        desc: '#include, #define, macro expansions, conditional compilation (#ifdef), header files (.h), and multi-file code structure.'
      }
    ];
  }
  // 2. Data Structures & Algorithms
  else if (
    sId.includes('dsa') || 
    sName.includes('data structure') || 
    sName.includes('algorithm') || 
    sName.includes('dsa')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Introduction to Data Structures & Big-O Time Complexity',
        desc: 'Analyzing asymptotic notation, space complexity, and memory layout of arrays.'
      },
      {
        name: 'Chapter 2: Arrays, Strings & Two-Pointer / Sliding Window Techniques',
        desc: 'Searching, sorting algorithms (Merge/Quick sort), and prefix sum array patterns.'
      },
      {
        name: 'Chapter 3: Linked Lists - Singly, Doubly & Circular Implementation',
        desc: 'Pointer manipulation, node reversal, cycle detection (Floyd’s algorithm), and memory management.'
      },
      {
        name: 'Chapter 4: Stacks & Queues - LIFO vs FIFO Applications',
        desc: 'Expression evaluation (Infix/Postfix), monotonic stacks, queue implementation using arrays & lists.'
      },
      {
        name: 'Chapter 5: Recursion, Divide & Conquer, and Backtracking',
        desc: 'Recurrence relations, N-Queens problem, subset generation, and recursive tree analysis.'
      },
      {
        name: 'Chapter 6: Binary Trees, BST & Tree Traversal Algorithms',
        desc: 'Pre-order, In-order, Post-order traversals, BST insertion/deletion, and AVL tree balancing.'
      },
      {
        name: 'Chapter 7: Binary Heaps, Priority Queues & Hashing',
        desc: 'Min-heap/Max-heap properties, Heap Sort, hash tables, collision resolution techniques.'
      },
      {
        name: 'Chapter 8: Graph Data Structures, BFS & DFS Traversals',
        desc: 'Adjacency matrix/list representation, shortest path (Dijkstra/Bellman-Ford), and Topological Sort.'
      },
      {
        name: 'Chapter 9: Dynamic Programming & Greedy Algorithms',
        desc: 'Overlapping subproblems, optimal substructure, 0/1 Knapsack, Coin Change, and Memoization.'
      }
    ];
  }
  // 3. Database Management Systems
  else if (
    sId.includes('dbms') || 
    sName.includes('database') || 
    sName.includes('dbms') || 
    sName.includes('sql')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Database System Architecture & ER Modeling',
        desc: 'Entity-Relationship diagrams, keys (Primary, Foreign, Candidate), and data independence.'
      },
      {
        name: 'Chapter 2: Relational Model & Relational Algebra',
        desc: 'Tuple Relational Calculus, Select/Project/Join operations, and set operators.'
      },
      {
        name: 'Chapter 3: Structured Query Language (SQL) Mastery',
        desc: 'DDL, DML, DCL queries, complex GROUP BY joins, subqueries, and views.'
      },
      {
        name: 'Chapter 4: Database Normalization (1NF to BCNF)',
        desc: 'Functional dependencies, lossy vs lossless decomposition, 1NF, 2NF, 3NF, and BCNF.'
      },
      {
        name: 'Chapter 5: Transaction Processing & ACID Properties',
        desc: 'Serializability, recoverability, commit/rollback, and isolation levels.'
      },
      {
        name: 'Chapter 6: Concurrency Control & Deadlock Handling',
        desc: 'Two-Phase Locking (2PL), Timestamp Ordering, and Deadlock detection/prevention.'
      },
      {
        name: 'Chapter 7: Database Indexing & Storage Structures',
        desc: 'B-Trees, B+ Trees indexing, hashing methods, and query optimization engines.'
      }
    ];
  }
  // 4. Operating Systems
  else if (
    sId.includes('os') || 
    sName.includes('operating system') || 
    sName.includes('os architecture')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Operating System Structure & System Calls',
        desc: 'Kernel architecture, dual-mode operation, process control blocks (PCB), and system call interfaces.'
      },
      {
        name: 'Chapter 2: Process Management & CPU Scheduling',
        desc: 'Process states, context switching, FCFS, SJF, Priority, and Round Robin scheduling algorithms.'
      },
      {
        name: 'Chapter 3: Process Synchronization & Mutex / Semaphores',
        desc: 'Critical section problem, Peterson’s solution, Semaphores, Monitors, and Producer-Consumer problem.'
      },
      {
        name: 'Chapter 4: Deadlocks - Characterization & Banker’s Algorithm',
        desc: 'Necessary conditions for deadlock, Resource Allocation Graphs, and Banker’s avoidance algorithm.'
      },
      {
        name: 'Chapter 5: Memory Management & Paging Systems',
        desc: 'Contiguous memory allocation, Paging, Segmentation, and Translation Lookaside Buffer (TLB).'
      },
      {
        name: 'Chapter 6: Virtual Memory & Page Replacement Algorithms',
        desc: 'Demand paging, Page Faults, FIFO, LRU, and Optimal page replacement strategies.'
      },
      {
        name: 'Chapter 7: File Systems & Disk Scheduling',
        desc: 'File allocation methods (Contiguous, Linked, Indexed), SSTF, SCAN, and C-SCAN disk algorithms.'
      }
    ];
  }
  // 5. Computer Networks
  else if (
    sId.includes('cn') || 
    sName.includes('computer network') || 
    sName.includes('network')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Network Architectures & OSI / TCP-IP Models',
        desc: 'Physical topologies, packet switching vs circuit switching, and 7-layer OSI model functions.'
      },
      {
        name: 'Chapter 2: Physical & Data Link Layer Protocols',
        desc: 'Framing, Error detection (CRC), CSMA/CD, Ethernet standards, and HDLC/PPP protocols.'
      },
      {
        name: 'Chapter 3: Network Layer - IP Addressing & Subnetting',
        desc: 'IPv4/IPv6 headers, CIDR subnetting, ARP/ICMP, and Routing algorithms (Distance Vector & Link State).'
      },
      {
        name: 'Chapter 4: Transport Layer - TCP & UDP Reliability',
        desc: 'Port numbers, TCP 3-way handshake, Flow control (Sliding Window), Congestion Control, and UDP.'
      },
      {
        name: 'Chapter 5: Application Layer Protocols & Security',
        desc: 'HTTP/HTTPS, DNS domain resolution, FTP, SMTP/POP3, SSL/TLS encryption, and Firewalls.'
      }
    ];
  }
  // 6. Web Engineering / Programming & Full Stack
  else if (
    sId.includes('web') || 
    sId.includes('fullstack') || 
    sName.includes('web') || 
    sName.includes('full stack') || 
    sName.includes('react') || 
    sName.includes('frontend')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Modern Web Architecture & HTML5 / CSS3 Layouts',
        desc: 'Semantic HTML elements, CSS Flexbox, Grid layout systems, and Responsive Design.'
      },
      {
        name: 'Chapter 2: JavaScript Foundations & Modern ES6+ Execution',
        desc: 'Scope, Closures, Promises, Async/Await, DOM manipulation, and Event Loop mechanism.'
      },
      {
        name: 'Chapter 3: Frontend Component Frameworks (React.js)',
        desc: 'JSX, Components, Props, State hooks (useState, useEffect), and Virtual DOM architecture.'
      },
      {
        name: 'Chapter 4: Backend API Development & Node.js / Express',
        desc: 'RESTful API design, Middleware pipeline, Routing, Controller logic, and JWT Authentication.'
      },
      {
        name: 'Chapter 5: Database Integration & Object Relational Mapping',
        desc: 'Connecting databases, schema migrations, CRUD queries, and relational data modeling.'
      },
      {
        name: 'Chapter 6: Application Deployment, CI/CD & Cloud Infrastructure',
        desc: 'Environment variables, Docker containers, Vercel/Render deployment, and performance monitoring.'
      }
    ];
  }
  // 7. Python & Computer Applications
  else if (
    sId.includes('python') || 
    sId.includes('cs_10') || 
    sId.includes('cs_11') || 
    sName.includes('python') || 
    sName.includes('computer application') || 
    sName.includes('code 165')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Computer Fundamentals & Cyber Ethics',
        desc: 'Hardware/software architecture, internet safety, netiquette, and digital copyright laws.'
      },
      {
        name: 'Chapter 2: HTML5 Document Structure & Web Design',
        desc: 'Headings, lists, tables, forms, audio/video embeds, and CSS styling rules.'
      },
      {
        name: 'Chapter 3: Python Programming Basics & Data Types',
        desc: 'Variables, operators, input/output, integers, floats, strings, and boolean expressions.'
      },
      {
        name: 'Chapter 4: Control Flow in Python - Branching & Loops',
        desc: 'if-elif-else statements, for loops, range() function, while loops, and break/continue.'
      },
      {
        name: 'Chapter 5: Python Collections - Lists, Tuples & Dictionaries',
        desc: 'Indexing, slicing, list comprehensions, dictionary key-value pairs, and tuple immutability.'
      },
      {
        name: 'Chapter 6: Functions & Modular Programming in Python',
        desc: 'Defining functions (def), positional vs keyword arguments, return values, and built-in modules.'
      }
    ];
  }
  // 8. Software Engineering & Agile
  else if (
    sId.includes('se_sem') || 
    sName.includes('software engineering') || 
    sName.includes('agile')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Software Development Life Cycle (SDLC) & Process Models',
        desc: 'Waterfall, Iterative, Spiral models, Agile philosophy, and DevOps integration.'
      },
      {
        name: 'Chapter 2: Agile Frameworks & Scrum Methodology',
        desc: 'Sprint planning, user stories, product backlogs, daily standups, and retrospective metrics.'
      },
      {
        name: 'Chapter 3: Software Requirements Engineering & UML Modeling',
        desc: 'SRS documentation, Use Case diagrams, Class diagrams, and Sequence diagrams.'
      },
      {
        name: 'Chapter 4: System Architecture & Software Design Patterns',
        desc: 'Cohesion, coupling, MVC architecture, Singleton, Factory, and Observer design patterns.'
      },
      {
        name: 'Chapter 5: Software Testing & Quality Assurance',
        desc: 'Unit testing, Integration testing, Black-box vs White-box testing, and automated test runners.'
      }
    ];
  }
  // 9. UI/UX Design Systems
  else if (
    sId.includes('uiux') || 
    sName.includes('ui/ux') || 
    sName.includes('design system')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: User Experience Principles & Human-Centered Design',
        desc: 'Empathy mapping, user personas, wireframing, and usability heuristics.'
      },
      {
        name: 'Chapter 2: Design Systems, Color Tokens & Typography Hierarchy',
        desc: 'Figma Auto Layout, design tokens, responsive typography scales, and glassmorphism styling.'
      },
      {
        name: 'Chapter 3: Interactive Prototyping & Motion Design',
        desc: 'Micro-interactions, component state variants, transition physics, and spring animations.'
      },
      {
        name: 'Chapter 4: Accessibility (WCAG 2.1) & Design Audits',
        desc: 'Contrast compliance, screen reader compatibility, and inclusive component design.'
      }
    ];
  }
  // 10. DevOps & Cloud Engineering
  else if (
    sId.includes('devops') || 
    sName.includes('devops') || 
    sName.includes('cloud computing') || 
    sName.includes('docker') || 
    sName.includes('kubernetes')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Containerization Fundamentals & Dockerfile Optimization',
        desc: 'Images, containers, multi-stage Docker builds, volumes, and Docker Compose networks.'
      },
      {
        name: 'Chapter 2: Continuous Integration & Continuous Delivery (CI/CD)',
        desc: 'GitHub Actions, automated build pipelines, artifact creation, and zero-downtime deployment.'
      },
      {
        name: 'Chapter 3: Kubernetes Orchestration & Cluster Architecture',
        desc: 'Pods, Deployments, Services, Ingress controllers, ConfigMaps, and Secrets management.'
      },
      {
        name: 'Chapter 4: Infrastructure as Code & Cloud Monitoring',
        desc: 'Terraform scripts, Prometheus metric collection, Grafana dashboards, and log aggregation.'
      }
    ];
  }
  // 11. Mathematics & Quantitative Aptitude
  else if (
    sId.includes('math') || 
    sId.includes('quant') || 
    sName.includes('math') || 
    sName.includes('quantitative') || 
    sName.includes('calculus') || 
    sName.includes('algebra') || 
    sCategory.includes('math')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Real Numbers & Fundamental Theorem of Arithmetic',
        desc: 'Euclid’s division lemma, prime factorization, and irrationality proofs.'
      },
      {
        name: 'Chapter 2: Polynomials & Geometrical Meaning of Zeroes',
        desc: 'Relationship between coefficients and zeroes of quadratic polynomials.'
      },
      {
        name: 'Chapter 3: Pair of Linear Equations in Two Variables',
        desc: 'Graphical method, substitution, elimination, and consistency analysis.'
      },
      {
        name: 'Chapter 4: Quadratic Equations & Discriminant Formula',
        desc: 'Standard form ax² + bx + c = 0, factorization, and nature of real roots.'
      },
      {
        name: 'Chapter 5: Arithmetic Progressions (AP) & Sum of N Terms',
        desc: 'nth term formula (an = a + (n-1)d) and real-life AP sequence applications.'
      },
      {
        name: 'Chapter 6: Triangles & Similarity Theorems (Thales Theorem)',
        desc: 'Basic Proportionality Theorem (BPT), AAA/SAS similarity criteria, and area relations.'
      },
      {
        name: 'Chapter 7: Coordinate Geometry & Distance/Section Formula',
        desc: 'Distance formula, section formula for internal division, and centroid calculations.'
      },
      {
        name: 'Chapter 8: Introduction to Trigonometry & Fundamental Identities',
        desc: 'Evaluating sin, cos, tan ratios for specific angles and verifying sin²θ + cos²θ = 1.'
      },
      {
        name: 'Chapter 9: Heights & Distances (Applications of Trigonometry)',
        desc: 'Calculating heights of towers and distances using angles of elevation & depression.'
      },
      {
        name: 'Chapter 10: Circles & Tangents to a Circle',
        desc: 'Tangents drawn from an external point and perpendicularity at the point of contact.'
      },
      {
        name: 'Chapter 11: Surface Areas and Volumes of 3D Combination Solids',
        desc: 'Calculating areas and volumes of combined cylinders, cones, and hemispheres.'
      },
      {
        name: 'Chapter 12: Statistics: Mean, Median & Mode of Grouped Data',
        desc: 'Direct method, assumed mean method, and ogive curve frequency distributions.'
      },
      {
        name: 'Chapter 13: Probability Theory & Single-Event Outcomes',
        desc: 'Theoretical probability, impossible/sure events, and deck of cards problems.'
      }
    ];
  }
  // 12. Physics
  else if (
    sId.includes('physics') || 
    sId.includes('phys') || 
    sName.includes('physics')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Light - Reflection and Refraction',
        desc: 'Spherical mirrors, ray diagrams, mirror formula, refractive index, and lens power.'
      },
      {
        name: 'Chapter 2: The Human Eye and the Colorful World',
        desc: 'Structure of human eye, vision defects (myopia/hypermetropia), prism dispersion, and atmospheric refraction.'
      },
      {
        name: 'Chapter 3: Electricity & Ohm’s Law',
        desc: 'Electric current, potential difference, Ohm’s law, resistance factors, and series/parallel combinations.'
      },
      {
        name: 'Chapter 4: Magnetic Effects of Electric Current',
        desc: 'Magnetic field lines, solenoid fields, Fleming’s left-hand rule, and electromagnetic induction.'
      },
      {
        name: 'Chapter 5: Sources of Energy & Principles of Conservation',
        desc: 'Conventional and non-conventional energy sources, solar cells, and nuclear energy safety.'
      }
    ];
  }
  // 13. Chemistry
  else if (
    sId.includes('chem') || 
    sName.includes('chem')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Chemical Reactions and Equations',
        desc: 'Balancing chemical equations, combination, decomposition, displacement, and redox reactions.'
      },
      {
        name: 'Chapter 2: Acids, Bases and Salts',
        desc: 'pH scale, neutralisation reactions, indicators, and preparation of Bleaching Powder & Plaster of Paris.'
      },
      {
        name: 'Chapter 3: Metals and Non-Metals',
        desc: 'Physical/chemical properties, reactivity series, ionic bonding, metallurgy, and corrosion prevention.'
      },
      {
        name: 'Chapter 4: Carbon and Its Compounds',
        desc: 'Covalent bonding, homologous series, IUPAC nomenclature, functional groups, and soaps/detergents.'
      },
      {
        name: 'Chapter 5: Periodic Classification of Elements',
        desc: 'Dobereiner’s Triads, Newlands’ Octaves, Mendeleev’s table, and modern periodic trends.'
      }
    ];
  }
  // 14. Biology
  else if (
    sId.includes('bio') || 
    sName.includes('bio') || 
    sName.includes('botany') || 
    sName.includes('zoology')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Life Processes - Nutrition & Respiration',
        desc: 'Autotrophic/heterotrophic nutrition, stomata mechanism, human digestive system, and cellular respiration.'
      },
      {
        name: 'Chapter 2: Life Processes - Transportation & Excretion',
        desc: 'Human heart anatomy, double circulation, xylem/phloem transport, and nephron filtration in kidneys.'
      },
      {
        name: 'Chapter 3: Control and Coordination in Organisms',
        desc: 'Nerve cell structure, reflex arc, brain anatomy, plant hormones (auxins/gibberellins), and endocrine glands.'
      },
      {
        name: 'Chapter 4: How Organisms Reproduce',
        desc: 'Fission/budding/fragmentation, flower sexual anatomy, human male/female reproductive systems.'
      },
      {
        name: 'Chapter 5: Heredity and Evolution',
        desc: 'Mendel’s monohybrid and dihybrid cross experiments, sex determination in humans, and evolutionary evidence.'
      },
      {
        name: 'Chapter 6: Our Environment & Ecosystem Dynamics',
        desc: 'Trophic levels, 10% energy flow rule, food webs, biomagnification, and ozone layer depletion.'
      }
    ];
  }
  // 15. Science General (Must NOT match computer science)
  else if (
    (sId.includes('sci') || sName.includes('science') || sCategory.includes('science')) &&
    !sName.includes('computer') &&
    !sCategory.includes('computer') &&
    !sId.includes('cs') &&
    !sName.includes('c programming') &&
    !sName.includes('programming')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Matter in Our Surroundings & Chemical Reactions',
        desc: 'States of matter, physical/chemical changes, and law of conservation of mass.'
      },
      {
        name: 'Chapter 2: The Fundamental Unit of Life & Tissues',
        desc: 'Cell structure, organelle functions, plant tissues, and animal tissues.'
      },
      {
        name: 'Chapter 3: Motion, Force and Laws of Motion',
        desc: 'Newton’s laws of motion, momentum, inertia, and kinematic equations.'
      },
      {
        name: 'Chapter 4: Work, Energy and Gravitation',
        desc: 'Kinetic and potential energy, universal law of gravitation, and power.'
      },
      {
        name: 'Chapter 5: Sound & Natural Resources',
        desc: 'Sound wave propagation, echo, ultrasound, and biogeochemical cycles.'
      }
    ];
  }
  // 16. Social Science / Humanities / History & Geography
  else if (
    sId.includes('sst') || 
    sId.includes('upsc') || 
    sName.includes('social science') || 
    sName.includes('social studies') || 
    sName.includes('history') || 
    sName.includes('geography') || 
    sName.includes('civics') || 
    sName.includes('economics') || 
    sCategory.includes('humanities') || 
    sCategory.includes('general studies')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: The Rise of Nationalism in Europe & French Revolution',
        desc: 'Examine the development of nation-states, liberalism, and 19th-century European political shifts.'
      },
      {
        name: 'Chapter 2: Nationalism in India & Civil Disobedience Movement',
        desc: 'Study the Non-Cooperation movement, Salt March, and freedom struggle milestones.'
      },
      {
        name: 'Chapter 3: Resources and Development & Soil Conservation',
        desc: 'Analyze land use patterns, soil types, and sustainable resource planning in India.'
      },
      {
        name: 'Chapter 4: Forest, Wildlife & Water Resources Management',
        desc: 'Explore multi-purpose river valley projects, rainwater harvesting, and biodiversity preservation.'
      },
      {
        name: 'Chapter 5: Agriculture, Cropping Seasons & Major Food Crops',
        desc: 'Understand Rabi, Kharif, and Zaid seasons, technological reforms, and food security.'
      },
      {
        name: 'Chapter 6: Power Sharing & Federalism in Democratic Systems',
        desc: 'Compare power-sharing mechanisms in Belgium vs Sri Lanka and decentralization in India.'
      },
      {
        name: 'Chapter 7: Sectors of the Indian Economy & Money and Credit',
        desc: 'Distinguish Primary, Secondary, and Tertiary sectors alongside formal credit institutions.'
      }
    ];
  }
  // 17. Logical Reasoning & Puzzles
  else if (
    sId.includes('reasoning') || 
    sName.includes('reasoning') || 
    sName.includes('puzzles') || 
    sName.includes('analytical')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Circular & Linear Seating Arrangements',
        desc: 'Facing inside/outside arrangements, multi-variable constraints, and boundary conditions.'
      },
      {
        name: 'Chapter 2: Syllogisms & Venn Diagram Deductions',
        desc: 'Statements, conclusions, possibilities, and 3-circle Venn diagram logic.'
      },
      {
        name: 'Chapter 3: Blood Relations & Coded Family Trees',
        desc: 'Family tree diagrams, generational hierarchy, and coded relation symbols.'
      },
      {
        name: 'Chapter 4: Coding-Decoding, Series & Analogy Sequences',
        desc: 'Pattern recognition, letter shifts, number series, and odd-one-out rules.'
      },
      {
        name: 'Chapter 5: Statement-Assumptions & Critical Logical Arguments',
        desc: 'Evaluating weak/strong arguments, course of action, and cause-and-effect reasoning.'
      }
    ];
  }
  // 18. English & Language Comprehension
  else if (
    sId.includes('eng') || 
    sId.includes('verbal') || 
    sId.includes('varc') || 
    sName.includes('english') || 
    sName.includes('verbal') || 
    sName.includes('comprehension') || 
    sCategory.includes('languages')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Reading Comprehension & Analytical Evaluation',
        desc: 'Extracting inference, vocabulary in context, and central themes from unseen prose.'
      },
      {
        name: 'Chapter 2: Formal Writing Skills - Letters & Analytical Essays',
        desc: 'Letter to Editor, business complaints, placement orders, and data report writing.'
      },
      {
        name: 'Chapter 3: Integrated Grammar - Tenses, Modals & Reported Speech',
        desc: 'Editing, omission, sentence reordering, and direct-to-indirect dialogue transformation.'
      },
      {
        name: 'Chapter 4: Literary Analysis - Prose & Character Studies',
        desc: 'Literary themes, narrative techniques, character sketches, and long analytical answer frameworks.'
      },
      {
        name: 'Chapter 5: Poetic Devices, Imagery & Verse Structure',
        desc: 'Poetic devices, rhyme schemes, metaphor identification, and stanza explanations.'
      }
    ];
  }
  // 19. General Awareness & Current Affairs
  else if (
    sId.includes('gk') || 
    sName.includes('general awareness') || 
    sName.includes('current affairs') || 
    sName.includes('innovation')
  ) {
    rawTopics = [
      {
        name: 'Chapter 1: Indian Polity, Constitution & Governance',
        desc: 'Preamble, Fundamental Rights, Parliament functions, and Judicial system.'
      },
      {
        name: 'Chapter 2: Economic Concepts, Monetary Policy & Fiscal Deficit',
        desc: 'RBI Repo Rate, Inflation indices, Union Budget, and GDP metrics.'
      },
      {
        name: 'Chapter 3: Indian Startup Ecosystem & Innovation Frameworks',
        desc: 'Venture capital financing, pitch decks, incubators, and intellectual property rights.'
      },
      {
        name: 'Chapter 4: Global International Relations & Multilateral Summits',
        desc: 'G20, UN, BRICS summits, bilateral treaties, and global economic forums.'
      }
    ];
  }
  // 20. Universal Dynamic Fallback Generator for any custom created subject
  else {
    rawTopics = [
      {
        name: `Chapter 1: Foundations & Core Concepts of ${rawName}`,
        desc: `Master the fundamental definitions, primary terminology, and introductory principles of ${rawName}.`
      },
      {
        name: `Chapter 2: Key Theoretical Models & Structural Principles`,
        desc: `Explore standard theoretical frameworks, formulas, and structural rules governing ${rawName}.`
      },
      {
        name: `Chapter 3: Intermediate Problem Solving & Methodologies`,
        desc: `Apply core analytical techniques and step-by-step methodologies to solved examples.`
      },
      {
        name: `Chapter 4: Advanced Systems & Real-World Case Studies`,
        desc: `Analyze complex scenarios, real-world case studies, and advanced applications in ${rawName}.`
      },
      {
        name: `Chapter 5: Practical Exercises & Applied Problem Sets`,
        desc: `Engage with practical problem sets, experiment simulations, and hands-on exercises.`
      },
      {
        name: `Chapter 6: System Synthesis, Revision & Final Mastery Evaluation`,
        desc: `Synthesize all major modules, review weak areas, and evaluate complete subject mastery.`
      }
    ];
  }

  // Calculate user completion state dynamically based on subject progress %
  const userProgress = typeof subject?.progress === 'number' ? subject.progress : 0;
  const totalCount = rawTopics.length;
  const completedCount = Math.min(totalCount, Math.floor((userProgress / 100) * totalCount));

  return rawTopics.map((t, idx) => {
    const isDone = idx < completedCount;
    const isCurrent = idx === completedCount || (completedCount === totalCount && idx === totalCount - 1);
    
    // Check if subject weak topic matches or highlight next upcoming topic as weak area
    const isWeak = Boolean(
      (subject?.weakTopic && (t.name.toLowerCase().includes(subject.weakTopic.toLowerCase()) || subject.weakTopic.toLowerCase().includes(t.name.toLowerCase()))) ||
      (!isDone && idx === completedCount + 1 && totalCount > 3)
    );

    return {
      id: `top_${sId || 'gen'}_${idx + 1}`,
      name: t.name,
      desc: t.desc,
      order: idx + 1,
      completed: isDone,
      isCurrent: isCurrent,
      isWeak: isWeak
    };
  });
};

