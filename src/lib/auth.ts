import type {User,Role} from '@/types';
// Phone Auth is mocked. Integration: signInWithOtp({phone:'+244…'}) and verifyOtp({type:'sms'}).
export interface PhoneAuthAdapter {sendCode:(phone:string)=>Promise<{simulated:boolean}>;verifyCode:(phone:string,code:string,role:Role)=>Promise<User|null>;}
export const phoneAuth:PhoneAuthAdapter={sendCode:async()=>({simulated:true}),verifyCode:async(phone,code,role)=>code==='123456'?{id:`${role}-demo`,name:role==='customer'?'Ana Manuel':'Manuel Paulo',phone,role}:null};
