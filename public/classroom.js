(() => {
  'use strict';
  const cfg = window.SCREEN_DOWN_CLASSROOM;
  if (!cfg) return;
  const teacher = new URLSearchParams(location.search).get('teacher') === '1';
  const root = document.createElement('div');
  root.id = 'screen-down-classroom';
  document.body.append(root);
  const overlay = document.createElement('dialog');
  overlay.id = 'screen-down-overlay';
  overlay.innerHTML = '<div class="screen-down-card"><span class="screen-down-signal">PAUSE</span><h1>Screens down</h1><p>Hands away from your device.</p><p>Look at your teacher and listen.</p><p lang="ms">Jauhkan tangan daripada peranti. Lihat dan dengar guru.</p><p lang="zh">双手离开设备，看老师，认真听。</p></div>';
  overlay.addEventListener('cancel', event => event.preventDefault());
  document.body.append(overlay);

  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuid.test(cfg.classId || '') || !String(cfg.url || '').startsWith('https://') || !String(cfg.publishableKey || '').startsWith('sb_publishable_')) return;
  let client, sdkPromise, current = null, room = null, channel = null;
  let allowed = false, busy = false, message = '', bad = false, polling = null, discovering = false;
  const args = () => ({p_class_id:cfg.classId,p_lesson:cfg.lessonId});
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function setPageInert(active) {
    if (teacher) return;
    for (const element of document.querySelectorAll('body > *:not(#screen-down-classroom):not(#screen-down-overlay)')) {
      if (active) {
        if (!element.hasAttribute('data-screen-down-inert')) element.dataset.screenDownInert = String(Boolean(element.inert));
        element.inert = true;
      } else if (element.hasAttribute('data-screen-down-inert')) {
        element.inert = element.dataset.screenDownInert === 'true';
        delete element.dataset.screenDownInert;
      }
    }
  }
  function showScreenDown(active) {
    if (teacher) return;
    setPageInert(active);
    document.documentElement.classList.toggle('screen-down-active', active);
    if (active && !overlay.open) {overlay.showModal();requestAnimationFrame(() => overlay.focus());}
    if (!active && overlay.open) overlay.close();
  }
  function render() {
    showScreenDown(Boolean(current?.locked));
    if (!teacher) {root.hidden = true;root.innerHTML = '';return;}
    root.hidden = false;
    const state = !allowed ? 'Teacher sign-in' : !current ? 'Classroom ready' : current.locked ? 'SCREENS DOWN' : 'Classroom live · screens released';
    let controls = '';
    if (!allowed) {
      controls = `<form id="screen-down-login"><label>Email<input name="email" type="email" autocomplete="username" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><button class="screen-down-primary" ${busy?'disabled':''}>Sign in</button></form>`;
    } else if (!current) {
      controls = `<button data-screen-command="start" class="screen-down-primary" ${busy?'disabled':''}>Start classroom</button><button data-screen-command="signout" ${busy?'disabled':''}>Sign out</button>`;
    } else {
      controls = current.locked
        ? `<button data-screen-command="self" class="screen-down-release" ${busy?'disabled':''}>Release screens</button>`
        : `<button data-screen-command="attention" class="screen-down-primary" ${busy?'disabled':''}>Screens down</button>`;
      controls += `<button data-screen-command="end" ${busy?'disabled':''}>End classroom</button>`;
    }
    root.innerHTML = `<section class="screen-down-dock" aria-label="Teacher classroom controls"><div><strong>${esc(state)}</strong><small>${current?'Students use the normal lesson until Screens down is active.':'Start once. Students on the ordinary lesson link connect automatically.'}</small></div><div class="screen-down-controls">${controls}</div><p class="screen-down-message ${bad?'is-error':''}" role="status">${esc(message)}</p></section>`;
  }
  function say(text, error = false) {message = text;bad = error;render();}
  async function loadSdk() {
    if (window.supabase?.createClient) return;
    if (!sdkPromise) sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(cfg.sdkPath || 'vendor/supabase.js', document.baseURI).href;
      script.onload = resolve;
      script.onerror = () => {sdkPromise = null;reject(Error('Supabase library unavailable'));};
      document.head.append(script);
    });
    await sdkPromise;
  }
  async function api() {
    if (client) return client;
    await loadSdk();
    client = window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:teacher,storage:teacher?sessionStorage:undefined,storageKey:`screen-down-teacher-${cfg.lessonId}`,autoRefreshToken:teacher,detectSessionInUrl:false}});
    return client;
  }
  async function rpc(name, values = {}) {
    const connection = await api();
    const {data,error} = await connection.rpc(name,values).abortSignal(AbortSignal.timeout(12000));
    if (error) throw error;
    return data;
  }
  function valid(snapshot) {
    return snapshot && snapshot.version === 1 && snapshot.lesson === cfg.lessonId && snapshot.class_id === cfg.classId && ['read','screen'].includes(snapshot.stage) && typeof snapshot.locked === 'boolean' && Number.isSafeInteger(snapshot.revision) && snapshot.revision >= 0 && Number.isFinite(Date.parse(snapshot.expires_at));
  }
  function accept(snapshot) {
    if (!snapshot) {current = null;room = null;detach();render();return;}
    if (!valid(snapshot) || (current && snapshot.revision < current.revision)) return;
    if (snapshot.ended) {current = null;room = null;detach();say('Classroom ended. Students can continue normally.');return;}
    current = snapshot;
    if (room !== snapshot.session_id) {room = snapshot.session_id;attach();}
    message = '';bad = false;render();
  }
  function detach() {
    if (channel && client) client.removeChannel(channel).catch(() => {});
    channel = null;
  }
  async function attach() {
    detach();
    if (!room) return;
    const connection = await api();
    channel = connection.channel(`classroom:${room}:control`,{config:{private:true,broadcast:{ack:true}}});
    channel.on('broadcast',{event:'screen'}, event => accept(event.payload));
    channel.subscribe();
  }
  async function discover() {
    if (teacher || discovering || document.hidden) return;
    discovering = true;
    try {accept(await rpc('classroom_screen_down_snapshot',args()));}
    catch {if (!current) showScreenDown(false);}
    finally {discovering = false;}
  }
  async function recoverTeacher() {
    const connection = await api();
    const {data:{session}} = await connection.auth.getSession();
    if (!session) {allowed = false;render();return;}
    allowed = (await rpc('classroom_is_teacher')) === true;
    if (!allowed) throw Object.assign(Error('Teacher not approved'),{code:'teacher_not_approved'});
    accept(await rpc('classroom_screen_down_current',args()));
    render();
  }
  async function send(action) {
    if (busy) return;
    busy = true;render();
    try {
      let snapshot;
      if (action === 'start') snapshot = await rpc('classroom_screen_down_start',{...args(),p_stage:'read'});
      else snapshot = await rpc('classroom_screen_down_control',{p_session_id:room,p_action:action,p_expected_revision:current.revision});
      try {await channel?.send({type:'broadcast',event:'screen',payload:snapshot});} catch {}
      accept(snapshot);
    } catch (error) {
      if (String(error?.code) === '22023') say('Classroom permissions are out of date. Run the shared Screen Down Supabase update, then try again.',true);
      else if (String(error?.code) === '40001') {say('Another classroom command arrived first. Refreshing…',true);accept(await rpc('classroom_screen_down_current',args()));}
      else say('The classroom command did not complete. Check the connection and teacher sign-in.',true);
    } finally {busy = false;render();}
  }
  root.addEventListener('submit', async event => {
    if (event.target.id !== 'screen-down-login') return;
    event.preventDefault();busy = true;render();
    const form = new FormData(event.target);
    try {
      const connection = await api();
      const {error} = await connection.auth.signInWithPassword({email:String(form.get('email')).trim(),password:String(form.get('password'))});
      if (error) throw error;
      await recoverTeacher();say('Teacher sign-in confirmed.');
    } catch (error) {
      allowed = false;
      if (String(error?.code) === 'invalid_credentials') say('Supabase rejected the email or password.',true);
      else if (String(error?.code) === 'teacher_not_approved') say('The account signed in, but it is not an approved classroom teacher.',true);
      else if (String(error?.code) === '22023') say('The account is approved, but this lesson is missing from the Screen Down Supabase setup.',true);
      else say('Teacher sign-in could not be completed. Check the connection and try again.',true);
    } finally {busy = false;render();}
  });
  root.addEventListener('click', async event => {
    const button = event.target.closest('[data-screen-command]');
    if (!button || button.disabled) return;
    const action = button.dataset.screenCommand;
    if (action === 'signout') {await (await api()).auth.signOut({scope:'local'});allowed = false;current = null;room = null;detach();render();return;}
    if (action === 'end' && !confirm('End Screen Down Classroom Mode and release every device?')) return;
    await send(action);
  });
  render();
  if (teacher) recoverTeacher().catch(error => {allowed = false;if (String(error?.code) === '22023') say('This lesson needs the shared Screen Down Supabase update.',true);else render();});
  else {discover();polling = setInterval(discover,8000);document.addEventListener('visibilitychange',() => {if (!document.hidden) discover();});}
})();
