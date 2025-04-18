declare namespace App {
  type StateAbbreviation =
    | "AL"
    | "AK"
    | "AZ"
    | "AR"
    | "CA"
    | "CO"
    | "CT"
    | "DE"
    | "DC"
    | "FL"
    | "GA"
    | "HI"
    | "ID"
    | "IL"
    | "IN"
    | "IA"
    | "KS"
    | "KY"
    | "LA"
    | "ME"
    | "MD"
    | "MA"
    | "MI"
    | "MN"
    | "MS"
    | "MO"
    | "MT"
    | "NE"
    | "NV"
    | "NH"
    | "NJ"
    | "NM"
    | "NY"
    | "NC"
    | "ND"
    | "OH"
    | "OK"
    | "OR"
    | "PA"
    | "RI"
    | "SC"
    | "SD"
    | "TN"
    | "TX"
    | "UT"
    | "VT"
    | "VA"
    | "WA"
    | "WV"
    | "WI"
    | "WY";

  type ClinicianType = "THERAPIST" | "PSYCOLOGIST";

  type InsurancePayer = "AETNA" | "BCBS" | "CIGNA" | "PRIVATE";

  interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    state: StateAbbreviation;
    insurance: InsurancePayer;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Clinician {
    id: string;
    firstName: string;
    lastName: string;
    states: StateAbbreviation[];
    insurances: InsurancePayer[];
    clinicianType: ClinicianType;
    appointments: Appointment[];
    availableSlots: AvailableSlot[];
    maxDailyAppointments: number;
    maxWeeklyAppointments: number;
    createdAt: Date;
    updatedAt: Date;
  }

  type AppointmentStatus =
    | "UPCOMING"
    | "OCCURRED"
    | "NO_SHOW"
    | "RE_SCHEDULED"
    | "CANCELLED"
    | "LATE_CANCELLATION";

  type AppointmentType =
    | "ASSESSMENT_SESSION_1" // 90 min
    | "ASSESSMENT_SESSION_2" // 90 min
    | "THERAPY_INTAKE" // 60 min
    | "THERAPY_SIXTY_MINS"; // 60 min

  interface AvailableSlot {
    id: string;
    clinicianId: string;
    clinician: Clinician;
    date: Date;
    length: number; // number of minutes
    createdAt: Date;
    updatedAt: Date;
  }

  interface Appointment {
    id: string;
    patientId: string;
    patient: Patient;
    clinicianId: string;
    clinician: Clinician;
    scheduledFor: Date;
    appointmentType: AppointmentType;
    status: AppointmentStatus;
    createdAt: Date;
    updatedAt: Date;
  }
}
