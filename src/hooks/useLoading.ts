import {useState,useEffect} from 'react';
export function useLoading(delay=450){const [loading,setLoading]=useState(true);useEffect(()=>{const timer=setTimeout(()=>setLoading(false),delay);return()=>clearTimeout(timer);},[delay]);return loading;}
