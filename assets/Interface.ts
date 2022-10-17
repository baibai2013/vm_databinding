import { Color } from "cc"

export interface Goods {
    name:string,
    count:number,
    icon:string
    price?:number
}


export interface LabelStyle {
    color:Color,
    fontSize:number,
    pre:String
}

