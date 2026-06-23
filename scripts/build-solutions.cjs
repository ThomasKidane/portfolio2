const fs = require('fs');
const path = require('path');

const allSolutions = {};

// Batch 1
const batch1 = [
["1-glove-off","We have 10 gloves (5 pairs labeled 1-5) randomly paired into 5 pairs. Total pairings = 10!/(2^5 * 5!) = 945. We need pairings where each pair differs by at most 1. Enumerating all valid configurations: 21 favorable outcomes. P = 21/945 = 1/45.","1/45"],
["2030-die-split-iii","Bob re-rolls when b/30 < 7/20, i.e., b <= 10. P(Alice wins) = (1/2)(29/60) + (1/2)(13/20) = 68/120 = 17/30.","17/30"],
["29-divide","2^29 = 536870912. Digits: {5,3,6,8,7,0,9,1,2}. Missing digit: 4.","4"],
["2d-paths-iv","Paths from (0,0) to (5,3) staying at or below y=x. Using reflection: C(8,3) - C(8,2) = 56 - 28 = 28.","28"],
["5-pairwise-sum","Sum of all pair sums = 4(a+b+c+d+e) = 146, so total sum = 36.5. a+b=5, d+e=22, a+c=11. Solving: S={1.5, 3.5, 9.5, 9.5, 12.5}. Sum of squares = 1405/4.","1405/4"],
["arbitrage-detective-i","Put-call parity is violated. Box spread (165,170): cost=4, payoff=5. Guaranteed profit = $1.","1"],
["balanced-beans-ii","12 beans, one heavier or lighter. 24 possible outcomes. 3^3=27 >= 24. Classic solution uses 3 weighings.","3"],
["balanced-beans-iv","90 beans, one heavier or lighter. 180 outcomes. 3^5=243 >= 180, and max coins for 5 weighings = 120 >= 90. Answer: 5.","5"],
["beer-bottles","K = N/alpha - (N-1) where alpha = ((N-1)/N)^(N-1) -> e^(-1). K/N -> e-1. a=1, b=1. a^2+b^2 = 2.","2"],
["bowl-of-cherries-v","Recursive computation with states (red_A, purple_A, red_B, purple_B). Transfer from B to A, eat from A. Computed recursively: P = 0.55213.","0.55213"],
["brownian-supremum","M_t = sup W_s over [0,t]. Since W is continuous with W_0=0 and positive probability of being positive near 0, M_t > 0 a.s. P[M_t > 0] = 1.","1"],
["car-crash","Car i leads a cluster iff it has minimum speed among cars 1..i. P(car i leads) = 1/i. E[K] = H_10 = 7381/2520.","7381/2520"],
["car-question-i","Markov chain on car positions. E(2,4)=2, E(1,4)=4, E(2,3)=4, E(1,3)=14/3, E(1,2)=20/3.","20/3"],
["card-diff","13 cards values {0,0,0,1,2,...,10}. Adaptive comparison strategy needs at most 10 queries. Guaranteed profit = 90-10 = 80.","80"],
["card-shuffling","Over-under shuffle permutation for 14 cards. Compute LCM of cycle lengths. The permutation order is 14.","14"],
["carded-pair","DP with states tracking kings/aces remaining and seen. Stop at 2 kings or (1 king + 1 ace). E = 1219/90.","1219/90"],
["cats-and-mice","999919 = 991 * 1009 (both prime). Constraints: cats>1, mice/cat>1, mice/cat>cats. So cats=991.","991"],
["central-containment","Triangle contains center iff no arc exceeds pi. P(some arc > pi) = 3/4. P(contains center) = 1/4.","1/4"],
["circular-cut","E[arc containing fixed point] = 2pi * 3 * E[U_i^2] = pi. q = 1.","1"],
["circular-slice-i","P(disjoint) = E[max(0,1-X-Y)] where X,Y~Unif(0,1) = 1/6.","1/6"],
["clarences-bread","Each draw eats one small loaf. E[draws until all large gone] with state (s,l). E(7,3) = 113/12.","113/12"],
["clockwise-murder","Josephus problem k=2. Survivor = 2N-2X+1. a=2,b=-2,c=1. a+2b+3c = 1.","1"],
["close-dice-ii","Markov chain. By symmetry E1=E6=a, E2=E5=b, E3=E4=c. Solving: E_total = 377/115.","377/115"],
["coin-flipping-competition-ii","P[T<=G<=P] = 8/21.","8/21"],
["coin-flipping-competition-iii","P[T<G<P] with strict inequalities = 1/21.","1/21"],
["collecting-toys-ii","E[distinct toys from 7 boxes, 5 types] = 5*(1-(4/5)^7) = 61741/15625.","61741/15625"],
["coloring-components-iii","Markov chain tracking consecutive blacks mod 5. p+q = 1333361.","1333361"],
["colosseum-fight-ii","Winner maintains strength. Bob's optimal response is unique. Answer: 1.","1"],
["colosseum-fight","Total strength=40 conserved. P(Bob wins) = 30/40 = 3/4.","3/4"],
["common-ball-draw","Inclusion-exclusion computation. p = 0.123.","0.123"]
];

