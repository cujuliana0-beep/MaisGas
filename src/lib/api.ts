import {PRODUCTS,ZONES,DEMO_DRIVER} from '@/constants/data';
import {readStored,writeStored} from '@/lib/storage';
import type {Product,Zone,Driver,Order,AvailabilityReport} from '@/types';
// Mock repository boundary. Replace each adapter with Supabase queries; never expose privileged keys in the browser.
export interface MarketplaceRepository { listProducts:()=>Promise<Product[]>;listZones:()=>Promise<Zone[]>;getDriver:(id:string)=>Promise<Driver|null>;listOrders:()=>Promise<Order[]>;saveOrder:(order:Order)=>Promise<void>;listReports:()=>Promise<AvailabilityReport[]>; }
export const marketplaceApi:MarketplaceRepository={listProducts:async()=>PRODUCTS,listZones:async()=>ZONES,getDriver:async(id)=>{const driver=readStored<Driver>('driver',DEMO_DRIVER);return driver.id===id?driver:null;},listOrders:async()=>readStored<Order[]>('orders',[]),saveOrder:async(order)=>{const orders=readStored<Order[]>('orders',[]);writeStored('orders',orders.some(o=>o.id===order.id)?orders.map(o=>o.id===order.id?order:o):[...orders,order]);},listReports:async()=>readStored<AvailabilityReport[]>('reports',[])};
