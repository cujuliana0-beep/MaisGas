import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {toast} from 'sonner';
import {addressSchema} from '@/lib/validations';
import {useApp} from '@/hooks/useApp';
import LocalMap from '@/components/features/LocalMap';
import ZonePicker from '@/components/features/ZonePicker';
import type {Address} from '@/types';
interface Fields {label:string;street:string;reference:string;}
interface Props {initial?:Address;onDone:()=>void;}
export default function AddressForm({initial,onDone}:Props){const {zone,addresses,setAddresses}=useApp();const [pin,setPin]=useState(initial?.pin||{x:57,y:50});const {register,handleSubmit,formState:{errors}}=useForm<Fields>({resolver:zodResolver(addressSchema),defaultValues:initial||{label:'Casa',street:'',reference:''}});const save=(values:Fields)=>{const address={...values,id:initial?.id||crypto.randomUUID(),zone_id:zone.id,pin};setAddresses(initial?addresses.map(a=>a.id===initial.id?address:a):[...addresses,address]);toast.success('Morada guardada.');onDone();};return <form onSubmit={handleSubmit(save)} className="space-y-4"><ZonePicker/><LocalMap pin={pin} onPin={setPin} zone={zone.name}/><p className="text-xs text-muted">Toque no mapa para posicionar o pin da morada.</p>{([{key:'label',label:'Nome da morada',placeholder:'Casa, trabalho…'},{key:'street',label:'Rua e número',placeholder:'Rua das Acácias, casa 24'},{key:'reference',label:'Ponto de referência',placeholder:'Ao lado de…'}] as const).map(f=><div key={f.key}><label htmlFor={`address-${f.key}`}>{f.label}</label><input id={`address-${f.key}`} placeholder={f.placeholder} {...register(f.key)}/>{errors[f.key]&&<p className="field-error" role="alert">{errors[f.key]?.message}</p>}</div>)}<button className="btn-primary w-full">Guardar morada</button></form>;}
