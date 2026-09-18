# Career and education mapping

These are authored game requirements, shared nationally. Any one required major passes the subject check; preferred majors are optional advantages. An empty required list means any major or no major passes this check, not that all other qualifications are waived. Degree level, experience, licensing and performance checks remain separate future hiring work.

## Community college routes by position

Position `educationRoutes` is the authoritative list of alternative education routes. The career-level table below describes the original route. `meetsPositionEducation` checks a credential and its major on the same completed award; it does not combine an unrelated degree with a subject certificate. GED substitutes for a high school diploma. These checks are available for future hiring integration.

| Career | Additional route | Positions opened | Required major: any one |
| --- | --- | --- | --- |
| Software development | Associate | Junior software developer | Computer Science, Information Technology |
| Cybersecurity | Associate | Junior security analyst | Computer Science, Information Technology |
| Marketing | Certificate | Marketing assistant | Marketing, Business Administration |
| Marketing | Associate | Marketing assistant, Marketing specialist | Marketing, Business Administration, Communications |
| Journalism | Associate | Junior reporter | Journalism, Communications |
| Graphic design | Certificate | Junior graphic designer | Graphic Design |
| Graphic design | Associate | Junior graphic designer, Graphic designer | Graphic Design, Fine Arts |
| Human resources | Associate | HR coordinator | Business Administration |

Preferred majors apply to related community college awards as well as university awards. They improve the intended hiring preference without adding mandatory education to retail, food service, hospitality, office administration, library support, IT support, music or dance. An Education certificate does not qualify a school teacher; an Engineering associate does not qualify a civil engineer. Some programs still await dedicated career branches, including childcare, engineering technician and criminal justice work. Licenses, experience and performance remain separate from education matching.

| Career | Required major: any one | Preferred majors |
| --- | --- | --- |
| Retail | None | Business Administration, Marketing |
| Food service | None | Business Administration |
| Hospitality | None | Hospitality, Business Administration, Communications, Marketing |
| Office administration | None | Business Administration, Communications |
| Library support | None | Literature, History, Art History, Information Technology |
| IT support | None | Information Technology, Computer Science |
| Software development | Computer Science, Information Technology, Mathematics, Engineering | Computer Science |
| Cybersecurity | Computer Science, Information Technology, Engineering | Computer Science, Information Technology |
| Accounting | Accounting and Finance | Accounting and Finance |
| Financial analysis | Accounting and Finance, Economics, Mathematics, Business Administration | Accounting and Finance, Economics |
| Marketing | None | Marketing, Communications, Business Administration, Psychology |
| Registered nursing | Nursing | Nursing |
| Medicine | No specific undergraduate major; medical degree separately required | Biology, Chemistry, Kinesiology |
| School teaching | Education | Education |
| Social services | None | Psychology, Sociology, Anthropology |
| Electrical trades | None | None; workplace training |
| Plumbing | None | None; workplace training |
| Automotive service | None | None; workplace training |
| Manufacturing | None | None |
| Warehouse logistics | None | None |
| Journalism | None | Journalism, Communications, Literature, Political Science, History |
| Graphic design | Graphic Design, Fine Arts | Graphic Design |
| Legal practice | No specific undergraduate major; Juris Doctor separately required | Criminology, Political Science, Philosophy, History, Literature |
| Civil engineering | Engineering | Engineering |
| Human resources | None | Business Administration, Psychology, Sociology |
| Architecture | Architecture | Architecture |
| Music performance | None; performance requirements will be separate | Music, Fine Arts |
| Dance performance | None; performance requirements will be separate | Dance, Kinesiology, Fine Arts |

Social Work was changed to Social Services (case worker, senior case worker, supervisor) because the major list no longer includes Social Work. This is a nonclinical game career, not a route to licensed clinical social work. Its internal career ID stays `social-work` for continuity.

Architecture, Human Resources, Music Performance and Dance Performance were added with three positions each. Pay ranges remain national authored game values. A Criminology major alone does not award a Juris Doctor or a law license; biology/chemistry do not award a medical degree. A nursing major replaces the separate nursing programs in the game.

Some majors currently have no exclusive career path. They can still support preferred qualifications, future activities and later career expansion; the catalog does not promise a dedicated job for every subject.


## Postgraduate education routes

