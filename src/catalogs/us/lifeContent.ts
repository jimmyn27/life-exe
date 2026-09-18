// Authored variety for future NPC generation; not frequency-weighted demographic
// data. Names are not assigned by city, race, religion or a personality stereotype.
export const namePool = {
  givenNames: ['Alex','Jordan','Taylor','Casey','Morgan','Jamie','Riley','Avery','Quinn','Cameron','Drew','Skyler','Parker','Reese','Charlie','Rowan','Dakota','Emerson','Finley','Sage','James','Michael','Robert','David','William','Joseph','Daniel','Matthew','Anthony','Christopher','Andrew','Joshua','Benjamin','Samuel','Noah','Liam','Oliver','Elijah','Lucas','Mason','Henry','Ethan','Jack','Gabriel','Isaac','Mateo','Santiago','Diego','Carlos','Luis','Jose','Alejandro','Javier','Miguel','Omar','Amir','Arjun','Ravi','Wei','Jun','Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Nancy','Lisa','Emma','Olivia','Charlotte','Amelia','Sophia','Isabella','Mia','Evelyn','Harper','Emily','Abigail','Ella','Grace','Chloe','Sofia','Camila','Valentina','Lucia','Isabel','Ana','Gabriela','Fatima','Aisha','Priya','Anika','Mei','Lin','Hannah'],
  surnames: ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Chen','Wang','Li','Kim','Park','Patel','Shah','Singh','Khan','Ali','Ahmed','Hassan','Brooks','Reed','Turner','Morgan','Cruz','Reyes','Morales','Ortiz','Murphy','Kelly','Sullivan','O’Brien','Cohen','Goldberg','Washington','Jefferson','Bennett','Foster'],
  quality:'authored-unweighted-seed',
} as const;
export const householdBackgrounds = [
  {id:'two-parent',name:'Two-parent household'}, {id:'single-parent',name:'Single-parent household'},
  {id:'extended-family',name:'Extended-family household'}, {id:'adoptive',name:'Adoptive family'},
  {id:'guardian',name:'Guardian household'}, {id:'foster',name:'Foster placement'},
] as const;
export const healthcareCoverageTypes = ['Parent/guardian plan','Employer-sponsored insurance','Private insurance','Medicare','Uninsured'] as const;
export const housingTypes = ['Family home','Shared apartment','Studio apartment','One-bedroom apartment','Larger apartment','Townhouse','Detached house','Student housing','Assisted living'] as const;
export const expenseCategories = ['Housing','Utilities','Food','Transport','Healthcare','Insurance','Childcare','Education','Debt payments','Personal spending'] as const;
export const activities = [
  {id:'walk',name:'Take a walk',minimumAge:6}, {id:'read',name:'Read a book',minimumAge:6},
  {id:'creative-hobby',name:'Try a creative hobby',minimumAge:6}, {id:'library',name:'Visit the library',minimumAge:6},
  {id:'school-club',name:'Join a school club',minimumAge:6}, {id:'sports',name:'Play a sport',minimumAge:6},
  {id:'volunteer',name:'Volunteer',minimumAge:14}, {id:'driving-lessons',name:'Take driving lessons',minimumAge:16},
] as const;
export const cityLifeSeeds = [
  {cityNames:['New York City','Chicago','Boston','Charlotte','Miami'],industryIds:['finance','accounting','administration'],theme:'Business and professional networks'},
  {cityNames:['San Jose','San Francisco','Seattle','Austin','Raleigh'],industryIds:['software','information-technology'],theme:'Technology and technical careers'},
  {cityNames:['Los Angeles','Long Beach','Las Vegas','Nashville'],industryIds:['entertainment','hospitality','media'],theme:'Entertainment and visitor-facing work'},
  {cityNames:['Houston','Bakersfield','Oklahoma City','Tulsa'],industryIds:['energy','construction'],theme:'Energy and industrial work'},
  {cityNames:['Detroit','Milwaukee','Columbus','Indianapolis'],industryIds:['manufacturing','logistics','automotive'],theme:'Manufacturing and logistics'},
  {cityNames:['Washington','Sacramento','Virginia Beach','Colorado Springs'],industryIds:['public-service','administration'],theme:'Government and public service'},
] as const;
export const cityLifeSeedNotes = 'Authored event themes, not measured labor-market shares. All cities can have ordinary healthcare, education, retail and service work. Geographic themes do not restrict characters or imply personality.';
