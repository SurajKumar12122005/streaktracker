import { LearningSession, GoalSettings, UserProfile } from './types';
import { getTodayStr } from './utils/dateUtils';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
  mobileNumber: '',
  title: 'Software Engineer',
  bio: '',
  profileCompleted: false,
};

export const INITIAL_GOAL_SETTINGS: GoalSettings = {
  dailyGoalMinutes: 60,
  weeklyGoalDays: 6,
  streakFreezeRemaining: 2,
  momentumGuardDays: 3,
  activeTracks: ['DSA', 'Python', 'AI/ML', 'Django', 'SQL']
};

export const INITIAL_SESSIONS: LearningSession[] = [];

export const DEMO_SESSIONS: LearningSession[] = [
  // Today: Oct 24, 2025
  {
    id: 's-2025-10-24-1',
    title: 'Binary Search & Bisect Module',
    category: 'DSA',
    durationMinutes: 45,
    date: '2025-10-24',
    notes: 'Practiced lower bound search and LeetCode #704. Good recursion tree clarity.',
    codeSnippet: `def search(nums: list[int], target: int) -> int:\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
    mastered: true,
    createdAt: 1729780000000,
  },
  // Oct 23, 2025
  {
    id: 's-2025-10-23-1',
    title: 'Django ORM Prefetch Related',
    category: 'Django',
    durationMinutes: 60,
    date: '2025-10-23',
    notes: 'Solved N+1 query problem using prefetch_related on ManyToMany fields.',
    codeSnippet: `authors = Author.objects.prefetch_related('books').filter(is_active=True)`,
    mastered: true,
    createdAt: 1729693600000,
  },
  // Oct 22, 2025
  {
    id: 's-2025-10-22-1',
    title: 'Backpropagation & Gradient Descent',
    category: 'AI/ML',
    durationMinutes: 75,
    date: '2025-10-22',
    notes: 'Derived matrix partial derivatives for 2-layer MLP.',
    codeSnippet: `dW2 = (1 / m) * np.dot(dZ2, A1.T)\ndb2 = (1 / m) * np.sum(dZ2, axis=1, keepdims=True)`,
    mastered: true,
    createdAt: 1729607200000,
  },
  // Oct 21, 2025
  {
    id: 's-2025-10-21-1',
    title: 'SQL Window Functions (ROW_NUMBER)',
    category: 'SQL',
    durationMinutes: 30,
    date: '2025-10-21',
    notes: 'Used PARTITION BY department_id ORDER BY salary DESC.',
    codeSnippet: `SELECT employee_name, department_id, salary,\n       ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank\nFROM employees;`,
    mastered: true,
    createdAt: 1729520800000,
  },
  // Oct 20, 2025 (Start of current 5-day streak)
  {
    id: 's-2025-10-20-1',
    title: 'Trie Prefix Search & Autocomplete',
    category: 'DSA',
    durationMinutes: 60,
    date: '2025-10-20',
    notes: 'Constructed Trie node map with is_end flag; implemented wildcard startsWith traversal.',
    createdAt: 1729434400000,
  },
  // Oct 11, 2025
  {
    id: 's-2025-10-11-1',
    title: 'Python AsyncIO Event Loop & Tasks',
    category: 'Python',
    durationMinutes: 50,
    date: '2025-10-11',
    notes: 'Deep dive into asyncio.gather, task cancellation semantics and asyncio.Semaphore.',
    createdAt: 1728656800000,
  },
  // Oct 10, 2025
  {
    id: 's-2025-10-10-1',
    title: 'Dynamic Programming - 0/1 Knapsack',
    category: 'DSA',
    durationMinutes: 65,
    date: '2025-10-10',
    notes: 'State table optimization from O(W*N) space down to 1D array backwards rolling iteration.',
    createdAt: 1728570400000,
  },
  // Oct 8, 2025
  {
    id: 's-2025-10-08-1',
    title: 'Django Custom Middleware Pipeline',
    category: 'Django',
    durationMinutes: 55,
    date: '2025-10-08',
    notes: 'Engineered timing metrics middleware and rate-limiting wrapper for REST endpoints.',
    createdAt: 1728397600000,
  },
  // Oct 7, 2025
  {
    id: 's-2025-10-07-1',
    title: 'PostgreSQL Indexing - B-Tree vs BRIN',
    category: 'SQL',
    durationMinutes: 45,
    date: '2025-10-07',
    notes: 'Benchmarked table scan cost with EXPLAIN (ANALYZE, BUFFERS) on 5M row timeseries.',
    createdAt: 1728311200000,
  },
  // Oct 6, 2025
  {
    id: 's-2025-10-06-1',
    title: 'Attention Mechanism & Multi-Head Math',
    category: 'AI/ML',
    durationMinutes: 80,
    date: '2025-10-06',
    notes: 'Implemented Scaled Dot-Product Attention in PyTorch with causal attention mask.',
    createdAt: 1728224800000,
  },
  // Oct 3, 2025
  {
    id: 's-2025-10-03-1',
    title: 'Monotonic Stack Patterns (Next Greater Element)',
    category: 'DSA',
    durationMinutes: 45,
    date: '2025-10-03',
    notes: 'Solved Daily Temperatures LeetCode #739 in single pass O(n) using decreasing stack.',
    createdAt: 1727965600000,
  },
  // Oct 2, 2025
  {
    id: 's-2025-10-02-1',
    title: 'Python Descriptors & Metaprogramming',
    category: 'Python',
    durationMinutes: 60,
    date: '2025-10-02',
    notes: 'Explored __get__, __set__, and __set_name__ mechanics for schema validation classes.',
    createdAt: 1727879200000,
  },
  // Oct 1, 2025
  {
    id: 's-2025-10-01-1',
    title: 'Graph Cycle Detection in Directed Graphs',
    category: 'DSA',
    durationMinutes: 60,
    date: '2025-10-01',
    notes: 'Three-color DFS state traversal (White, Gray, Black) for topological dependency sort.',
    createdAt: 1727792800000,
  },
  // Additional historical sessions across September to complete the 52 total sprints and 42 days
  // September 12 - September 25 (The 14-day record streak!)
  {
    id: 's-2025-09-25-1',
    title: 'Python Memory Profiling & GC Tracing',
    category: 'Python',
    durationMinutes: 60,
    date: '2025-09-25',
    notes: 'Used tracemalloc and objgraph to isolate cyclic reference leaks.',
    createdAt: 1727274400000,
  },
  {
    id: 's-2025-09-24-1',
    title: 'PostgreSQL CTEs & Recursive Hierarchies',
    category: 'SQL',
    durationMinutes: 65,
    date: '2025-09-24',
    notes: 'Constructed recursive WITH queries for organizational chart depth tracking.',
    createdAt: 1727188000000,
  },
  {
    id: 's-2025-09-23-1',
    title: 'Convolutional Layer Arithmetic & Stride',
    category: 'AI/ML',
    durationMinutes: 70,
    date: '2025-09-23',
    notes: 'Formulated receptive field expansions and padding output formula.',
    createdAt: 1727101600000,
  },
  {
    id: 's-2025-09-22-1',
    title: 'Dijkstra Shortest Path with Min-Heap',
    category: 'DSA',
    durationMinutes: 60,
    date: '2025-09-22',
    notes: 'O((V + E) log V) implementation using heapq with lazy visited validation.',
    createdAt: 1727015200000,
  },
  {
    id: 's-2025-09-21-1',
    title: 'Django REST Framework Serializers & Hyperlinks',
    category: 'Django',
    durationMinutes: 50,
    date: '2025-09-21',
    notes: 'Custom nested field validators and perform_create hook patterns.',
    createdAt: 1726928800000,
  },
  {
    id: 's-2025-09-20-1',
    title: 'Union-Find / Disjoint Set Union with Path Compression',
    category: 'DSA',
    durationMinutes: 60,
    date: '2025-09-20',
    notes: 'Rank balancing with near O(α(N)) inverse Ackermann time complexity.',
    createdAt: 1726842400000,
  },
  {
    id: 's-2025-09-19-1',
    title: 'Python Generators & Coroutines Deep Dive',
    category: 'Python',
    durationMinutes: 55,
    date: '2025-09-19',
    notes: 'Examined yield from bidirectional message passing and generator state machines.',
    createdAt: 1726756000000,
  },
  {
    id: 's-2025-09-18-1',
    title: 'Loss Functions: Cross-Entropy vs Focal Loss',
    category: 'AI/ML',
    durationMinutes: 65,
    date: '2025-09-18',
    notes: 'Derived numerically stable log-sum-exp trick to avoid floating point overflow.',
    createdAt: 1726669600000,
  },
  {
    id: 's-2025-09-17-1',
    title: 'LRU Cache Implementation with Doubly Linked List',
    category: 'DSA',
    durationMinutes: 60,
    date: '2025-09-17',
    notes: 'O(1) get and put invariants using hashmap + sentinel head/tail pointers.',
    createdAt: 1726583200000,
  },
  {
    id: 's-2025-09-16-1',
    title: 'PostgreSQL Transactions & Isolation Anomalies',
    category: 'SQL',
    durationMinutes: 70,
    date: '2025-09-16',
    notes: 'Demonstrated Phantom Reads, Non-Repeatable Reads, and Serializable Snapshot Isolation (SSI).',
    createdAt: 1726496800000,
  },
  {
    id: 's-2025-09-15-1',
    title: 'Django Signals vs Overriding Model Save',
    category: 'Django',
    durationMinutes: 45,
    date: '2025-09-15',
    notes: 'Architectural evaluation of post_save hooks vs encapsulated service layer methods.',
    createdAt: 1726410400000,
  },
  {
    id: 's-2025-09-14-1',
    title: 'Two Pointers & Sliding Window Maximum',
    category: 'DSA',
    durationMinutes: 60,
    date: '2025-09-14',
    notes: 'Monotonic deque window technique LeetCode #239 in O(n) amortized operations.',
    createdAt: 1726324000000,
  },
  {
    id: 's-2025-09-13-1',
    title: 'Python Type Hints & Generic Protocols',
    category: 'Python',
    durationMinutes: 50,
    date: '2025-09-13',
    notes: 'Applied TypeVar, ParamSpec, and runtime_checkable protocols with mypy.',
    createdAt: 1726237600000,
  },
  {
    id: 's-2025-09-12-1',
    title: 'Vector Embeddings & Cosine Distance Indexing',
    category: 'AI/ML',
    durationMinutes: 75,
    date: '2025-09-12',
    notes: 'Constructed HNSW graph indexing concepts and dimension reduction experiments.',
    createdAt: 1726151200000,
  },
  // Earlier September and August sessions
  {
    id: 's-2025-09-10-1',
    title: 'Segment Trees for Range Sum Queries',
    category: 'DSA',
    durationMinutes: 70,
    date: '2025-09-10',
    notes: 'Point update and range query logic with array representation 4N space.',
    createdAt: 1725978400000,
  },
  {
    id: 's-2025-09-08-1',
    title: 'Django Celery & Redis Task Queue',
    category: 'Django',
    durationMinutes: 65,
    date: '2025-09-08',
    notes: 'Configured retry backoffs and task timeouts for asynchronous email dispatch.',
    createdAt: 1725805600000,
  },
  {
    id: 's-2025-09-06-1',
    title: 'Python GIL & Multiprocessing Architecture',
    category: 'Python',
    durationMinutes: 60,
    date: '2025-09-06',
    notes: 'Shared memory arrays and ProcessPoolExecutor benchmarking.',
    createdAt: 1725632800000,
  },
  {
    id: 's-2025-09-05-1',
    title: 'DSA Tree Traversals: Morris In-Order',
    category: 'DSA',
    durationMinutes: 50,
    date: '2025-09-05',
    notes: 'Achieved O(1) auxiliary space traversal utilizing threaded binary tree predecessor pointers.',
    createdAt: 1725546400000,
  },
  {
    id: 's-2025-09-04-1',
    title: 'Django Authentication & JWT Refresh Mechanics',
    category: 'Django',
    durationMinutes: 55,
    date: '2025-09-04',
    notes: 'Cookie-based HTTP-only refresh tokens and sliding expiration policies.',
    createdAt: 1725460000000,
  },
  {
    id: 's-2025-09-03-1',
    title: 'Gradient Boosting & XGBoost Tree Splitting',
    category: 'AI/ML',
    durationMinutes: 80,
    date: '2025-09-03',
    notes: 'Second-order Taylor approximation of loss with Hessian and Gradient score calculation.',
    createdAt: 1725373600000,
  },
  {
    id: 's-2025-09-02-1',
    title: 'Python Decorators & functools.wraps',
    category: 'Python',
    durationMinutes: 45,
    date: '2025-09-02',
    notes: 'Preserving function signatures, introspection attributes, and parameterized wrappers.',
    createdAt: 1725287200000,
  },
  {
    id: 's-2025-09-01-1',
    title: 'DSA QuickSelect & Median of Medians',
    category: 'DSA',
    durationMinutes: 60,
    date: '2025-09-01',
    notes: 'Linear expected time k-th largest selection algorithm in-place partitioning.',
    createdAt: 1725200800000,
  },
  {
    id: 's-2025-08-30-1',
    title: 'SQL Database Sharding & Hash Partitions',
    category: 'SQL',
    durationMinutes: 70,
    date: '2025-08-30',
    notes: 'Declarative table partitioning in PostgreSQL 16 by RANGE and HASH.',
    createdAt: 1725028000000,
  },
  {
    id: 's-2025-08-28-1',
    title: 'Python Pytest Fixtures & Parametrization',
    category: 'Python',
    durationMinutes: 50,
    date: '2025-08-28',
    notes: 'Fixture scopes, autouse behaviors, and monkeypatch mock patterns.',
    createdAt: 1724855200000,
  },
  {
    id: 's-2025-08-27-1',
    title: 'Django Database Router Multi-Tenant Setup',
    category: 'Django',
    durationMinutes: 65,
    date: '2025-08-27',
    notes: 'Dynamic db_for_read and db_for_write routing per request schema.',
    createdAt: 1724768800000,
  },
  {
    id: 's-2025-08-25-1',
    title: 'DSA Bit Manipulation Tricks & Submask Enumeration',
    category: 'DSA',
    durationMinutes: 55,
    date: '2025-08-25',
    notes: 'Kernighan bit counting, subset generation: s = (s - 1) & mask.',
    createdAt: 1724596000000,
  },
  {
    id: 's-2025-08-23-1',
    title: 'Latent Diffusion Models & Noise Schedulers',
    category: 'AI/ML',
    durationMinutes: 85,
    date: '2025-08-23',
    notes: 'DDPM vs DDIM sampling equations and classifier-free guidance scales.',
    createdAt: 1724423200000,
  },
  {
    id: 's-2025-08-22-1',
    title: 'Python Context Managers (__enter__ and __exit__)',
    category: 'Python',
    durationMinutes: 45,
    date: '2025-08-22',
    notes: 'Handling exception suppression and @contextmanager generator wrappers.',
    createdAt: 1724336800000,
  },
  {
    id: 's-2025-08-20-1',
    title: 'DSA Topological Sorting & Kahn Algorithm',
    category: 'DSA',
    durationMinutes: 55,
    date: '2025-08-20',
    notes: 'Indegree array reduction with BFS queue for course schedule prerequisites.',
    createdAt: 1724164000000,
  },
  {
    id: 's-2025-08-18-1',
    title: 'Django Custom Manager & QuerySet Methods',
    category: 'Django',
    durationMinutes: 50,
    date: '2025-08-18',
    notes: 'Encapsulating domain queries into chainable .active().with_stats() methods.',
    createdAt: 1723991200000,
  },
  {
    id: 's-2025-08-16-1',
    title: 'Python Metaclass Validation Registry',
    category: 'Python',
    durationMinutes: 60,
    date: '2025-08-16',
    notes: 'Building pluggable handler registration using __init_subclass__.',
    createdAt: 1723818400000,
  },
  {
    id: 's-2025-08-15-1',
    title: 'DSA Fenwick Tree (Binary Indexed Tree)',
    category: 'DSA',
    durationMinutes: 65,
    date: '2025-08-15',
    notes: 'Lowbit isolation (i & -i) prefix sums and point updates in O(log N).',
    createdAt: 1723732000000,
  },
  {
    id: 's-2025-08-14-1',
    title: 'AI/ML Adam Optimizer with Weight Decay (AdamW)',
    category: 'AI/ML',
    durationMinutes: 70,
    date: '2025-08-14',
    notes: 'First moment, second moment bias correction formulas and decoupled weight decay.',
    createdAt: 1723645600000,
  },
  {
    id: 's-2025-08-12-1',
    title: 'Django Database Transactions & atomic blocks',
    category: 'Django',
    durationMinutes: 60,
    date: '2025-08-12',
    notes: 'Nested savepoints with select_for_update row-level locking.',
    createdAt: 1723472800000,
  },
  {
    id: 's-2025-08-10-1',
    title: 'DSA Dynamic Programming on Trees',
    category: 'DSA',
    durationMinutes: 75,
    date: '2025-08-10',
    notes: 'Tree diameter and subtree DP with state memoization.',
    createdAt: 1723300000000,
  },
  {
    id: 's-2025-08-08-1',
    title: 'Python ThreadPoolExecutor & CPU vs IO bounds',
    category: 'Python',
    durationMinutes: 50,
    date: '2025-08-08',
    notes: 'Concurrent HTTP scraper using futures with as_completed timeout handling.',
    createdAt: 1723127200000,
  },
  {
    id: 's-2025-08-05-1',
    title: 'DSA Heavy-Light Decomposition Basics',
    category: 'DSA',
    durationMinutes: 80,
    date: '2025-08-05',
    notes: 'Subtree size DFS, heavy edge selection, and segment tree flatten paths.',
    createdAt: 1722868000000,
  },
  {
    id: 's-2025-08-03-1',
    title: 'AI/ML Quantization (INT8 & FP4) Methods',
    category: 'AI/ML',
    durationMinutes: 70,
    date: '2025-08-03',
    notes: 'Zero-point calibration and absolute max scale factors for LLM inference.',
    createdAt: 1722695200000,
  },
  {
    id: 's-2025-08-01-1',
    title: 'DSA A* Search Algorithm & Heuristics',
    category: 'DSA',
    durationMinutes: 65,
    date: '2025-08-01',
    notes: 'Manhattan distance admissible heuristic for 2D grid pathfinding.',
    createdAt: 1722522400000,
  }
];

// Helper to calculate statistics
export function calculateStats(
  sessions: LearningSession[],
  dailyGoalMinutes: number,
  activeTracks: string[] = ['DSA', 'Python', 'Django', 'AI/ML', 'SQL'],
  referenceDateStr?: string
) {
  const todayStr = referenceDateStr || getTodayStr();
  
  // Today's minutes
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Total time
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Unique days practiced
  const uniqueDates = Array.from(new Set(sessions.map(s => s.date))).sort();
  const totalDays = uniqueDates.length;

  // Category distribution - dynamically derived from user's active tracks and recorded sessions
  const categoryCounts: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.category) {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    }
  });

  const totalSprints = sessions.length;
  // Combine user's designated active tracks with any category found in sessions
  const trackSet = new Set<string>();
  activeTracks.forEach(t => {
    if (t && t.trim()) trackSet.add(t.trim());
  });
  Object.keys(categoryCounts).forEach(cat => {
    if (cat && cat.trim()) trackSet.add(cat.trim());
  });

  const categoriesList = Array.from(trackSet);
  const categoryStats = categoriesList.map(cat => {
    const count = categoryCounts[cat] || 0;
    const percentage = totalSprints > 0 ? Math.round((count / totalSprints) * 100) : 0;
    return { name: cat, count, percentage };
  });

  // Calculate streaks dynamically
  let currentStreak = 0;
  let longestStreak = 0;

  if (uniqueDates.length > 0) {
    const dateSet = new Set(uniqueDates);
    const hasPracticedToday = dateSet.has(todayStr);

    const [ty, tm, td] = todayStr.split('-').map(Number);
    const checkDate = new Date(ty, tm - 1, td);

    if (hasPracticedToday) {
      currentStreak = 1;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      while (true) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dStr = `${y}-${m}-${day}`;
        if (dateSet.has(dStr)) {
          currentStreak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // Check if practiced yesterday
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      let y = d.getFullYear();
      let m = String(d.getMonth() + 1).padStart(2, '0');
      let day = String(d.getDate()).padStart(2, '0');
      let dStr = `${y}-${m}-${day}`;
      if (dateSet.has(dStr)) {
        currentStreak = 1;
        d.setDate(d.getDate() - 1);
        while (true) {
          y = d.getFullYear();
          m = String(d.getMonth() + 1).padStart(2, '0');
          day = String(d.getDate()).padStart(2, '0');
          dStr = `${y}-${m}-${day}`;
          if (dateSet.has(dStr)) {
            currentStreak++;
            d.setDate(d.getDate() - 1);
          } else {
            break;
          }
        }
      } else {
        currentStreak = 0;
      }
    }

    // Longest streak
    let tempStreak = 0;
    let prevTimestamp: number | null = null;
    for (const dStr of uniqueDates) {
      const parts = dStr.split('-');
      const ts = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
      if (prevTimestamp === null) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((ts - prevTimestamp) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevTimestamp = ts;
    }
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }
  }

  const remainingMinutes = Math.max(0, dailyGoalMinutes - todayMinutes);
  const progressPercent = dailyGoalMinutes > 0 ? Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100)) : 0;

  return {
    todayMinutes,
    totalMinutes,
    totalHours,
    totalDays,
    totalSprints,
    currentStreak,
    longestStreak,
    remainingMinutes,
    progressPercent,
    categoryCounts,
    categoryStats,
    todaySessionsCount: todaySessions.length,
  };
}
