"use client";

import { useState } from "react";
import { Play, ChevronDown, ChevronUp, Clock, Dumbbell, AlertTriangle, CheckCircle2, RotateCcw, X } from "lucide-react";

type Equipment = "mat" | "dumbbells" | "chair" | "wall" | "bodyweight";
type Category = "shoulder" | "upper" | "lower" | "core" | "cardio" | "stretch";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  equipment: Equipment[];
  category: Category;
  cue: string;             // technique cue
  shoulderNote?: string;   // frozen shoulder modification or warning
  avoid?: boolean;         // true = skip if shoulder is painful
}

interface Workout {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate";
  color: string;
  tagline: string;
  exercises: Exercise[];
}

const EQUIPMENT_LABELS: Record<Equipment, string> = {
  mat: "Mat",
  dumbbells: "Dumbbells",
  chair: "Chair",
  wall: "Wall",
  bodyweight: "Bodyweight",
};

const CATEGORY_COLORS: Record<Category, string> = {
  shoulder: "bg-[#f5f5f7] dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-300",
  upper:    "bg-[#f5f5f7] dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-300",
  lower:    "bg-[#f5f5f7] dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-300",
  core:     "bg-[#f5f5f7] dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-300",
  cardio:   "bg-[#f5f5f7] dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-300",
  stretch:  "bg-[#f5f5f7] dark:bg-zinc-800 text-[#1d1d1f] dark:text-zinc-300",
};

