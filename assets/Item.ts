
import { _decorator, Component, Label, Sprite } from 'cc';
import { Goods } from './Interface';
import { vbind, vm } from './lib/VM';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Item
 * DateTime = Mon Sep 26 2022 16:41:43 GMT+0800 (中国标准时间)
 * Author = 柏白
 * FileBasename = Item.ts
 * FileBasenameNoExtension = Item
 * URL = db://assets/Item.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */
 
@vm
@ccclass('Item')
export class Item extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    data = {
        prefabData:null,
        
    };

    @vbind({string:"${prefabData.name}"})
    @property(Label)
    goodsName:Label = null;

    @vbind({string:"${prefabData.price}元"})
    @property(Label)
    goodsPrice:Label = null;

    @vbind({string:"${prefabData.count}个"})
    @property(Label)
    goodsCount:Label = null;

    @vbind({spriteFrame:"${prefabData.icon}"})
    @property(Sprite)
    goodsIcon:Sprite = null;

    onLoad(){

    }

    setData(goods:Goods){
        this.data.prefabData = goods
    }

    start () {
        // [3]
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
