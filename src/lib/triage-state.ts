/**
 * RediHealth Conversational Triage State Machine (Change 27)
 * Strictly enforces a 3-click budget:
 * Step 1: Need / Intent selection (5 primary buttons or intent search)
 * Step 2: Contextual clarification / safety screening
 * Step 3: Terminal guidance card + Universal doctor exit
 */

export type PathwayId = "learn" | "risk" | "symptoms" | "prescription" | "navigation";

export type TriageStep = 1 | 2 | 3;

export interface TriageState {
  step: TriageStep;
  pathway: PathwayId | null;
  plainLanguage: boolean;
  searchQuery?: string;
  campaign?: string;
  entry?: string;
  // Pathway 1: Learn
  learnTopicId?: string;
  // Pathway 2: Risk
  riskAnswers: {
    q1?: boolean; // Age > 45 or family history
    q2?: boolean; // Fatigue, excessive thirst, headaches
    q3?: boolean; // Smoking or high-salt/fried diet
  };
  // Pathway 3: Symptoms
  symptomData: {
    hasEmergencySigns?: boolean;
    mildCategory?: string; // "fever" | "headache" | "stomach" | "cough"
  };
  // Pathway 4: Prescription
  prescriptionInput: {
    method?: "photo" | "text";
    medicineName?: string;
  };
  // Pathway 5: Navigation
  navigationScenario?: "family_doctor" | "no_insurance_id" | "hospital_documents";
}

export const initialTriageState: TriageState = {
  step: 1,
  pathway: null,
  plainLanguage: false,
  riskAnswers: {},
  symptomData: {},
  prescriptionInput: {},
};

export type TriageAction =
  | { type: "SELECT_PATHWAY"; pathway: PathwayId }
  | { type: "SUBMIT_INTENT_SEARCH"; query: string }
  | { type: "GO_BACK" }
  | { type: "GO_TO_STEP"; step: TriageStep }
  | { type: "TOGGLE_PLAIN_LANGUAGE"; value?: boolean }
  | { type: "RESET" }
  | { type: "SET_LEARN_TOPIC"; topicId: string }
  | { type: "SET_RISK_ANSWER"; question: "q1" | "q2" | "q3"; value: boolean }
  | { type: "COMPLETE_RISK_ASSESSMENT"; defaultAnswers?: { q1?: boolean; q2?: boolean; q3?: boolean } }
  | { type: "SET_SYMPTOM_EMERGENCY"; hasEmergency: boolean }
  | { type: "SET_MILD_CATEGORY"; category: string }
  | { type: "SET_PRESCRIPTION_INPUT"; method: "photo" | "text"; medicineName?: string }
  | { type: "SET_NAVIGATION_SCENARIO"; scenario: "family_doctor" | "no_insurance_id" | "hospital_documents" }
  | { type: "INIT_FROM_URL"; pathway?: PathwayId; campaign?: string; entry?: string };

/**
 * Keyword-based intent classifier for natural language triage input (Change 28)
 */
export function classifyIntentToPathway(query: string): PathwayId {
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // Pathway 3: Symptoms / pain / acute illness / emergency 112
  if (
    q.includes("112") ||
    q.includes("urgent") ||
    q.includes("salvar") ||
    q.includes("ambulan") ||
    q.includes("infarct") ||
    q.includes("hemorag") ||
    q.includes("sufoc") ||
    q.includes("doare") ||
    q.includes("durer") ||
    /\bdor\b/.test(q) ||
    q.includes("febra") ||
    q.includes("frison") ||
    q.includes("temperatur") ||
    q.includes("rau") ||
    q.includes("simptom") ||
    q.includes("varsat") ||
    q.includes("vom") ||
    q.includes("tuse") ||
    q.includes("tus") ||
    q.includes("greata") ||
    q.includes("amet") ||
    q.includes("diaree") ||
    q.includes("arsur")
  ) {
    return "symptoms";
  }

  // Pathway 4: Prescription / medication
  if (
    q.includes("retet") ||
    q.includes("pastil") ||
    q.includes("medicament") ||
    q.includes("tratament") ||
    q.includes("doza") ||
    q.includes("antibiotic") ||
    q.includes("prospect") ||
    q.includes("farmaci")
  ) {
    return "prescription";
  }

  // Pathway 5: Healthcare system / navigation / insurance / documents
  if (
    q.includes("card") ||
    q.includes("specialist") ||
    q.includes("adeverin") ||
    q.includes("buletin") ||
    q.includes("asigurar") ||
    q.includes("cnas") ||
    q.includes("casmb") ||
    q.includes("medic de familie") ||
    q.includes("inscri") ||
    q.includes("unde merg") ||
    q.includes("spital") ||
    q.includes("bani") ||
    q.includes("drepturi") ||
    q.includes("mediator") ||
    q.includes("acte") ||
    q.includes("trimitere")
  ) {
    return "navigation";
  }

  // Pathway 2: Risk / lifestyle check
  if (
    q.includes("risc") ||
    q.includes("fumat") ||
    q.includes("fumez") ||
    q.includes("tensiun") ||
    q.includes("diabet") ||
    q.includes("glicemi") ||
    q.includes("zahar") ||
    q.includes("greutat") ||
    q.includes("obez") ||
    q.includes("colesterol") ||
    q.includes("inima") ||
    q.includes("verificar")
  ) {
    return "risk";
  }

  // Pathway 1: Learn / information (default for informational queries)
  return "learn";
}

