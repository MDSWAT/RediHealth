export interface VitalsTelemetryRecord {
  id?: number | string;
  patientId?: number | string | null;
  meetingId?: number | string | null;
  recordedByWorkerId?: number | string | null;
  recordedByWorkerName?: string;
  deviceKitId: string;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  pulseBpm?: number | null;
  oxygenSaturationPct?: number | null;
  bloodGlucoseMgDl?: number | null;
  glucoseContext?: "fasting" | "postprandial" | "random";
  bodyTemperatureC?: number | null;
  notes?: string | null;
  recordedAt?: string;
}

export interface VitalsValidationStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isOutOfRange: boolean;
  criticalAlert?: string;
}

export function validateVitals(vitals: Partial<VitalsTelemetryRecord>): VitalsValidationStatus {
  const errors: string[] = [];
  const warnings: string[] = [];
  let isOutOfRange = false;
  let criticalAlert: string | undefined;

  const isInvalidNum = (val: unknown): boolean =>
    val != null && (typeof val !== "number" || Number.isNaN(val));

  if (isInvalidNum(vitals.bloodPressureSystolic)) {
    errors.push("Tensiunea sistolică trebuie să fie o valoare numerică validă.");
  } else if (vitals.bloodPressureSystolic != null) {
    if (vitals.bloodPressureSystolic < 60 || vitals.bloodPressureSystolic > 260) {
      errors.push("Tensiunea sistolică trebuie să fie între 60 și 260 mmHg.");
    } else if (vitals.bloodPressureSystolic < 90) {
      warnings.push("Tensiune sistolică sever scăzută (<90 mmHg). Risc de șoc.");
      isOutOfRange = true;
      criticalAlert = "Valoare în afara limitelor normale. Trimite către medicul online.";
    } else if (vitals.bloodPressureSystolic > 180) {
      warnings.push("Tensiune sistolică sever crescută (>180 mmHg).");
      isOutOfRange = true;
      criticalAlert = "Valoare în afara limitelor normale. Trimite către medicul online.";
    }
  }

  if (isInvalidNum(vitals.bloodPressureDiastolic)) {
    errors.push("Tensiunea diastolică trebuie să fie o valoare numerică validă.");
  } else if (vitals.bloodPressureDiastolic != null) {
    if (vitals.bloodPressureDiastolic < 40 || vitals.bloodPressureDiastolic > 150) {
      errors.push("Tensiunea diastolică trebuie să fie între 40 și 150 mmHg.");
    } else if (vitals.bloodPressureDiastolic > 110) {
      warnings.push("Tensiune diastolică sever crescută (>110 mmHg).");
      isOutOfRange = true;
      criticalAlert = "Valoare în afara limitelor normale. Trimite către medicul online.";
    }
  }

  if (
    vitals.bloodPressureSystolic != null &&
    vitals.bloodPressureDiastolic != null &&
    !Number.isNaN(vitals.bloodPressureSystolic) &&
    !Number.isNaN(vitals.bloodPressureDiastolic) &&
    vitals.bloodPressureSystolic <= vitals.bloodPressureDiastolic
  ) {
    errors.push("Tensiunea sistolică trebuie să fie mai mare decât tensiunea diastolică.");
  }

  if (isInvalidNum(vitals.oxygenSaturationPct)) {
    errors.push("Saturația de oxigen trebuie să fie o valoare numerică validă.");
  } else if (vitals.oxygenSaturationPct != null) {
    if (vitals.oxygenSaturationPct < 50 || vitals.oxygenSaturationPct > 100) {
      errors.push("Saturația de oxigen (SpO2) trebuie să fie între 50% și 100%.");
    } else if (vitals.oxygenSaturationPct < 92) {
      warnings.push("Saturație oxigen scăzută sub 92%. Risc respirator.");
      isOutOfRange = true;
      criticalAlert = "Valoare în afara limitelor normale. Trimite către medicul online.";
    }
  }

  if (isInvalidNum(vitals.pulseBpm)) {
    errors.push("Pulsul trebuie să fie o valoare numerică validă.");
  } else if (vitals.pulseBpm != null) {
    if (vitals.pulseBpm < 30 || vitals.pulseBpm > 220) {
      errors.push("Pulsul trebuie să fie între 30 și 220 bpm.");
    } else if (vitals.pulseBpm > 120 || vitals.pulseBpm < 50) {
      warnings.push("Puls în afara limitelor normale de repaus.");
      isOutOfRange = true;
    }
  }

  if (isInvalidNum(vitals.bloodGlucoseMgDl)) {
    errors.push("Glicemia trebuie să fie o valoare numerică validă.");
  } else if (vitals.bloodGlucoseMgDl != null) {
    if (vitals.bloodGlucoseMgDl < 20 || vitals.bloodGlucoseMgDl > 600) {
      errors.push("Glicemia trebuie să fie între 20 și 600 mg/dL.");
    } else if (vitals.bloodGlucoseMgDl < 50) {
      warnings.push("Hipoglicemie severă (<50 mg/dL). Risc de pierdere a conștienței.");
      isOutOfRange = true;
      criticalAlert = "Valoare în afara limitelor normale. Trimite către medicul online.";
    } else if (vitals.bloodGlucoseMgDl < 70 || vitals.bloodGlucoseMgDl > 250) {
      warnings.push("Glicemie în afara intervalului țintă.");
      isOutOfRange = true;
    }
  }

  if (isInvalidNum(vitals.bodyTemperatureC)) {
    errors.push("Temperatura corporală trebuie să fie o valoare numerică validă.");
  } else if (vitals.bodyTemperatureC != null) {
    if (vitals.bodyTemperatureC < 32.0 || vitals.bodyTemperatureC > 43.0) {
      errors.push("Temperatura corporală trebuie să fie între 32.0°C și 43.0°C.");
    } else if (vitals.bodyTemperatureC < 35.0) {
      warnings.push("Hipotermie marcată (<35.0°C). Risc de afectare metabolică.");
      isOutOfRange = true;
      criticalAlert = "Valoare în afara limitelor normale. Trimite către medicul online.";
    } else if (vitals.bodyTemperatureC >= 38.5) {
      warnings.push("Febră moderată sau ridicată.");
      isOutOfRange = true;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    isOutOfRange,
    criticalAlert,
  };
}

export interface CareRecommendationRecord {
  id?: number | string;
  patientId?: number | string | null;
  meetingId?: number | string | null;
  doctorWorkerId?: number | string | null;
  doctorName: string;
  doctorSpecialty: string;
  primaryDiagnosis: string;
  actionSteps: Array<{ id: string; text: string; completed?: boolean }>;
  warningSigns: string[];
  controlDate?: string | null;
  additionalNotes?: string | null;
  createdAt?: string;
}

export interface MediatorRequestPayload {
  county: string;
  locality: string;
  requesterName: string;
  requesterPhone: string;
  beneficiaryName?: string;
  helpCategory: string;
  notes?: string;
}
