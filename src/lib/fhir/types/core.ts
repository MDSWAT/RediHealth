export type FHIRObservationStatus =
  | "registered"
  | "preliminary"
  | "final"
  | "amended"
  | "corrected"
  | "cancelled"
  | "entered-in-error"
  | "unknown";

export interface FHIRCoding {
  system: string;
  version?: string;
  code: string;
  display?: string;
  userSelected?: boolean;
}

export interface FHIRCodeableConcept {
  coding: FHIRCoding[];
  text?: string;
}

export interface FHIRQuantity {
  value: number;
  comparator?: "<" | "<=" | ">=" | ">";
  unit: string;
  system: "http://unitsofmeasure.org";
  code: "mg/dL" | "mm[Hg]";
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: FHIRIdentifier;
  display?: string;
}

export interface FHIRIdentifier {
  use?: "usual" | "official" | "temp" | "secondary";
  system?: string;
  value?: string;
}

export interface FHIRHumanName {
  use?: "usual" | "official" | "temp" | "nickname" | "anonymous" | "old" | "maiden";
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface FHIRObservationReferenceRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
  type?: FHIRCodeableConcept;
  appliesTo?: FHIRCodeableConcept[];
  age?: { low?: FHIRQuantity; high?: FHIRQuantity };
  text?: string;
}

export interface FHIRObservationComponent {
  code: FHIRCodeableConcept;
  valueQuantity: FHIRQuantity;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: FHIRObservationReferenceRange[];
}

/**
 * Clean-room HL7 FHIR R4 Observation resource
 * Supports LOINC 1558-6 (fasting glucose), 1521-4 (postprandial glucose),
 * and 85354-9 (blood pressure panel with systolic 8480-6 and diastolic 8462-4 components).
 */
export interface FHIRObservation {
  resourceType: "Observation";
  id?: string;
  status: FHIRObservationStatus;
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  effectiveDateTime: string;
  issued?: string;
  performer?: FHIRReference[];
  valueQuantity?: FHIRQuantity;
  component?: FHIRObservationComponent[];
  interpretation?: FHIRCodeableConcept[];
  note?: Array<{ text: string }>;
  referenceRange?: FHIRObservationReferenceRange[];
}

export type FHIRQuestionnaireItemType =
  | "group"
  | "display"
  | "boolean"
  | "decimal"
  | "integer"
  | "date"
  | "dateTime"
  | "time"
  | "string"
  | "text"
  | "url"
  | "choice"
  | "open-choice";

export interface FHIRQuestionnaireItem {
  linkId: string;
  text: string;
  type: FHIRQuestionnaireItemType;
  required?: boolean;
  repeats?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  answerOption?: Array<{
    valueString?: string;
    valueInteger?: number;
    valueDate?: string;
    valueCoding?: FHIRCoding;
    initialSelected?: boolean;
  }>;
  item?: FHIRQuestionnaireItem[];
}

export interface FHIRQuestionnaire {
  resourceType: "Questionnaire";
  id: string;
  url?: string;
  version?: string;
  status: "draft" | "active" | "retired" | "unknown";
  title: string;
  date?: string;
  publisher?: string;
  description?: string;
  item: FHIRQuestionnaireItem[];
}

export interface FHIRQuestionnaireResponseAnswer {
  valueBoolean?: boolean;
  valueDecimal?: number;
  valueInteger?: number;
  valueDate?: string;
  valueDateTime?: string;
  valueString?: string;
  valueCoding?: FHIRCoding;
  valueQuantity?: FHIRQuantity;
  item?: FHIRQuestionnaireResponseItem[];
}

export interface FHIRQuestionnaireResponseItem {
  linkId: string;
  text?: string;
  answer?: FHIRQuestionnaireResponseAnswer[];
  item?: FHIRQuestionnaireResponseItem[];
}

export interface FHIRQuestionnaireResponse {
  resourceType: "QuestionnaireResponse";
  id?: string;
  questionnaire: string;
  status: "in-progress" | "completed" | "amended" | "entered-in-error" | "stopped";
  subject?: FHIRReference;
  authored: string;
  author?: FHIRReference;
  item: FHIRQuestionnaireResponseItem[];
}

export interface FHIRPractitionerQualification {
  identifier?: FHIRIdentifier[];
  code: FHIRCodeableConcept;
  issuer?: FHIRReference;
}

export interface FHIRPractitioner {
  resourceType: "Practitioner";
  id?: string;
  identifier: FHIRIdentifier[];
  active: boolean;
  name: FHIRHumanName[];
  qualification?: FHIRPractitionerQualification[];
}

export interface FHIRCondition {
  resourceType: "Condition";
  id?: string;
  clinicalStatus: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  severity?: FHIRCodeableConcept;
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  onsetDateTime?: string;
  recordedDate?: string;
  note?: Array<{ text: string }>;
}
