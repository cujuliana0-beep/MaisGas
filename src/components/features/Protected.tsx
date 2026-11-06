import {Navigate,useLocation} from 'react-router-dom';
import type {ReactNode} from 'react';
import {useApp} from '@/hooks/useApp';
import type {Role} from '@/types';
interface Props {children:ReactNode;role?:Role;}
export default function Protected({children,role}:Props){const {user}=useApp();const location=useLocation();if(!user)return <Navigate to={`/login/${role||'customer'}`} state={{from:location.pathname}} replace/>;if(role&&user.role!==role)return <Navigate to={user.role==='driver'?'/driver':'/customer'} replace/>;return <>{children}</>;}
