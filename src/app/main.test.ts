// listAvailablePatientAssessmentSlots.test.ts
import { addDays, addMinutes, startOfWeek } from "date-fns";
import {
  createAppointment,
  createAvailableSlotRange,
  createClinician,
  createPatient,
} from "./testUtils";
import { listAvailableAssessmentsForPatient } from "./main";

describe("listAvailablePatientAssessmentSlots", () => {
  it("returns only slots from psychologists", () => {
    const clinicians: App.Clinician[] = [
      createClinician({
        clinicianType: "PSYCOLOGIST",
        availableSlots: createAvailableSlotRange({ id: "psych" }),
      }),
      createClinician({
        clinicianType: "THERAPIST",
        availableSlots: createAvailableSlotRange({ id: "therapist" }),
      }),
    ];

    const result = listAvailableAssessmentsForPatient(
      createPatient(),
      clinicians
    );

    expect(result.length).toBe(1);
    expect(result[0][0].id).toBe("psych");
    expect(result[0][1].id).toBe("psych");
  });

  it("returns only 90-minute slots", () => {
    const clinicians: App.Clinician[] = [
      createClinician({
        availableSlots: [
          ...createAvailableSlotRange({
            id: "90",
            length: 90,
          }),
          ...createAvailableSlotRange({
            length: 60,
          }),
          ...createAvailableSlotRange({
            length: 30,
          }),
        ],
      }),
    ];

    const result = listAvailableAssessmentsForPatient(
      createPatient(),
      clinicians
    );

    expect(result.length).toBe(1);
    expect(result[0][0].id).toBe("90");
    expect(result[0][1].id).toBe("90");
  });

  it("filters by patient insurance", () => {
    const clinicians: App.Clinician[] = [
      createClinician({
        insurances: ["PRIVATE", "AETNA"],
        availableSlots: [
          ...createAvailableSlotRange({
            id: "private-ins",
          }),
        ],
      }),
      createClinician({
        insurances: ["BCBS", "CIGNA"],
        availableSlots: [...createAvailableSlotRange()],
      }),
    ];
    const patient: App.Patient = createPatient({ insurance: "PRIVATE" });

    const result = listAvailableAssessmentsForPatient(patient, clinicians);

    expect(result.length).toBe(1);
    expect(result[0][0].id).toBe("private-ins");
    expect(result[0][1].id).toBe("private-ins");
  });

  it("filters by patient state", () => {
    const clinicians: App.Clinician[] = [
      createClinician({
        states: ["PA", "NY"],
        availableSlots: createAvailableSlotRange({
          id: "pennsylvania",
        }),
      }),
      createClinician({
        states: ["AZ", "AK"],
        availableSlots: [...createAvailableSlotRange()],
      }),
    ];

    const result = listAvailableAssessmentsForPatient(
      createPatient(),
      clinicians
    );

    expect(result.length).toBe(1);
    expect(result[0][0].id).toBe("pennsylvania");
    expect(result[0][1].id).toBe("pennsylvania");
  });

  it("respects max daily appointments", () => {
    const tomorrow = addDays(new Date(), 1);
    const fiveAppointmentsTommorrow: App.Appointment[] = Array.from(
      { length: 5 },
      () =>
        createAppointment({
          scheduledFor: tomorrow,
        })
    );

    const clinicians: App.Clinician[] = [
      createClinician({
        appointments: fiveAppointmentsTommorrow,
        maxDailyAppointments: 5,
        availableSlots: createAvailableSlotRange({ date: tomorrow }),
      }),
      createClinician({
        appointments: fiveAppointmentsTommorrow.slice(1, 5),
        maxDailyAppointments: 5,
        availableSlots: createAvailableSlotRange({
          id: "allowed",
          date: tomorrow,
        }),
      }),
    ];

    console.log(clinicians.map((c) => c.availableSlots));

    const result = listAvailableAssessmentsForPatient(
      createPatient(),
      clinicians
    );

    console.log('result: ', result)

    expect(result.length).toBe(2); // the first slot will also match with the second slot in the range from the first clinician, as they are not busy that day
    expect(result[0][0].id).toBe("allowed");
    expect(result[1][0].id).toBe("allowed");
  });

  it("respects max weekly appointments", () => {
    const weekStart = startOfWeek(new Date());

    const tenAppointmentsThisWeek = [
      createAppointment({ scheduledFor: addDays(weekStart, 1) }),
      createAppointment({ scheduledFor: addDays(weekStart, 1) }),
      createAppointment({ scheduledFor: addDays(weekStart, 2) }),
      createAppointment({ scheduledFor: addDays(weekStart, 2) }),
      createAppointment({ scheduledFor: addDays(weekStart, 3) }),
      createAppointment({ scheduledFor: addDays(weekStart, 4) }),
      createAppointment({ scheduledFor: addDays(weekStart, 4) }),
      createAppointment({ scheduledFor: addDays(weekStart, 5) }),
      createAppointment({ scheduledFor: addDays(weekStart, 5) }),
      createAppointment({ scheduledFor: addDays(weekStart, 6) }),
      createAppointment({ scheduledFor: addDays(weekStart, 6) }),
    ];

    const clinicians: App.Clinician[] = [
      createClinician({
        appointments: tenAppointmentsThisWeek,
        maxWeeklyAppointments: 10,
        availableSlots: createAvailableSlotRange({ date: weekStart }), // make sure that this lines up with the week start so test result doesn't depend on what day of the week it is
      }),
      createClinician({
        appointments: tenAppointmentsThisWeek.slice(1, 9),
        maxWeeklyAppointments: 10,
        availableSlots: createAvailableSlotRange({ id: "allowed" }),
      }),
    ];

    const result = listAvailableAssessmentsForPatient(
      createPatient(),
      clinicians
    );

    expect(result.length).toBe(1);
    expect(result[0][0].id).toBe("allowed");
    expect(result[0][1].id).toBe("allowed");
  });

  it("filters out overlapping time slots", () => {
    // start cluster tomorrow
    const clusterStartDate = addDays(new Date(), 1);
    clusterStartDate.setHours(0);

    const clinicians: App.Clinician[] = [
      createClinician({
        availableSlots: [
          ...createAvailableSlotRange({
            id: "show",
            date: clusterStartDate, // midnight
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 15),
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 30),
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 45),
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 60),
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 75),
          }),
          ...createAvailableSlotRange({
            id: "show", // 1:30am
            date: addMinutes(clusterStartDate, 90),
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 105),
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 120),
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 135),
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 150),
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 165),
          }),
          ...createAvailableSlotRange({
            id: "show", // 3:00am
            date: addMinutes(clusterStartDate, 180),
          }),
          ...createAvailableSlotRange({
            date: addMinutes(clusterStartDate, 195),
          }),
        ],
      }),
    ];

    const result = listAvailableAssessmentsForPatient(
      createPatient(),
      clinicians
    );

    expect(result.length).toBe(9);
    result.forEach((r) => {
      expect(r[0].id).toBe("show");
      expect(r[1].id).toBe("show");
    });
  });
});
