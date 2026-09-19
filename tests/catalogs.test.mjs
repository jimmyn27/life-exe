import test from 'node:test';
import assert from 'node:assert/strict';
import { cities, states, cityOptions, cityById, resolveCity, displayCity, regionalProfile, unitedStates, benefits, retirementSystems, US_SNAPSHOT, sources } from '../src/catalogs/us/index.ts';
import { careers, positions, partTimeJobs, industries, salaryRangeForPosition, matchesCareerMajor, careerMajorFit, meetsPositionEducation } from '../src/catalogs/us/careers.ts';
import { majors, credentials, trainingPrograms, institutionTypes, educationFundingTypes, communityCollegePrograms, associateMajorIds, certificateMajorIds } from '../src/catalogs/us/education.ts';
import { namePool, cityLifeSeeds, healthcareCoverageTypes } from '../src/catalogs/us/lifeContent.ts';
import { emptyStore, upsertLife, persistStore, loadStore, parseStore, restartLife } from '../src/saves.ts';
import { money } from '../src/money.ts';

const unique = rows => assert.equal(new Set(rows).size, rows.length);
test('community college awards open appropriate ranks without bypassing advanced education',()=>{
  positions.forEach(position=>position.educationRoutes.forEach(route=>{
    if(route.credentialId) assert.ok(credentials.some(row=>row.id===route.credentialId));
    route.requiredMajorIds.forEach(id=>assert.ok(majors.some(row=>row.id===id)));
    if(['associate','certificate'].includes(route.credentialId)) route.requiredMajorIds.forEach(id=>
      assert.ok(communityCollegePrograms.some(program=>program.credentialId===route.credentialId && program.majorId===id)));
  }));
  const designCertificate=[{credentialId:'certificate',majorId:'graphic-design'}];
  assert.equal(meetsPositionEducation('design-1',designCertificate),true);
  assert.equal(meetsPositionEducation('design-2',designCertificate),false);
  const computingAssociate=[{credentialId:'associate',majorId:'computing'}];
  assert.equal(meetsPositionEducation('software-1',computingAssociate),true);
  assert.equal(meetsPositionEducation('software-2',computingAssociate),false);
  assert.equal(meetsPositionEducation('civil-engineering-1',[{credentialId:'associate',majorId:'engineering'}]),false);
  assert.equal(meetsPositionEducation('teaching-1',[{credentialId:'certificate',majorId:'education'}]),false);
  assert.equal(meetsPositionEducation('design-1',[{credentialId:'bachelor',majorId:'biology'},...designCertificate]),true);
  assert.equal(meetsPositionEducation('design-3',[{credentialId:'bachelor',majorId:'biology'},...designCertificate]),false);
  assert.equal(meetsPositionEducation('office-1',[{credentialId:'ged'}]),true);
  assert.throws(()=>meetsPositionEducation('unknown',[]));
});
const life = city => ({ id:'us-test',name:'Jamie Morgan',firstName:'Jamie',lastName:'Morgan',city:city.name,locationId:city.id,catalogSnapshotId:US_SNAPSHOT.id,age:18,birthYear:2000,balance:500,stats:{Health:90,Happiness:80,Smarts:70,Looks:60},log:[] });
const storage = () => { const entries=new Map(); return { getItem:key=>entries.get(key)??null,setItem:(key,value)=>entries.set(key,value) }; };

test('50 largest Census places have unique city labels, stable GEOIDs and valid hidden states', () => {
  assert.equal(cities.length,50); unique(cities.map(city=>city.id)); unique(cities.map(city=>city.name));
  unique(cities.map(city=>city.censusGeoid)); unique(states.map(state=>state.id));
  assert.equal(states.length,28);
  cities.forEach((city,index)=>{
    assert.equal(city.countryId,'US'); assert.equal(city.populationRank,index+1);
    assert.ok(states.some(state=>state.id===city.stateId));
    assert.match(city.id,/^us-\d{2}-\d{5}$/); assert.equal(city.censusGeoid,city.id.slice(3).replace('-',''));
    assert.ok(city.population>0); if(index) assert.ok(cities[index-1].population>=city.population);
    assert.equal(displayCity({city:city.name,locationId:city.id}),city.name);
  });
  assert.equal(cities[0].population,8584629);
  assert.deepEqual(cityOptions.map(city=>city.name),cities.map(city=>city.name).sort((a,b)=>a.localeCompare(b,'en-US')));
  assert.equal(regionalProfile(resolveCity('Washington').id).state.kind,'federal-district');
});

