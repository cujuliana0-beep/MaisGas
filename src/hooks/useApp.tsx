import {createContext,useContext,useState,useEffect, type ReactNode} from 'react';
import {readStored,writeStored} from '@/lib/storage';
import {DEMO_DRIVER,INITIAL_ADDRESSES,ZONES} from '@/constants/data';
import type {User,Driver,Order,Address,Zone,AvailabilityReport} from '@/types';
interface AppState { user:User|null;setUser:(v:User|null)=>void;driver:Driver;setDriver:(v:Driver)=>void;orders:Order[];setOrders:(v:Order[])=>void;updateOrder:(id:string,patch:Partial<Order>)=>void;addresses:Address[];setAddresses:(v:Address[])=>void;zone:Zone;setZone:(v:Zone)=>void;reports:AvailabilityReport[];setReports:(v:AvailabilityReport[])=>void; }
const Context=createContext<AppState|null>(null);
export function AppProvider({children}:{children:ReactNode}) {
 const [user,setUser]=useState<User|null>(()=>readStored('user',null)); const [driver,setDriver]=useState<Driver>(()=>readStored('driver',DEMO_DRIVER));
 const [orders,setOrders]=useState<Order[]>(()=>readStored('orders',[])); const [addresses,setAddresses]=useState<Address[]>(()=>readStored('addresses',INITIAL_ADDRESSES));
 const [zone,setZone]=useState<Zone>(()=>readStored('zone',ZONES[0])); const [reports,setReports]=useState<AvailabilityReport[]>(()=>readStored('reports',[]));
 useEffect(()=>{writeStored('user',user);writeStored('driver',driver);writeStored('orders',orders);writeStored('addresses',addresses);writeStored('zone',zone);writeStored('reports',reports);},[user,driver,orders,addresses,zone,reports]);
 const updateOrder=(id:string,patch:Partial<Order>)=>setOrders(previous=>previous.map(o=>o.id===id?{...o,...patch}:o));
 return <Context.Provider value={{user,setUser,driver,setDriver,orders,setOrders,updateOrder,addresses,setAddresses,zone,setZone,reports,setReports}}>{children}</Context.Provider>;
}
export function useApp(){const context=useContext(Context);if(!context)throw new Error('AppProvider necessário');return context;}
