import {
  differenceInMinutes,
  isAfter,
  isSameDay,
  format,
  startOfWeek,
  differenceInDays,
} from "date-fns";

/**
 * lists available slots for the patient to book. This doesn't return tuples.
 * Once the first appointment is selected, the frontend should be filtering out the appointments that are on the same day (Or over 7 days later)
 * @param patient Patient
 * @returns List of available slots for that patient to book
 */
export const listAvailableAssessmentsForPatient = (
  patient: App.Patient,
  clinicians: App.Clinician[]
): [App.AvailableSlot, App.AvailableSlot][] => {
  let availableSlots: App.AvailableSlot[] = [];

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
      const dayKey = format(appt.scheduledFor, "yyyy-mm-dd");
      const dayVal = dayCountMap.get(dayKey);
      dayCountMap.set(dayKey, (dayVal ?? 0) + 1);

      const weekKey = format(startOfWeek(appt.scheduledFor), "yyyy-mm-dd");
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
        dayCountMap.get(format(s.date, "yyyy-mm-dd")) ?? 0;
      const numAppointmentsSameWeek =
        weekCountMap.get(format(startOfWeek(s.date), "yyyy-mm-dd")) ?? 0;

      return (
        numAppointmentsSameDay < clinician.maxDailyAppointments &&
        numAppointmentsSameWeek < clinician.maxWeeklyAppointments
      );
    });

    availableSlots = [
      ...availableSlots,
      ...filterOutOverlappingAppointments(eligibleSlots, 90),
    ];
  });

  const result: [App.AvailableSlot, App.AvailableSlot][] = [];

  availableSlots
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .forEach((slot, idx) => {
      availableSlots.slice(idx + 1).forEach((s2) => {
        if (
          !isSameDay(s2.date, slot.date) &&
          differenceInDays(s2.date, slot.date)
        ) {
          result.push([slot, s2]);
        }
      });
    });

  return result;
};

const filterOutOverlappingAppointments = (
  slots: App.AvailableSlot[], // must be sorted
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
