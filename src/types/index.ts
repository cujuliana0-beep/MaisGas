export type Role = 'customer' | 'driver';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'created' | 'searching' | 'accepted' | 'buying' | 'on_the_way' | 'delivered' | 'cancelled' | 'out_of_stock';
export interface Product { id:string; size:6|12|51; name:string; price:number; }
export interface Zone { id:string; province:string; name:string; delivery_fee:number; availability:'available'|'low'|'unavailable'; }
export interface User { id:string; name:string; phone:string; role:Role; }
export interface Driver { id:string; name:string; phone:string; rating:number; plate:string; approval_status:ApprovalStatus; rejection_reason:string|null; }
export interface Address { id:string; label:string; street:string; reference:string; zone_id:string; pin:{x:number;y:number}; }
export interface Order { id:string; customer_id:string; driver_id:string|null; product_id:string; quantity:number; zone_id:string; address:Address; gas_price:number; delivery_fee:number; total:number; payment_method:'cash'|'multicaixa'; status:OrderStatus; confirmation_code:string; created_at:string; rating?:number; comment?:string; safety?:{valve:boolean;seal:boolean;photo_proof:string}; }
export interface AvailabilityReport { id:string; driver_id:string; location:string; availability:Zone['availability']; created_at:string; }
