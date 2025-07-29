-- Add policy to allow updating city_image_url field
CREATE POLICY "Allow public to update city_image_url" ON public.airports
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Or if you want to be more restrictive, only allow updating the city_image_url column:
CREATE POLICY "Allow public to update only city_image_url" ON public.airports
FOR UPDATE 
USING (true)
WITH CHECK (
  -- Only allow if other fields remain unchanged
  OLD.id = NEW.id AND
  OLD.city_id = NEW.city_id AND
  OLD.iata_code = NEW.iata_code AND
  OLD.name = NEW.name AND
  OLD.city_name = NEW.city_name AND
  OLD.is_primary = NEW.is_primary AND
  OLD.country = NEW.country
);