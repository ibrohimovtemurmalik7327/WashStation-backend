import config from '../config/config';
import { IMachine } from '../modules/machine/machine.types';
import { ISlot, ISlotMachine } from '../modules/booking/booking.types';

const DURATION_MIN = config.booking.durationMinutes; // 60
const BUFFER_MIN   = config.booking.intervalMinutes;  // 10
const BIZ_START    = config.booking.businessStart;    // '09:00'
const BIZ_END      = config.booking.businessEnd;      // '21:00'

// ========================
// TIME UTILS
// ========================

const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
};

const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

// ========================
// AVAILABILITY CHECK
// ========================

const isMachineAvailable = (
    machineId:   number,
    slotStart:   number,
    slotEnd:     number,
    bookedSlots: { machine_id: number; start_min: number; end_min: number }[]
): boolean => {
    return bookedSlots
        .filter(b => b.machine_id === machineId)
        .every(b => {
            return slotEnd <= b.start_min || slotStart >= b.end_min + BUFFER_MIN;
        });
};

// ========================
// COMBINATION FINDER
// ========================

export const findCombination = (
    totalKg:  number,
    machines: IMachine[]
): IMachine[] | null => {

    const sorted = [...machines].sort((a, b) => b.capacity_kg - a.capacity_kg);

    let bestResult: IMachine[] | null = null;

    const backtrack = (
        remaining:  number,
        startIndex: number,
        current:    IMachine[]
    ): void => {
        if (remaining === 0) {
            if (!bestResult || current.length < bestResult.length) {
                bestResult = [...current];
            }
            return;
        }

        for (let i = startIndex; i < sorted.length; i++) {
            const machine = sorted[i];

            if (bestResult && current.length + 1 >= bestResult.length) return;

            if (machine.capacity_kg <= remaining) {
                current.push(machine);
                backtrack(remaining - machine.capacity_kg, i + 1, current);
                current.pop();
            }
        }
    };

    backtrack(totalKg, 0, []);

    return bestResult;
};

// ========================
// SLOT FINDER
// ========================

export const findAvailableSlots = (
    totalKg:     number,
    machines:    IMachine[],
    rawBookings: { machine_id: number; start_time: string; end_time: string }[]
): ISlot[] => {

    const bizStart = timeToMinutes(BIZ_START); // 540
    const bizEnd   = timeToMinutes(BIZ_END);   // 1260

    const bookedSlots = rawBookings.map(b => ({
        machine_id: b.machine_id,
        start_min:  timeToMinutes(b.start_time),
        end_min:    timeToMinutes(b.end_time),
    }));

    // Mumkin bo'lgan slot boshlanish vaqtlarini yig'ish
    const candidateStarts = new Set<number>();

    // 1) Soat boshlaridan: 09:00, 10:00, 11:00...
    for (let t = bizStart; t + DURATION_MIN <= bizEnd; t += DURATION_MIN) {
        candidateStarts.add(t);
    }

    // 2) Band mashinalar tugagandan keyin: end_time + BUFFER_MIN
    for (const b of bookedSlots) {
        const afterBuffer = b.end_min + BUFFER_MIN;
        if (afterBuffer >= bizStart && afterBuffer + DURATION_MIN <= bizEnd) {
            candidateStarts.add(afterBuffer);
        }
    }

    const sortedStarts = Array.from(candidateStarts).sort((a, b) => a - b);

    const slots: ISlot[] = [];

    for (const start of sortedStarts) {
        const end = start + DURATION_MIN;

        if (end > bizEnd) continue;

        const availableMachines = machines.filter(m =>
            isMachineAvailable(m.id, start, end, bookedSlots)
        );

        const combination = findCombination(totalKg, availableMachines);
        if (!combination) continue;

        const slotMachines: ISlotMachine[] = combination.map(m => ({
            machine_id:  m.id,
            name:        m.name,
            capacity_kg: m.capacity_kg,
        }));

        slots.push({
            start_time: minutesToTime(start),
            end_time:   minutesToTime(end),
            machines:   slotMachines,
        });
    }

    return slots;
};