test('all cities share national pay, tax, benefits and legal policies without regional overrides', () => {
  cities.forEach(city=>{
    const profile=regionalProfile(city.id);
    assert.equal(profile.country,unitedStates);
    assert.equal(profile.state.incomeTax,undefined); assert.equal(profile.localTaxes,undefined);
    assert.equal(profile.state.labor,undefined); assert.equal(profile.state.healthcare,undefined);
  });
  const policy=unitedStates.simulationPolicy;
  assert.equal(policy.payScope,'national'); assert.equal(policy.incomeTaxScope,'national');
  assert.equal(policy.stateAndLocalTaxEnabled,false); assert.equal(policy.medicaidEnabled,false); assert.equal(policy.paidLeaveEnabled,false);
  assert.ok(benefits.every(benefit=>benefit.scope==='national-game-model'));
  assert.ok(!benefits.some(benefit=>['medicaid','chip'].includes(benefit.id)));
  assert.ok(!healthcareCoverageTypes.includes('Medicaid'));
  assert.equal(US_SNAPSHOT.dynamicPolicies,false); assert.equal(unitedStates.currency,'USD');
  assert.throws(()=>regionalProfile('unknown'));
});

test('legacy US strings resolve only when their state and country match', () => {
  assert.equal(resolveCity('Seattle, Washington, United States').stateId,'WA');
  assert.equal(resolveCity('New York, NY, USA').name,'New York City');
  assert.equal(resolveCity('Kansas City, Missouri').stateId,'MO');
  assert.equal(resolveCity('Kansas City, Kansas'),undefined);
  assert.equal(resolveCity('Portland, Maine'),undefined);
  assert.equal(resolveCity('London, England, United Kingdom'),undefined);
  assert.equal(resolveCity('Seattle, Washington, Canada'),undefined);
});

test('career paths, education references, progression links and city flavor references are consistent', () => {
  unique(careers.map(row=>row.id)); unique(positions.map(row=>row.id)); unique(majors.map(row=>row.id));
  unique(credentials.map(row=>row.id)); unique(trainingPrograms.map(row=>row.id));
  careers.forEach(career=>{
    assert.ok(industries.includes(career.industryId));
    if(career.usualCredentialId) assert.ok(credentials.some(row=>row.id===career.usualCredentialId));
    [...career.requiredMajorIds,...career.preferredMajorIds].forEach(id=>assert.ok(majors.some(major=>major.id===id)));
    unique(career.requiredMajorIds); unique(career.preferredMajorIds);
    assert.equal(positions.filter(position=>position.careerId===career.id).length,3);
  });
  positions.forEach(position=>{
    assert.ok(careers.some(career=>career.id===position.careerId));
    if(position.nextPositionId) {
      const next=positions.find(row=>row.id===position.nextPositionId);
      assert.equal(next.careerId,position.careerId); assert.equal(next.rank,position.rank+1);
    }
  });
  cityLifeSeeds.forEach(seed=>{
    seed.cityNames.forEach(name=>assert.ok(resolveCity(name)));
    seed.industryIds.forEach(id=>assert.ok(industries.includes(id)));
  });
  unique(namePool.givenNames); unique(namePool.surnames);
});

