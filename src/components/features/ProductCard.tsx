import {Check,ArrowUpRight} from 'lucide-react';
import Bottle from '@/components/features/Bottle';
import {money} from '@/constants/data';
import type {Product} from '@/types';
interface Props {product:Product;selected?:boolean;onSelect:()=>void;compact?:boolean;}
export default function ProductCard({product,selected,onSelect,compact}:Props){return <button type="button" onClick={onSelect} aria-pressed={selected} className={`relative text-left border rounded-2xl p-5 min-h-48 transition-transform hover:-translate-y-1 duration-200 w-full ${selected?'border-ink bg-cream ring-1 ring-ink':'border-line bg-paper'}`}><div className="flex items-center justify-between gap-3"><div><span className="eyebrow">Botija</span><h3 className="text-3xl font-semibold mt-1">{product.size}<span className="text-lg ml-1">kg</span></h3><p className="text-sm text-muted mt-1">{product.name}</p>{!compact&&<p className="font-heading font-semibold mt-4 text-xl">{money(product.price)}</p>}</div><Bottle size={product.size} className="w-20 h-28 shrink-0"/></div><span className="absolute right-3 top-3">{selected?<Check size={17}/>:<ArrowUpRight size={16} className="text-muted"/>}</span></button>;}
