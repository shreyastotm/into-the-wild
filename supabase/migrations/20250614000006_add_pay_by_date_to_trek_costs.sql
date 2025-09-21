ALTER TABLE public.trek_costs
ADD COLUMN pay_by_date DATE;

COMMENT ON COLUMN public.trek_costs.pay_by_date IS 'The date by which this fixed cost must be paid by participants.'; 