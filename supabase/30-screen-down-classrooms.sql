-- Shared Screen Down Classroom Mode for four lesson sites.
-- Safe to rerun. Stores only temporary lesson control state; no learner identity or work.
begin;

create or replace function classroom_private.valid_screen_down_stage(p_lesson text,p_stage text)
returns boolean language sql immutable set search_path='' as $$
 select p_lesson in ('year9-week5-project','year7-route-loop-debug','Y6_Week05','kl-coding-lab')
    and p_stage in ('read','screen');
$$;
revoke all on function classroom_private.valid_screen_down_stage(text,text) from public,anon,authenticated;

-- Preserve every existing lesson route while adding the two small states used here.
alter table classroom_private.sessions drop constraint if exists classroom_stage_valid;
alter table classroom_private.sessions add constraint classroom_stage_valid check (
 classroom_private.valid_lesson_stage(lesson,stage)
 or classroom_private.valid_screen_down_stage(lesson,stage)
);

create or replace function classroom_private.screen_down_snapshot(p_session classroom_private.sessions)
returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object(
  'version',1,'lesson',p_session.lesson,'class_id',p_session.class_id,
  'session_id',p_session.id,'stage',case when p_session.locked then 'screen' else 'read' end,
  'locked',p_session.locked,'revision',p_session.revision,
  'expires_at',p_session.expires_at,'server_now',statement_timestamp(),'ended',false,
  'mode',case when p_session.locked then 'attention' else 'self' end
 );
$$;
revoke all on function classroom_private.screen_down_snapshot(classroom_private.sessions) from public,anon,authenticated;

create or replace function public.classroom_screen_down_snapshot(p_class_id uuid,p_lesson text)
returns jsonb language sql stable security definer set search_path='' as $$
 select classroom_private.screen_down_snapshot(s)
 from classroom_private.sessions s
 join classroom_private.classes c on c.id=s.class_id and c.teacher_id=s.teacher_id
 where c.id=p_class_id and s.lesson=p_lesson
   and classroom_private.valid_screen_down_stage(p_lesson,'read')
   and s.expires_at>statement_timestamp()
 order by s.created_at desc limit 1;
$$;

create or replace function public.classroom_screen_down_current(p_class_id uuid,p_lesson text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if not public.classroom_is_teacher() or not exists (
  select 1 from classroom_private.classes where id=p_class_id and teacher_id=auth.uid()
 ) then raise exception 'This class requires its approved teacher' using errcode='42501'; end if;
 if not classroom_private.valid_screen_down_stage(p_lesson,'read') then
  raise exception 'Unsupported Screen Down lesson' using errcode='22023';
 end if;
 return public.classroom_screen_down_snapshot(p_class_id,p_lesson);
end;
$$;

create or replace function public.classroom_screen_down_start(p_class_id uuid,p_lesson text,p_stage text default 'read')
returns jsonb language plpgsql security definer set search_path='' as $$
declare s classroom_private.sessions%rowtype; started_at timestamptz;
begin
 if not public.classroom_is_teacher() then raise exception 'Teacher sign-in required' using errcode='42501'; end if;
 perform 1 from classroom_private.classes where id=p_class_id and teacher_id=auth.uid() for update;
 if not found then raise exception 'This class requires its approved teacher' using errcode='42501'; end if;
 if not classroom_private.valid_screen_down_stage(p_lesson,p_stage) then raise exception 'Unsupported Screen Down lesson' using errcode='22023'; end if;
 started_at:=clock_timestamp();
 delete from classroom_private.sessions where class_id=p_class_id and lesson=p_lesson and expires_at<=started_at;
 select * into s from classroom_private.sessions where class_id=p_class_id and lesson=p_lesson and expires_at>started_at order by created_at desc limit 1;
 if not found then
  insert into classroom_private.sessions(teacher_id,class_id,lesson,stage,locked,created_at,expires_at)
  values(auth.uid(),p_class_id,p_lesson,'read',false,started_at,started_at+interval '2 hours') returning * into s;
 end if;
 return classroom_private.screen_down_snapshot(s);
end;
$$;

create or replace function public.classroom_screen_down_control(p_session_id uuid,p_action text,p_expected_revision bigint)
returns jsonb language plpgsql security definer set search_path='' as $$
declare s classroom_private.sessions%rowtype; result jsonb;
begin
 if not public.classroom_is_teacher() then raise exception 'Teacher sign-in required' using errcode='42501'; end if;
 select * into s from classroom_private.sessions where id=p_session_id and teacher_id=auth.uid() for update;
 if not found or s.expires_at<=clock_timestamp() then raise exception 'Session unavailable' using errcode='42501'; end if;
 if not classroom_private.valid_screen_down_stage(s.lesson,'read') then raise exception 'Unsupported Screen Down lesson' using errcode='22023'; end if;
 if p_expected_revision is null or p_expected_revision<>s.revision then raise exception 'Session changed' using errcode='40001'; end if;
 if p_action is null or p_action not in ('attention','self','end') then raise exception 'Invalid Screen Down action' using errcode='22023'; end if;
 s.revision:=s.revision+1;
 if p_action='attention' then s.locked:=true;s.stage:='screen';
 else s.locked:=false;s.stage:='read'; end if;
 if p_action='end' then
  result:=classroom_private.screen_down_snapshot(s)||jsonb_build_object('ended',true);
  delete from classroom_private.sessions where id=s.id;
  return result;
 end if;
 update classroom_private.sessions set stage=s.stage,locked=s.locked,revision=s.revision where id=s.id returning * into s;
 return classroom_private.screen_down_snapshot(s);
end;
$$;

revoke all on function public.classroom_screen_down_snapshot(uuid,text) from public,anon,authenticated;
revoke all on function public.classroom_screen_down_current(uuid,text) from public,anon,authenticated;
revoke all on function public.classroom_screen_down_start(uuid,text,text) from public,anon,authenticated;
revoke all on function public.classroom_screen_down_control(uuid,text,bigint) from public,anon,authenticated;
grant execute on function public.classroom_screen_down_snapshot(uuid,text) to anon,authenticated;
grant execute on function public.classroom_screen_down_current(uuid,text) to authenticated;
grant execute on function public.classroom_screen_down_start(uuid,text,text) to authenticated;
grant execute on function public.classroom_screen_down_control(uuid,text,bigint) to authenticated;
notify pgrst,'reload schema';
commit;
select true as screen_down_classrooms_ready;