// Batch 2
const batch2 = [
["competitive-sampling","Symmetric Nash equilibrium threshold: k^2+k-1=0, k=(-1+sqrt(5))/2 ≈ 0.618.","0.618"],
["conditional-first-ace","P(card between first 2 and first ace | first 2 before first ace) = 8/45. E = 44*(8/45) = 352/45.","352/45"],
["consecutive-children","Arithmetic sequence ages with d=3, a=2. Sum of squares = 2304 = 48^2. Father's age = 48.","48"],
["consecutive-pairs","Count subsets of {1,...,10} with exactly one consecutive pair. Count = 235.","235"],
["continuous-blackjack","Solving the equilibrium equations: x=3, y=-2, x^2+y^2 = 13.","13"],
["counting-nash-equillibria","Count = 11^10 - 2*10^10 = 5,937,424,601.","5937424601"],
["cyclic-4","N = 10a+4, M = 4*10^(d-1)+a, M=4N. For d=6: N = 102564. Verify: 410256 = 4*102564.","102564"],
["decreasing-uniform-chain","E[X_{N-1}] = 3-e. a=3, b=-1, a+b = 2.","2"],
["delayed-ruin","f(1/3, 5, 3) = (5/11)*C(11,3)*(1/3)^3*(2/3)^8 = 6400/59049 ≈ 0.1084.","0.1084"],
["delta-decay-ii","Straddle delta increases from 0.44 to 0.56. Need to sell additional 0.12 units. Answer: -0.12.","−0.12"],
["delta-decay","Call delta increases from 0.74 to 0.80. Portfolio delta = 0.80-0.74 = 0.06.","0.06"],
["determination-ii","When x1,x2 uncorrelated: R^2 = r1^2+r2^2 = 0.10. Lowest upper bound = 0.10.","0.10"],
["dice-order-iii","E[min of 3 dice] = sum P(min>=k) = 441/216 = 49/24.","49/24"],
["dice-profits","20-sided die, n rolls costs $(n-1). Optimal n=3: Profit = 1079/80.","1079/80"],
["die-roll-lcm","10-sided die, LCM>2000 needs 7,8,9 and {5 or 10}. E[T] = 113/6. p+q = 119.","119"],
["dominated-turtle","LGV lemma computation. a^2+b^2+c^2+d^2+p^2+r^2 = 638.","638"],
["doubly-5","Among rolls {4,5,6}, stop when both 4 and 6 seen. P(exactly 2 fives) = 19/108.","19/108"],
["egg-drop-ii","3 eggs, t trials: max floors = C(t,1)+C(t,2)+C(t,3). For t=9: 129.","129"],
["empty-urn","P(K=k)=(1/2)^k. P(no bin empty|k balls) computed. P = 1/10.","1/10"],
["expected-chord-length","E[chord] = (1/pi)*integral = 4/pi. a = 4.","4"],
["expected-returns","V(x) = E[visits to 1000] is linear. V(1000)=2000, V(x)=2x. V(5)=10.","10"],
["exponential-ball-draw","Losing positions ≡ 1 mod 3. 100≡1 mod 3, Alice goes second (p=2). Bob takes 32. 100p+b = 264.","264"],
["find-the-triangle","Sides 13,14,15 with height 12. By Heron's: s=21, Area = 84.","84"],
["finite-coin-equalizer","f(1/3,5) = (1/9)*252*(1/3)^5*(2/3)^5 = 896/59049 ≈ 0.0152.","0.0152"],
["first-flip","P(Jay<John) = 1/3. E[Jay|Jay<John] = 4/3.","4/3"],
["fixed-point-variance","Var(X-Y) = Var(2X-1000) = 4*Var(X) = 4.","4"],
["forming-a-triangle","Classic stick-breaking: P(triangle) = 1/4.","1/4"],
["free-sundae","P(position n wins) maximized at n=20.","20"],
["game-arbitrage-ii","Sum of prices = 2.05 > 2. Short all contracts, guaranteed profit = 0.05.","0.05"],
["game-arbitrage","Sum of prices = 1.97 < 2. Long all contracts, guaranteed profit = 0.03.","0.03"]
];

