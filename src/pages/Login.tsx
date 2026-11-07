import {useEffect,useState} from 'react';
import {Link,useNavigate,useParams} from 'react-router-dom';
import {Mail,ArrowRight,ShieldCheck,LoaderCircle,Smartphone} from 'lucide-react';
import {toast} from 'sonner';
import {supabase} from '@/lib/supabase';
import {useApp} from '@/hooks/useApp';
import PageLayout from '@/components/layout/PageLayout';

export default function Login(){
 const {role}=useParams();
 const requestedRole=role==='driver'?'driver':'customer';
 const navigate=useNavigate();
 const {setUser}=useApp();
 const [email,setEmail]=useState('');
 const [busy,setBusy]=useState(false);
 const [sent,setSent]=useState(false);
 const [checking,setChecking]=useState(true);
 const [error,setError]=useState('');

 useEffect(()=>{
  let active=true;
  const finishSignIn=async()=>{
   if(!supabase){if(active){setError('O Supabase ainda não está configurado. Verifique as variáveis de ambiente no Vercel.');setChecking(false);}return;}
   const {data:{session},error:sessionError}=await supabase.auth.getSession();
   if(!active)return;
   if(sessionError){setError(sessionError.message);setChecking(false);return;}
   if(!session){setChecking(false);return;}
   const authUser=session.user;
   const {data:profile,error:profileError}=await supabase.from('profiles').select('id,name,phone,role').eq('id',authUser.id).maybeSingle();
   if(!active)return;
   if(profileError){setError('A sessão foi iniciada, mas não foi possível consultar o perfil. Verifique as permissões RLS da tabela profiles.');setChecking(false);return;}
   if(!profile && requestedRole==='customer'){
    const name=String(authUser.user_metadata?.full_name||authUser.email?.split('@')[0]||'Cliente');
    const {data:created,error:createError}=await supabase.from('profiles').insert({id:authUser.id,name,role:'customer'}).select('id,name,phone,role').single();
    if(!active)return;
    if(createError||!created){setError('A conta foi autenticada, mas o perfil de cliente não pôde ser criado. Verifique a política INSERT de profiles no Supabase.');setChecking(false);return;}
    setUser({id:created.id,name:created.name,phone:created.phone||'',role:'customer'});
    navigate('/customer',{replace:true});
    return;
   }
   if(!profile){setError('Não existe um perfil de entregador associado a este email. Registe-se e aguarde a aprovação.');setChecking(false);return;}
   if(profile.role!==requestedRole){setError(profile.role==='driver'?'Esta conta pertence à área do entregador.':'Esta conta pertence à área do cliente.');setChecking(false);return;}
   if(profile.role==='driver'){
    const {data:driver,error:driverError}=await supabase.from('drivers').select('approval_status').eq('id',authUser.id).maybeSingle();
    if(!active)return;
    if(driverError||!driver||driver.approval_status!=='approved'){setError('O acesso de entregador só fica disponível depois da aprovação do registo.');setChecking(false);return;}
   }
   setUser({id:profile.id,name:profile.name||authUser.email||'Utilizador',phone:profile.phone||'',role:profile.role});
   navigate(profile.role==='driver'?'/driver':'/customer',{replace:true});
  };
  void finishSignIn();
  return ()=>{active=false;};
 },[navigate,requestedRole,setUser]);

 const sendLink=async(event:React.FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  setError('');
  if(!supabase){setError('Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no Vercel.');return;}
  setBusy(true);
  const {error:authError}=await supabase.auth.signInWithOtp({
   email:email.trim().toLowerCase(),
   options:{emailRedirectTo:`${window.location.origin}/login/${requestedRole}`,data:{full_name:email.trim().split('@')[0]}}
  });
  setBusy(false);
  if(authError){setError(authError.message);return;}
  setSent(true);
  toast.success('Enviámos um link de acesso para o seu email.');
 };

 return <PageLayout nav={false} back={`/onboarding/${requestedRole}`}>
  <div className="max-w-md mx-auto panel md:p-10">
   <div className="h-16 w-16 bg-primary/15 rounded-2xl flex items-center justify-center mb-6"><Mail size={30}/></div>
   <span className="eyebrow">{requestedRole==='driver'?'Área do entregador':'Área do cliente'}</span>
   <h1 className="text-3xl font-semibold mt-3">{sent?'Consulte o seu email.':'Entre com o seu email.'}</h1>
   <p className="text-muted leading-relaxed mt-4 mb-7">{sent?`Enviámos um link de acesso para ${email}. Abra a mensagem neste dispositivo para continuar.`:'Vamos enviar-lhe um link seguro para entrar no +Gás. Não precisa de palavra-passe nem de SMS.'}</p>
   {checking&&<p className="text-sm text-muted flex items-center gap-2 mb-5"><LoaderCircle size={16} className="animate-spin"/>A verificar a sua sessão…</p>}
   {!sent&&<form onSubmit={sendLink}>
    <label htmlFor="email">Endereço de email</label>
    <input id="email" type="email" autoComplete="email" required placeholder="nome@exemplo.com" value={email} onChange={e=>setEmail(e.target.value)} />
    <button disabled={busy||checking} className="btn-primary w-full mt-6">{busy?<LoaderCircle size={20} className="animate-spin"/>:<>Enviar link de acesso <ArrowRight size={20}/></>}</button>
   </form>}
   {sent&&<button type="button" disabled={busy} onClick={sendLink as unknown as React.MouseEventHandler<HTMLButtonElement>} className="btn-primary w-full mt-2">Reenviar link</button>}
   {error&&<p role="alert" className="field-error mt-4">{error}</p>}
   <div className="rounded-xl bg-paper p-4 mt-6 text-xs text-muted leading-relaxed"><p className="flex gap-2"><ShieldCheck size={16} className="shrink-0"/>A autenticação é feita pelo Supabase. O link é enviado por email; confirme também a pasta de spam.</p><p className="flex gap-2 mt-3"><Smartphone size={16} className="shrink-0"/>O acesso por telefone (+244) ficará disponível quando configurarmos um fornecedor SMS. Não é enviado nenhum SMS nesta fase.</p></div>
   {requestedRole==='driver'&&<Link to="/driver/register" className="btn-secondary w-full mt-4">Registar-me como entregador</Link>}
  </div>
 </PageLayout>;
}
