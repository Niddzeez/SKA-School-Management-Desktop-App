export function toBackendComponents(
    components: Record<string, { name: string; amount: number }>
): { name: string; amount: number }[] {
    return Object.values(components).map((c) => ({
        name: c.name,
        amount: c.amount,
    }));
}

export function toFrontendComponents(
    components: { name: string; amount: number }[]
): Record<string, { name: string; amount: number }> {
    return components.reduce(
        (acc, component) => {
            acc[component.name] = component;
            return acc;
        },
        {} as Record<string, { name: string; amount: number }>
    );
}
