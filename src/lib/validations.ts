import {z} from 'zod';
export const phoneSchema=z.object({phone:z.string().regex(/^9\d{8}$/,'Introduza um número angolano com 9 dígitos, começando por 9.')});
export const codeSchema=z.object({code:z.string().regex(/^\d{6}$/,'Introduza os 6 dígitos do código.')});
export const addressSchema=z.object({label:z.string().min(2,'Dê um nome à morada.'),street:z.string().min(5,'Indique a rua e o número da casa.'),reference:z.string().min(3,'Indique um ponto de referência.')});
export const profileSchema=z.object({name:z.string().min(3,'Introduza o seu nome.'),phone:z.string().regex(/^9\d{8}$/,'Número inválido. Use 9 dígitos.')});
export const registrationSchema=profileSchema.extend({identity:z.string().min(6,'Introduza o número do BI.'),plate:z.string().min(5,'Introduza a matrícula.'),vehicle:z.string().min(2,'Seleccione o tipo de viatura.'),safety:z.literal('close',{errorMap:()=>({message:'Reveja a formação: feche a válvula e mantenha a botija na vertical.'})})});
export const deliverySchema=z.object({valve:z.literal(true),seal:z.literal(true),photo:z.string().min(1,'Adicione uma fotografia da botija.'),code:z.string().regex(/^\d{4}$/,'Introduza o código de 4 dígitos.')});