test('postsecondary catalogs exclude trades and every retained credential has an institution route', () => {
  assert.equal(majors.length,32); unique(majors.map(row=>row.name));
  assert.equal(majors.filter(row=>row.name==='Information Technology').length,1);
  assert.deepEqual(institutionTypes.map(row=>row.id),['public-community-college','public-university','private-college']);
  assert.ok(!credentials.some(row=>row.id==='apprenticeship'));
  assert.equal(credentials.length,8);
  assert.ok(!credentials.some(row=>row.id==='doctorate'));
  const communityCollege=institutionTypes.find(row=>row.id==='public-community-college');
  assert.equal(communityCollege.role,'degree-awarding'); assert.deepEqual(communityCollege.credentials,['certificate','associate']);
  assert.equal(majors.find(row=>row.id==='computing').name,'Computer Science');
  assert.equal(associateMajorIds.length,16); assert.equal(certificateMajorIds.length,8);
  assert.equal(communityCollegePrograms.length,24); unique(communityCollegePrograms.map(row=>row.id));
  communityCollegePrograms.forEach(program=>{
    assert.ok(majors.some(major=>major.id===program.majorId));
    assert.equal(program.institutionTypeId,communityCollege.id);
    assert.ok(communityCollege.credentials.includes(program.credentialId));
    assert.equal(program.nominalYears,credentials.find(row=>row.id===program.credentialId).nominalYears);
    assert.equal(program.purpose,'employment');
    assert.ok(!['nursing','architecture','physics'].includes(program.majorId));
  });
  assert.ok(!trainingPrograms.some(row=>/apprenticeship|automotive|nursing/.test(row.id)));
  assert.ok(!educationFundingTypes.includes('Apprenticeship wages'));
  assert.ok(!educationFundingTypes.includes('Private student loan'));
  institutionTypes.forEach(institution=>institution.credentials.forEach(id=>assert.ok(credentials.some(row=>row.id===id))));
  trainingPrograms.forEach(program=>assert.ok(institutionTypes.some(institution=>institution.credentials.includes(program.credentialId))));
  for(const id of ['electrician','plumber','mechanic']) {
    const career=careers.find(row=>row.id===id);
    assert.equal(career.workplaceTrainingRequired,true);
    assert.equal(career.usualCredentialId,'high-school');
    assert.equal(career.requiredMajorIds.length,0);
  }
});

test('career major requirements accept alternatives while preferences never block eligibility', () => {
  assert.equal(matchesCareerMajor('civil-engineering',['engineering']),true);
  assert.equal(matchesCareerMajor('civil-engineering',['architecture']),false);
  assert.equal(matchesCareerMajor('design',['music']),false);
  assert.equal(matchesCareerMajor('design',['graphic-design']),true);
  assert.equal(matchesCareerMajor('design',['fine-arts']),true);
  assert.equal(matchesCareerMajor('finance',['accounting-finance']),true);
  assert.equal(matchesCareerMajor('finance',['economics']),true);
  assert.equal(matchesCareerMajor('finance',['psychology']),false);
  assert.equal(matchesCareerMajor('software',['information-technology']),true);
  assert.equal(matchesCareerMajor('software',['mathematics']),true);
  assert.equal(matchesCareerMajor('software',['not-real']),false);
  assert.equal(matchesCareerMajor('nursing',['biology']),false);
  assert.equal(matchesCareerMajor('nursing',['nursing']),true);
  assert.equal(matchesCareerMajor('nursing',['business','nursing']),true);
  assert.equal(matchesCareerMajor('nursing',[]),false);
  assert.equal(matchesCareerMajor('retail',[]),true);
  assert.deepEqual(careerMajorFit('marketing',['history']),{meetsRequirement:true,hasPreferredMajor:false});
  assert.deepEqual(careerMajorFit('marketing',['marketing']),{meetsRequirement:true,hasPreferredMajor:true});
  assert.equal(careerMajorFit('human-resources',['sociology']).hasPreferredMajor,true);
  assert.equal(careerMajorFit('legal',['criminology']).hasPreferredMajor,true);
  assert.equal(careerMajorFit('legal',['legal-studies']).hasPreferredMajor,false);
  assert.equal(careerMajorFit('hospitality',['hospitality']).hasPreferredMajor,true);
  assert.equal(matchesCareerMajor('hospitality',[]),true);
  assert.equal(matchesCareerMajor('music',[]),true); assert.equal(matchesCareerMajor('dance',[]),true);
  assert.equal(careers.find(row=>row.id==='nursing').usualCredentialId,'bachelor');
  assert.equal(careers.find(row=>row.id==='it-support').usualCredentialId,'high-school');
  assert.equal(careers.find(row=>row.id==='legal').usualCredentialId,'jd');
  assert.equal(careers.find(row=>row.id==='medicine').usualCredentialId,'md');
  assert.throws(()=>matchesCareerMajor('not-real',[]));
});

