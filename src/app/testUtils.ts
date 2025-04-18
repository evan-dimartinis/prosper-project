import { addDays } from "date-fns";

const defaultSlotDate = addDays(new Date(), 1); // initialize to tomorrow

const testClinician: App.Clinician = {
  id: "test-clinician",
  firstName: "Jim",
  lastName: "Halpert",
  states: ["PA"],
  insurances: ["AETNA"],
  clinicianType: "PSYCOLOGIST",
  appointments: [],
  availableSlots: [],
  maxDailyAppointments: 5,
  maxWeeklyAppointments: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};
// basic test patient/clinician/available slot combination will return a result
const testPatient: App.Patient = {
  id: "test-patient",
  firstName: "Michael",
  lastName: "Scarn",
  state: "PA",
  insurance: "AETNA",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const testAppointment: App.Appointment = {
  id: "test-appointment",
  patientId: "test-patient",
  patient: testPatient,
  clinicianId: "test-clinician",
  clinician: testClinician,
  scheduledFor: new Date(),
  appointmentType: "ASSESSMENT_SESSION_1",
  status: "UPCOMING",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// initialize to pass
export const testAvailableSlot: App.AvailableSlot = {
  id: "test-available-slot",
  clinicianId: "test-clinician",
  clinician: testClinician,
  date: defaultSlotDate,
  length: 90,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const createClinician = (
  clinician?: Partial<App.Clinician>
): App.Clinician => ({
  ...testClinician,
  ...clinician,
});

export const createPatient = (patient?: Partial<App.Patient>) => ({
  ...testPatient,
  ...patient,
});

export const createAppointment = (appointment?: Partial<App.Appointment>) => ({
  ...testAppointment,
  ...appointment,
});

const createAvailableSlot = (
  slot?: Partial<App.AvailableSlot>
): App.AvailableSlot => ({
  ...testAvailableSlot,
  ...slot,
});

export const createAvailableSlotRange = (
  slot?: Partial<App.AvailableSlot>
): App.AvailableSlot[] => {
  return [
    createAvailableSlot(slot),
    createAvailableSlot({
      ...slot,
      date: addDays(slot?.date ?? defaultSlotDate, 3),
    }),
  ];
};
