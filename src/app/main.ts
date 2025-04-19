import {
  differenceInMinutes,
  isAfter,
  isSameDay,
  format,
  startOfWeek,
  differenceInDays,
  parseISO,
} from "date-fns";
import { readFileSync } from "fs";
import {
  createAvailableSlot,
  createClinician,
  createPatient,
} from "./testUtils.ts";

const testSlots = JSON.parse(
  readFileSync(
    "/Users/evandimartinis/my-projects/prosper-project/src/data/slots.json",
    "utf-8"
  )
) as {
  length: number;
  date: string;
}[];
const testSlotsParsed: App.AvailableSlot[] = testSlots.map((s) => {
  const d = parseISO(s.date);
  d.setFullYear(2026);
  return createAvailableSlot({ length: s.length, date: d });
});

/**
 * List all clinician AvailableSlots that are valid for the patient
 * @param patient Patient object
 * @param clinicians list of clinicians with available slots
 * @returns list of tuples consisting of 2 AvailableSlot objects - initial assessment and follow-up assessment slots
 */
export const listAvailableAssessmentsForPatient = (
  patient: App.Patient,
  clinicians: App.Clinician[]
): [App.AvailableSlot, App.AvailableSlot][] => {
  const result: [App.AvailableSlot, App.AvailableSlot][] = [];

  clinicians.forEach((clinician) => {
    // make sure clinician is a psychologist and accepts the correct insurance in the correct state
    if (
      clinician.clinicianType !== "PSYCOLOGIST" ||
      !clinician.insurances.includes(patient.insurance) ||
      !clinician.states.includes(patient.state)
    ) {
      return;
    }

    const dayCountMap = new Map<string, number>(); // string key is date in yyyy-mm-dd format
    const weekCountMap = new Map<string, number>(); // string key is start of week in yyyy-mm-dd format

    clinician.appointments.forEach((appt) => {
      const dayKey = format(appt.scheduledFor, "yyyy-MM-dd");
      const dayVal = dayCountMap.get(dayKey);
      dayCountMap.set(dayKey, (dayVal ?? 0) + 1);

      const weekKey = format(startOfWeek(appt.scheduledFor), "yyyy-MM-dd");
      const weekVal = weekCountMap.get(weekKey);
      weekCountMap.set(weekKey, (weekVal ?? 0) + 1);
    });

    // filter out past, !90min, and full day/week slots
    const eligibleSlots = clinician.availableSlots.filter((s) => {
      // all available slots are in the future and 90 minutes long (an assessment)
      if (!isAfter(s.date, new Date()) || s.length !== 90) {
        return false;
      }

      const numAppointmentsSameDay =
        dayCountMap.get(format(s.date, "yyyy-MM-dd")) ?? 0;
      const numAppointmentsSameWeek =
        weekCountMap.get(format(startOfWeek(s.date), "yyyy-MM-dd")) ?? 0;

      return (
        numAppointmentsSameDay < clinician.maxDailyAppointments &&
        numAppointmentsSameWeek < clinician.maxWeeklyAppointments
      );
    });

    const nonClusteredSlots = filterOutOverlappingSlots(eligibleSlots, 90); // will also automatically sort from earliest to latest

    // for each valid and un-clustered slot, we want to put it in a tuple with any valid follow-up slot and add the pair to our result
    // doing this here means that available slots will only be paired with available slots from the same clinician for the follow-up
    nonClusteredSlots.forEach((slot, idx) => {
      nonClusteredSlots.slice(idx + 1).forEach((s2) => {
        if (
          !isSameDay(s2.date, slot.date) &&
          differenceInDays(s2.date, slot.date)
        ) {
          result.push([slot, s2]);
        }
      });
    });
  });

  // by default the results should be sorted by clinician, because that's how we're processing them
  return result;
};

const filterOutOverlappingSlots = (
  slots: App.AvailableSlot[],
  durationMinutes: number
): App.AvailableSlot[] => {
  if (slots.length === 0) {
    return [];
  }

  const sortedSlots = slots.sort((a, b) => a.date.getTime() - b.date.getTime());

  const finalSlots: App.AvailableSlot[] = [sortedSlots[0]];

  // reference for the most recent date that is not overlapped
  let benchmarkAppointmentDate: Date = sortedSlots[0].date;

  sortedSlots.slice(1).forEach((slot) => {
    // if the current appointment is within the duration of the most recent appointment, skip it, it is not valid
    if (
      differenceInMinutes(slot.date, benchmarkAppointmentDate) < durationMinutes
    ) {
      return;
    } else {
      // otherwise this appointment is valid. add it to our result, and set it's date as the new benchmark
      finalSlots.push(slot);
      benchmarkAppointmentDate = slot.date;
    }
  });

  return finalSlots;
};

const patientSlots = listAvailableAssessmentsForPatient(createPatient(), [
  createClinician({
    availableSlots: testSlotsParsed,
  }),
  createClinician({
    id: "test-clinician-2",
    availableSlots: testSlotsParsed,
  }),
]);

console.log(
  patientSlots.slice(-10).map((s) => [
    { ...s[0], date: format(s[0].date, "yyyy-MM-dd HH:mm") },
    { ...s[1], date: format(s[1].date, "yyyy-MM-dd HH:mm") },
  ])
);