test('full-time salaries and part-time hourly wages are separate national pay models', () => {
  assert.equal(positions.length,84); assert.equal(partTimeJobs.length,13);
  positions.forEach(position=>{
    assert.equal(position.employmentType,'full-time'); assert.equal(position.payBasis,'annual-salary');
    assert.equal(position.hourlyWageRange,undefined);
    assert.deepEqual(salaryRangeForPosition(position.id),position.annualSalaryRange);
    assert.ok(position.annualSalaryRange[0]<=position.annualSalaryRange[1]);
  });
  unique(partTimeJobs.map(row=>row.id));
  partTimeJobs.forEach(job=>{
    assert.equal(job.employmentType,'part-time'); assert.equal(job.payBasis,'hourly-wage');
    assert.equal(job.annualSalaryRange,undefined); assert.ok(job.hourlyWageRange[0]>=unitedStates.employment.nationalHourlyMinimum);
    assert.ok(job.hourlyWageRange[0]<=job.hourlyWageRange[1]);
    assert.ok(job.weeklyHoursRange[0]>0 && job.weeklyHoursRange[1]<40);
  });
  assert.throws(()=>salaryRangeForPosition('unknown'));
  assert.equal(money(1234.5),'$1,234.50');
});

test('national tax brackets and retirement references remain fixed and have valid sources', () => {
  Object.values(unitedStates.federalIncomeTax.brackets).forEach(brackets=>{
    assert.equal(brackets[0].over,0);
    brackets.forEach((bracket,index)=>{
      assert.ok(bracket.rate>0 && bracket.rate<1);
      if(index) assert.ok(bracket.over>brackets[index-1].over);
    });
  });
  const pension=retirementSystems[0];
  assert.ok(pension.earliestClaimAge<pension.fullRetirementAge && pension.fullRetirementAge<pension.latestDelayedCreditAge);
  assert.equal(pension.mandatoryRetirementAge,null);
  const checkSources=value=>{
    if(!value || typeof value!=='object') return;
    if(value.sourceIds) value.sourceIds.forEach(id=>assert.ok(sources[id],`Unknown source ${id}`));
    Object.values(value).forEach(checkSources);
  };
  checkSources(unitedStates); checkSources(benefits); checkSources(retirementSystems);
});

test('US city IDs survive saving and restarting; mismatched/unknown IDs are rejected', () => {
  const current=life(cityById('us-48-35000'));
  const store=upsertLife(emptyStore(),current); const disk=storage(); persistStore(disk,store);
  assert.deepEqual(loadStore(disk).lives[0],{...current,stats:{...current.stats,Athleticism:50}});
  assert.equal(restartLife(current).locationId,current.locationId);
  for(const change of [{city:'Seattle'},{locationId:'unknown'},{catalogSnapshotId:'unknown'}]) {
    assert.throws(()=>parseStore(JSON.stringify(upsertLife(emptyStore(),{...current,...change}))));
  }
});

test('known old US locations upgrade without moving unsupported legacy characters or changing balances', () => {
  const disk=storage();
  const old={...life(cities[0]),locationId:undefined,catalogSnapshotId:undefined,city:'Seattle, Washington, United States'};
  const legacy={...old,id:'legacy',city:'Toronto, Ontario, Canada'};
  persistStore(disk,upsertLife(upsertLife(emptyStore(),old),legacy));
  const [upgraded,preserved]=loadStore(disk).lives;
  assert.equal(upgraded.city,'Seattle'); assert.equal(regionalProfile(upgraded.locationId).state.id,'WA');
  assert.equal(upgraded.balance,old.balance);
  assert.equal(preserved.city,legacy.city); assert.equal(preserved.locationId,undefined);
});