These are authored national game admission routes, not a claim that real universities share identical requirements. All 32 existing majors have a two-year master’s program. Each requires a completed bachelor’s degree in any one subject in its required list. Credentials and subjects must occur on the same completed award. A certificate or associate degree cannot supplement an unrelated bachelor’s to pass a subject restriction. Multiple bachelor’s degrees may supply an eligible award.

| Master’s subject | Accepted bachelor’s majors (any one) |
| --- | --- |
| Accounting and Finance | Accounting and Finance, Economics, Business Administration |
| Computer Science | Computer Science, Information Technology, Mathematics, Engineering |
| Engineering | Engineering |
| Nursing | Nursing |
| Biology | Biology, Chemistry |
| Psychology | Psychology, Sociology |
| Chemistry | Chemistry, Biology |
| Economics | Economics, Accounting and Finance, Mathematics, Business Administration |
| Political Science | Political Science, History, Economics, Sociology, Philosophy |
| Communications | Communications, Journalism, Marketing, Literature |
| Literature | Literature, Communications, Journalism |
| History | History, Political Science, Anthropology, Art History |
| Art History | Art History, History, Fine Arts |
| Graphic Design | Graphic Design, Fine Arts |
| Information Technology | Information Technology, Computer Science, Engineering |
| Business Administration | Any bachelor’s major |
| Journalism | Journalism, Communications, Literature, Political Science, History |
| Fine Arts | Fine Arts, Graphic Design, Art History |
| Music | Music |
| Mathematics | Mathematics, Engineering, Computer Science |
| Education | Education, Psychology, Sociology |
| Marketing | Marketing, Business Administration, Communications, Psychology |
| Anthropology | Anthropology, Sociology, History |
| Sociology | Sociology, Anthropology, Psychology, Criminology |
| Criminology | Criminology, Sociology, Psychology, Political Science |
| Philosophy | Philosophy, Literature, History, Political Science, Theology |
| Theology | Theology, Philosophy, History |
| Kinesiology | Kinesiology, Biology, Nursing |
| Architecture | Architecture |
| Physics | Physics, Mathematics, Engineering |
| Dance | Dance |
| Hospitality | Hospitality, Business Administration, Marketing |

Business Administration is labeled Master of Business Administration (MBA). Business Administration, Accounting and Finance, Economics and Marketing are optional preferred backgrounds for this authored MBA route; other bachelor’s majors remain eligible. Master’s Nursing, Engineering and Architecture require their matching bachelor’s major in this simplified model. No master’s degree grants a professional license or substitutes for a JD/medical degree.

| Professional program | Credential | Length after bachelor’s | Bachelor’s subject requirement | Other requirements reserved for future admission/practice systems |
| --- | --- | --- | --- | --- |
| Law school | Juris Doctor | 3 years | Any major | Academic results and admission testing; national bar examination before legal practice |
| Medical school | Medical degree | 4 years | Biology, Chemistry, Nursing, Kinesiology or Physics | Academic results and admission testing; residency and national medical license |

JD and medical programs do not add undergraduate majors called Law or Medicine. Professional admission has no preferred undergraduate major in this catalog; existing career preferences remain separate hiring metadata. The ABA describes many valid undergraduate backgrounds for law school (https://www.americanbar.org/groups/legal_education/resources/law-students/pre-law/). The AAMC explains that medical schools do not require or prefer a specific major, while prerequisite coursework varies by school (https://students-residents.aamc.org/applying-medical-school/how-choose-best-premed-major). For this game, medical entry is deliberately simplified to the five selected bachelor’s majors instead of coursework; this authored rule differs from real admissions. No coursework system is planned.

`graduatePrograms` contains 34 routes; `graduateEducationFit` and `meetsGraduateEducation` check completed education only. Tuition, grades, admissions scores, enrollment, degree completion and licensing are not applied during Age Up by this catalog change. Existing `trainingPrograms` IDs remain compatible.


Physics replaces the Human Resources major and its master’s route. Human Resources remains a career; its preferred bachelor’s backgrounds are Business Administration, Psychology and Sociology. Physics is a university major, with a two-year master’s route accepting Physics, Mathematics or Engineering; it is not added to community-college programs. Medical school requires a bachelor’s award in any one of Biology, Chemistry, Nursing, Kinesiology or Physics. No coursework tracking is required. JD continues to accept any bachelor’s major.