export function triageReducer(state: TriageState, action: TriageAction): TriageState {
  switch (action.type) {
    case "SELECT_PATHWAY":
      return {
        ...state,
        pathway: action.pathway,
        step: 2,
      };

    case "SUBMIT_INTENT_SEARCH": {
      const pathway = classifyIntentToPathway(action.query);
      return {
        ...state,
        searchQuery: action.query,
        pathway,
        step: 2,
      };
    }

    case "GO_BACK": {
      if (state.step === 3) {
        return {
          ...state,
          step: 2,
        };
      }
      if (state.step === 2) {
        return {
          ...state,
          step: 1,
          pathway: null,
          learnTopicId: undefined,
          riskAnswers: {},
          symptomData: {},
          prescriptionInput: {},
          navigationScenario: undefined,
        };
      }
      return state;
    }

    case "GO_TO_STEP": {
      // Clamped strictly to 1 | 2 | 3
      const step = Math.max(1, Math.min(3, action.step)) as TriageStep;
      return {
        ...state,
        step,
      };
    }

    case "TOGGLE_PLAIN_LANGUAGE": {
      const nextVal = action.value !== undefined ? action.value : !state.plainLanguage;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("redihealth_plain_language", String(nextVal));
        } catch {
          // Ignore localStorage errors
        }
      }
      return {
        ...state,
        plainLanguage: nextVal,
      };
    }

    case "RESET":
      return {
        ...initialTriageState,
        plainLanguage: state.plainLanguage,
      };

    case "SET_LEARN_TOPIC":
      return {
        ...state,
        learnTopicId: action.topicId,
        step: 3, // Advances to resolution
      };

    case "SET_RISK_ANSWER": {
      const updatedAnswers = {
        ...state.riskAnswers,
        [action.question]: action.value,
      };
      // Check if all 3 questions answered
      const answeredCount = Object.keys(updatedAnswers).filter(
        (k) => updatedAnswers[k as keyof typeof updatedAnswers] !== undefined
      ).length;
      return {
        ...state,
        riskAnswers: updatedAnswers,
        step: answeredCount >= 3 ? 3 : 2,
      };
    }

    case "COMPLETE_RISK_ASSESSMENT":
      return {
        ...state,
        riskAnswers: {
          q1: state.riskAnswers.q1 ?? false,
          q2: state.riskAnswers.q2 ?? false,
          q3: state.riskAnswers.q3 ?? false,
          ...action.defaultAnswers,
        },
        step: 3,
      };

    case "SET_SYMPTOM_EMERGENCY":
      return {
        ...state,
        symptomData: {
          ...state.symptomData,
          hasEmergencySigns: action.hasEmergency,
        },
        step: action.hasEmergency ? 3 : 2,
      };

    case "SET_MILD_CATEGORY":
      return {
        ...state,
        symptomData: {
          ...state.symptomData,
          mildCategory: action.category,
        },
        step: 3,
      };

    case "SET_PRESCRIPTION_INPUT":
      return {
        ...state,
        prescriptionInput: {
          method: action.method,
          medicineName: action.medicineName,
        },
        step: 3,
      };

    case "SET_NAVIGATION_SCENARIO":
      return {
        ...state,
        navigationScenario: action.scenario,
        step: 3,
      };

    case "INIT_FROM_URL":
      if (action.pathway) {
        return {
          ...state,
          pathway: action.pathway,
          step: 2,
          campaign: action.campaign,
          entry: action.entry,
        };
      }
      return {
        ...state,
        campaign: action.campaign,
        entry: action.entry,
      };

    default:
      return state;
  }
}