const WORKOUTS: Workout[] = [
  {
    id: "shoulder-rehab",
    title: "Shoulder Recovery",
    subtitle: "Frozen Shoulder Rehab",
    duration: "20 min",
    difficulty: "Beginner",
    color: "from-blue-500 to-cyan-500",
    tagline: "Gentle mobility and rotator cuff activation — do this daily",
    exercises: [
      {
        name: "Pendulum Swings",
        sets: "2", reps: "20 circles each direction", rest: "30 s",
        equipment: ["bodyweight"],
        category: "shoulder",
        cue: "Lean forward with your good hand on the desk. Let the affected arm hang freely. Use gentle body sway — not arm muscle — to make small clockwise then anti-clockwise circles. Keep the shoulder completely relaxed.",
        shoulderNote: "The gold standard frozen shoulder exercise. Gravity provides gentle traction. Never force the range.",
      },
      {
        name: "Wall Finger Walk",
        sets: "3", reps: "Hold 15 s at top", rest: "30 s",
        equipment: ["wall"],
        category: "shoulder",
        cue: "Stand facing the wall, arm's length away. Walk your fingers up the wall as high as comfortable — stop before pain. Hold 15 seconds at your max, then walk back down slowly.",
        shoulderNote: "Works forward flexion. Move to your pain-free edge only. Mark your daily high point with a sticky note to track progress.",
      },
      {
        name: "Wall Finger Walk (Side)",
        sets: "3", reps: "Hold 15 s at top", rest: "30 s",
        equipment: ["wall"],
        category: "shoulder",
        cue: "Stand side-on to the wall, affected arm closest. Walk fingers up sideways (abduction). Stop at the point of resistance, hold, then slowly walk back down.",
        shoulderNote: "Works abduction — often the most restricted movement in frozen shoulder. More challenging than the forward version.",
      },
      {
        name: "Seated External Rotation Stretch",
        sets: "3", reps: "Hold 20 s", rest: "30 s",
        equipment: ["chair"],
        category: "shoulder",
        cue: "Sit upright. Bend affected elbow to 90°, tucking it against your side. Slowly rotate the forearm outward (like opening a door) using your good hand to gently assist if needed. Hold at end range.",
        shoulderNote: "External rotation is typically the last movement to return in frozen shoulder. Use minimal force — let time and gravity do the work.",
      },
      {
        name: "Cross-Body Shoulder Stretch",
        sets: "3", reps: "Hold 30 s", rest: "20 s",
        equipment: ["bodyweight"],
        category: "stretch",
        cue: "Use your good arm to draw the affected arm across your chest at shoulder height. Hold just before the point of pain. Breathe out and relax into the stretch.",
        shoulderNote: "Targets the posterior capsule — a primary contributor to frozen shoulder stiffness. One of the most evidence-backed frozen shoulder stretches.",
      },
      {
        name: "Sleeper Stretch",
        sets: "3", reps: "Hold 30 s", rest: "30 s",
        equipment: ["mat"],
        category: "stretch",
        cue: "Lie on your side on the mat with the affected shoulder underneath. Bend the elbow 90°. Use your other hand to gently push the forearm down toward the floor — stop at resistance.",
        shoulderNote: "Excellent for internal rotation and posterior capsule tightness. If lying on the shoulder is uncomfortable, place a folded towel under it.",
      },
      {
        name: "Scapular Squeezes",
        sets: "3", reps: "12 reps, hold 3 s each", rest: "30 s",
        equipment: ["bodyweight"],
        category: "shoulder",
        cue: "Sit or stand tall. Draw your shoulder blades together and slightly down — as if trying to put them in your back pockets. Hold 3 seconds and release. Do not shrug upward.",
        shoulderNote: "Safe for all stages of frozen shoulder. Strengthens the middle trapezius and improves posture, which reduces shoulder capsule stress.",
      },
      {
        name: "Shoulder Shrugs & Rolls",
        sets: "2", reps: "10 shrugs + 10 forward/backward rolls", rest: "20 s",
        equipment: ["bodyweight"],
        category: "shoulder",
        cue: "Slowly shrug both shoulders up to your ears, hold 2 seconds, then release fully. Follow with slow shoulder rolls forward then backward.",
        shoulderNote: "Improves upper trapezius mobility and circulation around the shoulder joint. Gentle and appropriate for all phases.",
      },
    ],
  },
  {
    id: "morning-energiser",
    title: "Morning Energiser",
    subtitle: "Full Body Wake-Up",
    duration: "25 min",
    difficulty: "Intermediate",
    color: "from-amber-500 to-orange-500",
    tagline: "Get blood flowing before you sit down — shoulder-safe version",
    exercises: [
      {
        name: "Chair Squats",
        sets: "3", reps: "15", rest: "45 s",
        equipment: ["chair"],
        category: "lower",
        cue: "Stand in front of your chair, feet shoulder-width apart. Lower yourself until you lightly touch the seat, then drive through your heels to stand. Keep chest tall.",
        shoulderNote: "Arms can rest at your sides or reach forward for balance — no overhead movement needed.",
      },
      {
        name: "Glute Bridges",
        sets: "3", reps: "15", rest: "45 s",
        equipment: ["mat"],
        category: "lower",
        cue: "Lie on your back on the mat, knees bent, feet flat. Drive your hips toward the ceiling, squeezing your glutes at the top. Lower slowly for 2 counts.",
        shoulderNote: "Completely shoulder-safe. Arms rest at your sides on the mat for stability.",
      },
      {
        name: "Wall Sit",
        sets: "3", reps: "30–45 s hold", rest: "60 s",
        equipment: ["wall"],
        category: "lower",
        cue: "Slide your back down the wall until thighs are parallel to the floor. Feet shoulder-width apart, flat on the floor. Arms resting on thighs.",
        shoulderNote: "Arms rest comfortably on thighs. Zero shoulder involvement.",
      },
      {
        name: "Incline Push-Ups (Wall)",
        sets: "3", reps: "12–15", rest: "60 s",
        equipment: ["wall"],
        category: "upper",
        cue: "Place hands on the wall at shoulder height. Walk feet back until body is at an angle. Lower your chest to the wall, then push back. Keep core tight throughout.",
        shoulderNote: "Far less shoulder load than floor push-ups. If the affected shoulder aches, reduce depth or try single-arm on a higher surface. Skip if shoulder is flaring.",
        avoid: false,
      },
      {
        name: "Dumbbell Bicep Curls",
        sets: "3", reps: "12 each arm", rest: "45 s",
        equipment: ["dumbbells"],
        category: "upper",
        cue: "Stand or sit. Hold dumbbell with palm up. Curl toward your shoulder keeping the elbow pinned at your side. Lower slowly for 3 counts.",
        shoulderNote: "Elbow stays at the side — no shoulder elevation. Safe for frozen shoulder at all stages.",
      },
      {
        name: "Dumbbell Hammer Curls",
        sets: "3", reps: "12 each arm", rest: "45 s",
        equipment: ["dumbbells"],
        category: "upper",
        cue: "Same as bicep curl but with a neutral grip (thumb up). Targets brachialis and brachioradialis for balanced arm strength.",
        shoulderNote: "Neutral wrist position reduces any rotational shoulder stress. Safe for frozen shoulder.",
      },
      {
        name: "Dead Bug",
        sets: "3", reps: "8 each side", rest: "45 s",
        equipment: ["mat"],
        category: "core",
        cue: "Lie on back, arms up toward ceiling, knees at 90°. Slowly extend one arm overhead and the opposite leg toward the floor — keeping lower back pressed to the mat. Return and switch sides.",
        shoulderNote: "Extend only as far as the affected shoulder allows. If overhead arm extension is painful, keep that arm pointing straight up and only move the legs.",
      },
      {
        name: "Bird Dog",
        sets: "3", reps: "10 each side", rest: "45 s",
        equipment: ["mat"],
        category: "core",
        cue: "On hands and knees. Extend opposite arm and leg simultaneously, hold 2 seconds, return. Keep hips level — no rotation.",
        shoulderNote: "Weight-bearing through the affected shoulder in the four-point position. If this causes pain, do the legs-only version: stay on both hands, only extend the legs alternately.",
      },
    ],
  },
  {
    id: "lower-body-blast",
    title: "Lower Body Blast",
    subtitle: "Legs & Glutes — No Shoulder Load",
    duration: "30 min",
    difficulty: "Intermediate",
    color: "from-green-500 to-emerald-500",
    tagline: "Heavy lower body focus — zero pressure on the shoulder",
    exercises: [
      {
        name: "Goblet Squat",
        sets: "4", reps: "12", rest: "60 s",
        equipment: ["dumbbells"],
        category: "lower",
        cue: "Hold one dumbbell vertically at chest height with both hands cupped underneath (like a goblet). Squat deep, keeping chest up and elbows inside knees.",
        shoulderNote: "Hold the dumbbell with the good arm if needed. Alternatively hold it at your chest with the elbow tucked — avoid any shoulder elevation.",
      },
      {
        name: "Romanian Deadlift",
        sets: "4", reps: "12", rest: "60 s",
        equipment: ["dumbbells"],
        category: "lower",
        cue: "Hold dumbbells in front of thighs. Hinge at the hips, sending them back as the dumbbells slide down your legs. Feel a deep hamstring stretch. Drive hips forward to return.",
        shoulderNote: "Arms hang straight down — no shoulder work. Let the dumbbells hang from straight arms for the whole movement.",
      },
      {
        name: "Reverse Lunges",
        sets: "3", reps: "12 each leg", rest: "60 s",
        equipment: ["bodyweight"],
        category: "lower",
        cue: "Stand tall. Step one foot back and lower your back knee toward the floor. Keep front shin vertical. Push through the front heel to return.",
        shoulderNote: "Arms relaxed at sides for balance. Hold the desk or chair lightly with your good hand if balance is an issue.",
      },
      {
        name: "Single-Leg Glute Bridge",
        sets: "3", reps: "12 each leg", rest: "45 s",
        equipment: ["mat"],
        category: "lower",
        cue: "Glute bridge position but extend one leg straight. Push through the planted foot, driving hips up. Hold 1 second at the top. Lower slowly.",
        shoulderNote: "Completely shoulder-free. One of the best single-leg posterior chain exercises you can do on a mat.",
      },
      {
        name: "Sumo Squat",
        sets: "3", reps: "15", rest: "45 s",
        equipment: ["dumbbells"],
        category: "lower",
        cue: "Feet wider than shoulder-width, toes turned out. Hold one dumbbell with both hands between your legs. Squat down, keeping knees tracking over toes.",
        shoulderNote: "Dumbbell held low between legs — no overhead or elevated shoulder position needed.",
      },
      {
        name: "Step-Up (onto chair)",
        sets: "3", reps: "10 each leg", rest: "60 s",
        equipment: ["chair"],
        category: "lower",
        cue: "Place one foot on the chair seat. Drive through that heel to step up fully, bringing the other foot up. Step back down in a controlled manner. Use a sturdy chair only.",
        shoulderNote: "Hold the wall lightly with the good arm for balance. Keep the affected arm at your side.",
      },
      {
        name: "Clamshells",
        sets: "3", reps: "20 each side", rest: "30 s",
        equipment: ["mat"],
        category: "lower",
        cue: "Lie on your side, hips stacked, knees bent at 45°. Keep feet together and rotate the top knee upward like a clamshell opening. Do not let the hip roll back.",
        shoulderNote: "Lie on the unaffected shoulder side if possible. If the affected shoulder is uncomfortable, place a folded towel under it.",
      },
    ],
  },
  {
    id: "core-stability",
    title: "Core & Stability",
    subtitle: "Posture + Deep Core",
    duration: "20 min",
    difficulty: "Beginner",
    color: "from-orange-500 to-red-500",
    tagline: "Desk posture antidote — builds the foundation everything else relies on",
    exercises: [
      {
        name: "Seated Core Brace",
        sets: "3", reps: "10 × 5 s holds", rest: "30 s",
        equipment: ["chair"],
        category: "core",
        cue: "Sit on the edge of the chair, spine neutral (not leaning on the backrest). Take a breath in, then brace your core as if bracing for a punch. Hold 5 seconds. Release and breathe.",
        shoulderNote: "Shoulders relaxed throughout. This trains deep core stabilisers — the foundation for protecting the spine and shoulder girdle.",
      },
      {
        name: "Plank (Wall)",
        sets: "3", reps: "30–45 s hold", rest: "60 s",
        equipment: ["wall"],
        category: "core",
        cue: "Place forearms on the wall at chest height. Walk feet back until your body is at an angle — the steeper the angle, the harder. Hold a rigid straight line from head to heel.",
        shoulderNote: "Far less shoulder load than a floor plank. Start steeper (closer to wall) and gradually walk feet further back as strength improves. Switch to floor forearm plank once shoulder allows.",
      },
      {
        name: "Dead Bug",
        sets: "3", reps: "8 each side", rest: "45 s",
        equipment: ["mat"],
        category: "core",
        cue: "Lie on back, arms up, knees at 90°. Extend opposite arm and leg toward the floor while pressing lower back flat. Return and switch. Move slowly — the slower, the harder.",
        shoulderNote: "Affected arm can remain pointing up while only the legs move if needed.",
      },
      {
        name: "Side-Lying Hip Abduction",
        sets: "3", reps: "15 each side", rest: "30 s",
        equipment: ["mat"],
        category: "core",
        cue: "Lie on side, body in a straight line. Lift the top leg about 45° keeping foot flexed (toes pointing slightly down). Hold 1 s, lower slowly.",
        shoulderNote: "Rest the head on the unaffected arm. If affected shoulder is down, pad it with a folded towel.",
      },
      {
        name: "Seated Oblique Twist",
        sets: "3", reps: "12 each side", rest: "30 s",
        equipment: ["chair"],
        category: "core",
        cue: "Sit on the edge of the chair, feet flat. Hold arms crossed over chest or hands clasped in front. Rotate your torso slowly to the right, then left — from the waist, not the neck.",
        shoulderNote: "Arms crossed at chest or clasped in front. Avoid pulling with the affected arm. Keep movement slow and controlled.",
      },
      {
        name: "Superman Hold",
        sets: "3", reps: "10 × 3 s holds", rest: "30 s",
        equipment: ["mat"],
        category: "core",
        cue: "Lie face down on the mat, arms extended forward. Simultaneously lift arms, chest, and legs off the floor. Hold 3 seconds, lower slowly.",
        shoulderNote: "If lifting the affected arm overhead is painful, perform with arms at sides (reverse hyperextension style) — lift only the chest and legs.",
      },
      {
        name: "Cat-Cow Stretch",
        sets: "2", reps: "10 slow cycles", rest: "20 s",
        equipment: ["mat"],
        category: "stretch",
        cue: "On hands and knees. Inhale: drop belly, lift head and tailbone (cow). Exhale: round spine to ceiling, tuck chin and tailbone (cat). Move with your breath.",
        shoulderNote: "Weight-bearing through both wrists. If the affected shoulder struggles with four-point position, do seated cat-cow: sit on the edge of the chair and flex/extend the spine.",
      },
    ],
  },
  {
    id: "desk-cardio",
    title: "Desk Cardio",
    subtitle: "No-Jump Low-Impact Cardio",
    duration: "20 min",
    difficulty: "Intermediate",
    color: "from-red-500 to-pink-500",
    tagline: "Raise your heart rate without jumping — shoulder-safe throughout",
    exercises: [
      {
        name: "Seated March",
        sets: "3", reps: "60 s", rest: "20 s",
        equipment: ["chair"],
        category: "cardio",
        cue: "Sit on the edge of your chair. Drive your knees up alternately as fast as comfortable, pumping the arms gently. Keep core braced and back straight.",
        shoulderNote: "Pump the good arm normally; let the affected arm swing naturally at a reduced range.",
      },
      {
        name: "Standing March",
        sets: "3", reps: "60 s", rest: "20 s",
        equipment: ["bodyweight"],
        category: "cardio",
        cue: "Stand tall and march on the spot, driving knees to hip height. Engage your core with each step. Add gentle arm swings for intensity.",
        shoulderNote: "Keep affected arm movement to a comfortable range — small swings at your side are fine.",
      },
      {
        name: "Wall Push-Off",
        sets: "3", reps: "20", rest: "45 s",
        equipment: ["wall"],
        category: "cardio",
        cue: "Stand an arm's length from the wall. Fall forward and catch yourself with your hands, then explosively push off the wall back to standing. The faster, the more cardio.",
        shoulderNote: "Moderate shoulder load. If the affected shoulder aches, use only your good hand and place the affected hand lightly on the wall for balance only.",
      },
      {
        name: "Chair Step-Touch",
        sets: "3", reps: "60 s", rest: "20 s",
        equipment: ["chair"],
        category: "cardio",
        cue: "Stand beside your chair. Step one foot up onto the seat, step back down, then tap the other foot out to the side. Alternate sides in a rhythmic pattern.",
        shoulderNote: "Lightly touch the chair back with the good hand for balance. Affected arm rests at side.",
      },
      {
        name: "Squat to Calf Raise",
        sets: "3", reps: "15", rest: "45 s",
        equipment: ["bodyweight"],
        category: "cardio",
        cue: "Perform a squat. As you rise to standing, continue onto your toes in a calf raise. Control the full movement — squat on the way down, calf raise on the way up.",
        shoulderNote: "Arms can be extended in front for balance — no overhead movement. Hold desk lightly if needed.",
      },
      {
        name: "Standing Hip Circles",
        sets: "2", reps: "10 each direction", rest: "20 s",
        equipment: ["bodyweight"],
        category: "stretch",
        cue: "Stand with feet hip-width apart, hands on hips. Draw large slow circles with your hips — front, side, back, side. Loosen the hip flexors that tighten from sitting.",
        shoulderNote: "Hands on hips throughout. Zero shoulder involvement — use this as active recovery between harder sets.",
      },
    ],
  },
];

