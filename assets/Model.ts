import { Goods } from "./Interface";

export class Model{

    goodsLit:Goods[] = null;

    constructor(){
        this.goodsLit = []
        this.goodsLit.push({
            name: "苹果",
            icon:"icon/1",
            price:15,
            count:1
        });

        this.goodsLit.push({
            name: "梨",
            icon:"icon/2",
            price:15,
            count:1
        })

        this.goodsLit.push({
            name: "香蕉",
            icon:"icon/3",
            price:15,
            count:1
        })

        this.goodsLit.push({
            name: "草莓",
            icon:"icon/4",
            price:15,
            count:1
        })


    }
}
export let model  = new Model()