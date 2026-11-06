import {Link} from 'react-router-dom';
import {Flame,ArrowLeft} from 'lucide-react';
export default function NotFound(){return <main className="max-w-xl mx-auto p-8 text-center py-20"><Flame size={48} className="mx-auto text-ember"/><span className="eyebrow block mt-6">404</span><h1 className="text-3xl font-semibold mt-4">Esta página ficou pelo caminho.</h1><p className="text-muted leading-relaxed mt-4">Volte ao início para escolher o seu perfil e continuar.</p><Link to="/" className="btn-primary mt-7"><ArrowLeft size={18}/>Voltar ao início</Link></main>;}
