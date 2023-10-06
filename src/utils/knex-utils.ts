export function propertiesToColumns(properties: string[]): string[] {
    properties.forEach((property, index) => {
        properties[index] = `${property.replace(/([A-Z])/g, '_$1').toLowerCase()} as ${property}`;
    });

    return properties;
}