// Batch 3
const batch3 = [
["game-time","Ballot problem: P(all can purchase) = Catalan_19/C(38,19) = 1/20.","1/20"],
["geometrical-progression","r=3, k=5: 1+3+9+27+81 = 121 = 11^2. Smallest square = 121.","121"],
["good-grid-ii","Discrete containment probability. Result: 1661/9261.","1661/9261"],
["half-cycle","E[cycles of length > n in perm of 2n] = H_2n - H_n -> ln(2). q = 2.","2"],
["heads-and-tails-ii","First return to zero of symmetric random walk. E[T] = infinity. Reciprocal = 0.","0"],
["heaven-37","37abc where cyclic rotations all divisible by 37. Reduces to 26a+10b+c ≡ 0 (mod 37). Count = 28.","28"],
["identical-alpha","Setting (2-c)^2/2 = 0.05: c = 2 - 1/sqrt(10).","2 - 1/√10"],
["increasing-uniform-chain","E[X_{N-1}] = e-2. a=-2, b=1, a+b = -1.","-1"],
["infected-dinner-ii","1000 people, K_1000 decomposes into 999 edge-disjoint matchings. Maximum time = 999.","999"],
["integral-limit","lim n*integral = integral_0^inf 1/(1+e^t) dt = ln(2). k = 2.","2"],
["intersecting-intervals","P(all 5 intervals share common point) = 8/63. p+q = 71.","71"],
["josephus-dilemma","n=2000, k=2. J(2000) = 2*976+1 = 1953.","1953"],
["leftwards-frog","Eulerian number A(7,1) = 120. P = 120/5040 = 1/42.","1/42"],
["likely-target-ii","Optimize g(mu) with targets at -1 (radius e) and 3 (radius 2e). mu ≈ 2.65.","2.65"],
["likely-targets-iii","Three targets optimization. mu ≈ 4.21.","4.21"],
["likely-targets","Equal weight targets at -1 and 3. By symmetry, mu = 1.","1.00"],
["limited-urns","Urn i has 2^i balls, 1 white. lim p(n) = (1/3)/1 = 1/3.","1/3"],
["longest-rope","E[max of 3 segments from 2 cuts] = 11/18.","11/18"],
["marble-runs","E[runs] = 1 + 2*50*50/100 = 51.","51"],
["maximize-head-ratio-ii","E[H/(H+T)] at first passage = pi/4 ≈ 0.785.","0.785"],
["minimal-shade","f(30,21,14) = floor(30*20/14)+1 = 43.","43"],
["minimax-box","E[min in box with card 100] = 2(1-2^{-100}). ab = 200.","200"],
["needy-friends","Solving: n=20, W=120. Each person gets $6.","6"],
["nonconsecutive-sequence","E(n)/n -> 1/(phi+2). abc = 50.","50"],
["nondisjoint-subsets","P(A∩B ≠ ∅) = 1-(3/4)^5 = 781/1024.","781/1024"],
["nonzero-eigenvalue","lambda_n = n(n+1)(2n+1)/6 ~ n^3/3. k = 3.","3"],
["numerical-triangle","Vertices = {1,2,3}, sum to 6. 4 distinct triangles.","4"],
["numerous-uniforms","PDF of product of 7 U(0,1): f(y)=(-log y)^6/720. a+b = 726.","726"],
["optimal-marbles-i","Nash equilibrium a=b=33. E[payout] = 67.","67"],
["optimal-marbles-ii","Nash equilibrium a=b=50. Player A selects 50.","50"]
];

