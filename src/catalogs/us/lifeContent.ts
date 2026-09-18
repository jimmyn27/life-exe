// Authored variety for future NPC generation; not frequency-weighted demographic
// data. Names are not assigned by city, race, religion or a personality stereotype.
export const namePool = {
  givenNames: ['Alex','Jordan','Taylor','Casey','Morgan','Jamie','Riley','Avery','Quinn','Cameron','Drew','Skyler','Parker','Reese','Charlie','Rowan','Dakota','Emerson','Finley','Sage','James','Michael','Robert','David','William','Joseph','Daniel','Matthew','Anthony','Christopher','Andrew','Joshua','Benjamin','Samuel','Noah','Liam','Oliver','Elijah','Lucas','Mason','Henry','Ethan','Jack','Gabriel','Isaac','Mateo','Santiago','Diego','Carlos','Luis','Jose','Alejandro','Javier','Miguel','Omar','Amir','Arjun','Ravi','Wei','Jun','Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Nancy','Lisa','Emma','Olivia','Charlotte','Amelia','Sophia','Isabella','Mia','Evelyn','Harper','Emily','Abigail','Ella','Grace','Chloe','Sofia','Camila','Valentina','Lucia','Isabel','Ana','Gabriela','Fatima','Aisha','Priya','Anika','Mei','Lin','Hannah','Alice','Audrey','Beatrice','Bella','Brianna','Caroline','Cecilia','Clara','Daisy','Delilah','Eleanor','Elena','Elise','Esme','Eva','Freya','Genevieve','Hazel','Iris','Jade','Josephine','Juliet','Layla','Leah','Lila','Lydia','Madeline','Maeve','Maya','Naomi','Natalie','Nora','Penelope','Ruby','Sadie','Serena','Stella','Violet','Vivian','Zara','Zoey','Adam','Adrian','Alan','Arthur','Asher','Austin','Blake','Caleb','Cole','Connor','Declan','Dominic','Edward','Elliot','Evan','Felix','Finn','George','Graham','Harrison','Hugo','Ian','Jasper','Julian','Leo','Levi','Miles','Nathan','Nicholas','Nolan','Oscar','Owen','Patrick','Peter','Raphael','Sebastian','Simon','Theo','Thomas','Vincent','Wesley','Xavier','Yusuf','Zachary'],
  surnames: ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Chen','Wang','Li','Kim','Park','Patel','Shah','Singh','Khan','Ali','Ahmed','Hassan','Brooks','Reed','Turner','Morgan','Cruz','Reyes','Morales','Ortiz','Murphy','Kelly','Sullivan','O’Brien','Cohen','Goldberg','Washington','Jefferson','Bennett','Foster','Abbott','Bailey','Barnes','Bell','Bryant','Butler','Collins','Cooper','Cox','Diaz','Edwards','Ellis','Evans','Fisher','Ford','Fox','Gibson','Gomez','Gordon','Grant','Gray','Griffin','Hamilton','Harper','Hayes','Henderson','Howard','Hughes','Hunt','James','Jenkins','Kennedy','Lane','Lawrence','Marshall','Mason','Matthews','Morris','Murray','Palmer','Perry','Peterson','Phillips','Porter','Powell','Price','Reynolds','Rice','Richardson','Ross','Russell','Sanders','Simpson','Spencer','Stevens','Stone','Sutton','Tucker','Warren','Watson','Webb','West','Wood','Woods','Zhang','Das','Kapoor','Okafor','Mensah','Abdi'],
  quality:'authored-unweighted-seed',
} as const;
export function givenNamesForGender(gender:'Male'|'Female'):readonly string[] {
 const neutral=namePool.givenNames.slice(0,20);
 return gender==='Male'?[...neutral,...namePool.givenNames.slice(namePool.givenNames.indexOf('James'),namePool.givenNames.indexOf('Mary')),...namePool.givenNames.slice(namePool.givenNames.indexOf('Adam'))]:[...neutral,...namePool.givenNames.slice(namePool.givenNames.indexOf('Mary'),namePool.givenNames.indexOf('Adam'))];
}
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
  {id:'school-club',name:'Join a school club',minimumAge:12}, {id:'sports',name:'Play a sport',minimumAge:12},
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
