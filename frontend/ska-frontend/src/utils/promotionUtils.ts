export const SCHOOL_CLASS_ORDER = [
    "Playgroup",
    "Nursery",
    "LKG",
    "UKG",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10"
];

export function getNextClassId(
    currentClassId: string,
    classes: { id: string; ClassName: string }[]
): string | null {
    const currentClass = classes.find((c) => c.id === currentClassId);
    if (!currentClass) return null;

    const currentIndex = SCHOOL_CLASS_ORDER.indexOf(currentClass.ClassName);

    if (currentIndex === -1 || currentIndex === SCHOOL_CLASS_ORDER.length - 1) {
        return null; // already last class
    }

    const nextClassName = SCHOOL_CLASS_ORDER[currentIndex + 1];

    const nextClass = classes.find((c) => c.ClassName === nextClassName);

    return nextClass ? nextClass.id : null;
}