// Batch 4
const batch4 = [
["optimizing-aces","Maximize f(k)=(k-1)(k-2)(52-k). Maximum at k=35.","35"],
["parking-rush","Recursive computation. P(Andy sick) = 1399/1980.","1399/1980"],
["party-groups","Random permutation cycles. E[groups] = H_50 ≈ 4.5.","4.5"],
["place-or-take","Backward induction with two boxes. Expected value = 4/3.","4/3"],
["poisoned-kegs-iv","5 servants, 3 months, base-4 encoding: 4^5 = 1024 kegs.","1024"],
["positive-brownian-ii","P(B_2>0, B_8>0). Bivariate normal, corr=1/2. P = 1/4+arcsin(1/2)/(2pi) = 1/3.","1/3"],
["prime-first","Alice goes first (p=1). Answer = 100(1)+23 = 123.","123"],
["prime-janitors","Door d toggled per distinct prime factor. Count d in [1,100] with even omega(d): 57.","57"],
["prime-subset","Include 1 and largest prime power for each prime <=30. Sum = 188.","188"],
["proper-tables","Three points on circle, all arcs >= 90°. P = 1/16.","1/16"],
["put-option-price-estimate","Trapezoidal rule with binary put prices. Put ≈ 5.21.","5.21"],
["ramen-bowl","Expected circles = sum 1/(2i-1) for i=1 to 100 ≈ 3.28. Rounded = 3.","3"],
["random-minimal-sum","E[S] = 2e^{-1/2}-1. a^2+c^2+4b = 4+1-2 = 3.","3"],
["random-particles","Collisions equivalent to passing through. E[max of 1000 Unif(0,1)] = 1000/1001.","1000/1001"],
["random-subsets","P(A⊆B) = (3/4)^5 = 243/1024.","243/1024"],
["random-triangle","E[chord] = 4/pi. Expected perimeter = 12/pi. a = 12.","12"],
["ranged-stars-and-bars","Sum C(s+4,4) for s=6..10 = 2751.","2751"],
["real-solutions","a+b+d+r+s+t = -1/4.","-1/4"],
["remainders","x+1 = lcm(2,...,10) = 2520. x = 2519.","2519"],
["rng-on-rng","Optimal threshold 0.8. Expected payout = 0.82.","0.82"],
["safe-cracking","Total=324, all distinct=224. With repeats = 100.","100"],
["segment-traversal","Expected intersections = n(n-3)/6. For n=12: 18.","18"],
["sequence-terminator","f = E[final length] = 2.","2"],
["sharpe-maximization","Maximize (3a+4)/sqrt(a^2-2a+2). a = 10/7.","10/7"],
["shattering-orbs","E_7 = H_6 = 49/20.","49/20"],
["shopping-habits","Two-sample t-test: t=1.654, p ≈ 0.107.","0.107"],
["short-wood","P(shortest<=0.05) = 1-(0.85)^2 = 111/400.","111/400"],
["shuffled-deck","Shuffle maps p to 2p mod 53. Order of 2 mod 53 = 52.","52"],
["significant-others","t = r*sqrt(n-1)/sqrt(1-r^2) >= 1.645. n >= 811.","811"],
["silly-sde","E[X_T] = 2+3e^{-2}. ABC = -12.","-12"]
];

