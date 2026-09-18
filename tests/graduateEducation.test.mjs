import test from 'node:test';
import assert from 'node:assert/strict';
import {majors,credentials,institutionTypes,masterPrograms,professionalDegreePrograms,graduatePrograms,graduateEducationFit,meetsGraduateEducation} from '../src/catalogs/us/education.ts';
import {meetsPositionEducation} from '../src/catalogs/us/careers.ts';
test('every major has one defined master route and postgraduate references are consistent',()=>{
 assert.equal(masterPrograms.length,32);assert.equal(graduatePrograms.length,34);assert.equal(new Set(graduatePrograms.map(p=>p.id)).size,34);
 for(const program of graduatePrograms){assert.equal(program.requiredCredentialId,'bachelor');assert.equal(program.nominalYears,credentials.find(c=>c.id===program.credentialId).nominalYears);
 for(const id of [...program.requiredMajorIds,...program.preferredMajorIds])assert.ok(majors.some(m=>m.id===id));
 for(const id of program.institutionTypeIds)assert.ok(institutionTypes.find(i=>i.id===id).credentials.includes(program.credentialId));
 if(program.credentialId==='master')assert.ok(majors.some(m=>m.id===program.majorId));else assert.equal(program.majorId,null);
 }
 for(const major of majors){const program=masterPrograms.find(p=>p.majorId===major.id);assert.ok(program);assert.equal(meetsGraduateEducation(program.id,[{credentialId:'bachelor',majorId:major.id}]),true);}
});
test('master requirements are OR alternatives on completed bachelor awards, never assembled across credentials',()=>{
 const bachelor=majorId=>[{credentialId:'bachelor',majorId}];
 assert.equal(meetsGraduateEducation('master-computing',bachelor('mathematics')),true);
 assert.equal(meetsGraduateEducation('master-computing',bachelor('literature')),false);
 assert.equal(meetsGraduateEducation('master-nursing',bachelor('biology')),false);
 assert.equal(meetsGraduateEducation('master-nursing',bachelor('nursing')),true);
 assert.equal(meetsGraduateEducation('master-engineering',bachelor('engineering')),true);
 assert.equal(meetsGraduateEducation('master-architecture',bachelor('fine-arts')),false);
 assert.equal(meetsGraduateEducation('master-computing',[...bachelor('literature'),{credentialId:'certificate',majorId:'computing'}]),false);
 assert.equal(meetsGraduateEducation('master-computing',[{credentialId:'associate',majorId:'computing'}]),false);
 assert.equal(meetsGraduateEducation('master-computing',[...bachelor('literature'),...bachelor('engineering')]),true);
});
test('MBA allows any bachelor subject; preferences never block admission education eligibility',()=>{
 assert.deepEqual(graduateEducationFit('master-business',[{credentialId:'bachelor',majorId:'music'}]),{meetsEducationRequirement:true,hasPreferredMajor:false});
 assert.deepEqual(graduateEducationFit('master-business',[{credentialId:'bachelor',majorId:'business'}]),{meetsEducationRequirement:true,hasPreferredMajor:true});
});
test('JD and medical degree accept any valid bachelor major and cannot be bypassed with lower credentials',()=>{
 for(const program of professionalDegreePrograms){for(const major of majors)assert.equal(meetsGraduateEducation(program.id,[{credentialId:'bachelor',majorId:major.id}]),true);
 for(const credentialId of ['high-school','ged','certificate','associate'])assert.equal(meetsGraduateEducation(program.id,[{credentialId,majorId:'biology'}]),false);
 assert.equal(meetsGraduateEducation(program.id,[]),false);assert.equal(meetsGraduateEducation(program.id,[{credentialId:'bachelor',majorId:'unknown'}]),false);
 }
 assert.throws(()=>meetsGraduateEducation('unknown',[]));
 assert.equal(meetsPositionEducation('medicine-1',[{credentialId:'master',majorId:'biology'}]),false);
 assert.equal(meetsPositionEducation('legal-1',[{credentialId:'master',majorId:'criminology'}]),false);
});
