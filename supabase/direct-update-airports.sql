-- Direct SQL updates for airport city images
-- Run this in Supabase SQL Editor

-- First check RLS status
DO $$
BEGIN
  -- Update all airports with their city image URLs
  UPDATE airports
  SET city_image_url = 'https://tihoougxhpakomvxxlgl.supabase.co/storage/v1/object/public/city-images/' || LOWER(iata_code) || '.jpg'
  WHERE iata_code IN (
    'LHR','LGW','STN','LTN','LCY','MAN','EDI','BHX','GLA','BRS',
    'NCL','LPL','BFS','LBA','EMA','ABZ','SOU','EXT','CWL','BCN',
    'MAD','AGP','PMI','VLC','SVQ','BIO','ALC','IBZ','TFS','TFN',
    'LPA','ACE','FUE','MAH','SCQ','NCE','MRS','LYS','TLS','BOD',
    'NTE','MPL','SXB','BIQ','AMS','EIN','RTM','GRQ','FCO','MXP',
    'LIN','VCE','NAP','BGY','PSA','FLR','TRN','BLQ','CTA','PMO',
    'BRI','VRN','TSF','CAG','FRA','MUC','BER','DUS','HAM','CGN',
    'STR','NUE','HAJ','LEJ','BRE','DRS','DTM','BRU','CRL','ANR',
    'LGG','OST','VIE','SZG','INN','GRZ','LNZ','ZRH','GVA','BSL',
    'BRN','LUG','CPH','AAR','BLL','AAL','OSL','BGO','TRD','SVG',
    'TOS','BOO','ARN','BMA','GOT','MMX','LLA','UME','HEL','TMP',
    'TKU','OUL','RVN','DUB','ORK','SNN','KNO','KIR','LIS','OPO',
    'FAO','FNC','PDL','ATH','SKG','HER','RHO','CFU','CHQ','KGS',
    'MJT','JMK','JTR','PRG','BRQ','OSR','WAW','KRK','GDN','WRO',
    'POZ','KTW','RZE','SZZ','BUD','DEB','OTP','CLJ','TSR','IAS',
    'SOF','VAR','BOJ','PDV','BEG','INI','ZAG','SPU','DBV','PUY',
    'ZAD','RJK','LJU','MBX','SKP','OHD','TIA','PRN','SJJ','TGD',
    'TIV','RIX','VNO','KUN','TLL','MSQ','KBP','ODS','LWO','HRK',
    'IST','SAW','AYT','ESB','ADB','DLM','BJV','TLV','CAI','SSH',
    'HRG','EWR','ORD','MDW','ATL','DFW','IAH','MIA','MCO','LAS',
    'SEA','SFO','BOS','DCA','IAD','PHL','PHX','DEN','DTW','MSP',
    'SAN','TPA','FLL','BWI','PDX','CLT','SLC','BNA','AUS','MSY',
    'RDU','STL','MCI','CLE','PIT','CVG','IND','CMH','SAT','SMF',
    'SJC','OAK','YVR','YUL','YYC','YEG','YOW','YWG','YHZ','YQB',
    'MEX','CUN','GDL','MTY','TIJ','SJD','PVR','MZT','GRU','GIG',
    'BSB','SSA','REC','FOR','POA','CNF','EZE','AEP','COR','MDZ',
    'SCL','LIM','CUZ','BOG','MDE','CLO','CTG','UIO','GYE','CCS',
    'PTY','SJO','SAL','GUA','MGA','KIX','ITM','NGO','FUK','CTS',
    'OKA','HIJ','SDJ','ICN','GMP','PUS','CJU','PEK','PKX','PVG',
    'SHA','CAN','SZX','CTU','XIY','CKG','KMG','HGH','WUH','HKG',
    'TPE','TSA','KHH','BKK','DMK','HKT','CNX','KUL','PEN','LGK',
    'CGK','DPS','SUB','MNL','CEB','CRK','SGN','HAN','DAD','RGN',
    'PNH','REP','VTE','DEL','BOM','BLR','MAA','CCU','HYD','COK',
    'GOI','AMD','PNQ','CMB','DAC','KTM','ISB','KHI','LHE','AUH',
    'SHJ','DOH','KWI','BAH','MCT','RUH','JED','DMM','AMM','BEY',
    'MEL','BNE','PER','ADL','CNS','OOL','CBR','HBA','DRW','AKL',
    'CHC','WLG','ZQN','NAN','PPT','HNL','GUM','JNB','CPT','DUR',
    'NBO','MBA','ADD','DAR','JRO','LOS','ABV','ACC','CMN','RAK',
    'TUN','ALG','MRU','SEZ','TNR','MPM','WDH','GBE','HRE','LUN',
    'BLZ','ABJ','DKR','LFW','COO','NIM','OUA','BKO','RBA','AGA',
    'FEZ','TNG','NDJ','BGF','KGL','BJM','EBB','JUB','KRT','ASM',
    'MGQ','MQX'
  );

  -- Show how many were updated
  RAISE NOTICE 'Updated % airports with city image URLs', 
    (SELECT COUNT(*) FROM airports WHERE city_image_url IS NOT NULL);
END $$;

-- Verify the update
SELECT 
  COUNT(*) as total_airports,
  COUNT(city_image_url) as with_images,
  COUNT(*) - COUNT(city_image_url) as without_images
FROM airports;

-- Show sample of updated records
SELECT iata_code, city_name, city_image_url
FROM airports
WHERE city_image_url IS NOT NULL
LIMIT 10;