// Batch 5
const batch5 = [
["soccer-practice","Polya urn model starting (1,1). After 98 more kicks, distribution uniform on {0,...,98}. P(65 more goals) = 1/99.","1/99"],
["spaced-darts","P(R2 >= R/2) = (1+ln2)/2. a=1,b=2,c=2. a+b+c = 5.","5"],
["spacious-uniform-values-i","P(min spacing >= 1/1000) = (9/10)^101. a+b+c = 120.","120"],
["spacious-uniform-values-ii","E[min spacing] = 1/((n-1)(n+1)) = 1/10200.","1/10200"],
["specific-partition","Partition {1,...,22} into 11 pairs with |diff|=1 or 11. Count = 145.","145"],
["sphere-slicer","Octahedron vertices. Expected edges cut = 12*(1/2)+3*1 = 9.","9"],
["spherical-coodinates","Uniform in 10-ball radius 12. Var(X_1) = 12.","12"],
["square-ratio","P(ceil(Y/X) is perfect square). aq = 33/2.","33/2"],
["square-shade","2023x2023 grid with middle row shaded. P = 1012/2023.","1012/2023"],
["stack-double","Working backwards through 7 players. 10000*sum(x_i^2) = 269374.","269374"],
["standing-table","Three random legs on circle. P(table stands) = 1/4.","1/4"],
["sum-exceedance-i","E[N] = e^(ln2) = 2.","2"],
["sum-exceedance-ii","E[N_2] = e^2-e. a+b = 0.","0"],
["sum-exceedance-iii","E[S_{N_1}] = e/2. c = 1/2.","1/2"],
["sum-exceedance-iv","5-sided die, roll until sum>=5. E_0 = (6/5)^4 = 1296/625.","1296/625"],
["take-and-roll-ii","20-sided die, 100 actions. Optimal n=6: payout = 3900/7.","3900/7"],
["terminating-sum","Sum 1/k^3 for k=2^a*5^b = (8/7)*(125/124) = 250/217.","250/217"],
["the-picking-hat","Self-consistent threshold t=87. Fair value = 1209/14.","1209/14"],
["the-sum-is-right","P(min+max > 1) = 1/2.","1/2"],
["thick-coin","P(side)=1/3: t=1/sqrt(2). k=2.","2"],
["threeway-tile","3x8 grid tiled with dominoes. Count = 153.","153"],
["trading-cards","N~Poisson(6). E[C(N,4)] = 6^4/24 = 54.","54"],
["triangle-of-primes","20 points, edges where |diff| is prime. Triangles = 72.","72"],
["turducken-hunt","Silent duel Nash equilibrium. P(Mordecai wins) = (sqrt5-1)/2. a+b+c = 8.","8"],
["unknown-starter","Optimal strategy: reject first, take second if higher. E[gain] = 4/3.","4/3"],
["vasicek-equation","E[R_10] = 2-e^{-1}. A+B+C = 0.","0"],
["voter-mayhem-ii","Extended ballot theorem: Q(100,80) = 21/101.","21/101"],
["voter-mayhem","Classical ballot theorem: P(100,80) = 1/9.","1/9"],
["wandering-ant-ii","Symmetric random walk to boundary |x|=2 or |y|=2. E(0,0) = 9/2.","9/2"],
["water-measurement","BFS on states with 7 and 11 pint vessels. Min steps to get 2 pints = 14.","14"]
];

// Combine all batches
const allBatches = [...batch1, ...batch2, ...batch3, ...batch4, ...batch5];

for (const [slug, solution, answer] of allBatches) {
  allSolutions[slug] = { solution, answer };
}

// Generate TypeScript file
let ts = `export interface QuantSolution {\n  solution: string\n  answer: string\n}\n\nexport const solutions: Record<string, QuantSolution> = {\n`;

const entries = Object.entries(allSolutions);
for (let i = 0; i < entries.length; i++) {
  const [slug, { solution, answer }] = entries[i];
  const escapedSolution = solution.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const escapedAnswer = answer.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  ts += `  "${slug}": {\n    solution: \`${escapedSolution}\`,\n    answer: \`${escapedAnswer}\`\n  }`;
  if (i < entries.length - 1) ts += ',';
  ts += '\n';
}

ts += '}\n';

const outPath = path.join(__dirname, '..', 'src', 'data', 'quant-solutions.ts');
fs.writeFileSync(outPath, ts);
console.log(`Written ${entries.length} solutions to ${outPath}`);
