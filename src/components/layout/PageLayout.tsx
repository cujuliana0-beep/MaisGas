import {ArrowLeft} from 'lucide-react';
import {Link} from 'react-router-dom';
import type {ReactNode} from 'react';
import AppNav from '@/components/layout/AppNav';
interface Props {children:ReactNode;title?:string;subtitle?:string;back?:string;nav?:boolean;}
export default function PageLayout({children,title,subtitle,back,nav=true}:Props){return <main className="mx-auto max-w-[1240px] px-5 md:px-10 py-6 md:py-10 pb-28 md:pb-12 page-enter">{nav&&<AppNav/>}{back&&<Link to={back} className="flex items-center gap-2 min-h-12 text-sm text-muted w-fit mb-4 hover:text-ink"><ArrowLeft size={18}/> Voltar</Link>}{title&&<div className="mb-8"><h1 className="page-title">{title}</h1>{subtitle&&<p className="text-muted mt-3 leading-relaxed">{subtitle}</p>}</div>}{children}</main>;}
