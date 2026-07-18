alter table public.agent_runs drop constraint if exists agent_runs_agent_type_check;
alter table public.agent_runs add constraint agent_runs_agent_type_check check(agent_type in ('counselor','career','skills','evidence','jobs','learning','market','mentor','privacy','integrity','explainability','fairness','understand','explore','navigate','build','copilot360','linkedin'));
