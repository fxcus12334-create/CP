ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_property_type_check;
UPDATE public.properties SET property_type = 'house' WHERE property_type = 'apartment';
UPDATE public.properties SET property_type = 'villa' WHERE property_type = 'residential';
ALTER TABLE public.properties ALTER COLUMN property_type SET DEFAULT 'house';
ALTER TABLE public.properties ADD CONSTRAINT properties_property_type_check CHECK (property_type IN ('house','commercial','villa','land'));