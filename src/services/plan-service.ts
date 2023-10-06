import IPlan from "../models/IPlan";
import { selectFromPlanByPlanId } from "../facades/plan-facade";

export async function getPlanByPlanId(planId: number): Promise<IPlan> {
    try {
        let plan = await selectFromPlanByPlanId(planId, [
            'name', 'description', 'monthlyPrice', 'storage',
            'yearlyPrice', 'activeCurrency'
        ]);

        return Promise.resolve(plan);
    } catch (err) {
        return Promise.reject(err);
    }
}