function EquipmentBadge({ eq }: { eq: Equipment }) {
  const colors: Record<Equipment, string> = {
    mat:        "bg-[#f5f5f7] dark:bg-zinc-800 text-[#6e6e73] dark:text-zinc-400",
    dumbbells:  "bg-[#f5f5f7] dark:bg-zinc-800 text-[#6e6e73] dark:text-zinc-400",
    chair:      "bg-[#f5f5f7] dark:bg-zinc-800 text-[#6e6e73] dark:text-zinc-400",
    wall:       "bg-[#f5f5f7] dark:bg-zinc-800 text-[#6e6e73] dark:text-zinc-400",
    bodyweight: "bg-[#f5f5f7] dark:bg-zinc-800 text-[#6e6e73] dark:text-zinc-400",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${colors[eq]}`}>
      {EQUIPMENT_LABELS[eq]}
    </span>
  );
}

function ExerciseCard({ ex, index }: { ex: Exercise; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border transition-all ${open ? "border-gray-200 dark:border-zinc-700 bg-[#f5f5f7]/50 dark:bg-zinc-800/50" : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{ex.name}</p>
            {open ? <ChevronUp size={14} className="text-gray-400 flex-shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${CATEGORY_COLORS[ex.category]}`}>
              {ex.category}
            </span>
            <span className="text-xs text-gray-500 dark:text-zinc-400">{ex.sets} × {ex.reps}</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">Rest {ex.rest}</span>
          </div>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {ex.equipment.map(eq => <EquipmentBadge key={eq} eq={eq} />)}
          </div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-zinc-800 pt-3">
          <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{ex.cue}</p>
          {ex.shoulderNote && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-xs leading-relaxed ${ex.avoid ? "bg-[#fff1f0] dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300" : "bg-[#f5f5f7] dark:bg-zinc-700/50 border border-gray-200 dark:border-zinc-600 text-[#1d1d1f] dark:text-zinc-300"}`}>
              {ex.avoid
                ? <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                : <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" />}
              <span><strong>Shoulder:</strong> {ex.shoulderNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkoutDetail({ workout, onBack }: { workout: Workout; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 flex items-center gap-1">
        ← Back to workouts
      </button>

      <div className="bg-[#1d1d1f] dark:bg-zinc-800 rounded-2xl p-6 text-white">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">{workout.subtitle}</p>
        <h2 className="text-2xl font-bold mb-1">{workout.title}</h2>
        <p className="text-sm text-white/70 mb-5">{workout.tagline}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs">
            <Clock size={11} /> {workout.duration}
          </span>
          <span className="bg-white/10 px-3 py-1 rounded-full text-xs">{workout.difficulty}</span>
          <span className="bg-white/10 px-3 py-1 rounded-full text-xs">{workout.exercises.length} exercises</span>
        </div>
      </div>

      <div className="bg-[#f5f5f7] dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-[#6e6e73] dark:text-zinc-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[#1d1d1f] dark:text-zinc-300">
          <strong>Frozen shoulder guidance:</strong> Stop any exercise that causes sharp or worsening pain. Work to the edge of discomfort, never through pain. Warm up the shoulder with a heat pack for 10 minutes beforehand if possible. Progress is slow — consistency over intensity.
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Exercises</h3>
        {workout.exercises.map((ex, i) => (
          <ExerciseCard key={ex.name} ex={ex} index={i} />
        ))}
      </div>
    </div>
  );
}

export function WorkoutsView() {
  const [selected, setSelected] = useState<Workout | null>(null);

  if (selected) {
    return <WorkoutDetail workout={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">Workouts</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">Desk-based · Mat, dumbbells, chair, wall, bodyweight · Frozen shoulder friendly</p>
      </div>

      <div className="bg-[#f5f5f7] dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl p-4 flex items-start gap-3">
        <CheckCircle2 size={16} className="text-[#0071e3] flex-shrink-0 mt-0.5" />
        <p className="text-sm text-[#1d1d1f] dark:text-zinc-300">
          Every workout includes frozen shoulder modifications. Blue notes = safe with modification. Start with <strong>Shoulder Recovery</strong> daily, then add one other workout 3× per week.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WORKOUTS.map(w => (
          <button
            key={w.id}
            onClick={() => setSelected(w)}
            className="text-left bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 overflow-hidden transition-all hover:shadow-sm group"
          >
            <div className="bg-[#1d1d1f] dark:bg-zinc-800 p-5 text-white">
              <p className="text-xs font-medium text-white/50 mb-0.5">{w.subtitle}</p>
              <h3 className="text-lg font-bold">{w.title}</h3>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3 leading-relaxed">{w.tagline}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-zinc-500">
                  <span className="flex items-center gap-1"><Clock size={11} />{w.duration}</span>
                  <span className="flex items-center gap-1"><Dumbbell size={11} />{w.exercises.length} exercises</span>
                  <span>{w.difficulty}</span>
                </div>
                <span className="text-xs font-medium text-[#0071e3] group-hover:translate-x-0.5 transition-transform">
                  View →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
