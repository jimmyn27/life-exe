# US catalog foundation

The game uses one fixed modern-US ruleset (`us-2026-v1`) for every city. Life dates advance, but economic parameters and laws do not. New characters choose among 50 cities; labels contain only the city name. State and country remain hidden geography, with no policy overrides.

## Catalog contents

| File | Contents |
| --- | --- |
| `src/catalogs/us/cities.ts` | Top 50 incorporated places from Census Vintage 2025 estimates, population ranks and stable Census GEOIDs |
| `src/catalogs/us/regions.ts` | 27 represented states plus Washington, DC; geography only |
| `src/catalogs/us/federal.ts` | National income-tax brackets, payroll references, employment policy, age rules, benefit templates and retirement |
| `src/catalogs/us/careers.ts` | 28 careers, 84 full-time salary positions, eight part-time hourly jobs, required/preferred majors and promotion paths |
| `src/catalogs/us/education.ts` | 32 unique flat majors, eight credentials, three institution types, medical/law school and funding types |
| `src/catalogs/us/lifeContent.ts` | Unweighted authored name pools, household backgrounds, insurance/housing types, expense categories, activities and city event themes |
| `src/catalogs/us/sources.ts` | Snapshot metadata and research references |

## Deliberate simplifications

- Full-time employment pays an annual USD salary; part-time employment pays an hourly USD wage. National authored ranges vary by job and rank, never by city. Part-time offers now use 10–20 weekly hours, with starter jobs at 14 and additional jobs at 16. Runtime annual earnings use the stored hourly wage × weekly hours × 52, paid on the next Age Up without tax; full-time hiring remains a preview.
- Income tax uses the same 2026 federal bracket reference everywhere. State, county and city income taxes are omitted. Sales and property taxes are disabled rather than silently estimated.
- A federal hourly floor is the national game floor; real regional/sector/tipped exceptions are omitted. Salaried/hourly pay basis does not itself determine overtime eligibility.
- Medicaid, CHIP and mandatory/paid-leave simulation are omitted. Healthcare uses one shared model for parent, employer, private, Medicare and uninsured coverage.
- Remaining benefit catalogs use simplified national eligibility. Real programs provide inspiration; state administration, local waiting lists and regional payment schedules are not simulated.
- School progression, program durations, tuition models and professional license requirements are national. School enrollment begins at 6, changes to middle school at 10 and high school at 14, and graduates at 18. No in-state/out-of-state tuition differential.
- Postsecondary institutions are public community colleges, public universities, and private colleges/universities. Apprenticeships and automotive technology are removed from education; trade careers use workplace training instead.
- Community colleges offer 16 employment-focused associate majors (two years) and eight career certificate subjects (one year), reusing university major IDs. Physics replaces the Human Resources university major; Business Administration covers community college preparation for entry-level HR work. Transfer routes remain future work; research doctorates are omitted. IT support uses a high-school baseline with Computer Science/IT qualifications preferred.
- Majors use the user's flat list, with Information Technology included once. Accounting and Finance is a combined major; other subjects such as Biology, Chemistry, Psychology and Journalism are separately selectable. No specialization selection is needed.
- Nursing uses only the Nursing major, with a nominal bachelor's route. Separate practical-nursing and associate-nursing programs are removed. Medical school and law school remain professional programs.
- Careers have separate required and preferred major lists. Required majors are alternatives: completing any one qualifies for the subject check. Preferences are optional and never block eligibility. Degree level, licensing, experience, portfolios and auditions are separate future checks. See [CAREER_EDUCATION.md](CAREER_EDUCATION.md) for the complete mapping.
- Adulthood, marriage and driving ages prefixed `game` are authored uniform rules. Complex legal procedures are deferred. Source-backed federal voting, alcohol, tobacco and youth-employment references remain separate.
- Retirement uses one Social Security reference and shared savings-plan types. There is no forced retirement age and no regional pension tax or public-employee pension variation.
- Cities can supply authored event themes. Themes do not restrict careers or change pay, tax or eligibility.

## Sources and accuracy

City populations are from the [Census Bureau's Vintage 2025 estimates](https://www.census.gov/data/datasets/time-series/demo/popest/2020s-total-cities-and-towns.html), using July 1, 2025 incorporated-place populations rather than metropolitan populations. Consolidated-city balances are included once. New York's boroughs are not extra locations, and Kansas City refers to Missouri. No duplicate visible city names occur in this selection.

National ordinary-income tax references use [IRS 2026 adjustments](https://www.irs.gov/irb/2025-45_IRB). Retirement references use [SSA retirement planning](https://www.ssa.gov/retirement/plan-for-retirement), the [SSA benefit formula](https://www.ssa.gov/OACT/COLA/piaformula.html), and [IRS savings limits](https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500). The full reference list lives in `sources.ts`.

Salary/hourly ranges, nominal career progression and name pools are authored game seeds, not measured national wage or demographic datasets. Simplified benefit criteria and uniform game ages are design decisions, not a claim that actual US law is uniform. Tax references do not yet handle every credit, deduction or type of income.

## Integration status

The new-character selector, demo location, money displays, job previews and major previews use these catalogs. Job applications, hiring, tuition, annual pay, tax collection, pensions and benefit payments remain future simulation work; catalogs alone do not apply them during Age Up. Name pools and other life content are prepared for future generation.

New US characters save a city ID and ruleset ID; state is looked up behind the scenes. Recognized legacy US location strings are upgraded on load. Unsupported older locations and their histories are preserved instead of silently relocating characters. Existing numeric balances are preserved as game amounts; there is no currency-conversion system.


Postgraduate catalog: all 32 majors now have authored two-year master’s routes with explicit bachelor’s subject alternatives. Physics replaces Human Resources as a major. Law school (JD, three years) accepts any bachelor’s major. Medical school (medical degree, four years) requires a bachelor’s major in Biology, Chemistry, Nursing, Kinesiology or Physics, with no coursework system. Admission and professional licensing checks remain separate. See `graduatePrograms` in `education.ts` and the postgraduate tables in `CAREER_EDUCATION.md`. These routes are catalog/helper definitions, not annual simulation integration.
