import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {Star} from 'lucide-react';
import {toast} from 'sonner';
import {useApp} from '@/hooks/useApp';
interface Props {orderId:string;onDone:()=>void;}
interface Fields {rating:number;comment:string;}
const schema=z.object({rating:z.number().min(1,'Seleccione de 1 a 5 estrelas.').max(5),comment:z.string().max(500,'Máximo de 500 caracteres.')});
export default function RatingForm({orderId,onDone}:Props){const {updateOrder}=useApp();const [rating,setRating]=useState(0);const {register,setValue,handleSubmit,formState:{errors}}=useForm<Fields>({resolver:zodResolver(schema),defaultValues:{rating:0,comment:''}});return <form onSubmit={handleSubmit(v=>{updateOrder(orderId,v);toast.success('Obrigado pela sua avaliação.');onDone();})}><p className="text-muted text-sm">Como correu a entrega da sua botija?</p><fieldset className="mt-6"><legend className="text-sm font-semibold">A sua avaliação</legend><div className="flex justify-center my-4">{[1,2,3,4,5].map(n=><button key={n} type="button" aria-label={`${n} ${n===1?'estrela':'estrelas'}`} aria-pressed={rating===n} onClick={()=>{setRating(n);setValue('rating',n,{shouldValidate:true});}} className="w-14 h-14 flex items-center justify-center"><Star size={34} className={n<=rating?'text-ink':'text-muted'} fill={n<=rating?'hsl(var(--primary))':'none'}/></button>)}</div></fieldset>{errors.rating&&<p className="field-error" role="alert">{errors.rating.message}</p>}<label htmlFor="rating-comment">Comentário (opcional)</label><textarea id="rating-comment" rows={3} placeholder="O que correu bem? O que podemos melhorar?" {...register('comment')}/>{errors.comment&&<p className="field-error">{errors.comment.message}</p>}<button className="btn-primary w-full mt-5">Enviar avaliação</button></form>;}
