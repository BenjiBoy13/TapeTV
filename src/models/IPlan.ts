export default interface IPlan {
    planId: number,
    name: string,
    description: string,
    maxCapacityInGb: number,
    monthlyPrice: number,
    yearlyPrice: number,
    activeCurrency: string
}